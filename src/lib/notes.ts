// ============================================
// 站点共享数据：分类与状态映射
// 修改分类体系只需要改 CATEGORIES 数组，
// Decap 后台的分类选项在 public/admin/config.yml 里保持同步。
// ============================================

export interface NoteFrontmatter {
  title: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
  status: string;
  featured: boolean;
}

export const CATEGORIES = [
  { key: "gpu", name: "GPU / CUDA", desc: "计算架构、内存模型、核函数优化" },
  { key: "dist", name: "分布式训练", desc: "数据并行、模型并行、通信原语" },
  { key: "infer", name: "推理优化", desc: "KV Cache、PagedAttention、量化" },
  { key: "net", name: "网络通信", desc: "NCCL、RoCE、InfiniBand" },
  { key: "cluster", name: "集群与调度", desc: "Kubernetes、GPU 调度、平台工程" },
  { key: "storage", name: "存储与数据", desc: "数据加载、检查点、缓存" },
];

export const CATEGORY_NAME: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.name])
);

export const STATUS_CLASS: Record<string, string> = {
  已发布: "published",
  写作中: "doing",
  计划中: "planned",
};

// 从 glob 路径提取 slug，如 "../content/notes/cuda-memory.md" -> "cuda-memory"
export function noteSlug(path: string): string {
  return path.split("/").pop()!.replace(/\.md$/, "");
}
