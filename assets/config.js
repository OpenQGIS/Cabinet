/**
 * Cabinet · External Links & Cloudflare Integration Configuration
 *
 * 挂载逻辑说明：
 * 1. assetBaseUrl: 外部切片瓦片与高精媒体资源挂载基准 URL。
 *    若配置了 Cloudflare Pages / CDN 链接（例如 'https://gallerycore.pages.dev'），
 *    则系统会自动优先从该外部链接拉取亿级 WebP 瓦片金字塔；
 *    若保持为空字符串 ''，则默认从本地相对路径 tiles/ 与 thumbs/ 读取。
 * 2. coreLiveUrl: 指向 Cloudflare 部署的私有云核心展厅的直达对外链接。
 * 3. authorGalleryUrl: 指向创作者个人原创画廊（Gallery）开源仓库与站点的友好外链。
 */
window.CABINET_CONFIG = {
  // 纯网页分支 (website) 外部瓦片切片挂载点（通过 CDN 直拉 main 分支切片数据）
  assetBaseUrl: 'https://cdn.jsdelivr.net/gh/OpenQGIS/Cabinet@main',

  // 云端在线完整展厅 (对外链接)
  coreLiveUrl: 'https://gallerycore.pages.dev',

  // 个人原创作品画廊外链 (Gallery)
  authorGalleryUrl: 'https://github.com/OpenQGIS/gallery',

  // 本仓库开源主页
  repositoryUrl: 'https://github.com/OpenQGIS/Cabinet',

  // 展厅案名与标识
  brand: {
    title: 'CABINET · 珍奇柜',
    subtitle: '空间制图 · 卫星遥感 · 寰宇图录',
    tagline: 'CURATED SPATIAL CARTOGRAPHY'
  }
};
