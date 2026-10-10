# Cabinet · 空间图志图片描述文件规范与 AI 提示词指南
> Image Metadata Specification & AI Prompting Standard for Cabinet

---

## 1. 架构与运行机制 (How It Works)

在 **Cabinet (珍奇柜)** 中，所有入库展品采用 **伴生 Markdown 描述文件** 机制：
1. **存放目录**：所有母版图片与伴生 `.md` 文件均存放在 `pic/` 及其分类子目录下；
2. **同名匹配**：每个图像母版文件（`.tif`, `.png`, `.jpg`, `.jfif`, `.webp`）必须有一个**同名且仅后缀为 `.md`** 的元数据描述文件；
3. **构建流程**：运行 `tools/build_cabinet.py` 时，系统会自动：
   - 扫描 `pic/` 下所有 `.md` 文件；
   - 读取 YAML Frontmatter 元数据与正文解析；
   - 过滤 `status: done` 的作品（忽略 `_template.md` 等模板及草稿）；
   - 提取真实图像母版尺寸并生成 640px 缩略图 (`thumbs/`)；
   - 压缩生成高保真 WebP 下载大图 (`downloads/`)；
   - 编译输出 `data/manifest.json` 与 `data/manifest.js` 离线垫片。

---

## 2. 元数据字段速查表 (Field Reference)

| 字段名称 | 类型 | 必填 | 规范与示例 | 说明 |
| :--- | :--- | :---: | :--- | :--- |
| `id` | String | 是 | `anhui_highway_2023`, `heqacogw8ae_dtn` | 全局唯一 ID。建议小写英文字母、数字与下划线，避免中文或特殊字符。 |
| `title` | String | 是 | `安徽省-公路交通要素图`、`极地冰川与荒漠肌理` | 作品正式展品标题，清晰传达测绘主体或遥感主题。 |
| `category` | String | 是 | 固定填写 `gis`（或 `original`） | 一级分类标识代码。 |
| `categoryName` | String | 是 | 固定填写 `网上GIS图片分享`（或 `个人原创设计`） | 一级分类展示名称。 |
| `subCategory` | String | 是 | `标准地图`, `Verygoogmaps`, `标准地图 · China · 安徽` | 顶部芯片过滤器分类标签，决定聚合分类与筛选规则。 |
| `region` | String | 推荐 | `中国·安徽`, `全球极端地理`, `欧洲·意大利半岛` | 作品所属空间地理单元，遵循从大到小层级。 |
| `source` | String | 推荐 | `安徽省测绘地理信息局`, `Verygoogmaps` | 权威数据源或制图机构。 |
| `author` | String | 可选 | `安徽省测绘地理信息局` | 制图人或机构，不填时系统默认使用 `source`。 |
| `date` | String | 可选 | `2024.03`, `2023`, `2022.11` | 编制、发布或拍摄年月，推荐 `YYYY.MM` 或 `YYYY` 格式。 |
| `scale` | String | 可选 | `1:1,000,000`, `亚米级多光谱反演`, `8开标准图幅` | 测绘比例尺或遥感分辨率。 |
| `reviewNumber`| String | 可选 | `皖S(2023)045号`, `GS(2024)001号` | 权威标准审图号。标准地图必须填写，遥感影像若无则留空。 |
| `tags` | Array | 是 | `[标准地图, 交通要素, 基础设施]` | 检索标签（3~5个），YAML 列表格式。 |
| `download` | Boolean| 是 | `true` 或 `false` | 是否自动生成高保真 WebP 并提供读者下载按钮。 |
| `status` | String | 是 | **`done`** (编辑草稿用 `draft`) | **关键属性**：必须设置为 `done` 构建脚本才会入库。 |

---

## 3. 文案风格指南 (Anti-AI Slop & Academic Precision)

Cabinet 践行 **Anti-AI Slop（反生成式廉价感）** 哲学，正文描述（Markdown 正文部分）应遵循以下写作准则：
- **拒绝空洞抒情**：严禁出现“震撼人心的壮美”、“大自然的鬼斧神工”、“犹如一幅美丽的画卷”等虚浮词藻；
- **聚焦空间要素**：描述具体的地理实体（如断裂构造、褶皱山系、水系网络、干线走廊、冲积扇沉积、层级注记）；
- **客观学术叙事**：采用客观、沉稳的地理学与测绘工程师视角，篇幅精炼（1~3句话，100字以内），高信息密度；
- **精准标定技术语境**：若为多光谱遥感，简要说明波段色彩反演特征与纹理结构；若为标准制图，指出其层级要素覆盖范畴。

---

## 4. 直接喂给 AI 的提示词 (Prompt Template)

可直接复制以下 Prompt 给 AI 模型（如 ChatGPT、Claude、Gemini），并附上地图/图像信息：

```text
你现在是 Cabinet（珍奇柜）空间测绘图志画廊的数据编目专家。
请根据我提供的地图/遥感影像信息，生成标准的伴生 Markdown 描述文件。

【严格规范】
1. 文件名格式：必须与图片母版完全同名，仅后缀为 .md（如 "安徽省-公路交通要素图.md"）。
2. YAML 头部字段要求：
   - id: 小写英数字与下划线，保持简短唯一。
   - title: 正式规范名称。
   - category: 固定为 "gis"
   - categoryName: 固定为 "网上GIS图片分享"
   - subCategory: 若为卫星遥感则为 "Verygoogmaps"；若为标准地图则为 "标准地图" 或 "标准地图 · 区域"
   - region: 地理层级（如 "中国·安徽" 或 "全球自然地理"）
   - source / author: 明确标示测绘机构或摄影来源
   - scale / reviewNumber: 若有则严格填报，无则留空
   - tags: 3-5个高相关度精准关键词列表
   - download: 设为 true
   - status: 设为 done
3. 正文写作要求（严格执行 Anti-AI Slop）：
   - 拒绝“震撼”、“壮观”、“鬼斧神工”等空洞煽情套话；
   - 采用地理信息与空间测绘客观专业口吻，以 1~2 句话提炼其断裂构造、水系脉络、路网骨架或遥感多光谱地表纹理特征；
4. 仅输出最终的 Markdown 代码块，不要附加客套废话。
```

---

## 5. 标准示例参考 (Examples)

### 示例 A：省级标准交通要素地图
**对应文件**：`pic/标准地图/China/安徽/安徽省-公路交通要素图.md`
```markdown
---
id: artwork_d699417c
title: 安徽省-公路交通要素图
category: gis
categoryName: 网上GIS图片分享
subCategory: 标准地图 · China · 安徽
region: 中国·安徽
source: 安徽省测绘地理信息局
author: 安徽省测绘地理信息局
scale: 1:1,000,000
reviewNumber: 皖S(2023)045号
tags:
  - 标准地图
  - China
  - 安徽
  - 交通要素
status: done
download: true
---

全省高精公路交通骨干要素网络，呈现国道、省道与高速公路干线分布及主要枢纽节点。
```

### 示例 B：极地遥感卫星微观影像
**对应文件**：`pic/Verygoogmaps/HEqAcOgW8AE_Dtn.md`
```markdown
---
id: heqacogw8ae_dtn_463ef9b0
title: 极地冰川与荒漠肌理
category: gis
categoryName: 网上GIS图片分享
subCategory: Verygoogmaps
region: 全球极端地理
source: Verygoogmaps
author: Verygoogmaps
scale: 亚米级多光谱反演
tags:
  - Verygoogmaps
  - 遥感影像
  - 极地肌理
status: done
download: true
---

来自 Verygoogmaps 的全球高精卫星遥感影像制图，呈现极端地形与地表纹理的空间色彩分布。
```

### 示例 C：历史与区域经典图志
**对应文件**：`pic/标准地图/Italy/094-095 意大利.md`
```markdown
---
id: 094_095_b18da34a
title: 094-095 意大利
category: gis
categoryName: 网上GIS图片分享
subCategory: 标准地图 · Italy
region: 欧洲·意大利半岛
source: 寰宇经典图志
author: 寰宇经典图志
scale: 经典开本双联张
tags:
  - 标准地图
  - Italy
  - 地中海地形
status: done
download: true
---

欧洲地中海地形水系与亚平宁半岛行政区划经典制图，呈现波河平原与周边山脉构架。
```
