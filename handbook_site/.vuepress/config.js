const path = require('path');
const { parseMappingFile, generateSidebarAndNavConfig } = require('./generateSidebar');

// Path to the actual Markdown content directory name
const contentDirName = 'ops_handbook'; // UPDATED to new English root directory
// Absolute path to the content directory from the perspective of this config file's execution
const contentAbsolutePath = path.resolve(__dirname, `../../${contentDirName}`);

// Base path for VuePress links.
// For generateSidebarAndNavConfig, this should be '/' if docsDir is the root for content.
const handbookBaseForLinks = '/';

let dynamicNav = [];
let dynamicSidebar = {};

try {
  const mappingData = parseMappingFile(); // Parses ../../docs/HANDBOOK_STRUCTURE_MAPPING.md
  if (mappingData.length > 0) {
    console.log(`[config.js] Successfully parsed ${mappingData.length} entries from mapping file.`);
    // Pass the NEW English content directory path to the generator
    const generatedConfig = generateSidebarAndNavConfig(mappingData, contentAbsolutePath, handbookBaseForLinks);
    dynamicNav = generatedConfig.nav;
    dynamicSidebar = generatedConfig.sidebar;
  } else {
    console.error("[config.js] Mapping data is empty or parse failed. Nav and Sidebar will be minimal or empty.");
  }
} catch (e) {
  console.error("[config.js] Error during nav/sidebar generation:", e);
  // Provide fallback default nav/sidebar to prevent build errors
  dynamicNav = [{ text: '首页', link: '/' }];
  dynamicSidebar = { '/': [''] };
}

module.exports = {
  title: '运维工程师实战手册',
  description: '一个全面、深入的运维知识库和实战指南。',
  base: '/ops-handbook-site/', // Assuming deployment to GitHub Pages subpath
  head: [
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    // ['link', { rel: 'icon', href: '/favicon.ico' }] // TODO: Add favicon
  ],
  // `docsDir` is relative to the `sourceDir` (which is `handbook_site/` if running `vuepress dev handbook_site`).
  // It points to the directory containing the actual Markdown content.
  docsDir: `../${contentDirName}`, // UPDATED to new English root directory
  themeConfig: {
    // logo: '/logo.png', // TODO: Add logo
    nav: dynamicNav,
    sidebar: dynamicSidebar,
    lastUpdated: '上次更新', // string | boolean
    // GitHub repo options - TODO: Update these URLs
    // repo: 'YOUR_GITHUB_USERNAME/YOUR_REPO_NAME',
    // repoLabel: '查看源码',
    // docsRepo: 'YOUR_GITHUB_USERNAME/YOUR_REPO_NAME',
    // docsDir: contentDirName, // This should be the name of the content folder within the repo for edit links
    // editLinks: true,
    // editLinkText: '在 GitHub 上编辑此页',
  },
  plugins: [
    ['@vuepress/plugin-search', {
      searchMaxSuggestions: 10
    }],
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
    '@vuepress/plugin-nprogress',
  ]
}
