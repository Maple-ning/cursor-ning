# blog-admin（博客后台管理）

基于 `Vue 3 + Vite + TypeScript + Ant Design Vue` 的博客后台管理项目。

## 环境要求

- Node.js：`^20.19.0 || >=22.12.0`
- 包管理器：`npm`

## 推荐开发环境

- IDE：`VS Code`
- 插件：[Vue - Official (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- 浏览器插件：Vue Devtools

## 安装依赖

```bash
npm install
```

## 本地开发

```bash
npm run dev
```

## 质量检查

```bash
npm run lint
npm run type-check
npm run test
npm run check
```

说明：

- `lint`：运行 `oxlint + eslint`
- `check`：运行 `lint + type-check + test + build-only`

## 打包构建

```bash
npm run build
```

## 目录说明（核心）

```text
src/
├── api/            # 接口请求层
├── composables/    # 组合式业务逻辑
├── pages/          # 路由页面
├── stores/         # 状态管理
├── constants/      # 常量定义
├── config/         # 应用配置与路由配置
└── utils/          # 工具函数
```

## 相关文档

- 前端规范：`../前端规范.md`
- Vite 配置参考：[https://vite.dev/config/](https://vite.dev/config/)
