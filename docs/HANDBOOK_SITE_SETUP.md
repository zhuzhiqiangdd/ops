# 《运维工程师实战手册》网站技术说明

本文档旨在为项目维护者和技术贡献者提供关于《运维工程师实战手册》最终在线网站的技术架构、本地开发、构建和部署流程的说明。

## 1. 技术架构概述

### 1.1 核心技术
-   **内容源**: 项目根目录下的 `devops_handbook/` (或其他最终确定的英文名称) 目录，包含所有 Markdown(.md) 格式的运维知识文档。
    -   **重要**: 此内容目录及其所有子目录和文件名**必须为纯英文**，以确保工具链兼容性和自动化流程的稳定性。
-   **站点生成器**: **VuePress v1.x** (初步选定，具体版本视搭建时最新稳定版而定)。
    -   选择原因：强大的 Markdown 支持、插件生态、主题系统、自动导航生成能力。
-   **VuePress 项目位置**: 将在项目根目录下创建一个新的独立目录，例如 `handbook_site/`，用于存放此 VuePress 实例的配置和依赖。

### 1.2 关键特性
-   **动态侧边栏**: 网站的侧边栏导航将根据 `devops_handbook/` 目录的实际文件结构动态生成，无需手动配置每一项。
-   **全文搜索**: 集成 VuePress 的搜索插件，方便用户快速查找内容。
-   **响应式设计**: 网站将采用响应式主题，适配不同屏幕尺寸（桌面、平板、手机）。
-   **代码高亮**: 提供清晰、美观的代码块高亮。
-   **自定义主题/样式**: (计划中) 可能会选择或定制 VuePress 主题，以达到“美观大方”的视觉效果。

## 2. 本地开发与预览 (手册网站)

假设手册的 VuePress 项目位于 `handbook_site/`，内容源位于 `../devops_handbook/` (相对于 `handbook_site/docs_dir` 的配置)。

1.  **环境准备**:
    *   安装 Node.js (推荐 LTS 版本)。
    *   全局或项目本地安装 Yarn (推荐) 或 npm。

2.  **克隆仓库**:
    ```bash
    git clone <repository_url>
    cd <repository_name>/handbook_site
    ```

3.  **安装依赖**:
    ```bash
    yarn install
    # 或者 npm install
    ```

4.  **启动开发服务器**:
    ```bash
    yarn dev
    # 或者 npm run dev
    ```
    VuePress 通常会在 `http://localhost:8080` (或类似端口) 启动本地开发服务器。当 `../devops_handbook/` 下的 Markdown 文件发生变化时，网站会自动重新加载。

## 3. 构建静态站点

当需要生成可部署的静态文件时：

1.  **进入手册站点目录**:
    ```bash
    cd <repository_name>/handbook_site
    ```
2.  **执行构建命令**:
    ```bash
    yarn build
    # 或者 npm run build
    ```
    构建产物 (静态 HTML, CSS, JS 文件) 通常会生成在 `handbook_site/.vuepress/dist/` 目录下。

## 4. 自动化部署 (CI/CD)

-   **触发条件**: 当 `main` 分支上 `devops_handbook/` 目录内容发生变化时 (或其他配置的分支和路径)。
-   **工具**: GitHub Actions。
-   **流程**: (参考 `docs/PROJECT_WORKFLOWS.md` 中的图示)
    1.  检出代码。
    2.  设置 Node.js 环境。
    3.  进入 `handbook_site/` 目录，安装依赖。
    4.  执行构建命令 (`yarn build`)。
    5.  将 `handbook_site/.vuepress/dist/` 目录下的构建产物部署到目标静态托管平台 (例如 GitHub Pages)。
-   具体的 GitHub Actions workflow 配置文件将位于项目根目录的 `.github/workflows/` 下 (例如 `deploy-handbook.yml`)。

## 5. 重要配置笔记

### 5.1 `handbook_site/.vuepress/config.js`
这是手册网站 VuePress 实例的核心配置文件。关键配置项包括：
-   `title`, `description`, `head`
-   `themeConfig`:
    -   `docsDir`: **重要** - 需要正确配置为指向实际的英文内容目录，例如 `../devops_handbook` (如果 VuePress 的 `sourceDir` 是 `handbook_site/src`，则 docsDir 可能是 `../../devops_handbook`)。路径的相对关系需要根据最终项目结构确定。
    -   `nav`: 顶部导航栏配置。
    -   `sidebar`: **动态生成**。会通过自定义脚本或插件读取 `devops_handbook/` 的目录结构来生成此配置。
    -   `logo`, `repo`, `editLinks` 等。
-   `plugins`: 配置搜索、返回顶部、图片缩放等插件。

### 5.2 动态侧边栏生成逻辑
-   这部分的技术实现细节将由 AI 工程师 (Jules) 完成。
-   基本思路是编写一个 Node.js 脚本，在 VuePress 构建或开发模式启动前，遍历指定的内容目录 (`devops_handbook/`)，根据其文件和子目录结构（以及 `README.md` 文件），生成符合 VuePress `sidebar` 配置格式的 JavaScript 对象或数组，并将其注入到 `config.js` 中或通过主题配置API使用。
-   脚本会考虑文件的数字前缀以保证排序，并将目录名和 `README.md` 的标题作为导航文本。

## 6. 注意事项
-   **内容目录的英文命名**: 再次强调，`devops_handbook/` (或最终确定的名称) 及其内部所有文件和子目录必须使用纯英文，以避免因中文字符编码问题导致的工具链兼容性、构建失败或导航错误。
-   **README.md 的重要性**: VuePress 通常将目录下的 `README.md` (或 `index.md`) 作为该目录路径的默认显示页面，并且其 YAML frontmatter 中的 `title` 常被用于生成导航文本。确保每个期望作为导航节点的目录都有一个合适的 `README.md`。

---
*本文档将根据项目进展和技术细节的确定持续更新。*
