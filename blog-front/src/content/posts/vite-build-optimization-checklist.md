---
title: "Vite 打包体积优化清单"
slug: "vite-build-optimization-checklist"
date: "2026-02-27"
tags: ["Vite", "性能优化", "工程化"]
category: "tech"
summary: "从依赖引入、路由切分到资源压缩，整理了一份可落地的优化清单。"
---

下面是我常用的打包优化顺序：

1. 先看体积分析，找出最大依赖  
2. 对重量级模块做动态导入  
3. UI 组件库按需引入  
4. 图片做压缩和格式优化  
5. 公共依赖抽离成独立 chunk

通常前三步就能明显下降主包体积。
