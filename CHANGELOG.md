# Changelog · 珍奇柜 (Cabinet)

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 规范，版本号遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/)。

---

## [1.3.14] - 2026-10-03

### 特性与交互升级 (Features & Micro-Interactions)
- **全面接入 Morphicons 弹簧形变矢量微动效与三层解耦浮动 Dock 架构 (Integrate Morphicons Engine & 3-Layer Dock Architecture)**：
  - **三层物理跟随与 3D 景深完全解耦**：
    - **外层容器 (`.tool-btn`)**：负责 3D 透视倾斜与鼠标磁吸拉伸物理计算 (`initMagneticDock`)；
    - **中层容器 (`.tb-icon-layer`)**：保留 6px Z 轴视差浮动深度 (Parallax Depth)；
    - **内层图形 (`svg` / `#toolRotateSvg`)**：负责独立的步进角度驱动与旋转物理动量，彻底解决动画帧与变形插值的矩阵覆盖冲突；
    - **核心路径 (`<path>`)**：由离线单文件 `vendor/morph-bundle.js` 驱动原生平滑贝塞尔插值变形。
  - **底部浮动工具栏纯净极简外观**：
    - 全面清除 `.tool-btn` 常态与 `:hover` 态的突兀圆形灰底与边框阴影，保持磨砂浮动高透质感。
  - **多维场景联动实装**：
    - **场景 A (`#toolReset`)**：视口处于全貌（Fit）时为全景展开框，缩放放大局部后自动 Morph 为向内聚焦框；点击回退全屏；
    - **场景 B (`#toolRotate`)**：采用纯转角强化回弹式微动效，锁定 `scale: 1.0` 恒定尺寸，每次点击触发 `-22° 蓄力 ➔ +14° 爆发过冲 ➔ 90° 弹簧吸附`；换图时自动复位；
    - **场景 C (`#toolFullscreen`)**：联动浏览器 `fullscreenchange` 事件，自动 Morph 切换展开四角与收拢四角；
    - **场景 D (`#btnToggleInfo`)**：联动侧边信息抽屉开合，信息图标与关闭叉号（×）双向平滑形变；
    - **场景 E (`#btnLangDropdown` & `#viewerBtnLangDropdown`)**：常态展示 Languages 字符图符，展开语言面板时平滑 Morph 为 Globe 地球仪；
    - **场景 F (`#btnShareOptLink`)**：复制作品直链成功后原地 Morph 为确认勾选符（Check），持续 1.8 秒后平滑复原。
  - **离线与独立实验室**：
    - 新增 `vendor/morph-bundle.js`（仅 19.8 KB，零外部网络依赖）；
    - 保留 `morph-demo.html` 作为长期动效调试实验室。

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
