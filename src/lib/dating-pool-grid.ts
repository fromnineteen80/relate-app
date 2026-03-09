/**
 * DatingPoolGrid — plain-JS blip visualization of the dating pool funnel.
 *
 * Renders 4,000 blips into a container element. Pools are nested: metro singles
 * is the largest, ideal match is the smallest. Blips fill from the bottom of
 * the grid upward so that the smallest (most filtered) pools sit at the base
 * and empty blips occupy the top.
 *
 * Usage:
 *   import { renderDatingPoolGrid } from '@/lib/dating-pool-grid';
 *   renderDatingPoolGrid(containerEl, poolData, targetGender);
 *
 * Call again with new data to re-render (it clears the container first).
 */

// ─── TYPES ──────────────────────────────────────────────────────────────────

export type PoolEntry = { label: string; count: number };

export type DatingPoolData = {
  metro: string;
  metroPopulation: number;
  pools: {
    metro: PoolEntry;
    identity: PoolEntry;
    realistic: PoolEntry;
    preferred: PoolEntry;
    ideal: PoolEntry;
  };
};

export type TargetGender = 'women' | 'men' | 'all';

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────

const COLOR_BLIP_EMPTY    = '#e7e5e4';  // stone-200 — progress bar background
const COLOR_YELLOW        = '#F9A825';  // brand yellow — realistic tier
const COLOR_IDEAL_WOMEN   = '#fb7185';  // rose-400 — ideal when dating women
const COLOR_IDEAL_MEN     = '#3b82f6';  // blue-500 — ideal when dating men
const COLOR_IDEAL_ALL     = '#fb7185';  // rose-400 — ideal fallback (same as women)
const COLOR_IDEAL_BLINK   = '#e7e5e4';  // stone-200 — ideal blinks to empty gray
const COLOR_IDENTITY      = '#292524';  // brand black — identity pool
const COLOR_GREEN         = '#047857';  // brand green — realistic/preferred base

const COLOR_CARD           = '#FFFFFF';
const COLOR_BORDER         = '#E5E7EB';
const COLOR_TEXT_PRIMARY   = '#141413';
const COLOR_TEXT_SECONDARY = '#78716c';
const COLOR_TEXT_MUTED     = '#9CA3AF';
const COLOR_ROW_HOVER_BG  = '#F5F4F0';

// ─── CONFIG ─────────────────────────────────────────────────────────────────

const MIN_BLIPS     = 3000;
const MAX_BLIPS     = 4000;
const BLIPS_PER_ROW = 50;

const POOL_KEYS: (keyof DatingPoolData['pools'])[] = [
  'metro', 'identity', 'realistic', 'preferred', 'ideal',
];

const LEGEND: { key: keyof DatingPoolData['pools']; label: string }[] = [
  { key: 'metro',     label: 'Metro Singles Pool' },
  { key: 'identity',  label: 'Identity Pool' },
  { key: 'realistic', label: 'Realistic Match Pool' },
  { key: 'preferred', label: 'Preferred Lifestyle Pool' },
  { key: 'ideal',     label: 'Ideal Match Pool' },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function pct(count: number, total: number): string {
  const p = (count / total) * 100;
  if (p >= 1)    return `${Math.round(p)}%`;
  if (p >= 0.1)  return `${p.toFixed(1)}%`;
  if (p >= 0.01) return `${p.toFixed(2)}%`;
  return `${p.toFixed(3)}%`;
}

function fmt(n: number): string {
  return n.toLocaleString();
}

function buildColors(targetGender: TargetGender) {
  const idealColor = targetGender === 'women' ? COLOR_IDEAL_WOMEN
    : targetGender === 'men' ? COLOR_IDEAL_MEN
    : COLOR_IDEAL_ALL;
  return {
    metro:     COLOR_BLIP_EMPTY,
    identity:  COLOR_IDENTITY,
    realistic: hexToRgba(COLOR_YELLOW, 0.80),
    preferred: hexToRgba(COLOR_GREEN, 0.40),
    ideal:     idealColor,
    empty:     COLOR_BLIP_EMPTY,
    card:      COLOR_CARD,
    border:    COLOR_BORDER,
    textPrimary:   COLOR_TEXT_PRIMARY,
    textSecondary: COLOR_TEXT_SECONDARY,
    textMuted:     COLOR_TEXT_MUTED,
    rowHoverBg:    COLOR_ROW_HOVER_BG,
  };
}

/**
 * Build per-blip color array and a parallel "tier key" array.
 * Pools paint from largest → smallest so smaller pools overwrite larger ones.
 * The arrays are then reversed so colored blips sit at the bottom of the grid
 * and empty blips at the top.
 */
function buildBlipColors(
  pools: DatingPoolData['pools'],
  colors: ReturnType<typeof buildColors>,
  totalBlips: number,
) {
  const base = pools.metro.count;

  const counts: Record<string, number> = {};
  POOL_KEYS.forEach(k => {
    const raw = (pools[k].count / base) * totalBlips;
    // Round down ideal if less than half a blip
    counts[k] = Math.min(
      totalBlips,
      k === 'ideal' ? Math.floor(raw) : Math.round(raw),
    );
  });

  // Paint from largest → smallest (smaller pools overwrite)
  const blips = new Array<string>(totalBlips).fill(colors.empty);
  const tiers = new Array<string>(totalBlips).fill('empty');
  POOL_KEYS.forEach(k => {
    const n = counts[k];
    for (let i = 0; i < n; i++) {
      blips[i] = colors[k as keyof typeof colors] as string;
      tiers[i] = k;
    }
  });

  // Reverse so filled blips are at the bottom of the grid
  blips.reverse();
  tiers.reverse();

  return { blips, tiers, counts };
}

// ─── ELEMENT HELPERS ────────────────────────────────────────────────────────

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  styles?: Partial<CSSStyleDeclaration>,
  attrs?: Record<string, string>,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (styles) Object.assign(node.style, styles);
  if (attrs) Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

function text(tag: keyof HTMLElementTagNameMap, content: string, styles?: Partial<CSSStyleDeclaration>) {
  const node = el(tag, styles);
  node.textContent = content;
  return node;
}

// ─── RENDER ─────────────────────────────────────────────────────────────────

export function renderDatingPoolGrid(
  container: HTMLElement,
  data: DatingPoolData,
  targetGender: TargetGender = 'women',
): void {
  // Clear previous render
  container.innerHTML = '';

  const COLORS = buildColors(targetGender);
  const { pools, metro } = data;
  let totalBlips = MIN_BLIPS;
  let { blips, tiers, counts } = buildBlipColors(pools, COLORS, totalBlips);

  // State
  let hovered: string | null = null;

  // Inject keyframes for the ideal-blip blink animation (gender-specific color)
  const styleId = 'dpg-blink-style';
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) existingStyle.remove();
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes dpg-blink {
      0%, 100% { background-color: ${COLORS.ideal}; }
      50%      { background-color: ${COLOR_IDEAL_BLINK}; }
    }
  `;
  document.head.appendChild(style);

  // ── Card wrapper ──
  const card = el('div', {
    backgroundColor: COLORS.card,
    borderRadius: '6px',
    border: `1px solid ${COLORS.border}`,
    padding: '20px',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  });

  // ── Header ──
  const header = el('div', { marginBottom: '18px' });

  // Title row with icon
  const titleRow = el('div', {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '0 0 4px 0',
  });

  // Trending up icon (same as Dating Market card)
  const iconSpan = el('span', {
    fontSize: '20px',
    fontFamily: "'Material Symbols Rounded', sans-serif",
    color: '#c2410c', // accent
    lineHeight: '1',
  });
  iconSpan.textContent = 'trending_up';
  iconSpan.classList.add('material-symbols-rounded');
  titleRow.appendChild(iconSpan);

  titleRow.appendChild(text('h3', 'Your Dating Pool', {
    fontSize: '18px',
    fontWeight: '600',
    fontFamily: "'Noto Serif', 'Lora', Georgia, serif",
    color: COLORS.textPrimary,
    margin: '0',
  }));
  header.appendChild(titleRow);

  // Metro location subtitle (matches Dating Market card's .explainer style: text-sm text-secondary)
  header.appendChild(text('p', metro, {
    fontSize: '14px',
    color: COLORS.textSecondary,
    margin: '0 0 4px 0',
    lineHeight: '1.5',
  }));

  const subtitle = text('p', '', {
    fontSize: '11px',
    color: COLORS.textSecondary,
    margin: '0',
    lineHeight: '1.5',
  });
  function updateSubtitle() {
    const genderLabel = targetGender === 'women' ? 'women' : targetGender === 'men' ? 'men' : 'people';
    subtitle.textContent = `${fmt(pools.metro.count)} ${genderLabel} in your local dating pool.`;
  }
  updateSubtitle();
  header.appendChild(subtitle);

  card.appendChild(header);

  // ── Blip grid (flex-compression pill effect) ──
  // The grid grows to fill available card height. After mount we pick
  // a totalBlips between 3000–4000 (snapped to multiples of 50) that
  // best fills the space — adjusting people-per-blip, not columns.
  const grid = el('div', {
    width: '100%',
    flex: '1',
    overflow: 'hidden',
  });

  const blipEls: HTMLDivElement[] = [];

  // Row height: 8px blip + 4px margin = 12px per row
  let BLIP_ROW_H = 12; // fallback

  function buildGrid() {
    grid.innerHTML = '';
    blipEls.length = 0;
    const totalRows = Math.ceil(totalBlips / BLIPS_PER_ROW);

    for (let row = 0; row < totalRows; row++) {
      const rowEl = el('div', { display: 'flex' });

      for (let col = 0; col < BLIPS_PER_ROW; col++) {
        const i = row * BLIPS_PER_ROW + col;
        if (i >= totalBlips) break;

        const dot = el('div', {
          width: '8px',
          height: '8px',
          margin: '2px',
          borderRadius: '2px',
          backgroundColor: blips[i],
          transition: 'background-color 0.15s ease',
        });

        if (tiers[i] === 'ideal') {
          dot.style.animation = 'dpg-blink 2s ease-in-out infinite';
        }

        blipEls.push(dot);
        rowEl.appendChild(dot);
      }

      grid.appendChild(rowEl);
    }
  }

  // Initial render
  buildGrid();
  card.appendChild(grid);

  // After mount, pick the best total blip count to fill available height.
  // The grid has flex:1 so it fills remaining card space. We measure that
  // height, compute how many 12px rows fit, and rebuild if needed.
  requestAnimationFrame(() => {
    BLIP_ROW_H = 12; // 8px blip + 4px margin (top+bottom)
    const availH = grid.clientHeight;
    if (availH > 0) {
      const rowsThatFit = Math.max(1, Math.floor(availH / BLIP_ROW_H));
      const ideal = rowsThatFit * BLIPS_PER_ROW;
      const snapped = Math.round(
        Math.max(MIN_BLIPS, Math.min(MAX_BLIPS, ideal)) / BLIPS_PER_ROW,
      ) * BLIPS_PER_ROW;
      if (snapped !== totalBlips) {
        totalBlips = snapped;
        ({ blips, tiers, counts } = buildBlipColors(pools, COLORS, totalBlips));
        updateSubtitle();
        updateBlipNote();
        buildGrid();
      }
    }
  });

  // ── Blip color on hover ──
  // Pools are nested: metro ⊃ identity ⊃ realistic ⊃ preferred ⊃ ideal
  // A blip tagged "realistic" also belongs to identity and metro.
  const poolDepth: Record<string, number> = { metro: 0, identity: 1, realistic: 2, preferred: 3, ideal: 4, empty: -1 };

  function blipBelongsToPool(blipTier: string, hoveredPool: string): boolean {
    const blipD = poolDepth[blipTier] ?? -1;
    const hovD = poolDepth[hoveredPool] ?? -1;
    // A blip belongs to a pool if it's at the same depth or deeper (more filtered)
    return blipD >= hovD && blipD >= 0;
  }

  function blipColor(idx: number): string {
    if (!hovered) return blips[idx];
    if (blipBelongsToPool(tiers[idx], hovered)) {
      // Show all matching blips in the hovered pool's color
      return COLORS[hovered as keyof typeof COLORS] as string;
    }
    return COLORS.empty;
  }

  function repaintBlips() {
    for (let i = 0; i < blipEls.length; i++) {
      blipEls[i].style.backgroundColor = blipColor(i);
      // Pause/resume blink animation based on hover isolation
      if (tiers[i] === 'ideal') {
        const show = !hovered || hovered === 'ideal';
        blipEls[i].style.animation = show ? 'dpg-blink 2s ease-in-out infinite' : 'none';
        if (!show) blipEls[i].style.backgroundColor = blipColor(i);
      }
    }
  }

  // ── Legend + Stats ──
  const legend = el('div', {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  });

  LEGEND.forEach(({ key, label }, idx) => {
    const count = pools[key].count;
    const base  = pools.metro.count;

    const row = el('div', {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      transition: 'opacity 0.15s ease, background-color 0.15s ease',
      padding: '6px 6px',
      borderRadius: '0',
      borderBottom: idx < LEGEND.length - 1 ? '1px solid #f0efed' : 'none',
    });

    // Swatch — ideal tier gets a subtle blink too
    const swatch = el('div', {
      width: '14px',
      height: '14px',
      borderRadius: '3px',
      backgroundColor: COLORS[key as keyof typeof COLORS] as string,
      flexShrink: '0',
    });
    if (key === 'ideal') {
      swatch.style.animation = 'dpg-blink 2s ease-in-out infinite';
    }
    row.appendChild(swatch);

    // Label
    row.appendChild(text('span', label, {
      fontSize: '12px',
      color: COLORS.textPrimary,
      flex: '1',
    }));

    // Count
    row.appendChild(text('span', fmt(count), {
      fontSize: '12px',
      fontWeight: '600',
      color: COLORS.textPrimary,
      fontFamily: 'monospace',
      marginLeft: 'auto',
      paddingLeft: '12px',
    }));

    // Percentage
    if (key !== 'metro') {
      row.appendChild(text('span', pct(count, base), {
        fontSize: '11px',
        color: COLORS.textSecondary,
        width: '44px',
        textAlign: 'right',
      }));
    } else {
      row.appendChild(el('span', { width: '44px' }));
    }

    // Hover events
    row.addEventListener('mouseenter', () => {
      hovered = key;
      row.style.backgroundColor = COLORS.rowHoverBg;
      (row.children[1] as HTMLElement).style.fontWeight = '600';
      updateLegendOpacity();
      repaintBlips();
    });
    row.addEventListener('mouseleave', () => {
      hovered = null;
      row.style.backgroundColor = 'transparent';
      (row.children[1] as HTMLElement).style.fontWeight = '400';
      updateLegendOpacity();
      repaintBlips();
    });

    row.setAttribute('data-pool-key', key);
    legend.appendChild(row);
  });

  function updateLegendOpacity() {
    const rows = legend.querySelectorAll<HTMLElement>('[data-pool-key]');
    rows.forEach(r => {
      const k = r.getAttribute('data-pool-key');
      const isActive = !hovered || hovered === k;
      r.style.opacity = isActive ? '1' : '0.4';
    });
  }

  card.appendChild(legend);

  // ── Footer ──
  card.appendChild(text('p', 'Hover a row to isolate that pool in the grid.', {
    fontSize: '10px',
    color: COLORS.textMuted,
    margin: '14px 0 0 0',
    lineHeight: '1.5',
  }));

  const blipNote = text('p', '', {
    fontSize: '10px',
    color: COLORS.textMuted,
    margin: '2px 0 0 0',
    lineHeight: '1.5',
  });
  function updateBlipNote() {
    const genderLabel = targetGender === 'women' ? 'women' : targetGender === 'men' ? 'men' : 'people';
    blipNote.textContent = `Each blip ≈ ${fmt(Math.max(1, Math.round(pools.metro.count / totalBlips)))} ${genderLabel}.`;
  }
  updateBlipNote();
  card.appendChild(blipNote);

  container.appendChild(card);
}
