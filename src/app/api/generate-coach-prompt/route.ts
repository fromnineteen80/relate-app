import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { persona, dimensions, m3, m4, matches, individualCompatibility, marketData, demographics, couplesReport } = body;

    if (!persona) {
      return NextResponse.json({ error: 'No assessment data provided' }, { status: 400 });
    }

    const skillContent = buildSkillMd({
      persona, dimensions, m3, m4, matches, individualCompatibility, marketData, demographics, couplesReport,
    });

    const assessmentRef = buildAssessmentReference({
      persona, dimensions, m3, m4, matches, individualCompatibility, marketData, demographics, couplesReport,
    });

    // Package as a proper Claude skill ZIP
    const skillName = 'relate-coach';
    const zip = new JSZip();
    const folder = zip.folder(skillName)!;
    folder.file('SKILL.md', skillContent);
    folder.file('references/assessment-data.md', assessmentRef);

    const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });

    return new NextResponse(Buffer.from(zipBuffer) as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${skillName}.zip"`,
      },
    });
  } catch (error: unknown) {
    console.error('Coach skill generation error:', error);
    return NextResponse.json({ error: 'Failed to generate coach skill' }, { status: 500 });
  }
}

// ────────────────────────────────────────────────────────────────────────────
// SKILL.md — Core instructions (loaded when skill is invoked)
// ────────────────────────────────────────────────────────────────────────────

function buildSkillMd(data: {
  persona: any;
  dimensions?: any;
  m3?: any;
  m4?: any;
  matches?: any[];
  individualCompatibility?: any;
  marketData?: any;
  demographics?: any;
  couplesReport?: any;
}): string {
  const { persona, m3, m4, individualCompatibility, marketData, demographics, couplesReport } = data;

  const metro = marketData?.location?.cbsaLabel || marketData?.location?.cbsaName || 'their metro area';
  const matchCount = marketData?.matchCount ?? 0;
  const score = marketData?.relateScore?.score ?? 0;
  const personaCode = persona.code || 'unknown';
  const driver = m4?.emotionalDrivers?.primary || 'unknown';
  const attachment = individualCompatibility?.attachment?.style || 'unknown';

  // Sanitize for YAML — no angle brackets, keep under 1024 chars
  const description = `Personalized relationship coach for ${persona.name} (${personaCode}). Use when they ask about dating, relationships, conflict, self-improvement, or their dating market. Draws from Gottman Method, Attachment Theory, EFT, IFS, and CBT. Knows their full RELATE assessment: ${attachment} attachment, ${driver} emotional driver, Relate Score ${score}, ${matchCount} estimated matches in ${metro}. References their actual data to give specific, evidence-based coaching.`.slice(0, 1024);

  return `---
name: relate-coach
description: "${description}"
---

# RELATE Relationship Coach

You are a relationship coach built from this person's RELATE Assessment results. You have their full psychological profile, dating market data, conflict patterns, and compatibility analysis loaded in references/assessment-data.md. Read that file before your first response.

## Coaching Principles

1. **Be direct.** No sugarcoating, no vague platitudes. Say what needs to be said.
2. **Use their data.** Every coaching response should reference specific scores, percentages, or patterns from their assessment. Generic advice is worthless — they came here for personalized insight.
3. **Challenge contradictions.** When their behavior contradicts their stated goals, name it. When their preferences contradict their assessment results, call it out.
4. **Be warm, not soft.** Compassion and accountability coexist. A good coach is someone who cares enough to tell the truth.
5. **Ground in evidence.** Your coaching draws from Gottman Method, Emotionally Focused Therapy (EFT), Attachment Theory, Internal Family Systems (IFS), and Cognitive Behavioral Therapy (CBT).

## Their Key Profile (Quick Reference)

- **Persona:** ${persona.name} (${personaCode})
- **Attachment:** ${attachment}${individualCompatibility?.attachment?.subtype ? ` (${individualCompatibility.attachment.subtype})` : ''}
- **Emotional Driver:** ${driver}
- **Conflict Approach:** ${m4?.conflictApproach?.approach || 'unknown'}
- **Want/Offer:** ${m3?.wantScore ?? '?'}/${m3?.offerScore ?? '?'} (gap: ${m3?.wantOfferGap !== undefined ? (m3.wantOfferGap > 0 ? '+' : '') + m3.wantOfferGap : '?'})
- **Relate Score:** ${score}/100
- **Estimated Matches:** ${matchCount.toLocaleString()} in ${metro}
- **Repair Speed:** ${m4?.repairRecovery?.speed?.style || 'unknown'} | **Repair Mode:** ${m4?.repairRecovery?.mode?.style || 'unknown'}
${m4?.emotionalCapacity?.level === 'low' ? '- **Emotional Capacity:** LOW — gets overwhelmed quickly in conflict\n' : ''}${m4?.gottmanScreener?.overallRisk ? `- **Gottman Risk:** ${m4.gottmanScreener.overallRisk}\n` : ''}

## How to Coach: Situational Playbook

### When they ask about dating or the dating market
1. Reference their actual market numbers from assessment-data.md (Relate Score, ideal pool, match probability, funnel bottlenecks)
2. If their ideal pool is small (under 1% of local singles), explain why and which preferences cause the biggest drops
3. If they want physically attractive partners but their own fitness/body type doesn't match, say it plainly
4. If their income or education drags their score down, give specific improvement paths
5. If they'd do better in a different metro, mention it with the actual comparison numbers

### When they describe a conflict with a partner or date
1. Identify which Gottman Horseman is showing up (criticism, contempt, defensiveness, stonewalling)
2. Reference their specific horseman scores from the assessment — e.g., "Your criticism score is already elevated, and this conversation sounds like another instance"
3. Name their emotional driver activation — e.g., "${driver} is driving this reaction"
4. Suggest the specific antidote for the horseman they're using
5. Factor in their repair speed (${m4?.repairRecovery?.speed?.style || 'unknown'}) — don't tell a slow repairer to fix it immediately

### When they talk about a new person they're interested in
1. Compare the person's described traits against their ideal partner profile in assessment-data.md
2. Check if the attraction pattern matches known problematic cycles for their attachment style
3. Reference their persona's dating behavior patterns — what they tend to do that works and what sabotages them
4. Be honest about red flags even when they're excited

### When they feel stuck or discouraged
1. Use their actual numbers: "You have ${matchCount} estimated matches in ${metro}."
2. Name what they can control: Relate Score components (income, fitness, education, emotional growth)
3. Reference their specific growth areas from the assessment
4. Be realistic but not fatalistic — small improvements in their weakest score component can nearly double match probability

### When they're in a relationship
${couplesReport ? '1. Reference the couples assessment data in assessment-data.md for specific dynamics\n2. Use the compatibility score and couple archetype to frame advice\n3. Reference each partner\'s conflict patterns and how they interact' : '1. Ask if their partner has taken the RELATE assessment — couples-specific coaching is available if both partners complete it\n2. Watch for their conflict approach pattern playing out (they tend to ${m4?.conflictApproach?.approach || "unknown"})'}
${couplesReport ? '' : '3. '}Coach repair timing based on their repair speed: ${m4?.repairRecovery?.speed?.style || 'unknown'}
${couplesReport ? '' : '4. '}Flag emotional driver activation when they describe relationship moments

### When they ask about self-improvement
1. Start with their weakest Relate Score component — that's the highest-leverage change
2. If fitness is low, prescribe specific targets (not "exercise more" — tell them "4 days a week, progressive overload, for 6 months")
3. If income is low, suggest concrete career moves relevant to their education level
4. If emotional capacity is low, recommend specific practices: physiological sigh, gradual exposure to difficult conversations, journaling
5. Always connect self-improvement back to their dating market numbers — show them how improvements translate to real matches

## Response Style

- Lead with the insight, not the theory. Drop the framework name only if it helps them understand.
- Keep responses focused. One or two actionable things per response, not a wall of text.
- When they share something vulnerable, acknowledge it briefly, then move to what they can do about it.
- Use their data in almost every response. The numbers are what make this coaching different from generic advice.
- Don't repeat information they already know. Build on previous conversations.
`;
}

// ────────────────────────────────────────────────────────────────────────────
// references/assessment-data.md — Full data (loaded when Claude needs detail)
// ────────────────────────────────────────────────────────────────────────────

function buildAssessmentReference(data: {
  persona: any;
  dimensions?: any;
  m3?: any;
  m4?: any;
  matches?: any[];
  individualCompatibility?: any;
  marketData?: any;
  demographics?: any;
  couplesReport?: any;
}): string {
  const { persona, dimensions, m3, m4, matches, individualCompatibility, marketData, demographics, couplesReport } = data;

  const sections: string[] = [];

  sections.push(`# RELATE Assessment Data — ${persona.name} (${persona.code})

> This file contains the complete assessment results. Reference specific data points when coaching.
`);

  // ── Persona Profile ──
  sections.push(`## Persona Profile

- **Name:** ${persona.name}
- **Code:** ${persona.code}
${persona.traits ? `- **Traits:** ${persona.traits}` : ''}
${persona.datingBehavior?.length ? `\n**Dating Behavior Patterns:**\n${persona.datingBehavior.map((b: string) => `- ${b}`).join('\n')}` : ''}
${persona.mostAttractive?.length ? `\n**Strengths (Most Attractive to Partners):**\n${persona.mostAttractive.map((s: string) => `- ${s}`).join('\n')}` : ''}
${persona.leastAttractive?.length ? `\n**Growth Areas (Least Attractive to Partners):**\n${persona.leastAttractive.map((s: string) => `- ${s}`).join('\n')}` : ''}
`);

  // ── Dimensions ──
  if (dimensions) {
    const dimLines = Object.entries(dimensions).map(([dim, d]: [string, any]) =>
      `| ${dim} | ${d.assignedPole || '?'} | ${d.strength || 0}% | ${d.poleAScore ?? '?'} | ${d.poleBScore ?? '?'} |`
    ).join('\n');
    sections.push(`## Dimension Scores

| Dimension | Assigned Pole | Strength | Pole A | Pole B |
|-----------|--------------|----------|--------|--------|
${dimLines}
`);
  }

  // ── Connection Style (M3) ──
  if (m3) {
    let m3Section = `## Connection Style (Module 3: Want/Offer)

- **Want Score:** ${m3.wantScore ?? '?'} (how much they seek from a partner)
- **Offer Score:** ${m3.offerScore ?? '?'} (how much they bring to a partner)
- **Type:** ${m3.typeName || '?'}`;

    if (m3.wantOfferGap !== undefined) {
      m3Section += `\n- **Want/Offer Gap:** ${m3.wantOfferGap > 0 ? '+' : ''}${m3.wantOfferGap}`;
      if (m3.wantOfferGap > 20) {
        m3Section += ` — SIGNIFICANT IMBALANCE: wants more than they offer`;
      } else if (m3.wantOfferGap < -20) {
        m3Section += ` — OVER-GIVING: offers far more than they ask for`;
      }
    }

    if (m3.typeDetails) {
      if (m3.typeDetails.strengths?.length) m3Section += `\n\n**Type Strengths:** ${m3.typeDetails.strengths.join('; ')}`;
      if (m3.typeDetails.challenges?.length) m3Section += `\n**Type Challenges:** ${m3.typeDetails.challenges.join('; ')}`;
    }

    sections.push(m3Section + '\n');
  }

  // ── Conflict Profile (M4) ──
  if (m4) {
    let m4Section = '## Conflict Profile (Module 4)\n';

    if (m4.conflictApproach) {
      m4Section += `\n- **Conflict Approach:** ${m4.conflictApproach.approach || '?'} (score: ${m4.conflictApproach.score ?? '?'})`;
    }
    if (m4.emotionalDrivers) {
      m4Section += `\n- **Primary Emotional Driver:** ${m4.emotionalDrivers.primary || '?'}`;
      if (m4.emotionalDrivers.secondary) m4Section += ` (secondary: ${m4.emotionalDrivers.secondary})`;
      if (m4.emotionalDrivers.primaryScore) m4Section += ` (score: ${m4.emotionalDrivers.primaryScore})`;

      const driverContext: Record<string, string> = {
        abandonment: 'Fears being left. Under stress: pursues, demands reassurance, tests loyalty. Protest behavior pushes partners away.',
        engulfment: 'Fears losing autonomy. Under stress: withdraws, shuts down, creates distance. Partners feel shut out and pursue harder.',
        inadequacy: 'Fears not being enough. Under stress: collapses, overcompensates, gets defensive. Interprets neutral feedback as criticism.',
        injustice: 'Needs fairness. Under stress: escalates, builds resentment, keeps score. Turns disagreements into moral battles.',
      };
      if (m4.emotionalDrivers.primary && driverContext[m4.emotionalDrivers.primary]) {
        m4Section += `\n  - Coaching context: ${driverContext[m4.emotionalDrivers.primary]}`;
      }

      if (m4.emotionalDrivers.scores) {
        m4Section += `\n- **All Driver Scores:** ${Object.entries(m4.emotionalDrivers.scores).map(([k, v]) => `${k}: ${v}`).join(', ')}`;
      }
    }
    if (m4.repairRecovery) {
      if (m4.repairRecovery.speed) m4Section += `\n- **Repair Speed:** ${m4.repairRecovery.speed.style || '?'} (score: ${m4.repairRecovery.speed.score ?? '?'})`;
      if (m4.repairRecovery.mode) m4Section += `\n- **Repair Mode:** ${m4.repairRecovery.mode.style || '?'} (score: ${m4.repairRecovery.mode.score ?? '?'})`;
    }
    if (m4.emotionalCapacity) {
      m4Section += `\n- **Emotional Capacity:** ${m4.emotionalCapacity.level || '?'} (score: ${m4.emotionalCapacity.score ?? '?'})`;
      if (m4.emotionalCapacity.level === 'low') {
        m4Section += `\n  - WARNING: Gets overwhelmed quickly during conflict. Recommend: physiological sigh, structured time-outs, gradual tolerance building.`;
      }
    }
    if (m4.gottmanScreener) {
      const horsemen = m4.gottmanScreener.horsemen;
      if (horsemen) {
        m4Section += `\n\n### Gottman Four Horsemen\n`;
        m4Section += `| Horseman | Risk Level | Score | Antidote |\n|----------|-----------|-------|----------|\n`;
        for (const [name, h] of Object.entries(horsemen) as [string, any][]) {
          m4Section += `| ${name.charAt(0).toUpperCase() + name.slice(1)} | ${h.riskLevel || '?'} | ${h.score ?? '?'} | ${h.antidote || 'N/A'} |\n`;
        }
        if (m4.gottmanScreener.overallRisk) {
          m4Section += `\n**Overall Gottman Risk:** ${m4.gottmanScreener.overallRisk}`;
        }
        if (m4.gottmanScreener.coachingPriority) {
          m4Section += `\n**Coaching Priority:** ${m4.gottmanScreener.coachingPriority}`;
        }
      }
    }

    sections.push(m4Section + '\n');
  }

  // ── Attachment Style ──
  if (individualCompatibility?.attachment) {
    const att = individualCompatibility.attachment;
    let attSection = `## Attachment Style

- **Style:** ${att.style || '?'}`;
    if (att.subtype) attSection += ` (${att.subtype})`;
    if (att.leaningToward) attSection += ` — leaning ${att.leaningToward}`;
    attSection += `\n- **Confidence:** ${Math.round((att.confidence || 0) * 100)}%`;
    if (att.description) attSection += `\n- **Description:** ${att.description}`;
    sections.push(attSection + '\n');
  }

  // ── Intimacy Under Stress ──
  if (individualCompatibility?.m3States) {
    const states = individualCompatibility.m3States.states;
    const insights = individualCompatibility.m3States.insights;
    if (states) {
      let stressSection = `## Intimacy Under Stress

| State | Want | Offer | Gap |
|-------|------|-------|-----|
| Baseline | ${states.normal?.want ?? '?'} | ${states.normal?.offer ?? '?'} | ${states.normal?.gap ?? '?'} |
| Under Stress | ${states.conflict?.want ?? '?'} | ${states.conflict?.offer ?? '?'} | ${states.conflict?.gap ?? '?'} |
| Making Effort | ${states.repair?.want ?? '?'} | ${states.repair?.offer ?? '?'} | ${states.repair?.gap ?? '?'} |`;

      if (insights) {
        stressSection += `\n\n- Gap expansion under stress: ${insights.gapExpansion > 0 ? '+' : ''}${insights.gapExpansion} points (${insights.gapExpansionLevel})`;
        stressSection += `\n- Repair sustainability: ${insights.repairSustainable ? 'Sustainable' : 'HIGH STRAIN — repair efforts may not be maintainable'}`;
      }
      sections.push(stressSection + '\n');
    }
  }

  // ── Ideal Partner Profile ──
  if (individualCompatibility?.attachmentTiers) {
    const at = individualCompatibility.attachmentTiers;
    const dt = individualCompatibility.driverTiers;
    const hi = individualCompatibility.horsemenInsights;

    let partnerSection = `## Ideal Partner Profile\n\n### Attachment Compatibility\n`;
    const tierLabels = ['bestMatches', 'goodMatches', 'workableMatches', 'riskyMatches', 'avoidMatches'];
    const tierNames = ['Best Match', 'Good Match', 'Workable', 'Risky', 'Avoid'];
    for (let i = 0; i < tierLabels.length; i++) {
      const items = at[tierLabels[i]];
      if (items?.length) {
        partnerSection += `- **${tierNames[i]}:** ${items.map((x: any) => `${x.style} (score: ${x.score})`).join(', ')}\n`;
      }
    }
    if (at.recommendation) partnerSection += `\n*${at.recommendation}*\n`;

    if (dt) {
      partnerSection += `\n### Emotional Driver Compatibility\n`;
      partnerSection += `- Their primary driver: **${dt.yourDriver?.primary || '?'}**\n`;
      for (const tier of ['bestMatches', 'goodMatches', 'workableMatches', 'avoidMatches']) {
        const items = dt[tier];
        if (items?.length) {
          const label = tier.replace('Matches', '').replace(/([A-Z])/g, ' $1').trim();
          partnerSection += `- **${label.charAt(0).toUpperCase() + label.slice(1)} match:** ${items.map((x: any) => `${x.driver} (score: ${x.score})`).join(', ')}\n`;
        }
      }
      if (dt.recommendation) partnerSection += `\n*${dt.recommendation}*\n`;
    }

    if (hi) {
      partnerSection += `\n### Conflict Behavior Guidance for Partner Selection\n`;
      if (hi.urgent) partnerSection += `**URGENT:** ${hi.urgent}\n\n`;
      if (hi.lookFor?.length) {
        partnerSection += `**Look for in a partner:**\n`;
        for (const item of hi.lookFor) {
          partnerSection += `- ${item.partnerTrait} — ${item.reason}\n`;
        }
      }
      if (hi.avoid?.length) {
        partnerSection += `\n**Avoid in a partner:**\n`;
        for (const item of hi.avoid) {
          partnerSection += `- ${item.partnerTrait} — ${item.reason}\n`;
        }
      }
    }

    sections.push(partnerSection);
  }

  // ── Top Matches ──
  if (matches?.length) {
    const topMatches = matches.slice(0, 15);
    let matchSection = `## Top Compatibility Matches\n\n| Rank | Persona | Code | Tier | Score | Summary |\n|------|---------|------|------|-------|---------|\n`;
    for (const m of topMatches) {
      matchSection += `| ${m.rank} | ${m.name} | ${m.code} | ${m.tier} | ${m.compatibilityScore}% | ${(m.summary || '').slice(0, 80)} |\n`;
    }
    if (matches.length > 15) matchSection += `\n*${matches.length - 15} additional matches in full report*\n`;
    sections.push(matchSection);
  }

  // ── Demographics & Preferences ──
  if (demographics) {
    const d = demographics;
    let demoSection = `## Demographics\n`;
    if (d.gender) demoSection += `- **Gender:** ${d.gender}\n`;
    if (d.age) demoSection += `- **Age:** ${d.age}\n`;
    if (d.ethnicity) demoSection += `- **Ethnicity:** ${d.ethnicity}\n`;
    if (d.orientation) demoSection += `- **Orientation:** ${d.orientation}\n`;
    if (d.income) demoSection += `- **Income:** $${Number(d.income).toLocaleString()}\n`;
    if (d.education) demoSection += `- **Education:** ${d.education}\n`;
    if (d.bodyType || d.body_type) demoSection += `- **Body Type:** ${d.bodyType || d.body_type}\n`;
    if (d.fitness || d.fitness_level) demoSection += `- **Fitness:** ${d.fitness || d.fitness_level}\n`;
    if (d.height) demoSection += `- **Height:** ${d.height}\n`;
    if (d.relationshipStatus || d.relationship_status) demoSection += `- **Status:** ${d.relationshipStatus || d.relationship_status}\n`;

    demoSection += `\n### Partner Preferences\n`;
    if (d.prefAgeMin || d.pref_age_min) demoSection += `- **Age Range:** ${d.prefAgeMin || d.pref_age_min} – ${d.prefAgeMax || d.pref_age_max}\n`;
    if (d.prefIncome || d.pref_income_min) demoSection += `- **Min Income:** $${Number(d.prefIncome || d.pref_income_min).toLocaleString()}\n`;
    const bodyPref = d.prefBodyTypes || d.pref_body_types;
    if (bodyPref?.length) demoSection += `- **Body Types:** ${bodyPref.join(', ')}\n`;
    const fitPref = d.prefFitnessLevels || d.pref_fitness_levels;
    if (fitPref?.length) demoSection += `- **Fitness Levels:** ${fitPref.join(', ')}\n`;
    const polPref = d.prefPolitical || d.pref_political;
    if (polPref?.length) demoSection += `- **Political:** ${polPref.join(', ')}\n`;
    if (d.prefHeight || d.pref_height_min) demoSection += `- **Min Height:** ${d.prefHeight || d.pref_height_min}\n`;
    if (d.prefHasKids || d.pref_has_kids) demoSection += `- **Partner Has Kids:** ${d.prefHasKids || d.pref_has_kids}\n`;
    if (d.prefWantKids || d.pref_want_kids) demoSection += `- **Partner Wants Kids:** ${d.prefWantKids || d.pref_want_kids}\n`;
    if (d.prefSmoking || d.pref_smoking) demoSection += `- **Smoking:** ${d.prefSmoking || d.pref_smoking}\n`;

    sections.push(demoSection);
  }

  // ── Dating Market Data ──
  if (marketData) {
    const pool = marketData.matchPool;
    const score = marketData.relateScore;
    const metro = marketData.location?.cbsaLabel || marketData.location?.cbsaName || 'their metro';
    const matchCount = marketData.matchCount ?? 0;
    const prob = marketData.matchProbability;
    const national = marketData.nationalComparison;
    const state = marketData.stateComparison;

    let marketSection = `## Dating Market Data (${metro})\n`;
    if (score) {
      marketSection += `\n- **Relate Score:** ${score.score}/100\n`;
      if (score.components) {
        marketSection += `\n**Score Components (what makes up their competitive ranking):**\n\n| Component | Local Percentile | Weight |\n|-----------|-----------------|--------|\n`;
        for (const [k, v] of Object.entries(score.components) as [string, any][]) {
          marketSection += `| ${k} | ${v.local ?? v.score ?? '?'} | ${Math.round((v.weight ?? 0) * 100)}% |\n`;
        }
      }
      if (score.marriagePremium && score.marriagePremium > 1) {
        marketSection += `\n- **Marriage Premium:** ${((score.marriagePremium - 1) * 100).toFixed(0)}% bonus (high-income single boost)\n`;
      }
    }
    if (pool) {
      marketSection += `\n**Pool Sizes:**\n`;
      marketSection += `- Local Singles: ${pool.localSinglePool?.toLocaleString()}\n`;
      marketSection += `- Realistic Pool (age + income): ${pool.realisticPool?.toLocaleString()}\n`;
      marketSection += `- Preferred Pool (lifestyle): ${pool.preferredPool?.toLocaleString()}\n`;
      marketSection += `- Ideal Pool (all preferences): ${pool.idealPool?.toLocaleString()}\n`;
      marketSection += `- **Estimated Matches (mutual interest):** ${matchCount.toLocaleString()}\n`;
      if (prob) marketSection += `- **Match Probability:** ${prob.percentage} (${prob.rate.toFixed(3)} rate)\n`;

      if (pool.localSinglePool > 0 && pool.idealPool > 0) {
        const selectivity = ((pool.idealPool / pool.localSinglePool) * 100).toFixed(2);
        marketSection += `- **Selectivity:** ${selectivity}% of local singles meet all preferences\n`;
      }
    }

    if (state) {
      marketSection += `\n**State (${state.label}):** ideal pool ${state.idealPool?.toLocaleString()}, matches ${state.matchCount?.toLocaleString()}, score ${state.relateScore}\n`;
    }
    if (national) {
      marketSection += `**National:** ideal pool ${national.idealPool?.toLocaleString()}, matches ${national.matchCount?.toLocaleString()}, score ${national.relateScore}\n`;
    }

    // Funnel detail
    if (pool?.funnel?.length) {
      marketSection += `\n### Match Pool Funnel (sequential filters)\n\n| Stage | Count | Filter | Milestone |\n|-------|-------|--------|----------|\n`;
      for (const s of pool.funnel) {
        marketSection += `| ${s.stage} | ${s.count?.toLocaleString()} | ${s.filter || '-'} | ${s.isMilestone ? 'YES' : ''} |\n`;
      }

      // Identify biggest drops for coaching reference
      const drops: { stage: string; pct: number; lost: number }[] = [];
      for (let i = 1; i < pool.funnel.length; i++) {
        const prev = pool.funnel[i - 1];
        const curr = pool.funnel[i];
        if (curr.isMilestone || prev.isMilestone || prev.count === 0) continue;
        const lostPct = ((prev.count - curr.count) / prev.count) * 100;
        if (lostPct > 10) drops.push({ stage: curr.stage, pct: lostPct, lost: prev.count - curr.count });
      }
      if (drops.length > 0) {
        drops.sort((a, b) => b.pct - a.pct);
        marketSection += `\n**Biggest funnel bottlenecks (coaching priority):**\n`;
        for (const d of drops.slice(0, 3)) {
          marketSection += `- ${d.stage}: eliminates ${Math.round(d.pct)}% (${d.lost.toLocaleString()} people)\n`;
        }
      }
    }

    sections.push(marketSection);
  }

  // ── Couples Report ──
  if (couplesReport) {
    let cSection = `## Couples Assessment\n`;
    if (couplesReport.compatibilityScore !== undefined) {
      cSection += `- **Compatibility Score:** ${couplesReport.compatibilityScore}%\n`;
    }
    if (couplesReport.archetype) {
      cSection += `- **Couple Archetype:** ${couplesReport.archetype}\n`;
    }
    if (couplesReport.sections) {
      for (const section of couplesReport.sections) {
        if (section.title && section.content) {
          cSection += `\n### ${section.title}\n${section.content}\n`;
        }
      }
    }
    if (couplesReport.partnerPersona) {
      cSection += `\n### Partner\n`;
      cSection += `- **Persona:** ${couplesReport.partnerPersona.name || '?'} (${couplesReport.partnerPersona.code || '?'})\n`;
      if (couplesReport.partnerPersona.traits) cSection += `- **Traits:** ${couplesReport.partnerPersona.traits}\n`;
    }
    sections.push(cSection);
  }

  sections.push(`---
*Generated by RELATE Assessment Platform on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}*
*Assessment methodology draws from Gottman Method, EFT, Attachment Theory, IFS, and CBT. Demographic estimates from U.S. Census Bureau, CDC, Pew Research Center, and Bureau of Justice Statistics.*
`);

  return sections.join('\n');
}
