/* eslint-disable @typescript-eslint/no-explicit-any */

// ══════════════════════════════════════════════════════════════════════════════
// Individual Growth Plan System
// Cognitive Behavioral Therapy exercises, pattern recognition, and self-improvement challenges
// Mirrors the couples challenge system but for singles / individual growth
// ══════════════════════════════════════════════════════════════════════════════

export type GrowthCategory = 'cognitive' | 'emotional' | 'behavioral' | 'pattern' | 'relational';

export interface GrowthExercise {
  id: string;
  category: GrowthCategory;
  title: string;
  description: string;
  instruction: string;
  duration: string;
  points: number;
  framework: string; // Which therapeutic framework this draws from
  targetArea?: string; // Which assessment area it addresses
}

// ── Exercise Library ──

export const GROWTH_EXERCISES: GrowthExercise[] = [
  // ── COGNITIVE (Cognitive Behavioral Therapy Core) ──
  {
    id: 'cbt1',
    category: 'cognitive',
    title: 'Thought Record',
    description: 'Catch and challenge a cognitive distortion in how you think about relationships or dating.',
    instruction: 'When you notice a strong negative thought about dating or a partner (e.g., "No one will ever want me," "They\'re going to leave"), write it down. Then:\n1. Name the distortion (all-or-nothing, catastrophizing, mind-reading, etc.)\n2. Write the evidence FOR the thought\n3. Write the evidence AGAINST it\n4. Write a more balanced version',
    duration: '7 days',
    points: 20,
    framework: 'Cognitive Behavioral Therapy',
    targetArea: 'selfAwareness',
  },
  {
    id: 'cbt2',
    category: 'cognitive',
    title: 'Distortion Spotter',
    description: 'Identify your top 3 cognitive distortions in relationship contexts over one week.',
    instruction: 'Keep a running list every time you catch yourself in one of these patterns: All-or-nothing thinking ("If this date isn\'t perfect, it\'s a disaster"), Catastrophizing ("They didn\'t text back, they\'re ghosting me"), Mind-reading ("They think I\'m boring"), Fortune-telling ("This will never work out"), Emotional reasoning ("I feel unlovable, so I must be"), Should statements ("They should just know what I need"). At the end of the week, rank your top 3 by frequency.',
    duration: '7 days',
    points: 15,
    framework: 'Cognitive Behavioral Therapy',
    targetArea: 'selfAwareness',
  },
  {
    id: 'cbt3',
    category: 'cognitive',
    title: 'Evidence Check',
    description: 'Test an assumption you hold about your dating life against actual evidence.',
    instruction: 'Pick one belief you hold about your dating life (e.g., "I always attract the wrong people" or "I\'m too much for most people"). Write it down. Then list every piece of concrete evidence, including dates, relationships, and interactions, that supports it AND contradicts it. Count both columns. Is the belief accurate, partially true, or a story you\'re telling yourself?',
    duration: '1 session',
    points: 10,
    framework: 'Cognitive Behavioral Therapy',
    targetArea: 'selfAwareness',
  },
  {
    id: 'cbt4',
    category: 'cognitive',
    title: 'Reframe Practice',
    description: 'Take 3 negative dating experiences and rewrite the narrative with a growth lens.',
    instruction: 'Choose 3 dating experiences you view negatively. For each one:\n1. Write the story you tell yourself about it now\n2. Identify what you learned from it\n3. Rewrite the story focusing on what it taught you or how it redirected you\n\nThis isn\'t toxic positivity. The experience can still have been painful. The goal is extracting the signal from the noise.',
    duration: '1 session',
    points: 15,
    framework: 'Cognitive Behavioral Therapy',
    targetArea: 'selfAwareness',
  },

  // ── EMOTIONAL REGULATION ──
  {
    id: 'emo1',
    category: 'emotional',
    title: 'Physiological Sigh Protocol',
    description: 'Practice the physiological sigh daily for one week to build your emotional regulation toolkit.',
    instruction: 'Three times a day (morning, midday, evening), do 3 rounds of the physiological sigh: double inhale through the nose (short inhale, then a second deeper inhale), followed by a long slow exhale through the mouth. This is the fastest known way to downregulate your nervous system. By the end of the week, it should be automatic when you feel stress rising.',
    duration: '7 days',
    points: 15,
    framework: 'Cognitive Behavioral Therapy, Neuroscience',
    targetArea: 'emotionalCapacity',
  },
  {
    id: 'emo2',
    category: 'emotional',
    title: 'Trigger Journal',
    description: 'Map your emotional triggers by logging what activates your fight/flight/freeze response.',
    instruction: 'For one week, every time you feel a strong emotional reaction (anger, anxiety, withdrawal, jealousy), immediately note:\n1. What happened (the trigger)\n2. What you felt in your body\n3. What emotion surfaced\n4. What you did next (your automatic response)\n5. What your emotional driver would predict\n\nLook for the pattern by week\'s end.',
    duration: '7 days',
    points: 20,
    framework: 'Cognitive Behavioral Therapy, Internal Family Systems',
    targetArea: 'emotionalDrivers',
  },
  {
    id: 'emo3',
    category: 'emotional',
    title: 'Distress Tolerance',
    description: 'Build tolerance for uncomfortable emotions without reacting or numbing.',
    instruction: 'Once per day, deliberately sit with an uncomfortable feeling for 5 minutes without fixing it, distracting from it, or talking about it. Set a timer. Notice where you feel it in your body. Rate it 1-10 at minute 1 and minute 5. Most people discover it naturally decreases just from observation. This builds the muscle for staying regulated during conflict.',
    duration: '7 days',
    points: 20,
    framework: 'Cognitive Behavioral Therapy, Dialectical Behavior Therapy',
    targetArea: 'emotionalCapacity',
  },
  {
    id: 'emo4',
    category: 'emotional',
    title: 'Driver Awareness Check-In',
    description: 'Identify when your primary emotional driver activates in daily life.',
    instruction: 'Your emotional driver is the fear that shows up most in relationships. For one week, notice moments where that fear gets activated, even in small ways. When you catch it:\n1. Name it out loud or in writing ("My [driver] is activated")\n2. Ask yourself whether this situation is actually threatening, or if it just feels like a pattern you know\n3. Choose one different response than your usual automatic one',
    duration: '7 days',
    points: 20,
    framework: 'Internal Family Systems, Attachment Theory',
    targetArea: 'emotionalDrivers',
  },

  // ── PATTERN RECOGNITION ──
  {
    id: 'pat1',
    category: 'pattern',
    title: 'Relationship Timeline',
    description: 'Map your last 3-5 relationships or dating patterns to find the recurring theme.',
    instruction: 'For each significant relationship or dating stretch:\n1. How did it start? What attracted you?\n2. When did the first problem appear? What was it?\n3. How did it end? Who ended it and why?\n4. What role did you play in the pattern?\n\nLook across all of them. What\'s the common thread? The type of person, the stage it breaks down, or the reason it ends. One of these will repeat.',
    duration: '1 session',
    points: 25,
    framework: 'Attachment Theory',
    targetArea: 'selfAwareness',
  },
  {
    id: 'pat2',
    category: 'pattern',
    title: 'Attachment Audit',
    description: 'Track your attachment style in action across everyday interactions for one week.',
    instruction: 'Each evening, review your day and note any moment where your attachment style showed up: Did you seek reassurance? Did you pull away when someone got close? Did you test someone? Did you avoid vulnerability? For each instance, write:\n1. The situation\n2. Your automatic response\n3. What a securely attached person might have done instead\n\nThis isn\'t about shame. It\'s about seeing the pattern clearly.',
    duration: '7 days',
    points: 25,
    framework: 'Attachment Theory',
    targetArea: 'attachment',
  },
  {
    id: 'pat3',
    category: 'pattern',
    title: 'Conflict Replay',
    description: 'Analyze your last 3 conflicts to identify your Gottman horseman pattern.',
    instruction: 'Recall your last 3 conflicts (with a partner, date, friend, or family member). For each:\n1. What was the stated issue?\n2. What was the real issue underneath?\n3. Which horseman did you ride? Criticism ("You always..."), Contempt (eye-rolling, sarcasm), Defensiveness ("Yeah but you..."), or Stonewalling (shutting down)\n4. What was the antidote you could have used instead?\n\nYour assessment already identified your highest horseman. See if these conflicts confirm it.',
    duration: '1 session',
    points: 20,
    framework: 'Gottman Method',
    targetArea: 'gottman',
  },
  {
    id: 'pat4',
    category: 'pattern',
    title: 'Want vs. Are Inventory',
    description: 'Compare what you seek in a partner against what you actually bring.',
    instruction: 'Two columns. Column A: List the top 10 traits you want in a partner. Column B: Honestly rate yourself 1-10 on each of those same traits. Where the gap is widest, you have a choice:\n1. Develop that trait in yourself\n2. Adjust your expectation\n\nThis isn\'t about lowering standards. It\'s about aligning what you seek with what you offer. Your assessment\'s want/offer gap already measured this, and this exercise makes it concrete.',
    duration: '1 session',
    points: 15,
    framework: 'Cognitive Behavioral Therapy, Self-Assessment',
    targetArea: 'wantOffer',
  },

  // ── BEHAVIORAL / RELATIONAL PRACTICE ──
  {
    id: 'beh1',
    category: 'behavioral',
    title: 'Vulnerability Micro-Dose',
    description: 'Share something slightly uncomfortable with someone you trust, once per day.',
    instruction: 'Each day, share one thing with someone (friend, family, colleague) that feels slightly vulnerable: an honest opinion, an emotion, a need. Start small ("I actually felt hurt when you said that") and build. Rate your anxiety before (1-10) and after (1-10). Most people discover the after is always lower than the before. This builds the muscle for relational vulnerability.',
    duration: '7 days',
    points: 20,
    framework: 'Emotionally Focused Therapy, Attachment Theory',
    targetArea: 'emotionalCapacity',
  },
  {
    id: 'beh2',
    category: 'behavioral',
    title: 'Bid Recognition',
    description: 'Notice and respond to bids for connection in your daily life.',
    instruction: 'Gottman\'s research shows relationships live or die on "bids," which are small moments where someone reaches for connection. For one week, actively notice when people make bids toward you (a text, a question, sharing something, a look). Track:\n1. The bid itself\n2. Did you turn toward it (engaged), turn away (ignored), or turn against it (dismissed)?\n\nAim for 80%+ "turn toward" by week\'s end.',
    duration: '7 days',
    points: 15,
    framework: 'Gottman Method',
    targetArea: 'connection',
  },
  {
    id: 'beh3',
    category: 'behavioral',
    title: 'Market Improvement Sprint',
    description: 'Pick your weakest Relate Score component and take one concrete action toward improving it.',
    instruction: 'Look at your Relate Score breakdown. Find the component dragging you down most (fitness, income, education, emotional growth). Pick ONE specific action:\n1. Fitness: commit to 4 sessions this week and track them\n2. Income: research one credential or career move\n3. Education: enroll in something\n4. Emotional: start this growth plan\n\nSmall consistent actions compound. A 10-point Relate Score improvement can nearly double your match probability.',
    duration: '1 week',
    points: 15,
    framework: 'Behavioral Activation',
    targetArea: 'relateScore',
  },
  {
    id: 'beh4',
    category: 'behavioral',
    title: 'Repair Practice',
    description: 'Practice a repair attempt in a low-stakes relationship before you need it in a high-stakes one.',
    instruction: 'Think of a small unresolved tension with someone in your life (a friend, sibling, colleague). Initiate a repair:\n1. Name what happened without blame\n2. Share how it affected you\n3. Ask what they experienced\n\nNotice your repair speed and how quickly you can move toward resolution. Your assessment shows your repair style. Practice it intentionally so it\'s available when it matters.',
    duration: '1 session',
    points: 15,
    framework: 'Gottman Method, Emotionally Focused Therapy',
    targetArea: 'repair',
  },

  // ── RELATIONAL / DEEPER WORK ──
  {
    id: 'rel1',
    category: 'relational',
    title: 'Parts Check-In',
    description: 'Identify the "parts" of you that show up in dating and relationships.',
    instruction: 'Internal Family Systems teaches that we have different "parts": the protector that keeps people at arm\'s length, the pleaser that abandons your needs, the critic that tells you you\'re not enough. Write down 3-5 parts you notice in yourself. For each:\n1. What does this part do?\n2. What is it protecting you from?\n3. What would happen if you thanked it but didn\'t let it drive?\n\nThis isn\'t about eliminating parts. It\'s about not letting them run the show.',
    duration: '1 session',
    points: 20,
    framework: 'Internal Family Systems',
    targetArea: 'selfAwareness',
  },
  {
    id: 'rel2',
    category: 'relational',
    title: 'Pursue-Withdraw Map',
    description: 'Identify whether you tend to pursue or withdraw, and what triggers the switch.',
    instruction: 'In your last few relationships or dating interactions, when tension arose: Did you move toward (text more, ask questions, seek reassurance, push for resolution) or move away (go silent, get busy, need space, shut down emotionally)? Map 5 specific instances. Then identify the feeling underneath the behavior. Pursuers usually feel fear of abandonment. Withdrawers usually feel overwhelm from engulfment. Your emotional driver predicts this, so see if it matches.',
    duration: '1 session',
    points: 20,
    framework: 'Emotionally Focused Therapy, Attachment Theory',
    targetArea: 'emotionalDrivers',
  },
  {
    id: 'rel3',
    category: 'relational',
    title: 'Needs Articulation',
    description: 'Write down your actual relationship needs, not wants, needs.',
    instruction: 'Wants are preferences (tall, funny, good job). Needs are non-negotiables for your psychological safety (feeling heard, having autonomy, physical affection, reliability). Write your top 5 needs. For each:\n1. Have you ever communicated this need directly to a partner?\n2. What happens when this need goes unmet?\n3. How do you typically try to get it met? Directly, indirectly, or by testing?\n\nThe gap between knowing your needs and expressing them is where most relationship problems live.',
    duration: '1 session',
    points: 15,
    framework: 'Emotionally Focused Therapy, Attachment Theory',
    targetArea: 'wantOffer',
  },
  {
    id: 'rel4',
    category: 'relational',
    title: 'Secure Base Visualization',
    description: 'Build a mental model of what secure attachment looks and feels like for you.',
    instruction: 'Imagine a relationship where you feel completely safe. Not perfect, but safe. Write down:\n1. How do you communicate when upset?\n2. How do you handle disagreements?\n3. How do you show love?\n4. How do you receive love?\n5. What does repair look like after a fight?\n\nNow compare this to your last relationship. Where\'s the gap? That gap is your growth edge. Earned security is possible at any age, and it starts with knowing what you\'re aiming for.',
    duration: '1 session',
    points: 15,
    framework: 'Attachment Theory',
    targetArea: 'attachment',
  },
];

// ── Categories ──

export const GROWTH_CATEGORIES: Record<GrowthCategory, { name: string; description: string }> = {
  cognitive: {
    name: 'Cognitive Reframing',
    description: 'Identify and challenge distorted thinking patterns about relationships and dating',
  },
  emotional: {
    name: 'Emotional Regulation',
    description: 'Build capacity to manage intense emotions without reactive behavior',
  },
  pattern: {
    name: 'Pattern Recognition',
    description: 'See your recurring relationship patterns clearly so you can change them',
  },
  behavioral: {
    name: 'Behavioral Practice',
    description: 'Take concrete actions to improve your dating market position and relationship skills',
  },
  relational: {
    name: 'Deeper Work',
    description: 'Explore attachment, internal parts, and core relationship needs',
  },
};

// ── Growth Levels (Individual) ──

export const INDIVIDUAL_GROWTH_LEVELS = [
  { level: 1, name: 'Awareness', pointsRequired: 0 },
  { level: 2, name: 'Recognition', pointsRequired: 40 },
  { level: 3, name: 'Practice', pointsRequired: 120 },
  { level: 4, name: 'Integration', pointsRequired: 250 },
  { level: 5, name: 'Mastery', pointsRequired: 400 },
];

export function getIndividualGrowthLevel(points: number): {
  level: number;
  name: string;
  pointsToNext: number;
  progress: number;
} {
  let current = INDIVIDUAL_GROWTH_LEVELS[0];
  let next = INDIVIDUAL_GROWTH_LEVELS[1];

  for (let i = INDIVIDUAL_GROWTH_LEVELS.length - 1; i >= 0; i--) {
    if (points >= INDIVIDUAL_GROWTH_LEVELS[i].pointsRequired) {
      current = INDIVIDUAL_GROWTH_LEVELS[i];
      next = INDIVIDUAL_GROWTH_LEVELS[i + 1] || INDIVIDUAL_GROWTH_LEVELS[i];
      break;
    }
  }

  const pointsToNext = next.pointsRequired - points;
  const rangeSize = next.pointsRequired - current.pointsRequired;
  const progress = rangeSize > 0 ? Math.round(((points - current.pointsRequired) / rangeSize) * 100) : 100;

  return { level: current.level, name: current.name, pointsToNext: Math.max(0, pointsToNext), progress };
}

// ── Personalized Recommendations ──

export function getRecommendedExercises(userData: any): GrowthExercise[] {
  const recommended: GrowthExercise[] = [];
  const usedIds = new Set<string>();

  const m4 = userData?.m4;
  const m3 = userData?.m3;
  const attachment = userData?.individualCompatibility?.attachment;

  // Priority 1: High Gottman risk → conflict replay + horseman antidote work
  if (m4?.gottmanScreener?.overallRisk === 'high' || m4?.gottmanScreener?.overallRisk === 'elevated') {
    addExercise('pat3', recommended, usedIds); // Conflict Replay
    addExercise('cbt1', recommended, usedIds); // Thought Record
  }

  // Priority 2: Low emotional capacity → regulation first
  if (m4?.emotionalCapacity?.level === 'low') {
    addExercise('emo1', recommended, usedIds); // Physiological Sigh
    addExercise('emo3', recommended, usedIds); // Distress Tolerance
  }

  // Priority 3: Strong emotional driver → driver awareness
  if (m4?.emotionalDrivers?.primary) {
    addExercise('emo4', recommended, usedIds); // Driver Awareness
    addExercise('emo2', recommended, usedIds); // Trigger Journal
  }

  // Priority 4: Insecure attachment → attachment + pattern work
  if (attachment?.style && attachment.style !== 'secure') {
    addExercise('pat2', recommended, usedIds); // Attachment Audit
    addExercise('rel4', recommended, usedIds); // Secure Base Visualization
  }

  // Priority 5: Want/offer gap → inventory
  if (m3?.wantOfferGap && Math.abs(m3.wantOfferGap) > 15) {
    addExercise('pat4', recommended, usedIds); // Want vs Are Inventory
  }

  // Priority 6: Pattern recognition is always valuable
  addExercise('pat1', recommended, usedIds); // Relationship Timeline

  // Fill to 4 with cognitive exercises
  for (const ex of GROWTH_EXERCISES) {
    if (recommended.length >= 4) break;
    if (!usedIds.has(ex.id)) {
      recommended.push(ex);
      usedIds.add(ex.id);
    }
  }

  return recommended.slice(0, 4);
}

function addExercise(id: string, list: GrowthExercise[], usedIds: Set<string>) {
  if (usedIds.has(id)) return;
  const ex = GROWTH_EXERCISES.find(e => e.id === id);
  if (ex) {
    list.push(ex);
    usedIds.add(id);
  }
}

// ── Pattern Insights (generated from assessment data) ──

export function generatePatternInsights(userData: any): string[] {
  const insights: string[] = [];
  const m4 = userData?.m4;
  const m3 = userData?.m3;
  const attachment = userData?.individualCompatibility?.attachment;
  const persona = userData?.persona;

  // Attachment + driver interaction
  if (attachment?.style && m4?.emotionalDrivers?.primary) {
    const driver = m4.emotionalDrivers.primary;
    const style = attachment.style;

    if (style === 'anxious' && driver === 'abandonment') {
      insights.push('Your anxious attachment and abandonment driver create a reinforcing loop: fear of being left makes you pursue harder, which can push partners away, confirming the fear. Breaking this means learning to self-soothe before seeking reassurance.');
    } else if (style === 'avoidant' && driver === 'engulfment') {
      insights.push('Your avoidant attachment and engulfment driver work together: closeness feels threatening, so you create distance. Partners read this as rejection and either pursue (making it worse) or leave (confirming you\'re better off alone). The growth edge is tolerating closeness in small doses.');
    } else if (style === 'anxious' && driver === 'inadequacy') {
      insights.push('Your anxious attachment combined with an inadequacy driver means you may overperform in relationships, trying to be "enough" while simultaneously fearing you never will be. The pattern is to give too much, burn out, feel unappreciated, then withdraw.');
    } else if (style === 'avoidant' && driver === 'injustice') {
      insights.push('Your avoidant style combined with an injustice driver means you may keep score in relationships and use perceived unfairness as a reason to create distance. The pattern is to notice imbalance, build resentment silently, then withdraw without giving your partner a chance to adjust.');
    } else {
      insights.push(`Your ${style} attachment style interacts with your ${driver} emotional driver. When ${driver} gets activated, your ${style} patterns intensify. Recognizing this connection is the first step to interrupting the cycle.`);
    }
  }

  // Want/offer tension
  if (m3?.wantOfferGap) {
    if (m3.wantOfferGap > 20) {
      insights.push(`You want significantly more than you currently offer (gap: +${m3.wantOfferGap}). This creates a pattern where you may feel disappointed by partners who are actually at your level, while the partners you want may not see you as a match. Closing the gap by offering more or adjusting expectations is your highest-leverage change.`);
    } else if (m3.wantOfferGap < -20) {
      insights.push(`You offer significantly more than you ask for (gap: ${m3.wantOfferGap}). This creates a pattern of over-giving, often attracting partners who take without reciprocating. You may interpret asking for what you need as being "too much." The growth edge is learning that your needs are not a burden.`);
    }
  }

  // Gottman pattern
  if (m4?.gottmanScreener?.horsemen) {
    const horsemen = m4.gottmanScreener.horsemen;
    const highest = Object.entries(horsemen)
      .sort((a: any, b: any) => (b[1].score || 0) - (a[1].score || 0))[0];
    if (highest) {
      const [name, data] = highest as [string, any];
      if (data.score > 10) {
        insights.push(`Your highest Gottman horseman is ${name} (score: ${data.score}). This means in conflict, your default is to ${
          name === 'criticism' ? 'attack your partner\'s character rather than address the specific behavior' :
          name === 'contempt' ? 'signal superiority or disgust, which is the single strongest predictor of relationship failure' :
          name === 'defensiveness' ? 'deflect responsibility and counter-attack, which prevents repair' :
          'shut down and disconnect, leaving your partner unable to reach you'
        }. The antidote: ${data.antidote || 'practice the opposite behavior consciously'}.`);
      }
    }
  }

  // Persona dating behavior
  if (persona?.datingBehavior?.length) {
    insights.push(`Your persona\'s dating behavior patterns: ${persona.datingBehavior.slice(0, 2).join('. ')}. These aren\'t flaws, they\'re tendencies. Once you see them, you can choose differently.`);
  }

  // Repair pattern
  if (m4?.repairRecovery?.speed?.style && m4?.repairRecovery?.mode?.style) {
    const speed = m4.repairRecovery.speed.style;
    const mode = m4.repairRecovery.mode.style;
    insights.push(`You repair ${speed} and prefer ${mode} repair. If you date someone with a different repair speed or mode, it will feel like they "don't care" (if faster) or "won't let it go" (if slower). Neither is true. It\'s a mismatch in process, not intent.`);
  }

  return insights;
}
