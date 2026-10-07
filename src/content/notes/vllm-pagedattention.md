---
title: "vLLM 与 PagedAttention"
date: "2026-09-15"
category: infer
tags:
  - vLLM
  - 推理引擎
excerpt: "把 KV Cache 当操作系统分页管：PagedAttention 如何把显存利用率从 20% 拉到 90%+。"
status: 已发布
featured: false
---

把 KV Cache 当操作系统分页来管理：PagedAttention 是 vLLM 吞吐数倍于传统实现的核心。

## 要点大纲

- **传统方式**：为每个序列预留整段连续显存，碎片化导致利用率只有 20~40%；
- **PagedAttention**：KV Cache 切成固定大小的 block，按需分配、不要求连续，利用率可达 90%+；
- **连续批处理**：新请求随时插进正在执行的 batch，推理吞吐大幅提升。

> 正文正在完善中。
