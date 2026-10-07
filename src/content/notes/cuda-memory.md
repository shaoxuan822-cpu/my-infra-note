---
title: "CUDA 内存模型：从寄存器到全局内存"
date: "2026-10-05"
category: gpu
tags:
  - CUDA
  - 内存
  - 性能优化
excerpt: "寄存器、共享内存、L1/L2、全局内存各差多少延迟？合并访问与 bank conflict 是什么？一篇讲清 CUDA 内存层级。"
status: 已发布
featured: true
---

写 CUDA kernel 时，性能差的根源十有八九出在内存访问上：现代 GPU 的算术吞吐远高于访存吞吐，一个 warp 的一次全局内存访问就要几百个周期，而一次 FMA 只需要几个周期。因此理解 CUDA 的内存层级，以及「合并访问」和「bank conflict」这两个核心概念，比学会任何一行优化技巧都重要。本文按层级自下而上梳理一遍。

## 一、GPU 内存层级总览

下表是 CUDA 的内存层级（延迟为相对量级，不同架构差别很大，以 Nsight 实测为准）：

| 内存类型 | 物理位置 | 作用域 | 典型延迟 | 关键特性 |
| --- | --- | --- | --- | --- |
| 寄存器 | SM 内 | 线程 | ~0 | 最快，由编译器分配 |
| 共享内存 | SM 内 | Block | ~20-30 周期 | 用户管理，注意 bank |
| L1 / 纹理缓存 | SM 内 | 设备 | ~30 | 与共享内存共用硬件 |
| L2 缓存 | GPU 芯片 | 设备 | ~200 | 跨 SM 共享，128B 缓存行 |
| 全局内存 | 显存 (HBM) | 设备 + 主机 | ~400-800 | 容量最大，真正的带宽瓶颈 |
| 主机内存 | CPU 侧 | 主机 | PCIe 受限 | 传输受 PCIe/NVLink 带宽限制 |

层级关系是稳定的：越靠近 SM 越快、越小。优化的本质就是「把频繁访问的数据往上层搬」，同时让每一次全局内存访问都尽可能高效。

## 二、全局内存：合并访问是底线

全局内存位于 HBM 显存上，容量最大（如 H100 80GB），带宽最高可达 TB/s 级，但单次访问延迟高。GPU 靠「以量补延迟」：一个 warp（32 个线程）的访存请求会被合并（coalesce）为尽可能少的内存事务。

关键规则：L2 缓存行是 `128 字节`。如果 32 个线程恰好访问一段连续的 128 字节（例如连续的 32 个 `float`），硬件只发 1 次事务；如果线程以 stride 访问、每个线程的地址散落在不同缓存行，则最多发 32 次事务，有效带宽损失数十倍。

```cpp
// ✅ 合并访问：相邻线程访问相邻地址 → 1 次 128B 事务
__global__ void copy_coalesced(const float* in, float* out, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) out[i] = in[i];
}

// ❌ 步长访问：每个线程落进不同的缓存行 → 最多 32 次事务
__global__ void copy_strided(const float* in, float* out, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) out[i * 32] = in[i * 32];
}
```

- 结构体数组（AoS）改成数组结构体（SoA），让连续访存成为可能；
- 用 `float4` 等向量化类型一次加载 16 字节；
- 只读指针加 `const __restrict__`，帮助编译器生成 `__ldg` 只读加载。

## 三、共享内存与 bank conflict

共享内存位于 SM 内部，作用域是线程块，延迟只有全局内存的 1/10 左右，适合存放 block 内需要反复复用的数据（矩阵分块 tile、归约中间结果等）。

它被划分为 32 个 bank，每个 bank 每周期只能服务一个地址。当 warp 中多个线程访问的地址落在同一个 bank 的不同地址时，就会发生 **bank conflict**，这些访问被串行化，冲突程度用「N-way conflict」表示。

```cpp
extern __shared__ float smem[];

// ✅ 线程 t 访问 smem[t]：地址连续，32 个线程恰好分占 32 个 bank
float good = smem[threadIdx.x];

// ❌ 线程 t 访问 smem[t * 32]：地址同余，全部落在同一个 bank
//    32-way conflict，有效带宽退化 32 倍
float bad = smem[threadIdx.x * 32];
```

经典解法是 padding：把数组第二维从 32 改成 33，错开地址同余——`__shared__ float tile[32][32 + 1];`

> **注**：Volta 之后的架构引入独立线程调度，实际冲突行为更复杂；但「bank = 地址 % 32」的心智模型依然成立、依然值得遵守。

## 四、常量内存与纹理内存

常量内存（64KB）对主机只读、对设备以读为主。它最大的价值是「广播」：当一个 warp 内所有线程读取同一个地址时，和寄存器一样快；地址不同才会串行。内核参数（`kernel<<<...>>>(args)`）默认就走常量内存。

纹理内存基于早期的图形管线，提供硬件插值、越界处理和 2D 空间局部性缓存，在图像处理、查表（lookup table）场景仍有价值。一般 CUDA 计算里，先用好全局 + 共享内存即可。

## 五、统一内存：方便，但有代价

`cudaMallocManaged` 让 CPU 和 GPU 共享同一个指针，缺页时按需在主机与设备间迁移数据。它把「显式拷贝（cudaMemcpy）」变成「按需迁移」，开发效率大幅提升，适合原型验证、数据量不大或访问模式不规则的场景。

```cpp
float* data;
cudaMallocManaged(&data, n * sizeof(float));  // CPU / GPU 都能直接访问

cudaDeviceSynchronize();        // 预热：让数据迁移到 GPU
kernel<<<...>>>(data, n);
```

代价是隐式传输：迁移粒度按页，频繁的零散访问可能触发大量 PCIe 传输，性能难以预测；数据远超显存容量时（oversubscription）退化明显。生产级代码通常仍是「统一内存先跑通 → 显式管理再优化」。

## 六、实战检查清单

> **写完 kernel 后逐项自查：**

- 热点循环的访存是否合并？（连续、对齐、向量化）
- 频繁复用的 block 级数据是否放进共享内存？
- 共享内存访问有没有 bank conflict？必要时 padding；
- 只读数据是否用 `const __restrict__` / `__ldg` / 常量内存？
- host-device 拷贝是否用 pinned memory + 异步流重叠计算？
- 用 Nsight Compute 看内存吞吐率和事务数，而不是靠猜。

## 七、延伸阅读

- [CUDA C++ Programming Guide — Memory Hierarchy（官方文档）](https://docs.nvidia.com/cuda/cuda-c-programming-guide/)
- [NVIDIA Nsight Compute 用户手册（内存工作负载分析）](https://docs.nvidia.com/nsight-compute/)
- 《Professional CUDA C Programming》第 5 章「Memory Management」
- 知乎专栏：CUDA 内存模型图解（占位链接，换成你收藏的文章）
