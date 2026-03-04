import { NextRequest, NextResponse } from 'next/server';

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { persona, dimensions, m3, m4, matches, individualCompatibility, marketData, demographics, couplesReport } = body;

    if (!persona) {
      return NextResponse.json({ error: 'No assessment data provided' }, { status: 400 });
    }

    const prompt = buildCoachPrompt({
      persona, dimensions, m3, m4, matches, individualCompatibility, marketData, demographics, couplesReport,
    });

    return NextResponse.json({ prompt, filename: `RELATE-Coach-${persona.code || 'custom'}.md` });
  } catch (error: unknown) {
    console.error('Coach prompt generation error:', error);
    return NextResponse.json({ error: 'Failed to generate coach prompt' }, { status: 500 });
  }
}

function buildCoachPrompt(data: {
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

  // ── Header ──
  sections.push(`# RELATE Relationship Coach

You are a relationship coach powered by the RELATE Assessment Platform. You have deep knowledge of this specific person's assessment results, dating market data, and relationship patterns. Use this data to provide personalized, evidence-based coaching.

Your approach draws from:
- **Gottman Method** — the Four Horsemen, repair attempts, emotional bids
- **Emotionally Focused Therapy (EFT)** — attachment cycles, emotional accessibility
- **Attachment Theory** — secure/anxious/avoidant/disorganized patterns
- **Internal Family Systems (IFS)** — parts work, protectors, exiles
- **CBT** — cognitive distortions in relationship contexts

## Coaching Style
- Be direct and honest. Don't sugarcoat.
- Give specific, actionable advice — not vague platitudes.
- Reference their actual data when coaching (scores, percentages, patterns).
- Challenge them when their behavior contradicts their goals.
- Be warm but never sycophantic. Compassion and accountability coexist.
- When they describe a dating situation, analyze it through their known patterns.
- If they're in a relationship, reference the couples data when relevant.
`);

  // ── Persona Profile ──
  sections.push(`## Their Assessment Profile

**Persona:** ${persona.name} (${persona.code})
${persona.traits ? `**Core Traits:** ${persona.traits}` : ''}
${persona.datingBehavior?.length ? `**Dating Behavior Patterns:**\n${persona.datingBehavior.map((b: string) => `- ${b}`).join('\n')}` : ''}
${persona.mostAttractive?.length ? `**Strengths (Most Attractive):**\n${persona.mostAttractive.map((s: string) => `- ${s}`).join('\n')}` : ''}
${persona.leastAttractive?.length ? `**Growth Areas (Least Attractive):**\n${persona.leastAttractive.map((s: string) => `- ${s}`).join('\n')}` : ''}
`);

  // ── Dimensions ──
  if (dimensions) {
    const dimLines = Object.entries(dimensions).map(([dim, d]: [string, any]) =>
      `- **${dim}**: ${d.assignedPole || '?'} (${d.strength || 0}% strength)`
    ).join('\n');
    sections.push(`## Dimension Scores
${dimLines}
`);
  }

  // ── Connection Style (M3) ──
  if (m3) {
    let m3Section = `## Connection Style (Want/Offer)
- **Want Score:** ${m3.wantScore ?? '?'} — how much they seek from a partner
- **Offer Score:** ${m3.offerScore ?? '?'} — how much they bring to a partner
- **Type:** ${m3.typeName || '?'}`;

    if (m3.wantOfferGap !== undefined) {
      m3Section += `\n- **Want/Offer Gap:** ${m3.wantOfferGap > 0 ? '+' : ''}${m3.wantOfferGap}`;
      if (m3.wantOfferGap > 20) {
        m3Section += ` ⚠️ Significant imbalance — wants more than they offer`;
      } else if (m3.wantOfferGap < -20) {
        m3Section += ` ⚠️ Over-giving pattern — offers far more than they ask for`;
      }
    }

    if (m3.typeDetails) {
      if (m3.typeDetails.strengths?.length) m3Section += `\n**Strengths:** ${m3.typeDetails.strengths.join('; ')}`;
      if (m3.typeDetails.challenges?.length) m3Section += `\n**Challenges:** ${m3.typeDetails.challenges.join('; ')}`;
    }

    sections.push(m3Section + '\n');
  }

  // ── Conflict Profile (M4) ──
  if (m4) {
    let m4Section = '## Conflict Profile\n';

    if (m4.conflictApproach) {
      m4Section += `- **Conflict Approach:** ${m4.conflictApproach.approach || '?'} (score: ${m4.conflictApproach.score ?? '?'})\n`;
    }
    if (m4.emotionalDrivers) {
      m4Section += `- **Primary Emotional Driver:** ${m4.emotionalDrivers.primary || '?'}`;
      if (m4.emotionalDrivers.secondary) m4Section += ` (secondary: ${m4.emotionalDrivers.secondary})`;
      m4Section += '\n';

      // Driver-specific coaching context
      const driverContext: Record<string, string> = {
        abandonment: 'They fear being left. Under stress they pursue, demand reassurance, or test loyalty. Their protest behavior can push partners away — the opposite of what they want.',
        engulfment: 'They fear losing autonomy. Under stress they withdraw, shut down, or create distance. Partners often feel shut out and pursue harder, which makes it worse.',
        inadequacy: 'They fear not being enough. Under stress they collapse, overcompensate, or become defensive. They may interpret neutral feedback as criticism.',
        injustice: 'They feel things must be fair. Under stress they escalate, build resentment, or keep score. They may turn disagreements into moral battles.',
      };
      if (m4.emotionalDrivers.primary && driverContext[m4.emotionalDrivers.primary]) {
        m4Section += `  - *Coaching context:* ${driverContext[m4.emotionalDrivers.primary]}\n`;
      }
    }
    if (m4.repairRecovery) {
      if (m4.repairRecovery.speed) m4Section += `- **Repair Speed:** ${m4.repairRecovery.speed.style || '?'}\n`;
      if (m4.repairRecovery.mode) m4Section += `- **Repair Mode:** ${m4.repairRecovery.mode.style || '?'}\n`;
    }
    if (m4.emotionalCapacity) {
      m4Section += `- **Emotional Capacity:** ${m4.emotionalCapacity.level || '?'} (score: ${m4.emotionalCapacity.score ?? '?'})\n`;
      if (m4.emotionalCapacity.level === 'low') {
        m4Section += `  - ⚠️ Gets overwhelmed quickly during conflict. Coach: physiological sigh, time-outs, building tolerance gradually.\n`;
      }
    }
    if (m4.gottmanScreener) {
      const horsemen = m4.gottmanScreener.horsemen;
      if (horsemen) {
        m4Section += `\n### Gottman Four Horsemen\n`;
        for (const [name, h] of Object.entries(horsemen) as [string, any][]) {
          m4Section += `- **${name.charAt(0).toUpperCase() + name.slice(1)}:** ${h.riskLevel || '?'} risk (score: ${h.score ?? '?'})`;
          if (h.antidote) m4Section += ` — Antidote: ${h.antidote}`;
          m4Section += '\n';
        }
        if (m4.gottmanScreener.overallRisk) {
          m4Section += `- **Overall Risk Level:** ${m4.gottmanScreener.overallRisk}\n`;
        }
      }
    }

    sections.push(m4Section);
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
        stressSection += `\n\n- Gap expansion: ${insights.gapExpansion > 0 ? '+' : ''}${insights.gapExpansion} points (${insights.gapExpansionLevel})`;
        stressSection += `\n- Repair effort: ${insights.repairSustainable ? 'Sustainable' : 'High strain ⚠️'}`;
      }
      sections.push(stressSection + '\n');
    }
  }

  // ── Ideal Partner Profile ──
  if (individualCompatibility?.attachmentTiers) {
    const at = individualCompatibility.attachmentTiers;
    const dt = individualCompatibility.driverTiers;
    let partnerSection = `## Ideal Partner Profile\n\n### Attachment Compatibility\n`;
    const tierLabels = ['bestMatches', 'goodMatches', 'workableMatches', 'riskyMatches', 'avoidMatches'];
    const tierNames = ['Best', 'Good', 'Workable', 'Risky', 'Avoid'];
    for (let i = 0; i < tierLabels.length; i++) {
      const items = at[tierLabels[i]];
      if (items?.length) {
        partnerSection += `- **${tierNames[i]}:** ${items.map((x: any) => `${x.style} (${x.score})`).join(', ')}\n`;
      }
    }
    if (at.recommendation) partnerSection += `\n*${at.recommendation}*\n`;

    if (dt) {
      partnerSection += `\n### Emotional Driver Compatibility\n`;
      partnerSection += `- Primary driver: **${dt.yourDriver?.primary || '?'}**\n`;
      for (const tier of ['bestMatches', 'goodMatches', 'workableMatches', 'avoidMatches']) {
        const items = dt[tier];
        if (items?.length) {
          const label = tier.replace('Matches', '').replace(/([A-Z])/g, ' $1').trim();
          partnerSection += `- **${label.charAt(0).toUpperCase() + label.slice(1)}:** ${items.map((x: any) => `${x.driver} (${x.score})`).join(', ')}\n`;
        }
      }
      if (dt.recommendation) partnerSection += `\n*${dt.recommendation}*\n`;
    }

    sections.push(partnerSection);
  }

  // ── Top Matches ──
  if (matches?.length) {
    const topMatches = matches.slice(0, 10);
    let matchSection = `## Top Compatibility Matches\n\n| Rank | Persona | Code | Tier | Score |\n|------|---------|------|------|-------|\n`;
    for (const m of topMatches) {
      matchSection += `| ${m.rank} | ${m.name} | ${m.code} | ${m.tier} | ${m.compatibilityScore}% |\n`;
    }
    if (matches.length > 10) matchSection += `\n*${matches.length - 10} more matches available in full report*\n`;
    sections.push(matchSection);
  }

  // ── Demographics & Preferences ──
  if (demographics) {
    const d = demographics;
    let demoSection = `## Their Demographics\n`;
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
      marketSection += `- **Relate Score:** ${score.score}/100\n`;
      if (score.components) {
        marketSection += `- **Score Components:**\n`;
        for (const [k, v] of Object.entries(score.components) as [string, any][]) {
          marketSection += `  - ${k}: local ${v.local ?? v.score ?? '?'}, weight ${Math.round((v.weight ?? 0) * 100)}%\n`;
        }
      }
    }
    if (pool) {
      marketSection += `- **Local Singles:** ${pool.localSinglePool?.toLocaleString()}\n`;
      marketSection += `- **Ideal Pool:** ${pool.idealPool?.toLocaleString()}\n`;
      marketSection += `- **Match Count:** ${matchCount.toLocaleString()}\n`;
      if (prob) marketSection += `- **Match Probability:** ${prob.percentage}\n`;

      if (pool.localSinglePool > 0 && pool.idealPool > 0) {
        const selectivity = ((pool.idealPool / pool.localSinglePool) * 100).toFixed(2);
        marketSection += `- **Selectivity:** ${selectivity}% of local singles meet all preferences\n`;
      }
    }
    if (state) {
      marketSection += `\n**State (${state.label}):** ${state.idealPool?.toLocaleString()} ideal pool, ${state.matchCount?.toLocaleString()} matches\n`;
    }
    if (national) {
      marketSection += `**National:** ${national.idealPool?.toLocaleString()} ideal pool, ${national.matchCount?.toLocaleString()} matches\n`;
    }

    // Funnel summary
    if (pool?.funnel?.length) {
      marketSection += `\n### Match Pool Funnel\n`;
      for (const s of pool.funnel) {
        const prefix = s.isMilestone ? '**' : '';
        marketSection += `- ${prefix}${s.stage}${prefix}: ${s.count?.toLocaleString()}${s.filter ? ` (${s.filter})` : ''}\n`;
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
      cSection += `\n### Partner Profile\n`;
      cSection += `- **Persona:** ${couplesReport.partnerPersona.name || '?'} (${couplesReport.partnerPersona.code || '?'})\n`;
    }
    sections.push(cSection);
  }

  // ── Coaching Directives ──
  sections.push(`## How to Coach This Person

### When they ask about dating:
- Reference their specific dating market numbers (pool sizes, match probability, Relate Score)
- If their preferences are highly restrictive (ideal pool < 1% of singles), gently point this out
- Suggest concrete expansions based on their funnel bottlenecks
- If they want fit/attractive partners but aren't fit themselves, call it out directly

### When they describe a conflict:
- Identify which Gottman Horseman is present
- Reference their primary emotional driver and how it's showing up
- Suggest the specific antidote for the horseman they're using
- Note their repair speed and mode — coach them to repair in a way that works for their style

### When they talk about a new person:
- Compare the new person's described traits against their ideal partner profile
- Check compatibility against their attachment style
- Flag if the attraction pattern matches a known problematic cycle for their type
- Reference their persona's dating behavior patterns

### When they feel stuck or discouraged:
- Use their actual numbers — "You have ${marketData?.matchCount ?? 'X'} estimated matches in your area"
- Ground them in what they can control (Relate Score components, fitness, income, emotional growth)
- Reference their Growth Plan items from the assessment
- Be realistic but not fatalistic

### When they're in a relationship:
${couplesReport ? '- Reference the couples assessment data above for specific dynamics' : '- Ask if they\'d like to have their partner take the assessment for couples-specific coaching'}
- Watch for their conflict approach pattern playing out
- Coach repair timing based on their repair speed style
- Flag emotional driver activation when described
`);

  return sections.join('\n');
}
