/**
 * Relate Assessment - Persona Definitions & Reference Data
 * Version: 3.0
 * 
 * RENAMED FROM: relate_compatibility_engine.js (misleading name - this is NOT an engine)
 * 
 * This file contains REFERENCE DATA:
 * - 32 persona definitions with full behavioral metadata
 * - Pole definitions (what Fitness vs Maturity means, etc.)
 * - Values philosophy (Traditional vs Egalitarian)
 * - Tier logic definitions
 * - Compatibility tables (pre-defined tier assignments)
 * 
 * This file does NOT contain:
 * - Scoring functions (those are in relate_questions.js)
 * - Compatibility calculations (NOT BUILT YET)
 * - The math that ranks personas (NOT BUILT YET)
 */

// ============================================================================
// CODE SYSTEM DEFINITION
// ============================================================================

const CODE_SYSTEM = {
  positions: {
    0: { name: 'Physical', options: ['A', 'B'] },
    1: { name: 'Social', options: ['C', 'D'] },
    2: { name: 'Lifestyle', options: ['E', 'F'] },
    3: { name: 'Values', options: ['G', 'H'] }
  },
  format: 'ACEG',
  description: 'Each code has 4 positions: Physical, Social, Lifestyle, Values'
};

// ============================================================================
// VALUES PHILOSOPHY
// ============================================================================

const VALUES_PHILOSOPHY = {
  G: {
    name: 'Traditional',
    ethos: 'The Old Guard',
    philosophy: 'Honor what has been proven. Trust what has been tested.',
    description: 'Traditional is not about rigidity or nostalgia. It is about HIGH TRUST in systems that have endured.',
    beliefs: [
      'Some patterns exist because they WORK',
      'Clarity of roles reduces friction and builds efficiency',
      'Loyalty and commitment outweigh flexibility',
      'You honor what is right, even when it is hard',
      'There is wisdom in what has been passed down',
      'Complementary strengths build stronger foundations than sameness'
    ],
    exemplar: {
      persona: 'The Cowboy',
      code: [
        'You keep your word',
        'You finish what you start',
        'You ride for the brand',
        'There are things a man does and things a man doesn\'t do',
        'Honor matters more than convenience'
      ]
    },
    archetypeStyle: 'HISTORIC',
    archetypeReason: 'Traditional personas evoke HISTORIC archetypes because they are drawing from patterns that have stood the test of time.',
    examplePersonas: ['The Gladiator', 'The Spy', 'The Cowboy', 'The Legionnaire', 'The Statesman', 'The Ranger', 'The Arborist'],
    throughLine: 'High trust in INHERITED systems + Code-following'
  },
  H: {
    name: 'Egalitarian',
    ethos: 'The New Frontier',
    philosophy: 'Build something new. Test what has been assumed.',
    description: 'Egalitarian is not about rejecting tradition for its own sake. It is about HIGH AGENCY in constructing new systems.',
    beliefs: [
      'Old patterns may have worked for old problems',
      'Equal partnership requires equal voice',
      'Roles should be negotiated, not inherited',
      'Exploration and experimentation lead to better outcomes',
      'What matters is what WORKS FOR US, not what worked for them',
      'Rebellion against unjust defaults is a feature, not a bug'
    ],
    exemplar: {
      persona: 'The Maverick',
      code: [
        'He doesn\'t need hierarchy to feel secure',
        'He wants her riding alongside, not following behind',
        'Rules are starting points, not ending points',
        'Partnership is co-creation, not role-filling',
        'The best idea wins, regardless of whose it is'
      ]
    },
    archetypeStyle: 'FUTURISTIC',
    archetypeReason: 'Egalitarian personas evoke FUTURISTIC archetypes because they are building patterns that have not existed before.',
    examplePersonas: ['The Maverick', 'The Engineer', 'The Sherpa', 'The Cultivator', 'The Professor', 'The Astronaut', 'The Playwright', 'The Builder'],
    throughLine: 'High trust in CONSTRUCTED systems + Code-writing'
  },
  compatibility: {
    critical: 'Values mismatch is a DEALBREAKER in compatibility.',
    warning: 'A Traditional person and an Egalitarian person may have intense chemistry (Physical, Social, Lifestyle all align), but they will clash on HOW to build, WHO decides, and WHAT is honored. This is the At-Risk trap.'
  }
};

// ============================================================================
// M2 DIMENSIONS (Who He Is - Men's Identity)
// ============================================================================

const M2_DIMENSIONS = {
  physical: {
    A: {
      name: 'Fitness',
      core: [
        'Physical Fitness', 'Stamina', 'Health', 'Physique/Build/Dedication',
        'Universal Attraction', 'Strength', 'Athleticism', 'Protection/Safety'
      ],
      whenSheSeeksIt: [
        'Notices his body first',
        'Feels physically safe with him',
        'Values the discipline shown through his body',
        'Athletic photos catch her attention',
        'Wants to feel protected',
        'Physical chemistry matters to her',
        'Attracted to men who take care of themselves',
        'His strength is reassuring',
        'May have been with less fit partners before',
        'Wants someone she is proud to be seen with'
      ],
      whenHeOffersIt: [
        'Leads with his physique',
        'Knows his body is noticed first',
        'Invests significant time in fitness',
        'Uses athleticism as a dating asset',
        'Partners have commented on his build',
        'Feels confident because of his physical presence',
        'Opens doors through physical impression',
        'Takes up space walks into rooms differently',
        'May fear what happens when it fades'
      ]
    },
    B: {
      name: 'Maturity',
      core: [
        'Wisdom and life experience', 'Education', 'Having lived and learned',
        'Emotional depth and substance', 'Figured some things out', 'Seasoned',
        'Groundedness (from experience)', 'Gravitas', 'Weathered and wise'
      ],
      whenSheSeeksIt: [
        'Tired of boys wants a man',
        'Listens for perspective and depth',
        'Values education and intellect',
        'Gray hair or age does not bother her it appeals',
        'Wants emotional stability over flash',
        'Attracted to men who have figured themselves out',
        'Wants someone who has done the work',
        'Drawn to men who have been through things',
        'Looks for groundedness stability',
        'His calm presence is attractive'
      ],
      whenHeOffersIt: [
        'Has been through things and integrated them',
        'Not bitter seasoned',
        'Leads with depth not appearance',
        'Partners have said they feel emotionally safe with him',
        'Has slowed down no longer proving anything',
        'Knows who he is',
        'Can hold difficult conversations',
        'Stillness can sit with silence',
        'His presence is calming',
        'Has done the work on himself'
      ]
    }
  },
  social: {
    C: {
      name: 'Leadership',
      core: [
        'Takes charge', 'Others look to for direction', 'Steps up',
        'Commands a room', 'Decision-maker', 'Decisive', 'Handles things',
        'Steers doesn\'t follow', 'Natural leader', 'Makes plans drives decisions'
      ],
      whenSheSeeksIt: [
        'Wants someone who takes the wheel',
        'Needs to trust he will step up when it counts',
        'Wants him to plan the dates',
        'Decisiveness is attractive',
        'Tired of making all the decisions',
        'Wants to feel led sometimes',
        'His competence lets her relax',
        'Attracted to men others look to',
        'Wants someone who handles things',
        'His confidence in decisions is reassuring'
      ],
      whenHeOffersIt: [
        'Naturally takes charge in groups',
        'People look to him for decisions',
        'Comfortable with responsibility',
        'Makes plans drives direction',
        'Does not wait for permission when action is needed',
        'Partners have valued him for handling things',
        'Takes problems off her plate',
        'Someone she can rely on to manage',
        'May struggle to follow or release control',
        'The weight of decisions does not crush him'
      ]
    },
    D: {
      name: 'Presence',
      core: [
        'Fully present and attentive', 'Undivided attention', 'Truly listens',
        'Notices small things', 'Notices when something\'s off',
        'Makes people feel like only person in room', 'Makes people feel heard and seen',
        'Being truly known', 'Calm (interpersonal)', 'Grounded (centered non-reactive)',
        'Deeply connected one-on-one'
      ],
      whenSheSeeksIt: [
        'Wants to be seen not managed',
        'Done with half-there men',
        'Values attunement over accomplishment',
        'Does not want to be fixed wants to be witnessed',
        'Undivided attention is intoxicating',
        'Wants him to notice without being told',
        'Craves being truly known',
        'Drawn to men who listen not just talk',
        'Calm presence regulates her',
        'His groundedness helps her feel safe'
      ],
      whenHeOffersIt: [
        'Listens to understand not to respond',
        'People tell him things they do not tell others',
        'Not the loudest in the room',
        'Partners have said he makes them feel heard and seen',
        'Notices the small things the shift in her mood',
        'Tracks what matters to her',
        'Calm interpersonally does not escalate',
        'Stays grounded so she can find her ground',
        'Strength is one-on-one connection',
        'Holds space without trying to fix'
      ]
    }
  },
  lifestyle: {
    E: {
      name: 'Adventure',
      core: [
        'Excitement', 'New experiences', 'Spontaneity', 'Growth through exploration',
        'Dynamic life', 'Adventurous', 'Always up for something new',
        'Pushes outside comfort zone', 'Makes life more exciting', 'Shakes things up'
      ],
      whenSheSeeksIt: [
        'Looking at where life will go with him',
        'Wants stories not just stability',
        'May have played it safe before',
        'Values lets go energy',
        'Wants to be pushed outside her comfort zone',
        'Boredom is the enemy',
        'Wants a life that feels alive',
        'Drawn to men who make things happen',
        'Wants travel adventure exploration',
        'His energy is contagious'
      ],
      whenHeOffersIt: [
        'Brings excitement makes life more interesting',
        'Always up for something new',
        'Curious about what is around the next corner',
        'Pushes her outside her comfort zone in growth-oriented ways',
        'Shakes things up routine bores him',
        'Life with him is a story worth telling',
        'Building a life of experiences',
        'His energy is contagious',
        'Partners have said he makes them more adventurous',
        'Not reckless but open'
      ]
    },
    F: {
      name: 'Stability',
      core: [
        'Security', 'Wealth/Financial independence', 'Predictability',
        'Reliability', 'Steady', 'Makes life feel manageable', 'Provides stable foundation'
      ],
      whenSheSeeksIt: [
        'Building a life not just dating',
        'May have had chaos before',
        'Financial security matters to her',
        'Wants someone she can count on',
        'His steadiness regulates her nervous system',
        'Looking for reliability not excitement',
        'Wants a foundation to build on',
        'Attracted to men who have their life together',
        'Wants peace of mind',
        'His consistency is reassuring'
      ],
      whenHeOffersIt: [
        'Steady not boring',
        'Has built something career savings a life that works',
        'Financially independent can provide',
        'Reliable does what he says',
        'Partners have known they could count on him',
        'Makes life feel manageable',
        'Is an anchor in chaos',
        'Provides a stable foundation to build on',
        'His gift is peace of mind',
        'Whatever happens he will be there'
      ]
    }
  },
  values: {
    G: {
      name: 'Traditional',
      core: [
        'Complementary roles', 'Clear division of responsibilities', 'Gender-based strengths',
        'Loyalty', 'Supportive', 'Clear expectations about who does what',
        'Comfortable with traditional gender dynamics', 'Naturally falls into optimized patterns in the relationship',
        'Leans more conservative', 'High trust in inherited systems', 'Honors what is right',
        'Code-following', 'Old Guard ethos'
      ],
      whenAnyoneSeeksIt: [
        'Wants clarity about roles',
        'Believes complementary strengths work better than sameness',
        'Values loyalty and commitment above flexibility',
        'Finds security in knowing what is expected',
        'Wants a partner who knows their lane',
        'Traditional dynamics feel natural not forced',
        'Wants to build something that lasts',
        'Values stability over experimentation',
        'Knows what kind of partnership they want',
        'Trusts patterns that have been tested'
      ],
      whenHeOffersIt: [
        'Sees himself as provider protector',
        'Comfortable leading in certain areas supporting in others',
        'Knows his lane and stays in it',
        'Has clear expectations of himself and of her',
        'Loyal once committed he stays',
        'Works through difficulty does not leave',
        'Supports her role as she supports his',
        'Naturally falls into optimized patterns',
        'Partnership through differentiation',
        'Lives by a code',
        'Honors what has been proven'
      ]
    },
    H: {
      name: 'Egalitarian',
      core: [
        'Equal partnership', 'Shared responsibilities', 'No gender defaults',
        'All decisions collaborative', 'Neither person has more say than the other',
        'Equal division of household responsibilities', 'Decisions made jointly',
        'Gender doesn\'t determine who does what', 'Leans more progressive',
        'High trust in constructed systems', 'Builds what could be', 'Code-writing', 'New Frontier spirit'
      ],
      whenAnyoneSeeksIt: [
        'Wants real equality not lip service',
        'Shared power matters',
        'Rejects gender defaults',
        'Wants collaboration on every decision',
        'Building something new together',
        'Will not accept less than equal',
        'Their voice must carry equal weight',
        'Looking for a true partner',
        'Has rejected traditional scripts',
        'Wants flexibility not fixed roles',
        'Willing to experiment to find what works'
      ],
      whenHeOffersIt: [
        'Genuinely shares power not performatively',
        'Does not need to lead to feel like a man',
        'Can follow can defer',
        'Does not default to gender assumptions',
        'All tasks negotiable based on skill and preference',
        'Makes decisions jointly discusses collaborates',
        'Sees her as equal in practice not just theory',
        'Her career time and voice matter as much as his',
        'Has examined traditional masculinity kept what works',
        'Secure enough to not need dominance',
        'Shares household responsibilities actually not just philosophically',
        'Leans progressive open to new ways',
        'Writes his own code'
      ]
    }
  }
};

// ============================================================================
// W2 DIMENSIONS (Who She Is - Women's Identity)
// ============================================================================

const W2_DIMENSIONS = {
  physical: {
    A: {
      name: 'Beauty',
      core: [
        'Sex appeal', 'Conventional beauty standards', 'Universal appeal',
        'Health (low BMI)', 'Aesthetic appeal', 'Stunning', 'Turns heads',
        'Looks noticed first', 'Appearance opens doors'
      ],
      whenHeSeeksIt: [
        'Responding to something primal and visual',
        'Swipes on photos first',
        'Wants a woman who turns heads',
        'Social proof matters to him',
        'Thinking about long-term desire',
        'Attracted to conventional beauty',
        'Wants to feel proud with her',
        'Physical attraction is non-negotiable',
        'Her looks catch his attention first',
        'Chemistry starts with appearance'
      ],
      whenSheOffersIt: [
        'Knows her looks are her opener',
        'Has seen how the world responds to her beauty',
        'Doors open people are nicer men pay attention',
        'Invests in her appearance time money effort',
        'Partners have told her she is beautiful',
        'Leads with her looks on apps and in person',
        'May wonder if she is valued beyond appearance',
        'Maintains it fitness skincare fashion',
        'Beauty at this level is work',
        'Comfortable being looked at owns it'
      ]
    },
    B: {
      name: 'Confidence',
      core: [
        'Self-assurance', 'How she carries herself', 'Inner strength',
        'Comfortable in her skin', 'Her presence commands a room', 'Substance',
        'Depth and perspective', 'Leads with who she is', 'Speaks her mind',
        'Wins people over through conversation', 'What she brings intellectually and emotionally'
      ],
      whenHeSeeksIt: [
        'Looking past surface',
        'Done with insecurity and neediness',
        'Watches how she carries herself',
        'Wants intellectual substance',
        'Her inner strength is sexy',
        'She chooses him not needs him',
        'Attracted to self-assurance',
        'Wants depth and perspective',
        'Values what she brings intellectually',
        'Her groundedness is attractive'
      ],
      whenSheOffersIt: [
        'Knows who she is groundedness not arrogance',
        'Has done the work therapy reflection hard conversations',
        'Leads with who she is not how she looks',
        'Speaks her mind has opinions and shares them',
        'Not rearranging herself to be palatable',
        'Wins people over through conversation',
        'Comfortable in her skin flaws and all',
        'Partners have been drawn to her depth',
        'They stay because of who she is',
        'Her presence commands a room through energy and substance'
      ]
    }
  },
  social: {
    C: {
      name: 'Allure',
      core: [
        'Demands attention', 'Stands out', 'Seeks attention for her looks',
        'Comfortable in her body', 'Enjoys the spotlight', 'Admired by others',
        'Magnetic', 'Captivating presence', 'People drawn before she speaks',
        'Center of attention', 'Draws people in and holds attention'
      ],
      whenHeSeeksIt: [
        'Wants a woman everyone notices',
        'Attracted to her magnetism',
        'She commands attention without demanding it',
        'That pull is intoxicating',
        'Wants to be with the woman others want',
        'Her presence fills a room',
        'Drawn to her before she speaks',
        'Social proof through attention',
        'Wants someone captivating',
        'The way she carries herself is magnetic'
      ],
      whenSheOffersIt: [
        'Knows she has it the room shifts when she enters',
        'Magnetic something about her energy draws people',
        'Comfortable in her body moves with ease',
        'Takes up space unapologetically',
        'Enjoys the spotlight attention feeds her',
        'People drawn to her before she speaks',
        'Has learned to wield this intentionally',
        'Holds attention not just catches it',
        'People lean in and do not lean back',
        'May struggle when not the center allure can become need'
      ]
    },
    D: {
      name: 'Charm',
      core: [
        'Warmth', 'Witty', 'Approachable', 'Girl next door', 'Easy connection',
        'Laughter', 'Makes people feel comfortable and welcome',
        'Makes people feel at ease and truly seen', 'Creates a safe space',
        'Makes individuals feel special', 'Nurtures individuals'
      ],
      whenHeSeeksIt: [
        'Wants to feel comfortable not impressed',
        'Done with intimidating women',
        'Wants warmth not performance',
        'Can imagine a life with her',
        'She makes him feel special',
        'Can be himself around her',
        'Wants easy not dramatic',
        'Drawn to approachability',
        'Her warmth is disarming',
        'Looking for comfort not challenge'
      ],
      whenSheOffersIt: [
        'Her gift is making people feel comfortable',
        'Not performance genuinely warms to people',
        'Approachable not intimidating no wall',
        'Witty funny conversation is easy',
        'Makes individuals feel special full attention',
        'Creates a safe space people open up to her',
        'Nurtures makes people feel cared for',
        'Partners have felt at ease from the beginning',
        'No games no tests just warmth',
        'The woman you want to come home to',
        'Comfort sanctuary'
      ]
    }
  },
  lifestyle: {
    E: {
      name: 'Thrill',
      core: [
        'Excitement', 'Sexual tension', 'Chemistry', 'Spontaneity', 'Novelty',
        'Dynamic energy', 'Contagious', 'New experiences',
        'Interesting life over comfortable one', 'Stories over savings',
        'Always up for something new', 'Pushes outside comfort zone',
        'Makes life more exciting', 'Shakes things up', 'Loud'
      ],
      whenHeSeeksIt: [
        'Wants to feel alive not just comfortable',
        'Chasing chemistry and sexual tension',
        'Wants spontaneity and surprise',
        'Drawn to dynamic energy',
        'Boredom is the enemy',
        'Wants someone who shakes things up',
        'Looking for intensity',
        'Her energy is intoxicating',
        'Wants passion over peace',
        'Life with her is an adventure'
      ],
      whenSheOffersIt: [
        'Exciting not just fun there is intensity',
        'Spontaneous plans change adventures happen',
        'Sexual tension is her currency chemistry is her skill',
        'Energy is contagious dynamic',
        'Enters a room and the room speeds up',
        'Pushes him outside his comfort zone',
        'Shakes things up does not let life settle',
        'Loud in presence and energy takes up space',
        'Partners have said life was never boring',
        'May not know how to be still'
      ]
    },
    F: {
      name: 'Peace',
      core: [
        'Calm (lifestyle)', 'Sanctuary', 'Quiet connection', 'Grounded and steady',
        'Helps partner feel secure and settled', 'Makes life feel manageable',
        'Communicates calmly', 'Doesn\'t escalate', 'Talks through things without drama',
        'De-escalates'
      ],
      whenHeSeeksIt: [
        'Done with chaos and drama',
        'Tired of intense relationships',
        'Wants sanctuary not stimulation',
        'Values calm communication',
        'Wants to feel settled',
        'She is part of the solution not the chaos',
        'Looking for peace at home',
        'Her steadiness is attractive',
        'Wants low drama',
        'Ready for rest not rollercoaster'
      ],
      whenSheOffersIt: [
        'Calm not passive stillness that regulates the space',
        'Grounded and steady not reactive',
        'Anchors when chaos comes',
        'Communicates without drama resolves without escalation',
        'Creates sanctuary home with her feels like rest',
        'De-escalates by holding conflict without explosion',
        'Partners have felt settled with her nervous system calms',
        'Makes life feel manageable',
        'Her gift is stillness',
        'Offers rest in a world that demands motion'
      ]
    }
  },
  values: {
    G: {
      name: 'Traditional',
      core: [
        'Complementary roles', 'Clear division of responsibilities', 'Gender-based strengths',
        'Loyalty', 'Supportive', 'Clear expectations about who does what',
        'Comfortable with traditional gender dynamics', 'Naturally falls into optimized patterns in the relationship',
        'Leans more conservative', 'High trust in inherited systems', 'Honors what is right',
        'Code-following', 'Old Guard ethos'
      ],
      whenAnyoneSeeksIt: [
        'Wants clarity about roles',
        'Believes complementary strengths work better than sameness',
        'Values loyalty and commitment above flexibility',
        'Finds security in knowing what is expected',
        'Wants a partner who knows their lane',
        'Traditional dynamics feel natural not forced',
        'Wants to build something that lasts',
        'Values stability over experimentation',
        'Knows what kind of partnership they want',
        'Trusts patterns that have been tested'
      ],
      whenSheOffersIt: [
        'Sees value in roles has chosen them',
        'Comfortable supporting his leadership in some domains',
        'Leads in her domains without needing to lead everywhere',
        'Has clear expectations of herself and of him',
        'Loyal committed stays through difficulty',
        'Creates home sanctuary is her art',
        'Naturally falls into patterns that work',
        'Does not resist structure uses it',
        'Leans conservative in relationships',
        'Lives by a code',
        'Honors what has been proven'
      ]
    },
    H: {
      name: 'Egalitarian',
      core: [
        'Equal partnership', 'Shared responsibilities', 'No gender defaults',
        'All decisions collaborative', 'Neither person has more say than the other',
        'Equal division of household responsibilities', 'Decisions made jointly',
        'Gender doesn\'t determine who does what', 'Leans more progressive',
        'High trust in constructed systems', 'Builds what could be', 'Code-writing', 'New Frontier spirit'
      ],
      whenAnyoneSeeksIt: [
        'Wants real equality not lip service',
        'Shared power matters',
        'Rejects gender defaults',
        'Wants collaboration on every decision',
        'Building something new together',
        'Will not accept less than equal',
        'Their voice must carry equal weight',
        'Looking for a true partner',
        'Has rejected traditional scripts',
        'Wants flexibility not fixed roles',
        'Willing to experiment to find what works'
      ],
      whenSheOffersIt: [
        'Expects to be equal does not accept less',
        'Does not fall into gender defaults',
        'Negotiates every role based on what makes sense',
        'Makes decisions jointly expects to be consulted',
        'Her voice carries equal weight',
        'Shares responsibilities does not do more because she is a woman',
        'Has rejected scripts that do not serve her',
        'Does not need him to lead to feel secure',
        'Can lead or follow depending on situation',
        'Leans progressive building a relationship that is hers',
        'Will call out inequality it is non-negotiable',
        'Writes her own code'
      ]
    }
  }
};

// ============================================================================
// TIER LOGIC
// ============================================================================

const TIER_LOGIC = {
  tiers: {
    ideal: {
      count: 1,
      rule: 'Values match + 3 others match',
      successProbability: 0.80
    },
    kismet: {
      count: 3,
      rule: 'Values match + 2 others match',
      successProbability: 0.65
    },
    effort: {
      count: 3,
      rule: 'Values match + 1 other matches',
      successProbability: 0.45
    },
    longShot: {
      count: 1,
      rule: 'Values match + 0 others match (hard but possible with commitment)',
      successProbability: 0.25
    },
    atRisk: {
      count: 4,
      rule: 'Values MISMATCH + 2-3 others match (THE TRAP - chemistry without foundation)',
      successProbability: 0.10,
      warning: 'At-Risk looks good but fails.'
    },
    incompatible: {
      count: 4,
      rule: 'Values MISMATCH + 0-1 others match',
      successProbability: 0.02
    }
  },
  criticalRule: 'Values mismatch is a DEALBREAKER.',
  insight: 'Long Shot is BETTER than At-Risk - shared values with no chemistry can work with effort. Great chemistry with mismatched values will not.'
};

// ============================================================================
// M2 COMPATIBILITY TABLE (Men seeking Women)
// ============================================================================

const M2_COMPATIBILITY_TABLE = {
  'ACEG': {
    name: 'The Gladiator',
    ideal: ['ACEG'],
    kismet: ['ACFG', 'ADEG', 'BCEG'],
    effort: ['ADFG', 'BCFG', 'BDEG'],
    longShot: ['BDFG'],
    atRisk: ['ACEH', 'ACFH', 'ADEH', 'BCEH'],
    incompatible: ['ADFH', 'BCFH', 'BDEH', 'BDFH']
  },
  'ACEH': {
    name: 'The Maverick',
    ideal: ['ACEH'],
    kismet: ['ACFH', 'ADEH', 'BCEH'],
    effort: ['ADFH', 'BCFH', 'BDEH'],
    longShot: ['BDFH'],
    atRisk: ['ACEG', 'ACFG', 'ADEG', 'BCEG'],
    incompatible: ['ADFG', 'BCFG', 'BDEG', 'BDFG']
  },
  'ACFG': {
    name: 'The Spy',
    ideal: ['ACFG'],
    kismet: ['ACEG', 'ADFG', 'BCFG'],
    effort: ['ADEG', 'BCEG', 'BDFG'],
    longShot: ['BDEG'],
    atRisk: ['ACFH', 'ACEH', 'ADFH', 'BCFH'],
    incompatible: ['ADEH', 'BCEH', 'BDEH', 'BDFH']
  },
  'ACFH': {
    name: 'The Engineer',
    ideal: ['ACFH'],
    kismet: ['ACEH', 'ADFH', 'BCFH'],
    effort: ['ADEH', 'BCEH', 'BDFH'],
    longShot: ['BDEH'],
    atRisk: ['ACFG', 'ACEG', 'ADFG', 'BCFG'],
    incompatible: ['ADEG', 'BCEG', 'BDEG', 'BDFG']
  },
  'ADEG': {
    name: 'The Cowboy',
    ideal: ['ADEG'],
    kismet: ['ACEG', 'ADFG', 'BDEG'],
    effort: ['ACFG', 'BCEG', 'BDFG'],
    longShot: ['BCFG'],
    atRisk: ['ADEH', 'ACEH', 'ADFH', 'BDEH'],
    incompatible: ['ACFH', 'BCEH', 'BCFH', 'BDFH']
  },
  'ADEH': {
    name: 'The Sherpa',
    ideal: ['ADEH'],
    kismet: ['ACEH', 'ADFH', 'BDEH'],
    effort: ['ACFH', 'BCEH', 'BDFH'],
    longShot: ['BCFH'],
    atRisk: ['ADEG', 'ACEG', 'ADFG', 'BDEG'],
    incompatible: ['ACFG', 'BCEG', 'BCFG', 'BDFG']
  },
  'ADFG': {
    name: 'The Curator',
    ideal: ['ADFG'],
    kismet: ['ACFG', 'ADEG', 'BDFG'],
    effort: ['ACEG', 'BCFG', 'BDEG'],
    longShot: ['BCEG'],
    atRisk: ['ADFH', 'ACFH', 'ADEH', 'BDFH'],
    incompatible: ['ACEH', 'BCEH', 'BCFH', 'BDEH']
  },
  'ADFH': {
    name: 'The Recruiter',
    ideal: ['ADFH'],
    kismet: ['ACFH', 'ADEH', 'BDFH'],
    effort: ['ACEH', 'BCFH', 'BDEH'],
    longShot: ['BCEH'],
    atRisk: ['ADFG', 'ACFG', 'ADEG', 'BDFG'],
    incompatible: ['ACEG', 'BCEG', 'BCFG', 'BDEG']
  },
  'BCEG': {
    name: 'The Legionnaire',
    ideal: ['BCEG'],
    kismet: ['ACEG', 'BCFG', 'BDEG'],
    effort: ['ACFG', 'ADEG', 'BDFG'],
    longShot: ['ADFG'],
    atRisk: ['BCEH', 'ACEH', 'BCFH', 'BDEH'],
    incompatible: ['ACFH', 'ADEH', 'ADFH', 'BDFH']
  },
  'BCEH': {
    name: 'The Astronaut',
    ideal: ['BCEH'],
    kismet: ['ACEH', 'BCFH', 'BDEH'],
    effort: ['ACFH', 'ADEH', 'BDFH'],
    longShot: ['ADFH'],
    atRisk: ['BCEG', 'ACEG', 'BCFG', 'BDEG'],
    incompatible: ['ACFG', 'ADEG', 'ADFG', 'BDFG']
  },
  'BCFG': {
    name: 'The Statesman',
    ideal: ['BCFG'],
    kismet: ['ACFG', 'BCEG', 'BDFG'],
    effort: ['ACEG', 'ADFG', 'BDEG'],
    longShot: ['ADEG'],
    atRisk: ['BCFH', 'ACFH', 'BCEH', 'BDFH'],
    incompatible: ['ACEH', 'ADEH', 'ADFH', 'BDEH']
  },
  'BCFH': {
    name: 'The Professor',
    ideal: ['BCFH'],
    kismet: ['ACFH', 'BCEH', 'BDFH'],
    effort: ['ACEH', 'ADFH', 'BDEH'],
    longShot: ['ADEH'],
    atRisk: ['BCFG', 'ACFG', 'BCEG', 'BDFG'],
    incompatible: ['ACEG', 'ADEG', 'ADFG', 'BDEG']
  },
  'BDEG': {
    name: 'The Ranger',
    ideal: ['BDEG'],
    kismet: ['ADEG', 'BCEG', 'BDFG'],
    effort: ['ACEG', 'ADFG', 'BCFG'],
    longShot: ['ACFG'],
    atRisk: ['BDEH', 'ADEH', 'BCEH', 'BDFH'],
    incompatible: ['ACEH', 'ACFH', 'ADFH', 'BCFH']
  },
  'BDEH': {
    name: 'The Playwright',
    ideal: ['BDEH'],
    kismet: ['ADEH', 'BCEH', 'BDFH'],
    effort: ['ACEH', 'ADFH', 'BCFH'],
    longShot: ['ACFH'],
    atRisk: ['BDEG', 'ADEG', 'BCEG', 'BDFG'],
    incompatible: ['ACEG', 'ACFG', 'ADFG', 'BCFG']
  },
  'BDFG': {
    name: 'The Arborist',
    ideal: ['BDFG'],
    kismet: ['ADFG', 'BCFG', 'BDEG'],
    effort: ['ACFG', 'ADEG', 'BCEG'],
    longShot: ['ACEG'],
    atRisk: ['BDFH', 'ADFH', 'BCFH', 'BDEH'],
    incompatible: ['ACEH', 'ACFH', 'ADEH', 'BCEH']
  },
  'BDFH': {
    name: 'The Builder',
    ideal: ['BDFH'],
    kismet: ['ADFH', 'BCFH', 'BDEH'],
    effort: ['ACFH', 'ADEH', 'BCEH'],
    longShot: ['ACEH'],
    atRisk: ['BDFG', 'ADFG', 'BCFG', 'BDEG'],
    incompatible: ['ACEG', 'ACFG', 'ADEG', 'BCEG']
  }
};

// ============================================================================
// W2 COMPATIBILITY TABLE (Women seeking Men)
// ============================================================================

const W2_COMPATIBILITY_TABLE = {
  'ACEG': {
    name: 'The Debutante',
    ideal: ['ACEG'],
    kismet: ['ACFG', 'ADEG', 'BCEG'],
    effort: ['ADFG', 'BCFG', 'BDEG'],
    longShot: ['BDFG'],
    atRisk: ['ACEH', 'ACFH', 'ADEH', 'BCEH'],
    incompatible: ['ADFH', 'BCFH', 'BDEH', 'BDFH']
  },
  'ACEH': {
    name: 'The Correspondent',
    ideal: ['ACEH'],
    kismet: ['ACFH', 'ADEH', 'BCEH'],
    effort: ['ADFH', 'BCFH', 'BDEH'],
    longShot: ['BDFH'],
    atRisk: ['ACEG', 'ACFG', 'ADEG', 'BCEG'],
    incompatible: ['ADFG', 'BCFG', 'BDEG', 'BDFG']
  },
  'ACFG': {
    name: 'The Duchess',
    ideal: ['ACFG'],
    kismet: ['ACEG', 'ADFG', 'BCFG'],
    effort: ['ADEG', 'BCEG', 'BDFG'],
    longShot: ['BDEG'],
    atRisk: ['ACFH', 'ACEH', 'ADFH', 'BCFH'],
    incompatible: ['ADEH', 'BCEH', 'BDEH', 'BDFH']
  },
  'ACFH': {
    name: 'The Influencer',
    ideal: ['ACFH'],
    kismet: ['ACEH', 'ADFH', 'BCFH'],
    effort: ['ADEH', 'BCEH', 'BDFH'],
    longShot: ['BDEH'],
    atRisk: ['ACFG', 'ACEG', 'ADFG', 'BCFG'],
    incompatible: ['ADEG', 'BCEG', 'BDEG', 'BDFG']
  },
  'ADEG': {
    name: 'The Barrel Racer',
    ideal: ['ADEG'],
    kismet: ['ACEG', 'ADFG', 'BDEG'],
    effort: ['ACFG', 'BCEG', 'BDFG'],
    longShot: ['BCFG'],
    atRisk: ['ADEH', 'ACEH', 'ADFH', 'BDEH'],
    incompatible: ['ACFH', 'BCEH', 'BCFH', 'BDFH']
  },
  'ADEH': {
    name: 'The Podcaster',
    ideal: ['ADEH'],
    kismet: ['ACEH', 'ADFH', 'BDEH'],
    effort: ['ACFH', 'BCEH', 'BDFH'],
    longShot: ['BCFH'],
    atRisk: ['ADEG', 'ACEG', 'ADFG', 'BDEG'],
    incompatible: ['ACFG', 'BCEG', 'BCFG', 'BDFG']
  },
  'ADFG': {
    name: 'The Trophy',
    ideal: ['ADFG'],
    kismet: ['ACFG', 'ADEG', 'BDFG'],
    effort: ['ACEG', 'BCFG', 'BDEG'],
    longShot: ['BCEG'],
    atRisk: ['ADFH', 'ACFH', 'ADEH', 'BDFH'],
    incompatible: ['ACEH', 'BCEH', 'BCFH', 'BDEH']
  },
  'ADFH': {
    name: 'The Girl Next Door',
    ideal: ['ADFH'],
    kismet: ['ACFH', 'ADEH', 'BDFH'],
    effort: ['ACEH', 'BCFH', 'BDEH'],
    longShot: ['BCEH'],
    atRisk: ['ADFG', 'ACFG', 'ADEG', 'BDFG'],
    incompatible: ['ACEG', 'BCEG', 'BCFG', 'BDEG']
  },
  'BCEG': {
    name: 'The Party Planner',
    ideal: ['BCEG'],
    kismet: ['ACEG', 'BCFG', 'BDEG'],
    effort: ['ACFG', 'ADEG', 'BDFG'],
    longShot: ['ADFG'],
    atRisk: ['BCEH', 'ACEH', 'BCFH', 'BDEH'],
    incompatible: ['ACFH', 'ADEH', 'ADFH', 'BDFH']
  },
  'BCEH': {
    name: 'The Marketer',
    ideal: ['BCEH'],
    kismet: ['ACEH', 'BCFH', 'BDEH'],
    effort: ['ACFH', 'ADEH', 'BDFH'],
    longShot: ['ADFH'],
    atRisk: ['BCEG', 'ACEG', 'BCFG', 'BDEG'],
    incompatible: ['ACFG', 'ADEG', 'ADFG', 'BDFG']
  },
  'BCFG': {
    name: 'The Executive',
    ideal: ['BCFG'],
    kismet: ['ACFG', 'BCEG', 'BDFG'],
    effort: ['ACEG', 'ADFG', 'BDEG'],
    longShot: ['ADEG'],
    atRisk: ['BCFH', 'ACFH', 'BCEH', 'BDFH'],
    incompatible: ['ACEH', 'ADEH', 'ADFH', 'BDEH']
  },
  'BCFH': {
    name: 'The Producer',
    ideal: ['BCFH'],
    kismet: ['ACFH', 'BCEH', 'BDFH'],
    effort: ['ACEH', 'ADFH', 'BDEH'],
    longShot: ['ADEH'],
    atRisk: ['BCFG', 'ACFG', 'BCEG', 'BDFG'],
    incompatible: ['ACEG', 'ADEG', 'ADFG', 'BDEG']
  },
  'BDEG': {
    name: 'The Coach',
    ideal: ['BDEG'],
    kismet: ['ADEG', 'BCEG', 'BDFG'],
    effort: ['ACEG', 'ADFG', 'BCFG'],
    longShot: ['ACFG'],
    atRisk: ['BDEH', 'ADEH', 'BCEH', 'BDFH'],
    incompatible: ['ACEH', 'ACFH', 'ADFH', 'BCFH']
  },
  'BDEH': {
    name: 'The Founder',
    ideal: ['BDEH'],
    kismet: ['ADEH', 'BCEH', 'BDFH'],
    effort: ['ACEH', 'ADFH', 'BCFH'],
    longShot: ['ACFH'],
    atRisk: ['BDEG', 'ADEG', 'BCEG', 'BDFG'],
    incompatible: ['ACEG', 'ACFG', 'ADFG', 'BCFG']
  },
  'BDFG': {
    name: 'The Designer',
    ideal: ['BDFG'],
    kismet: ['ADFG', 'BCFG', 'BDEG'],
    effort: ['ACFG', 'ADEG', 'BCEG'],
    longShot: ['ACEG'],
    atRisk: ['BDFH', 'ADFH', 'BCFH', 'BDEH'],
    incompatible: ['ACEH', 'ACFH', 'ADEH', 'BCEH']
  },
  'BDFH': {
    name: 'The Therapist',
    ideal: ['BDFH'],
    kismet: ['ADFH', 'BCFH', 'BDEH'],
    effort: ['ACFH', 'ADEH', 'BCEH'],
    longShot: ['ACEH'],
    atRisk: ['BDFG', 'ADFG', 'BCFG', 'BDEG'],
    incompatible: ['ACEG', 'ACFG', 'ADEG', 'BCEG']
  }
}

// ============================================================================
// PERSONA NAME LOOKUPS
// ============================================================================

const M2_PERSONA_NAMES = {
  'ACEG': 'The Gladiator',
  'ACEH': 'The Maverick',
  'ACFG': 'The Spy',
  'ACFH': 'The Engineer',
  'ADEG': 'The Cowboy',
  'ADEH': 'The Sherpa',
  'ADFG': 'The Curator',
  'ADFH': 'The Recruiter',
  'BCEG': 'The Legionnaire',
  'BCEH': 'The Astronaut',
  'BCFG': 'The Statesman',
  'BCFH': 'The Professor',
  'BDEG': 'The Ranger',
  'BDEH': 'The Playwright',
  'BDFG': 'The Arborist',
  'BDFH': 'The Builder'
};

const W2_PERSONA_NAMES = {
  'ACEG': 'The Debutante',
  'ACEH': 'The Correspondent',
  'ACFG': 'The Duchess',
  'ACFH': 'The Influencer',
  'ADEG': 'The Barrel Racer',
  'ADEH': 'The Podcaster',
  'ADFG': 'The Trophy',
  'ADFH': 'The Girl Next Door',
  'BCEG': 'The Party Planner',
  'BCEH': 'The Marketer',
  'BCFG': 'The Executive',
  'BCFH': 'The Producer',
  'BDEG': 'The Coach',
  'BDEH': 'The Founder',
  'BDFG': 'The Designer',
  'BDFH': 'The Therapist'
};

// ============================================================================
// TRAIT DEFINITIONS
// ============================================================================

const M2_TRAITS = {
  'A': { name: 'Fitness', dimension: 'Physical' },
  'B': { name: 'Maturity', dimension: 'Physical' },
  'C': { name: 'Leadership', dimension: 'Social' },
  'D': { name: 'Presence', dimension: 'Social' },
  'E': { name: 'Adventure', dimension: 'Lifestyle' },
  'F': { name: 'Stability', dimension: 'Lifestyle' },
  'G': { name: 'Traditional', dimension: 'Values' },
  'H': { name: 'Egalitarian', dimension: 'Values' }
};

const W2_TRAITS = {
  'A': { name: 'Beauty', dimension: 'Physical' },
  'B': { name: 'Confidence', dimension: 'Physical' },
  'C': { name: 'Allure', dimension: 'Social' },
  'D': { name: 'Charm', dimension: 'Social' },
  'E': { name: 'Thrill', dimension: 'Lifestyle' },
  'F': { name: 'Peace', dimension: 'Lifestyle' },
  'G': { name: 'Traditional', dimension: 'Values' },
  'H': { name: 'Egalitarian', dimension: 'Values' }
};

// ============================================================================
// M2 PERSONA BEHAVIORAL METADATA
// ============================================================================
// Comprehensive behavioral profiles for each M2 Men persona
// Used for assessment output, coaching, and compatibility narratives

const M2_PERSONA_METADATA = {
  'ACEG': {
    name: 'The Gladiator',
    traits: 'Fitness + Leadership + Adventure + Traditional',
    datingBehavior: [
      'Pursues directly and confidently; does not hide interest or play games',
      'Plans dates that showcase his competence: athletic activities, competitive environments, experiences where he can lead',
      'Moves quickly once interested; sees hesitation as weakness',
      'Tests her early to see if she can handle his intensity',
      'Expects her to recognize his value without excessive salesmanship'
    ],
    inRelationships: [
      'Takes charge of major decisions and expects her to trust his judgment',
      'Protective to the point of possessiveness; sees her safety as his responsibility',
      'Keeps life exciting through physical challenges, travel, competition',
      'Expresses love through action and provision rather than verbal affirmation',
      'Maintains his body and expects her to maintain hers'
    ],
    howValued: [
      'Partners feel physically safe; his presence is a deterrent to threats',
      'His confidence is stabilizing; she does not have to wonder if he can handle things',
      'He prevents life from becoming stagnant; there is always a next challenge',
      'His physical presence is a source of pride for partners who value that currency',
      'He finishes what he starts; reliable in action if not always in emotional attunement'
    ],
    disappointments: [
      'When she stops showing admiration or being impressed by what he provides',
      'When she questions his decisions publicly or undermines his authority',
      'When her desire for him seems to fade after commitment',
      'When life becomes routine and she resists his need for challenge',
      'When she does not maintain the physical standards he maintains for himself'
    ],
    struggles: [
      'Emotional vulnerability feels like weakness; he avoids it reflexively',
      'Can bulldoze her preferences in his certainty about what is best',
      'Competition mindset bleeds into arguments; needs to win rather than resolve',
      'May not notice her emotional needs until they become crises',
      'Difficulty admitting fault or apologizing without qualification'
    ],
    mostAttractive: [
      'Physical presence that commands attention without effort',
      'Confidence that does not require external validation',
      'Decisiveness; he knows what he wants and acts on it',
      'Energy and drive that makes life feel dynamic',
      'Loyalty once committed; he will fight for what is his'
    ],
    leastAttractive: [
      'Can be domineering and dismissive of her perspective',
      'Emotional range limited to strength-adjacent feelings: anger, pride, protectiveness',
      'Competitive even when competition is inappropriate',
      'May value her beauty as status confirmation rather than seeing her fully',
      'Impatience with any form of weakness, including her moments of vulnerability'
    ],
    datingEconomyCompetition: [
      'Competes on physical presence, confidence, and demonstrated competence',
      'Signals value through fitness, lifestyle markers, visible success',
      'Attracts women who want a leader and protector, who find safety in his certainty',
      'Differentiates from softer men by being unapologetically masculine',
      'Loses prospects who prioritize emotional depth over physical impressiveness'
    ]
  },

  'ACEH': {
    name: 'The Maverick',
    traits: 'Fitness + Leadership + Adventure + Egalitarian',
    datingBehavior: [
      'Approaches dating as mutual evaluation; he is assessing her as much as she assesses him',
      'Creates dates that reveal character: adventures, challenges, novel situations',
      'Attracted to women who push back and hold their own in conversation',
      'Flirts through challenge and intellectual sparring rather than pure flattery',
      'Loses interest quickly in women who defer too easily or seem to lack their own direction'
    ],
    inRelationships: [
      'Treats her as partner in adventure rather than someone to protect from it',
      'Values her independence and actively encourages it',
      'Expects her to have her own pursuits, opinions, and ambitions',
      'Shares leadership fluidly based on who has more competence in each domain',
      'Physical attraction remains important; he maintains himself and hopes she does too'
    ],
    howValued: [
      'Partners feel respected as full humans rather than accessories or dependents',
      'His energy keeps life unpredictable in good ways',
      'He celebrates her accomplishments without feeling threatened by them',
      'Provides space for her autonomy within committed partnership',
      'Physical vitality combined with emotional security in her independence'
    ],
    disappointments: [
      'When she becomes dependent and loses the edge that attracted him',
      'When she defers to him instead of contributing her genuine perspective',
      'When risk aversion closes off adventures he wants to share',
      'When she expects traditional provision while rejecting traditional reciprocity',
      'When either of them stops investing in physical attraction'
    ],
    struggles: [
      'So focused on equality that he may miss moments when she needs him to simply take over',
      'His independence can register as emotional unavailability',
      'May intellectualize relationship problems rather than feeling through them',
      'Competitive nature can make conflict feel like a contest',
      'Difficulty with stillness; always needs the next horizon'
    ],
    mostAttractive: [
      'Respects women as full humans, not roles to be filled',
      'Confident without needing to dominate; secure in his masculinity',
      'Physical vitality paired with intellectual engagement',
      'Promises an interesting life with genuine partnership',
      'Does not require her diminishment to feel like a man'
    ],
    leastAttractive: [
      'Can seem dismissive of women who want more traditional dynamics',
      'May undervalue nurturing or softness, seeing it as lack of strength',
      'Restlessness makes stable phases feel like stagnation to him',
      'Can analyze feelings rather than sharing them',
      'His self-sufficiency can make her wonder if he truly needs her'
    ],
    datingEconomyCompetition: [
      'Competes on combination of masculine presence and progressive partnership values',
      'Attracts ambitious women who want equality without sacrificing attraction',
      'Differentiates from traditional men by offering respect without requiring submission',
      'Differentiates from softer progressive men by maintaining physical confidence',
      'Loses prospects who want to be taken care of or who find his energy exhausting'
    ]
  },

  'ACFG': {
    name: 'The Spy',
    traits: 'Fitness + Leadership + Stability + Traditional',
    datingBehavior: [
      'Observes extensively before revealing interest; gathers information first',
      'Controls what he discloses about himself; reveals only what serves his purpose',
      'Plans dates that let him assess her character while protecting his own privacy',
      'Patient in pursuit; comfortable with long timelines',
      'Tests loyalty and discretion early; needs to know she can be trusted with him'
    ],
    inRelationships: [
      'Provides security through competence and preparation, not emotional reassurance',
      'Handles threats before she knows they existed',
      'Maintains control of household strategy and major decisions',
      'Shows love through acts of service and consistent reliability',
      'Keeps parts of himself compartmentalized even in marriage'
    ],
    howValued: [
      'Partners feel profoundly secure; he has anticipated and handled problems invisibly',
      'His competence is total; nothing genuinely catches him off guard',
      'Calm stability that comes from someone who has contingencies for everything',
      'He notices details others miss; she feels observed in ways that can feel like being truly seen',
      'Once loyalty is established, it is absolute; he does not waver'
    ],
    disappointments: [
      'When she demands emotional access he cannot provide without feeling exposed',
      'When she cannot accept his need for privacy and controlled disclosure',
      'When her indiscretion threatens the security architecture he has built',
      'When she fails to appreciate his quiet provision because it lacks drama',
      'When chaos enters through her decisions or her people'
    ],
    struggles: [
      'Equates emotional openness with tactical vulnerability',
      'Control needs can become suffocating even when well-intentioned',
      'Compartmentalization means she may never know his full self',
      'Spontaneity feels like loss of control; he resists it',
      'Does not recognize that his secrecy erodes trust even when he has nothing to hide'
    ],
    mostAttractive: [
      'Quiet competence; handles problems without drama or need for credit',
      'Depth and mystery that rewards curiosity',
      'Complete reliability; his word is his bond',
      'Observational intelligence that makes her feel truly noticed',
      'Physical capability paired with strategic mind'
    ],
    leastAttractive: [
      'Emotional walls that may never fully come down',
      'Control needs that can feel manipulative even when protective',
      'Secrecy that creates suspicion even when unwarranted',
      'Difficulty allowing her to lead or letting plans unfold organically',
      'She may feel managed rather than loved'
    ],
    datingEconomyCompetition: [
      'Competes on depth, reliability, and security provision',
      'Attracts women who value substance over flash, who find mystery appealing',
      'Signals value through quiet confidence rather than display',
      'Differentiates from louder men by being the one who actually handles things',
      'Loses prospects who need emotional expressiveness or full transparency to feel safe'
    ]
  },

  'ACFH': {
    name: 'The Engineer',
    traits: 'Fitness + Leadership + Stability + Egalitarian',
    datingBehavior: [
      'Approaches dating systematically; evaluates compatibility through conversation and shared activities',
      'Plans dates around shared interests or opportunities to learn something about each other',
      'Attracted to competence; wants to see how she thinks and solves problems',
      'Direct about intentions; does not play games or create unnecessary ambiguity',
      'Patient but purposeful; knows what he is looking for and screens efficiently'
    ],
    inRelationships: [
      'Builds partnership infrastructure: shared systems, clear communication, defined responsibilities',
      'Values her expertise and defers to her in her domains of competence',
      'Expects mutual contribution to household functioning and decision-making',
      'Expresses love through problem-solving and making her life work better',
      'Maintains physical fitness as personal discipline, not performance for others'
    ],
    howValued: [
      'Partners feel like true collaborators rather than subordinates or dependents',
      'His reliability is foundational; things work because he makes them work',
      'He improves her life tangibly through his skills and attention to systems',
      'Respect is genuine and consistent; he treats her as an intellectual equal',
      'Stability comes without traditional constraints on her independence'
    ],
    disappointments: [
      'When she creates problems he has to solve rather than preventing them herself',
      'When emotional needs override logical solutions he has offered',
      'When she does not appreciate the systems and structures he has built',
      'When incompetence or carelessness disrupts what he has optimized',
      'When she wants him to just listen rather than fix'
    ],
    struggles: [
      'Treats relationship problems as engineering challenges rather than emotional experiences',
      'His solutions can feel dismissive of her feelings even when well-intended',
      'Difficulty understanding that some things cannot and should not be optimized',
      'May prioritize function over feeling in ways that starve the relationship of warmth',
      'Can be inflexible when his carefully designed systems are challenged'
    ],
    mostAttractive: [
      'Genuine respect for her intelligence and capabilities',
      'Reliability that is not controlling or conditional',
      'Physical fitness maintained through discipline rather than vanity',
      'Problem-solving orientation that tangibly improves daily life',
      'Calm competence without need for dominance or credit'
    ],
    leastAttractive: [
      'Can be emotionally tone-deaf when logic is not what she needs',
      'His efficiency can make intimacy feel scheduled rather than spontaneous',
      'May miss the point of venting by jumping to solutions',
      'Inflexibility when asked to deviate from what he has determined is optimal',
      'Can make her feel like a system component rather than a loved person'
    ],
    datingEconomyCompetition: [
      'Competes on reliability, competence, and genuine partnership offering',
      'Attracts women who value stability and intellectual respect over excitement',
      'Signals value through what he has built rather than what he displays',
      'Differentiates from traditional men by offering true equality',
      'Loses prospects who want more emotional expressiveness or romantic spontaneity'
    ]
  },

  'ADEG': {
    name: 'The Cowboy',
    traits: 'Fitness + Presence + Adventure + Traditional',
    datingBehavior: [
      'Lets his presence speak; does not pursue aggressively or sell himself',
      'Plans dates that involve doing something together rather than just talking',
      'Comfortable with silence; does not fill space with unnecessary words',
      'Shows interest through attention and action rather than verbal declaration',
      'Takes his time; does not rush because he does not feel the need to'
    ],
    inRelationships: [
      'Provides steady presence rather than constant verbal reassurance',
      'Expresses love through work, through showing up, through reliability',
      'Expects her to understand what he means even when he does not say it',
      'Maintains traditional values about roles while respecting her capability',
      'Keeps his word absolutely; his commitment once given does not waver'
    ],
    howValued: [
      'Partners feel grounded by his steady presence and unshakeable reliability',
      'His silence is restful for women exhausted by men who never stop talking',
      'Physical capability provides genuine security; he can handle what arises',
      'His word means something; trust is absolute once established',
      'He does not create drama; life with him has a calm rhythm'
    ],
    disappointments: [
      'When she needs words and he offers only presence',
      'When she interprets his quiet as indifference rather than contentment',
      'When she tries to change his fundamental nature or modernize him',
      'When she brings chaos into the ordered life he has built',
      'When she does not appreciate that showing up every day is his love language'
    ],
    struggles: [
      'Emotional vocabulary is limited; struggles to articulate feelings',
      'Silence can feel like stonewalling even when it is not intended that way',
      'May expect her to read his mind because he does not explain himself',
      'Traditional values can become rigidity when circumstances require adaptation',
      'His independence can make her feel peripheral to his real life'
    ],
    mostAttractive: [
      'Authenticity; he is exactly who he appears to be',
      'Physical competence that is functional rather than performative',
      'Quiet strength that does not need to announce itself',
      'Loyalty that is absolute and unwavering once committed',
      'Calm presence that makes chaotic situations feel manageable'
    ],
    leastAttractive: [
      'Emotional inexpressiveness that can feel like absence',
      'Stubbornness that he calls principle',
      'May not notice her emotional needs because he is not attuned to that frequency',
      'Can be dismissive of problems he considers unimportant',
      'His self-containment can make her feel like an outsider in his inner world'
    ],
    datingEconomyCompetition: [
      'Competes on authenticity, physical capability, and steady reliability',
      'Attracts women who are tired of performance and want something real',
      'Signals value through how he lives rather than what he says',
      'Differentiates from urban men by being unapologetically rooted in older values',
      'Loses prospects who need verbal affirmation or emotional processing partners'
    ]
  },

  'ADEH': {
    name: 'The Sherpa',
    traits: 'Fitness + Presence + Adventure + Egalitarian',
    datingBehavior: [
      'Attentive from the start; notices what she needs often before she voices it',
      'Creates dates that are about shared experience rather than impressing her',
      'Listens more than he talks; genuinely curious about her inner world',
      'Attracted to women with their own ambitions and directions',
      'Moves at her pace; does not push but is clearly present and interested'
    ],
    inRelationships: [
      'Supports her goals as actively as he pursues his own',
      'Creates space for her to lead when that is what serves the partnership',
      'Shares adventure as genuine partnership; neither guide nor client',
      'Expresses love through attentiveness and anticipation of needs',
      'Physical connection is tender as well as passionate; he pays attention'
    ],
    howValued: [
      'Partners feel truly seen; his attention is genuine and consistent',
      'He makes her ambitions feel supported rather than competitive with his',
      'Adventures with him feel collaborative rather than like following his lead',
      'His presence is calming; he does not add stress to difficult situations',
      'She can be vulnerable without fear of judgment or fixing'
    ],
    disappointments: [
      'When she does not reciprocate the attentiveness he provides',
      'When she takes his support for granted or treats it as his role',
      'When she wants him to dominate and he wants to partner',
      'When his needs go unnoticed because he is so focused on hers',
      'When she mistakes his gentleness for lack of passion or drive'
    ],
    struggles: [
      'Can erase himself in service of her needs and goals',
      'May not assert his own preferences strongly enough',
      'His supportive nature can be exploited by less generous partners',
      'Difficulty asking for what he needs because he is so focused on her',
      'Can enable dependency rather than fostering her genuine independence'
    ],
    mostAttractive: [
      'Attentiveness that makes her feel genuinely known',
      'Strength without need for dominance or control',
      'Supports her ambitions without feeling threatened by them',
      'Physical capability combined with emotional intelligence',
      'Creates safety for vulnerability through consistent gentle presence'
    ],
    leastAttractive: [
      'Can seem passive to women who want more assertive partners',
      'His self-effacement can feel like lack of backbone',
      'May not take charge when she actually needs him to',
      'Can attract women who exploit his giving nature',
      'His focus on her needs can mean his own go unmet and unspoken'
    ],
    datingEconomyCompetition: [
      'Competes on emotional intelligence, attentiveness, and genuine partnership',
      'Attracts accomplished women who want support, not management',
      'Signals value through how he treats her rather than what he displays',
      'Differentiates from dominant men by offering collaboration',
      'Loses prospects who want traditional masculine assertiveness or find his gentleness unsexy'
    ]
  },

  'ADFG': {
    name: 'The Curator',
    traits: 'Fitness + Presence + Stability + Traditional',
    datingBehavior: [
      'Notices details about her that others miss; comments on specifics rather than generalities',
      'Plans dates around things worth experiencing: museums, craftsmanship, well-made food',
      'Takes time to decide; does not rush into interest or commitment',
      'Evaluates her taste and discernment as indicators of compatibility',
      'Courtship feels curated; intentional in a way that can feel either romantic or clinical'
    ],
    inRelationships: [
      'Creates an environment of considered beauty; life with him is aesthetically coherent',
      'Notices changes in her mood, appearance, energy before she announces them',
      'Maintains traditions and practices that create rhythm in shared life',
      'Expresses love through careful attention and thoughtful gesture',
      'Preserves what matters; anniversaries, meaningful objects, shared history'
    ],
    howValued: [
      'Partners feel noticed in ways that make them feel treasured',
      'The life he builds is beautiful; his taste elevates daily experience',
      'His stability is anchored in things that last, not trends',
      'He remembers everything that matters; nothing is forgotten or dismissed',
      'Traditional values provide structure that some find deeply comforting'
    ],
    disappointments: [
      'When she does not notice or appreciate what he has carefully arranged',
      'When she is careless with things he values, physical or emotional',
      'When her taste proves coarser than he had hoped',
      'When she wants novelty over preservation',
      'When she does not meet the standards he has set, for himself and by extension for her'
    ],
    struggles: [
      'Critical eye that notices imperfection can make her feel never quite good enough',
      'Preservation can become resistance to necessary change',
      'His standards may be impossible for anyone to consistently meet',
      'Attention can feel like surveillance rather than appreciation',
      'May love the idea of her more than the reality of her'
    ],
    mostAttractive: [
      'Attention that makes her feel truly noticed and valued',
      'Taste and discernment that elevates the quality of shared life',
      'Stability grounded in enduring values rather than passing trends',
      'Memory that holds onto what matters; she will not be forgotten',
      'Physical presence maintained through discipline and self-respect'
    ],
    leastAttractive: [
      'Criticism disguised as discernment',
      'Rigidity about how things should be done',
      'Can make her feel like another item in his collection',
      'Standards that feel more like judgments',
      'Difficulty accepting her as she is rather than as he imagines she could be'
    ],
    datingEconomyCompetition: [
      'Competes on taste, attention, and quality of life he can provide',
      'Attracts women who want to be truly seen and who value refinement',
      'Signals value through what he has cultivated rather than accumulated',
      'Differentiates from flashier men by offering depth over display',
      'Loses prospects who feel judged or who want more flexibility and spontaneity'
    ]
  },

  'ADFH': {
    name: 'The Recruiter',
    traits: 'Fitness + Presence + Stability + Egalitarian',
    datingBehavior: [
      'Evaluates quickly but fairly; good at reading people and potential',
      'Creates dates that reveal character: how she treats service workers, how she handles surprise',
      'Attracted to potential as much as current achievement',
      'Makes her feel seen and promising; his interest feels like an endorsement',
      'Direct about what he is looking for; does not waste time on poor fits'
    ],
    inRelationships: [
      'Invests in her development; wants to help her reach her potential',
      'Creates stable foundation from which growth can happen',
      'Values her contributions and treats her as a partner in building something',
      'Expresses love through encouragement and belief in what she can achieve',
      'Maintains physical fitness as part of general self-optimization'
    ],
    howValued: [
      'Partners feel believed in; his confidence in them is motivating',
      'He creates stability that makes risk-taking possible',
      'Her growth is genuinely celebrated, not treated as competition',
      'Practical support matches verbal encouragement; he follows through',
      'Equality is real; her potential matters as much as his'
    ],
    disappointments: [
      'When she plateaus and stops growing or pursuing',
      'When she does not fulfill the potential he saw in her',
      'When she prefers comfort to development',
      'When his investment does not yield the returns he expected',
      'When she rejects his help or suggestions for her improvement'
    ],
    struggles: [
      'Can treat the relationship as a development project',
      'His eye for potential can make her feel like a work in progress',
      'May not fully accept her in her current form',
      'Encouragement can become pressure to perform',
      'Difficulty distinguishing between supporting her goals and imposing his vision'
    ],
    mostAttractive: [
      'Makes her feel seen and believed in',
      'Genuine support for her ambitions and growth',
      'Stability that enables rather than constrains',
      'Emotional intelligence applied to helping her flourish',
      'Egalitarian values that treat her potential as equal to his'
    ],
    leastAttractive: [
      'Can make her feel like a project rather than a person',
      'Acceptance may feel conditional on continued growth',
      'His vision for her might not match her vision for herself',
      'Evaluation mode can feel like constant assessment',
      'May lose interest if she stops developing in ways he values'
    ],
    datingEconomyCompetition: [
      'Competes on emotional intelligence, stability, and investment in partners',
      'Attracts ambitious women who want support and belief in their potential',
      'Signals value through how he develops people around him',
      'Differentiates from other stable men by actively building up his partner',
      'Loses prospects who want unconditional acceptance over developmental partnership'
    ]
  },

  'BCEG': {
    name: 'The Legionnaire',
    traits: 'Maturity + Leadership + Adventure + Traditional',
    datingBehavior: [
      'Does not play games; life is too short and he has seen too much',
      'Assesses character quickly; knows what matters because he has learned the hard way',
      'Creates experiences rather than performances; authenticity is non-negotiable',
      'Attracted to women with substance who can handle who he actually is',
      'Takes his time but moves decisively once he has decided'
    ],
    inRelationships: [
      'Provides protection and security born of genuine capability',
      'Leads because he has led before; command is natural to him',
      'Maintains adventure but with hard-won wisdom about risk',
      'Expresses love through loyalty that has been tested and proven',
      'Traditional values are a code he lives by, not a pose he adopts'
    ],
    howValued: [
      'Partners feel genuinely safe; his protection is not theoretical',
      'His experience means he has perspective on what matters',
      'Loyalty is absolute; betrayal is not in his vocabulary',
      'He has already proven himself; she is not betting on potential',
      'Life with him has meaning beyond comfort or accumulation'
    ],
    disappointments: [
      'When she does not understand or respect what he has been through',
      'When she is frivolous about things he takes seriously',
      'When comfort makes her soft in ways that frustrate him',
      'When civilian concerns feel trivial compared to what he has known',
      'When she cannot handle the harder parts of who he is'
    ],
    struggles: [
      'May struggle to relate to problems that seem trivial compared to what he has faced',
      'Hypervigilance can make civilian life feel unsafe in ways she cannot understand',
      'Traditional values can become rigidity when flexibility is needed',
      'His intensity can be overwhelming in domestic contexts',
      'May not know how to be soft after years of being hard'
    ],
    mostAttractive: [
      'Depth that comes from genuine experience and survival',
      'Capability that is proven, not just claimed',
      'Loyalty that is absolute once committed',
      'Leadership that is calm under pressure because he has been under real pressure',
      'Maturity earned through genuine testing'
    ],
    leastAttractive: [
      'May struggle to relate to her concerns after what he has known',
      'Intensity that has no off switch',
      'Traditional values that can feel inflexible or outdated',
      'Distance created by experiences he cannot or will not share',
      'May be fighting old wars in the context of the relationship'
    ],
    datingEconomyCompetition: [
      'Competes on proven capability, depth, and absolute loyalty',
      'Attracts women who want genuine substance over performance',
      'Signals value through who he is rather than what he displays',
      'Differentiates from younger men by being already forged',
      'Loses prospects who want lightness, flexibility, or emotional accessibility'
    ]
  },

  'BCEH': {
    name: 'The Astronaut',
    traits: 'Maturity + Leadership + Adventure + Egalitarian',
    datingBehavior: [
      'Evaluates compatibility like a mission brief; thorough, fair, but decisive',
      'Creates dates that test how she handles novelty, challenge, and collaboration',
      'Attracted to women with their own expertise and accomplishments',
      'Direct communication style; ambiguity feels inefficient to him',
      'Moves deliberately; once decided, commits fully'
    ],
    inRelationships: [
      'Treats partnership as co-mission; each person has critical responsibilities',
      'Values her expertise and creates space for her to lead in her domains',
      'Shares adventure as exploration, not conquest; discovery matters more than domination',
      'Expresses love through making her part of meaningful endeavors',
      'Physical connection is important but secondary to mission alignment'
    ],
    howValued: [
      'Partners feel like true equals in consequential endeavors',
      'His maturity provides perspective; he does not sweat small things',
      'Adventures have meaning beyond entertainment; they are expeditions',
      'Her expertise is genuinely valued and integrated into shared plans',
      'Loyalty is absolute once mission partnership is established'
    ],
    disappointments: [
      'When she cannot contribute at the level the mission requires',
      'When domestic concerns override mission priorities',
      'When she wants safety over exploration',
      'When her needs feel like drag on what they could accomplish together',
      'When she does not understand why the mission matters so much'
    ],
    struggles: [
      'Can prioritize mission over relationship when they conflict',
      'His maturity can feel like emotional distance or unavailability',
      'May not understand why she needs him present when the mission is calling',
      'Partnership model can feel cold compared to more romantic approaches',
      'Difficulty being fully present when his mind is on the next objective'
    ],
    mostAttractive: [
      'Genuine respect for her capabilities and expertise',
      'Maturity that provides calm in crisis',
      'Adventure that has meaning and purpose beyond thrill-seeking',
      'Leadership that includes rather than dominates',
      'Commitment that is absolute once established'
    ],
    leastAttractive: [
      'Mission can become more important than relationship',
      'Emotional presence can feel rationed or scheduled',
      'Partnership model may lack the romance she desires',
      'His focus can make her feel like one of many priorities',
      'May struggle to be present in ordinary moments'
    ],
    datingEconomyCompetition: [
      'Competes on accomplishment, maturity, and partnership quality',
      'Attracts accomplished women who want to be part of something meaningful',
      'Signals value through what he has achieved and where he is going',
      'Differentiates from other achievers by treating her as genuine equal',
      'Loses prospects who want more emotional availability or romantic attention'
    ]
  },

  'BCFG': {
    name: 'The Statesman',
    traits: 'Maturity + Leadership + Stability + Traditional',
    datingBehavior: [
      'Approaches courtship with dignity and intentionality; nothing is casual',
      'Plans dates that reveal character and values alignment',
      'Attracted to women who understand what building something lasting requires',
      'Takes his time; consequential decisions deserve careful consideration',
      'Traditional courtship rituals appeal to him; there is a right way to do things'
    ],
    inRelationships: [
      'Creates structure and stability that extends across generations',
      'Leads household direction while respecting her domain',
      'Expects partnership to reflect well on the institution they are building',
      'Expresses love through provision, protection, and including her in his vision',
      'Traditional roles provide the framework; dignity and respect govern the dynamic'
    ],
    howValued: [
      'Partners feel part of something meaningful that will outlast them',
      'His gravitas provides security that extends beyond the personal',
      'Decisions are consequential and considered; nothing is impulsive',
      'She is respected as partner in legacy-building, not just relationship',
      'Financial and social stability is comprehensive'
    ],
    disappointments: [
      'When she does not share his vision for what they are building',
      'When she wants immediate satisfaction over long-term construction',
      'When her behavior reflects poorly on their shared reputation',
      'When frivolity undermines the dignity he is trying to maintain',
      'When she does not appreciate the weight of what he carries'
    ],
    struggles: [
      'Can treat the relationship as an institution rather than a romance',
      'His gravitas can feel like heaviness; life with him may lack lightness',
      'Legacy concerns may override her immediate needs',
      'Traditional expectations may constrain her in ways she resents',
      'Public image may matter more than private intimacy'
    ],
    mostAttractive: [
      'Gravitas that commands respect in any room',
      'Vision that extends beyond the immediate to the lasting',
      'Security that is comprehensive: financial, social, emotional stability',
      'Treats partnership as serious undertaking worthy of investment',
      'Maturity that has been tested and proven over time'
    ],
    leastAttractive: [
      'Can be overly serious; lightness does not come easily',
      'Legacy may matter more than her individual needs',
      'Public image concerns can feel constraining',
      'Traditional expectations may limit who she can be',
      'Intimacy may feel formal rather than spontaneous'
    ],
    datingEconomyCompetition: [
      'Competes on gravitas, vision, and comprehensive stability',
      'Attracts women who want to build something lasting with someone substantial',
      'Signals value through position, accomplishment, and bearing',
      'Differentiates from flashier men by offering enduring substance',
      'Loses prospects who want more flexibility, spontaneity, or personal attention'
    ]
  },

  'BCFH': {
    name: 'The Professor',
    traits: 'Maturity + Leadership + Stability + Egalitarian',
    datingBehavior: [
      'Engages through intellectual discourse; ideas are his courtship language',
      'Plans dates that involve learning, culture, or meaningful conversation',
      'Attracted to women who can hold their own intellectually',
      'Takes his time; rushing feels undignified and insufficiently considered',
      'Direct about his interests but may miss romantic cues while absorbed in ideas'
    ],
    inRelationships: [
      'Creates an intellectually rich environment; learning is lifestyle',
      'Values her expertise and treats intellectual contribution as partnership',
      'Expects engagement with ideas; passive consumption disappoints him',
      'Expresses love through sharing knowledge and including her in his intellectual world',
      'Physical intimacy is important but secondary to mental connection'
    ],
    howValued: [
      'Partners feel intellectually respected and stimulated',
      'His stability is grounded in enduring knowledge rather than passing trends',
      'He makes her smarter through engagement and exposure',
      'Egalitarian values mean her ideas genuinely matter regardless of credentials',
      'Life with him is rich in meaning and substance'
    ],
    disappointments: [
      'When she cannot or will not engage intellectually at his level',
      'When she dismisses his intellectual concerns as impractical',
      'When emotional needs disrupt focused work',
      'When she wants him present but his mind is elsewhere',
      'When anti-intellectualism enters their shared world'
    ],
    struggles: [
      'May intellectualize feelings rather than experiencing them',
      'His expertise can become condescension when he knows more',
      'Difficulty being present when ideas are calling',
      'Can lecture when she wants conversation',
      'May not realize his emotional unavailability while absorbed in work'
    ],
    mostAttractive: [
      'Intellectual depth that makes conversation endlessly interesting',
      'Genuine respect for her mind and contributions',
      'Stability grounded in expertise and body of work',
      'Makes her smarter and more engaged with the world of ideas',
      'Maturity that has been honed through years of serious thought'
    ],
    leastAttractive: [
      'Can be emotionally absent while mentally engaged',
      'His expertise can become superiority in conversation',
      'May not know how to be present without an intellectual purpose',
      'Lectures when she wants dialogue',
      'Physical and emotional realms may be neglected for intellectual ones'
    ],
    datingEconomyCompetition: [
      'Competes on intellectual depth, egalitarian values, and meaningful stability',
      'Attracts women who value ideas and want an intellectual partner',
      'Signals value through knowledge, credential, and quality of discourse',
      'Differentiates from other stable men by offering rich mental engagement',
      'Loses prospects who want more emotional presence or physical adventure'
    ]
  },

  'BDEG': {
    name: 'The Ranger',
    traits: 'Maturity + Presence + Adventure + Traditional',
    datingBehavior: [
      'Lets silence do the work; does not fill space with performance',
      'Creates experiences in nature or places that reveal how she handles discomfort',
      'Assesses character through observation rather than conversation',
      'Moves slowly but with complete attention when engaged',
      'Attracted to women who can be comfortable in quiet and uncertainty'
    ],
    inRelationships: [
      'Provides steady presence and practical capability',
      'Expresses love through being there, through quiet reliability',
      'Expects her to understand things he does not say',
      'Maintains traditional values about what matters and how to live',
      'Adventure continues as part of life, not something separate from it'
    ],
    howValued: [
      'Partners feel grounded by his unshakeable steadiness',
      'His quiet attention notices things others miss',
      'Life with him has rhythm aligned with something larger than social concerns',
      'Physical capability is genuine; he can handle whatever arises',
      'His word, rarely given, is completely reliable'
    ],
    disappointments: [
      'When she needs more words than he knows how to give',
      'When she brings noise into the quiet he has cultivated',
      'When she cannot appreciate the depth behind his silence',
      'When civilization calls her away from the life he has chosen',
      'When she does not see that his presence is his love'
    ],
    struggles: [
      'Emotional expression requires vocabulary he may not possess',
      'His silence can feel like absence to partners who need verbal connection',
      'May retreat further into quiet when conflict arises',
      'Traditional values can become isolation from changing world',
      'The wilderness may always be more comfortable than intimacy'
    ],
    mostAttractive: [
      'Authenticity that is not performed or explained',
      'Physical capability earned through genuine experience',
      'Quiet depth that rewards patience',
      'Steady presence that does not waver',
      'Maturity grounded in real encounter with the world'
    ],
    leastAttractive: [
      'Emotional inexpressiveness that can feel like deprivation',
      'Silence that can register as unavailability',
      'May choose wild places over her when pressed',
      'Traditional values that can become rigidity',
      'She may feel secondary to the land he loves'
    ],
    datingEconomyCompetition: [
      'Competes on authenticity, capability, and grounded presence',
      'Attracts women seeking substance over performance',
      'Signals value through how he lives rather than what he says',
      'Differentiates from urban men by being rooted in something real',
      'Loses prospects who need verbal expression or social engagement'
    ]
  },

  'BDEH': {
    name: 'The Playwright',
    traits: 'Maturity + Presence + Adventure + Egalitarian',
    datingBehavior: [
      'Engages with genuine curiosity about her inner world',
      'Creates dates that allow for spontaneity and discovery',
      'Attracted to women with their own stories and complexity',
      'Listens like he is collecting material, which he is',
      'Moves at the pace the story requires; no formula, no rush'
    ],
    inRelationships: [
      'Creates space for her story as much as his',
      'Treats partnership as collaborative creation',
      'Expresses love through attention, through making her feel fully seen',
      'Shares adventure as co-authored experience',
      'Physical intimacy is narrative as much as physical; every touch means something'
    ],
    howValued: [
      'Partners feel truly seen in ways they may never have experienced',
      'His attention makes her feel interesting, complex, worth exploring',
      'Life together has meaning; everything is part of a larger story',
      'Egalitarian values mean her narrative matters as much as his',
      'His creativity keeps the relationship from becoming stale or predictable'
    ],
    disappointments: [
      'When she is less complex than he initially perceived',
      'When routine kills the narrative energy he needs',
      'When she wants to be settled rather than explored',
      'When his observation is mistaken for coldness or distance',
      'When practical concerns override creative ones'
    ],
    struggles: [
      'May observe when she needs him to participate',
      'Creative focus can pull him away from practical relationship maintenance',
      'His need for narrative can make ordinary life feel insufficient',
      'May see her as character rather than person in weaker moments',
      'The story may matter more than the relationship in it'
    ],
    mostAttractive: [
      'Attention that makes her feel genuinely known',
      'Creative spirit that keeps life interesting',
      'Genuine egalitarian values; her story matters',
      'Depth that comes from years of observing human nature',
      'Presence that is not distracted or performative'
    ],
    leastAttractive: [
      'Observation can feel like distance',
      'May not be fully present when his mind is on creation',
      'Ordinary domestic life may bore him',
      'Can aestheticize pain rather than simply being with her in it',
      'The line between seeing her and writing her can blur'
    ],
    datingEconomyCompetition: [
      'Competes on depth, creative partnership, and genuine attention',
      'Attracts women who want to be truly seen and co-create meaning',
      'Signals value through quality of engagement rather than achievement',
      'Differentiates from other creative men by being collaborative rather than egocentric',
      'Loses prospects who want more practical stability or find his intensity exhausting'
    ]
  },

  'BDFG': {
    name: 'The Arborist',
    traits: 'Maturity + Presence + Stability + Traditional',
    datingBehavior: [
      'Takes his time; rushing feels like carelessness to him',
      'Notices her with the attention he gives to things he tends',
      'Plans dates that involve craft, nature, or things worth preserving',
      'Evaluates character by watching how she treats growing things',
      'Attraction grows slowly but roots deeply'
    ],
    inRelationships: [
      'Creates environment of careful cultivation and maintenance',
      'Expresses love through steady attention over time',
      'Expects patience; some things take seasons to develop',
      'Maintains traditional values about what endures and what matters',
      'Physical presence is calm and grounded; no sudden movements'
    ],
    howValued: [
      'Partners feel tended rather than pursued or possessed',
      'Life has rhythm aligned with natural cycles',
      'His patience is restful for women exhausted by urgency',
      'What he builds lasts because he maintains it',
      'Traditional values provide structure that some find deeply grounding'
    ],
    disappointments: [
      'When she is careless with things he has cultivated',
      'When she wants speed over seasonal rhythm',
      'When she mistakes his patience for lack of passion',
      'When progress matters more to her than preservation',
      'When she does not see that tending is love'
    ],
    struggles: [
      'Patience can become passivity when action is needed',
      'His deliberate pace can frustrate partners who want momentum',
      'May tend the relationship rather than engaging it',
      'Traditional values can become resistance to necessary change',
      'Difficulty with spontaneity or disorder'
    ],
    mostAttractive: [
      'Patience that creates genuine stability',
      'Attention that sustains over seasons rather than flaring and fading',
      'Physical presence that is calm and grounding',
      'Builds things that last through consistent care',
      'Maturity grounded in understanding natural time'
    ],
    leastAttractive: [
      'Pace can feel plodding when she wants movement',
      'May tend her like a project rather than engaging her as person',
      'Traditional values can become rigidity',
      'Difficult to accelerate when circumstances require speed',
      'Passion may feel too quiet for women who need intensity'
    ],
    datingEconomyCompetition: [
      'Competes on patience, stability, and sustainable attention',
      'Attracts women tired of intensity and looking for something that lasts',
      'Signals value through what he has cultivated over time',
      'Differentiates from flashier men by offering longevity over excitement',
      'Loses prospects who want passion, spontaneity, or faster movement'
    ]
  },

  'BDFH': {
    name: 'The Builder',
    traits: 'Maturity + Presence + Stability + Egalitarian',
    datingBehavior: [
      'Shows rather than tells; his work speaks for him',
      'Creates dates around making or experiencing things well-made',
      'Attracted to women who appreciate craft and want to contribute',
      'Genuine attention that notices her specifically, not generically',
      'Moves at the pace good work requires; not rushed, not lazy'
    ],
    inRelationships: [
      'Creates partnership of joint construction; they build together',
      'Values her contributions and skills as genuine addition to shared work',
      'Expresses love through creating shared space and life',
      'Expects her to participate; partnership means both contribute',
      'Physical connection is part of building life together'
    ],
    howValued: [
      'Partners feel like genuine collaborators in creating life',
      'His maturity means he knows how to build things that last',
      'Practical capability is real; he can make and fix things',
      'Egalitarian values mean her skills and contributions genuinely matter',
      'Life together has tangible results they can both point to'
    ],
    disappointments: [
      'When she wants to consume rather than create',
      'When her contributions do not match her promises',
      'When she treats their shared construction as his responsibility',
      'When domestic life distracts from building together',
      'When she does not value craft and care the way he does'
    ],
    struggles: [
      'May focus on the project at the expense of the relationship',
      'Practical focus can mean emotional needs are overlooked',
      'Difficulty when what she needs is presence rather than production',
      'Can make her feel like crew rather than partner in weaker moments',
      'The building may matter more than the life in it'
    ],
    mostAttractive: [
      'Genuine capability that produces tangible results',
      'Partnership that is practiced rather than just professed',
      'Maturity refined through years of making things',
      'Her contribution is genuinely valued and integrated',
      'Creates something lasting together rather than just consuming experience'
    ],
    leastAttractive: [
      'Can be focused on building at the expense of being',
      'Practical orientation may miss emotional nuance',
      'Difficulty being present without a purpose or project',
      'May treat relationship as thing to be constructed',
      'Production can overshadow presence'
    ],
    datingEconomyCompetition: [
      'Competes on capability, collaboration, and tangible partnership',
      'Attracts women who want to build rather than be entertained',
      'Signals value through what he has made and how he works',
      'Differentiates from other stable men by offering genuine collaboration',
      'Loses prospects who want more romance, spontaneity, or emotional focus'
    ]
  }
};

// ============================================================================
// W2 PERSONA BEHAVIORAL METADATA
// ============================================================================
// Comprehensive behavioral profiles for each W2 Women persona
// Used for assessment output, coaching, and compatibility narratives

const W2_PERSONA_METADATA = {
  'ACEG': {
    name: 'The Debutante',
    traits: 'Beauty + Allure + Thrill + Traditional',
    datingBehavior: [
      'Expects to be pursued; initiating feels beneath her and the structure she believes in',
      'Evaluates suitors by how they approach: confidence, intention, proper form',
      'Creates occasions where she can be seen and selected rather than seeking',
      'Attracted to men who understand traditional courtship and execute it well',
      'Moves through social environments knowing she is being watched and evaluated'
    ],
    inRelationships: [
      'Expects him to lead while she elevates and supports',
      'Maintains her beauty and social presentation as part of the bargain',
      'Creates an exciting, aesthetically pleasing shared life',
      'Traditional roles feel natural; she knows her part and plays it well',
      'Thrives on his continued pursuit even after commitment'
    ],
    howValued: [
      'Partners feel proud; she reflects well on his taste and success',
      'Her social skills smooth his path in contexts that require grace',
      'Life with her is never dull; she keeps things exciting and beautiful',
      'She maintains herself; he does not have to worry about her letting go',
      'Traditional structure is clear; everyone knows their role'
    ],
    disappointments: [
      'When his pursuit fades after commitment and she becomes furniture',
      'When he stops seeing her and starts seeing through her',
      'When the excitement she provides is taken for granted',
      'When her beauty is valued but her thoughts are dismissed',
      'When she realizes she may be more trophy than partner'
    ],
    struggles: [
      'Identity deeply tied to being desired; what happens when that fades?',
      'May not know who she is outside of being wanted',
      'Traditional role can become a cage if she outgrows it',
      'Dependent on his continued attention for sense of worth',
      'The thrill she needs may be harder to generate as life settles'
    ],
    mostAttractive: [
      'Beauty that commands attention without effort',
      'Social grace that makes every event better',
      'Excitement and energy that prevents stagnation',
      'Knows how to be pursued and how to reward pursuit',
      'Traditional clarity about roles and expectations'
    ],
    leastAttractive: [
      'May be more surface than substance',
      'Identity contingent on external validation',
      'Passivity in pursuit can become passivity in partnership',
      'May not have developed self beyond being desired',
      'Thrill-seeking can become exhausting or destabilizing'
    ],
    datingEconomyCompetition: [
      'Competes on beauty, social grace, and traditional femininity',
      'Attracts men who want a woman to pursue and display',
      'Signals value through appearance, social position, and desirability',
      'Differentiates from modern women by embracing traditional dynamics',
      'Loses prospects who want more substance or equal partnership'
    ]
  },

  'ACEH': {
    name: 'The Correspondent',
    traits: 'Beauty + Allure + Thrill + Egalitarian',
    datingBehavior: [
      'Pursues and is pursued; egalitarian means she makes moves when interested',
      'Attracted to men who have their own missions and do not need her to complete them',
      'Dates are adventures or intense conversations; small talk bores her',
      'Evaluates men by how they handle her intensity and independence',
      'May be hard to pin down; her schedule and priorities are demanding'
    ],
    inRelationships: [
      'Partnership of equals with separate missions that intersect',
      'Expects him to be proud of her work, not threatened by it',
      'Physical connection is intense when present; absence is part of the deal',
      'Shares adventures and meaningful experiences rather than routine',
      'Does not want to be protected from the world; wants a partner who respects her engagement with it'
    ],
    howValued: [
      'Partners feel they are with someone exceptional and brave',
      'Her stories and experiences make life more interesting',
      'She brings intensity and meaning to the relationship',
      'Independence means she is not clingy or dependent',
      'Egalitarian partnership feels genuine, not performed'
    ],
    disappointments: [
      'When he wants her to come home and settle down',
      'When her absences are treated as abandonment rather than work',
      'When he competes with her career instead of supporting it',
      'When ordinary life cannot hold his attention without her generating excitement',
      'When she realizes he wanted the idea of her more than the reality'
    ],
    struggles: [
      'May be more comfortable with intensity than with intimacy',
      'Ordinary domestic life can feel like a letdown after the field',
      'Identity tied to work in ways that leave little room for partnership',
      'Difficulty being present when her mind is on the next assignment',
      'The thrill she needs may be incompatible with stable partnership'
    ],
    mostAttractive: [
      'Beauty combined with substance and courage',
      'Independence that is genuine, not performed',
      'Stories and experiences that make her endlessly interesting',
      'Intensity that makes time with her feel significant',
      'Egalitarian values that treat partnership as genuine collaboration'
    ],
    leastAttractive: [
      'May be emotionally unavailable due to work demands',
      'Ordinary life may never be enough for her',
      'Her independence can feel like she does not need anyone',
      'Intensity without pause can be exhausting',
      'May struggle to be present in the quiet, daily parts of partnership'
    ],
    datingEconomyCompetition: [
      'Competes on beauty, accomplishment, and genuine independence',
      'Attracts men who want an equal they can admire',
      'Signals value through what she has done and where she has been',
      'Differentiates from traditional women by being unapologetically ambitious',
      'Loses prospects who want more availability or traditional feminine presence'
    ]
  },

  'ACFG': {
    name: 'The Duchess',
    traits: 'Beauty + Allure + Peace + Traditional',
    datingBehavior: [
      'Waits to be approached; her presence is the invitation',
      'Evaluates suitors by their caliber and approach; not everyone gets an audience',
      'Dates are occasions with appropriate gravity; casual does not interest her',
      'Attracted to men of substance who understand hierarchy and respect it',
      'Moves deliberately; nothing about her suggests desperation or hurry'
    ],
    inRelationships: [
      'Presides over domestic life with calm authority',
      'Creates a sanctuary of peace and order; chaos is not welcome',
      'Traditional roles feel natural; she runs her domain with competence',
      'Expects respect and deference in her sphere as she provides in his',
      'Beauty and composure are maintained as expression of self-respect'
    ],
    howValued: [
      'Partners feel they have a home that is genuinely restful',
      'Her composure is stabilizing in crisis; she does not add to chaos',
      'Social situations are handled with grace; she represents well',
      'Traditional structure is clear and well-maintained',
      'She does not create drama; life with her has dignified rhythm'
    ],
    disappointments: [
      'When he introduces chaos into the order she has created',
      'When her composure is mistaken for coldness rather than strength',
      'When he does not respect the domain she manages',
      'When the peace she provides is taken for granted',
      'When she realizes composure has become a wall she cannot lower'
    ],
    struggles: [
      'Composure can become emotional unavailability',
      'May not know how to be messy, uncertain, or openly needy',
      'Control of environment can become control of partner',
      'Peace can be coldness if warmth is not intentionally cultivated',
      'May be admired more than loved, respected more than known'
    ],
    mostAttractive: [
      'Beauty that is composed and enduring rather than effortful',
      'Presence that commands respect without demanding attention',
      'Peace that creates genuine sanctuary',
      'Traditional competence in managing home and social life',
      'Dignity that elevates everything she touches'
    ],
    leastAttractive: [
      'Composure can feel like coldness or distance',
      'May be difficult to truly reach or know',
      'Control needs may constrain partner spontaneity',
      'Peace can become rigidity if challenged',
      'May prioritize order over intimacy'
    ],
    datingEconomyCompetition: [
      'Competes on composed beauty, dignity, and sanctuary provision',
      'Attracts men who want peace and traditional partnership',
      'Signals value through bearing, composure, and quality of environment she creates',
      'Differentiates from chaotic women by being genuinely restful',
      'Loses prospects who want more warmth, spontaneity, or emotional accessibility'
    ]
  },

  'ACFH': {
    name: 'The Influencer',
    traits: 'Beauty + Allure + Peace + Egalitarian',
    datingBehavior: [
      'Evaluates partners partly by how they fit the life she has built',
      'Attracted to men who have their own thing and are not seeking her spotlight',
      'Dates may become content, or may be carefully protected from it',
      'Expects him to understand that her platform is her business, not vanity',
      'Moves deliberately; her brand is considered in most decisions'
    ],
    inRelationships: [
      'Creates aesthetically beautiful shared life; environment matters',
      'Egalitarian partnership where both have their own pursuits',
      'Expects him to respect her work without being consumed by it',
      'Physical presentation remains important; she maintains herself',
      'Peace is genuine but also practiced; she knows how to create calm'
    ],
    howValued: [
      'Partners gain access to a beautiful, curated world',
      'Her platform may provide opportunities and connections',
      'She knows how to create sanctuary and make spaces feel good',
      'Independence means she is not desperate or clingy',
      'Her success is her own; she is not looking for rescue'
    ],
    disappointments: [
      'When he resents her platform or sees it as competition',
      'When he cannot separate the public persona from the private person',
      'When the aesthetic life she creates is not appreciated',
      'When he wants the brand but not the work behind it',
      'When she realizes she does not know how to be unpolished with him'
    ],
    struggles: [
      'May not know where the brand ends and she begins',
      'Performance can replace genuine intimacy',
      'The curated life may not have room for his mess or hers',
      'Peace as aesthetic may not survive genuine conflict',
      'Validation metrics can distort sense of self and relationship'
    ],
    mostAttractive: [
      'Beauty that is intentional and maintained',
      'Ability to create environments that feel aspirational',
      'Independence and success that is self-made',
      'Peace that provides genuine escape from chaos',
      'Egalitarian values that do not require his diminishment'
    ],
    leastAttractive: [
      'Performance may be more accessible than authenticity',
      'The brand can intrude on private moments',
      'May not know how to be genuinely vulnerable',
      'Curated life may not tolerate his imperfections',
      'Success metrics can distort relationship priorities'
    ],
    datingEconomyCompetition: [
      'Competes on curated beauty, platform, and aspirational lifestyle',
      'Attracts men who want to join her world without threatening it',
      'Signals value through reach, aesthetic, and independence',
      'Differentiates from traditional women by having built her own platform',
      'Loses prospects who want more privacy or find the performance exhausting'
    ]
  },

  'ADEG': {
    name: 'The Barrel Racer',
    traits: 'Beauty + Charm + Thrill + Traditional',
    datingBehavior: [
      'Meets men in contexts around her pursuits; shared activity matters',
      'Warm and approachable but not available to everyone; she has standards',
      'Attracted to men who respect her skill and have their own',
      'Dates involve doing things together, not just talking',
      'Traditional courtship appeals, but he has to earn her time away from her passion'
    ],
    inRelationships: [
      'Maintains her own pursuits; partnership does not mean giving them up',
      'Warm and supportive but expects the same in return',
      'Traditional roles in some areas, but her competition is not negotiable',
      'Brings excitement through her own activities, not just through him',
      'Physical fitness is lifestyle, not performance'
    ],
    howValued: [
      'Partners get a woman who is warm and genuinely accomplished',
      'Her passion brings energy and interest to the relationship',
      'She maintains herself through genuine discipline, not vanity',
      'Traditional warmth without being passive or boring',
      'He has something to be proud of beyond her beauty'
    ],
    disappointments: [
      'When he expects her to give up her arena for him',
      'When her skill is tolerated rather than celebrated',
      'When traditional values are used to constrain her pursuits',
      'When he wanted the image of her but not the schedule',
      'When she shrinks to fit what he expected'
    ],
    struggles: [
      'Balancing traditional partnership with competitive pursuits',
      'May feel pressure to choose between her passion and relationship',
      'Warmth can be exploited by partners who want support without giving it',
      'Traditional community may pressure her to prioritize his needs',
      'Identity tied to competition; what happens when that ends?'
    ],
    mostAttractive: [
      'Beauty combined with genuine skill and accomplishment',
      'Warmth that is accessible and real',
      'Excitement through her own pursuits, not manufactured drama',
      'Traditional values grounded in genuine community',
      'Physical fitness as lifestyle, maintained through discipline'
    ],
    leastAttractive: [
      'Her arena demands time and focus that may compete with relationship',
      'Traditional values can create role conflicts she struggles to resolve',
      'May not know who she is if she cannot compete',
      'Warmth may mask resentment if she feels constrained',
      'Schedule and priorities may be inflexible'
    ],
    datingEconomyCompetition: [
      'Competes on beauty, warmth, and genuine accomplishment',
      'Attracts men who want traditional femininity with substance',
      'Signals value through skill, community standing, and physical fitness',
      'Differentiates from passive traditional women by having her own arena',
      'Loses prospects who want full-time attention or find her pursuits inconvenient'
    ]
  },

  'ADEH': {
    name: 'The Podcaster',
    traits: 'Beauty + Charm + Thrill + Egalitarian',
    datingBehavior: [
      'Pursues what she wants without apology; egalitarian means she makes moves',
      'Attracted to men who can handle her honesty and public life',
      'Dating may become content or may be carefully protected; depends on her brand',
      'Evaluates men by how they handle her directness and independence',
      'Does not pretend to be less than she is to make anyone comfortable'
    ],
    inRelationships: [
      'Partnership of equals where both have voice and platform',
      'Expects him to handle her public honesty about life and relationships',
      'Physical connection is important and she is not shy about it',
      'Brings thrill through her personality and pursuits, not through drama',
      'Does not shrink; he has to be secure enough to match her energy'
    ],
    howValued: [
      'Partners get a woman who is genuinely honest and direct',
      'Her success is her own; she is not looking for rescue or provision',
      'Life with her is interesting; she has opinions and stories',
      'Sexual confidence is genuine, not performative',
      'Independence means she wants him, does not need him'
    ],
    disappointments: [
      'When he cannot handle her public life or honesty',
      'When her directness is labeled as too much',
      'When he wants the sexual confidence but not the professional ambition',
      'When she realizes the audience knows her better than he does',
      'When intimacy has been spent publicly and there is nothing private left'
    ],
    struggles: [
      'Boundary between public and private may be eroded',
      'Performance of authenticity can replace actual intimacy',
      'The audience relationship may compete with partner relationship',
      'Her brand of honesty may not include the vulnerability that matters',
      'What happens when the platform moves on?'
    ],
    mostAttractive: [
      'Beauty combined with directness and confidence',
      'Sexual honesty that is liberating rather than performative',
      'Independence and success that is self-made',
      'Warmth and charm that make her accessible',
      'Egalitarian values that want partnership, not provision'
    ],
    leastAttractive: [
      'Public life can intrude on private relationship',
      'Performed authenticity may not be actual vulnerability',
      'The audience may feel like a third party in the relationship',
      'Directness can become carelessness about his feelings',
      'Her brand depends on content that may include him'
    ],
    datingEconomyCompetition: [
      'Competes on beauty, personality, and built platform',
      'Attracts men who are secure enough to handle her public presence',
      'Signals value through audience, honesty, and independence',
      'Differentiates from traditional women by refusing old rules',
      'Loses prospects who want more privacy or traditional femininity'
    ]
  },

  'ADFG': {
    name: 'The Trophy',
    traits: 'Beauty + Charm + Peace + Traditional',
    datingBehavior: [
      'Allows herself to be chosen by men who can provide what she offers in return',
      'Warm and charming in ways that make men feel good about themselves',
      'Attracted to success, status, and the security they provide',
      'Presents herself in contexts where high-value men will see her',
      'Does not pretend the arrangement is something other than what it is'
    ],
    inRelationships: [
      'Creates peaceful, beautiful domestic environment',
      'Maintains her appearance as part of her contribution',
      'Supports his career and social position with charm and grace',
      'Traditional roles feel natural and clearly defined',
      'Does not create drama; her job is to be a haven'
    ],
    howValued: [
      'Partners feel they have something beautiful that reflects their success',
      'Her warmth makes home genuinely pleasant',
      'She handles social situations with grace; he can be proud',
      'Peace is real; she does not manufacture conflict',
      'The bargain is clear; no hidden expectations or resentments'
    ],
    disappointments: [
      'When she realizes she is valued but not known',
      'When younger, newer models appear and she sees his attention shift',
      'When the bargain feels less like partnership and more like employment',
      'When her thoughts and opinions are dismissed as irrelevant to her role',
      'When she wonders if she would be kept if the beauty faded'
    ],
    struggles: [
      'Identity built on being ornamental; what else is there?',
      'Dependency on his continued valuation of what she provides',
      'May not have developed skills or self beyond the arrangement',
      'Warmth can mask growing resentment about the limits of the role',
      'What happens when beauty depreciates?'
    ],
    mostAttractive: [
      'Beauty that is maintained with discipline and care',
      'Warmth that makes people feel genuinely good',
      'Peace that creates actual sanctuary, not performed calm',
      'Honesty about what she offers and what she expects',
      'Traditional grace that smooths social situations'
    ],
    leastAttractive: [
      'May lack depth beyond her ornamental function',
      'Dependency on the arrangement can breed insecurity',
      'The transaction can feel cold despite her warmth',
      'May not be a true partner in decisions or building',
      'Identity contingent on his continued valuation'
    ],
    datingEconomyCompetition: [
      'Competes on beauty, warmth, and domestic peace provision',
      'Attracts men seeking traditional exchange of resources for beauty',
      'Signals value through appearance, charm, and graciousness',
      'Differentiates from ambitious women by being oriented toward home',
      'Loses prospects who want more substance or equal partnership'
    ]
  },

  'ADFH': {
    name: 'The Girl Next Door',
    traits: 'Beauty + Charm + Peace + Egalitarian',
    datingBehavior: [
      'Approachable and genuinely warm; men feel comfortable with her',
      'Does not create games or artificial barriers; what you see is what you get',
      'Attracted to men who want partnership rather than conquest',
      'Dates are comfortable and genuine; no performance required',
      'May be overlooked initially by men seeking more obvious excitement'
    ],
    inRelationships: [
      'Creates genuine partnership where both contribute',
      'Warmth is consistent, not deployed strategically',
      'Peace is authentic; she genuinely prefers harmony to drama',
      'Egalitarian values mean she expects to be treated as an equal',
      'Beauty is maintained but not weaponized'
    ],
    howValued: [
      'Partners feel genuinely comfortable and accepted',
      'What you see is what you get; no hidden agenda or drama',
      'She makes ordinary life feel good',
      'Real partnership rather than performance or transaction',
      'Stability that is sustainable rather than boring'
    ],
    disappointments: [
      'When she is taken for granted because she does not create drama',
      'When he chases excitement elsewhere because she is too stable',
      'When her steadiness is mistaken for lack of passion',
      'When she realizes being easy to love made her easy to overlook',
      'When the men who want her only find her after exhausting other options'
    ],
    struggles: [
      'May be invisible to men seeking more obvious excitement',
      'Stability can be mistaken for lack of depth or passion',
      'Ease of relationship may be taken for granted',
      'May settle for men who chose her as safe option, not first choice',
      'Genuine warmth can be exploited by less genuine partners'
    ],
    mostAttractive: [
      'Beauty that is accessible rather than intimidating',
      'Warmth that is consistent and genuine',
      'Peace that creates real comfort, not performed calm',
      'What you see is what you get; no games',
      'Offers sustainable partnership rather than dramatic romance'
    ],
    leastAttractive: [
      'May lack the edge that creates initial attraction',
      'Can be overlooked in favor of more obvious excitement',
      'Stability might seem boring to thrill-seekers',
      'May not generate the tension that fuels desire',
      'Ease can be mistaken for lack of standards'
    ],
    datingEconomyCompetition: [
      'Competes on genuine warmth, stability, and partnership potential',
      'Attracts men seeking sustainable relationship over exciting chase',
      'Signals value through consistency and authentic presence',
      'Differentiates from dramatic women by being genuinely easy to be with',
      'Loses prospects who want more excitement or challenge in courtship'
    ]
  },

  'BCEG': {
    name: 'The Party Planner',
    traits: 'Confidence + Allure + Thrill + Traditional',
    datingBehavior: [
      'Takes charge of shared experiences; she plans, he shows up',
      'Attracted to men who can keep up with her energy and vision',
      'Evaluates men by how they handle her being in charge',
      'Dates are events she has conceived; nothing is casual or accidental',
      'Expects traditional courtship even as she runs the actual logistics'
    ],
    inRelationships: [
      'Creates exciting, well-produced shared life',
      'Takes charge of social calendar and major productions',
      'Traditional expectations about his role even as she manages everything',
      'Brings energy and excitement through her constant creation',
      'Expects appreciation for what she produces'
    ],
    howValued: [
      'Partners get a life that is never boring',
      'She handles logistics; he just has to show up',
      'Social life is rich and well-orchestrated',
      'Her confidence is contagious; being with her feels like winning',
      'She creates worlds others want to enter'
    ],
    disappointments: [
      'When he does not appreciate what she has created',
      'When the production exhausts her but she cannot stop',
      'When the event ends and ordinary life feels flat',
      'When she realizes she is more comfortable producing than being',
      'When her need for thrill cannot be satisfied by sustainable relationship'
    ],
    struggles: [
      'May not know how to exist without producing something',
      'The event can be more important than the people in it',
      'Perfectionism about production can extend to relationship',
      'Thrill-seeking through events may not sustain long-term',
      'Exhaustion from constant creation with no recovery'
    ],
    mostAttractive: [
      'Confidence that makes things happen',
      'Creates experiences others only attend',
      'Energy and vision that make life exciting',
      'Takes charge without apology; things work because of her',
      'Traditional structure combined with genuine leadership'
    ],
    leastAttractive: [
      'May not know how to stop producing',
      'Perfectionism can make him feel managed',
      'The event may matter more than the aftermath',
      'Exhausting to partner if the pace never slows',
      'Control of production can become control of him'
    ],
    datingEconomyCompetition: [
      'Competes on confidence, event creation, and exciting lifestyle',
      'Attracts men who want their social life handled at high level',
      'Signals value through what she creates and who attends',
      'Differentiates from passive traditional women by being driver of action',
      'Loses prospects who want more calm or feel overshadowed by her productions'
    ]
  },

  'BCEH': {
    name: 'The Marketer',
    traits: 'Confidence + Allure + Thrill + Egalitarian',
    datingBehavior: [
      'Approaches dating with confidence; makes moves when interested',
      'Attracted to men with their own ambitions and drive',
      'Evaluates partners by how they respond to her success and energy',
      'Dates are opportunities to see how they collaborate and communicate',
      'Does not hide her accomplishments to make anyone comfortable'
    ],
    inRelationships: [
      'Partnership where both are building and achieving',
      'Brings thrill through professional wins and shared ambitions',
      'Expects him to celebrate her successes without feeling threatened',
      'Egalitarian collaboration; best idea wins regardless of source',
      'Physical connection is important but integrated with driven lifestyle'
    ],
    howValued: [
      'Partners feel they are with someone exceptional and going places',
      'Her success reflects well without threatening his',
      'She brings energy and ambition that make life dynamic',
      'Independence means she chose him, not that she needed him',
      'Collaboration is genuine; she values his contributions'
    ],
    disappointments: [
      'When he competes with her instead of building alongside her',
      'When her success triggers his insecurity rather than pride',
      'When she realizes she is managing his ego along with everything else',
      'When the campaign mentality bleeds into how she treats intimacy',
      'When she has closed deals but made no actual home'
    ],
    struggles: [
      'May treat intimacy like a campaign to be optimized',
      'Branding mindset can make authenticity feel risky',
      'Success metrics can distort relationship priorities',
      'Difficulty being unstrategic about something that matters',
      'The pitch may be more comfortable than the product'
    ],
    mostAttractive: [
      'Confidence that makes things happen',
      'Ambition that is inspiring rather than exhausting',
      'Success that is earned through genuine skill',
      'Egalitarian values that want partnership not hierarchy',
      'Energy that makes life feel like it is going somewhere'
    ],
    leastAttractive: [
      'May approach relationship with marketing mindset',
      'Branding can replace authenticity in intimate contexts',
      'Success focus may deprioritize relationship maintenance',
      'Can feel like she is always selling something',
      'Driven lifestyle may not leave room for stillness'
    ],
    datingEconomyCompetition: [
      'Competes on confidence, accomplishment, and partnership potential',
      'Attracts men who want ambitious equals',
      'Signals value through professional success and social skill',
      'Differentiates from traditional women by being unapologetically driven',
      'Loses prospects who feel overshadowed or want more traditional femininity'
    ]
  },

  'BCFG': {
    name: 'The Executive',
    traits: 'Confidence + Allure + Peace + Traditional',
    datingBehavior: [
      'Composed and intentional; nothing about her courtship is chaotic',
      'Evaluates men by their substance, position, and alignment with her values',
      'Attracted to men who have achieved and can match her accomplishment',
      'Dates are opportunities to assess fit for the institution she is building',
      'Expects traditional courtship executed with appropriate seriousness'
    ],
    inRelationships: [
      'Creates stable, well-run household and shared life',
      'Takes leadership in her domains with traditional structure overall',
      'Expects him to match her in building something lasting',
      'Peace is genuine; she does not create drama or instability',
      'Physical presentation is maintained as professional discipline'
    ],
    howValued: [
      'Partners feel they are building something significant together',
      'Her competence handles what needs handling without drama',
      'Social situations are managed with skill; she represents well',
      'Stability is comprehensive: financial, social, emotional',
      'She elevates whatever institution they are building together'
    ],
    disappointments: [
      'When he cannot match her ambition or execution',
      'When her leadership is resented rather than respected',
      'When she realizes partnership feels like merger negotiation',
      'When vulnerability feels like weakness she cannot afford',
      'When no one wants to come home to a boss'
    ],
    struggles: [
      'May treat partnership like business arrangement',
      'Composure can become coldness when warmth is needed',
      'Control needs may make vulnerability feel dangerous',
      'Leadership in all contexts may leave no room for his',
      'Institutional thinking may override personal needs'
    ],
    mostAttractive: [
      'Competence that commands respect',
      'Stability that is comprehensive and reliable',
      'Vision for building something that lasts',
      'Confidence that is earned through achievement',
      'Peace that is genuine, not performed'
    ],
    leastAttractive: [
      'May be more comfortable leading than following',
      'Composure can feel like emotional unavailability',
      'Partnership may feel like professional arrangement',
      'Control needs can constrain intimacy',
      'No one wants the boss at home'
    ],
    datingEconomyCompetition: [
      'Competes on accomplishment, stability, and partnership in building',
      'Attracts men who want to build lasting institutions with capable partner',
      'Signals value through position, competence, and bearing',
      'Differentiates from chaotic women by being genuinely stable and capable',
      'Loses prospects who want more warmth or cannot handle her authority'
    ]
  },

  'BCFH': {
    name: 'The Producer',
    traits: 'Confidence + Allure + Peace + Egalitarian',
    datingBehavior: [
      'Confident but not performative; substance over flash',
      'Attracted to men who have their own projects and respect hers',
      'Evaluates partners by how they collaborate and share credit',
      'Dates reveal how they work together, not just how they perform',
      'Does not need to be center of attention; comfortable in her power'
    ],
    inRelationships: [
      'Creates partnership where both contribute to shared production',
      'Comfortable with his success; does not need to compete',
      'Peace through collaboration rather than control',
      'Builds lasting things together through steady work',
      'Egalitarian values mean best contribution wins regardless of source'
    ],
    howValued: [
      'Partners feel their contributions are genuinely valued',
      'She makes things happen without needing credit',
      'Collaboration is real; she elevates his work as well as hers',
      'Peace is genuine, born of security not performance',
      'Life together produces tangible results'
    ],
    disappointments: [
      'When her behind-scenes work goes unrecognized',
      'When she realizes she has built platforms for everyone but herself',
      'When collaboration becomes her carrying more than her share',
      'When peace becomes conflict avoidance rather than genuine harmony',
      'When no one knows her name because she has only elevated others'
    ],
    struggles: [
      'Self-effacement can become self-erasure',
      'May not advocate for her own needs or recognition',
      'Collaboration can mean carrying others who contribute less',
      'Peace through avoidance rather than actual resolution',
      'May be behind every success but credited for none'
    ],
    mostAttractive: [
      'Confidence that does not need external validation',
      'Creates space for his work and contribution',
      'Collaboration that is genuine, not competitive',
      'Peace that comes from security, not performance',
      'Builds lasting things through steady attention'
    ],
    leastAttractive: [
      'May be invisible by design',
      'Self-effacement can feel like lack of ambition',
      'May not fight for her own needs or recognition',
      'Can be taken advantage of by less generous partners',
      'Her success may be unrecognized because she does not claim it'
    ],
    datingEconomyCompetition: [
      'Competes on substance, collaboration, and genuine partnership',
      'Attracts men who want to build together without ego competition',
      'Signals value through what she has created and how she works',
      'Differentiates from attention-seeking women by being genuinely secure',
      'Loses prospects who want more visible or celebrated partner'
    ]
  },

  'BDEG': {
    name: 'The Coach',
    traits: 'Confidence + Charm + Thrill + Traditional',
    datingBehavior: [
      'Evaluates men by their drive, their coachability, their potential',
      'Warm and accessible but has high standards; not everyone makes the team',
      'Attracted to men who have their own intensity and competitive spirit',
      'Dates often involve activity, competition, or revealing character under pressure',
      'Traditional courtship appeals but he has to demonstrate he can match her intensity'
    ],
    inRelationships: [
      'Brings intensity and high expectations to shared life',
      'Wants to help him reach his potential; sees what he could be',
      'Traditional values about commitment and roles',
      'Warmth is genuine but can become conditional on improvement',
      'Game day energy cannot be sustained; needs to find other modes'
    ],
    howValued: [
      'Partners feel pushed to be their best',
      'Her belief in them is motivating and inspiring',
      'Warmth makes the high expectations feel supportive',
      'Shared intensity creates strong bond',
      'She maintains her own competitive pursuits; not dependent on him'
    ],
    disappointments: [
      'When he does not want to be developed or improved',
      'When he plateaus and accepts it rather than pushing through',
      'When her intensity is too much for him',
      'When she realizes she is coaching him rather than loving him',
      'When game day ends and she does not know how to be in the off-season'
    ],
    struggles: [
      'May not be able to stop seeing his potential and pushing toward it',
      'Warmth can become conditional on his improvement',
      'High expectations may feel more like pressure than support',
      'Difficulty accepting him where he is rather than where he could be',
      'May not know how to exist outside of competition and development mode'
    ],
    mostAttractive: [
      'Confidence earned through genuine achievement',
      'Warmth that makes high expectations feel supportive',
      'Competitive intensity that makes life exciting',
      'Believes in people and pushes them toward their best',
      'Traditional values grounded in real community'
    ],
    leastAttractive: [
      'May treat partner as player to be developed',
      'Intensity can be exhausting when he needs rest',
      'High expectations can feel like constant evaluation',
      'May not accept him as he is',
      'Off-season mode may not exist'
    ],
    datingEconomyCompetition: [
      'Competes on intensity, warmth, and genuine accomplishment',
      'Attracts men who want to be pushed and believe in improvement',
      'Signals value through her own achievements and competitive success',
      'Differentiates from passive women by being genuinely intense and driven',
      'Loses prospects who want acceptance over development'
    ]
  },

  'BDEH': {
    name: 'The Founder',
    traits: 'Confidence + Charm + Thrill + Egalitarian',
    datingBehavior: [
      'Pursues what interests her; egalitarian means she makes moves',
      'Attracted to men with their own ambitions and startups',
      'Evaluates partners by whether they can handle her focus and schedule',
      'Dates happen around the build; she does not have time for pure leisure',
      'Does not pretend to be less driven to make anyone comfortable'
    ],
    inRelationships: [
      'Partnership of parallel empires; both building, comparing notes',
      'Brings thrill through creation and professional wins',
      'Warmth recruits him to her vision and celebrates his',
      'Egalitarian collaboration; neither is supporting cast',
      'Physical connection matters but competes with work for time'
    ],
    howValued: [
      'Partners feel they are with someone exceptional and building',
      'Her success is inspiring rather than threatening',
      'Warmth makes driven lifestyle feel human',
      'Independence means she chose him from position of strength',
      'She understands his ambition because she has her own'
    ],
    disappointments: [
      'When he cannot handle her schedule or focus',
      'When his ego needs her to be smaller',
      'When she realizes she has built things but maintained nothing',
      'When intimacy feels like distraction from the build',
      'When the startup matters more than the relationship and she cannot change it'
    ],
    struggles: [
      'May not know how to be present when not building',
      'Warmth may be reserved for people useful to the mission',
      'Work will always compete with relationship for attention',
      'May lose interest in things that do not scale',
      'Identity tied to founding; what happens after?'
    ],
    mostAttractive: [
      'Confidence that builds from nothing',
      'Warmth that inspires and recruits believers',
      'Thrill of creation that makes life dynamic',
      'Independence and success that is entirely her own',
      'Egalitarian values that want parallel building, not support'
    ],
    leastAttractive: [
      'May prioritize building over being present',
      'Startup mode may be the only mode she has',
      'Warmth may be strategic rather than unconditional',
      'Relationship may feel like another project to manage',
      'May not know how to commit to something that does not grow'
    ],
    datingEconomyCompetition: [
      'Competes on accomplishment, vision, and partnership for builders',
      'Attracts men who are building their own things',
      'Signals value through what she has created and is creating',
      'Differentiates from traditional women by being founder not supporter',
      'Loses prospects who want more presence or traditional partnership'
    ]
  },

  'BDFG': {
    name: 'The Designer',
    traits: 'Confidence + Charm + Peace + Traditional',
    datingBehavior: [
      'Evaluates men partly by their taste and how they fit her vision',
      'Warm and accessible; people feel comfortable with her',
      'Attracted to men who appreciate intentionality and quality',
      'Dates are often in spaces she has designed or that meet her standards',
      'Traditional courtship appeals; there is a right way to do things'
    ],
    inRelationships: [
      'Creates beautiful, functional shared environment',
      'Warm presence that makes home feel genuinely good',
      'Traditional roles grounded in intentional harmony',
      'Peace is designed, not accidental; everything has its place',
      'Expects appreciation for what she has created'
    ],
    howValued: [
      'Partners live in beauty that functions',
      'Her warmth makes the aesthetic feel lived-in, not sterile',
      'She sees what others miss and makes it work',
      'Peace is genuine; designed harmony creates calm',
      'Traditional values provide structure she knows how to fill beautifully'
    ],
    disappointments: [
      'When he disrupts the harmony she has created',
      'When his taste clashes with her vision',
      'When her design is not appreciated or is treated carelessly',
      'When she realizes the home is perfect but the relationship is not',
      'When she cannot stop designing long enough to live'
    ],
    struggles: [
      'May treat partner as element to be designed into her vision',
      'Control of environment can extend to control of him',
      'Warmth may disappear when her design is disrupted',
      'Perfectionism about space may make him feel judged',
      'May love the home more than the life in it'
    ],
    mostAttractive: [
      'Creates beauty that actually works for living',
      'Warmth that makes design feel human',
      'Confidence in her own vision and taste',
      'Peace through intentional harmony',
      'Traditional values expressed through timeless aesthetic'
    ],
    leastAttractive: [
      'May need to control environment to feel secure',
      'His taste and mess may not be tolerated',
      'Design can become more important than relationship',
      'Warmth may be conditional on respecting her space',
      'He may feel like a guest in her creation'
    ],
    datingEconomyCompetition: [
      'Competes on taste, warmth, and quality of environment she creates',
      'Attracts men who value beauty and intentionality',
      'Signals value through what she has designed and how she lives',
      'Differentiates from chaotic women by offering genuine aesthetic peace',
      'Loses prospects who feel controlled or cannot meet her standards'
    ]
  },

  'BDFH': {
    name: 'The Therapist',
    traits: 'Confidence + Charm + Peace + Egalitarian',
    datingBehavior: [
      'Creates safety for genuine connection from the start',
      'Attracted to men with depth who can engage authentically',
      'Evaluates partners by their self-awareness and capacity for growth',
      'Dates are conversations that go deeper than usual',
      'Does not position herself above; sits with people, not over them'
    ],
    inRelationships: [
      'Creates space for his emotions and process',
      'Comfortable with depth and difficulty; does not flinch from hard conversations',
      'Egalitarian partnership where both support each other',
      'Peace through understanding rather than avoidance',
      'Warmth is genuine and consistent, not technique'
    ],
    howValued: [
      'Partners feel truly seen and accepted',
      'She can hold space for his difficulty without judgment',
      'Depth of understanding makes connection feel profound',
      'Peace she creates is real; she does not generate drama',
      'He can be vulnerable without fear'
    ],
    disappointments: [
      'When he does not reciprocate the depth she offers',
      'When she is always the one holding space and never held',
      'When professional skill replaces genuine intimacy',
      'When she realizes she understands everyone but is known by no one',
      'When analyzing becomes easier than feeling'
    ],
    struggles: [
      'May hold space so well that she never takes up any',
      'Professional skill can replace genuine vulnerability',
      'May know him better than he knows her',
      'Analysis can become defense against feeling',
      'Everyone else\'s emotions may take priority over her own'
    ],
    mostAttractive: [
      'Creates safety for genuine depth and vulnerability',
      'Warmth that is consistent and genuine',
      'Confidence that is grounded rather than showy',
      'Peace through understanding, not avoidance',
      'Egalitarian values that treat partnership as mutual care'
    ],
    leastAttractive: [
      'May not know how to receive what she gives',
      'Professional distance can masquerade as intimacy',
      'May understand him without being known herself',
      'Analysis can feel clinical in intimate contexts',
      'Her needs may always come second'
    ],
    datingEconomyCompetition: [
      'Competes on depth, warmth, and capacity for genuine intimacy',
      'Attracts men who want to be truly seen and can offer the same',
      'Signals value through quality of presence and understanding',
      'Differentiates from surface women by offering real depth',
      'Loses prospects who want less intensity or feel analyzed rather than loved'
    ]
  }
};

// ============================================================================
// COMPATIBILITY ENGINE
// ============================================================================

const CODES = [
  'ACEG', 'ACEH', 'ACFG', 'ACFH',
  'ADEG', 'ADEH', 'ADFG', 'ADFH',
  'BCEG', 'BCEH', 'BCFG', 'BCFH',
  'BDEG', 'BDEH', 'BDFG', 'BDFH'
];

function getPersonaName(code, gender) {
  if (gender === 'M2') {
    return M2_PERSONA_NAMES[code] || 'Unknown';
  } else {
    return W2_PERSONA_NAMES[code] || 'Unknown';
  }
}

function getTraits(code, gender) {
  const traits = gender === 'M2' ? M2_TRAITS : W2_TRAITS;
  return {
    physical: traits[code[0]].name,
    social: traits[code[1]].name,
    lifestyle: traits[code[2]].name,
    values: traits[code[3]].name
  };
}

function getCompatibility(code, seekingGender) {
  const tiers = {
    ideal: [],
    kismet: [],
    effort: [],
    longShot: [],
    atRisk: [],
    incompatible: []
  };

  const targetGender = seekingGender === 'M2' ? 'W2' : 'M2';

  for (const targetCode of CODES) {
    const physicalMatch = code[0] === targetCode[0];
    const socialMatch = code[1] === targetCode[1];
    const lifestyleMatch = code[2] === targetCode[2];
    const valuesMatch = code[3] === targetCode[3];

    const otherMatches = [physicalMatch, socialMatch, lifestyleMatch].filter(Boolean).length;
    
    const targetName = getPersonaName(targetCode, targetGender);
    const entry = {
      code: `${targetGender}_${targetCode}`,
      name: targetName,
      traits: getTraits(targetCode, targetGender)
    };

    if (valuesMatch) {
      if (otherMatches === 3) tiers.ideal.push(entry);
      else if (otherMatches === 2) tiers.kismet.push(entry);
      else if (otherMatches === 1) tiers.effort.push(entry);
      else tiers.longShot.push(entry);
    } else {
      if (otherMatches >= 2) tiers.atRisk.push(entry);
      else tiers.incompatible.push(entry);
    }
  }

  return tiers;
}

function getFullProfile(code, gender) {
  return {
    code: `${gender}_${code}`,
    name: getPersonaName(code, gender),
    traits: getTraits(code, gender),
    compatibility: getCompatibility(code, gender)
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Code System
  CODE_SYSTEM,
  CODES,
  
  // Philosophy
  VALUES_PHILOSOPHY,
  TIER_LOGIC,
  
  // Dimensions
  M2_DIMENSIONS,
  W2_DIMENSIONS,
  
  // Persona Names
  M2_PERSONA_NAMES,
  W2_PERSONA_NAMES,
  
  // Traits
  M2_TRAITS,
  W2_TRAITS,
  
  // Behavioral Metadata
  M2_PERSONA_METADATA,
  W2_PERSONA_METADATA,
  
  // Compatibility Tables
  M2_COMPATIBILITY_TABLE,
  W2_COMPATIBILITY_TABLE,
  
  // Functions
  getPersonaName,
  getTraits,
  getCompatibility,
  getFullProfile
};
