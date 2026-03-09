import { useState } from "react";

// ─── SAMPLE DATA (replace with live props) ───────────────────────────────────
const SAMPLE = {
  metro: "St. Louis",
  metroPopulation: 2_809_414,
  pools: {
    metro:     { label: "Metro Singles Pool",       count: 107_941 },
    identity:  { label: "Identity Pool",            count:  83_222 },
    realistic: { label: "Your Realistic Match Pool", count:  21_971 },
    preferred: { label: "Your Preferred Lifestyle Pool", count:   2_177 },
    ideal:     { label: "Your Ideal Match Pool",    count:      53 },
  },
};

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
// Replace TBD_* values with your actual design system tokens before shipping.
//
// COLOR LOGIC FOR POOL LAYERS:
//   metro    → COLOR_BLIP_EMPTY (gray — unlit / background pool)
//   identity → COLOR_BLACK (your near-black brand color)
//   realistic, preferred → COLOR_GENDER (gender-specific hue, stepping down 20%
//              opacity each tier, starting at 80%: realistic=0.80, preferred=0.60)
//   ideal    → COLOR_ACTION (your accent/CTA color, fully opaque)
//
// GENDER COLOR RULE:
//   Seeking women → TBD_COLOR_GENDER_WOMEN
//   Seeking men   → TBD_COLOR_GENDER_MEN
//   Seeking all   → TBD_COLOR_GENDER_ALL (or pick one)
//
// The component derives rgba strings automatically from the base gender hex.
// You only need to supply the hex; opacity is computed per pool tier.

const COLOR_BLIP_EMPTY   = "TBD_COLOR_BLIP_EMPTY";   // gray — metro pool & unlit blips
const COLOR_BLACK        = "TBD_COLOR_BLACK";          // identity pool layer
const COLOR_ACTION       = "TBD_COLOR_ACTION";         // ideal pool layer (CTA/accent)

// Gender-specific base colors (hex only — opacity applied per tier below)
const COLOR_GENDER = {
  women: "TBD_COLOR_GENDER_WOMEN",
  men:   "TBD_COLOR_GENDER_MEN",
  all:   "TBD_COLOR_GENDER_ALL",
};

// Opacity ladder for gender-colored tiers, stepping down 20% per level
// realistic = 80%, preferred = 60%
// Add more entries here if you add pool tiers between identity and ideal.
const GENDER_OPACITY = {
  realistic: 0.80,
  preferred: 0.60,
};

// UI chrome tokens
const COLOR_CARD           = "TBD_COLOR_CARD";          // card background
const COLOR_BORDER         = "TBD_COLOR_BORDER";        // card border
const COLOR_TEXT_PRIMARY   = "TBD_COLOR_TEXT_PRIMARY";
const COLOR_TEXT_SECONDARY = "TBD_COLOR_TEXT_SECONDARY";
const COLOR_TEXT_MUTED     = "TBD_COLOR_TEXT_MUTED";
const COLOR_ROW_HOVER_BG   = "TBD_COLOR_ROW_HOVER_BG";  // legend row hover fill

// Converts a hex color + alpha into rgba string
// e.g. hexToRgba("#4A7C59", 0.8) → "rgba(74, 124, 89, 0.8)"
function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Build the full COLORS map at runtime using the gender prop
function buildColors(targetGender) {
  const genderHex = COLOR_GENDER[targetGender] ?? COLOR_GENDER.all;
  return {
    metro:     COLOR_BLIP_EMPTY,
    identity:  COLOR_BLACK,
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

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const TOTAL_BLIPS   = 4000;
const BLIPS_PER_ROW = 50;
const BLIP_SIZE     = 9;    // px — width & height of each pill
const BLIP_GAP      = 3;    // px

// Pool keys ordered largest → smallest (determines paint priority)
const POOL_KEYS = ["metro", "identity", "realistic", "preferred", "ideal"];

// ─── LEGEND CONFIG ────────────────────────────────────────────────────────────
const LEGEND = [
  { key: "metro",     label: "Metro Singles Pool" },
  { key: "identity",  label: "Identity Pool" },
  { key: "realistic", label: "Realistic Match Pool" },
  { key: "preferred", label: "Preferred Lifestyle Pool" },
  { key: "ideal",     label: "Ideal Match Pool" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function pct(count, total) {
  const p = (count / total) * 100;
  if (p >= 1)    return `${Math.round(p)}%`;
  if (p >= 0.1)  return `${p.toFixed(1)}%`;
  if (p >= 0.01) return `${p.toFixed(2)}%`;
  return `${p.toFixed(3)}%`;
}

function fmt(n) {
  return n.toLocaleString();
}

// Assign a color to each blip index based on pool thresholds.
// Each pool is proportional to TOTAL_BLIPS relative to the metro pool.
function buildBlipColors(pools, COLORS) {
  const base = pools.metro.count;

  // Compute blip counts for each pool, floored so they never exceed TOTAL_BLIPS
  const counts = {};
  POOL_KEYS.forEach((k) => {
    counts[k] = Math.min(
      TOTAL_BLIPS,
      Math.round((pools[k].count / base) * TOTAL_BLIPS)
    );
  });

  // Build per-blip color: last matching pool wins (smallest pool paints over larger)
  const blips = new Array(TOTAL_BLIPS).fill(COLORS.empty);

  // Paint from largest → smallest so smaller pools overwrite
  POOL_KEYS.forEach((k) => {
    const n = counts[k];
    for (let i = 0; i < n; i++) {
      blips[i] = COLORS[k];
    }
  });

  return { blips, counts };
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function DatingPoolGrid({ data = SAMPLE, targetGender = "women" }) {
  const COLORS = buildColors(targetGender);
  const [hovered, setHovered] = useState(null); // pool key
  const { pools, metro, metroPopulation } = data;
  const { blips, counts } = buildBlipColors(pools, COLORS);

  // Determine dim state: if something is hovered, dim blips not belonging to that pool
  function blipColor(idx) {
    if (!hovered) return blips[idx];
    // Find the "best" pool this blip belongs to
    let assignedKey = null;
    for (let ki = POOL_KEYS.length - 1; ki >= 0; ki--) {
      if (idx < counts[POOL_KEYS[ki]]) {
        assignedKey = POOL_KEYS[ki];
        break;
      }
    }
    if (!assignedKey) {
      // empty blip — always dim when hovering
      return COLORS.empty;
    }
    return assignedKey === hovered ? blips[idx] : COLORS.empty;
  }

  const gridWidth = BLIPS_PER_ROW * BLIP_SIZE + (BLIPS_PER_ROW - 1) * BLIP_GAP;

  return (
    <div style={{
      backgroundColor: COLORS.card,
      borderRadius: "6px",
      border: `1px solid ${COLORS.border}`,
      padding: "20px",
      maxWidth: gridWidth + 40,
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>

      {/* Header */}
      <div style={{ marginBottom: "18px" }}>
        <h3 style={{
          fontSize: "11px",
          fontWeight: "700",
          color: COLORS.textPrimary,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          margin: "0 0 4px 0",
        }}>
          Dating Pool — {metro}
        </h3>
        <p style={{
          fontSize: "12px",
          color: COLORS.textSecondary,
          margin: 0,
          lineHeight: "1.5",
        }}>
          Each blip represents {fmt(Math.round(pools.metro.count / TOTAL_BLIPS))} people.
          Total metro population {fmt(metroPopulation)}.
        </p>
      </div>

      {/* Blip Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${BLIPS_PER_ROW}, ${BLIP_SIZE}px)`,
        gap: `${BLIP_GAP}px`,
        width: gridWidth,
      }}>
        {blips.map((_, i) => (
          <div
            key={i}
            style={{
              width:  BLIP_SIZE,
              height: BLIP_SIZE,
              borderRadius: "2px",
              backgroundColor: blipColor(i),
              transition: "background-color 0.15s ease",
            }}
          />
        ))}
      </div>

      {/* Legend + Stats */}
      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {LEGEND.map(({ key, label }) => {
          const count  = pools[key].count;
          const base   = pools.metro.count;
          const isActive = !hovered || hovered === key;

          return (
            <div
              key={key}
              onMouseEnter={() => setHovered(key)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                opacity: isActive ? 1 : 0.4,
                transition: "opacity 0.15s ease",
                padding: "4px 6px",
                borderRadius: "4px",
                backgroundColor: hovered === key ? COLORS.rowHoverBg : "transparent",
              }}
            >
              {/* Color swatch */}
              <div style={{
                width: "14px",
                height: "14px",
                borderRadius: "3px",
                backgroundColor: COLORS[key],
                flexShrink: 0,
                border: "none",
              }} />

              {/* Label */}
              <span style={{
                fontSize: "12px",
                color: COLORS.textPrimary,
                flex: 1,
                fontWeight: hovered === key ? "600" : "400",
              }}>
                {label}
              </span>

              {/* Count */}
              <span style={{
                fontSize: "12px",
                fontWeight: "600",
                color: COLORS.textPrimary,
                fontFamily: "monospace",
                marginLeft: "auto",
                paddingLeft: "12px",
              }}>
                {fmt(count)}
              </span>

              {/* Percentage — relative to metro pool */}
              {key !== "metro" && (
                <span style={{
                  fontSize: "11px",
                  color: COLORS.textSecondary,
                  width: "44px",
                  textAlign: "right",
                }}>
                  {pct(count, base)}
                </span>
              )}
              {key === "metro" && (
                <span style={{ width: "44px" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p style={{
        fontSize: "10px",
        color: COLORS.textMuted,
        margin: "14px 0 0 0",
        lineHeight: "1.5",
      }}>
        Hover a row to isolate that pool in the grid. Each color layer overwrites the prior,
        so smaller pools are always visible despite representing fewer blips.
      </p>
    </div>
  );
}
