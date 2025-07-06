module.exports = {
  title: '运维知识库 项目文档', // Updated title
  description: '《运维工程师实战手册》知识库的项目级文档，包含规划、贡献指南和技术说明。', // Updated description
  head: [
    // Meta tags can be kept or adjusted as needed. For project docs, detailed SEO might be less critical.
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    ['link', { rel: 'icon', href: '/favicon.ico' }] // Assuming favicon is still relevant
  ],
  themeConfig: {
    logo: '/logo.png', // Can be kept or changed
    nav: [
      { text: '首页', link: '/' },
      { text: '项目规划', link: '/PROJECT_PLAN.html' },
      // { text: '贡献指南', link: '/CONTRIBUTING.html' }, // Placeholder for when CONTRIBUTING.md is created
      // { text: '技术文档', link: '/TECHNICAL_DOCS/' }, // Placeholder for when TECHNICAL_DOCS are created
    ],
    sidebar: [
      {
        title: '项目概览',
        collapsable: false,
        children: [
          '/', // Link to docs/README.md
          '/PROJECT_PLAN.md',
        ]
      },
      // {
      //   title: '贡献指南',
      //   collapsable: false,
      //   children: [
      //     // '/CONTRIBUTING.md', // Placeholder
      //   ]
      // },
      // {
      //   title: '技术文档',
      //   collapsable: false,
      //   children: [
      //     // '/TECHNICAL_DOCS/ARCHITECTURE.md', // Placeholder
      //   ]
      // }
    ],
    lastUpdated: '上次更新',
    // repo: 'your-repo-url', // Update if this site has a different repo or if not needed
    docsDir: 'docs', // This remains 'docs' as it's the source for this VuePress site
    editLinks: true,
    editLinkText: '在 GitHub 上编辑此页',
    smoothScroll: true
  },
  plugins: [
    ['@vuepress/search', {
      searchMaxSuggestions: 10
    }],
    // ['@vuepress/google-analytics', { 'ga': 'UA-XXXXX-Y' }], // May not be needed for project docs
    ['@vuepress/medium-zoom'],
    ['@vuepress/back-to-top'],
    ['@vuepress/nprogress'],
    // Vssue (comments) might not be needed for internal project docs, can be removed if desired
    // ['@vssue/vuepress-plugin-vssue', {
    //   platform: 'github',
    //   owner: 'your-username',
    //   repo: 'your-repo-name',
    //   clientId: 'YOUR_CLIENT_ID',
    //   clientSecret: 'YOUR_CLIENT_SECRET',
    //   autoCreateIssue: true
    // }],
    // Sitemap and SEO might be less critical for project docs, can be removed if desired
    // ['sitemap', { hostname: 'https://your-domain.com' }],
    // ['seo'],
  ],
  markdown: {
    lineNumbers: true,
    extractHeaders: ['h2', 'h3', 'h4'],
    plugins: [
      'markdown-it-emoji',
      'markdown-it-task-lists'
    ]
  },
  configureWebpack: {
    resolve: {
      alias: {
        // '@assets': 'path/to/assets' // Update or remove if not used
      }
    }
  }
}