# Changelog · 珍奇柜 (Cabinet)

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 规范，版本号遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/)。

---

## [1.3.16] - 2026-10-03

### 移动端交互与触觉物理升级 (Mobile Tactile Physics & Ambient Wakeup)
- **实装移动端“按下蓄力、离手释放”人机工程学触控机制 (Touch-Down Depress & Touch-Up Morph Release)**：
  - **按压下沉与触觉震动反馈**：
    - 针对移动端手指按压遮挡图标视线的生理特性，监听 `touchstart` 触发按钮轻量弹性下沉（`scale(0.88)`）与透明度微降，并协同硬件触发 10ms 原生短促微震动（`navigator.vibrate(10)`），模拟出真实的机械微动下压触感；
    - 遮挡期间核心 Morph 变形不被提前触发，手指离开屏幕（`touchend` / `touchcancel`）瞬间无缝释放完整矢量变形与旋转，确保用户在视野暴露后清晰捕捉形变全貌。
- **开屏灵动唤醒微动提示 (Ambient Wakeup Pulse)**：
  - 在作品画板（Viewer）打开并完成入场过渡后（约 480ms 时延），自动驱动旋转按钮执行一次微幅机械自唤醒偏转（+12° 瞬时转角并柔和弹回）；
  - 无声告知移动端触屏读者当前底部图标并非静态贴纸，而是具备物理机械生命的活体功能按键。
- **双指缩放被动呼应 (Pinch-to-Morph Feedback)**：
  - 画布手势与底栏重置按钮无缝联动：移动端读者在屏幕任意位置进行双指捏合缩放画面时，底部 `#toolReset` 自动跟随视口比例实时由全图展开框平滑过渡为向内聚焦框，强化界面的实时呼吸感知。

---

## [1.3.15] - 2026-10-03

### 特性与交互升级 (Features & Interaction Enhancements)
- **全功能高精交互式鹰眼图系统与四层防撞避让体系 (High-Precision Interactive Navigator & 4-Tier Collision Dodge)**：
  - **左下角极致纯净锚定与零冗余常驻**：
    - 鹰眼图迁移至左下角（`bottom: 24px; left: 24px;`），彻底移除常驻提示文字，全凭左对齐液态玻璃悬停气泡展示【鹰眼图 O · 拖拽画框缩放 / 单击平移】；
    - 行业通用快捷键 `O`（Overview）与 `M`（Minimap）双键瞬时切换唤出与折叠。
  - **光学反色虚线画框缩放 (Optical Inversion Box-Zoom)**：
    - 鼠标在鹰眼图上拖拽可绘制临时选区框架，采用 `mix-blend-mode: difference` 实时光学反色与 `2px dashed #ffffff` 虚线，无论在深色黑夜图、浅色地图还是高彩卫星图上均呈现超强高反差；
    - 松手后主视口平滑贝塞尔动画无级缩放到选区矩形；小于 6px 位移判定为轻触单击快速平移中心。
  - **全貌状态自适应隐藏视窗 (Auto-Hide Display Region)**：
    - 全貌（Home）缩放状态下，鹰眼图内自动淡出隐藏绿色选区框，还底图以通透纯粹视野；聚焦局部细节时才平滑显现。
  - **液态玻璃收起胶囊 (Liquid Glass Capsule)**：
    - 鹰眼图折叠后呈现同款悬浮液态玻璃药丸胶囊（`blur(20px) saturate(180%)` 与 4 层物理投影），仅在鼠标悬停或聚焦时浮现【按 O 键再次打开鹰眼图】指示框。
  - **四层防碰撞动态避让体系 (4-Tier Collision Avoidance System)**：
    - **中屏/平板错层抬升**：在 `@media (max-width: 1080px)` 下自动向上错层抬高至 `bottom: 84px`，优雅悬浮在底栏上方，维持 14px 黄金视觉净距，彻底消除物理交叠；
    - **移动端窄屏胶囊化隔离**：手机端（`<= 768px`）默认收起为超轻量胶囊，触控尺寸符合 44px 规范并贴合 iOS 底部安全区 `env(safe-area-inset-bottom)`；
    - **动态几何碰撞检测守卫**：JS 实时监听视口尺寸与 DOM 实际间隙，间距不足 20px 时强制激活 `.dodge-toolbar` 自动错层上浮；
    - **全屏模式沉浸自适应**：全屏下空闲时鹰眼图与底栏同步隐退，鼠标移动时平滑浮现。
  - **调试沙盒保留**：
    - 保留 `navigator-demo.html` 作为独立的鹰眼图与避让交互调试沙盒。

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
