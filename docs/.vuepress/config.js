module.exports = {
  title: '运维工程师实战手册',
  description: '系统全面的Linux运维工程师学习指南和最佳实践',
  head: [
    ['meta', { name: 'keywords', content: 'Linux运维,系统管理,网络服务,存储系统,虚拟化技术,运维工程师,技术文档' }],
    ['meta', { name: 'description', content: '运维工程师实战手册是一个全面的Linux运维技术学习平台,涵盖基础设施、系统管理、网络服务、存储系统等核心内容' }],
    ['meta', { name: 'robots', content: 'index,follow' }],
    ['meta', { name: 'googlebot', content: 'index,follow' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: '基础设施', link: '/01_基础设施/' },
      { text: '系统管理', link: '/02_系统管理/' },
      { text: '网络服务', link: '/03_网络服务/' },
      { text: '存储系统', link: '/04_存储系统/' },
      { text: '最佳实践', link: '/05_最佳实践/' },
      { text: '常见问题', link: '/06_常见问题/' }
    ],
    sidebar: {
      '/01_基础设施/': [
        {
          title: 'Linux系统管理',
          collapsable: false,
          children: [
            '/01_基础设施/01_Linux基础/',
            '/01_基础设施/02_系统管理/',
            '/01_基础设施/03_网络配置/',
            '/01_基础设施/04_存储管理/',
            '/01_基础设施/05_安全加固/'
          ]
        }
      ]
    },
    lastUpdated: '上次更新',
    repo: 'your-repo-url',
    docsDir: 'docs',
    editLinks: true,
    editLinkText: '在 GitHub 上编辑此页',
    smoothScroll: true
  },
  plugins: [
    ['@vuepress/search', {
      searchMaxSuggestions: 10
    }],
    ['@vuepress/google-analytics', {
      'ga': 'UA-XXXXX-Y'
    }],
    ['@vuepress/medium-zoom'],
    ['@vuepress/back-to-top'],
    ['@vuepress/nprogress'],
    ['sitemap', {
      hostname: 'https://your-domain.com'
    }],
    ['seo'],
    ['@vssue/vuepress-plugin-vssue', {
      platform: 'github',
      owner: 'your-username',
      repo: 'your-repo-name',
      clientId: 'YOUR_CLIENT_ID',
      clientSecret: 'YOUR_CLIENT_SECRET',
      autoCreateIssue: true
    }]
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
        '@assets': 'path/to/assets'
      }
    }
  }
} 