/**
 * prose.ts — Content sanitization for RELATE
 *
 * Catches em dashes, en dashes, mojibake (â€" â€™ â€œ etc.), and replaces
 * them with clean punctuation so all user-facing text reads as polished,
 * human prose. Designed to be zero-cost on short strings and negligible
 * on long ones — pure regex, no DOM, no async.
 *
 * Usage:
 *   import { cleanProse } from '@/lib/prose';
 *   const clean = cleanProse(rawText);
 */

// ── Mojibake lookup (UTF-8 bytes misread as Latin-1) ─────────────────
const MOJIBAKE: [RegExp, string][] = [
  [/â€"/g, ','],     // em dash
  [/â€"/g, ','],     // en dash variant
  [/â€™/g, "'"],     // right single quote
  [/â€˜/g, "'"],     // left single quote
  [/â€œ/g, '"'],     // left double quote
  [/â€\x9d/g, '"'],  // right double quote (raw byte)
  [/â€¦/g, '...'],   // ellipsis
  [/Ã©/g, 'é'],      // accented e
  [/Ã¨/g, 'è'],
  [/Ã¢/g, 'â'],
  [/Ã®/g, 'î'],
  [/Ã´/g, 'ô'],
  [/Ã»/g, 'û'],
];

/**
 * Clean a string of em/en dashes, mojibake, and other AI-slop artifacts.
 * Returns the original string if null/undefined/empty (no allocation).
 */
export function cleanProse(text: string | null | undefined): string {
  if (!text) return text as string ?? '';

  let s = text;

  // 1. Fix mojibake first (before dash rules, since â€" is a mojibake em dash)
  for (const [pattern, replacement] of MOJIBAKE) {
    s = s.replace(pattern, replacement);
  }

  // 2. Em dashes and en dashes → comma (preserves flow, avoids choppiness)
  //    Spaced:  "word — word"  →  "word, word"
  //    Tight:   "word—word"    →  "word, word"
  s = s.replace(/\s*[—–]\s*/g, ', ');

  // 3. Clean up punctuation collisions from the replacements above
  s = s.replace(/,\s*,/g, ',');        // double commas
  s = s.replace(/\.\s*,/g, '.');       // period then comma
  s = s.replace(/,\s*\./g, '.');       // comma then period
  s = s.replace(/\s{2,}/g, ' ');       // collapsed whitespace
  s = s.replace(/,(\S)/g, ', $1');     // ensure space after comma

  return s;
}

/**
 * Deep-clean a JSON-serializable object: walks every string value and
 * applies cleanProse. Safe for report objects, growth plans, etc.
 * Returns a new object (does not mutate the input).
 */
export function cleanProseDeep<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return cleanProse(obj) as unknown as T;
  if (Array.isArray(obj)) return obj.map(cleanProseDeep) as unknown as T;
  if (typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      out[k] = cleanProseDeep(v);
    }
    return out as T;
  }
  return obj;
}
