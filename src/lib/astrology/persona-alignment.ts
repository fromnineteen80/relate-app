/**
 * Persona–Astrology Alignment Engine
 *
 * Finds thematic connections between a user's Relate persona
 * (from the assessment) and their birth chart placements.
 * Designed to surface surprising-but-meaningful overlaps that
 * make the cosmic blueprint feel personally relevant.
 */

import type { BirthChartResult } from './engine';
import { SIGN_DATA } from './signs';

type Element = 'Fire' | 'Earth' | 'Air' | 'Water';
type Modality = 'Cardinal' | 'Fixed' | 'Mutable';

// ─── Persona dimension poles mapped to astrological affinities ───

type DimensionAffinity = {
  elements: Element[];
  modalities: Modality[];
  themeLabel: string;
  description: string;
};

// Each letter in the 4-character persona code maps to a pole.
// We map each pole to the astrological elements/modalities that resonate.
const POLE_AFFINITIES: Record<string, DimensionAffinity> = {
  // Physical: A = Fitness (Fire/Earth, Cardinal/Fixed — action, discipline)
  A: {
    elements: ['Fire', 'Earth'],
    modalities: ['Cardinal', 'Fixed'],
    themeLabel: 'Physical Drive',
    description: 'Your focus on fitness and physical presence mirrors Fire\'s initiative and Earth\'s discipline.',
  },
  // Physical: B = Maturity (Water/Earth, Fixed/Mutable — depth, wisdom)
  B: {
    elements: ['Water', 'Earth'],
    modalities: ['Fixed', 'Mutable'],
    themeLabel: 'Earned Wisdom',
    description: 'Your value of maturity and depth aligns with Water\'s emotional intelligence and Earth\'s groundedness.',
  },
  // Social: C = Leadership/Allure (Fire/Air, Cardinal — commands attention)
  C: {
    elements: ['Fire', 'Air'],
    modalities: ['Cardinal'],
    themeLabel: 'Natural Command',
    description: 'Your leadership energy resonates with Fire\'s boldness and Air\'s social magnetism.',
  },
  // Social: D = Presence/Charm (Water/Earth, Fixed — deep connection)
  D: {
    elements: ['Water', 'Earth'],
    modalities: ['Fixed'],
    themeLabel: 'Quiet Depth',
    description: 'Your presence-first nature aligns with Water\'s attunement and Earth\'s calming steadiness.',
  },
  // Lifestyle: E = Adventure/Thrill (Fire/Air, Cardinal/Mutable — exploration)
  E: {
    elements: ['Fire', 'Air'],
    modalities: ['Cardinal', 'Mutable'],
    themeLabel: 'Restless Explorer',
    description: 'Your adventurous spirit resonates with Fire\'s spontaneity and Air\'s need for new horizons.',
  },
  // Lifestyle: F = Stability/Peace (Earth/Water, Fixed — security)
  F: {
    elements: ['Earth', 'Water'],
    modalities: ['Fixed'],
    themeLabel: 'Rooted Builder',
    description: 'Your need for stability mirrors Earth\'s reliability and Water\'s desire for emotional security.',
  },
  // Values: G = Traditional (Earth/Water, Fixed/Cardinal — structure, loyalty)
  G: {
    elements: ['Earth', 'Water'],
    modalities: ['Fixed', 'Cardinal'],
    themeLabel: 'Honor Code',
    description: 'Your traditional values echo Earth\'s respect for what endures and Water\'s deep loyalty.',
  },
  // Values: H = Egalitarian (Air/Fire, Mutable/Cardinal — innovation, freedom)
  H: {
    elements: ['Air', 'Fire'],
    modalities: ['Mutable', 'Cardinal'],
    themeLabel: 'New Frontier',
    description: 'Your egalitarian outlook resonates with Air\'s love of new ideas and Fire\'s refusal to follow blindly.',
  },
};

// ─── Dimension labels for the persona code positions ───
const DIMENSION_LABELS = ['Physical', 'Social', 'Lifestyle', 'Values'];

export type AlignmentPoint = {
  placement: 'Sun' | 'Moon' | 'Rising';
  dimension: string;
  pole: string;
  themeLabel: string;
  explanation: string;
  strength: 'strong' | 'moderate';
};

export type PersonaAlignmentResult = {
  alignments: AlignmentPoint[];
  summary: string;
  overallStrength: 'high' | 'medium' | 'low';
};

/**
 * Analyze how a persona code aligns with a birth chart.
 * Looks at each persona dimension pole against each Big Three placement
 * to find element and modality resonances.
 */
export function analyzePersonaAlignment(
  personaCode: string,
  personaName: string,
  chart: BirthChartResult,
): PersonaAlignmentResult {
  const placements = [
    { key: 'Sun' as const, data: chart.sun },
    { key: 'Moon' as const, data: chart.moon },
    { key: 'Rising' as const, data: chart.rising },
  ];

  const alignments: AlignmentPoint[] = [];

  for (let i = 0; i < personaCode.length && i < 4; i++) {
    const letter = personaCode[i];
    const affinity = POLE_AFFINITIES[letter];
    if (!affinity) continue;

    for (const p of placements) {
      const signData = SIGN_DATA[p.data.sign];
      if (!signData) continue;

      const elementMatch = affinity.elements.includes(signData.element);
      const modalityMatch = affinity.modalities.includes(signData.modality);

      if (elementMatch && modalityMatch) {
        alignments.push({
          placement: p.key,
          dimension: DIMENSION_LABELS[i],
          pole: letter,
          themeLabel: affinity.themeLabel,
          strength: 'strong',
          explanation: buildExplanation(p.key, p.data.sign, signData.element, signData.modality, DIMENSION_LABELS[i], affinity, 'strong'),
        });
      } else if (elementMatch) {
        alignments.push({
          placement: p.key,
          dimension: DIMENSION_LABELS[i],
          pole: letter,
          themeLabel: affinity.themeLabel,
          strength: 'moderate',
          explanation: buildExplanation(p.key, p.data.sign, signData.element, signData.modality, DIMENSION_LABELS[i], affinity, 'moderate'),
        });
      }
    }
  }

  // Sort: strong first, then by placement order (Sun > Moon > Rising)
  const placementOrder = { Sun: 0, Moon: 1, Rising: 2 };
  alignments.sort((a, b) => {
    if (a.strength !== b.strength) return a.strength === 'strong' ? -1 : 1;
    return placementOrder[a.placement] - placementOrder[b.placement];
  });

  // Deduplicate: keep at most one alignment per dimension (the strongest)
  const seen = new Set<string>();
  const deduped = alignments.filter(a => {
    const key = a.dimension;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Cap at 3 best alignments
  const top = deduped.slice(0, 3);

  const strongCount = top.filter(a => a.strength === 'strong').length;
  const overallStrength: 'high' | 'medium' | 'low' =
    strongCount >= 2 ? 'high' : top.length >= 2 ? 'medium' : 'low';

  const summary = buildSummary(personaName, top, overallStrength);

  return { alignments: top, summary, overallStrength };
}

function buildExplanation(
  placement: string,
  sign: string,
  element: Element,
  modality: Modality,
  dimension: string,
  affinity: DimensionAffinity,
  strength: 'strong' | 'moderate',
): string {
  if (strength === 'strong') {
    return `Your ${placement} in ${sign} (${element}, ${modality}) strongly resonates with your ${dimension.toLowerCase()} orientation. ${affinity.description}`;
  }
  return `Your ${placement} in ${sign} shares ${element} energy with your ${dimension.toLowerCase()} nature. The elemental connection is real, even if the rhythm differs.`;
}

function buildSummary(
  personaName: string,
  alignments: AlignmentPoint[],
  strength: 'high' | 'medium' | 'low',
): string {
  if (alignments.length === 0) {
    return `Your ${personaName} persona and your cosmic blueprint operate on different wavelengths. This is not a contradiction — it means your chart reveals dimensions of you that the assessment does not capture. The tension between the two is where your complexity lives.`;
  }

  const dims = alignments.map(a => a.dimension.toLowerCase());
  const dimList = dims.length === 1
    ? dims[0]
    : dims.slice(0, -1).join(', ') + ' and ' + dims[dims.length - 1];

  if (strength === 'high') {
    return `Your ${personaName} persona and your stars are deeply aligned. The patterns that showed up in your assessment — especially around ${dimList} — are echoed in your birth chart. Who you are on paper and who you are in the cosmos tell the same story.`;
  }
  if (strength === 'medium') {
    return `There is a meaningful thread between your ${personaName} persona and your chart, particularly around ${dimList}. Your stars confirm some of what the assessment revealed, while adding cosmic nuance the questions could not capture.`;
  }
  return `Your ${personaName} persona and your birth chart share a subtle connection around ${dimList}. The overlap is not loud, but it is there — a quiet confirmation that your cosmic wiring and your relational instincts are not as separate as they might seem.`;
}
