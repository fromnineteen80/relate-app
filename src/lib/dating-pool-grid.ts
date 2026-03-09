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
const COLOR_ACTION        = '#C96442';  // orange accent for ideal tier

const COLOR_GENDER: Record<TargetGender, string> = {
  women: '#fb7185',   // rose-400 — seeking women
  men:   '#3b82f6',   // blue-500 — seeking men
  all:   '#c2410c',   // accent   — seeking all
};

const GENDER_OPACITY: Record<string, number> = {
  identity:  1.00,  // full gender color
  realistic: 0.75,  // 25% transparent
  preferred: 0.50,  // 50% transparent
};

const COLOR_CARD           = '#FFFFFF';
const COLOR_BORDER         = '#E5E7EB';
const COLOR_TEXT_PRIMARY   = '#141413';
const COLOR_TEXT_SECONDARY = '#73726C';
const COLOR_TEXT_MUTED     = '#9CA3AF';
const COLOR_ROW_HOVER_BG  = '#F5F4F0';

// ─── CONFIG ─────────────────────────────────────────────────────────────────

const TOTAL_BLIPS   = 4000;
const BLIPS_PER_ROW = 50;

const POOL_KEYS: (keyof DatingPoolData['pools'])[] = [
  'metro', 'identity', 'realistic', 'preferred', 'ideal',
];

const LEGEND: { key: keyof DatingPoolData['pools']; label: string }[] = [
  { key: 'metro',     label: 'Metro Singles Pool' },
  { key: 'identity',  label: 'Identity Pool' },
  { key: 'realistic', label: 'Realistic Match Pool' },
  { key: 'preferred', label: 'Preferred Pool' },
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
  const genderHex = COLOR_GENDER[targetGender] ?? COLOR_GENDER.all;
  return {
    metro:     COLOR_BLIP_EMPTY,
    identity:  hexToRgba(genderHex, GENDER_OPACITY.identity),
    realistic: hexToRgba(genderHex, GENDER_OPACITY.realistic),
    preferred: hexToRgba(genderHex, GENDER_OPACITY.preferred),
    ideal:     COLOR_ACTION,
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
) {
  const base = pools.metro.count;

  const counts: Record<string, number> = {};
  POOL_KEYS.forEach(k => {
    counts[k] = Math.min(
      TOTAL_BLIPS,
      Math.round((pools[k].count / base) * TOTAL_BLIPS),
    );
  });

  // Paint from largest → smallest (smaller pools overwrite)
  const blips = new Array<string>(TOTAL_BLIPS).fill(colors.empty);
  const tiers = new Array<string>(TOTAL_BLIPS).fill('empty');
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
  const { blips, tiers, counts } = buildBlipColors(pools, COLORS);

  // State
  let hovered: string | null = null;

  // Inject keyframes for the ideal-blip blink animation
  const styleId = 'dpg-blink-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes dpg-blink {
        0%, 100% { background-color: ${COLOR_ACTION}; }
        50%      { background-color: ${COLOR_BLIP_EMPTY}; }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Card wrapper ──
  const card = el('div', {
    backgroundColor: COLORS.card,
    borderRadius: '6px',
    border: `1px solid ${COLORS.border}`,
    padding: '20px',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  });

  // ── Header ──
  const header = el('div', { marginBottom: '18px' });

  header.appendChild(text('h3', `Dating Pool — ${metro}`, {
    fontSize: '11px',
    fontWeight: '700',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    margin: '0 0 4px 0',
  }));

  header.appendChild(text('p', `${fmt(pools.metro.count)} singles in your dating pool. Each blip ≈ ${fmt(Math.max(1, Math.round(pools.metro.count / TOTAL_BLIPS)))} people.`, {
    fontSize: '12px',
    color: COLORS.textSecondary,
    margin: '0',
    lineHeight: '1.5',
  }));

  card.appendChild(header);

  // ── Blip grid (flexible width) ──
  // Each blip is 2% wide (100% / 50 columns) minus gap. We use a CSS grid
  // with fr units so the blips stretch to fill whatever width the card has.
  const grid = el('div', {
    display: 'grid',
    gridTemplateColumns: `repeat(${BLIPS_PER_ROW}, 1fr)`,
    gap: '3px',
    width: '100%',
  });

  const blipEls: HTMLDivElement[] = [];
  for (let i = 0; i < TOTAL_BLIPS; i++) {
    const dot = el('div', {
      width: '100%',
      aspectRatio: '1',
      borderRadius: '2px',
      backgroundColor: blips[i],
      transition: 'background-color 0.15s ease',
    });

    // Ideal-tier blips get the blink animation
    if (tiers[i] === 'ideal') {
      dot.style.animation = 'dpg-blink 2s ease-in-out infinite';
    }

    blipEls.push(dot);
    grid.appendChild(dot);
  }

  card.appendChild(grid);

  // ── Blip color on hover ──
  function blipColor(idx: number): string {
    if (!hovered) return blips[idx];
    return tiers[idx] === hovered ? blips[idx] : COLORS.empty;
  }

  function repaintBlips() {
    for (let i = 0; i < TOTAL_BLIPS; i++) {
      blipEls[i].style.backgroundColor = blipColor(i);
      // Pause/resume blink animation based on hover isolation
      if (tiers[i] === 'ideal') {
        const show = !hovered || hovered === 'ideal';
        blipEls[i].style.animation = show ? 'dpg-blink 2s ease-in-out infinite' : 'none';
        if (!show) blipEls[i].style.backgroundColor = COLORS.empty;
      }
    }
  }

  // ── Legend + Stats ──
  const legend = el('div', {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  });

  LEGEND.forEach(({ key, label }) => {
    const count = pools[key].count;
    const base  = pools.metro.count;

    const row = el('div', {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      transition: 'opacity 0.15s ease',
      padding: '4px 6px',
      borderRadius: '4px',
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

  container.appendChild(card);
}
