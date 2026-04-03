param(
  [string]$ConfigPath = (Join-Path $PSScriptRoot "deploy.config.ps1")
)

$ErrorActionPreference = "Stop"

function Require-Command {
  param([string]$Name)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command not found: $Name"
  }
}

function Resolve-LocalPath {
  param(
    [string]$BasePath,
    [string]$MaybeRelativePath
  )
  if ([System.IO.Path]::IsPathRooted($MaybeRelativePath)) {
    return $MaybeRelativePath
  }
  return (Join-Path $BasePath $MaybeRelativePath)
}

function Build-Frontend {
  param(
    [hashtable]$Frontend,
    [string]$WorkspaceRoot,
    [string]$ArtifactsDir
  )
  $name = $Frontend.Name
  $localPath = Resolve-LocalPath -BasePath $WorkspaceRoot -MaybeRelativePath $Frontend.LocalPath
  if (-not (Test-Path $localPath)) {
    throw "Frontend path does not exist: $localPath"
  }

  Write-Host "==> Building frontend: $name"
  Push-Location $localPath
  try {
    npm run build | Out-Host
    if ($LASTEXITCODE -ne 0) {
      throw "Frontend build failed: $name"
    }
  }
  finally {
    Pop-Location
  }

  $distPath = Join-Path $localPath "dist"
  if (-not (Test-Path $distPath)) {
    throw "Frontend build output not found: $distPath"
  }

  $archiveName = "$name-dist.tar.gz"
  $archivePath = Join-Path $ArtifactsDir $archiveName
  if (Test-Path $archivePath) {
    Remove-Item $archivePath -Force
  }

  $null = & tar -czf $archivePath -C $localPath dist 2>&1
  if (-not (Test-Path $archivePath)) {
    throw "Failed to create frontend archive: $archivePath"
  }
  return $archivePath
}

function Pack-Backend {
  param(
    [hashtable]$Backend,
    [string]$WorkspaceRoot,
    [string]$ArtifactsDir
  )
  $localPath = Resolve-LocalPath -BasePath $WorkspaceRoot -MaybeRelativePath $Backend.LocalPath
  if (-not (Test-Path $localPath)) {
    throw "Backend path does not exist: $localPath"
  }

  Write-Host "==> Packing backend"
  $archivePath = Join-Path $ArtifactsDir "backend.tar.gz"
  if (Test-Path $archivePath) {
    Remove-Item $archivePath -Force
  }

  $null = & tar -czf $archivePath -C $localPath --exclude=node_modules --exclude=.env . 2>&1
  if (-not (Test-Path $archivePath)) {
    throw "Failed to create backend archive: $archivePath"
  }
  return $archivePath
}

if (-not (Test-Path $ConfigPath)) {
  throw "Config file not found: $ConfigPath. Copy deploy.config.example.ps1 to deploy.config.ps1 first."
}

Require-Command -Name "ssh"
Require-Command -Name "scp"
Require-Command -Name "tar"
Require-Command -Name "npm"

$config = . $ConfigPath
if (-not $config.Server -or -not $config.Backend -or -not $config.Frontends) {
  throw "Invalid config: missing Server/Backend/Frontends"
}

$workspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$releaseId = Get-Date -Format "yyyyMMddHHmmss"
$artifactsDir = Join-Path $PSScriptRoot "artifacts\$releaseId"
New-Item -Path $artifactsDir -ItemType Directory -Force | Out-Null

# Use @( foreach { } ) so each frontend stays one hashtable (+= @{ } can unwrap and break foreach).
$frontendArchives = @(
  foreach ($frontend in $config.Frontends) {
    @{
      Config  = $frontend
      Archive = (Build-Frontend -Frontend $frontend -WorkspaceRoot $workspaceRoot -ArtifactsDir $artifactsDir)
    }
  }
)
$backendArchive = Pack-Backend -Backend $config.Backend -WorkspaceRoot $workspaceRoot -ArtifactsDir $artifactsDir

$serverHost = $config.Server.Host
$user = $config.Server.User
$port = 22
if ($config.Server.Port) {
  $port = [int]$config.Server.Port
}
$target = "$user@$serverHost"
$sshKeyPath = $config.Server.SshKeyPath
$remoteTmp = "/tmp/cursor-deploy-$releaseId"

$sshArgs = @("-p", $port.ToString())
$scpArgs = @("-P", $port.ToString())
if ($sshKeyPath) {
  $sshArgs += @("-i", $sshKeyPath)
  $scpArgs += @("-i", $sshKeyPath)
}

Write-Host "==> Creating remote temp directory: $remoteTmp"
& ssh @sshArgs $target "mkdir -p $remoteTmp"

Write-Host "==> Uploading deployment artifacts"
& scp @scpArgs $backendArchive "$target`:$remoteTmp/backend.tar.gz"
foreach ($item in $frontendArchives) {
  $archivePath = $item.Archive
  $archiveName = [System.IO.Path]::GetFileName($archivePath)
  & scp @scpArgs $archivePath "$target`:$remoteTmp/$archiveName"
}

$frontendDeployLines = @()
foreach ($item in $frontendArchives) {
  $name = $item.Config.Name
  $remotePath = $item.Config.RemotePath
  $archiveName = [System.IO.Path]::GetFileName($item.Archive)
  # Default flat (admin/index.html). Only use .../current/dist when PublishFlat is explicitly $false.
  $useNestedCurrentDist = ($item.Config.PublishFlat -eq $false)
  if (-not $useNestedCurrentDist) {
    $frontendDeployLines += @"
mkdir -p '$remotePath'
rm -rf '$remotePath'/*
tar -xzf '$remoteTmp/$archiveName' -C '$remotePath' --strip-components=1
echo 'Frontend deployed (flat): $name -> $remotePath'
"@
  }
  else {
    $frontendDeployLines += @"
mkdir -p '$remotePath/current'
rm -rf '$remotePath/current'/*
tar -xzf '$remoteTmp/$archiveName' -C '$remotePath/current'
echo 'Frontend deployed (nested): $name -> $remotePath/current/dist'
"@
  }
}

$backendRemotePath = $config.Backend.RemotePath
$processName = $config.Backend.ProcessName
$startScript = $config.Backend.StartScript

$remoteScript = @"
set -euo pipefail

if ! command -v pm2 >/dev/null 2>&1; then
  echo "pm2 is required on remote server."
  exit 1
fi

mkdir -p '$backendRemotePath/app'
rm -rf '$backendRemotePath/app'/*
tar -xzf '$remoteTmp/backend.tar.gz' -C '$backendRemotePath/app'

if [ -f '$backendRemotePath/shared/.env' ]; then
  cp '$backendRemotePath/shared/.env' '$backendRemotePath/app/.env'
  echo 'Loaded backend env from shared/.env'
else
  echo 'Warning: backend shared/.env not found, skip env copy'
fi

cd '$backendRemotePath/app'
npm ci --omit=dev

# Recreate PM2 app so script path/cwd stay under app/ (restart alone does not update them).
if pm2 describe '$processName' >/dev/null 2>&1; then
  pm2 delete '$processName'
fi
pm2 start npm --name '$processName' --cwd '$backendRemotePath/app' -- run '$startScript'
pm2 save

$(($frontendDeployLines -join "`n"))

rm -rf '$remoteTmp'
echo 'Deployment finished.'
"@

Write-Host "==> Running remote deploy commands"
$remoteScriptPath = Join-Path $artifactsDir "remote-deploy.sh"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$remoteScriptLf = $remoteScript -replace "`r`n", "`n"
[System.IO.File]::WriteAllText($remoteScriptPath, $remoteScriptLf, $utf8NoBom)
& scp @scpArgs $remoteScriptPath "$target`:$remoteTmp/remote-deploy.sh"
& ssh @sshArgs $target "bash '$remoteTmp/remote-deploy.sh'"

Write-Host "==> Done"
