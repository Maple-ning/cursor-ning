---
title: 'Pinia Store 设计与拆分笔记'
slug: 'pinia-store-design-notes'
date: '2026-03-02'
tags: ['Pinia', '状态管理', 'Vue3']
category: 'tech'
summary: '记录如何按业务域拆分 store，避免单一 store 过度膨胀。'
---

我一开始把很多状态都塞进同一个 store，结果维护起来非常痛苦。

后来改成按业务域拆分：

- `useUserStore`：用户信息与登录态
- `useProjectStore`：项目数据和筛选条件
- `useSettingStore`：主题、语言、个性化配置

## 一个小经验

尽量把“派生状态”做成 getter，而不是重复存储。  
这样可以减少同步更新时的 bug。
