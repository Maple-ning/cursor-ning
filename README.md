# 枫叶小站

个人博客全栈项目：前台展示文章与项目，管理后台维护内容，Node 服务提供接口与数据存储。

## 组成

| 目录 | 说明 |
|------|------|
| `blog-front` | 博客前台（Vue 3 + Vite + TypeScript + Vue Router + Ant Design Vue） |
| `blog-admin` | 管理后台（同上技术栈，Markdown 编辑与文章/站点配置） |
| `blog-server` | 后端 API（Express + MySQL，JWT 鉴权等） |
| `deploy` | PowerShell 一键部署脚本（构建前端、打包后端、SSH 上传与 PM2 启动） |

## 功能概览

- 首页、技术文章、读后感、项目展示、关于页等
- 支持亮色 / 暗黑主题
- 后台发布与编辑文章、维护个人资料与扩展内容

## 本地开发

在各子目录分别安装依赖后执行对应 `npm run dev`；后端需配置数据库与环境变量（参见各包内 `README`）。

## 在线访问

**博客前台：** [http://8.163.46.202/blog](http://8.163.46.202/blog)
