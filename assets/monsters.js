/**
 * Operation Lexicon · 怪物 SVG 图形库 V2.1
 *
 * 架构：
 *  - PALETTES: 8种配色方案
 *  - TIER_PALETTES: 每阶层的配色池
 *  - PATTERNS: 每阶层的图案变体
 *  - buildMonster(): 根据 tier + day + idx 生成唯一 SVG
 *  - MonsterFX: 受击碎裂 / BOSS震怒 / 击杀爆炸
 *
 * V2.1 修复：
 *  - explode() 作用于外层 .monster-avatar，避免内层样式残留
 */

// ==================== 配色系统 ====================
const PALETTES = {
  emerald:  { primary: '#4ade80', secondary: '#16a34a', glow: '#4ade80', accent: '#86efac' },
  cyan:     { primary: '#4cc3ff', secondary: '#0284c7', glow: '#4cc3ff', accent: '#7dd3fc' },
  violet:   { primary: '#a855f7', secondary: '#7c3aed', glow: '#a855f7', accent: '#c4b5fd' },
  amber:    { primary: '#f4a261', secondary: '#ea580c', glow: '#f4a261', accent: '#fbbf24' },
  crimson:  { primary: '#ff4655', secondary: '#bd3944', glow: '#ff4655', accent: '#fca5a5' },
  teal:     { primary: '#14b8a6', secondary: '#0d9488', glow: '#14b8a6', accent: '#5eead4' },
  rose:     { primary: '#f43f5e', secondary: '#e11d48', glow: '#f43f5e', accent: '#fda4af' },
  indigo:   { primary: '#6366f1', secondary: '#4338ca', glow: '#6366f1', accent: '#a5b4fc' }
};

// 每阶层可用的配色池
const TIER_PALETTES = {
  Initiate:   ['emerald', 'teal', 'cyan'],
  Duelist:    ['cyan', 'indigo', 'teal'],
  Sentinel:   ['violet', 'indigo', 'rose'],
  Controller: ['amber', 'rose', 'violet'],
  Boss:       ['crimson', 'amber', 'rose']
};

// 每阶层的图案变体
const PATTERNS = {
  Initiate:   ['dots', 'lines', 'cross'],
  Duelist:    ['streaks', 'blade', 'arrow'],
  Sentinel:   ['shield', 'runes', 'lattice'],
  Controller: ['particles', 'rings', 'spiral'],
  Boss:       ['crown', 'skull', 'nova']
};

// ==================== 辅助函数 ====================
function hashSeed(day, monsterIdx) {
  return (day * 7 + monsterIdx * 13) % 1000;
}

function pickFromArray(arr, seed) {
  return arr[seed % arr.length];
}

// ==================== 核心构建函数 ====================
function buildMonster(tier, day = 1, monsterIdx = 0) {
  const seed = hashSeed(day, monsterIdx);
  const paletteKey = pickFromArray(TIER_PALETTES[tier] || TIER_PALETTES.Initiate, seed);
  const pattern = pickFromArray(PATTERNS[tier] || PATTERNS.Initiate, Math.floor(seed / 10));
  const p = PALETTES[paletteKey];

  const builders = {
    Initiate: buildInitiate,
    Duelist: buildDuelist,
    Sentinel: buildSentinel,
    Controller: buildController,
    Boss: buildBoss
  };

  const builder = builders[tier] || builders.Initiate;
  return builder(p, pattern, seed);
}

// ==================== Tier I · Initiate（三角形先锋） ====================
function buildInitiate(p, pattern, seed) {
  const flipped = seed % 2 === 0;
  const points = flipped
    ? "100,170 170,40 30,40"
    : "100,30 170,160 30,160";
  const innerPoints = flipped
    ? "100,140 145,60 55,60"
    : "100,60 145,140 55,140";

  let patternSvg = '';
  if (pattern === 'dots') {
    patternSvg = `
      <circle cx="75" cy="115" r="4" fill="${p.primary}"/>
      <circle cx="125" cy="115" r="4" fill="${p.primary}"/>
      <circle cx="100" cy="85" r="4" fill="${p.primary}"/>
    `;
  } else if (pattern === 'lines') {
    patternSvg = `
      <line x1="70" y1="120" x2="130" y2="120" stroke="${p.primary}" stroke-width="2" opacity="0.6"/>
      <line x1="80" y1="100" x2="120" y2="100" stroke="${p.primary}" stroke-width="2" opacity="0.6"/>
    `;
  } else {
    patternSvg = `
      <line x1="85" y1="115" x2="115" y2="115" stroke="${p.primary}" stroke-width="2.5"/>
      <line x1="100" y1="100" x2="100" y2="130" stroke="${p.primary}" stroke-width="2.5"/>
    `;
  }

  return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="monster-svg" data-tier="Initiate">
      <defs>
        <radialGradient id="glow-${seed}" cx="50%" cy="50%">
          <stop offset="0%" stop-color="${p.glow}" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="${p.secondary}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="url(#glow-${seed})"/>
      <g class="monster-body">
        <polygon points="${points}" fill="#0f1923" stroke="${p.primary}" stroke-width="3" class="shatter-piece"/>
        <polygon points="${innerPoints}" fill="none" stroke="${p.primary}" stroke-width="2" opacity="0.6" class="shatter-piece"/>
        <circle cx="100" cy="115" r="12" fill="${p.primary}" class="shatter-piece"/>
        <circle cx="100" cy="115" r="5" fill="#0f1923"/>
        ${patternSvg}
      </g>
    </svg>
  `;
}

// ==================== Tier II · Duelist（菱形决斗者） ====================
function buildDuelist(p, pattern, seed) {
  const rotation = (seed % 4) * 15;

  let patternSvg = '';
  if (pattern === 'streaks') {
    patternSvg = `
      <line x1="20" y1="100" x2="50" y2="100" stroke="${p.primary}" stroke-width="2" opacity="0.7"/>
      <line x1="25" y1="85" x2="45" y2="85" stroke="${p.primary}" stroke-width="1.5" opacity="0.5"/>
      <line x1="25" y1="115" x2="45" y2="115" stroke="${p.primary}" stroke-width="1.5" opacity="0.5"/>
      <line x1="150" y1="100" x2="180" y2="100" stroke="${p.primary}" stroke-width="2" opacity="0.7"/>
    `;
  } else if (pattern === 'blade') {
    patternSvg = `
      <polygon points="100,30 105,50 95,50" fill="${p.accent}"/>
      <polygon points="100,170 105,150 95,150" fill="${p.accent}"/>
      <polygon points="30,100 50,95 50,105" fill="${p.accent}"/>
      <polygon points="170,100 150,95 150,105" fill="${p.accent}"/>
    `;
  } else {
    patternSvg = `
      <polygon points="100,55 110,75 90,75" fill="${p.primary}" opacity="0.8"/>
      <polygon points="100,145 110,125 90,125" fill="${p.primary}" opacity="0.8"/>
    `;
  }

  return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="monster-svg" data-tier="Duelist">
      <defs>
        <radialGradient id="glow-${seed}" cx="50%" cy="50%">
          <stop offset="0%" stop-color="${p.glow}" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="${p.secondary}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#glow-${seed})"/>
      ${patternSvg}
      <g class="monster-body" transform="rotate(${rotation} 100 100)">
        <polygon points="100,30 170,100 100,170 60,100"
          fill="#0f1923" stroke="${p.primary}" stroke-width="3" class="shatter-piece"/>
        <polygon points="100,55 145,100 100,145 80,100"
          fill="${p.primary}" opacity="0.15" stroke="${p.primary}" stroke-width="1.5" class="shatter-piece"/>
        <circle cx="100" cy="100" r="10" fill="${p.primary}" class="shatter-piece"/>
        <circle cx="100" cy="100" r="4" fill="#fff"/>
      </g>
    </svg>
  `;
}

// ==================== Tier III · Sentinel（六边形守卫） ====================
function buildSentinel(p, pattern, seed) {
  let patternSvg = '';
  if (pattern === 'shield') {
    patternSvg = `
      <polygon points="100,35 150,65 150,135 100,165 50,135 50,65"
        fill="${p.primary}" opacity="0.1" stroke="${p.primary}" stroke-width="2"/>
    `;
  } else if (pattern === 'runes') {
    patternSvg = `
      <text x="100" y="82" font-size="12" fill="${p.primary}" text-anchor="middle" opacity="0.7">⬡</text>
      <text x="100" y="135" font-size="12" fill="${p.primary}" text-anchor="middle" opacity="0.7">⬡</text>
      <text x="75" y="110" font-size="10" fill="${p.primary}" text-anchor="middle" opacity="0.5">◆</text>
      <text x="125" y="110" font-size="10" fill="${p.primary}" text-anchor="middle" opacity="0.5">◆</text>
    `;
  } else {
    // lattice
    patternSvg = `
      <line x1="100" y1="45" x2="100" y2="155" stroke="${p.primary}" stroke-width="1" opacity="0.4"/>
      <line x1="55" y1="72" x2="145" y2="128" stroke="${p.primary}" stroke-width="1" opacity="0.4"/>
      <line x1="145" y1="72" x2="55" y2="128" stroke="${p.primary}" stroke-width="1" opacity="0.4"/>
    `;
  }

  return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="monster-svg" data-tier="Sentinel">
      <defs>
        <radialGradient id="glow-${seed}" cx="50%" cy="50%">
          <stop offset="0%" stop-color="${p.glow}" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="${p.secondary}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#glow-${seed})"/>
      <g class="monster-body">
        <polygon points="100,25 160,60 160,140 100,175 40,140 40,60"
          fill="none" stroke="${p.primary}" stroke-width="2" opacity="0.5" class="shatter-piece"/>
        <polygon points="100,45 145,72 145,128 100,155 55,128 55,72"
          fill="#0f1923" stroke="${p.primary}" stroke-width="3" class="shatter-piece"/>
        ${patternSvg}
        <circle cx="100" cy="100" r="15" fill="${p.primary}" class="shatter-piece"/>
        <circle cx="100" cy="100" r="8" fill="#0f1923"/>
        <circle cx="100" cy="100" r="3" fill="${p.primary}"/>
        <circle cx="55" cy="72" r="3" fill="${p.primary}"/>
        <circle cx="145" cy="72" r="3" fill="${p.primary}"/>
        <circle cx="55" cy="128" r="3" fill="${p.primary}"/>
        <circle cx="145" cy="128" r="3" fill="${p.primary}"/>
      </g>
    </svg>
  `;
}

// ==================== Tier IV · Controller（五边形控场者） ====================
function buildController(p, pattern, seed) {
  let patternSvg = '';
  if (pattern === 'particles') {
    patternSvg = `
      <g opacity="0.8">
        <circle cx="100" cy="20" r="3" fill="${p.primary}"/>
        <circle cx="157" cy="43" r="3" fill="${p.primary}"/>
        <circle cx="180" cy="100" r="3" fill="${p.primary}"/>
        <circle cx="157" cy="157" r="3" fill="${p.primary}"/>
        <circle cx="100" cy="180" r="3" fill="${p.primary}"/>
        <circle cx="43" cy="157" r="3" fill="${p.primary}"/>
        <circle cx="20" cy="100" r="3" fill="${p.primary}"/>
        <circle cx="43" cy="43" r="3" fill="${p.primary}"/>
      </g>
    `;
  } else if (pattern === 'rings') {
    patternSvg = `
      <circle cx="100" cy="100" r="85" fill="none" stroke="${p.primary}" stroke-width="1" stroke-dasharray="2 4" opacity="0.5"/>
      <circle cx="100" cy="100" r="75" fill="none" stroke="${p.primary}" stroke-width="1" stroke-dasharray="4 2" opacity="0.4"/>
    `;
  } else {
    // spiral
    patternSvg = `
      <path d="M 100 100 Q 130 100 130 130 Q 130 170 90 170 Q 40 170 40 110 Q 40 40 110 40 Q 180 40 180 120"
        fill="none" stroke="${p.primary}" stroke-width="1.5" opacity="0.4"/>
    `;
  }

  return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="monster-svg" data-tier="Controller">
      <defs>
        <radialGradient id="glow-${seed}" cx="50%" cy="50%">
          <stop offset="0%" stop-color="${p.glow}" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="${p.secondary}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#glow-${seed})"/>
      ${patternSvg}
      <circle cx="100" cy="100" r="80" fill="none"
        stroke="${p.primary}" stroke-width="1" stroke-dasharray="4 6" opacity="0.5"/>
      <g class="monster-body">
        <polygon points="100,35 158,80 136,150 64,150 42,80"
          fill="#0f1923" stroke="${p.primary}" stroke-width="3" class="shatter-piece"/>
        <polygon points="100,60 140,88 125,140 75,140 60,88"
          fill="none" stroke="${p.primary}" stroke-width="1.5" opacity="0.6" class="shatter-piece"/>
        <circle cx="100" cy="105" r="14" fill="${p.primary}" class="shatter-piece"/>
        <circle cx="100" cy="105" r="9" fill="#0f1923"/>
        <circle cx="100" cy="105" r="4" fill="${p.primary}"/>
      </g>
    </svg>
  `;
}

// ==================== Tier V · Boss（八芒星巨兽） ====================
function buildBoss(p, pattern, seed) {
  let patternSvg = '';
  if (pattern === 'crown') {
    patternSvg = `
      <polygon points="75,35 80,20 85,35" fill="#d4af37"/>
      <polygon points="95,30 100,10 105,30" fill="#d4af37"/>
      <polygon points="115,35 120,20 125,35" fill="#d4af37"/>
    `;
  } else if (pattern === 'skull') {
    patternSvg = `
      <circle cx="88" cy="95" r="5" fill="#0f1923"/>
      <circle cx="112" cy="95" r="5" fill="#0f1923"/>
      <rect x="95" y="115" width="10" height="5" fill="#0f1923"/>
    `;
  } else {
    // nova
    patternSvg = `
      <circle cx="100" cy="100" r="30" fill="none" stroke="${p.accent}" stroke-width="1" stroke-dasharray="3 3" opacity="0.6">
        <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="4s" repeatCount="indefinite"/>
      </circle>
    `;
  }

  return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="monster-svg boss-svg" data-tier="Boss">
      <defs>
        <radialGradient id="glow-${seed}" cx="50%" cy="50%">
          <stop offset="0%" stop-color="${p.glow}" stop-opacity="0.9"/>
          <stop offset="60%" stop-color="${p.primary}" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="${p.secondary}" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="core-${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${p.primary}"/>
          <stop offset="100%" stop-color="${p.secondary}"/>
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#glow-${seed})"/>
      <g class="monster-body">
        <polygon points="100,15 118,70 170,55 135,100 185,120 128,125 145,180 100,145 55,180 72,125 15,120 65,100 30,55 82,70"
          fill="#0f1923" stroke="${p.primary}" stroke-width="3" class="shatter-piece"/>
        <polygon points="100,50 110,85 145,80 120,105 150,118 115,118 125,155 100,130 75,155 85,118 50,118 80,105 55,80 90,85"
          fill="none" stroke="${p.primary}" stroke-width="1.5" opacity="0.7" class="shatter-piece"/>
        ${patternSvg}
        <circle cx="100" cy="105" r="18" fill="url(#core-${seed})" class="shatter-piece"/>
        <circle cx="100" cy="105" r="12" fill="#0f1923"/>
        <circle cx="100" cy="105" r="6" fill="${p.primary}">
          <animate attributeName="r" values="6;9;6" dur="1s" repeatCount="indefinite"/>
        </circle>
      </g>
    </svg>
  `;
}

// ==================== 特效系统 ====================
const MonsterFX = {

  /**
   * 受击碎裂动画 —— 让 SVG 内部路径瞬间分裂再归位
   * @param {HTMLElement} container - 怪物容器（svg-wrap 或 avatar）
   */
  shatter(container) {
    if (!container) return;
    const pieces = container.querySelectorAll('.shatter-piece');
    pieces.forEach((piece, i) => {
      const angle = (i / pieces.length) * 360;
      const dist = 8 + Math.random() * 8;
      const dx = Math.cos(angle * Math.PI / 180) * dist;
      const dy = Math.sin(angle * Math.PI / 180) * dist;
      piece.style.transition = 'transform 0.15s ease-out';
      piece.style.transform = `translate(${dx}px, ${dy}px) rotate(${(Math.random() - 0.5) * 20}deg)`;
      setTimeout(() => {
        piece.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';
        piece.style.transform = 'translate(0, 0) rotate(0)';
      }, 150);
    });
  },

  /**
   * BOSS 震怒特效 —— 全屏震动 + 红光闪烁 + 警告文字
   */
  bossRage() {
    const body = document.body;
    body.classList.add('boss-rage');
    setTimeout(() => body.classList.remove('boss-rage'), 800);

    const overlay = document.createElement('div');
    overlay.className = 'boss-rage-overlay';
    overlay.innerHTML = `<div class="rage-text">⚠ BOSS 觉醒 ⚠</div>`;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 1000);
  },

  /**
   * 击杀爆炸特效 —— 粒子 + 冲击波
   * @param {HTMLElement} container - 怪物容器（传 svg-wrap 会自动找外层 avatar）
   * @param {string} color - 粒子主色
   */
  explode(container, color = '#ff4655') {
    if (!container) return;

    // 找到外层 .monster-avatar（方便后续重置样式）
    const avatar = container.closest('.monster-avatar') || container;
    const stage = avatar.closest('.battle-stage') || avatar.parentElement;
    if (!stage) return;

    const rect = avatar.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const cx = rect.left - stageRect.left + rect.width / 2;
    const cy = rect.top - stageRect.top + rect.height / 2;

    const svgNS = 'http://www.w3.org/2000/svg';
    const explosion = document.createElementNS(svgNS, 'svg');
    explosion.setAttribute('class', 'explosion-layer');
    explosion.setAttribute('viewBox', '0 0 400 400');
    explosion.style.cssText = `
      position: absolute;
      left: ${cx - 200}px;
      top: ${cy - 200}px;
      width: 400px;
      height: 400px;
      pointer-events: none;
      z-index: 100;
    `;

    // 30 个粒子
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * 360 + Math.random() * 10;
      const dist = 80 + Math.random() * 120;
      const size = 3 + Math.random() * 6;
      const endX = 200 + Math.cos(angle * Math.PI / 180) * dist;
      const endY = 200 + Math.sin(angle * Math.PI / 180) * dist;

      const particle = document.createElementNS(svgNS, 'circle');
      particle.setAttribute('cx', 200);
      particle.setAttribute('cy', 200);
      particle.setAttribute('r', size);
      particle.setAttribute('fill', i % 3 === 0 ? '#fff' : color);

      const animCx = document.createElementNS(svgNS, 'animate');
      animCx.setAttribute('attributeName', 'cx');
      animCx.setAttribute('from', 200);
      animCx.setAttribute('to', endX);
      animCx.setAttribute('dur', '0.8s');
      animCx.setAttribute('fill', 'freeze');

      const animCy = document.createElementNS(svgNS, 'animate');
      animCy.setAttribute('attributeName', 'cy');
      animCy.setAttribute('from', 200);
      animCy.setAttribute('to', endY);
      animCy.setAttribute('dur', '0.8s');
      animCy.setAttribute('fill', 'freeze');

      const animOpacity = document.createElementNS(svgNS, 'animate');
      animOpacity.setAttribute('attributeName', 'opacity');
      animOpacity.setAttribute('from', 1);
      animOpacity.setAttribute('to', 0);
      animOpacity.setAttribute('dur', '0.8s');
      animOpacity.setAttribute('fill', 'freeze');

      const animR = document.createElementNS(svgNS, 'animate');
      animR.setAttribute('attributeName', 'r');
      animR.setAttribute('from', size);
      animR.setAttribute('to', 0);
      animR.setAttribute('dur', '0.8s');
      animR.setAttribute('fill', 'freeze');

      particle.appendChild(animCx);
      particle.appendChild(animCy);
      particle.appendChild(animOpacity);
      particle.appendChild(animR);
      explosion.appendChild(particle);
    }

    // 中心冲击波
    const shockwave = document.createElementNS(svgNS, 'circle');
    shockwave.setAttribute('cx', 200);
    shockwave.setAttribute('cy', 200);
    shockwave.setAttribute('r', 10);
    shockwave.setAttribute('fill', 'none');
    shockwave.setAttribute('stroke', color);
    shockwave.setAttribute('stroke-width', 4);

    const animShockR = document.createElementNS(svgNS, 'animate');
    animShockR.setAttribute('attributeName', 'r');
    animShockR.setAttribute('from', 10);
    animShockR.setAttribute('to', 180);
    animShockR.setAttribute('dur', '0.6s');
    animShockR.setAttribute('fill', 'freeze');

    const animShockOpacity = document.createElementNS(svgNS, 'animate');
    animShockOpacity.setAttribute('attributeName', 'opacity');
    animShockOpacity.setAttribute('from', 1);
    animShockOpacity.setAttribute('to', 0);
    animShockOpacity.setAttribute('dur', '0.6s');
    animShockOpacity.setAttribute('fill', 'freeze');

    const animShockWidth = document.createElementNS(svgNS, 'animate');
    animShockWidth.setAttribute('attributeName', 'stroke-width');
    animShockWidth.setAttribute('from', 4);
    animShockWidth.setAttribute('to', 0);
    animShockWidth.setAttribute('dur', '0.6s');
    animShockWidth.setAttribute('fill', 'freeze');

    shockwave.appendChild(animShockR);
    shockwave.appendChild(animShockOpacity);
    shockwave.appendChild(animShockWidth);
    explosion.appendChild(shockwave);

    stage.style.position = 'relative';
    stage.appendChild(explosion);

    // 让怪物本体淡出（作用在外层 avatar，方便重置）
    avatar.style.transition = 'opacity 0.4s, transform 0.4s';
    avatar.style.opacity = '0';
    avatar.style.transform = 'scale(1.3)';

    // 1 秒后清理爆炸层
    setTimeout(() => {
      if (explosion.parentNode) explosion.remove();
    }, 1000);
  }
};

// ==================== 导出 ====================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    buildMonster,
    MonsterFX,
    PALETTES,
    TIER_PALETTES,
    PATTERNS
  };
} else {
  window.buildMonster = buildMonster;
  window.MonsterFX = MonsterFX;
  window.PALETTES = PALETTES;
  window.TIER_PALETTES = TIER_PALETTES;
  window.PATTERNS = PATTERNS;
}