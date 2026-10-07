---
title: "分布式训练综述：数据并行与模型并行"
date: "2026-09-28"
category: dist
tags:
  - 分布式
  - 并行
excerpt: "DP、TP、PP 到底怎么分？一张图看懂三种并行切分的计算图，以及各自的通信代价。"
status: 已发布
featured: false
---

大模型放不进单卡之后，并行切分成为基本功。本文用一张图讲清 DP / TP / PP 三种并行以及它们的通信代价。

## 三种并行速览

| 并行方式 | 切分对象 | 主要通信 | 典型工具 |
| --- | --- | --- | --- |
| 数据并行 DP | 数据 batch | AllReduce 梯度 | PyTorch DDP / DeepSpeed |
| 张量并行 TP | 模型层内参数 | AllReduce / AllGather（高频） | Megatron-LM |
| 流水并行 PP | 模型层间 | P2P 传递激活值 | Megatron-LM / DeepSpeed |

> 实际训练通常是三者组合（3D 并行），正文正在完善中。
