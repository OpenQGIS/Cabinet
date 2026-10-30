# Cabinet · 珍奇柜
### A Curated Spatial Cartography & DeepZoom Geographic Archive
> 《珍奇柜 · 空间制图藏录》—— 汇聚全球高精度多光谱卫星遥感地貌与权威标准地图要素的交互式空间测绘画廊。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Format: WebP Pyramid](https://img.shields.io/badge/Format-WebP%20DZI-informational.svg)](#deep-zoom-architecture)
[![Design: Anti--AI%20Craft](https://img.shields.io/badge/Design-Anti--AI%20Craft-black.svg)](#design-principles)

---

## 1. 项目概述 (Overview)

**Cabinet (珍奇柜)** 是一个面向高精度空间测绘、遥感影像与地理信息制图的开源交互式图志画廊。

不同于常规图片缩略图列表，本项目采用金字塔级多分辨率切片（Deep Zoom Image / DZI）与 WebP 瓦片技术，支持在浏览器中以 1:1 物理像素对千万级像素的大幅面测绘地图、卫星遥感纹理进行平滑无缝的缩放与拖拽巡礼，并配备空间色彩提取、画幅比例筛选与全屏流式画廊。

### 核心展区 (Featured Collections)
1. **全球卫星遥感专题 (Verygoogmaps Collections)**
   - 汇聚极端自然地理与地表微观纹理（极地冰川、荒漠沉积、高原侵蚀与复杂陆表水系）。
   - 高精多光谱色彩重构，展现真实物理世界的地貌几何之美。
2. **权威标准地图与要素制图 (Standard & Regional Maps)**
   - 省级高精交通基础设施网络（如安徽省公路要素图）。
   - 边境河流水网详测与权威标准行政区划（黑龙江省及东极抚远县实测图）。
   - 寰宇图志（欧洲地中海地形水系与意大利要素详图）。

---

## 2. 系统架构与分发逻辑 (Architecture & Decoupling)

本项目采用轻量无依赖的纯前端工程设计，支持 **完全单体离线运行** 与 **云端分发挂载（Cloudflare Pages / R2）** 双模运作。

```text
┌───────────────────────────────────────────────────────────┐
│                      用户浏览器界面                       │
│    index.html · 三屏定点滚轮门户 / 全屏瀑布流 / Deep Zoom  │
└─────────────────────────────┬─────────────────────────────┘
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
     [模式 A: 纯本地独立运行]        [模式 B: 云端 CDN 挂载分发]
     assets/config.js:              assets/config.js:
     assetBaseUrl: ""               assetBaseUrl: "https://<cdn>"
     读取本地 thumbs/ 与 tiles/     读取 Cloudflare Pages / R2
                                    (配置 CORS: Access-Control-Allow-Origin: *)
```

### 目录结构 (Directory Layout)
```text
Cabinet/
├── assets/
│   ├── app.js            # 核心控制器：三屏定点滚轮、瀑布流、DeepZoom 交互
│   ├── config.js         # 站点配置与云基座挂载地址 (assetBaseUrl)
│   ├── style.css         # 极简高密度深色排版系统与响应式样式
│   └── theme.js          # 色彩模式与主题 tokens
├── data/
│   ├── manifest.json     # 8 幅馆藏空间要素全量元数据（尺寸、比例、DZI参数）
│   ├── manifest.js       # 本地离线环境 window.GALLERY_MANIFEST 降级垫片
│   └── themes.js         # 作品主色调与色彩调色板提取数据
├── thumbs/               # 8 幅作品的 640px 预提取 WebP 缩略图
├── tiles/                # WebP 格式多分辨率金字塔切片文件夹
├── vendor/
│   └── openseadragon.min.js  # 高性能深览渲染引擎 (v5.0.1)
├── index.html            # 门户主入口页面
├── 双击浏览画廊.bat       # Windows 本地一键启动脚本
├── .gitignore
├── LICENSE               # MIT 开源授权协议与数据声明
└── README.md
```

---

## 3. 设计哲学 (Design Principles)

本项目遵循严格的 **Anti-AI Slop（反生成式廉价感）** 前端审美与工业手作工艺：
- **拒绝滥用 Emoji 符号**：所有操作图标均采用 1.8~2.0px 高精度几何 SVG 单线矢量符号。
- **克制理性版式**：采用等宽比例字体（`JetBrains Mono`, `Segoe UI`, `PingFang SC`）与 Rijksmuseum 式黑灰微渐变暗调展厅质感。
- **信息高密度与纯净交互**：彻底消除浏览器左下角 URL 漂浮气泡（Native Linkless Navigation），提供整屏微阻尼定点滚轮吸附体验。

---

## 4. 本地使用与部署 (Getting Started)

### 本地直接浏览
1. 克隆或下载本仓库至本地：
   ```bash
   git clone https://github.com/OpenQGIS/Cabinet.git
   cd Cabinet
   ```
2. 在 Windows 环境下直接双击运行：
   ```text
   双击浏览画廊.bat
   ```
   或直接在浏览器中打开 `index.html`。系统内置了 `data/manifest.js` 离线垫片，无需启动 HTTP 服务器即可直接运行全部功能。

### 挂载云端图源（可选优化）
若希望将静态页面部署至 GitHub Pages，而瓦片图床挂载在 Cloudflare R2 / Pages：
1. 打开 `assets/config.js`；
2. 将 `assetBaseUrl` 修改为你的云端存储桶或 Pages 自定义域名：
   ```javascript
   window.CABINET_CONFIG = {
     assetBaseUrl: "https://gallery-core.example.com",
     brand: { ... }
   };
   ```
3. 确保你的云端存储桶或服务配置了 CORS 响应头：
   ```http
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, HEAD, OPTIONS
   ```

---

## 5. 关联生态 (Related Ecosystem)

- **个人原创作品画廊 (Original Works Gallery)**: [OpenQGIS/Gallery](https://github.com/OpenQGIS/Gallery) —— 专注于城市肌理、激光剪纸与高精度空间版式原创设计。
- **空间数据资产基座 (GalleryCore)**: 私有空间瓦片云托管层，支撑全量海量图集的高速分发。

---

## 6. 开源协议与声明 (License & Copyright)

- 本项目代码遵循 [MIT License](LICENSE) 协议开源。
- 馆藏遥感影像与标准地图要素版权归各自官方测绘机构及原平台所有，本项目仅供地理信息爱好者交流、空间构图学术探讨与制图美学参考。
