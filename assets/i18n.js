/**
 * AtlasLog · 国际化多语言引擎 (i18n Engine)
 * 支持中英文即时无缝切换、本地环境智能探测与持久化记忆
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'atlas_language_preference';

  const UI_STRINGS = {
    zh: {
      siteTitle: 'CABINET · 珍奇柜 · 空间制图与测绘藏录',
      cabinetBrandTitle: 'CABINET · 珍奇柜',
      cabinetBrandSubtitle: '空间制图 · 卫星遥感 · 寰宇图志',
      navAuthorGallery: '创作者个人画廊 (Gallery)',
      statCuratedWorks: '幅策展馆藏',
      statWorksUnit: '幅成果',
      filterTopicLabel: '分类专题:',
      filterAllLabel: '全部',
      filterWide: '横版',
      filterTall: '竖版',
      brandTitle: '<span class="brand-title-main">珍奇柜</span><span class="brand-title-sub"> · Cabinet</span>',
      brandSubtitle: '空间制图 · 卫星遥感 · 寰宇图志',
      navAbout: '关于',
      navCabinet: '珍奇柜',
      navGallery: '聚合总览',
      navAboutTitle: '查看《珍奇柜》案名定位与说明',
      navPortalTitle: '浏览 OpenQGIS 空间体系定位大厅',
      navCabinetTitle: '《珍奇柜 · 空间制图藏录》共享精选库',
      navGalleryTitle: '访问创作者原创个人画廊 (Gallery)',
      navThemeToggle: '切换暗色 / 浅色模式',
      navLangToggle: 'English',
      navLangTitle: 'Switch to English / 切换至英文',
      filterAll: '全部成果',
      actionZoom: '深览',
      actionClose: '退出阅览 (Esc)',
      actionPrev: '上一卷 (←)',
      actionNext: '下一卷 (→)',
      actionToggleInfo: '作品档案与色板 (I)',
      actionZoomIn: '放大 (＋)',
      actionZoomOut: '缩小 (－)',
      actionReset: '全幅还原 (Home / 0)',
      actionRotate: '顺时针旋转90° (R)',
      actionActualSize: '1:1 4K 原生像素 (1)',
      actionFullscreen: '全屏模式 (F)',
      actionShare: '分享画卷 (S)',
      actionShareCopied: '已复制!',
      actionCopy: '复制',
      actionCopyShare: '复制画卷专属直链',
      metaShareTitle: '画卷直链分享',
      shareToastSuccess: '画卷直链已复制到剪贴板',
      navOverviewTitle: '鹰眼图',
      navToggleHint: '折叠/展开鹰眼图 (O)',
      navCloseHint: '收起鹰眼图 (快捷键: O)',
      navOpenHint: '点击或按 O 键打开鹰眼图',
      navTipDragZoom: '按住 <strong>拖拽画框</strong> 缩放 · <strong>单击</strong> 平移',
      navTipKeyOpenPrefix: '按',
      navTipKeyOpenSuffix: '键再次打开鹰眼图',
      metaDrawerTitle: '展品档案与详情',
      metaArtworkTitle: '作品名称',
      metaCategory: '分类归属',
      metaAuthor: '作者 / 出处',
      metaDate: '创作日期',
      metaPhysicalSize: '原生尺寸',
      metaRatio: '构图纵横比',
      metaPaletteTitle: '主色板 · 提取色系 (点击复制 HEX)',
      metaPaletteExtracting: '提取中...',
      metaPaletteEmpty: '暂无色彩数据',
      metaPaletteCopied: '已复制!',
      metaPaletteHint: '点击复制色彩 ',
      metaNotesTitle: '作品说明',
      metaSourceFile: '源文件',
      metaResolution: '原始分辨率',
      metaPyramidLevels: '超高清层级',
      emptyFilter: '当前筛选条件下暂无收录成果',
      langSelectTitle: '切换语言 / Switch Language'
    },
    en: {
      siteTitle: 'CABINET · Curated Spatial Cartography & DeepZoom Archive',
      cabinetBrandTitle: 'CABINET',
      cabinetBrandSubtitle: 'SPATIAL CARTOGRAPHY · SATELLITE REMOTE SENSING · ATLAS',
      navAuthorGallery: 'Personal Gallery',
      statCuratedWorks: 'Curated Works',
      statWorksUnit: 'Works',
      filterTopicLabel: 'Categories:',
      filterAllLabel: 'All',
      filterWide: 'Landscape',
      filterTall: 'Portrait',
      brandTitle: '<span class="brand-title-main">Cabinet</span>',
      brandSubtitle: 'Spatial Cartography · Remote Sensing · Global Atlas',
      navAbout: 'About',
      navCabinet: 'Cabinet',
      navGallery: 'Gallery',
      navAboutTitle: 'About Cabinet & Cartographic Vision',
      navPortalTitle: 'Explore OpenQGIS Geospatial Ecosystem Portal',
      navCabinetTitle: 'Cabinet · Curated Geospatial Library',
      navGalleryTitle: 'Visit Author\'s Personal Gallery',
      navThemeToggle: 'Toggle Dark / Light Theme',
      navLangToggle: '中文',
      navLangTitle: 'Switch to Chinese / 切换至中文',
      filterAll: 'All Works',
      actionZoom: 'Explore',
      actionClose: 'Close Viewer (Esc)',
      actionPrev: 'Previous (←)',
      actionNext: 'Next (→)',
      actionToggleInfo: 'Archive & Palette (I)',
      actionZoomIn: 'Zoom In (＋)',
      actionZoomOut: 'Zoom Out (－)',
      actionReset: 'Reset Extent (Home / 0)',
      actionRotate: 'Rotate 90° (R)',
      actionActualSize: '1:1 4K Physical Pixels (1)',
      actionFullscreen: 'Fullscreen (F)',
      actionShare: 'Share (S)',
      actionShareCopied: 'Copied!',
      actionCopy: 'Copy',
      actionCopyShare: 'Copy direct artwork link',
      metaShareTitle: 'Direct Share Link',
      shareToastSuccess: 'Artwork direct link copied to clipboard',
      navOverviewTitle: 'Overview',
      navToggleHint: 'Toggle Overview (O)',
      navCloseHint: 'Collapse Overview (Shortcut: O)',
      navOpenHint: 'Click or press O to open Overview',
      navTipDragZoom: 'Drag <strong>box</strong> to zoom · <strong>Click</strong> to pan',
      navTipKeyOpenPrefix: 'Press',
      navTipKeyOpenSuffix: 'to reopen overview',
      metaDrawerTitle: 'Artwork Archive & Details',
      metaArtworkTitle: 'Artwork Title',
      metaCategory: 'Category',
      metaAuthor: 'Author / Source',
      metaDate: 'Date Created',
      metaPhysicalSize: 'Physical Size',
      metaRatio: 'Aspect Ratio',
      metaPaletteTitle: 'Dominant Palette (Click to Copy HEX)',
      metaPaletteExtracting: 'Extracting...',
      metaPaletteEmpty: 'No color data',
      metaPaletteCopied: 'Copied!',
      metaPaletteHint: 'Click to copy color ',
      metaNotesTitle: 'Artwork Description',
      metaSourceFile: 'Source File',
      metaResolution: 'Native Resolution',
      metaPyramidLevels: 'DeepZoom Pyramid Levels',
      emptyFilter: 'No artworks found under current filter',
      langSelectTitle: 'Switch Language / 切换语言'
    }
  };

  const ARTWORK_TRANSLATIONS = {
    heqacogw8ae_dtn_463ef9b0: {
      en: {
        title: 'Polar Glacier & Desert Textures',
        categoryName: 'Online GIS Showcase',
        subCategory: 'Verygoogmaps',
        description: 'Global high-precision satellite remote sensing cartography from Verygoogmaps, depicting spatial chromatic distributions of extreme natural landforms and surface textures.',
        author: 'Verygoogmaps'
      }
    },
    hicarxgwmaas7yp_8d90d60e: {
      en: {
        title: 'Plateau Canyon & Fluvial Erosion',
        categoryName: 'Online GIS Showcase',
        subCategory: 'Verygoogmaps',
        description: 'High-resolution multispectral satellite imagery revealing intricate interwoven patterns of faulting river networks and plateau erosion topography.',
        author: 'Verygoogmaps'
      }
    },
    hoayr9uwwaa_m2u_6e0d336d: {
      en: {
        title: 'Mountain Hydrology & Landforms',
        categoryName: 'Online GIS Showcase',
        subCategory: 'Verygoogmaps',
        description: 'High-resolution satellite imagery depicting natural geological color gradients across extreme alpine mountain systems.',
        author: 'Verygoogmaps'
      }
    },
    hrofrs9bmaap6ht_d83bc88b: {
      en: {
        title: 'Desert Sediment & Aeolian Morphology',
        categoryName: 'Online GIS Showcase',
        subCategory: 'Verygoogmaps',
        description: 'Multispectral remote sensing visualization capturing microscopic aeolian landforms and sediment drift across arid terrains.',
        author: 'Verygoogmaps'
      }
    },
    '094_095_b18da34a': {
      en: {
        title: '094-095 Italy Standard Map',
        categoryName: 'National & Regional Maps',
        subCategory: 'Standard Map · Italy',
        description: 'Official standard cartography illustrating Mediterranean topography, hydrography, and administrative zoning of Italy.',
        author: 'Standard Map'
      }
    },
    artwork_d699417c: {
      en: {
        title: 'Anhui Province - Highway Transport Elements',
        categoryName: 'National & Regional Maps',
        subCategory: 'Standard Map · China · Anhui',
        description: 'High-precision provincial standard thematic cartography detailing the arterial highway transportation infrastructure of Anhui Province.',
        author: 'Standard Map'
      }
    },
    artwork_f41f9c9a: {
      en: {
        title: 'Fuyuan County Standard Map',
        categoryName: 'National & Regional Maps',
        subCategory: 'Standard Map · China · Heilongjiang',
        description: 'County-level official cartographic survey of Fuyuan County, the easternmost territory of China, detailing frontier river systems and boundary demarcation.',
        author: 'Standard Map'
      }
    },
    '8_3c808d73': {
      en: {
        title: 'Heilongjiang Standard Map - Basic Elements',
        categoryName: 'National & Regional Maps',
        subCategory: 'Standard Map · China · Heilongjiang',
        description: 'Standard provincial geographic base map (8-K folio edition) outlining Heilongjiang administrative boundaries, settlements, and natural hydrography.',
        author: 'Standard Map'
      }
    },
    shanghai: {
      en: {
        title: 'Shanghai · Dark Fabric',
        categoryName: 'Original Cartography',
        subCategory: 'Urban Morphology',
        description: 'Deconstructing the central urban fabric of Shanghai through spatial morphology and a minimalist black-and-gold aesthetic. The dark substrate represents dense urbanized zones, while subtle tones trace the contours of the Huangpu River, Yangtze River, and the East China Sea. Golden strokes delineate the organic network of historic Puxi and the structured grid of Pudong, highlighting Chongming and Changxing islands.',
        author: 'OpenQGIS',
        physicalSize: '15.0cm x 20.0cm, Poster Ratio',
        tags: ['Urban Fabric', 'Vector Mapping', 'Shanghai', 'Black & Gold', 'Spatial Form']
      }
    },
    city_papercut_14pro: {
      en: {
        title: 'Chengdu Papercut · 14Pro',
        categoryName: 'Original Cartography',
        subCategory: 'Urban Morphology',
        description: 'Distilling the urban density and morphological evolution of Chengdu along its north-south axis. Rendered on warm textured paper, minimalist vector strokes trace the concentric ring roads and radial corridors, highlighting the winding Jinjiang River corridor and Tianfu New Area lakes in an elongated panoramic scroll.',
        author: 'OpenQGIS',
        physicalSize: '9.9 x 21.4cm',
        tags: ['Urban Fabric', 'Chengdu Axis', 'Tianfu New Area', 'Jinjiang Ecology']
      }
    },
    chengdu_papercut_ipad: {
      en: {
        title: 'Chengdu Papercut · iPad Pro',
        categoryName: 'Original Cartography',
        subCategory: 'Laser Papercut',
        description: 'Merging spatial morphology with traditional Chinese papercut aesthetics and laser-engraving craftsmanship. This artwork renders micron-level filigree detailing Chengdu\'s concentric ring roads and historic dual rivers, balancing ancient street networks with modern geometric tension in the southern tech district.',
        author: 'OpenQGIS',
        physicalSize: '20.0cm x 28.0cm (iPad Ratio)',
        tags: ['Laser Papercut', 'Morphology', 'Chengdu', 'Precision Craft', 'Hydrology & Roads']
      }
    },
    layout_pattern_02: {
      en: {
        title: 'Layout Paradigm 02 · Spatial Schema',
        categoryName: 'Original Cartography',
        subCategory: 'Spatial Schema',
        description: 'A cartographic layout study rooted in spatial syntax and modern grid composition principles. Using a calibrated modular grid system, this specimen explores dynamic balance between primary map extents, overviews, symbology, and balanced negative space.',
        author: 'OpenQGIS',
        physicalSize: '21.0cm x 29.7cm (A4)',
        tags: ['Layout Design', 'Spatial Schema', 'Grid System', 'Minimalist Mapping']
      }
    },
    jinjiang_greenway_section: {
      en: {
        title: 'Jinjiang Greenway Section · Huanglongxi',
        categoryName: 'Original Cartography',
        subCategory: 'Greenway Elevation',
        description: 'An architectural and environmental section elevation visualizing the ecological corridor of the Jinjiang Greenway through historic Huanglongxi. Combining high-resolution DEM data and spatial cross-section algorithms to portray riverbed gradients, riparian forests, and heritage settlement typologies.',
        author: 'OpenQGIS',
        physicalSize: '120.0cm x 30.0cm, Panorama Scroll',
        tags: ['Greenway Elevation', 'Section Profile', 'Huanglongxi', 'DEM', 'Riparian Ecology']
      }
    },
    pinglu_canal: {
      en: {
        title: 'Pinglu Canal · Cyberpunk Dark Fabric',
        categoryName: 'Original Cartography',
        subCategory: 'Engineering & Morphology',
        description: 'A dark-mode cyberpunk GIS visualization of the Pinglu Canal project in Guangxi. Over a deep black terrain substrate, glowing amber and golden contour lines delineate the rugged mountain ridges and gorges. A prominent crimson corridor traces the primary canal navigation route, highlighted with zebra-striped patterning across the active excavation segments.',
        author: 'OpenQGIS',
        physicalSize: '15.0cm x 20.0cm, Panorama Scroll',
        tags: ['Data Visualization', 'Topographic Contours', 'Dark Aesthetics', 'Glowing Vector', 'Pinglu Canal']
      }
    }
  };

  const SUBCATEGORY_TRANSLATIONS = {
    'Verygoogmaps': { zh: 'Verygoogmaps', en: 'Verygoogmaps' },
    '标准地图 · Italy': { zh: '标准地图 · Italy', en: 'Standard Map · Italy' },
    '标准地图 · China · 安徽': { zh: '标准地图 · China · 安徽', en: 'Standard Map · China · Anhui' },
    '标准地图 · China · 黑龙江': { zh: '标准地图 · China · 黑龙江', en: 'Standard Map · China · Heilongjiang' }
  };

  function translateSubcategory(sub) {
    if (!sub) return '';
    if (currentLang === 'zh') return sub;
    if (SUBCATEGORY_TRANSLATIONS[sub] && SUBCATEGORY_TRANSLATIONS[sub][currentLang]) {
      return SUBCATEGORY_TRANSLATIONS[sub][currentLang];
    }
    return String(sub)
      .replace(/标准地图/g, 'Standard Map')
      .replace(/安徽/g, 'Anhui')
      .replace(/黑龙江/g, 'Heilongjiang');
  }

  // Determine initial language:
  // 1. URL search param (?lang=en or ?lang=zh)
  // 2. localStorage
  // 3. navigator.language (if zh -> zh, otherwise en)
  function detectInitialLanguage() {
    if (typeof window === 'undefined') return 'zh';
    try {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang');
      if (urlLang && (urlLang === 'zh' || urlLang === 'en')) {
        return urlLang;
      }

      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (saved && (saved === 'zh' || saved === 'en')) {
        return saved;
      }

      const browserLang = (typeof navigator !== 'undefined' ? (navigator.language || navigator.userLanguage || '') : '').toLowerCase();
      if (browserLang.startsWith('zh')) {
        return 'zh';
      }
      return 'en';
    } catch (e) {
      return 'zh';
    }
  }

  let currentLang = detectInitialLanguage();

  function setLanguage(lang) {
    if (lang !== 'zh' && lang !== 'en') return;
    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = (lang === 'zh' ? 'zh-CN' : 'en');
    }
    
    // Update all elements with data-i18n
    updateDOMTranslations();

    // Dispatch custom event for app.js to re-render dynamic content
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: currentLang } }));
    }
  }

  function getLanguage() {
    return currentLang;
  }

  function toggleLanguage() {
    setLanguage(currentLang === 'zh' ? 'en' : 'zh');
  }

  function t(key) {
    const dict = UI_STRINGS[currentLang] || UI_STRINGS.zh;
    return dict[key] || UI_STRINGS.zh[key] || key;
  }

  function getLocalizedItem(item) {
    if (!item) return item;
    if (currentLang === 'zh') return item;

    const translation = (ARTWORK_TRANSLATIONS[item.id] && ARTWORK_TRANSLATIONS[item.id].en) || {};
    return Object.assign({}, item, {
      title: translation.title || item.title,
      categoryName: translation.categoryName || item.categoryName,
      subCategory: translation.subCategory || translateSubcategory(item.subCategory),
      description: translation.description || item.description,
      physicalSize: translation.physicalSize || item.physicalSize,
      tags: translation.tags || item.tags
    });
  }

  function updateDOMTranslations() {
    if (typeof document === 'undefined') return;

    // 1. Title
    document.title = t('siteTitle');

    // 2. data-i18n text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = t(key);
      if (text) el.textContent = text;
    });

    // 3. data-i18n-html for elements with innerHTML
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const html = t(key);
      if (html) el.innerHTML = html;
    });

    // 4. data-i18n-title for attributes
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const title = t(key);
      if (title) el.title = title;
    });

    // 5. Update Lang toggle indicators
    const currentLangLabel = document.getElementById('currentLangLabel');
    if (currentLangLabel) {
      currentLangLabel.textContent = currentLang === 'zh' ? '中' : 'EN';
    }
    const headerLangText = document.getElementById('headerLangText');
    if (headerLangText) {
      headerLangText.textContent = currentLang === 'zh' ? 'EN' : '中';
    }
    const langBtn = document.getElementById('btnLangDropdown') || document.getElementById('btnToggleLang') || document.getElementById('btnHeaderLang');
    if (langBtn) {
      langBtn.title = t('langSelectTitle');
    }
    document.querySelectorAll('.lang-dropdown-item').forEach(item => {
      const itemLang = item.getAttribute('data-lang');
      item.classList.toggle('active', itemLang === currentLang);
    });
  }

  const SUPPORTED_LANGUAGES = [
    { code: 'zh', name: '简体中文', short: '中' },
    { code: 'en', name: 'English', short: 'EN' }
  ];

  // Pre-set document.documentElement.lang before paint
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = (currentLang === 'zh' ? 'zh-CN' : 'en');
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateDOMTranslations);
    } else {
      updateDOMTranslations();
    }
  }

  const atlasI18nObj = {
    detect: detectInitialLanguage,
    getLang: getLanguage,
    setLang: setLanguage,
    toggle: toggleLanguage,
    t: t,
    getItem: getLocalizedItem,
    translateSub: translateSubcategory,
    updateDOM: updateDOMTranslations,
    languages: SUPPORTED_LANGUAGES,
    STRINGS: UI_STRINGS
  };

  if (typeof window !== 'undefined') {
    window.AtlasI18n = atlasI18nObj;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = atlasI18nObj;
  }
})();
