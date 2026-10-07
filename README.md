# AI Infra Notes — Astro + Decap CMS 版

「个人主页 + AI 基础设施学习笔记归档」的正式站点骨架：

- **Astro 5** 静态生成，笔记全部是 **Markdown 文件**；
- **Decap CMS** 提供 `/admin/` 网页后台：浏览器里编辑笔记、拖拽上传图片，保存后自动提交 Git 并触发部署；
- 深色科技风设计，首页 / 笔记列表（搜索 + 分类筛选）/ 文章页（自动目录）三件套齐全。

## 本地预览

需要 [Node.js](https://nodejs.org/) ≥ 18.17.1（官网装 LTS 版即可，自带 npm）：

```bash
npm install        # 安装依赖（首次或 package.json 变化后）
npm run dev        # 启动开发服务器 → 浏览器打开 http://localhost:4321
```

- 修改 Markdown / 页面文件后浏览器会自动刷新；
- `npm run build` 生成静态产物到 `dist/`，`npm run preview` 本地预览产物。

> 说明：本机沙箱环境里 npm 不可用，因此本目录通过 pnpm 安装依赖，并在
> `pnpm-workspace.yaml` 里配置了平铺安装（`nodeLinker: hoisted`）。
> 在你自己的电脑上直接用 npm 即可，无需关心这个文件。

## 目录结构

| 路径 | 作用 |
|---|---|
| `src/content/notes/*.md` | **笔记正文**（每篇一个 Markdown 文件，frontmatter 存元信息） |
| `src/pages/` | 页面：首页、`notes/`（列表）、`notes/[slug]`（文章模板） |
| `src/components/NoteCard.astro` | 笔记卡片组件 |
| `src/lib/notes.ts` | 分类体系（改分类改这里 + `public/admin/config.yml`） |
| `src/styles/global.css` | 全部样式，`src/layouts/Base.astro` 是公共布局 |
| `public/images/` | **图片目录**（正文里用 `/images/xxx.png` 引用） |
| `public/admin/` | Decap CMS 后台页面与配置 |
| `scripts/gen-notes.mjs` | 一次性脚手架脚本（生成示例笔记用，可删除） |

## 三种编辑笔记的方式

1. **网页后台（上线后）**：打开 `你的域名/admin/`，用 GitHub 账号登录，所见即所得编辑 + 拖拽传图；
2. **GitHub 网页编辑器**：直接在仓库里改 `.md` 文件，图片拖进编辑框自动上传；
3. **本地编辑器**：VS Code / Obsidian 写 Markdown，图片存 `public/images/`，正文写 `/images/文件名`。

## 新增一篇笔记

在 `src/content/notes/` 新建 `我的笔记.md`（文件名会成为网址，建议英文+连字符）：

```markdown
---
title: "笔记标题"
date: "2026-10-07"
category: gpu
tags:
  - CUDA
excerpt: "一句话摘要，显示在卡片上"
status: 已发布
featured: false
---

正文用 Markdown 写，代码块用 ```cpp 等语言标记，图片写：

![架构图](/images/arch.png)
```

- `category` 取值：`gpu` / `dist` / `infer` / `net` / `cluster` / `storage`；
- `status`：已发布 / 写作中 / 计划中（卡片上的彩色徽标）；
- `featured: true` 会出现在首页「精选笔记」。

## 启用 /admin/ 网页后台（Decap CMS）

1. 在 GitHub 创建仓库（如 `yourname/ai-infra-notes`），把本项目推上去；
2. 编辑 `public/admin/config.yml`，把 `backend.repo` 改成 `yourname/ai-infra-notes`；
3. 部署站点（两种方式）：
   - **Netlify（推荐，CMS 登录最省事）**：`New site from Git` 选仓库 → Build command 填 `npm run build`、Publish directory 填 `dist` → 部署完成后在 **Site settings → Identity** 启用 Identity → 添加 **GitHub** 登录提供商 → 回到 Identity 页面邀请你自己的邮箱；
   - **Cloudflare Pages**：同样绑定仓库构建（`dist` 目录）。网站本身完全正常，但 CMS 登录需要自建 OAuth 网关，较麻烦；
4. 打开 `你的域名/admin/`，用 GitHub 登录即可管理笔记；
5. 后台里新建/编辑笔记、上传图片 → 保存 = 自动提交 Git = 自动重新部署。

> 未部署前，`/admin/` 页面能打开但无法登录（需要真实仓库和 OAuth）。
> 本地写笔记不受影响，直接编辑 `src/content/notes/` 下的文件即可。

## 上线前最后一步

把 `astro.config.mjs` 里的 `site` 改成你的真实域名（影响 SEO 相关标签）。
域名注册、DNS 解析等完整流程见工作区根目录的《建站流程.md》。

## 旧版样例

同工作区的 `ai-infra-site/` 是最早的纯 HTML 版样例，仅作设计参考，可以删除。
