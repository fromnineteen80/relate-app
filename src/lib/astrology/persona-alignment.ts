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
  poleName: string;
};

// Each letter in the 4-character persona code maps to a pole.
// We map each pole to the astrological elements/modalities that resonate.
const POLE_AFFINITIES: Record<string, DimensionAffinity> = {
  A: { elements: ['Fire', 'Earth'], modalities: ['Cardinal', 'Fixed'], themeLabel: 'Physical Drive', poleName: 'Fitness' },
  B: { elements: ['Water', 'Earth'], modalities: ['Fixed', 'Mutable'], themeLabel: 'Earned Wisdom', poleName: 'Maturity' },
  C: { elements: ['Fire', 'Air'], modalities: ['Cardinal'], themeLabel: 'Natural Command', poleName: 'Leadership' },
  D: { elements: ['Water', 'Earth'], modalities: ['Fixed'], themeLabel: 'Quiet Depth', poleName: 'Presence' },
  E: { elements: ['Fire', 'Air'], modalities: ['Cardinal', 'Mutable'], themeLabel: 'Restless Explorer', poleName: 'Adventure' },
  F: { elements: ['Earth', 'Water'], modalities: ['Fixed'], themeLabel: 'Rooted Builder', poleName: 'Stability' },
  G: { elements: ['Earth', 'Water'], modalities: ['Fixed', 'Cardinal'], themeLabel: 'Honor Code', poleName: 'Traditional' },
  H: { elements: ['Air', 'Fire'], modalities: ['Mutable', 'Cardinal'], themeLabel: 'New Frontier', poleName: 'Egalitarian' },
};

// ─── Placement-specific explanation templates ───
// Each pole × placement combination gets a concrete read that names the
// actual trait from the assessment and ties it to what that placement governs.

type PlacementKey = 'Sun' | 'Moon' | 'Rising';

const STRONG_READS: Record<string, Record<PlacementKey, (sign: string) => string>> = {
  // Physical poles
  A: {
    Sun: (s) => `Your ${s} Sun is built for action and discipline — the same drive that showed up in your assessment as valuing fitness and physical presence. Your identity and your body speak the same language.`,
    Moon: (s) => `Your ${s} Moon processes emotion through movement and physicality. That lines up with your assessment: you value fitness not as vanity but as an expression of who you are at a gut level.`,
    Rising: (s) => `People read your ${s} Rising as physically confident before you say a word. Your assessment confirmed it — you lead with presence and your body backs it up.`,
  },
  B: {
    Sun: (s) => `Your ${s} Sun carries the weight of someone who has been through things and come out grounded. Your assessment flagged the same pattern: you value maturity and depth over surface-level attraction.`,
    Moon: (s) => `Your ${s} Moon needs emotional substance, not sparkle. That is exactly what your assessment revealed — you are drawn to wisdom and lived experience because your emotional core demands it.`,
    Rising: (s) => `Your ${s} Rising gives off groundedness that people trust immediately. Your assessment said the same thing from a different angle: maturity is not just what you seek, it is what you project.`,
  },
  // Social poles
  C: {
    Sun: (s) => `Your ${s} Sun is wired to lead and command attention. Your assessment confirmed this is core to your identity — you do not follow, you set the direction.`,
    Moon: (s) => `Your ${s} Moon needs to feel in charge of the emotional room. Your assessment showed the same thing: leadership is not just social for you, it is how you process safety.`,
    Rising: (s) => `Your ${s} Rising walks into a room and people look. Your assessment called it leadership or allure — your stars call it ${s} energy. Same thing, different language.`,
  },
  D: {
    Sun: (s) => `Your ${s} Sun is built for one-on-one depth, not working the room. Your assessment showed the same thing: you value presence — being truly seen and seeing others — over commanding attention.`,
    Moon: (s) => `Your ${s} Moon needs to feel emotionally held, not entertained. Your assessment flagged presence as your social orientation, and your Moon confirms it — connection means depth, not breadth.`,
    Rising: (s) => `People sense something perceptive about your ${s} Rising before you speak. Your assessment identified this as presence — the ability to make someone feel like the only person in the room.`,
  },
  // Lifestyle poles
  E: {
    Sun: (s) => `Your ${s} Sun runs on novelty and momentum. Your assessment called it adventure — you need a life that moves, explores, and refuses to get stale.`,
    Moon: (s) => `Your ${s} Moon gets restless when life gets predictable. That matches your assessment exactly: emotionally, you need new experiences to feel alive, not just comfortable.`,
    Rising: (s) => `Your ${s} Rising broadcasts energy and spontaneity. People expect adventure from you — and your assessment says that is exactly what you are built to deliver.`,
  },
  F: {
    Sun: (s) => `Your ${s} Sun is wired to build something lasting, not chase the next thrill. Your assessment identified this as stability — you want a foundation, a home base, a life that holds together.`,
    Moon: (s) => `Your ${s} Moon needs to feel safe before it can feel anything else. Your assessment said the same thing: stability is not boring to you, it is the prerequisite for everything that matters.`,
    Rising: (s) => `Your ${s} Rising reads as steady and reliable to everyone around you. Your assessment confirmed it — stability is not just what you want, it is what you radiate.`,
  },
  // Values poles
  G: {
    Sun: (s) => `Your ${s} Sun trusts what has been tested over time. Your assessment identified traditional values — loyalty, commitment, and honoring what works — and your stars say the same thing at an identity level.`,
    Moon: (s) => `Your ${s} Moon holds onto what matters. Your assessment flagged traditional values, and your Moon confirms it: emotionally, you need structure and loyalty, not reinvention.`,
    Rising: (s) => `Your ${s} Rising projects someone who honors their word. Your assessment called it traditional — your stars call it ${s}. Both mean: you do not bend on what is right.`,
  },
  H: {
    Sun: (s) => `Your ${s} Sun questions defaults and builds its own rules. Your assessment identified egalitarian values, and your Sun confirms it: equality and co-creation are not preferences, they are your identity.`,
    Moon: (s) => `Your ${s} Moon needs fairness to feel safe. Your assessment called it egalitarian — your Moon says the same: if the power is not shared, the emotional foundation cracks.`,
    Rising: (s) => `Your ${s} Rising signals independence and openness. People sense you are not following a script — your assessment confirmed it: your values are self-authored, not inherited.`,
  },
};

const MODERATE_READS: Record<string, Record<PlacementKey, (sign: string) => string>> = {
  A: {
    Sun: (s) => `Your ${s} Sun shares the elemental energy behind your fitness orientation, even though the rhythm differs. The drive is there — it just expresses differently than your assessment might suggest.`,
    Moon: (s) => `Your ${s} Moon carries some of the same elemental weight as your physical drive. The connection is quieter than a full match but it is real — your body and your emotions are not as separate as they seem.`,
    Rising: (s) => `Your ${s} Rising hints at the physical confidence your assessment identified. The element is shared — the approach just takes a different shape.`,
  },
  B: {
    Sun: (s) => `Your ${s} Sun shares elemental ground with your value of maturity. The depth your assessment revealed has cosmic roots, even if they express through a different rhythm.`,
    Moon: (s) => `Your ${s} Moon and your maturity orientation share the same element. Emotionally, the groundedness your assessment identified has a cosmic undercurrent.`,
    Rising: (s) => `Your ${s} Rising carries some of the grounded energy that matches your maturity pole. The connection is subtle but people sense it.`,
  },
  C: {
    Sun: (s) => `Your ${s} Sun shares the elemental fire behind your leadership nature. The command your assessment identified has cosmic backing, even if the tempo differs.`,
    Moon: (s) => `Your ${s} Moon carries elemental energy that connects to your leadership instinct. The need to steer is not just social — it is wired into how you feel.`,
    Rising: (s) => `Your ${s} Rising shares the element behind your leadership pole. People catch a glimpse of it before you even engage.`,
  },
  D: {
    Sun: (s) => `Your ${s} Sun shares the element behind your presence orientation. The one-on-one depth your assessment flagged has a cosmic thread, even if the delivery differs.`,
    Moon: (s) => `Your ${s} Moon shares elemental energy with your presence nature. The need to truly connect runs deeper than your assessment could fully capture.`,
    Rising: (s) => `Your ${s} Rising carries a trace of the attunement your assessment called presence. It is not the loudest signal, but perceptive people pick up on it.`,
  },
  E: {
    Sun: (s) => `Your ${s} Sun shares the element behind your adventurous streak. The restlessness your assessment identified has cosmic roots — it just moves at a different pace.`,
    Moon: (s) => `Your ${s} Moon carries elemental energy that connects to your need for adventure. The craving for novelty is emotional, not just logistical.`,
    Rising: (s) => `Your ${s} Rising shares the element behind your adventure orientation. People sense the explorer in you, even in quieter moments.`,
  },
  F: {
    Sun: (s) => `Your ${s} Sun shares the element behind your stability needs. The desire for solid ground your assessment revealed has a cosmic echo.`,
    Moon: (s) => `Your ${s} Moon carries elemental energy that connects to your need for stability. The craving for security runs through your emotional baseline.`,
    Rising: (s) => `Your ${s} Rising shares the element behind your stability orientation. People read you as more grounded than you might feel on chaotic days.`,
  },
  G: {
    Sun: (s) => `Your ${s} Sun shares the element behind your traditional values. The loyalty and commitment your assessment flagged have a cosmic thread running through your identity.`,
    Moon: (s) => `Your ${s} Moon carries elemental energy that connects to your traditional values. The need for structure and trust is not just philosophical — it is emotional.`,
    Rising: (s) => `Your ${s} Rising shares the element behind your traditional values. People sense your reliability before they know the details.`,
  },
  H: {
    Sun: (s) => `Your ${s} Sun shares the element behind your egalitarian values. The drive toward fairness and co-creation your assessment found has a cosmic echo in your identity.`,
    Moon: (s) => `Your ${s} Moon carries elemental energy that connects to your egalitarian instinct. The need for equal partnership is not just an idea — it is something you feel.`,
    Rising: (s) => `Your ${s} Rising shares the element behind your egalitarian values. People sense your openness before you even state your position.`,
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
          explanation: buildExplanation(p.key, p.data.sign, signData.element, signData.modality, DIMENSION_LABELS[i], affinity, letter, 'strong'),
        });
      } else if (elementMatch) {
        alignments.push({
          placement: p.key,
          dimension: DIMENSION_LABELS[i],
          pole: letter,
          themeLabel: affinity.themeLabel,
          strength: 'moderate',
          explanation: buildExplanation(p.key, p.data.sign, signData.element, signData.modality, DIMENSION_LABELS[i], affinity, letter, 'moderate'),
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
  placement: PlacementKey,
  sign: string,
  _element: Element,
  _modality: Modality,
  _dimension: string,
  affinity: DimensionAffinity,
  poleLetter: string,
  strength: 'strong' | 'moderate',
): string {
  const reads = strength === 'strong' ? STRONG_READS : MODERATE_READS;
  const poleReads = reads[poleLetter];
  if (poleReads?.[placement]) {
    return poleReads[placement](sign);
  }
  // Fallback (should not happen)
  return `Your ${placement} in ${sign} connects to your ${affinity.poleName.toLowerCase()} nature in a way the assessment alone could not reveal.`;
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
