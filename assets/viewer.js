/**
 * CABINET · 珍奇柜 - DeepZoom 视口与图籍档案抽屉模块 (viewer.js)
 * 独立拆分模块：负责 OpenSeadragon 视口、主色板提取与结构化档案渲染
 */
(function () {
  'use strict';

  let osdViewer = null;
  let currentViewerItem = null;
  let getSubItemsFn = () => [];

  function initViewer(getSubItemsCallback) {
    if (typeof getSubItemsCallback === 'function') {
      getSubItemsFn = getSubItemsCallback;
    }
    if (typeof OpenSeadragon !== 'undefined' && OpenSeadragon.setImageFormatsSupported) {
      OpenSeadragon.setImageFormatsSupported({ webp: true });
    }
    bindViewerEvents();
  }

  function openViewerByItem(item) {
    if (!item) return;
    currentViewerItem = item;

    const modal = document.getElementById('viewerModal');
    const titleEl = document.getElementById('viewerTitle');
    const dimsEl = document.getElementById('viewerDims');
    const loader = document.getElementById('viewerLoader');
    if (!modal) return;

    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('active', 'open');
    document.body.style.overflow = 'hidden';

    if (titleEl) titleEl.textContent = item.title;
    if (dimsEl) {
      dimsEl.textContent = (item.width && item.height) ? `${item.width} × ${item.height} px` : '';
    }
    if (loader) loader.style.display = 'none';

    updateViewerMeta(item);
    mountOpenSeadragon(item);
  }

  function mountOpenSeadragon(item) {
    if (osdViewer) {
      try { osdViewer.destroy(); } catch (e) {}
      osdViewer = null;
    }

    const container = document.getElementById('openseadragon-view');
    if (!container) return;
    container.innerHTML = '';

    const fallbackImg = document.createElement('img');
    fallbackImg.id = 'osdFallbackImage';
    fallbackImg.src = item.animatedUrl || item.thumbUrl;
    fallbackImg.alt = item.title;
    fallbackImg.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);max-width:92%;max-height:88%;object-fit:contain;border-radius:4px;box-shadow:0 25px 60px rgba(0,0,0,0.85);transition:opacity 0.35s ease;z-index:1;pointer-events:none;';
    container.appendChild(fallbackImg);

    // 针对多帧动态图（GIF / Animated WebP）：直接播放全尺寸动态帧，不使用静态瓦片覆盖
    if (item.isAnimated || item.animatedUrl) {
      let scale = 1, tx = 0, ty = 0, dragging = false, sx = 0, sy = 0;
      const badge = document.getElementById('toolZoomBadge');
      const applyTransform = () => {
        fallbackImg.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${scale})`;
        if (badge) badge.textContent = Math.round(scale * 100) + '%';
      };
      applyTransform();
      container.onwheel = (e) => {
        e.preventDefault();
        scale = Math.min(5, Math.max(0.5, scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15)));
        applyTransform();
      };
      container.onmousedown = (e) => { dragging = true; sx = e.clientX - tx; sy = e.clientY - ty; };
      window.onmousemove = (e) => { if (!dragging) return; tx = e.clientX - sx; ty = e.clientY - sy; applyTransform(); };
      window.onmouseup = () => { dragging = false; };
      return;
    }
    container.onwheel = null;
    container.onmousedown = null;

    if (typeof OpenSeadragon === 'undefined') return;
    if (OpenSeadragon.setImageFormatsSupported) {
      OpenSeadragon.setImageFormatsSupported({ webp: true });
    }

    const ar = item.aspectRatio || (item.width && item.height ? item.width / item.height : 1.33);
    const maxNav = 180;
    const navW = ar >= 1 ? maxNav : Math.max(64, Math.round(maxNav * ar));
    const navH = ar >= 1 ? Math.max(64, Math.round(maxNav / ar)) : maxNav;

    try {
      const primaryTileSource = item.dziSource || item.tileSourceUrl || { type: 'image', url: item.thumbUrl };
      osdViewer = OpenSeadragon({
        id: 'openseadragon-view',
        prefixUrl: 'vendor/images/',
        tileSources: primaryTileSource,
        showNavigationControl: false,
        showNavigator: true,
        navigatorPosition: 'BOTTOM_LEFT',
        navigatorAutoResize: false,
        navigatorWidth: navW,
        navigatorHeight: navH,
        animationTime: 0.45,
        blendTime: 0.2,
        constrainDuringPan: true,
        maxZoomPixelRatio: 3.0,
        minZoomImageRatio: 0.8,
        visibilityRatio: 0.95,
        gestureSettingsMouse: { clickToZoom: false, dblClickToZoom: true },
        gestureSettingsTouch: { pinchRotate: false }
      });

      const updateZoom = () => {
        const badge = document.getElementById('toolZoomBadge');
        if (!badge || !osdViewer || !osdViewer.viewport) return;
        try {
          const z1 = osdViewer.viewport.imageToViewportZoom(1);
          if (z1 > 0) {
            badge.textContent = Math.round((osdViewer.viewport.getZoom() / z1) * 100) + '%';
          }
        } catch (e) {}
      };

      osdViewer.addHandler('open', () => {
        updateZoom();
        if (fallbackImg) fallbackImg.style.opacity = '0';
        setTimeout(() => { if (fallbackImg) fallbackImg.remove(); }, 360);
      });
      osdViewer.addHandler('zoom', updateZoom);
      osdViewer.addHandler('animation', updateZoom);
      osdViewer.addHandler('open-failed', () => {
        if (fallbackImg) fallbackImg.style.opacity = '1';
      });
    } catch (err) {
      console.warn('[Cabinet] OSD init error:', err);
    }
  }

  function updateViewerMeta(item) {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val || '-';
    };

    setVal('metaTitle', item.title);
    const catParts = [item.subCategory, item.region].filter(Boolean);
    setVal('metaCategory', catParts.join(' · ') || '空间制图馆藏');
    setVal('metaAuthor', item.author || item.source || '空间制图精选');

    // 原始来源网址跳转接口 (支持 item.sourceUrl / item.url)
    const urlBox = document.getElementById('metaSourceUrlBox');
    const urlLink = document.getElementById('metaSourceLink');
    const urlText = document.getElementById('metaSourceLinkText');
    const rawUrl = (item.sourceUrl || item.url || '').trim();
    if (urlBox && urlLink) {
      if (rawUrl && /^https?:\/\//i.test(rawUrl)) {
        urlLink.href = rawUrl;
        let host = rawUrl.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/+$/, '');
        if (host.length > 34) host = host.slice(0, 34) + '…';
        if (urlText) urlText.textContent = host;
        urlBox.style.display = 'flex';
      } else {
        urlBox.style.display = 'none';
      }
    }

    setVal('metaScale', item.scale || '全幅专题');
    setVal('metaResolution', (item.width && item.height) ? `${item.width} × ${item.height} px` : '-');
    const ar = item.aspectRatio || (item.width && item.height ? (item.width / item.height).toFixed(2) : '-');
    setVal('metaAspect', `${ar} : 1`);
    const maxLvl = item.maxLevel || (item.width && item.height ? Math.ceil(Math.log2(Math.max(item.width, item.height))) : 12);
    setVal('metaLevels', `Level 0 ~ ${maxLvl} (${maxLvl + 1} 级瓦片金字塔)`);

    const tagsRow = document.getElementById('metaDrawerTags');
    const tagsBox = document.getElementById('metaTagsBox');
    if (tagsRow) {
      tagsRow.innerHTML = '';
      const tags = Array.isArray(item.tags) ? item.tags : [];
      if (tags.length > 0) {
        if (tagsBox) tagsBox.style.display = 'flex';
        tags.forEach(t => {
          const span = document.createElement('span');
          span.className = 'waterfall-tag-pill';
          span.textContent = t;
          tagsRow.appendChild(span);
        });
      } else if (tagsBox) {
        tagsBox.style.display = 'none';
      }
    }
  }

  function closeViewer() {
    const modal = document.getElementById('viewerModal');
    if (modal) {
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('active', 'open');
    }
    document.body.style.overflow = document.body.dataset.page === 'gallery' ? 'auto' : 'hidden';
    if (osdViewer) {
      try { osdViewer.destroy(); } catch (e) {}
      osdViewer = null;
    }
    currentViewerItem = null;
  }

  async function downloadCurrentArtwork() {
    if (!currentViewerItem) return;
    const item = currentViewerItem;
    const safeName = (item.title || item.id || 'map').replace(/[\\/:*?"<>|]/g, '_');

    // 1. 动态图或已有直接下载源：直接触发下载
    if (item.animatedUrl || (item.download && item.download.url)) {
      const a = document.createElement('a');
      a.href = item.animatedUrl || item.download.url;
      a.download = `${safeName}.webp`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }

    // 2. 从 DeepZoom 最高可用层级实时拼接导出全幅高清原图
    const w = item.width || 1920;
    const h = item.height || 1080;
    const tileSize = item.tileSize || 256;
    const overlap = item.overlap !== undefined ? item.overlap : 1;
    const maxLvl = item.maxLevel || Math.ceil(Math.log2(Math.max(w, h)));

    // 限制浏览器 Canvas 安全上限 (8192px)，大多数馆藏均为 1:1 原始最高层级
    let targetLvl = maxLvl;
    while (targetLvl > 0) {
      const s = Math.pow(0.5, maxLvl - targetLvl);
      if (Math.ceil(w * s) <= 8192 && Math.ceil(h * s) <= 8192) break;
      targetLvl--;
    }

    const scale = Math.pow(0.5, maxLvl - targetLvl);
    const lvlW = Math.max(1, Math.ceil(w * scale));
    const lvlH = Math.max(1, Math.ceil(h * scale));
    const cols = Math.ceil(lvlW / tileSize);
    const rows = Math.ceil(lvlH / tileSize);
    const baseDir = (item.dziSource && item.dziSource.Image && item.dziSource.Image.Url)
      ? item.dziSource.Image.Url.replace(/\/+$/, '')
      : `tiles/${item.id}_files`;

    const btnTop = document.getElementById('btnDownloadArtwork');
    if (btnTop) btnTop.style.opacity = '0.5';

    try {
      const canvas = document.createElement('canvas');
      canvas.width = lvlW;
      canvas.height = lvlH;
      const ctx = canvas.getContext('2d');

      const tasks = [];
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          tasks.push(new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              const dx = c * tileSize - (c > 0 ? overlap : 0);
              const dy = r * tileSize - (r > 0 ? overlap : 0);
              ctx.drawImage(img, dx, dy);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = `${baseDir}/${targetLvl}/${c}_${r}.webp`;
          }));
        }
      }
      await Promise.all(tasks);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${safeName}.webp`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 3000);
      }, 'image/webp', 0.94);
    } finally {
      if (btnTop) btnTop.style.opacity = '';
    }
  }

  function stepArtwork(delta) {
    if (!currentViewerItem) return;
    const list = getSubItemsFn();
    if (!list || !list.length) return;
    const idx = list.findIndex(i => i.id === currentViewerItem.id);
    const nextIdx = (idx + delta + list.length) % list.length;
    openViewerByItem(list[nextIdx]);
  }

  function bindViewerEvents() {
    const on = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', fn);
    };

    on('btnCloseViewer', closeViewer);
    on('viewerBackdrop', closeViewer);
    on('btnPrevArtwork', () => stepArtwork(-1));
    on('btnNextArtwork', () => stepArtwork(1));
    on('btnEdgePrev', () => stepArtwork(-1));
    on('btnEdgeNext', () => stepArtwork(1));

    const drawer = document.getElementById('viewerDrawer');
    const btnDrawer = document.getElementById('btnToggleDrawer');
    const toggleDrawer = () => {
      if (!drawer) return;
      const open = drawer.classList.toggle('open');
      drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (btnDrawer) btnDrawer.classList.toggle('active', open);
    };
    on('btnToggleDrawer', toggleDrawer);
    on('btnCloseDrawer', () => {
      if (drawer) {
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
      }
      if (btnDrawer) btnDrawer.classList.remove('active');
    });

    const toggleFs = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    };
    on('btnFullscreen', toggleFs);
    on('toolFullscreen', toggleFs);
    on('btnDownloadArtwork', downloadCurrentArtwork);
    on('toolDownload', downloadCurrentArtwork);

    on('toolActualSize', () => {
      if (osdViewer && osdViewer.viewport) {
        osdViewer.viewport.zoomTo(osdViewer.viewport.imageToViewportZoom(1));
        osdViewer.viewport.applyConstraints();
      }
    });
    on('toolZoomIn', () => {
      if (osdViewer && osdViewer.viewport) {
        osdViewer.viewport.zoomBy(1.35);
        osdViewer.viewport.applyConstraints();
      }
    });
    on('toolZoomOut', () => {
      if (osdViewer && osdViewer.viewport) {
        osdViewer.viewport.zoomBy(1 / 1.35);
        osdViewer.viewport.applyConstraints();
      }
    });
    on('toolReset', () => {
      if (osdViewer && osdViewer.viewport) osdViewer.viewport.goHome();
    });
    on('toolRotate', () => {
      if (osdViewer && osdViewer.viewport) {
        osdViewer.viewport.setRotation((osdViewer.viewport.getRotation() + 90) % 360);
      }
    });

    window.addEventListener('keydown', (e) => {
      const modal = document.getElementById('viewerModal');
      if (!modal || !modal.classList.contains('open')) return;
      if (e.key === 'Escape') closeViewer();
      else if (e.key === 'ArrowLeft') stepArtwork(-1);
      else if (e.key === 'ArrowRight') stepArtwork(1);
      else if (e.key === 'i' || e.key === 'I') toggleDrawer();
      else if (e.key === 'f' || e.key === 'F') toggleFs();
      else if (e.key === 'd' || e.key === 'D') downloadCurrentArtwork();
    });
  }

  window.CabinetViewer = {
    init: initViewer,
    open: openViewerByItem,
    close: closeViewer
  };
})();
