import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// 笔记内容集合：定义 src/content/notes/*.md 的 frontmatter 结构
// 页面通过 import.meta.glob 读取，这里主要用于校验与去警告
const notes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/notes" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    excerpt: z.string().optional(),
    status: z.string().default("计划中"),
    featured: z.boolean().default(false),
  }),
});

export const collections = { notes };
