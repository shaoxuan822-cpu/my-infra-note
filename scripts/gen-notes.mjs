// ============================================
// 一次性脚手架：批量生成示例笔记的 Markdown 文件
// 生成后即可删除，不影响站点运行。
// 运行方式：node scripts/gen-notes.mjs
// ============================================
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "content", "notes");

const notes = [
  {
    file: "cuda-memory",
    fm: { title: "CUDA 内存模型：从寄存器到全局内存", date: "2026-10-05", category: "gpu", tags: ["CUDA", "内存", "性能优化"], excerpt: "寄存器、共享内存、L1/L2、全局内存各差多少延迟？合并访问与 bank conflict 是什么？一篇讲清 CUDA 内存层级。", status: "已发布", featured: true },
    body: "（完整示例文章，见同目录 cuda-memory.md 的正式内容）",
  },
  {
    file: "cuda-exec-model",
    fm: { title: "线程组织与执行模型：Grid / Block / Warp", date: "2026-09-20", category: "gpu", tags: ["CUDA", "基础"], excerpt: "Grid、Block、Warp 与线程束调度：写 kernel 之前必须建立的执行模型心智图。", status: "已发布", featured: false },
    body: [
      "写 kernel 之前，先建立执行模型的心智图：内核如何被分解成线程，线程如何被组织、调度。",
      "本文梳理 Grid、Block、Warp 与 SIMT 执行模型。",
      "",
      "## 要点大纲",
      "",
      "- **Grid → Block → Thread**：内核启动时指定网格与线程块维度，块映射到 SM，线程以 warp（32 线程）为单位调度；",
      "- **SIMT**：一个 warp 内的线程执行同一条指令、操作不同数据，分支发散会串行执行两条路径；",
      "- **占用率**：SM 上同时驻留的 warp 数与寄存器、共享内存用量直接相关，是隐藏访存延迟的关键指标。",
      "",
      "> 正文正在完善中。",
    ].join("\n"),
  },
  {
    file: "gpu-topology",
    fm: { title: "GPU 拓扑：NVLink、PCIe 与多卡互联", date: "2026-09-08", category: "gpu", tags: ["硬件", "拓扑", "多卡"], excerpt: "多卡训练前先看懂硬件拓扑：NVLink 带宽、NVSwitch、PCIe 瓶颈，以及为什么 8 卡机是主流。", status: "写作中", featured: false },
    body: "多卡训练前先看懂硬件拓扑：NVLink 带宽、NVSwitch、PCIe 瓶颈，以及为什么 8 卡机是主流。\n\n> 本文正在写作中，大纲即将放出。",
  },
  {
    file: "nsight-intro",
    fm: { title: "Nsight Systems / Compute 入门", date: "2026-08-25", category: "gpu", tags: ["性能分析", "工具"], excerpt: "两个工具分工：Systems 看时间线、Compute 看 kernel 级指标，附最常用的 10 个指标。", status: "计划中", featured: false },
    body: "Nsight Systems 看时间线、Nsight Compute 看 kernel 级指标，两个工具分工明确。\n\n> 计划中的文章，敬请期待。",
  },
  {
    file: "parallelism-overview",
    fm: { title: "分布式训练综述：数据并行与模型并行", date: "2026-09-28", category: "dist", tags: ["分布式", "并行"], excerpt: "DP、TP、PP 到底怎么分？一张图看懂三种并行切分的计算图，以及各自的通信代价。", status: "已发布", featured: false },
    body: [
      "大模型放不进单卡之后，并行切分成为基本功。本文用一张图讲清 DP / TP / PP 三种并行以及它们的通信代价。",
      "",
      "## 三种并行速览",
      "",
      "| 并行方式 | 切分对象 | 主要通信 | 典型工具 |",
      "| --- | --- | --- | --- |",
      "| 数据并行 DP | 数据 batch | AllReduce 梯度 | PyTorch DDP / DeepSpeed |",
      "| 张量并行 TP | 模型层内参数 | AllReduce / AllGather（高频） | Megatron-LM |",
      "| 流水并行 PP | 模型层间 | P2P 传递激活值 | Megatron-LM / DeepSpeed |",
      "",
      "> 实际训练通常是三者组合（3D 并行），正文正在完善中。",
    ].join("\n"),
  },
  {
    file: "ring-allreduce",
    fm: { title: "Ring AllReduce 与 NCCL 集合通信", date: "2026-10-02", category: "dist", tags: ["NCCL", "AllReduce", "通信"], excerpt: "梯度怎么在多卡间高效求和？Ring AllReduce 的带宽最优性、NCCL 的角色与常见坑。", status: "已发布", featured: true },
    body: [
      "梯度怎么在多卡之间高效求和？Ring AllReduce 把通信量摊到每张卡上，是带宽最优的集合通信算法之一。",
      "",
      "## 要点大纲",
      "",
      "- **朴素 AllReduce**：所有卡把梯度发给一张卡求和再广播，中心节点成为瓶颈；",
      "- **Ring 算法**：卡排成环，分 Scatter-Reduce 与 AllGather 两阶段，每张卡只与相邻两张卡通信，带宽利用率接近最优；",
      "- **NCCL**：NVIDIA 的集合通信库，自动根据拓扑（NVLink / InfiniBand）选择树/环算法，是 PyTorch 的分布式后端。",
      "",
      "> 正文正在完善中。",
    ].join("\n"),
  },
  {
    file: "zero-optimizer",
    fm: { title: "ZeRO 优化器三部曲", date: "2026-08-30", category: "dist", tags: ["显存优化", "DeepSpeed"], excerpt: "显存放不下的不只是模型：优化器状态才是大户。ZeRO-1/2/3 逐级卸载什么、省多少显存？", status: "写作中", featured: false },
    body: "显存放不下的不只是模型：优化器状态才是大户。ZeRO-1/2/3 逐级卸载什么、省多少显存？\n\n> 本文正在写作中。",
  },
  {
    file: "mixed-precision",
    fm: { title: "混合精度训练（AMP）与 FP8", date: "2026-08-12", category: "dist", tags: ["精度", "AMP", "FP8"], excerpt: "fp16/bf16 为什么能训、损失缩放怎么做、FP8 时代的 E4M3/E5M2 格式对比。", status: "写作中", featured: false },
    body: "fp16/bf16 为什么能训、损失缩放怎么做、FP8 时代的 E4M3/E5M2 格式对比。\n\n> 本文正在写作中。",
  },
  {
    file: "kv-cache",
    fm: { title: "KV Cache 与推理显存估算", date: "2026-10-06", category: "infer", tags: ["推理", "显存", "KV Cache"], excerpt: "长上下文推理的显存黑洞：KV Cache 公式推导，以及 batch、序列长度与显存的换算表。", status: "已发布", featured: true },
    body: [
      "长上下文推理的显存黑洞：KV Cache。本文推导显存公式，并给出常用配置的换算表。",
      "",
      "## 显存公式",
      "",
      "```text",
      "KV Cache 显存 ≈ 2 × 层数 × batch × 序列长度 × hidden_size × 精度字节数",
      "```",
      "",
      "以 8B 量级模型（32 层、hidden 4096、bf16）为例：",
      "",
      "| batch | 序列长度 | KV Cache |",
      "| --- | --- | --- |",
      "| 1 | 4K | ~2 GB |",
      "| 8 | 4K | ~16 GB |",
      "| 1 | 128K | ~64 GB |",
      "",
      "> 正文正在完善中。",
    ].join("\n"),
  },
  {
    file: "vllm-pagedattention",
    fm: { title: "vLLM 与 PagedAttention", date: "2026-09-15", category: "infer", tags: ["vLLM", "推理引擎"], excerpt: "把 KV Cache 当操作系统分页管：PagedAttention 如何把显存利用率从 20% 拉到 90%+。", status: "已发布", featured: false },
    body: [
      "把 KV Cache 当操作系统分页来管理：PagedAttention 是 vLLM 吞吐数倍于传统实现的核心。",
      "",
      "## 要点大纲",
      "",
      "- **传统方式**：为每个序列预留整段连续显存，碎片化导致利用率只有 20~40%；",
      "- **PagedAttention**：KV Cache 切成固定大小的 block，按需分配、不要求连续，利用率可达 90%+；",
      "- **连续批处理**：新请求随时插进正在执行的 batch，推理吞吐大幅提升。",
      "",
      "> 正文正在完善中。",
    ].join("\n"),
  },
  {
    file: "flashattention",
    fm: { title: "FlashAttention 原理", date: "2026-09-02", category: "infer", tags: ["注意力", "IO"], excerpt: "不把注意力矩阵写回 HBM：分块 + 在线 softmax，IO-aware 算法的代表作。", status: "写作中", featured: false },
    body: "不把注意力矩阵写回 HBM：分块 + 在线 softmax，IO-aware 算法的代表作。\n\n> 本文正在写作中。",
  },
  {
    file: "quantization",
    fm: { title: "模型量化：INT8/FP8 与 GPTQ/AWQ", date: "2026-08-18", category: "infer", tags: ["量化", "推理"], excerpt: "量化方法全景：训练后量化 vs 量化感知训练，权重/激活量化的难点与工具选择。", status: "计划中", featured: false },
    body: "训练后量化 vs 量化感知训练，权重/激活量化的难点与工具选择。\n\n> 计划中的文章。",
  },
  {
    file: "roce-ib",
    fm: { title: "RoCE 与 InfiniBand：AI 集群网络选型", date: "2026-09-25", category: "net", tags: ["网络", "RoCE", "InfiniBand"], excerpt: "GPU 集群的网络怎么选？IB 的低延迟、RoCE 的性价比、ECMP 哈希冲突与常见故障。", status: "写作中", featured: false },
    body: "IB 的低延迟、RoCE 的性价比、ECMP 哈希冲突与常见故障——GPU 集群网络选型。\n\n> 本文正在写作中。",
  },
  {
    file: "collectives",
    fm: { title: "集合通信原语：AllReduce / AllGather / ReduceScatter", date: "2026-08-05", category: "net", tags: ["通信", "NCCL"], excerpt: "通信库的积木：每个原语的语义、消息量与典型使用场景。", status: "计划中", featured: false },
    body: "AllReduce、AllGather、ReduceScatter：每个原语的语义、消息量与典型场景。\n\n> 计划中的文章。",
  },
  {
    file: "k8s-gpu",
    fm: { title: "Kubernetes 上的 GPU 调度", date: "2026-09-10", category: "cluster", tags: ["Kubernetes", "调度"], excerpt: "device plugin、拓扑感知调度、共享 GPU 方案与 MIG，训练平台的基础设施层。", status: "计划中", featured: false },
    body: "device plugin、拓扑感知调度、共享 GPU 与 MIG——训练平台的基础设施层。\n\n> 计划中的文章。",
  },
  {
    file: "dataloader-ckpt",
    fm: { title: "训练数据加载与检查点", date: "2026-08-20", category: "storage", tags: ["数据", "检查点", "工程"], excerpt: "数据管线是隐形瓶颈：预取、缓存、异步检查点与断点续训的工程实践。", status: "计划中", featured: false },
    body: "预取、缓存、异步检查点与断点续训：数据管线是隐形瓶颈。\n\n> 计划中的文章。",
  },
];

function render(n) {
  const { title, date, category, tags, excerpt, status, featured } = n.fm;
  const tagLines = tags.map((t) => "  - " + t).join("\n");
  return [
    "---",
    'title: "' + title + '"',
    'date: "' + date + '"',
    "category: " + category,
    "tags:",
    tagLines,
    'excerpt: "' + excerpt + '"',
    "status: " + status,
    "featured: " + featured,
    "---",
    "",
    n.body.trim(),
    "",
  ].join("\n");
}

mkdirSync(outDir, { recursive: true });
for (const n of notes) {
  writeFileSync(join(outDir, n.file + ".md"), render(n), "utf8");
  console.log("written:", n.file + ".md");
}
console.log("done:", notes.length, "files");
