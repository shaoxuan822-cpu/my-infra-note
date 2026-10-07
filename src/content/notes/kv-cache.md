---
title: "KV Cache 与推理显存估算"
date: "2026-10-06"
category: infer
tags:
  - 推理
  - 显存
  - KV Cache
excerpt: "长上下文推理的显存黑洞：KV Cache 公式推导，以及 batch、序列长度与显存的换算表。"
status: 已发布
featured: true
---

长上下文推理的显存黑洞：KV Cache。本文推导显存公式，并给出常用配置的换算表。

## 显存公式

```text
KV Cache 显存 ≈ 2 × 层数 × batch × 序列长度 × hidden_size × 精度字节数
```

以 8B 量级模型（32 层、hidden 4096、bf16）为例：

| batch | 序列长度 | KV Cache |
| --- | --- | --- |
| 1 | 4K | ~2 GB |
| 8 | 4K | ~16 GB |
| 1 | 128K | ~64 GB |

> 正文正在完善中。
