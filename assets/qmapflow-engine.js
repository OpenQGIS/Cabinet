/**
 * QMapFlow Badge Engine (v2.0.0)
 * Mechanical Plaque & Racing Enamel Aesthetic
 * 100% Zero-Font Dependency · Physical Pixel Anchoring & Optical Compensation
 */
(function(root) {
  'use strict';

  // 1. Five Racing Enamel Color Tier Definitions
  const THEMES = {
    gold: {
      key: 'gold',
      name: 'Royal Gold',
      zhName: '香槟金',
      range: '100 满分段',
      pocketGradient: ['#664c15', '#916e23', '#cca141', '#f8df93'],
      strokeGradient: ['#fdebb0', '#cca141', '#805d15']
    },
    red: {
      key: 'red',
      name: 'Guards Red',
      zhName: '胭脂红',
      range: '95 - 99 分段',
      pocketGradient: ['#611014', '#941a20', '#d0242d', '#f5565e'],
      strokeGradient: ['#ff858d', '#d0242d', '#7a1419']
    },
    blue: {
      key: 'blue',
      name: 'Shark Blue',
      zhName: '电光蓝',
      range: '90 - 94 分段',
      pocketGradient: ['#0a3258', '#12548e', '#1d82d0', '#56bcfa'],
      strokeGradient: ['#88d6ff', '#1d82d0', '#0e416f']
    },
    green: {
      key: 'green',
      name: 'Acid Green',
      zhName: '亮能绿',
      range: '80 - 89 分段',
      pocketGradient: ['#2a4b0c', '#4f8418', '#7ebe24', '#c1f552'],
      strokeGradient: ['#d9ff7b', '#7ebe24', '#3d6610']
    },
    grey: {
      key: 'grey',
      name: 'Stealth Grey',
      zhName: '淬火灰',
      range: '< 80 分段',
      pocketGradient: ['#303844', '#4b5563', '#728092', '#a6b4c6'],
      strokeGradient: ['#cbd8e6', '#728092', '#3c4450']
    }
  };

  /**
   * Theme Resolver: Map score to enamel theme
   */
  function resolveTheme(score) {
    const num = Math.round(parseFloat(score)) || 0;
    if (num >= 100) return THEMES.gold;
    if (num >= 95)  return THEMES.red;
    if (num >= 90)  return THEMES.blue;
    if (num >= 80)  return THEMES.green;
    return THEMES.grey;
  }

  /**
   * Physical Pixel Anchoring & Optical Compensation Calculator
   * Reverses SVG viewBox (570x185) scale against display height & device pixel ratio
   */
  function resolveMetrics(options = {}) {
    const dpr = options.dpr || (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
    const targetHeight = options.height || (options.isMobile ? 18 : 26);
    
    // Base scale relative to 185px base plaque height
    const scale = Math.max(0.05, targetHeight / 185);

    // Human perception anchors:
    // Ideal pocket bevel shadow: ~1.2 to 1.5 CSS px
    const minBevelPx = Math.max(1.0, 1.2 / dpr);
    const pocketBlur = Math.max(1.0, minBevelPx / scale).toFixed(2);
    const pocketOffset = Math.max(1.2, (minBevelPx * 1.15) / scale).toFixed(2);

    // Drop shadow: softer on large desktop, tighter on small mobile to prevent dark smudges
    const dropVisualPx = targetHeight < 24 ? 1.5 : (targetHeight < 40 ? 3.0 : 6.0);
    const plaqueBlur = Math.max(2.0, dropVisualPx / scale).toFixed(2);
    const plaqueOffsetY = Math.max(2.5, (dropVisualPx * 1.25) / scale).toFixed(2);

    // Opacity: Boost contrast on low-DPI or tiny sizes
    const pocketDarkOpacity = targetHeight < 24 ? 0.95 : (dpr > 1.5 ? 0.78 : 0.88);
    const plaqueOpacity = targetHeight < 24 ? 0.88 : (dpr > 1.5 ? 0.65 : 0.75);

    return {
      scale,
      pocketBlur,
      pocketOffset,
      pocketDarkOpacity,
      plaqueBlur,
      plaqueOffsetY,
      plaqueOpacity,
      isSmall: targetHeight < 24
    };
  }

  /**
   * Digits Layout Assembler
   * Assembles pre-outlined digit paths and centers them in the sunken pocket (cx: 210, cy: 92.5)
   */
  function buildDigitsGroup(scoreStr, glyphs) {
    const digits = String(scoreStr).trim().split('');
    const digitData = digits.map(d => glyphs.digits[d] || glyphs.digits['0']);
    
    const count = digitData.length;
    // Scale factor for digit size in pocket
    // 3 digits (100) -> scale 0.68, 2 digits (98) -> scale 0.76, 1 digit -> scale 0.78
    const fontScale = count >= 3 ? 0.68 : (count === 2 ? 0.76 : 0.78);
    const gap = count >= 3 ? 4 : 6;

    // Calculate unscaled total width
    const totalRawWidth = digitData.reduce((sum, g) => sum + g.w, 0) + (count - 1) * gap;
    const scaledTotalWidth = totalRawWidth * fontScale;

    // Pocket center: X = 210, Y = 92.5
    // Digit baseline in raw paths: average Y center is ~244
    const pocketCenterX = 210;
    const pocketCenterY = 92.5;
    const rawCenterY = 243.98;

    const startX = pocketCenterX - (scaledTotalWidth / 2);
    let currentX = startX;

    let pathsHtml = '';
    for (let i = 0; i < count; i++) {
      const g = digitData[i];
      // Target origin for this digit: align raw minX to currentX, rawCenterY to pocketCenterY
      const tx = (currentX / fontScale) - g.minX;
      const ty = (pocketCenterY / fontScale) - rawCenterY;

      pathsHtml += `<path d="${g.d}" transform="scale(${fontScale}) translate(${tx.toFixed(2)}, ${ty.toFixed(2)})" />`;
      currentX += (g.w + gap) * fontScale;
    }

    return pathsHtml;
  }

  /**
   * Main Badge Generator
   * Produces self-contained, standalone, 100% vector SVG string
   */
  function render(score = 100, options = {}) {
    const glyphs = options.glyphs || root.QMAPFLOW_GLYPHS || (typeof window !== 'undefined' ? window.QMAPFLOW_GLYPHS : null);
    if (!glyphs) {
      console.warn('[QMapFlowBadge] Glyph dictionary not loaded. Please include qmapflow-glyphs.js');
      return '';
    }

    const cleanScore = String(score).replace(/%/g, '').trim() || '100';
    const theme = resolveTheme(cleanScore);
    const metrics = resolveMetrics(options);
    const uniqueId = options.id || ('qmf_' + Math.random().toString(36).substr(2, 7));

    // Gradient stop builders
    const pStops = theme.pocketGradient.map((col, idx) => {
      const offsets = ['0%', '25%', '65%', '100%'];
      return `<stop offset="${offsets[idx]}" stop-color="${col}"/>`;
    }).join('');

    const sStops = theme.strokeGradient.map((col, idx) => {
      const offsets = ['0%', '50%', '100%'];
      return `<stop offset="${offsets[idx]}" stop-color="${col}"/>`;
    }).join('');

    const digitsGroup = buildDigitsGroup(cleanScore, glyphs);

    return `<svg class="qmapflow-badge" id="${uniqueId}" width="100%" height="100%" viewBox="0 0 620 185" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="QGIS-Mapflow ${cleanScore}% (${theme.name})">
  <defs>
    <!-- Milled Aluminum Plaque 135-deg Gradient -->
    <linearGradient id="${uniqueId}_milledAlu" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#e8ebf0"/>
      <stop offset="60%" stop-color="#b8c0cc"/>
      <stop offset="100%" stop-color="#737d8c"/>
    </linearGradient>

    <!-- Racing Enamel Sunken Pocket Gradient -->
    <linearGradient id="${uniqueId}_pocket" x1="0" y1="0" x2="0" y2="1">
      ${pStops}
    </linearGradient>
    <linearGradient id="${uniqueId}_stroke" x1="0" y1="0" x2="0" y2="1">
      ${sStops}
    </linearGradient>

    <!-- Embossed Metal Number Gradient -->
    <linearGradient id="${uniqueId}_embossedMetal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#f0f3f8"/>
      <stop offset="70%" stop-color="#c8d0dc"/>
      <stop offset="100%" stop-color="#8a95a5"/>
    </linearGradient>

    <!-- Screw Head Radial Gradient -->
    <radialGradient id="${uniqueId}_screwHead" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#c5ccd6"/>
      <stop offset="85%" stop-color="#606b7a"/>
      <stop offset="100%" stop-color="#2d333b"/>
    </radialGradient>

    <!-- Dynamic Optical Compensated Filters -->
    <filter id="${uniqueId}_plaqueDrop" x="-15%" y="-15%" width="130%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="${metrics.plaqueBlur}" result="blur"/>
      <feOffset in="blur" dx="0" dy="${metrics.plaqueOffsetY}" result="offset"/>
      <feFlood flood-color="#000000" flood-opacity="${metrics.plaqueOpacity}" result="color"/>
      <feComposite in="color" in2="offset" operator="in" result="shadow"/>
      <feMerge>
        <feMergeNode in="shadow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <filter id="${uniqueId}_pocketDrop" x="-15%" y="-15%" width="130%" height="130%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="${metrics.pocketBlur}" result="blurDark"/>
      <feOffset in="blurDark" dx="-${metrics.pocketOffset}" dy="-${metrics.pocketOffset}" result="offDark"/>
      <feFlood flood-color="#000000" flood-opacity="${metrics.pocketDarkOpacity}" result="colDark"/>
      <feComposite in="colDark" in2="offDark" operator="in" result="darkShadow"/>
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.0" result="blurLight"/>
      <feOffset in="blurLight" dx="1.2" dy="1.4" result="offLight"/>
      <feFlood flood-color="#ffffff" flood-opacity="0.85" result="colLight"/>
      <feComposite in="colLight" in2="offLight" operator="in" result="lightShadow"/>
      <feMerge>
        <feMergeNode in="darkShadow"/>
        <feMergeNode in="lightShadow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Embossed Numbers & Script Filters -->
    <filter id="${uniqueId}_numEmboss" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.4" result="blurH"/>
      <feOffset in="blurH" dx="-0.8" dy="-0.8" result="offH"/>
      <feFlood flood-color="#ffffff" flood-opacity="0.95" result="colH"/>
      <feComposite in="colH" in2="offH" operator="in" result="highLight"/>
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.0" result="blurS"/>
      <feOffset in="blurS" dx="1.4" dy="2.0" result="offS"/>
      <feFlood flood-color="#0a121e" flood-opacity="0.85" result="colS"/>
      <feComposite in="colS" in2="offS" operator="in" result="dropS"/>
      <feMerge>
        <feMergeNode in="dropS"/>
        <feMergeNode in="highLight"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <filter id="${uniqueId}_textEmboss" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="tBlurH"/>
      <feOffset in="tBlurH" dx="0.8" dy="1.2" result="tOffH"/>
      <feFlood flood-color="#ffffff" flood-opacity="0.9" result="tColH"/>
      <feComposite in="tColH" in2="tOffH" operator="in" result="tHigh"/>
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" result="tBlurS"/>
      <feOffset in="tBlurS" dx="-1" dy="-1.4" result="tOffS"/>
      <feFlood flood-color="#000000" flood-opacity="0.8" result="tColS"/>
      <feComposite in="tColS" in2="tOffS" operator="in" result="tShadow"/>
      <feMerge>
        <feMergeNode in="tShadow"/>
        <feMergeNode in="tHigh"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <filter id="${uniqueId}_screwBlur">
      <feGaussianBlur stdDeviation="0.8"/>
    </filter>

    <clipPath id="${uniqueId}_pentaClip">
      <polygon points="0,-5.8 5.5,-1.8 3.4,4.7 -3.4,4.7 -5.5,-1.8"/>
    </clipPath>

    <!-- Cursive Letters 135-deg Individual Metal Gradients -->
    <linearGradient id="${uniqueId}_g_script" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#465160"/><stop offset="35%" stop-color="#6f7b8d"/><stop offset="75%" stop-color="#acb6c4"/><stop offset="100%" stop-color="#e8ecf2"/>
    </linearGradient>
  </defs>

  <g filter="url(#${uniqueId}_plaqueDrop)">
    <!-- 1. Milled Aluminum Rounded Base Plaque (Widened for optimal spacing) -->
    <rect x="20" y="15" width="580" height="155" rx="20" fill="url(#${uniqueId}_milledAlu)" stroke="#5d6775" stroke-width="1.2"/>

    <!-- 2. Dual Mechanical Machine Grooves with Racing Enamel Tint -->
    <path d="M 46 36 L 85 36 M 46 43 L 85 43 M 46 140 L 85 140 M 46 147 L 85 147" 
          stroke="url(#${uniqueId}_stroke)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 46 37 L 85 37 M 46 44 L 85 44 M 46 141 L 85 141 M 46 148 L 85 148" 
          stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" opacity="0.85"/>

    <path d="M 535 36 L 574 36 M 535 43 L 574 43 M 535 140 L 574 140 M 535 147 L 574 147" 
          stroke="url(#${uniqueId}_stroke)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 535 37 L 574 37 M 535 44 L 574 44 M 535 141 L 574 141 M 535 148 L 574 148" 
          stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" opacity="0.85"/>

    <!-- 3. Dual Penta-Head Recessed Mechanical Bolts -->
    <g transform="translate(62, 92)">
      <circle cx="0" cy="0" r="10.5" fill="url(#${uniqueId}_screwHead)" stroke="#3f4854" stroke-width="1"/>
      <circle cx="0" cy="0" r="8.5" fill="none" stroke="#9aa3af" stroke-width="0.6"/>
      <g transform="rotate(18)">
        <polygon points="0,-5.8 5.5,-1.8 3.4,4.7 -3.4,4.7 -5.5,-1.8" fill="rgb(233, 236, 241)" stroke="#b8c0cc" stroke-width="0.6"/>
        <g clip-path="url(#${uniqueId}_pentaClip)">
          <polygon points="0,-5.8 5.5,-1.8 3.4,4.7 -3.4,4.7 -5.5,-1.8" fill="none" stroke="#252c38" stroke-width="3" transform="translate(0, -1)" opacity="0.65" filter="url(#${uniqueId}_screwBlur)"/>
          <polygon points="0,-5.8 5.5,-1.8 3.4,4.7 -3.4,4.7 -5.5,-1.8" fill="none" stroke="#11161d" stroke-width="1.2" transform="translate(0, -0.6)" opacity="0.8"/>
          <polygon points="0,-5.8 5.5,-1.8 3.4,4.7 -3.4,4.7 -5.5,-1.8" fill="none" stroke="#ffffff" stroke-width="1.5" transform="translate(0, 1.2)" opacity="0.9"/>
        </g>
      </g>
    </g>

    <g transform="translate(558, 92)">
      <circle cx="0" cy="0" r="10.5" fill="url(#${uniqueId}_screwHead)" stroke="#3f4854" stroke-width="1"/>
      <circle cx="0" cy="0" r="8.5" fill="none" stroke="#9aa3af" stroke-width="0.6"/>
      <g transform="rotate(54)">
        <polygon points="0,-5.8 5.5,-1.8 3.4,4.7 -3.4,4.7 -5.5,-1.8" fill="rgb(233, 236, 241)" stroke="#b8c0cc" stroke-width="0.6"/>
        <g clip-path="url(#${uniqueId}_pentaClip)">
          <polygon points="0,-5.8 5.5,-1.8 3.4,4.7 -3.4,4.7 -5.5,-1.8" fill="none" stroke="#252c38" stroke-width="3" transform="translate(0, -1)" opacity="0.65" filter="url(#${uniqueId}_screwBlur)"/>
          <polygon points="0,-5.8 5.5,-1.8 3.4,4.7 -3.4,4.7 -5.5,-1.8" fill="none" stroke="#11161d" stroke-width="1.2" transform="translate(0, -0.6)" opacity="0.8"/>
          <polygon points="0,-5.8 5.5,-1.8 3.4,4.7 -3.4,4.7 -5.5,-1.8" fill="none" stroke="#ffffff" stroke-width="1.5" transform="translate(0, 1.2)" opacity="0.9"/>
        </g>
      </g>
    </g>

    <!-- 4. Left Core Sunken Pocket (Enamel Gradient & Inset Bevel Shadow) -->
    <rect x="102" y="39" width="216" height="107" rx="10" 
          fill="url(#${uniqueId}_pocket)" stroke="url(#${uniqueId}_stroke)" stroke-width="1.4"
          filter="url(#${uniqueId}_pocketDrop)"/>

    <!-- 5. Pre-Outlined Kinetic Embossed Metal Numbers (100% Zero-Font) -->
    <g fill="url(#${uniqueId}_embossedMetal)" filter="url(#${uniqueId}_numEmboss)">
      ${digitsGroup}
    </g>

    <!-- 6. Pre-Outlined Cursive QGIS & Mapflow Brand Script (Shifted right by 25px for perfect spacing) -->
    <g transform="translate(25, 0)" fill="url(#${uniqueId}_g_script)" stroke="url(#${uniqueId}_g_script)" stroke-width="0.8" filter="url(#${uniqueId}_textEmboss)">
      <!-- Line 1: QGIS -->
      <path d="${glyphs.script.QGIS.d}"/>
      <!-- Line 2: Mapflow -->
      <path d="${glyphs.script.Mapflow.d}"/>
    </g>
  </g>
</svg>`;
  }

  // Expose to window/root namespace
  root.QMapFlowBadge = {
    THEMES,
    resolveTheme,
    resolveMetrics,
    render,
    renderElement(score, options) {
      const div = document.createElement('div');
      div.innerHTML = render(score, options).trim();
      return div.firstElementChild;
    }
  };

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
