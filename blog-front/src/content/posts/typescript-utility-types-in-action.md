---
title: "TypeScript 常用工具类型实战"
slug: "typescript-utility-types-in-action"
date: "2026-02-06"
tags: ["TypeScript", "泛型", "工程实践"]
category: "tech"
summary: "结合项目场景整理了 Partial、Pick、Omit、Record 的典型用法。"
---

工具类型最容易被低估，但在业务代码里非常高频。

## 我最常用的四个

1. `Partial<T>`：做表单草稿和局部更新  
2. `Pick<T, K>`：定义接口最小返回结构  
3. `Omit<T, K>`：去掉前端不需要的字段  
4. `Record<K, V>`：快速构建映射表

建议按业务语义封装二次类型，避免在组件里直接堆复杂泛型。
