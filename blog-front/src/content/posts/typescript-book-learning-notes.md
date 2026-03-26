---
title: '《深入浅出 TypeScript》学习笔记'
slug: 'typescript-book-learning-notes'
date: '2026-03-08'
tags: ['TypeScript', '读后感', '类型系统']
category: 'review'
summary: '整理了泛型、联合类型、类型收窄在真实项目中的应用场景。'
---

TypeScript 真正有价值的地方，不是语法更复杂，而是把错误提前到编译期。

## 我最常用的三个技巧

1. 用联合类型表达有限状态
2. 用泛型提升工具函数复用性
3. 用类型守卫保证运行时安全

当类型设计足够清晰时，很多文档说明都可以省掉。
