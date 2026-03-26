---
title: '从 0 到 1 搭建前端工程化模板'
slug: 'frontend-starter-template-notes'
date: '2026-03-17'
tags: ['Vite', 'ESLint', 'Tailwind']
category: 'tech'
summary: '记录了用 Vite 构建模板时，如何平衡开发效率、规范和打包体积。'
---

我通常会优先考虑三个目标：快、稳、可扩展。

## 快

初始化和冷启动要快，让团队尽快进入开发状态。

## 稳

类型检查、lint、基础测试要到位，把低级错误尽量前置。

## 可扩展

业务增长时，目录和规范要能承载复杂度。
