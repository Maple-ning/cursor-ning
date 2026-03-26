---
title: "Vue 3 组合式 API 的实践心得"
slug: "vue3-composition-api-practice"
date: "2026-03-20"
tags: ["Vue3", "TypeScript", "Frontend"]
category: "tech"
summary: "总结了我在中小型项目里使用组合式 API 的组织方式和常见坑。"
---

最近几次项目里，我都在使用组合式 API 作为主要开发方式。
我发现最重要的一点是：把“页面逻辑”和“通用逻辑”分开管理。

## 我的拆分方式

1. 页面独有逻辑写在 `views` 下的组件中  
2. 可复用逻辑抽离为 `composables`  
3. 跨页面状态放入 `pinia`

这样做后，代码可读性和后续维护成本都有明显改善。
