# Changelog · 珍奇柜 (Cabinet)

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 规范，版本号遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/)。

---

## [1.1.0] - 2026-09-21

### 变更 (Changed)
- **多端与云端解耦架构升级 (Decoupled Cloud Mount Architecture)**：
  - 在 `assets/config.js` 中抽象出 `assetBaseUrl` 与 `coreLiveUrl`，正式支持离线单体运行与 Cloudflare Pages / R2 外部 CDN 挂载双模调度。
  - 增强与创作者生态项目（`Gallery` 中央大厅、`CangFeng` 藏锋录）的双向链接机制。

### 优化 (Optimized)
- **极简深色手作排版 (Anti-AI Slop Craft)**：
  - 全站消除漂浮链接气泡，优化 Rijksmuseum 式黑灰微渐变暗调展厅质感与微阻尼滚轮吸附手感。

---

## [1.0.0] - 2026-09-20

### 新增 (Added)
- **珍奇柜项目初始发布 (Initial Release)**：
  - 收录 8 幅大幅面高精度空间测绘、卫星遥感与权威标准地图要素（极地冰川、荒漠沉积、高原侵蚀、安徽省公路网、黑龙江及东极抚远实测图、地中海与意大利要素图等）。
  - 内置 WebP 金字塔瓦片深览（Deep Zoom Image），支持 1:1 物理像素拖拽无级巡礼。
  - 支持横幅长卷 / 条幅立轴宽高比分类筛选、主色板提取与三屏定点滚轮吸附翻页。
  - 内置 `双击浏览画廊.bat` 与离线降级垫片 `data/manifest.js`，开箱即用，无需配置本地 Web 容器。
