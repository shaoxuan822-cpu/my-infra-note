---
title: "线程组织与执行模型：Grid / Block / Warp"
date: "2026-09-20"
category: gpu
tags:
  - CUDA
  - 基础
excerpt: "Grid、Block、Warp 与线程束调度：写 kernel 之前必须建立的执行模型心智图。"
status: 已发布
featured: false
---

写 kernel 之前，先建立执行模型的心智图：内核如何被分解成线程，线程如何被组织、调度。
本文梳理 Grid、Block、Warp 与 SIMT 执行模型。

## 要点大纲

- **Grid → Block → Thread**：内核启动时指定网格与线程块维度，块映射到 SM，线程以 warp（32 线程）为单位调度；
- **SIMT**：一个 warp 内的线程执行同一条指令、操作不同数据，分支发散会串行执行两条路径；
- **占用率**：SM 上同时驻留的 warp 数与寄存器、共享内存用量直接相关，是隐藏访存延迟的关键指标。

> 正文正在完善中。
