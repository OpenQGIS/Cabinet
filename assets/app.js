/**
 * CABINET · 珍奇柜 - 双层画廊与 4K 深览交互应用 (v2.0)
 * Level 1: 首页一整屏 5 扇大卡片 (100vh 免上下滚动)
 * Level 2: Sub 分类专属页面 (大卡片瀑布流 + OpenSeadragon 视口)
 */

(function () {
  'use strict';

  let galleryItems = [];
  let currentViewerItem = null;
  let osdViewer = null;
  let activeSubCategory = null;
  let activeDimFilter = 'all';

  // --- 英文短 Slug 与中文专题双向映射 ---
  const SLUG_MAP = {
    'standard': '标准地图',
    'terrain': '地形与地貌',
    'dataviz': '数据可视化',
    'hydrology': '水系与海洋',
    'art': '艺术与插画'
  };

  const REVERSE_SLUG_MAP = {
    '标准地图': 'standard',
    '地形与地貌': 'terrain',
    '数据可视化': 'dataviz',
    '水系与海洋': 'hydrology',
    '艺术与插画': 'art'
  };

  function toSlug(key) {
    if (!key) return '';
    if (SLUG_MAP[key]) return key;
    if (REVERSE_SLUG_MAP[key]) return REVERSE_SLUG_MAP[key];
    if (key.includes('可视')) return 'dataviz';
    if (key.includes('标准')) return 'standard';
    if (key.includes('地形')) return 'terrain';
    if (key.includes('水系') || key.includes('海洋')) return 'hydrology';
    if (key.includes('艺术') || key.includes('插画')) return 'art';
    return key.toLowerCase();
  }

  function toTitle(slug) {
    return SLUG_MAP[slug] || slug;
  }

  function matchesSubSlug(item, slug) {
    const itemSub = (item.subCategory || '').trim();
    if (slug === 'dataviz') return itemSub.includes('可视') || itemSub.includes('数据');
    if (slug === 'standard') return itemSub.includes('标准') || itemSub.includes('standard');
    if (slug === 'terrain') return itemSub.includes('地形') || itemSub.includes('Verygoogmaps') || itemSub.includes('terrain');
    if (slug === 'hydrology') return itemSub.includes('水系') || itemSub.includes('海洋') || itemSub.includes('hydrology');
    if (slug === 'art') return itemSub.includes('艺术') || itemSub.includes('插画') || itemSub.includes('art');
    return itemSub.includes(slug);
  }

  // --- 初始化流程 ---
  async function init() {
    // 启用 OpenSeadragon 对 WebP 瓦片格式的支持
    if (typeof OpenSeadragon !== 'undefined' && OpenSeadragon.setImageFormatsSupported) {
      OpenSeadragon.setImageFormatsSupported({ webp: true });
    }

    bindAntiTheft();
    bindThemeToggle();
    bindViewerModalEvents();

    const preloadedManifest = window.CABINET_MANIFEST || window.GALLERY_MANIFEST;
    if (preloadedManifest && Array.isArray(preloadedManifest)) {
      setupData(preloadedManifest);
    } else {
      try {
        const res = await fetch('data/manifest.json');
        if (!res.ok) throw new Error('Failed to load data/manifest.json');
        const data = await res.json();
        setupData(data);
      } catch (err) {
        console.error('[Cabinet] Manifest load error:', err);
      }
    }

    initRoutingAndCards();
    initHoverPeek();
  }

  function setupData(rawItems) {
    const config = window.CABINET_CONFIG || {};
    const assetBase = (config.assetBaseUrl || '').replace(/\/+$/, '');

    galleryItems = rawItems.map((item, idx) => {
      let thumbUrl = item.thumb;
      if (assetBase && thumbUrl && !thumbUrl.startsWith('http')) {
        thumbUrl = assetBase + '/' + thumbUrl.replace(/^\/+/, '');
      }

      let tileSourceUrl = item.tileSourceUrl || item.tileSource || (item.id ? 'tiles/' + item.id + '.dzi' : '');
      if (assetBase && tileSourceUrl && !tileSourceUrl.startsWith('http')) {
        tileSourceUrl = assetBase + '/' + tileSourceUrl.replace(/^\/+/, '');
      }

      let dziSource = null;
      if (item.dzi && item.dzi.Image) {
        dziSource = JSON.parse(JSON.stringify(item.dzi));
        let tileFilesUrl = dziSource.Image.Url || (item.id ? 'tiles/' + item.id + '_files/' : '');
        if (assetBase && tileFilesUrl && !tileFilesUrl.startsWith('http')) {
          tileFilesUrl = assetBase + '/' + tileFilesUrl.replace(/^\/+/, '');
        }
        dziSource.Image.Url = tileFilesUrl;
      }

      return {
        ...item,
        index: idx,
        thumbUrl: thumbUrl,
        tileSourceUrl: tileSourceUrl,
        dziSource: dziSource,
        aspectRatio: item.aspectRatio || (item.width && item.height ? (item.width / item.height) : 1.33)
      };
    });

    // 更新顶栏总馆藏数量
    const totalEl = document.getElementById('collectionCount');
    if (totalEl) totalEl.textContent = galleryItems.length;

    // 同步更新首页 5 扇分类卡片上的实际作品数
    const matrixCards = document.querySelectorAll('.matrix-card[data-sub]');
    matrixCards.forEach(card => {
      const slug = toSlug(card.dataset.sub);
      const countSpan = card.querySelector('.matrix-count');
      if (slug && countSpan) {
        const c = galleryItems.filter(it => matchesSubSlug(it, slug)).length;
        countSpan.textContent = `${c} 幅馆藏`;
      }
    });
  }

  // --- 路由与卡片事件 ---
  function initRoutingAndCards() {
    // 1. 首页 5 扇免滚动大卡片点击监听
    const matrixCards = document.querySelectorAll('.matrix-card');
    matrixCards.forEach(card => {
      card.addEventListener('click', () => {
        const sub = card.dataset.sub;
        if (sub) navigateToSub(sub);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const sub = card.dataset.sub;
          if (sub) navigateToSub(sub);
        }
      });
    });

    // 2. 分类专属页面的 [返回展区大厅] 按钮
    const backBtn = document.getElementById('btnBackMatrix');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        navigateToMatrix();
      });
    }

    // 3. 画幅比例过滤（全部 / 横幅 / 竖幅）
    const dimGroup = document.getElementById('galleryDimChips');
    if (dimGroup) {
      dimGroup.querySelectorAll('.dim-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          dimGroup.querySelectorAll('.dim-chip').forEach(c => c.classList.remove('active'));
          btn.classList.add('active');
          activeDimFilter = btn.dataset.dim || 'all';
          if (activeSubCategory) renderSubWaterfall(activeSubCategory);
        });
      });
    }

    // 4. 监听浏览器前进 / 后退 popstate
    window.addEventListener('popstate', () => {
      const p = new URLSearchParams(window.location.search);
      const s = p.get('sub');
      if (s) {
        navigateToSub(s, false);
      } else {
        navigateToMatrix(false);
      }
    });

    // 5. 首次载入根据当前 URL 路由
    const urlParams = new URLSearchParams(window.location.search);
    const initialSub = urlParams.get('sub');
    if (initialSub) {
      navigateToSub(initialSub, false);
    } else {
      navigateToMatrix(false);
    }

    const openId = urlParams.get('open');
    if (openId) {
      const target = galleryItems.find(i => i.id === openId);
      if (target) {
        setTimeout(() => openViewerByItem(target), 200);
      }
    }
  }

  // --- 导航：跳转进入分类专属页面 ---
  function navigateToSub(subKey, pushState = true) {
    const slug = toSlug(subKey);
    const title = toTitle(slug);
    activeSubCategory = slug;
    document.body.dataset.page = 'gallery';

    const matrixView = document.getElementById('matrixView');
    const galleryView = document.getElementById('galleryView');
    if (matrixView) matrixView.style.display = 'none';
    if (galleryView) galleryView.style.display = 'block';

    const titleEl = document.getElementById('gallerySubTitle');
    if (titleEl) titleEl.textContent = title;

    if (pushState) {
      const newUrl = window.location.pathname + '?sub=' + encodeURIComponent(slug);
      window.history.pushState({ sub: slug }, '', newUrl);
    }

    renderSubWaterfall(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- 导航：返回一整页 5 扇免滚动卡片 ---
  function navigateToMatrix(pushState = true) {
    activeSubCategory = null;
    document.body.dataset.page = 'matrix';

    const matrixView = document.getElementById('matrixView');
    const galleryView = document.getElementById('galleryView');
    if (matrixView) matrixView.style.display = 'flex';
    if (galleryView) galleryView.style.display = 'none';

    if (pushState) {
      const newUrl = window.location.pathname;
      window.history.pushState({}, '', newUrl);
    }
  }

  // --- 渲染分类专属画廊的瀑布流卡片 ---
  function renderSubWaterfall(subName) {
    const gridEl = document.getElementById('galleryWaterfallGrid');
    const countEl = document.getElementById('gallerySubCount');
    if (!gridEl) return;

    gridEl.innerHTML = '';

    // 英文短 Slug / 中文双向筛选逻辑
    const slug = toSlug(subName);
    const items = galleryItems.filter(item => {
      if (!matchesSubSlug(item, slug)) return false;

      // 比例筛选
      if (activeDimFilter === 'wide') return item.aspectRatio >= 1.15;
      if (activeDimFilter === 'tall') return item.aspectRatio < 0.9;
      return true;
    });

    if (countEl) countEl.textContent = `${items.length} 幅馆藏`;

    if (items.length === 0) {
      gridEl.innerHTML = '<div style="grid-column: 1/-1; padding: 60px; text-align: center; color: #718096;">暂无该比例画幅藏品</div>';
      return;
    }

    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'waterfall-card';
      card.tabIndex = 0;

      let wrapClass = 'waterfall-thumb-wrap';
      if (item.aspectRatio > 1.25) wrapClass += ' wide';
      else if (item.aspectRatio < 0.85) wrapClass += ' tall';
      else wrapClass += ' square';

      const tagsList = (item.tags && Array.isArray(item.tags)) ? item.tags : [];
      const tagsHtml = tagsList.map(t => `<span class="waterfall-tag-pill">${escapeHtml(t)}</span>`).join('');

      card.innerHTML = `
        <div class="${wrapClass}">
          <img src="${escapeHtml(item.thumbUrl)}" alt="${escapeHtml(item.title)}" loading="eager" />
        </div>
        <div class="waterfall-info">
          <h3 class="waterfall-title">${escapeHtml(item.title)}</h3>
          ${tagsHtml ? `<div class="waterfall-tags-row">${tagsHtml}</div>` : ''}
        </div>
      `;

      card.addEventListener('click', () => {
        openViewerByItem(item);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openViewerByItem(item);
        }
      });

      gridEl.appendChild(card);
    });
  }

  // --- 全屏 4K Deep Zoom 视口 (委托给独立模块 assets/viewer.js) ---
  function openViewerByItem(item) {
    if (window.CabinetViewer && typeof window.CabinetViewer.open === 'function') {
      window.CabinetViewer.open(item);
    }
  }

  function bindViewerModalEvents() {
    if (window.CabinetViewer && typeof window.CabinetViewer.init === 'function') {
      window.CabinetViewer.init(getFilteredSubItems);
    }
  }

  function getFilteredSubItems() {
    if (!activeSubCategory) return galleryItems;
    const slug = toSlug(activeSubCategory);
    return galleryItems.filter(item => matchesSubSlug(item, slug));
  }

  // --- 主题切换 (同时绑定顶栏与大图视口内的主题按钮) ---
  function bindThemeToggle() {
    const btns = document.querySelectorAll('.theme-toggle-btn');
    if (!btns.length) return;

    const savedTheme = localStorage.getItem('cabinet_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const target = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', target);
        localStorage.setItem('cabinet_theme', target);
      });
    });
  }

  // --- 卡片悬浮触发预览 (Hover Peek) ---
  function initHoverPeek() {
    const cards = document.querySelectorAll('.matrix-card');
    cards.forEach(card => {
      const sub = card.dataset.sub;
      if (!sub) return;

      const slug = toSlug(sub);
      const matchingItems = galleryItems.filter(item => matchesSubSlug(item, slug));

      if (matchingItems.length <= 1) return;

      const bgContainer = card.querySelector('.matrix-card-bg');
      if (!bgContainer) return;

      const baseImg = bgContainer.querySelector('.matrix-bg-img');
      if (!baseImg) return;

      const thumbUrls = matchingItems.map(it => it.thumbUrl).filter(Boolean);
      const defaultThumb = baseImg.getAttribute('src');

      thumbUrls.forEach(url => {
        const preload = new Image();
        preload.src = url;
      });

      let frontImg = bgContainer.querySelector('.matrix-bg-front');
      if (!frontImg) {
        frontImg = document.createElement('img');
        frontImg.className = 'matrix-bg-front';
        frontImg.alt = sub;
        bgContainer.insertBefore(frontImg, bgContainer.querySelector('.matrix-scrim'));
      }

      let hoverTimer = null;
      let cycleTimer = null;
      let currentIndex = 0;

      card.addEventListener('mouseenter', () => {
        hoverTimer = setTimeout(() => {
          cycleTimer = setInterval(() => {
            currentIndex = (currentIndex + 1) % thumbUrls.length;
            const nextUrl = thumbUrls[currentIndex];

            frontImg.src = nextUrl;
            frontImg.style.opacity = '1';

            setTimeout(() => {
              baseImg.src = nextUrl;
              frontImg.style.opacity = '0';
            }, 750);
          }, 2400);
        }, 500);
      });

      card.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimer);
        clearInterval(cycleTimer);
        if (frontImg) frontImg.style.opacity = '0';
        setTimeout(() => {
          baseImg.src = defaultThumb;
          currentIndex = 0;
        }, 300);
      });
    });
  }

  function bindAntiTheft() {
    document.addEventListener('contextmenu', (e) => {
      if (e.target.tagName === 'IMG' || e.target.closest('#openseadragon-view')) {
        e.preventDefault();
      }
    });
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
