/**
 * ============================================================================
 * RELATE MODIFIER SYSTEM
 * ============================================================================
 * 
 * Complete modifier taxonomy for the Relate dating/relationship assessment.
 * Modifiers affect user outcomes in two contexts:
 *   1. DATING: Pool size, signal quality, match quality
 *   2. RELATIONSHIP: Ceiling, floor, resilience, depth
 * 
 * This system is ADDITIVE to the existing Relate Score and Match Pool
 * calculations. Demographics feed into those calculations via CBSA data;
 * skill modifiers provide additional adjustments and relationship effects.
 * 
 * ============================================================================
 * EFFECT OPERATIONS
 * ============================================================================
 * 
 * | Symbol | Name              | Operation                        |
 * |--------|-------------------|----------------------------------|
 * | M+     | Multiplier Pos    | score Ã— (1 + value)              |
 * | M-     | Multiplier Neg    | score Ã— (1 - value)              |
 * | A+     | Additive Pos      | score + value                    |
 * | A-     | Additive Neg      | score - value                    |
 * | CAP    | Ceiling           | min(score, capValue)             |
 * | FLR    | Floor             | max(score, floorValue)           |
 * | F      | Filter            | pool Ã— filterPercentage          |
 * | G      | Gate              | binary include/exclude           |
 * | V      | Volatile          | score Ã— (1 Â± variance)           |
 * | null   | No Effect         | score unchanged                  |
 * 
 * ============================================================================
 * EFFECT DIMENSIONS
 * ============================================================================
 * 
 * DATING CONTEXT:
 *   - pool: Affects size of potential match pool
 *   - signal: Affects how user is perceived (first impressions)
 *   - matchQuality: Affects quality/fit of attracted matches
 * 
 * RELATIONSHIP CONTEXT:
 *   - ceiling: Maximum relationship quality achievable
 *   - floor: Minimum relationship quality under stress
 *   - resilience: Ability to survive challenges
 *   - depth: Capacity for emotional intimacy
 * 
 * ============================================================================
 * CHANGEABILITY TAXONOMY
 * ============================================================================
 * 
 * | Tag         | Definition                              | Implication              |
 * |-------------|-----------------------------------------|--------------------------|
 * | CHANGEABLE  | User can improve through effort         | Coaching target          |
 * | FIXED       | Cannot be changed                       | Strategy/positioning     |
 * | SEMI-FIXED  | Very difficult; long timeline           | Long-term investment     |
 * | CONTEXTUAL  | Depends on market/environment           | Relocation/market choice |
 * 
 * ============================================================================
 * ACTION TYPES
 * ============================================================================
 * 
 * | Action     | Description                              | Applies To            |
 * |------------|------------------------------------------|-----------------------|
 * | DEVELOP    | Build skill through practice             | Changeable skills     |
 * | TREAT      | Address through therapy/professional     | Attachment, Shame     |
 * | TRAIN      | Structured learning program              | Communication, EQ     |
 * | PRACTICE   | Repeated real-world application          | All skills            |
 * | CHANGE     | Alter the factor directly                | Fitness, Smoking      |
 * | INVEST     | Long-term investment to shift            | Education, Income     |
 * | RELOCATE   | Change geographic context                | Location              |
 * | REPOSITION | Change how attribute is leveraged        | Fixed demographics    |
 * | REFRAME    | Change target market/expectations        | All                   |
 * | ACCEPT     | Acknowledge and optimize within          | Truly fixed factors   |
 * 
 * ============================================================================
 * MOVEMENT RESULTS
 * ============================================================================
 * 
 * DATING CONTEXT:
 *   - POOL_EXPANSION: More potential matches become available
 *   - SIGNAL_BOOST: Better first impressions, higher match rates
 *   - QUALITY_UPGRADE: Attracts better-fit partners
 *   - TIER_UNLOCK: Previously inaccessible compatibility tiers viable
 *   - FILTER_REMOVAL: Remove dealbreaker that was excluding user
 * 
 * RELATIONSHIP CONTEXT:
 *   - CEILING_RAISE: Higher maximum relationship quality possible
 *   - CEILING_REMOVE: Previously capped potential now unlimited
 *   - FLOOR_RAISE: Better minimum outcomes during hard times
 *   - RESILIENCE_BOOST: Better ability to survive challenges
 *   - DEPTH_UNLOCK: Deeper intimacy becomes accessible
 *   - STABILITY_GAIN: Reduced volatility in relationship quality
 * 
 * ============================================================================
 */

// ============================================================================
// EFFECT OPERATIONS REFERENCE
// ============================================================================

const EFFECT_OPERATIONS = {
  'M+': { 
    name: 'Multiplier Positive',
    operation: 'multiply',
    direction: 'positive',
    calculate: (score, value) => score * (1 + value)
  },
  'M-': { 
    name: 'Multiplier Negative',
    operation: 'multiply',
    direction: 'negative',
    calculate: (score, value) => score * (1 - value)
  },
  'A+': { 
    name: 'Additive Positive',
    operation: 'add',
    direction: 'positive',
    calculate: (score, value) => score + value
  },
  'A-': { 
    name: 'Additive Negative',
    operation: 'add',
    direction: 'negative',
    calculate: (score, value) => score - value
  },
  'CAP': { 
    name: 'Ceiling',
    operation: 'cap',
    direction: 'limiting',
    calculate: (score, value) => Math.min(score, value)
  },
  'FLR': { 
    name: 'Floor',
    operation: 'floor',
    direction: 'supporting',
    calculate: (score, value) => Math.max(score, value)
  },
  'F': { 
    name: 'Filter',
    operation: 'filter',
    direction: 'reducing',
    calculate: (pool, value) => pool * value
  },
  'G': { 
    name: 'Gate',
    operation: 'gate',
    direction: 'binary',
    calculate: (pool, condition) => condition ? pool : 0
  },
  'V': { 
    name: 'Volatile',
    operation: 'volatile',
    direction: 'amplifying',
    calculate: (score, variance) => score * (1 + (Math.random() * 2 - 1) * variance)
  }
};

// ============================================================================
// CHANGEABILITY TYPES
// ============================================================================

const CHANGEABILITY = {
  CHANGEABLE: {
    id: 'CHANGEABLE',
    label: 'Changeable',
    description: 'User can improve through deliberate effort',
    coachingPriority: 'HIGH',
    timeframe: 'weeks_to_months'
  },
  FIXED: {
    id: 'FIXED',
    label: 'Fixed',
    description: 'Cannot be changed; must be worked around',
    coachingPriority: 'STRATEGY',
    timeframe: 'n/a'
  },
  SEMI_FIXED: {
    id: 'SEMI_FIXED',
    label: 'Semi-Fixed',
    description: 'Very difficult to change; long timeline',
    coachingPriority: 'LONG_TERM',
    timeframe: 'years'
  },
  CONTEXTUAL: {
    id: 'CONTEXTUAL',
    label: 'Contextual',
    description: 'Effect depends on market/environment',
    coachingPriority: 'MARKET_SELECTION',
    timeframe: 'variable'
  }
};

// ============================================================================
// ACTION TYPES
// ============================================================================

const ACTION_TYPES = {
  DEVELOP: {
    id: 'DEVELOP',
    label: 'Develop',
    description: 'Build skill through deliberate practice',
    appliesTo: ['skills'],
    timeframe: 'weeks_to_months'
  },
  TREAT: {
    id: 'TREAT',
    label: 'Treat',
    description: 'Address through therapy or professional help',
    appliesTo: ['attachment', 'shameResilience'],
    timeframe: 'months_to_years'
  },
  TRAIN: {
    id: 'TRAIN',
    label: 'Train',
    description: 'Structured learning program',
    appliesTo: ['communication', 'empathy', 'problemSolving', 'stressManagement'],
    timeframe: 'weeks_to_months'
  },
  PRACTICE: {
    id: 'PRACTICE',
    label: 'Practice',
    description: 'Repeated application in real situations',
    appliesTo: ['skills'],
    timeframe: 'ongoing'
  },
  CHANGE: {
    id: 'CHANGE',
    label: 'Change',
    description: 'Alter the demographic factor directly',
    appliesTo: ['fitness', 'bmi', 'smoking', 'drugs'],
    timeframe: 'weeks_to_years'
  },
  INVEST: {
    id: 'INVEST',
    label: 'Invest',
    description: 'Long-term investment to shift demographic',
    appliesTo: ['education', 'income'],
    timeframe: 'years'
  },
  RELOCATE: {
    id: 'RELOCATE',
    label: 'Relocate',
    description: 'Change geographic context',
    appliesTo: ['location'],
    timeframe: 'immediate_to_months'
  },
  REPOSITION: {
    id: 'REPOSITION',
    label: 'Reposition',
    description: 'Change how fixed attribute is leveraged',
    appliesTo: ['height', 'age', 'ethnicity', 'haveKids'],
    timeframe: 'immediate'
  },
  REFRAME: {
    id: 'REFRAME',
    label: 'Reframe',
    description: 'Change target market or expectations',
    appliesTo: ['all'],
    timeframe: 'immediate'
  },
  ACCEPT: {
    id: 'ACCEPT',
    label: 'Accept',
    description: 'Acknowledge and optimize within constraint',
    appliesTo: ['fixed_demographics'],
    timeframe: 'immediate'
  }
};

// ============================================================================
// MOVEMENT RESULTS
// ============================================================================

const MOVEMENT_RESULTS = {
  dating: {
    POOL_EXPANSION: {
      id: 'POOL_EXPANSION',
      label: 'Pool Expansion',
      description: 'More potential matches become available',
      messageTemplate: 'Improving {modifier} from {from} to {to} would expand your dating pool by approximately {percent}% in {location}.'
    },
    SIGNAL_BOOST: {
      id: 'SIGNAL_BOOST',
      label: 'Signal Boost',
      description: 'Better first impressions, higher match rates',
      messageTemplate: 'Improving {modifier} would increase your match rate by approximately {percent}%.'
    },
    QUALITY_UPGRADE: {
      id: 'QUALITY_UPGRADE',
      label: 'Quality Upgrade',
      description: 'Attracts better-fit partners',
      messageTemplate: 'Improving {modifier} would help you attract partners better aligned with your values.'
    },
    TIER_UNLOCK: {
      id: 'TIER_UNLOCK',
      label: 'Tier Unlock',
      description: 'Previously inaccessible compatibility tiers become viable',
      messageTemplate: 'With these improvements, {tier} matches become realistic possibilities.'
    },
    FILTER_REMOVAL: {
      id: 'FILTER_REMOVAL',
      label: 'Filter Removal',
      description: 'Remove dealbreaker that was excluding user',
      messageTemplate: 'Addressing {modifier} removes a filter that currently excludes {percent}% of potential matches.'
    }
  },
  relationship: {
    CEILING_RAISE: {
      id: 'CEILING_RAISE',
      label: 'Ceiling Raise',
      description: 'Higher maximum relationship quality possible',
      messageTemplate: 'Improving {modifier} raises your relationship ceilingâ€”better outcomes become possible.'
    },
    CEILING_REMOVE: {
      id: 'CEILING_REMOVE',
      label: 'Ceiling Remove',
      description: 'Previously capped potential now unlimited',
      messageTemplate: 'Addressing {modifier} removes a cap that was limiting your relationship potential to {percent}%.'
    },
    FLOOR_RAISE: {
      id: 'FLOOR_RAISE',
      label: 'Floor Raise',
      description: 'Better minimum outcomes during hard times',
      messageTemplate: 'Improving {modifier} protects your relationship during stressâ€”your floor rises by {percent}%.'
    },
    RESILIENCE_BOOST: {
      id: 'RESILIENCE_BOOST',
      label: 'Resilience Boost',
      description: 'Better ability to survive challenges',
      messageTemplate: 'Improving {modifier} increases your relationship\'s ability to survive challenges by {percent}%.'
    },
    DEPTH_UNLOCK: {
      id: 'DEPTH_UNLOCK',
      label: 'Depth Unlock',
      description: 'Deeper intimacy becomes accessible',
      messageTemplate: 'Improving {modifier} allows deeper intimacyâ€”previously blocked by {barrier}.'
    },
    STABILITY_GAIN: {
      id: 'STABILITY_GAIN',
      label: 'Stability Gain',
      description: 'Reduced volatility in relationship quality',
      messageTemplate: 'Improving {modifier} stabilizes your relationshipâ€”less dramatic swings.'
    }
  }
};

// ============================================================================
// SKILL MODIFIERS
// ============================================================================

const SKILL_MODIFIERS = {
  
  // --------------------------------------------------------------------------
  // ATTACHMENT STYLE (Foundational)
  // --------------------------------------------------------------------------
  attachment: {
    id: 'attachment',
    name: 'Attachment Style',
    description: 'Core relational pattern affecting how you connect with partners',
    changeability: 'CHANGEABLE',
    foundational: true,
    assessmentMethod: 'questionnaire',
    
    levels: {
      secure: { value: 4, label: 'Secure', description: 'Comfortable with intimacy and independence' },
      anxious: { value: 2, label: 'Anxious', description: 'Seeks closeness but fears abandonment' },
      avoidant: { value: 1, label: 'Avoidant', description: 'Values independence, uncomfortable with closeness' },
      disorganized: { value: 0, label: 'Disorganized', description: 'Conflicted about intimacy, unpredictable patterns' }
    },
    
    effects: {
      secure: {
        dating: { 
          pool: null, 
          signal: { op: 'M+', val: 0.15 }, 
          matchQuality: { op: 'M+', val: 0.20 } 
        },
        relationship: { 
          ceiling: null, 
          floor: { op: 'A+', val: 0.15 }, 
          resilience: { op: 'M+', val: 0.25 }, 
          depth: null 
        }
      },
      anxious: {
        dating: { 
          pool: null, 
          signal: { op: 'M-', val: 0.10 }, 
          matchQuality: { op: 'M-', val: 0.15 } 
        },
        relationship: { 
          ceiling: { op: 'CAP', val: 0.70 }, 
          floor: { op: 'V', val: 0.20 }, 
          resilience: { op: 'M-', val: 0.15 }, 
          depth: { op: 'CAP', val: 0.75 } 
        }
      },
      avoidant: {
        dating: { 
          pool: null, 
          signal: null, 
          matchQuality: { op: 'M-', val: 0.20 } 
        },
        relationship: { 
          ceiling: { op: 'CAP', val: 0.60 }, 
          floor: null, 
          resilience: { op: 'M-', val: 0.25 }, 
          depth: { op: 'CAP', val: 0.50 } 
        }
      },
      disorganized: {
        dating: { 
          pool: null, 
          signal: { op: 'M-', val: 0.15 }, 
          matchQuality: { op: 'M-', val: 0.25 } 
        },
        relationship: { 
          ceiling: { op: 'CAP', val: 0.50 }, 
          floor: { op: 'M-', val: 0.20 }, 
          resilience: { op: 'M-', val: 0.30 }, 
          depth: { op: 'CAP', val: 0.40 } 
        }
      }
    },
    
    actions: {
      primary: { type: 'TREAT', description: 'Attachment-focused therapy' },
      secondary: { type: 'PRACTICE', description: 'Build secure relationship experiences' },
      resources: ['attachment_therapy', 'hold_me_tight', 'secure_friendships']
    },
    
    movementResults: {
      'anxious_to_secure': {
        dating: ['SIGNAL_BOOST', 'QUALITY_UPGRADE'],
        relationship: ['CEILING_REMOVE', 'FLOOR_RAISE', 'RESILIENCE_BOOST', 'DEPTH_UNLOCK']
      },
      'avoidant_to_secure': {
        dating: ['QUALITY_UPGRADE'],
        relationship: ['CEILING_REMOVE', 'RESILIENCE_BOOST', 'DEPTH_UNLOCK']
      },
      'disorganized_to_secure': {
        dating: ['SIGNAL_BOOST', 'QUALITY_UPGRADE'],
        relationship: ['CEILING_REMOVE', 'FLOOR_RAISE', 'RESILIENCE_BOOST', 'DEPTH_UNLOCK', 'STABILITY_GAIN']
      }
    },
    
    risks: {
      anxious: {
        inRelationship: 'Partner exhaustion from constant reassurance needs; eventual abandonment confirming fears',
        ifUnchanged: 'Pattern repeats across relationships; increasing desperation with age'
      },
      avoidant: {
        inRelationship: 'Partner emotional starvation; seeking connection elsewhere; relationship ends or becomes hollow',
        ifUnchanged: 'Serial relationships that end at intimacy threshold; increasing isolation'
      },
      disorganized: {
        inRelationship: 'Chaotic on-off patterns; potential for mutual destruction; trauma reenactment',
        ifUnchanged: 'Relationships become increasingly unstable; difficulty maintaining any connection'
      }
    }
  },
  
  // --------------------------------------------------------------------------
  // COMMUNICATION SKILLS
  // --------------------------------------------------------------------------
  communication: {
    id: 'communication',
    name: 'Communication Skills',
    description: 'Ability to express needs, listen actively, and repair after conflict',
    changeability: 'CHANGEABLE',
    foundational: false,
    assessmentMethod: 'scale_1_10',
    
    subComponents: {
      articulation: 'Ability to express needs, feelings, thoughts clearly',
      listening: 'Ability to receive and understand partner\'s communication',
      repair: 'Ability to recover from conflict and rupture',
      bidRecognition: 'Noticing partner\'s attempts at connection'
    },
    
    levels: {
      low: { min: 1, max: 3, label: 'Low' },
      medium: { min: 4, max: 6, label: 'Medium' },
      high: { min: 7, max: 8, label: 'High' },
      exceptional: { min: 9, max: 10, label: 'Exceptional' }
    },
    
    effects: {
      low: {
        dating: { 
          pool: null, 
          signal: { op: 'M-', val: 0.10 }, 
          matchQuality: { op: 'M-', val: 0.15 } 
        },
        relationship: { 
          ceiling: { op: 'CAP', val: 0.60 }, 
          floor: { op: 'M-', val: 0.20 }, 
          resilience: { op: 'M-', val: 0.25 }, 
          depth: { op: 'CAP', val: 0.50 } 
        }
      },
      medium: {
        dating: { pool: null, signal: null, matchQuality: null },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      },
      high: {
        dating: { 
          pool: null, 
          signal: { op: 'M+', val: 0.10 }, 
          matchQuality: { op: 'M+', val: 0.10 } 
        },
        relationship: { 
          ceiling: { op: 'M+', val: 0.10 }, 
          floor: { op: 'A+', val: 0.10 }, 
          resilience: { op: 'M+', val: 0.15 }, 
          depth: { op: 'M+', val: 0.15 } 
        }
      },
      exceptional: {
        dating: { 
          pool: null, 
          signal: { op: 'M+', val: 0.15 }, 
          matchQuality: { op: 'M+', val: 0.15 } 
        },
        relationship: { 
          ceiling: { op: 'M+', val: 0.15 }, 
          floor: { op: 'A+', val: 0.15 }, 
          resilience: { op: 'M+', val: 0.25 }, 
          depth: { op: 'M+', val: 0.25 } 
        }
      }
    },
    
    actions: {
      primary: { type: 'TRAIN', description: 'Communication skills training (Gottman, NVC)' },
      secondary: { type: 'PRACTICE', description: 'Deliberate practice in relationships' },
      resources: ['gottman_workshop', 'nvc_training', 'couples_communication_course']
    },
    
    movementResults: {
      'low_to_high': {
        dating: ['SIGNAL_BOOST', 'QUALITY_UPGRADE'],
        relationship: ['CEILING_REMOVE', 'FLOOR_RAISE', 'RESILIENCE_BOOST', 'DEPTH_UNLOCK']
      }
    },
    
    risks: {
      low: {
        inRelationship: 'Resentment accumulation; perpetual misunderstanding; escalation patterns; emotional starvation',
        ifUnchanged: 'Relationship dies of unspoken things; same conflicts repeat indefinitely'
      }
    }
  },
  
  // --------------------------------------------------------------------------
  // EMPATHY
  // --------------------------------------------------------------------------
  empathy: {
    id: 'empathy',
    name: 'Empathy',
    description: 'Ability to understand and share the feelings of your partner',
    changeability: 'CHANGEABLE',
    foundational: false,
    assessmentMethod: 'scale_1_10',
    
    subComponents: {
      cognitive: 'Understanding what others think/feel (theory of mind)',
      affective: 'Feeling what others feel (emotional resonance)',
      empathicAction: 'Responding helpfully to others\' emotional states'
    },
    
    levels: {
      low: { min: 1, max: 3, label: 'Low' },
      medium: { min: 4, max: 6, label: 'Medium' },
      high: { min: 7, max: 8, label: 'High' },
      exceptional: { min: 9, max: 10, label: 'Exceptional' }
    },
    
    effects: {
      low: {
        dating: { 
          pool: null, 
          signal: { op: 'M-', val: 0.05 }, 
          matchQuality: { op: 'M-', val: 0.10 } 
        },
        relationship: { 
          ceiling: { op: 'CAP', val: 0.65 }, 
          floor: { op: 'M-', val: 0.15 }, 
          resilience: { op: 'M-', val: 0.15 }, 
          depth: { op: 'CAP', val: 0.55 } 
        }
      },
      medium: {
        dating: { pool: null, signal: null, matchQuality: null },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      },
      high: {
        dating: { 
          pool: null, 
          signal: { op: 'M+', val: 0.10 }, 
          matchQuality: { op: 'M+', val: 0.10 } 
        },
        relationship: { 
          ceiling: { op: 'M+', val: 0.15 }, 
          floor: { op: 'A+', val: 0.10 }, 
          resilience: { op: 'M+', val: 0.15 }, 
          depth: { op: 'M+', val: 0.20 } 
        }
      },
      exceptional: {
        dating: { 
          pool: null, 
          signal: { op: 'M+', val: 0.15 }, 
          matchQuality: { op: 'M+', val: 0.15 } 
        },
        relationship: { 
          ceiling: { op: 'M+', val: 0.20 }, 
          floor: { op: 'A+', val: 0.15 }, 
          resilience: { op: 'M+', val: 0.20 }, 
          depth: { op: 'M+', val: 0.30 } 
        }
      }
    },
    
    actions: {
      primary: { type: 'TRAIN', description: 'Empathy development exercises' },
      secondary: { type: 'PRACTICE', description: 'Perspective-taking practice' },
      resources: ['empathy_training', 'active_listening_course', 'emotional_attunement']
    },
    
    movementResults: {
      'low_to_high': {
        dating: ['SIGNAL_BOOST', 'QUALITY_UPGRADE'],
        relationship: ['CEILING_RAISE', 'FLOOR_RAISE', 'RESILIENCE_BOOST', 'DEPTH_UNLOCK']
      }
    },
    
    risks: {
      low: {
        inRelationship: 'Partner feels unseen and alone; emotional bids go unmet; partner seeks empathy elsewhere',
        ifUnchanged: 'Relationships become transactional; one partner over-functions emotionally and burns out'
      }
    }
  },
  
  // --------------------------------------------------------------------------
  // PROBLEM-SOLVING SKILLS
  // --------------------------------------------------------------------------
  problemSolving: {
    id: 'problemSolving',
    name: 'Problem-Solving Skills',
    description: 'Ability to address issues constructively as a team',
    changeability: 'CHANGEABLE',
    foundational: false,
    assessmentMethod: 'scale_1_10',
    
    subComponents: {
      issueIdentification: 'Accurately naming what\'s actually wrong',
      collaborativeFraming: '"Us vs. the problem" not "me vs. you"',
      solutionGeneration: 'Creating options that could work',
      compromise: 'Finding workable middle ground',
      implementation: 'Actually executing agreed solutions'
    },
    
    levels: {
      low: { min: 1, max: 3, label: 'Low' },
      medium: { min: 4, max: 6, label: 'Medium' },
      high: { min: 7, max: 8, label: 'High' },
      exceptional: { min: 9, max: 10, label: 'Exceptional' }
    },
    
    effects: {
      low: {
        dating: { 
          pool: null, 
          signal: null, 
          matchQuality: { op: 'M-', val: 0.05 } 
        },
        relationship: { 
          ceiling: { op: 'CAP', val: 0.70 }, 
          floor: { op: 'M-', val: 0.15 }, 
          resilience: { op: 'M-', val: 0.20 }, 
          depth: { op: 'CAP', val: 0.70 } 
        }
      },
      medium: {
        dating: { pool: null, signal: null, matchQuality: null },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      },
      high: {
        dating: { 
          pool: null, 
          signal: null, 
          matchQuality: { op: 'M+', val: 0.05 } 
        },
        relationship: { 
          ceiling: { op: 'M+', val: 0.10 }, 
          floor: { op: 'A+', val: 0.10 }, 
          resilience: { op: 'M+', val: 0.20 }, 
          depth: { op: 'M+', val: 0.10 } 
        }
      },
      exceptional: {
        dating: { 
          pool: null, 
          signal: null, 
          matchQuality: { op: 'M+', val: 0.10 } 
        },
        relationship: { 
          ceiling: { op: 'M+', val: 0.15 }, 
          floor: { op: 'A+', val: 0.15 }, 
          resilience: { op: 'M+', val: 0.30 }, 
          depth: { op: 'M+', val: 0.15 } 
        }
      }
    },
    
    actions: {
      primary: { type: 'TRAIN', description: 'Conflict resolution training' },
      secondary: { type: 'PRACTICE', description: 'Collaborative problem-solving practice' },
      resources: ['conflict_resolution_course', 'negotiation_skills', 'gottman_dreams_conversation']
    },
    
    movementResults: {
      'low_to_high': {
        dating: ['QUALITY_UPGRADE', 'TIER_UNLOCK'],
        relationship: ['CEILING_RAISE', 'FLOOR_RAISE', 'RESILIENCE_BOOST']
      }
    },
    
    risks: {
      low: {
        inRelationship: 'Same fights forever (gridlock); resentment from unsolved issues; learned helplessness',
        ifUnchanged: 'Contempt develops; practical problems cascade (finances, logistics, parenting)'
      }
    }
  },
  
  // --------------------------------------------------------------------------
  // STRESS MANAGEMENT
  // --------------------------------------------------------------------------
  stressManagement: {
    id: 'stressManagement',
    name: 'Stress Management',
    description: 'Ability to maintain regulation under pressure and recover from stress',
    changeability: 'CHANGEABLE',
    foundational: false,
    assessmentMethod: 'scale_1_10',
    
    subComponents: {
      selfRegulation: 'Managing own emotional state under pressure',
      stressCommunication: 'Expressing stress needs appropriately',
      partnerRegulation: 'Helping partner regulate (co-regulation)',
      recovery: 'Bouncing back after stress',
      tolerance: 'Capacity before breakdown'
    },
    
    levels: {
      low: { min: 1, max: 3, label: 'Low' },
      medium: { min: 4, max: 6, label: 'Medium' },
      high: { min: 7, max: 8, label: 'High' },
      exceptional: { min: 9, max: 10, label: 'Exceptional' }
    },
    
    effects: {
      low: {
        dating: { 
          pool: null, 
          signal: { op: 'M-', val: 0.10 }, 
          matchQuality: { op: 'M-', val: 0.10 } 
        },
        relationship: { 
          ceiling: { op: 'CAP', val: 0.70 }, 
          floor: { op: 'M-', val: 0.25 }, 
          resilience: { op: 'CAP', val: 0.50 }, 
          depth: { op: 'CAP', val: 0.70 } 
        }
      },
      medium: {
        dating: { pool: null, signal: null, matchQuality: null },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      },
      high: {
        dating: { 
          pool: null, 
          signal: { op: 'M+', val: 0.10 }, 
          matchQuality: { op: 'M+', val: 0.10 } 
        },
        relationship: { 
          ceiling: { op: 'M+', val: 0.10 }, 
          floor: { op: 'A+', val: 0.15 }, 
          resilience: { op: 'M+', val: 0.25 }, 
          depth: { op: 'M+', val: 0.10 } 
        }
      },
      exceptional: {
        dating: { 
          pool: null, 
          signal: { op: 'M+', val: 0.15 }, 
          matchQuality: { op: 'M+', val: 0.15 } 
        },
        relationship: { 
          ceiling: { op: 'M+', val: 0.15 }, 
          floor: { op: 'A+', val: 0.20 }, 
          resilience: { op: 'M+', val: 0.35 }, 
          depth: { op: 'M+', val: 0.15 } 
        }
      }
    },
    
    actions: {
      primary: { type: 'TRAIN', description: 'Stress management program' },
      secondary: { type: 'PRACTICE', description: 'Regulation techniques' },
      resources: ['stress_management_course', 'mindfulness_training', 'co_regulation_work']
    },
    
    movementResults: {
      'low_to_high': {
        dating: ['SIGNAL_BOOST', 'QUALITY_UPGRADE'],
        relationship: ['CEILING_RAISE', 'FLOOR_RAISE', 'RESILIENCE_BOOST', 'STABILITY_GAIN']
      }
    },
    
    risks: {
      low: {
        inRelationship: 'First major stressor destroys relationship; chronic stress erodes everything slowly',
        ifUnchanged: 'Partner becomes source of stress rather than refuge; health consequences accumulate'
      }
    }
  },
  
  // --------------------------------------------------------------------------
  // SHAME RESILIENCE (Foundational)
  // --------------------------------------------------------------------------
  shameResilience: {
    id: 'shameResilience',
    name: 'Shame Resilience',
    description: 'Ability to tolerate vulnerability and imperfection without collapsing or attacking',
    changeability: 'CHANGEABLE',
    foundational: true,
    assessmentMethod: 'scale_1_10',
    
    subComponents: {
      recognizingShame: 'Identifying shame when it arises',
      criticalAwareness: 'Understanding shame triggers and messages',
      reachingOut: 'Connecting with others despite shame',
      speakingShame: 'Ability to talk about shame experiences'
    },
    
    levels: {
      low: { min: 1, max: 3, label: 'Low' },
      medium: { min: 4, max: 6, label: 'Medium' },
      high: { min: 7, max: 8, label: 'High' },
      exceptional: { min: 9, max: 10, label: 'Exceptional' }
    },
    
    effects: {
      low: {
        dating: { 
          pool: null, 
          signal: { op: 'M-', val: 0.10 }, 
          matchQuality: { op: 'M-', val: 0.15 } 
        },
        relationship: { 
          ceiling: { op: 'CAP', val: 0.65 }, 
          floor: { op: 'M-', val: 0.10 }, 
          resilience: { op: 'M-', val: 0.15 }, 
          depth: { op: 'CAP', val: 0.45 } 
        }
      },
      medium: {
        dating: { pool: null, signal: null, matchQuality: null },
        relationship: { 
          ceiling: null, 
          floor: null, 
          resilience: null, 
          depth: { op: 'CAP', val: 0.75 } 
        }
      },
      high: {
        dating: { 
          pool: null, 
          signal: { op: 'M+', val: 0.10 }, 
          matchQuality: { op: 'M+', val: 0.10 } 
        },
        relationship: { 
          ceiling: { op: 'M+', val: 0.10 }, 
          floor: { op: 'A+', val: 0.10 }, 
          resilience: { op: 'M+', val: 0.15 }, 
          depth: { op: 'M+', val: 0.20 } 
        }
      },
      exceptional: {
        dating: { 
          pool: null, 
          signal: { op: 'M+', val: 0.15 }, 
          matchQuality: { op: 'M+', val: 0.15 } 
        },
        relationship: { 
          ceiling: { op: 'M+', val: 0.15 }, 
          floor: { op: 'A+', val: 0.15 }, 
          resilience: { op: 'M+', val: 0.20 }, 
          depth: { op: 'M+', val: 0.35 } 
        }
      }
    },
    
    actions: {
      primary: { type: 'TREAT', description: 'Shame resilience therapy' },
      secondary: { type: 'PRACTICE', description: 'Vulnerability practice' },
      resources: ['brene_brown_work', 'shame_resilience_curriculum', 'vulnerability_practice']
    },
    
    movementResults: {
      'low_to_high': {
        dating: ['SIGNAL_BOOST', 'QUALITY_UPGRADE'],
        relationship: ['CEILING_RAISE', 'FLOOR_RAISE', 'RESILIENCE_BOOST', 'DEPTH_UNLOCK']
      }
    },
    
    risks: {
      low: {
        inRelationship: 'Armor keeps partner out; they love a mask; criticism triggers destruction',
        ifUnchanged: 'Secrets and hidden selves create distance; inability to apologize or admit fault'
      }
    }
  },
  
  // --------------------------------------------------------------------------
  // SELF-AWARENESS (Foundational)
  // --------------------------------------------------------------------------
  selfAwareness: {
    id: 'selfAwareness',
    name: 'Self-Awareness',
    description: 'Understanding of your own patterns, triggers, needs, and contributions to dynamics',
    changeability: 'CHANGEABLE',
    foundational: true,
    assessmentMethod: 'scale_1_10',
    
    subComponents: {
      patternRecognition: 'Seeing own recurring patterns',
      triggerAwareness: 'Understanding what activates reactions',
      needsArticulation: 'Knowing and expressing own needs',
      ownershipCapacity: 'Taking responsibility for own role'
    },
    
    levels: {
      low: { min: 1, max: 3, label: 'Low' },
      medium: { min: 4, max: 6, label: 'Medium' },
      high: { min: 7, max: 8, label: 'High' },
      exceptional: { min: 9, max: 10, label: 'Exceptional' }
    },
    
    effects: {
      low: {
        dating: { 
          pool: null, 
          signal: { op: 'M-', val: 0.05 }, 
          matchQuality: { op: 'M-', val: 0.20 } 
        },
        relationship: { 
          ceiling: { op: 'CAP', val: 0.70 }, 
          floor: { op: 'M-', val: 0.10 }, 
          resilience: { op: 'M-', val: 0.10 }, 
          depth: { op: 'CAP', val: 0.60 } 
        }
      },
      medium: {
        dating: { pool: null, signal: null, matchQuality: null },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      },
      high: {
        dating: { 
          pool: null, 
          signal: { op: 'M+', val: 0.10 }, 
          matchQuality: { op: 'M+', val: 0.15 } 
        },
        relationship: { 
          ceiling: { op: 'M+', val: 0.10 }, 
          floor: { op: 'A+', val: 0.10 }, 
          resilience: { op: 'M+', val: 0.15 }, 
          depth: { op: 'M+', val: 0.15 } 
        }
      },
      exceptional: {
        dating: { 
          pool: null, 
          signal: { op: 'M+', val: 0.15 }, 
          matchQuality: { op: 'M+', val: 0.20 } 
        },
        relationship: { 
          ceiling: { op: 'M+', val: 0.15 }, 
          floor: { op: 'A+', val: 0.15 }, 
          resilience: { op: 'M+', val: 0.20 }, 
          depth: { op: 'M+', val: 0.25 } 
        }
      }
    },
    
    actions: {
      primary: { type: 'PRACTICE', description: 'Self-reflection practices' },
      secondary: { type: 'TREAT', description: 'Therapy for insight' },
      resources: ['journaling_practice', 'feedback_integration', 'pattern_recognition_work']
    },
    
    movementResults: {
      'low_to_high': {
        dating: ['SIGNAL_BOOST', 'QUALITY_UPGRADE'],
        relationship: ['CEILING_RAISE', 'FLOOR_RAISE', 'RESILIENCE_BOOST', 'DEPTH_UNLOCK']
      }
    },
    
    risks: {
      low: {
        inRelationship: 'Repeating patterns without understanding; blaming partner for recurring issues',
        ifUnchanged: 'No growth; same person at year 10 as year 1; blindspots become relationship landmines'
      }
    }
  }
};

// ============================================================================
// DEMOGRAPHIC MODIFIERS (Calibrated to exact CBSA keys)
// ============================================================================

const DEMOGRAPHIC_MODIFIERS = {
  
  // --------------------------------------------------------------------------
  // LOCATION (Contextual)
  // --------------------------------------------------------------------------
  location: {
    id: 'location',
    name: 'Location',
    description: 'Geographic market affecting pool size and composition',
    changeability: 'CONTEXTUAL',
    
    cbsaKeys: {
      absolute: {
        population: 'cbsa_population',
        costOfLiving: 'rpp',
        latitude: 'lat',
        longitude: 'lng',
        code: 'cbsa',
        name: 'cbsa_name',
        label: 'cbsa_label',
        type: 'cbsa_type'
      }
    },
    
    // Location effects are calculated dynamically from cbsa data
    // Pool size comes from population; composition from demographic distributions
    effectCalculation: 'DYNAMIC_FROM_CBSA',
    
    effects: {
      goodFit: {
        dating: { 
          pool: { op: 'M+', val: 'dynamic' }, 
          signal: { op: 'M+', val: 'dynamic' }, 
          matchQuality: { op: 'M+', val: 'dynamic' } 
        },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      },
      poorFit: {
        dating: { 
          pool: { op: 'F', val: 'dynamic' }, 
          signal: { op: 'M-', val: 'dynamic' }, 
          matchQuality: { op: 'M-', val: 'dynamic' } 
        },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      }
    },
    
    actions: {
      primary: { type: 'RELOCATE', description: 'Move to better-fit market' },
      secondary: { type: 'REFRAME', description: 'Expand search radius online' }
    }
  },
  
  // --------------------------------------------------------------------------
  // AGE (Fixed)
  // --------------------------------------------------------------------------
  age: {
    id: 'age',
    name: 'Age',
    description: 'Chronological age affecting market position',
    changeability: 'FIXED',
    userInputType: 'number',
    genderDifferentiated: true,
    
    cbsaKeys: {
      nationalPercentages: {
        '18-19': 'age_18_19_cbsa',
        '20-24': 'age_20_24_cbsa',
        '25-29': 'age_25_29_cbsa',
        '30-34': 'age_30_34_cbsa',
        '35-39': 'age_35_39_cbsa',
        '40-44': 'age_40_44_cbsa',
        '45-49': 'age_45_49_cbsa',
        '50-54': 'age_50_54_cbsa',
        '55-59': 'age_55_59_cbsa',
        '60-64': 'age_60_64_cbsa',
        '65-69': 'age_65_69_cbsa',
        '70-74': 'age_70_74_cbsa',
        '75-79': 'age_75_79_cbsa',
        '80-84': 'age_80_84_cbsa',
        '85+': 'age_85_120_cbsa'
      },
      localWeight: 'age_25_45_cbsa'
    },
    
    brackets: [
      { min: 18, max: 19, key: 'age_18_19_cbsa' },
      { min: 20, max: 24, key: 'age_20_24_cbsa' },
      { min: 25, max: 29, key: 'age_25_29_cbsa' },
      { min: 30, max: 34, key: 'age_30_34_cbsa' },
      { min: 35, max: 39, key: 'age_35_39_cbsa' },
      { min: 40, max: 44, key: 'age_40_44_cbsa' },
      { min: 45, max: 49, key: 'age_45_49_cbsa' },
      { min: 50, max: 54, key: 'age_50_54_cbsa' },
      { min: 55, max: 59, key: 'age_55_59_cbsa' },
      { min: 60, max: 64, key: 'age_60_64_cbsa' },
      { min: 65, max: 69, key: 'age_65_69_cbsa' },
      { min: 70, max: 74, key: 'age_70_74_cbsa' },
      { min: 75, max: 79, key: 'age_75_79_cbsa' },
      { min: 80, max: 84, key: 'age_80_84_cbsa' },
      { min: 85, max: 120, key: 'age_85_120_cbsa' }
    ],
    
    // Effects are percentile-based and gender-differentiated
    // These MODIFY the base age score from the Relate Score system
    effects: {
      man: {
        bottom20: {
          dating: { pool: { op: 'F', val: 0.70 }, signal: { op: 'M-', val: 0.15 }, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        },
        '20_40': {
          dating: { pool: { op: 'F', val: 0.85 }, signal: { op: 'M-', val: 0.05 }, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        },
        '40_60': {
          dating: { pool: null, signal: null, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        },
        '60_80': {
          dating: { pool: { op: 'M+', val: 0.05 }, signal: { op: 'M+', val: 0.10 }, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        },
        top20: {
          dating: { pool: { op: 'F', val: 0.90 }, signal: { op: 'V', val: 0.10 }, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        }
      },
      woman: {
        bottom20: {
          dating: { pool: { op: 'F', val: 0.85 }, signal: { op: 'M+', val: 0.05 }, matchQuality: { op: 'M-', val: 0.10 } },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        },
        '20_40': {
          dating: { pool: null, signal: { op: 'M+', val: 0.10 }, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        },
        '40_60': {
          dating: { pool: null, signal: null, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        },
        '60_80': {
          dating: { pool: { op: 'F', val: 0.85 }, signal: { op: 'M-', val: 0.05 }, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        },
        top20: {
          dating: { pool: { op: 'F', val: 0.70 }, signal: { op: 'M-', val: 0.10 }, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        }
      }
    },
    
    actions: {
      primary: { type: 'REPOSITION', description: 'Leverage life stage advantages' },
      secondary: { type: 'REFRAME', description: 'Adjust market expectations' }
    }
  },
  
  // --------------------------------------------------------------------------
  // GENDER (Fixed)
  // --------------------------------------------------------------------------
  gender: {
    id: 'gender',
    name: 'Gender',
    description: 'Gender identity',
    changeability: 'FIXED',
    userInputType: 'select',
    
    cbsaKeys: {
      nationalPercentages: {
        man: 'gender_man_cbsa',
        woman: 'gender_woman_cbsa',
        other: 'gender_other_cbsa'
      },
      localWeights: {
        man: 'male_cbsa',
        woman: 'female_cbsa'
      }
    },
    
    options: [
      { value: 'man', label: 'Man' },
      { value: 'woman', label: 'Woman' },
      { value: 'other', label: 'Other' }
    ],
    
    // Gender itself doesn't have effects - it MODULATES other modifiers
    effects: null,
    modulates: ['age', 'income', 'height', 'haveKids']
  },
  
  // --------------------------------------------------------------------------
  // ORIENTATION (Fixed)
  // --------------------------------------------------------------------------
  orientation: {
    id: 'orientation',
    name: 'Sexual Orientation',
    description: 'Sexual orientation affecting target pool',
    changeability: 'FIXED',
    userInputType: 'select',
    
    cbsaKeys: {
      nationalPercentages: {
        straight: 'orientation_straight_cbsa',
        bisexual: 'orientation_bisexual_cbsa',
        gayLesbian: 'orientation_gay_lesbian_cbsa',
        other: 'orientation_other_cbsa'
      }
    },
    
    options: [
      { value: 'straight', label: 'Straight' },
      { value: 'bisexual', label: 'Bisexual' },
      { value: 'gay_lesbian', label: 'Gay/Lesbian' },
      { value: 'other', label: 'Other' }
    ],
    
    // Orientation primarily affects pool through filtering in existing calculation
    effects: {
      poolFilter: 'USE_CBSA_PERCENTAGE'
    }
  },
  
  // --------------------------------------------------------------------------
  // ETHNICITY (Fixed)
  // --------------------------------------------------------------------------
  ethnicity: {
    id: 'ethnicity',
    name: 'Ethnicity',
    description: 'Ethnic background affecting local market dynamics',
    changeability: 'FIXED',
    userInputType: 'select',
    
    cbsaKeys: {
      nationalPercentages: {
        white: 'ethnicity_white_cbsa',
        hispanic: 'ethnicity_hispanic_cbsa',
        black: 'ethnicity_black_cbsa',
        asian: 'ethnicity_asian_cbsa',
        native: 'ethnicity_native_cbsa',
        pacific: 'ethnicity_pacific_cbsa',
        other: 'ethnicity_other_cbsa'
      },
      localWeight: 'pct_white_cbsa'
    },
    
    options: [
      { value: 'white', label: 'White' },
      { value: 'hispanic', label: 'Hispanic/Latino' },
      { value: 'black', label: 'Black' },
      { value: 'asian', label: 'Asian' },
      { value: 'native', label: 'Native American' },
      { value: 'pacific', label: 'Pacific Islander' },
      { value: 'other', label: 'Other' }
    ],
    
    // Ethnicity score = local representation percentage in existing Relate Score
    effects: {
      calculation: 'LOCAL_REPRESENTATION_PERCENTAGE'
    },
    
    actions: {
      primary: { type: 'REPOSITION', description: 'Lead with other strengths' },
      secondary: { type: 'RELOCATE', description: 'Consider more diverse markets' }
    }
  },
  
  // --------------------------------------------------------------------------
  // HEIGHT (Fixed)
  // --------------------------------------------------------------------------
  height: {
    id: 'height',
    name: 'Height',
    description: 'Physical height affecting attraction dynamics',
    changeability: 'FIXED',
    userInputType: 'number',
    unit: 'inches',
    genderDifferentiated: true,
    
    cbsaKeys: {
      nationalPercentages: {
        'under60': 'height_under_60_cbsa',
        '60-62': 'height_60_62_cbsa',
        '63-65': 'height_63_65_cbsa',
        '66-68': 'height_66_68_cbsa',
        '69-71': 'height_69_71_cbsa',
        '72plus': 'height_72plus_cbsa'
      }
    },
    
    brackets: [
      { max: 59, key: 'height_under_60_cbsa', label: "Under 5'0\"" },
      { max: 62, key: 'height_60_62_cbsa', label: "5'0\" - 5'2\"" },
      { max: 65, key: 'height_63_65_cbsa', label: "5'3\" - 5'5\"" },
      { max: 68, key: 'height_66_68_cbsa', label: "5'6\" - 5'8\"" },
      { max: 71, key: 'height_69_71_cbsa', label: "5'9\" - 5'11\"" },
      { max: Infinity, key: 'height_72plus_cbsa', label: "6'0\" and above" }
    ],
    
    effects: {
      man: {
        under60: {
          dating: { pool: { op: 'F', val: 0.60 }, signal: { op: 'M-', val: 0.20 }, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        },
        '60-62': {
          dating: { pool: { op: 'F', val: 0.70 }, signal: { op: 'M-', val: 0.15 }, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        },
        '63-65': {
          dating: { pool: { op: 'F', val: 0.80 }, signal: { op: 'M-', val: 0.10 }, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        },
        '66-68': {
          dating: { pool: null, signal: null, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        },
        '69-71': {
          dating: { pool: { op: 'M+', val: 0.10 }, signal: { op: 'M+', val: 0.15 }, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        },
        '72plus': {
          dating: { pool: { op: 'M+', val: 0.15 }, signal: { op: 'M+', val: 0.10 }, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        }
      },
      woman: {
        'under60': {
          dating: { pool: { op: 'M+', val: 0.05 }, signal: null, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        },
        '60-65': {
          dating: { pool: null, signal: null, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        },
        '66-68': {
          dating: { pool: null, signal: null, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        },
        '69plus': {
          dating: { pool: { op: 'F', val: 0.90 }, signal: { op: 'V', val: 0.10 }, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        }
      }
    },
    
    actions: {
      primary: { type: 'REPOSITION', description: 'Lead with other strengths' },
      secondary: { type: 'REFRAME', description: 'Select platforms/markets that de-emphasize height' }
    }
  },
  
  // --------------------------------------------------------------------------
  // EDUCATION (Semi-Fixed)
  // --------------------------------------------------------------------------
  education: {
    id: 'education',
    name: 'Education',
    description: 'Highest education level achieved',
    changeability: 'SEMI_FIXED',
    userInputType: 'select',
    
    cbsaKeys: {
      nationalPercentages: {
        lessHs: 'education_less_hs_cbsa',
        hsGrad: 'education_hs_grad_cbsa',
        trade: 'education_trade_cbsa',
        associate: 'education_associate_cbsa',
        someCollege: 'education_some_college_cbsa',
        bachelors: 'education_bachelors_cbsa',
        graduate: 'education_graduate_cbsa'
      },
      localWeight: 'bachelors_cbsa'
    },
    
    options: [
      { value: 'less_hs', key: 'education_less_hs_cbsa', label: 'Less than High School' },
      { value: 'hs_grad', key: 'education_hs_grad_cbsa', label: 'High School Graduate' },
      { value: 'trade', key: 'education_trade_cbsa', label: 'Trade/Vocational' },
      { value: 'associate', key: 'education_associate_cbsa', label: 'Associate Degree' },
      { value: 'some_college', key: 'education_some_college_cbsa', label: 'Some College' },
      { value: 'bachelors', key: 'education_bachelors_cbsa', label: "Bachelor's Degree" },
      { value: 'graduate', key: 'education_graduate_cbsa', label: 'Graduate/Professional Degree' }
    ],
    
    effects: {
      less_hs: {
        dating: { pool: { op: 'F', val: 0.70 }, signal: { op: 'M-', val: 0.15 }, matchQuality: { op: 'M-', val: 0.10 } },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      },
      hs_grad: {
        dating: { pool: { op: 'F', val: 0.85 }, signal: { op: 'M-', val: 0.05 }, matchQuality: null },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      },
      trade: {
        dating: { pool: null, signal: null, matchQuality: null },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      },
      associate: {
        dating: { pool: null, signal: null, matchQuality: null },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      },
      some_college: {
        dating: { pool: null, signal: null, matchQuality: null },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      },
      bachelors: {
        dating: { pool: null, signal: { op: 'M+', val: 0.05 }, matchQuality: { op: 'M+', val: 0.05 } },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      },
      graduate: {
        dating: { pool: { op: 'M+', val: 0.10 }, signal: { op: 'M+', val: 0.10 }, matchQuality: { op: 'M+', val: 0.10 } },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      }
    },
    
    actions: {
      primary: { type: 'INVEST', description: 'Pursue additional education' },
      secondary: { type: 'REFRAME', description: 'Fish in markets that value other strengths' }
    }
  },
  
  // --------------------------------------------------------------------------
  // INCOME (Semi-Fixed)
  // --------------------------------------------------------------------------
  income: {
    id: 'income',
    name: 'Income',
    description: 'Annual income affecting market position',
    changeability: 'SEMI_FIXED',
    userInputType: 'number',
    unit: 'dollars',
    genderDifferentiated: true,
    valuesDifferentiated: true,
    
    cbsaKeys: {
      nationalPercentages: {
        'under35k': 'income_under_35k_cbsa',
        '35k-50k': 'income_35k_50k_cbsa',
        '50k-75k': 'income_50k_75k_cbsa',
        '75k-100k': 'income_75k_100k_cbsa',
        '100k-150k': 'income_100k_150k_cbsa',
        '150k-200k': 'income_150k_200k_cbsa',
        '200k-300k': 'income_200k_300k_cbsa',
        '300k-500k': 'income_300k_500k_cbsa',
        '500k-750k': 'income_500k_750k_cbsa',
        '750k+': 'income_750k_plus_cbsa'
      },
      localWeight: 'income_cbsa'
    },
    
    brackets: [
      { max: 35000, key: 'income_under_35k_cbsa', label: 'Under $35k' },
      { max: 50000, key: 'income_35k_50k_cbsa', label: '$35k - $50k' },
      { max: 75000, key: 'income_50k_75k_cbsa', label: '$50k - $75k' },
      { max: 100000, key: 'income_75k_100k_cbsa', label: '$75k - $100k' },
      { max: 150000, key: 'income_100k_150k_cbsa', label: '$100k - $150k' },
      { max: 200000, key: 'income_150k_200k_cbsa', label: '$150k - $200k' },
      { max: 300000, key: 'income_200k_300k_cbsa', label: '$200k - $300k' },
      { max: 500000, key: 'income_300k_500k_cbsa', label: '$300k - $500k' },
      { max: 750000, key: 'income_500k_750k_cbsa', label: '$500k - $750k' },
      { max: Infinity, key: 'income_750k_plus_cbsa', label: '$750k+' }
    ],
    
    // Effects vary by gender AND by values (Traditional G vs Egalitarian H)
    effects: {
      man: {
        traditional: {
          bottom20: {
            dating: { pool: { op: 'F', val: 0.50 }, signal: { op: 'M-', val: 0.25 }, matchQuality: null },
            relationship: { ceiling: { op: 'CAP', val: 0.80 }, floor: { op: 'M-', val: 0.15 }, resilience: { op: 'M-', val: 0.10 }, depth: null }
          },
          '20_40': {
            dating: { pool: { op: 'F', val: 0.75 }, signal: { op: 'M-', val: 0.10 }, matchQuality: null },
            relationship: { ceiling: null, floor: null, resilience: null, depth: null }
          },
          '40_60': {
            dating: { pool: null, signal: null, matchQuality: null },
            relationship: { ceiling: null, floor: null, resilience: null, depth: null }
          },
          '60_80': {
            dating: { pool: { op: 'M+', val: 0.10 }, signal: { op: 'M+', val: 0.10 }, matchQuality: null },
            relationship: { ceiling: null, floor: null, resilience: null, depth: null }
          },
          top20: {
            dating: { pool: { op: 'M+', val: 0.20 }, signal: { op: 'M+', val: 0.15 }, matchQuality: null },
            relationship: { ceiling: null, floor: null, resilience: null, depth: null }
          }
        },
        egalitarian: {
          bottom20: {
            dating: { pool: { op: 'F', val: 0.75 }, signal: { op: 'M-', val: 0.10 }, matchQuality: null },
            relationship: { ceiling: null, floor: null, resilience: null, depth: null }
          },
          '20_40': {
            dating: { pool: { op: 'F', val: 0.90 }, signal: null, matchQuality: null },
            relationship: { ceiling: null, floor: null, resilience: null, depth: null }
          },
          '40_60': {
            dating: { pool: null, signal: null, matchQuality: null },
            relationship: { ceiling: null, floor: null, resilience: null, depth: null }
          },
          '60_80': {
            dating: { pool: { op: 'M+', val: 0.05 }, signal: null, matchQuality: null },
            relationship: { ceiling: null, floor: null, resilience: null, depth: null }
          },
          top20: {
            dating: { pool: { op: 'M+', val: 0.10 }, signal: { op: 'M+', val: 0.05 }, matchQuality: null },
            relationship: { ceiling: null, floor: null, resilience: null, depth: null }
          }
        }
      },
      woman: {
        traditional: {
          bottom20: {
            dating: { pool: null, signal: null, matchQuality: null },
            relationship: { ceiling: null, floor: null, resilience: null, depth: null }
          },
          '40_60': {
            dating: { pool: null, signal: null, matchQuality: null },
            relationship: { ceiling: null, floor: null, resilience: null, depth: null }
          },
          '60_80': {
            dating: { pool: { op: 'F', val: 0.95 }, signal: { op: 'V', val: 0.10 }, matchQuality: null },
            relationship: { ceiling: null, floor: null, resilience: null, depth: null }
          },
          top20: {
            dating: { pool: { op: 'F', val: 0.85 }, signal: { op: 'V', val: 0.15 }, matchQuality: null },
            relationship: { ceiling: null, floor: null, resilience: null, depth: null }
          }
        },
        egalitarian: {
          bottom20: {
            dating: { pool: { op: 'F', val: 0.85 }, signal: { op: 'M-', val: 0.05 }, matchQuality: null },
            relationship: { ceiling: null, floor: null, resilience: null, depth: null }
          },
          '40_60': {
            dating: { pool: null, signal: null, matchQuality: null },
            relationship: { ceiling: null, floor: null, resilience: null, depth: null }
          },
          '60_80': {
            dating: { pool: { op: 'M+', val: 0.05 }, signal: null, matchQuality: null },
            relationship: { ceiling: null, floor: null, resilience: null, depth: null }
          },
          top20: {
            dating: { pool: { op: 'M+', val: 0.10 }, signal: { op: 'M+', val: 0.10 }, matchQuality: null },
            relationship: { ceiling: null, floor: null, resilience: null, depth: null }
          }
        }
      }
    },
    
    actions: {
      primary: { type: 'INVEST', description: 'Career/income development' },
      secondary: { type: 'REFRAME', description: 'Shift to egalitarian markets if traditional is limiting' }
    }
  },
  
  // --------------------------------------------------------------------------
  // FITNESS (Changeable)
  // --------------------------------------------------------------------------
  fitness: {
    id: 'fitness',
    name: 'Fitness Level',
    description: 'Exercise frequency affecting health and attraction',
    changeability: 'CHANGEABLE',
    userInputType: 'select',
    
    cbsaKeys: {
      nationalPercentages: {
        never: 'fitness_never_cbsa',
        oneDay: 'fitness_1_day_cbsa',
        twoThreeDays: 'fitness_2_3_days_cbsa',
        fourSixDays: 'fitness_4_6_days_cbsa',
        daily: 'fitness_daily_cbsa'
      },
      localWeight: 'activity_cbsa'
    },
    
    options: [
      { value: 'never', key: 'fitness_never_cbsa', label: 'Never' },
      { value: '1_day', key: 'fitness_1_day_cbsa', label: '1 day/week' },
      { value: '2_3_days', key: 'fitness_2_3_days_cbsa', label: '2-3 days/week' },
      { value: '4_6_days', key: 'fitness_4_6_days_cbsa', label: '4-6 days/week' },
      { value: 'daily', key: 'fitness_daily_cbsa', label: 'Daily' }
    ],
    
    effects: {
      never: {
        dating: { pool: { op: 'F', val: 0.70 }, signal: { op: 'M-', val: 0.20 }, matchQuality: { op: 'M-', val: 0.10 } },
        relationship: { ceiling: null, floor: { op: 'M-', val: 0.05 }, resilience: null, depth: null }
      },
      '1_day': {
        dating: { pool: { op: 'F', val: 0.85 }, signal: { op: 'M-', val: 0.10 }, matchQuality: null },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      },
      '2_3_days': {
        dating: { pool: null, signal: null, matchQuality: null },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      },
      '4_6_days': {
        dating: { pool: { op: 'M+', val: 0.10 }, signal: { op: 'M+', val: 0.15 }, matchQuality: { op: 'M+', val: 0.05 } },
        relationship: { ceiling: null, floor: { op: 'A+', val: 0.05 }, resilience: null, depth: null }
      },
      daily: {
        dating: { pool: { op: 'M+', val: 0.15 }, signal: { op: 'M+', val: 0.20 }, matchQuality: { op: 'M+', val: 0.10 } },
        relationship: { ceiling: null, floor: { op: 'A+', val: 0.10 }, resilience: null, depth: null }
      }
    },
    
    actions: {
      primary: { type: 'CHANGE', description: 'Increase exercise frequency' }
    },
    
    movementResults: {
      'never_to_4_6_days': {
        dating: ['POOL_EXPANSION', 'SIGNAL_BOOST', 'QUALITY_UPGRADE', 'FILTER_REMOVAL'],
        relationship: ['FLOOR_RAISE']
      }
    }
  },
  
  // --------------------------------------------------------------------------
  // BMI (Changeable)
  // --------------------------------------------------------------------------
  bmi: {
    id: 'bmi',
    name: 'BMI',
    description: 'Body mass index affecting attraction dynamics',
    changeability: 'CHANGEABLE',
    userInputType: 'number',
    
    cbsaKeys: {
      nationalPercentages: {
        elite: 'bmi_elite_cbsa',
        normal: 'bmi_normal_cbsa',
        overweight: 'bmi_overweight_cbsa',
        obese: 'bmi_obesity_cbsa'
      },
      localWeight: 'obesity_cbsa'
    },
    
    brackets: [
      { max: 18.5, key: 'bmi_elite_cbsa', label: 'Underweight/Elite', category: 'elite' },
      { max: 24.9, key: 'bmi_normal_cbsa', label: 'Normal', category: 'normal' },
      { max: 29.9, key: 'bmi_overweight_cbsa', label: 'Overweight', category: 'overweight' },
      { max: Infinity, key: 'bmi_obesity_cbsa', label: 'Obese', category: 'obese' }
    ],
    
    effects: {
      elite: {
        dating: { pool: { op: 'M+', val: 0.05 }, signal: { op: 'M+', val: 0.10 }, matchQuality: null },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      },
      normal: {
        dating: { pool: null, signal: null, matchQuality: null },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      },
      overweight: {
        dating: { pool: { op: 'F', val: 0.85 }, signal: { op: 'M-', val: 0.10 }, matchQuality: null },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      },
      obese: {
        dating: { pool: { op: 'F', val: 0.65 }, signal: { op: 'M-', val: 0.25 }, matchQuality: { op: 'M-', val: 0.05 } },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      }
    },
    
    actions: {
      primary: { type: 'CHANGE', description: 'Weight management program' }
    },
    
    movementResults: {
      'obese_to_normal': {
        dating: ['POOL_EXPANSION', 'SIGNAL_BOOST', 'FILTER_REMOVAL'],
        relationship: []
      }
    }
  },
  
  // --------------------------------------------------------------------------
  // HAVE KIDS (Fixed)
  // --------------------------------------------------------------------------
  haveKids: {
    id: 'haveKids',
    name: 'Have Children',
    description: 'Whether user has existing children',
    changeability: 'FIXED',
    userInputType: 'select',
    genderDifferentiated: true,
    
    cbsaKeys: {
      nationalPercentages: {
        yes: 'have_kids_yes_cbsa',
        no: 'have_kids_no_cbsa'
      }
    },
    
    options: [
      { value: 'yes', key: 'have_kids_yes_cbsa', label: 'Yes' },
      { value: 'no', key: 'have_kids_no_cbsa', label: 'No' }
    ],
    
    effects: {
      man: {
        yes: {
          dating: { pool: { op: 'F', val: 0.85 }, signal: { op: 'V', val: 0.10 }, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: { op: 'V', val: 0.15 }, depth: null }
        },
        no: {
          dating: { pool: null, signal: null, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        }
      },
      woman: {
        yes: {
          dating: { pool: { op: 'F', val: 0.75 }, signal: { op: 'V', val: 0.15 }, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: { op: 'V', val: 0.15 }, depth: null }
        },
        no: {
          dating: { pool: null, signal: null, matchQuality: null },
          relationship: { ceiling: null, floor: null, resilience: null, depth: null }
        }
      }
    },
    
    actions: {
      primary: { type: 'REFRAME', description: 'Target family-seeking market segment' },
      secondary: { type: 'REPOSITION', description: 'Lead with parenting strengths' }
    }
  },
  
  // --------------------------------------------------------------------------
  // WANT KIDS (Semi-Fixed) - Creates GATE effects
  // --------------------------------------------------------------------------
  wantKids: {
    id: 'wantKids',
    name: 'Want Children',
    description: 'Desire for future children - major compatibility factor',
    changeability: 'SEMI_FIXED',
    userInputType: 'select',
    
    cbsaKeys: {
      nationalPercentages: {
        yes: 'want_kids_yes_cbsa',
        no: 'want_kids_no_cbsa',
        maybe: 'want_kids_maybe_cbsa'
      }
    },
    
    options: [
      { value: 'yes', key: 'want_kids_yes_cbsa', label: 'Yes' },
      { value: 'no', key: 'want_kids_no_cbsa', label: 'No' },
      { value: 'maybe', key: 'want_kids_maybe_cbsa', label: 'Maybe/Open' }
    ],
    
    // GATE effects create binary exclusions based on mismatch
    effects: {
      gateRules: [
        { user: 'yes', partner: 'no', effect: { op: 'G', val: 'exclude' }, reason: 'Fundamental mismatch on children' },
        { user: 'yes', partner: 'maybe', effect: { op: 'F', val: 0.70 }, reason: 'Partner uncertainty on children' },
        { user: 'yes', partner: 'yes', effect: null },
        { user: 'no', partner: 'yes', effect: { op: 'G', val: 'exclude' }, reason: 'Fundamental mismatch on children' },
        { user: 'no', partner: 'maybe', effect: { op: 'F', val: 0.80 }, reason: 'Partner may want children' },
        { user: 'no', partner: 'no', effect: null },
        { user: 'maybe', partner: 'yes', effect: null },
        { user: 'maybe', partner: 'no', effect: null },
        { user: 'maybe', partner: 'maybe', effect: null }
      ]
    },
    
    actions: {
      primary: { type: 'REFRAME', description: 'Be clear about position and filter early' }
    }
  },
  
  // --------------------------------------------------------------------------
  // POLITICAL VIEW (Semi-Fixed)
  // --------------------------------------------------------------------------
  political: {
    id: 'political',
    name: 'Political View',
    description: 'Political orientation affecting values alignment',
    changeability: 'SEMI_FIXED',
    userInputType: 'select',
    
    cbsaKeys: {
      nationalPercentages: {
        conservative: 'political_conservative_cbsa',
        moderate: 'political_moderate_cbsa',
        liberal: 'political_liberal_cbsa',
        apolitical: 'political_apolitical_cbsa'
      }
    },
    
    options: [
      { value: 'conservative', key: 'political_conservative_cbsa', label: 'Conservative' },
      { value: 'moderate', key: 'political_moderate_cbsa', label: 'Moderate' },
      { value: 'liberal', key: 'political_liberal_cbsa', label: 'Liberal' },
      { value: 'apolitical', key: 'political_apolitical_cbsa', label: 'Apolitical' }
    ],
    
    // Effects based on alignment with partner
    effects: {
      same: {
        dating: { pool: null, signal: { op: 'M+', val: 0.10 }, matchQuality: { op: 'M+', val: 0.15 } },
        relationship: { ceiling: null, floor: null, resilience: { op: 'M+', val: 0.10 }, depth: { op: 'M+', val: 0.10 } }
      },
      adjacent: {
        dating: { pool: null, signal: null, matchQuality: null },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      },
      opposite: {
        dating: { pool: { op: 'F', val: 0.80 }, signal: { op: 'M-', val: 0.15 }, matchQuality: { op: 'M-', val: 0.20 } },
        relationship: { ceiling: { op: 'CAP', val: 0.85 }, floor: { op: 'M-', val: 0.10 }, resilience: { op: 'M-', val: 0.15 }, depth: { op: 'CAP', val: 0.80 } }
      }
    },
    
    adjacencyMap: {
      conservative: { same: ['conservative'], adjacent: ['moderate'], opposite: ['liberal'] },
      moderate: { same: ['moderate'], adjacent: ['conservative', 'liberal'], opposite: [] },
      liberal: { same: ['liberal'], adjacent: ['moderate'], opposite: ['conservative'] },
      apolitical: { same: ['apolitical'], adjacent: ['moderate'], opposite: [] }
    },
    
    actions: {
      primary: { type: 'REFRAME', description: 'Filter earlier for political alignment' }
    }
  },
  
  // --------------------------------------------------------------------------
  // SMOKING (Changeable)
  // --------------------------------------------------------------------------
  smoking: {
    id: 'smoking',
    name: 'Smoking',
    description: 'Smoking status affecting dating pool',
    changeability: 'CHANGEABLE',
    userInputType: 'select',
    
    cbsaKeys: {
      nationalPercentages: {
        no: 'smoking_no_cbsa',
        yes: 'smoking_yes_cbsa'
      },
      localWeight: 'smoking_cbsa'
    },
    
    options: [
      { value: 'no', key: 'smoking_no_cbsa', label: 'No' },
      { value: 'yes', key: 'smoking_yes_cbsa', label: 'Yes' }
    ],
    
    effects: {
      no: {
        dating: { pool: null, signal: null, matchQuality: null },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      },
      yes: {
        dating: { pool: { op: 'F', val: 0.70 }, signal: { op: 'M-', val: 0.20 }, matchQuality: { op: 'M-', val: 0.05 } },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      }
    },
    
    actions: {
      primary: { type: 'CHANGE', description: 'Quit smoking' }
    },
    
    movementResults: {
      'yes_to_no': {
        dating: ['POOL_EXPANSION', 'SIGNAL_BOOST', 'FILTER_REMOVAL'],
        relationship: []
      }
    }
  },
  
  // --------------------------------------------------------------------------
  // DRUGS (Changeable)
  // --------------------------------------------------------------------------
  drugs: {
    id: 'drugs',
    name: 'Drug Use',
    description: 'Recreational drug use affecting dating and relationships',
    changeability: 'CHANGEABLE',
    userInputType: 'select',
    
    cbsaKeys: {
      nationalPercentages: {
        no: 'drugs_no_cbsa',
        yes: 'drugs_yes_cbsa'
      }
    },
    
    options: [
      { value: 'no', key: 'drugs_no_cbsa', label: 'No' },
      { value: 'yes', key: 'drugs_yes_cbsa', label: 'Yes' }
    ],
    
    effects: {
      no: {
        dating: { pool: null, signal: null, matchQuality: null },
        relationship: { ceiling: null, floor: null, resilience: null, depth: null }
      },
      yes: {
        dating: { pool: { op: 'F', val: 0.80 }, signal: { op: 'V', val: 0.15 }, matchQuality: null },
        relationship: { ceiling: null, floor: { op: 'M-', val: 0.10 }, resilience: { op: 'M-', val: 0.15 }, depth: null }
      }
    },
    
    actions: {
      primary: { type: 'CHANGE', description: 'Address substance use' }
    }
  },
  
  // --------------------------------------------------------------------------
  // RELATIONSHIP STATUS (Contextual)
  // --------------------------------------------------------------------------
  relationshipStatus: {
    id: 'relationshipStatus',
    name: 'Relationship Status',
    description: 'Current relationship status',
    changeability: 'CONTEXTUAL',
    userInputType: 'select',
    
    cbsaKeys: {
      nationalPercentages: {
        single: 'relationship_single_cbsa',
        dating: 'relationship_dating_cbsa',
        separated: 'relationship_separated_cbsa',
        married: 'relationship_married_cbsa'
      },
      localWeight: 'single_18_65_cbsa'
    },
    
    options: [
      { value: 'single', key: 'relationship_single_cbsa', label: 'Single' },
      { value: 'dating', key: 'relationship_dating_cbsa', label: 'Dating' },
      { value: 'separated', key: 'relationship_separated_cbsa', label: 'Separated' },
      { value: 'married', key: 'relationship_married_cbsa', label: 'Married' }
    ],
    
    // Used for context determination and pool calculation
    contextDetermination: true,
    determinesContext: {
      single: 'DATING',
      dating: 'RELATIONSHIP',
      separated: 'DATING',
      married: 'RELATIONSHIP'
    }
  }
};

// ============================================================================
// PERSONA-MODIFIER INTERACTION WEIGHTS
// ============================================================================
// 
// These weights indicate how much a modifier matters for a specific persona.
// 1.0 = standard effect
// <1.0 = modifier matters LESS (persona is already strong or not core)
// >1.0 = modifier matters MORE (weakness or core need for growth)
// 
// Example: Gladiator has 1.4 weight on Empathy because it's his growth edge
// Example: Therapist has 0.7 on Empathy because she's already strong there

const PERSONA_MODIFIER_WEIGHTS = {
  
  // M2 MEN PERSONAS
  M2_ACEG: { // Gladiator
    attachment: 1.0, communication: 1.3, empathy: 1.4, problemSolving: 1.1,
    stressManagement: 1.2, shameResilience: 1.2, selfAwareness: 1.1,
    fitness: 0.8, income: 1.0, height: 0.9
  },
  M2_ACEH: { // Maverick
    attachment: 1.1, communication: 1.0, empathy: 1.2, problemSolving: 1.0,
    stressManagement: 1.0, shameResilience: 1.0, selfAwareness: 1.0,
    fitness: 0.9, income: 0.9, height: 1.0
  },
  M2_ACFG: { // Spy
    attachment: 1.3, communication: 1.2, empathy: 1.3, problemSolving: 0.9,
    stressManagement: 0.9, shameResilience: 1.2, selfAwareness: 1.0,
    fitness: 0.9, income: 1.0, height: 1.0
  },
  M2_ACFH: { // Engineer
    attachment: 1.0, communication: 1.2, empathy: 1.3, problemSolving: 0.9,
    stressManagement: 1.0, shameResilience: 1.1, selfAwareness: 1.0,
    fitness: 1.1, income: 1.1, height: 1.1
  },
  M2_ADEG: { // Cowboy
    attachment: 1.0, communication: 1.4, empathy: 1.3, problemSolving: 1.0,
    stressManagement: 1.0, shameResilience: 1.1, selfAwareness: 1.2,
    fitness: 1.0, income: 1.1, height: 1.0
  },
  M2_ADEH: { // Sherpa
    attachment: 1.0, communication: 1.1, empathy: 0.8, problemSolving: 1.0,
    stressManagement: 0.9, shameResilience: 1.0, selfAwareness: 0.9,
    fitness: 1.0, income: 1.0, height: 1.1
  },
  M2_ADFG: { // Curator
    attachment: 1.1, communication: 1.1, empathy: 1.1, problemSolving: 1.0,
    stressManagement: 1.0, shameResilience: 1.1, selfAwareness: 1.0,
    fitness: 1.0, income: 1.1, height: 1.0
  },
  M2_ADFH: { // Recruiter
    attachment: 1.0, communication: 0.9, empathy: 0.9, problemSolving: 1.0,
    stressManagement: 1.0, shameResilience: 1.0, selfAwareness: 0.9,
    fitness: 1.0, income: 1.0, height: 1.1
  },
  M2_BCEG: { // Legionnaire
    attachment: 1.0, communication: 1.2, empathy: 1.2, problemSolving: 1.0,
    stressManagement: 0.9, shameResilience: 1.1, selfAwareness: 1.0,
    fitness: 0.9, income: 1.0, height: 0.9
  },
  M2_BCEH: { // Astronaut
    attachment: 1.0, communication: 1.0, empathy: 1.1, problemSolving: 0.9,
    stressManagement: 0.9, shameResilience: 1.0, selfAwareness: 0.9,
    fitness: 1.0, income: 1.0, height: 1.0
  },
  M2_BCFG: { // Statesman
    attachment: 1.1, communication: 1.1, empathy: 1.2, problemSolving: 0.9,
    stressManagement: 0.9, shameResilience: 1.1, selfAwareness: 1.0,
    fitness: 1.0, income: 0.9, height: 0.9
  },
  M2_BCFH: { // Professor
    attachment: 1.0, communication: 1.1, empathy: 1.2, problemSolving: 0.9,
    stressManagement: 1.0, shameResilience: 1.0, selfAwareness: 0.9,
    fitness: 1.2, income: 1.0, height: 1.1
  },
  M2_BDEG: { // Ranger
    attachment: 1.0, communication: 1.3, empathy: 1.2, problemSolving: 1.0,
    stressManagement: 0.9, shameResilience: 1.0, selfAwareness: 1.1,
    fitness: 0.9, income: 1.1, height: 1.0
  },
  M2_BDEH: { // Playwright
    attachment: 1.0, communication: 0.9, empathy: 0.9, problemSolving: 1.0,
    stressManagement: 1.1, shameResilience: 1.0, selfAwareness: 0.8,
    fitness: 1.1, income: 1.1, height: 1.1
  },
  M2_BDFG: { // Arborist
    attachment: 1.0, communication: 1.2, empathy: 1.1, problemSolving: 1.0,
    stressManagement: 0.9, shameResilience: 1.0, selfAwareness: 1.0,
    fitness: 1.0, income: 1.0, height: 1.0
  },
  M2_BDFH: { // Builder
    attachment: 1.0, communication: 1.1, empathy: 1.0, problemSolving: 0.9,
    stressManagement: 1.0, shameResilience: 1.0, selfAwareness: 0.9,
    fitness: 1.1, income: 1.0, height: 1.1
  },
  
  // W2 WOMEN PERSONAS
  W2_ACEG: { // Debutante
    attachment: 1.2, communication: 1.0, empathy: 1.0, problemSolving: 1.2,
    stressManagement: 1.1, shameResilience: 1.3, selfAwareness: 1.2,
    fitness: 0.8, income: 1.0
  },
  W2_ACEH: { // Correspondent
    attachment: 1.1, communication: 1.0, empathy: 1.0, problemSolving: 1.0,
    stressManagement: 1.0, shameResilience: 1.0, selfAwareness: 1.0,
    fitness: 0.9, income: 0.9
  },
  W2_ACFG: { // Duchess
    attachment: 1.2, communication: 1.1, empathy: 1.2, problemSolving: 1.0,
    stressManagement: 0.9, shameResilience: 1.1, selfAwareness: 1.0,
    fitness: 0.9, income: 1.0
  },
  W2_ACFH: { // Influencer
    attachment: 1.1, communication: 0.9, empathy: 1.1, problemSolving: 1.0,
    stressManagement: 1.0, shameResilience: 1.2, selfAwareness: 1.1,
    fitness: 0.8, income: 0.9
  },
  W2_ADEG: { // Barrel Racer
    attachment: 1.0, communication: 1.0, empathy: 1.0, problemSolving: 1.0,
    stressManagement: 1.0, shameResilience: 1.0, selfAwareness: 1.0,
    fitness: 0.8, income: 1.0
  },
  W2_ADEH: { // Podcaster
    attachment: 1.0, communication: 0.8, empathy: 1.0, problemSolving: 1.0,
    stressManagement: 1.0, shameResilience: 1.0, selfAwareness: 0.9,
    fitness: 0.9, income: 0.9
  },
  W2_ADFG: { // Trophy
    attachment: 1.3, communication: 1.0, empathy: 1.0, problemSolving: 1.2,
    stressManagement: 1.1, shameResilience: 1.4, selfAwareness: 1.3,
    fitness: 0.7, income: 1.1
  },
  W2_ADFH: { // Girl Next Door
    attachment: 1.0, communication: 1.0, empathy: 1.0, problemSolving: 1.0,
    stressManagement: 1.0, shameResilience: 1.0, selfAwareness: 1.0,
    fitness: 1.0, income: 1.0
  },
  W2_BCEG: { // Party Planner
    attachment: 1.0, communication: 0.9, empathy: 1.1, problemSolving: 0.9,
    stressManagement: 1.2, shameResilience: 1.1, selfAwareness: 1.1,
    fitness: 0.9, income: 1.0
  },
  W2_BCEH: { // Marketer
    attachment: 1.0, communication: 0.9, empathy: 1.0, problemSolving: 0.9,
    stressManagement: 1.1, shameResilience: 1.1, selfAwareness: 1.0,
    fitness: 1.0, income: 0.9
  },
  W2_BCFG: { // Executive
    attachment: 1.1, communication: 1.0, empathy: 1.2, problemSolving: 0.9,
    stressManagement: 0.9, shameResilience: 1.1, selfAwareness: 1.0,
    fitness: 1.0, income: 0.9
  },
  W2_BCFH: { // Producer
    attachment: 1.0, communication: 1.1, empathy: 1.0, problemSolving: 0.9,
    stressManagement: 1.0, shameResilience: 1.1, selfAwareness: 1.1,
    fitness: 1.0, income: 1.0
  },
  W2_BDEG: { // Coach
    attachment: 1.0, communication: 0.9, empathy: 1.0, problemSolving: 0.9,
    stressManagement: 1.0, shameResilience: 1.0, selfAwareness: 0.9,
    fitness: 0.8, income: 1.0
  },
  W2_BDEH: { // Founder
    attachment: 1.0, communication: 0.9, empathy: 1.1, problemSolving: 0.9,
    stressManagement: 1.1, shameResilience: 1.0, selfAwareness: 1.0,
    fitness: 1.0, income: 0.8
  },
  W2_BDFG: { // Designer
    attachment: 1.0, communication: 1.0, empathy: 1.0, problemSolving: 1.0,
    stressManagement: 1.1, shameResilience: 1.0, selfAwareness: 1.0,
    fitness: 1.0, income: 1.0
  },
  W2_BDFH: { // Therapist
    attachment: 0.9, communication: 0.8, empathy: 0.7, problemSolving: 0.9,
    stressManagement: 0.9, shameResilience: 0.8, selfAwareness: 0.8,
    fitness: 1.2, income: 1.1
  }
};

// ============================================================================
// MODIFIER FUNCTIONAL CATEGORIES
// ============================================================================

const MODIFIER_CATEGORIES = {
  
  // GATE MODIFIERS - Primarily affect who you can access
  gate: {
    description: 'Primarily affect pool size and access',
    modifiers: ['location', 'age', 'height', 'fitness', 'bmi', 'income', 'education', 'haveKids', 'wantKids', 'smoking', 'drugs'],
    coachability: 'LOW_TO_MODERATE',
    primaryContext: 'DATING'
  },
  
  // SIGNAL MODIFIERS - Primarily affect how you're perceived
  signal: {
    description: 'Primarily affect first impressions and attraction',
    modifiers: ['fitness', 'income', 'education', 'smoking', 'communication', 'selfAwareness'],
    coachability: 'MODERATE',
    primaryContext: 'DATING'
  },
  
  // QUALITY MODIFIERS - Primarily affect relationship depth/success
  quality: {
    description: 'Primarily affect relationship outcomes once matched',
    modifiers: ['attachment', 'communication', 'empathy', 'problemSolving', 'stressManagement', 'shameResilience', 'selfAwareness'],
    coachability: 'HIGH',
    primaryContext: 'RELATIONSHIP'
  },
  
  // FOUNDATIONAL MODIFIERS - Other modifiers don't work without these
  foundational: {
    description: 'Must be addressed for other improvements to matter',
    modifiers: ['attachment', 'shameResilience', 'selfAwareness'],
    coachability: 'HIGH_PRIORITY',
    primaryContext: 'BOTH'
  }
};

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Apply a single effect operation
 * @param {number} baseValue - The base score/pool to modify
 * @param {object} effect - Effect object with {op, val}
 * @returns {number} Modified value
 */
function applyEffect(baseValue, effect) {
  if (!effect || effect.op === null) return baseValue;
  
  const operation = EFFECT_OPERATIONS[effect.op];
  if (!operation) return baseValue;
  
  return operation.calculate(baseValue, effect.val);
}

/**
 * Get the level key for a skill modifier based on numeric score (1-10)
 * @param {string} modifierId - The modifier ID
 * @param {number} score - Score 1-10
 * @returns {string} Level key (e.g., 'low', 'medium', 'high', 'exceptional')
 */
function getSkillLevel(modifierId, score) {
  const modifier = SKILL_MODIFIERS[modifierId];
  if (!modifier || !modifier.levels) return null;
  
  // For attachment, it's categorical not numeric
  if (modifierId === 'attachment') {
    return score; // Already a level key like 'secure', 'anxious', etc.
  }
  
  // For 1-10 scale modifiers
  for (const [levelKey, levelDef] of Object.entries(modifier.levels)) {
    if (score >= levelDef.min && score <= levelDef.max) {
      return levelKey;
    }
  }
  return 'medium'; // Default
}

/**
 * Get the bracket/level for a demographic modifier
 * @param {string} modifierId - The modifier ID
 * @param {*} value - The user's value
 * @param {object} options - Additional context (gender, values G/H, percentile)
 * @returns {string} Level/bracket key
 */
function getDemographicLevel(modifierId, value, options = {}) {
  const modifier = DEMOGRAPHIC_MODIFIERS[modifierId];
  if (!modifier) return null;
  
  // For select-type modifiers with direct options
  if (modifier.options) {
    const option = modifier.options.find(o => o.value === value || o.label === value);
    return option ? option.value : value;
  }
  
  // For percentile-based modifiers (age, income)
  if (options.percentile !== undefined) {
    if (options.percentile <= 20) return 'bottom20';
    if (options.percentile <= 40) return '20_40';
    if (options.percentile <= 60) return '40_60';
    if (options.percentile <= 80) return '60_80';
    return 'top20';
  }
  
  // For bracket-based modifiers (BMI, height)
  if (modifier.brackets) {
    for (const bracket of modifier.brackets) {
      if (value <= bracket.max) {
        return bracket.category || bracket.label;
      }
    }
  }
  
  return null;
}

/**
 * Get effects for a specific modifier at a specific level
 * @param {string} modifierId - The modifier ID
 * @param {string} level - The level key
 * @param {string} context - 'dating' or 'relationship'
 * @param {object} options - Additional context (gender, values)
 * @returns {object} Effects object {pool, signal, matchQuality} or {ceiling, floor, resilience, depth}
 */
function getModifierEffects(modifierId, level, context, options = {}) {
  // Check skill modifiers first
  let modifier = SKILL_MODIFIERS[modifierId];
  if (modifier && modifier.effects && modifier.effects[level]) {
    return modifier.effects[level][context] || {};
  }
  
  // Check demographic modifiers
  modifier = DEMOGRAPHIC_MODIFIERS[modifierId];
  if (!modifier || !modifier.effects) return {};
  
  let effects = modifier.effects;
  
  // Handle gender-differentiated effects
  if (modifier.genderDifferentiated && options.gender) {
    const genderKey = options.gender === 'Man' ? 'man' : 'woman';
    effects = effects[genderKey] || effects;
  }
  
  // Handle values-differentiated effects (Traditional G vs Egalitarian H)
  if (modifier.valuesDifferentiated && options.values) {
    const valuesKey = options.values === 'G' ? 'traditional' : 'egalitarian';
    effects = effects[valuesKey] || effects;
  }
  
  // Get level-specific effects
  if (effects[level]) {
    return effects[level][context] || {};
  }
  
  return {};
}

/**
 * Calculate combined effects across all user modifiers for a specific dimension
 * @param {object} userModifiers - User's modifier levels {attachment: 'secure', communication: 7, ...}
 * @param {string} context - 'dating' or 'relationship'
 * @param {string} dimension - 'pool', 'signal', 'matchQuality', 'ceiling', 'floor', 'resilience', 'depth'
 * @param {object} options - {gender, values, persona}
 * @returns {object} Combined effect {multiplier, additive, cap, floor, filter}
 */
function calculateCombinedEffects(userModifiers, context, dimension, options = {}) {
  const result = {
    multiplier: 1.0,      // Product of all M+ and M- effects
    additive: 0,          // Sum of all A+ and A- effects
    cap: null,            // Minimum of all CAP effects
    floor: null,          // Maximum of all FLR effects
    filter: 1.0,          // Product of all F effects
    volatility: 0,        // Sum of all V variances
    contributors: []      // Track what contributed
  };
  
  // Process skill modifiers
  for (const [modId, level] of Object.entries(userModifiers.skills || {})) {
    const levelKey = typeof level === 'number' ? getSkillLevel(modId, level) : level;
    const effects = getModifierEffects(modId, levelKey, context, options);
    
    if (effects && effects[dimension]) {
      const effect = effects[dimension];
      const personaWeight = getPersonaWeight(options.persona, modId);
      
      applyEffectToResult(result, effect, personaWeight, modId, levelKey);
    }
  }
  
  // Process demographic modifiers
  for (const [modId, value] of Object.entries(userModifiers.demographics || {})) {
    const levelKey = getDemographicLevel(modId, value, options);
    if (!levelKey) continue;
    
    const effects = getModifierEffects(modId, levelKey, context, options);
    
    if (effects && effects[dimension]) {
      const effect = effects[dimension];
      const personaWeight = getPersonaWeight(options.persona, modId);
      
      applyEffectToResult(result, effect, personaWeight, modId, levelKey);
    }
  }
  
  return result;
}

/**
 * Helper to apply a single effect to the combined result
 */
function applyEffectToResult(result, effect, personaWeight = 1.0, modId, levelKey) {
  if (!effect || effect.op === null) return;
  
  const weightedVal = effect.val * personaWeight;
  
  switch (effect.op) {
    case 'M+':
      result.multiplier *= (1 + weightedVal);
      result.contributors.push({ mod: modId, level: levelKey, op: 'M+', val: weightedVal });
      break;
    case 'M-':
      result.multiplier *= (1 - weightedVal);
      result.contributors.push({ mod: modId, level: levelKey, op: 'M-', val: -weightedVal });
      break;
    case 'A+':
      result.additive += weightedVal;
      result.contributors.push({ mod: modId, level: levelKey, op: 'A+', val: weightedVal });
      break;
    case 'A-':
      result.additive -= weightedVal;
      result.contributors.push({ mod: modId, level: levelKey, op: 'A-', val: -weightedVal });
      break;
    case 'CAP':
      result.cap = result.cap === null ? effect.val : Math.min(result.cap, effect.val);
      result.contributors.push({ mod: modId, level: levelKey, op: 'CAP', val: effect.val });
      break;
    case 'FLR':
      result.floor = result.floor === null ? effect.val : Math.max(result.floor, effect.val);
      result.contributors.push({ mod: modId, level: levelKey, op: 'FLR', val: effect.val });
      break;
    case 'F':
      result.filter *= weightedVal;
      result.contributors.push({ mod: modId, level: levelKey, op: 'F', val: weightedVal });
      break;
    case 'V':
      result.volatility += weightedVal;
      result.contributors.push({ mod: modId, level: levelKey, op: 'V', val: weightedVal });
      break;
  }
}

/**
 * Get persona weight for a specific modifier
 */
function getPersonaWeight(persona, modifierId) {
  if (!persona) return 1.0;
  const weights = PERSONA_MODIFIER_WEIGHTS[persona];
  if (!weights) return 1.0;
  return weights[modifierId] || 1.0;
}

/**
 * Apply combined modifier effects to a base value
 * Order: Filter â†’ Multiplier â†’ Additive â†’ Cap â†’ Floor
 */
function applyAllEffects(baseValue, combinedEffects) {
  let value = baseValue;
  
  // Apply filter first (for pool calculations)
  value *= combinedEffects.filter;
  
  // Apply multipliers
  value *= combinedEffects.multiplier;
  
  // Apply additives
  value += combinedEffects.additive;
  
  // Apply cap (ceiling)
  if (combinedEffects.cap !== null) {
    value = Math.min(value, combinedEffects.cap * 100); // Caps are stored as decimals
  }
  
  // Apply floor
  if (combinedEffects.floor !== null) {
    value = Math.max(value, combinedEffects.floor * 100);
  }
  
  // Apply volatility (random variance for display purposes)
  if (combinedEffects.volatility > 0) {
    // Store the range rather than applying randomness
    value = { 
      base: value, 
      variance: combinedEffects.volatility,
      min: value * (1 - combinedEffects.volatility),
      max: value * (1 + combinedEffects.volatility)
    };
  }
  
  return value;
}

// ============================================================================
// RELATE SCORE INTEGRATION
// ============================================================================

/**
 * Convert raw Relate Score (0-100) to display format (X.X/10)
 */
function formatRelateScore(rawScore) {
  const scaledScore = rawScore / 10;
  return {
    raw: rawScore,
    display: scaledScore.toFixed(1),
    formatted: `${scaledScore.toFixed(1)}/10`,
    tier: getRelateTier(rawScore)
  };
}

/**
 * Get tier label for Relate Score
 */
function getRelateTier(rawScore) {
  if (rawScore >= 85) return { label: 'Exceptional', color: 'gold' };
  if (rawScore >= 70) return { label: 'Strong', color: 'green' };
  if (rawScore >= 55) return { label: 'Average', color: 'blue' };
  if (rawScore >= 40) return { label: 'Below Average', color: 'orange' };
  return { label: 'Challenging', color: 'red' };
}

/**
 * Apply modifier effects to Relate Score
 * @param {number} baseRelateScore - Raw score from demographics engine (0-100)
 * @param {object} userModifiers - User's modifier levels
 * @param {object} options - {persona, gender, values}
 * @returns {object} Adjusted score with breakdown
 */
function applyModifiersToRelateScore(baseRelateScore, userModifiers, options = {}) {
  // Get signal effects (what impacts how you're perceived)
  const signalEffects = calculateCombinedEffects(userModifiers, 'dating', 'signal', options);
  
  // Get match quality effects (what impacts who you attract)
  const qualityEffects = calculateCombinedEffects(userModifiers, 'dating', 'matchQuality', options);
  
  // Apply signal effects to base score
  let adjustedScore = baseRelateScore * signalEffects.multiplier + signalEffects.additive;
  
  // Clamp to 0-100
  adjustedScore = Math.max(0, Math.min(100, adjustedScore));
  
  return {
    base: baseRelateScore,
    adjusted: adjustedScore,
    formatted: formatRelateScore(adjustedScore),
    signalEffect: {
      multiplier: signalEffects.multiplier,
      additive: signalEffects.additive,
      contributors: signalEffects.contributors.filter(c => c.op === 'M+' || c.op === 'M-' || c.op === 'A+' || c.op === 'A-')
    },
    qualityEffect: {
      multiplier: qualityEffects.multiplier,
      contributors: qualityEffects.contributors
    }
  };
}

// ============================================================================
// MATCH POOL INTEGRATION
// ============================================================================

/**
 * Apply modifier effects to all three match pool tiers
 * @param {object} matchPoolResult - From demographics engine {localSinglePool, realisticPool, preferredPool, idealPool}
 * @param {object} userModifiers - User's modifier levels
 * @param {object} options - {persona, gender, values}
 * @returns {object} Adjusted pools with breakdown
 */
function applyModifiersToMatchPool(matchPoolResult, userModifiers, options = {}) {
  // Get pool effects (filters that expand or contract pool)
  const poolEffects = calculateCombinedEffects(userModifiers, 'dating', 'pool', options);
  
  // Apply to each tier
  const adjustedRealistic = Math.round(matchPoolResult.realisticPool * poolEffects.filter * poolEffects.multiplier);
  const adjustedPreferred = Math.round(matchPoolResult.preferredPool * poolEffects.filter * poolEffects.multiplier);
  const adjustedIdeal = Math.round(matchPoolResult.idealPool * poolEffects.filter * poolEffects.multiplier);
  
  return {
    localSinglePool: matchPoolResult.localSinglePool, // Unaffected by modifiers
    realistic: {
      base: matchPoolResult.realisticPool,
      adjusted: adjustedRealistic,
      change: adjustedRealistic - matchPoolResult.realisticPool,
      changePercent: ((adjustedRealistic / matchPoolResult.realisticPool) - 1) * 100
    },
    preferred: {
      base: matchPoolResult.preferredPool,
      adjusted: adjustedPreferred,
      change: adjustedPreferred - matchPoolResult.preferredPool,
      changePercent: ((adjustedPreferred / matchPoolResult.preferredPool) - 1) * 100
    },
    ideal: {
      base: matchPoolResult.idealPool,
      adjusted: adjustedIdeal,
      change: adjustedIdeal - matchPoolResult.idealPool,
      changePercent: ((adjustedIdeal / matchPoolResult.idealPool) - 1) * 100
    },
    poolEffect: {
      filter: poolEffects.filter,
      multiplier: poolEffects.multiplier,
      contributors: poolEffects.contributors
    }
  };
}

// ============================================================================
// COMPATIBILITY INTEGRATION
// ============================================================================

/**
 * Adjust compatibility tier success probability with modifier effects
 * @param {string} tier - 'ideal', 'kismet', 'effort', 'longShot', 'atRisk', 'incompatible'
 * @param {object} userModifiers - User's modifier levels
 * @param {object} partnerModifiers - Partner's modifier levels (if known)
 * @param {object} options - {persona, partnerPersona, gender, values}
 * @returns {object} Adjusted success probability
 */
function adjustCompatibilitySuccess(tier, userModifiers, partnerModifiers = null, options = {}) {
  // Base probability from tier
  const tierKey = tier.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  const baseProbability = {
    ideal: 0.80,
    kismet: 0.65,
    effort: 0.45,
    long_shot: 0.25,
    at_risk: 0.10,
    incompatible: 0.02
  }[tierKey] || 0.50;
  
  // Get match quality effects from user
  const userQuality = calculateCombinedEffects(userModifiers, 'dating', 'matchQuality', options);
  
  // If partner modifiers known, factor them in
  let partnerQuality = { multiplier: 1.0 };
  if (partnerModifiers) {
    partnerQuality = calculateCombinedEffects(partnerModifiers, 'dating', 'matchQuality', {
      ...options,
      persona: options.partnerPersona,
      gender: options.gender === 'Man' ? 'Woman' : 'Man'
    });
  }
  
  // Combined effect (geometric mean of both parties)
  const combinedMultiplier = Math.sqrt(userQuality.multiplier * partnerQuality.multiplier);
  
  // Apply to base probability
  let adjustedProbability = baseProbability * combinedMultiplier;
  
  // Clamp to reasonable bounds
  adjustedProbability = Math.max(0.01, Math.min(0.95, adjustedProbability));
  
  return {
    tier,
    baseProbability,
    adjustedProbability,
    percentageDisplay: (adjustedProbability * 100).toFixed(0) + '%',
    userContribution: userQuality.multiplier,
    partnerContribution: partnerQuality.multiplier,
    combinedMultiplier,
    improvement: adjustedProbability - baseProbability
  };
}

// ============================================================================
// RELATIONSHIP CAPACITY
// ============================================================================

/**
 * Calculate relationship capacity metrics (ceiling, floor, resilience, depth)
 * @param {object} userModifiers - User's modifier levels
 * @param {object} partnerModifiers - Partner's modifier levels (if known)
 * @param {object} options - {persona, partnerPersona}
 * @returns {object} Capacity metrics
 */
function calculateRelationshipCapacity(userModifiers, partnerModifiers = null, options = {}) {
  const dimensions = ['ceiling', 'floor', 'resilience', 'depth'];
  const capacity = {};
  
  for (const dim of dimensions) {
    const userEffects = calculateCombinedEffects(userModifiers, 'relationship', dim, options);
    
    let baseValue = dim === 'floor' ? 0 : 100; // Floor starts at 0, others at 100
    let userValue = applyAllEffects(baseValue, userEffects);
    
    // Handle volatility object
    if (typeof userValue === 'object') {
      userValue = userValue.base;
    }
    
    let partnerValue = userValue;
    let combinedValue = userValue;
    
    // If partner known, calculate their capacity and take the minimum (weakest link)
    if (partnerModifiers) {
      const partnerEffects = calculateCombinedEffects(partnerModifiers, 'relationship', dim, {
        ...options,
        persona: options.partnerPersona
      });
      partnerValue = applyAllEffects(baseValue, partnerEffects);
      if (typeof partnerValue === 'object') {
        partnerValue = partnerValue.base;
      }
      
      // Relationship limited by weaker party
      combinedValue = Math.min(userValue, partnerValue);
    }
    
    capacity[dim] = {
      user: Math.round(userValue),
      partner: partnerModifiers ? Math.round(partnerValue) : null,
      combined: Math.round(combinedValue),
      percentage: Math.round(combinedValue) + '%',
      limitedBy: partnerModifiers && partnerValue < userValue ? 'partner' : 'user',
      contributors: userEffects.contributors,
      hasCap: userEffects.cap !== null
    };
  }
  
  // Overall relationship potential
  capacity.overall = {
    potential: Math.round((capacity.ceiling.combined + capacity.depth.combined) / 2),
    stability: Math.round((capacity.floor.combined + capacity.resilience.combined) / 2),
    summary: generateCapacitySummary(capacity)
  };
  
  return capacity;
}

/**
 * Generate human-readable capacity summary
 */
function generateCapacitySummary(capacity) {
  const issues = [];
  
  if (capacity.ceiling.hasCap) {
    issues.push(`Ceiling capped at ${capacity.ceiling.combined}%`);
  }
  if (capacity.depth.combined < 60) {
    issues.push(`Depth limited to ${capacity.depth.combined}%`);
  }
  if (capacity.resilience.combined < 50) {
    issues.push(`Low resilience (${capacity.resilience.combined}%)`);
  }
  if (capacity.floor.combined < 20) {
    issues.push(`Unstable floor (${capacity.floor.combined}%)`);
  }
  
  if (issues.length === 0) {
    return 'Strong relationship capacity across all dimensions';
  }
  
  return issues.join('; ');
}

// ============================================================================
// DEMOGRAPHICS CHANGEABILITY ANALYSIS
// ============================================================================

/**
 * Analyze user's demographic answers for changeability
 * @param {object} demographicAnswers - Raw answers from demographics engine
 * @returns {object} Categorized demographics with changeability and actions
 */
function analyzeDemographicChangeability(demographicAnswers) {
  const analysis = {
    fixed: [],
    changeable: [],
    semiFixed: [],
    contextual: []
  };
  
  const mappings = {
    // Fixed demographics
    age: { category: 'fixed', modifier: DEMOGRAPHIC_MODIFIERS.age },
    gender: { category: 'fixed', modifier: DEMOGRAPHIC_MODIFIERS.gender },
    height: { category: 'fixed', modifier: DEMOGRAPHIC_MODIFIERS.height },
    ethnicity: { category: 'fixed', modifier: DEMOGRAPHIC_MODIFIERS.ethnicity },
    orientation: { category: 'fixed', modifier: DEMOGRAPHIC_MODIFIERS.orientation },
    hasKids: { category: 'fixed', modifier: DEMOGRAPHIC_MODIFIERS.haveKids },
    
    // Changeable demographics
    bodyType: { category: 'changeable', modifier: DEMOGRAPHIC_MODIFIERS.bmi },
    fitness: { category: 'changeable', modifier: DEMOGRAPHIC_MODIFIERS.fitness },
    smoking: { category: 'changeable', modifier: DEMOGRAPHIC_MODIFIERS.smoking },
    
    // Semi-fixed (long timeline)
    income: { category: 'semiFixed', modifier: DEMOGRAPHIC_MODIFIERS.income },
    education: { category: 'semiFixed', modifier: DEMOGRAPHIC_MODIFIERS.education },
    
    // Contextual
    location: { category: 'contextual', modifier: DEMOGRAPHIC_MODIFIERS.location },
    wantKids: { category: 'semiFixed', modifier: DEMOGRAPHIC_MODIFIERS.wantKids },
    political: { category: 'semiFixed', modifier: DEMOGRAPHIC_MODIFIERS.political }
  };
  
  for (const [key, value] of Object.entries(demographicAnswers)) {
    const mapping = mappings[key];
    if (!mapping) continue;
    
    const item = {
      field: key,
      value: value,
      displayValue: formatDemographicValue(key, value),
      changeability: mapping.modifier?.changeability || 'FIXED',
      actions: mapping.modifier?.actions || null,
      currentEffect: null // Will be calculated separately
    };
    
    analysis[mapping.category].push(item);
  }
  
  return analysis;
}

/**
 * Format demographic value for display
 */
function formatDemographicValue(field, value) {
  if (field === 'income') {
    if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'k';
    return '$' + value;
  }
  if (field === 'age') return value + ' years old';
  return String(value);
}

// ============================================================================
// ROI PRIORITIZATION
// ============================================================================

/**
 * Calculate ROI for improving each modifier
 * @param {object} userModifiers - Current modifier levels
 * @param {object} options - {context: 'dating'|'relationship', persona, gender, values}
 * @returns {array} Sorted list of improvement opportunities by ROI
 */
function calculateROIPrioritization(userModifiers, options = {}) {
  const opportunities = [];
  const context = options.context || 'dating';
  
  // Analyze skill modifiers
  for (const [modId, modifier] of Object.entries(SKILL_MODIFIERS)) {
    const currentLevel = userModifiers.skills?.[modId];
    if (currentLevel === undefined) continue;
    
    const currentLevelKey = typeof currentLevel === 'number' ? getSkillLevel(modId, currentLevel) : currentLevel;
    const improvement = calculateImprovementPotential(modId, currentLevelKey, context, options);
    
    if (improvement) {
      opportunities.push({
        modifier: modId,
        name: modifier.name,
        type: 'skill',
        currentLevel: currentLevelKey,
        currentValue: currentLevel,
        targetLevel: improvement.targetLevel,
        changeability: modifier.changeability,
        ...improvement,
        personaWeight: getPersonaWeight(options.persona, modId),
        actions: modifier.actions
      });
    }
  }
  
  // Analyze changeable demographic modifiers
  const changeableDemos = ['fitness', 'bmi', 'smoking', 'drugs'];
  for (const modId of changeableDemos) {
    const modifier = DEMOGRAPHIC_MODIFIERS[modId];
    const currentValue = userModifiers.demographics?.[modId];
    if (currentValue === undefined) continue;
    
    const currentLevelKey = getDemographicLevel(modId, currentValue, options);
    const improvement = calculateImprovementPotential(modId, currentLevelKey, context, options);
    
    if (improvement) {
      opportunities.push({
        modifier: modId,
        name: modifier.name,
        type: 'demographic',
        currentLevel: currentLevelKey,
        currentValue: currentValue,
        targetLevel: improvement.targetLevel,
        changeability: modifier.changeability,
        ...improvement,
        personaWeight: getPersonaWeight(options.persona, modId),
        actions: modifier.actions
      });
    }
  }
  
  // Sort by weighted ROI (effect magnitude Ã— persona weight Ã— changeability factor)
  opportunities.sort((a, b) => {
    const aScore = a.totalEffect * a.personaWeight * getChangeabilityFactor(a.changeability);
    const bScore = b.totalEffect * b.personaWeight * getChangeabilityFactor(b.changeability);
    return bScore - aScore;
  });
  
  // Add rank
  opportunities.forEach((opp, idx) => opp.rank = idx + 1);
  
  return opportunities;
}

/**
 * Calculate potential improvement for a modifier
 */
function calculateImprovementPotential(modId, currentLevel, context, options) {
  const isSkill = !!SKILL_MODIFIERS[modId];
  const modifier = isSkill ? SKILL_MODIFIERS[modId] : DEMOGRAPHIC_MODIFIERS[modId];
  
  if (!modifier || !modifier.effects) return null;
  
  // Determine optimal level
  const levels = Object.keys(modifier.effects);
  const optimalLevels = isSkill ? ['exceptional', 'high', 'secure'] : ['daily', '4_6_days', 'elite', 'normal'];
  
  let targetLevel = null;
  for (const opt of optimalLevels) {
    if (levels.includes(opt)) {
      targetLevel = opt;
      break;
    }
  }
  
  if (!targetLevel || targetLevel === currentLevel) return null;
  
  // Calculate effect difference
  const currentEffects = getModifierEffects(modId, currentLevel, context, options);
  const targetEffects = getModifierEffects(modId, targetLevel, context, options);
  
  const dimensions = context === 'dating' 
    ? ['pool', 'signal', 'matchQuality'] 
    : ['ceiling', 'floor', 'resilience', 'depth'];
  
  let totalEffect = 0;
  const effectBreakdown = {};
  
  for (const dim of dimensions) {
    const currentEffect = currentEffects[dim]?.val || 0;
    const targetEffect = targetEffects[dim]?.val || 0;
    const currentOp = currentEffects[dim]?.op;
    const targetOp = targetEffects[dim]?.op;
    
    // Normalize to comparable values
    let delta = 0;
    if (currentOp === 'M-' && !targetOp) delta = currentEffect; // Removing penalty
    else if (currentOp === 'M-' && targetOp === 'M+') delta = currentEffect + targetEffect; // Penalty to bonus
    else if (!currentOp && targetOp === 'M+') delta = targetEffect; // Neutral to bonus
    else if (currentOp === 'F' && !targetOp) delta = (1 - currentEffect); // Removing filter
    else if (currentOp === 'CAP') delta = 0.20; // Removing cap is valuable
    
    effectBreakdown[dim] = delta;
    totalEffect += Math.abs(delta);
  }
  
  if (totalEffect === 0) return null;
  
  return {
    targetLevel,
    totalEffect,
    effectBreakdown,
    movementKey: `${currentLevel}_to_${targetLevel}`,
    results: modifier.movementResults?.[`${currentLevel}_to_${targetLevel}`] || null
  };
}

/**
 * Get changeability factor for ROI weighting
 */
function getChangeabilityFactor(changeability) {
  const factors = {
    'CHANGEABLE': 1.0,
    'SEMI_FIXED': 0.5,
    'FIXED': 0.1,
    'CONTEXTUAL': 0.7
  };
  return factors[changeability] || 0.5;
}

// ============================================================================
// MOVEMENT PROJECTION
// ============================================================================

/**
 * Project what changes if a modifier moves from one level to another
 * @param {string} modifierId - The modifier to project
 * @param {string} fromLevel - Current level
 * @param {string} toLevel - Target level
 * @param {object} currentScores - {relateScore, matchPool, successProbability}
 * @param {object} options - {persona, gender, values, context}
 * @returns {object} Projected changes
 */
function projectMovement(modifierId, fromLevel, toLevel, currentScores, options = {}) {
  const isSkill = !!SKILL_MODIFIERS[modifierId];
  const modifier = isSkill ? SKILL_MODIFIERS[modifierId] : DEMOGRAPHIC_MODIFIERS[modifierId];
  
  if (!modifier) return null;
  
  const fromEffects = getModifierEffects(modifierId, fromLevel, 'dating', options);
  const toEffects = getModifierEffects(modifierId, toLevel, 'dating', options);
  
  const projection = {
    modifier: modifierId,
    modifierName: modifier.name,
    from: fromLevel,
    to: toLevel,
    changes: {},
    summary: []
  };
  
  // Project Relate Score change
  if (currentScores.relateScore) {
    const fromSignal = fromEffects.signal?.val || 0;
    const toSignal = toEffects.signal?.val || 0;
    const fromOp = fromEffects.signal?.op;
    const toOp = toEffects.signal?.op;
    
    let signalDelta = 0;
    if (fromOp === 'M-' && toOp === 'M+') signalDelta = fromSignal + toSignal;
    else if (fromOp === 'M-') signalDelta = fromSignal;
    else if (toOp === 'M+') signalDelta = toSignal;
    
    const newRelate = currentScores.relateScore * (1 + signalDelta);
    projection.changes.relateScore = {
      from: currentScores.relateScore,
      to: Math.min(100, newRelate),
      delta: newRelate - currentScores.relateScore,
      formatted: {
        from: formatRelateScore(currentScores.relateScore).formatted,
        to: formatRelateScore(Math.min(100, newRelate)).formatted
      }
    };
    
    if (signalDelta > 0) {
      projection.summary.push(`Relate Score: ${formatRelateScore(currentScores.relateScore).display} â†’ ${formatRelateScore(newRelate).display}`);
    }
  }
  
  // Project Match Pool change
  if (currentScores.matchPool) {
    const fromPool = fromEffects.pool?.val || 1;
    const toPool = toEffects.pool?.val || 1;
    const fromOp = fromEffects.pool?.op;
    const toOp = toEffects.pool?.op;
    
    let poolMultiplier = 1;
    if (fromOp === 'F' && !toOp) poolMultiplier = 1 / fromPool;
    else if (fromOp === 'F' && toOp === 'M+') poolMultiplier = (1 + toPool) / fromPool;
    else if (!fromOp && toOp === 'M+') poolMultiplier = 1 + toPool;
    
    const newPool = Math.round(currentScores.matchPool * poolMultiplier);
    projection.changes.matchPool = {
      from: currentScores.matchPool,
      to: newPool,
      delta: newPool - currentScores.matchPool,
      percentChange: ((poolMultiplier - 1) * 100).toFixed(0) + '%'
    };
    
    if (poolMultiplier !== 1) {
      projection.summary.push(`Match Pool: ${currentScores.matchPool.toLocaleString()} â†’ ${newPool.toLocaleString()} (${projection.changes.matchPool.percentChange})`);
    }
  }
  
  // Get relationship effects
  const fromRelEffects = getModifierEffects(modifierId, fromLevel, 'relationship', options);
  const toRelEffects = getModifierEffects(modifierId, toLevel, 'relationship', options);
  
  // Check for ceiling changes
  if (fromRelEffects.ceiling?.op === 'CAP' && !toRelEffects.ceiling?.op) {
    projection.changes.ceiling = {
      removed: true,
      was: (fromRelEffects.ceiling.val * 100) + '%',
      now: 'Unlimited'
    };
    projection.summary.push(`Ceiling: ${projection.changes.ceiling.was} cap removed`);
  }
  
  // Check for depth changes
  if (fromRelEffects.depth?.op === 'CAP' && !toRelEffects.depth?.op) {
    projection.changes.depth = {
      removed: true,
      was: (fromRelEffects.depth.val * 100) + '%',
      now: 'Unlimited'
    };
    projection.summary.push(`Depth: ${projection.changes.depth.was} cap removed`);
  }
  
  // Get movement results
  const movementKey = `${fromLevel}_to_${toLevel}`;
  if (modifier.movementResults?.[movementKey]) {
    projection.results = modifier.movementResults[movementKey];
  }
  
  return projection;
}

// ============================================================================
// PROFILE GENERATION
// ============================================================================

/**
 * Generate complete modifier profile for report
 * @param {object} userModifiers - User's modifier levels
 * @param {object} demographicAnswers - Raw demographic answers
 * @param {object} options - {persona, gender, values, context, cbsaData}
 * @returns {object} Complete profile for report rendering
 */
function generateModifierProfile(userModifiers, demographicAnswers, options = {}) {
  const context = options.context || 'dating';
  
  // Analyze all modifiers
  const skillAnalysis = {};
  for (const [modId, level] of Object.entries(userModifiers.skills || {})) {
    const modifier = SKILL_MODIFIERS[modId];
    const levelKey = typeof level === 'number' ? getSkillLevel(modId, level) : level;
    const effects = getModifierEffects(modId, levelKey, context, options);
    
    skillAnalysis[modId] = {
      name: modifier.name,
      level: levelKey,
      value: level,
      displayLevel: modifier.levels[levelKey]?.label || levelKey,
      effects: effects,
      isStrength: isStrength(effects),
      isLimiter: isLimiter(effects),
      isNeutral: isNeutral(effects),
      personaWeight: getPersonaWeight(options.persona, modId),
      changeability: modifier.changeability
    };
  }
  
  // Categorize
  const strengths = Object.entries(skillAnalysis)
    .filter(([_, a]) => a.isStrength)
    .map(([id, a]) => ({ id, ...a }));
  
  const limiters = Object.entries(skillAnalysis)
    .filter(([_, a]) => a.isLimiter)
    .map(([id, a]) => ({ id, ...a }));
  
  const neutral = Object.entries(skillAnalysis)
    .filter(([_, a]) => a.isNeutral)
    .map(([id, a]) => ({ id, ...a }));
  
  // Get ROI prioritization
  const roi = calculateROIPrioritization(userModifiers, options);
  
  // Get demographic changeability
  const demographics = analyzeDemographicChangeability(demographicAnswers);
  
  // Calculate net effects
  const netSignal = calculateCombinedEffects(userModifiers, 'dating', 'signal', options);
  const netQuality = calculateCombinedEffects(userModifiers, 'dating', 'matchQuality', options);
  const netPool = calculateCombinedEffects(userModifiers, 'dating', 'pool', options);
  
  return {
    skills: skillAnalysis,
    strengths,
    limiters,
    neutral,
    roi: roi.slice(0, 5), // Top 5 opportunities
    demographics,
    netEffects: {
      signal: {
        multiplier: netSignal.multiplier,
        display: formatMultiplier(netSignal.multiplier),
        contributors: netSignal.contributors
      },
      matchQuality: {
        multiplier: netQuality.multiplier,
        display: formatMultiplier(netQuality.multiplier),
        contributors: netQuality.contributors
      },
      pool: {
        filter: netPool.filter,
        multiplier: netPool.multiplier,
        combined: netPool.filter * netPool.multiplier,
        display: formatMultiplier(netPool.filter * netPool.multiplier),
        contributors: netPool.contributors
      }
    },
    summary: generateProfileSummary(strengths, limiters, roi)
  };
}

/**
 * Check if effects indicate strength
 */
function isStrength(effects) {
  for (const dim of ['signal', 'matchQuality', 'pool', 'ceiling', 'resilience', 'depth']) {
    if (effects[dim]?.op === 'M+' || effects[dim]?.op === 'A+') return true;
  }
  return false;
}

/**
 * Check if effects indicate limiter
 */
function isLimiter(effects) {
  for (const dim of ['signal', 'matchQuality', 'pool', 'ceiling', 'resilience', 'depth']) {
    if (effects[dim]?.op === 'M-' || effects[dim]?.op === 'CAP' || effects[dim]?.op === 'F') return true;
  }
  return false;
}

/**
 * Check if effects are neutral
 */
function isNeutral(effects) {
  return !isStrength(effects) && !isLimiter(effects);
}

/**
 * Format multiplier for display
 */
function formatMultiplier(multiplier) {
  if (multiplier === 1) return 'Â±0%';
  const pct = ((multiplier - 1) * 100).toFixed(0);
  return multiplier > 1 ? `+${pct}%` : `${pct}%`;
}

/**
 * Generate profile summary text
 */
function generateProfileSummary(strengths, limiters, roi) {
  const parts = [];
  
  if (strengths.length > 0) {
    const strengthNames = strengths.slice(0, 3).map(s => s.name).join(', ');
    parts.push(`Strengths: ${strengthNames}`);
  }
  
  if (limiters.length > 0) {
    const limiterNames = limiters.slice(0, 2).map(l => l.name).join(', ');
    parts.push(`Limiting: ${limiterNames}`);
  }
  
  if (roi.length > 0) {
    parts.push(`Top priority: ${roi[0].name}`);
  }
  
  return parts.join('. ') + '.';
}

// ============================================================================
// COACHING RECOMMENDATIONS
// ============================================================================

/**
 * Generate coaching recommendations based on profile
 * @param {object} profile - From generateModifierProfile
 * @param {object} options - {persona, coachingLevel}
 * @returns {array} Prioritized recommendations
 */
function generateCoachingRecommendations(profile, options = {}) {
  const recommendations = [];
  const coachingLevel = options.coachingLevel || 1;
  
  // Address foundational issues first
  const foundational = ['attachment', 'shameResilience', 'selfAwareness'];
  for (const limiter of profile.limiters) {
    if (foundational.includes(limiter.id)) {
      recommendations.push({
        priority: 'CRITICAL',
        modifier: limiter.id,
        name: limiter.name,
        currentLevel: limiter.displayLevel,
        reason: 'Foundational - other improvements won\'t stick without addressing this',
        action: SKILL_MODIFIERS[limiter.id]?.actions?.primary,
        coachingLevel: 3, // Requires deep work
        timeframe: 'months_to_years'
      });
    }
  }
  
  // Add top ROI opportunities
  for (const opp of profile.roi.slice(0, 3)) {
    if (recommendations.find(r => r.modifier === opp.modifier)) continue;
    
    recommendations.push({
      priority: opp.rank === 1 ? 'HIGH' : 'MEDIUM',
      modifier: opp.modifier,
      name: opp.name,
      currentLevel: opp.currentLevel,
      targetLevel: opp.targetLevel,
      reason: `High ROI: ${formatMultiplier(1 + opp.totalEffect)} improvement potential`,
      action: opp.actions?.primary,
      coachingLevel: opp.type === 'skill' ? 2 : 1,
      timeframe: getTimeframe(opp.changeability)
    });
  }
  
  // Add demographic quick wins
  for (const demo of profile.demographics.changeable) {
    if (demo.currentEffect?.isLimiter) {
      recommendations.push({
        priority: 'MEDIUM',
        modifier: demo.field,
        name: demo.field,
        currentLevel: demo.displayValue,
        reason: 'Changeable demographic limiting your pool',
        action: DEMOGRAPHIC_MODIFIERS[demo.field]?.actions?.primary,
        coachingLevel: 1,
        timeframe: 'weeks_to_months'
      });
    }
  }
  
  // Filter by coaching level access
  return recommendations.filter(r => r.coachingLevel <= coachingLevel + 1);
}

/**
 * Get timeframe string for changeability
 */
function getTimeframe(changeability) {
  const timeframes = {
    'CHANGEABLE': 'weeks_to_months',
    'SEMI_FIXED': 'months_to_years',
    'FIXED': 'n/a',
    'CONTEXTUAL': 'immediate_to_months'
  };
  return timeframes[changeability] || 'variable';
}

// ============================================================================
// EXPORT
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Taxonomy/Data
    EFFECT_OPERATIONS,
    CHANGEABILITY,
    ACTION_TYPES,
    MOVEMENT_RESULTS,
    SKILL_MODIFIERS,
    DEMOGRAPHIC_MODIFIERS,
    PERSONA_MODIFIER_WEIGHTS,
    MODIFIER_CATEGORIES,
    
    // Core calculation functions
    applyEffect,
    getSkillLevel,
    getDemographicLevel,
    getModifierEffects,
    calculateCombinedEffects,
    applyAllEffects,
    getPersonaWeight,
    
    // Relate Score integration
    formatRelateScore,
    getRelateTier,
    applyModifiersToRelateScore,
    
    // Match Pool integration
    applyModifiersToMatchPool,
    
    // Compatibility integration
    adjustCompatibilitySuccess,
    
    // Relationship capacity
    calculateRelationshipCapacity,
    
    // Demographics analysis
    analyzeDemographicChangeability,
    formatDemographicValue,
    
    // ROI and movement
    calculateROIPrioritization,
    projectMovement,
    
    // Profile generation
    generateModifierProfile,
    generateCoachingRecommendations
  };
}
