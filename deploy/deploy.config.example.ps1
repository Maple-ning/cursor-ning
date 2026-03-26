return @{
  Server = @{
    Host       = "8.8.8.8"
    User       = "root"
    Port       = 22
    # 私钥路径（本机 .pem / id_rsa）。没有私钥、用阿里云「实例密码」登录时设为 $null，终端会提示输入密码。
    # SshKeyPath = "$HOME/.ssh/id_rsa"
    SshKeyPath = $null
  }

  # Backend: code under RemotePath/app, env at RemotePath/shared/.env (common: /home/xxx)
  Backend = @{
    LocalPath   = "blog-server"
    RemotePath  = "/home/blog-server"
    ProcessName = "blog-server"
    StartScript = "start"
  }

  # Default: dist contents go directly under RemotePath (e.g. /admin/index.html). Set PublishFlat = $false for RemotePath/current/dist.
  Frontends = @(
    @{
      Name       = "blog-admin"
      LocalPath  = "blog-admin"
      RemotePath = "/usr/share/nginx/html/blog-admin"
    },
    @{
      Name       = "blog-front"
      LocalPath  = "blog-front"
      RemotePath = "/usr/share/nginx/html/blog-front"
    }
  )
}
