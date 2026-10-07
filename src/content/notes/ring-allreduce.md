---
title: "Ring AllReduce 与 NCCL 集合通信"
date: "2026-10-02"
category: dist
tags:
  - NCCL
  - AllReduce
  - 通信
excerpt: "梯度怎么在多卡间高效求和？Ring AllReduce 的带宽最优性、NCCL 的角色与常见坑。"
status: 已发布
featured: true
---

梯度怎么在多卡之间高效求和？Ring AllReduce 把通信量摊到每张卡上，是带宽最优的集合通信算法之一。

## 要点大纲

- **朴素 AllReduce**：所有卡把梯度发给一张卡求和再广播，中心节点成为瓶颈；
- **Ring 算法**：卡排成环，分 Scatter-Reduce 与 AllGather 两阶段，每张卡只与相邻两张卡通信，带宽利用率接近最优；
- **NCCL**：NVIDIA 的集合通信库，自动根据拓扑（NVLink / InfiniBand）选择树/环算法，是 PyTorch 的分布式后端。

> 正文正在完善中。
