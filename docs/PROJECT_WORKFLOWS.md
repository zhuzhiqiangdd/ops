# 项目执行逻辑流程图

本文档使用 Mermaid 语法描述了《运维工程师实战手册》知识库项目相关的核心执行流程。

## 1. 《运维工程师实战手册》内容更新与网站部署流程

```mermaid
graph TD
    subgraph "内容贡献者 (您)"
        A[1. 规划/优化 <br> `运维工程师实战手册/` <br> 目录结构] --> B[2. 编写/修改 <br> `运维工程师实战手册/` <br> 内的 .md 文档];
        B --> C[3. 本地预览 (可选) <br> 使用本地 Handbook Site VuePress 实例];
        C --> D[4. Git: <br> add, commit, push <br> 到 main 分支];
    end

    subgraph "GitHub & CI/CD (AI 工程师配置)"
        D -- Git Push --> E{5. GitHub Actions <br> (Handbook Site Workflow)};
        E --> F[6. Checkout 代码];
        F --> G[7. Setup Node.js <br> (Handbook Site VuePress 环境)];
        G --> H[8. npm ci <br> (安装 Handbook Site 依赖)];
        H --> I[9. npm run build <br> (构建 Handbook Site <br> VuePress 静态文件)];
        I -- 生成静态文件 --> J[docs-handbook-dist <br> (示例构建输出目录)];
        J --> K[10. Deploy to GitHub Pages <br> (或其他静态托管服务)];
    end

    subgraph "用户"
        K -- 部署完成 --> L[11. 用户通过浏览器 <br> 访问更新后的 <br> 《运维工程师实战手册》网站];
    end
```

**流程说明:**

1.  **规划/优化目录结构**: 内容贡献者首先规划或优化 `运维工程师实战手册/` 目录下的文件夹和文件组织方式。
2.  **编写/修改 .md 文档**: 在确定的目录结构下，内容贡献者编写或修改具体的 Markdown 文档。
3.  **本地预览 (可选)**: 内容贡献者可以在本地运行一个专门为 `运维工程师实战手册/` 配置的 VuePress 开发服务器，实时预览更改效果。
4.  **Git 操作**: 完成修改后，使用 Git 命令 (`git add .`, `git commit -m "描述"`, `git push`) 将更改推送到 GitHub 仓库的 `main` 分支。
5.  **GitHub Actions 触发**: 推送到 `main` 分支的操作会自动触发预设的 GitHub Actions 工作流程，该流程专门用于构建和部署《运维工程师实战手册》网站。
6.  **Checkout 代码**: CI/CD 服务器（GitHub Actions Runner）检出最新的代码。
7.  **Setup Node.js**: 配置 Node.js 环境，这是运行 VuePress 所必需的。
8.  **安装依赖**: 使用 `npm ci` (或 `yarn install`) 安装 Handbook Site VuePress 项目的依赖。
9.  **构建静态文件**: 执行构建命令 (如 `npm run build`)，VuePress 会将 `运维工程师实战手册/` 下的 Markdown 文件编译成静态 HTML、CSS 和 JS 文件。
10. **部署**: 将构建生成的静态文件部署到指定的静态网站托管服务（如 GitHub Pages）。
11. **用户访问**: 部署完成后，用户即可通过网站链接访问到更新后的《运维工程师实战手册》。

## 2. 项目文档 (`docs/`) 更新与网站部署流程

```mermaid
graph TD
    subgraph "项目维护者 (AI 工程师 / 您)"
        PD_A[1. 编写/修改 <br> `docs/` 目录下 <br> 的项目文档 <br> (如 PROJECT_PLAN.md, CONTRIBUTING.md)];
        PD_A --> PD_B[2. 本地预览 (可选) <br> 使用 `docs/` 目录的 <br> VuePress 实例];
        PD_B --> PD_C[3. Git: <br> add, commit, push <br> 到 main 分支];
    end

    subgraph "GitHub & CI/CD (AI 工程师配置)"
        PD_C -- Git Push --> PD_D{4. GitHub Actions <br> (Project Docs Site Workflow)};
        PD_D --> PD_E[5. Checkout 代码];
        PD_E --> PD_F[6. Setup Node.js <br> (`docs/` VuePress 环境)];
        PD_F --> PD_G[7. npm ci <br> (安装 `docs/` VuePress 依赖)];
        PD_G --> PD_H[8. npm run build <br> (构建 `docs/` VuePress <br> 静态文件)];
        PD_H -- 生成静态文件 --> PD_I[docs/.vuepress/dist <br> (构建输出目录)];
        PD_I --> PD_J[9. Deploy to GitHub Pages <br> (或其他静态托管服务, <br> 可能与手册站点使用不同路径或域名)];
    end

    subgraph "项目相关人员"
        PD_J -- 部署完成 --> PD_K[10. 项目维护者/贡献者 <br> 访问更新后的 <br> 项目文档网站];
    end
```

**流程说明:**

此流程与《运维工程师实战手册》的流程非常相似，主要区别在于：

*   **内容源**: `docs/` 目录及其子文件。
*   **VuePress 实例**: 使用的是配置在 `docs/.vuepress/config.js` 的 VuePress 实例。
*   **CI/CD Workflow**: 可能是一个独立的 GitHub Actions workflow，或者在同一个 workflow 文件中通过路径判断来区分执行不同的构建步骤。
*   **目标受众**: 主要是项目维护者和潜在的内容贡献者。
*   **部署目标**: 可能会部署到与主手册网站不同的URL路径或子域名下，以区分两者。

## 3. 用户访问流程

### 3.1 访问《运维工程师实战手册》网站

```mermaid
graph LR
    User[用户] -- 输入手册网址 --> Browser[浏览器];
    Browser -- 发起HTTP请求 --> Hosting[静态网站托管服务 <br> (如 GitHub Pages)];
    Hosting -- 返回静态文件 --> Browser;
    Browser -- 渲染页面 --> Display[显示手册内容];
```

### 3.2 访问项目文档 (`docs/`) 网站

```mermaid
graph LR
    ProjectMember[项目成员] -- 输入项目文档网址 --> Browser[浏览器];
    Browser -- 发起HTTP请求 --> Hosting[静态网站托管服务 <br> (如 GitHub Pages)];
    Hosting -- 返回静态文件 --> Browser;
    Browser -- 渲染页面 --> Display[显示项目文档内容];
```

这些流程图提供了项目各方面运作方式的高级概览。具体的命令和函数调用在每个CI/CD步骤中执行，例如：
- `npm run build` 内部会调用 `vuepress build <sourcedir>`。
- GitHub Actions 中的 `actions/checkout@v3`, `actions/setup-node@v3`, `actions/deploy-pages@v2` 等都是封装好的函数集合。
