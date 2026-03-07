/**
 * Lightweight wrapper around Google Material Symbols Rounded.
 * Usage: <Icon name="star" className="text-accent" size={20} />
 *
 * Uses the same icon names as Material Symbols:
 * https://fonts.google.com/icons?icon.set=Material+Symbols
 *
 * Common mappings from old Unicode symbols:
 *   • bullet     → "circle"
 *   ◆ diamond    → "diamond"
 *   ◇ outline    → "diamond" (fill=0)
 *   ○ circle     → "radio_button_unchecked"
 *   ◎ circle-dot → "adjust"
 *   ◉ ring       → "lens"
 *   ★ star       → "star" (fill=1)
 *   ☆ star empty → "star" (fill=0)
 *   ✦ sparkle    → "star_rate"
 *   ⚡ bolt       → "bolt"
 *   ♡ heart      → "favorite"
 *   ↑ arrow up   → "arrow_upward"
 *   ↓ arrow down → "arrow_downward"
 *   → arrow right→ "arrow_forward"
 *   ▲ chevron up → "expand_less"
 *   ▼ chevron dn → "expand_more"
 */

type IconProps = {
  /** Material Symbols icon name (e.g. "star", "diamond", "bolt") */
  name: string;
  className?: string;
  /** Icon size in px — maps to font-size */
  size?: number;
  /** Whether the icon is filled (default: true) */
  fill?: boolean;
};

export function Icon({ name, className = '', size = 20, fill = true }: IconProps) {
  return (
    <span
      className={`material-symbols-rounded inline-flex items-center justify-center leading-none flex-shrink-0 ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
