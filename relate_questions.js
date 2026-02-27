// =============================================================================
// RELATE QUESTIONS - Consolidated Modules 1-4
// =============================================================================
//
// This file contains all assessment questions and scoring logic for RELATE.
//
// Source files consolidated:
// - relate_module1_questions.js (4,310 lines) - Who You Want
// - relate_module2_questions.js (4,501 lines) - Who Are You
// - relate_module3_questions.js (1,010 lines) - How You Connect
// - relate_module4_questions.js (1,873 lines) - When Things Get Hard
//
// Total questions: 340 per user (128 + 128 + 24 + 60)
//
// Conflict resolutions applied:
// - scoreDimension â†’ scoreM1Dimension (M1), scoreM2Dimension (M2)
// - getQuestionCounts â†’ getM1QuestionCounts (M1), getM2QuestionCounts (M2)
// - LIKERT_SCALE (M3/M4) â†’ LIKERT_SCALE_LABELS (shared)
// - REPORT_METADATA â†’ M3_REPORT_METADATA, M4_REPORT_METADATA
// - SCORING_CONFIG â†’ M3_SCORING_CONFIG, M4_SCORING_CONFIG
//
// =============================================================================

// =============================================================================
// SECTION 1: MODULE 1 - WHO YOU WANT
// =============================================================================


const QUESTION_TYPES = {
  DIRECT: 'direct',
  BEHAVIORAL: 'behavioral',
  FORCED_CHOICE: 'forced_choice'
};

const LIKERT_SCALE = {
  STRONGLY_DISAGREE: 1,
  DISAGREE: 2,
  NEUTRAL: 3,
  AGREE: 4,
  STRONGLY_AGREE: 5
};

const DIMENSIONS = {
  PHYSICAL: 'physical',
  SOCIAL: 'social',
  LIFESTYLE: 'lifestyle',
  VALUES: 'values'
};

// Men's Poles (what he wants in her)
const MEN_POLES = {
  physical: { A: 'Beauty', B: 'Confidence' },
  social: { A: 'Allure', B: 'Charm' },
  lifestyle: { A: 'Thrill', B: 'Peace' },
  values: { A: 'Traditional', B: 'Egalitarian' }
};

// Women's Poles (what she wants in him)
const WOMEN_POLES = {
  physical: { A: 'Fitness', B: 'Maturity' },
  social: { A: 'Leadership', B: 'Presence' },
  lifestyle: { A: 'Thrill', B: 'Peace' },
  values: { A: 'Traditional', B: 'Egalitarian' }
};

// =============================================================================
// MEN'S MODULE 1 QUESTIONS
// =============================================================================

const MEN_MODULE1_QUESTIONS = {

  // ===========================================================================
  // PHYSICAL DIMENSION: Beauty (A) vs Confidence (B)
  // 32 Questions: 12 Likert Direct + 8 Likert Behavioral + 12 Forced Choice
  // ===========================================================================

  physical: {
    dimension: 'physical',
    poleA: 'Beauty',
    poleB: 'Confidence',
    description: {
      poleA: 'Prioritizes physical appearance. How she looks is primary.',
      poleB: 'Prioritizes presence and self-assurance. How she carries herself is primary.'
    },

    // LIKERT DIRECT - POLE A (BEAUTY): 6 Questions
    likertDirect: {
      poleA: [
        {
          id: 'M1_PHY_A_D01',
          text: 'Physical appearance is one of the first things I notice about a potential partner.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_PHY_A_D02',
          text: 'I know within seconds whether I find someone physically attractive.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_PHY_A_D03',
          text: "A woman's looks significantly affect my level of romantic interest.",
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_PHY_A_D04',
          text: 'I have a clear physical type I am drawn to.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_PHY_A_D05',
          text: 'When I imagine my ideal partner, her physical appearance is vivid in my mind.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_PHY_A_D06',
          text: 'I have scrolled past dating profiles of interesting people because their photos did not attract me.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        }
      ],

      // LIKERT DIRECT - POLE B (CONFIDENCE): 6 Questions
      poleB: [
        {
          id: 'M1_PHY_B_D01',
          text: 'I am most attracted to how a woman carries herself, not her physical features.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_PHY_B_D02',
          text: 'A woman who is comfortable in her own skin is more attractive than a woman who is conventionally beautiful.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_PHY_B_D03',
          text: "I notice a woman's energy and presence before I notice her looks.",
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_PHY_B_D04',
          text: 'Self-assurance is more appealing to me than physical beauty.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_PHY_B_D05',
          text: 'A woman who knows who she is attracts me more than a woman who looks a certain way.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_PHY_B_D06',
          text: 'I have been deeply attracted to women others did not find physically remarkable.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        }
      ]
    },

    // LIKERT BEHAVIORAL: 8 Questions (4 per pole)
    likertBehavioral: {
      poleA: [
        {
          id: 'M1_PHY_A_B01',
          text: 'I have pursued someone primarily because of how attractive they were.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_PHY_A_B02',
          text: 'I have lost interest in someone after realizing they were less attractive than I first thought.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_PHY_A_B03',
          text: 'I have stayed in a relationship longer than I should have because my partner was beautiful.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_PHY_A_B04',
          text: 'I have chosen to approach someone based on their appearance before knowing anything else about them.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        }
      ],

      poleB: [
        {
          id: 'M1_PHY_B_B01',
          text: 'I have been attracted to women others did not notice because of how they carried themselves.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_PHY_B_B02',
          text: 'I have lost interest in a beautiful woman because she seemed insecure.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_PHY_B_B03',
          text: 'I have been drawn to someone specifically because they seemed completely at ease with themselves.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_PHY_B_B04',
          text: 'I have pursued someone who was not my usual physical type because their presence captivated me.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        }
      ]
    },

    // FORCED CHOICE: 12 Questions
    forcedChoice: [
      {
        id: 'M1_PHY_FC01',
        stem: 'I would rather my partner be:',
        optionA: 'Stunningly beautiful and somewhat insecure',
        optionB: 'Averagely attractive and completely self-assured',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_PHY_FC02',
        stem: 'When I first notice a woman, I notice:',
        optionA: 'How she looks',
        optionB: 'How she moves through the room',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_PHY_FC03',
        stem: 'If I could only have one, I would choose a partner who:',
        optionA: 'Turns heads when she walks in',
        optionB: 'Commands respect when she speaks',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_PHY_FC04',
        stem: 'I am more likely to approach a woman who:',
        optionA: 'Is the most attractive person in the room',
        optionB: 'Seems the most comfortable in her own skin',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_PHY_FC05',
        stem: 'In a long-term partner, I value more:',
        optionA: 'Maintaining her physical appearance',
        optionB: 'Maintaining her sense of self',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_PHY_FC06',
        stem: 'I would feel prouder introducing a partner who:',
        optionA: 'Others find physically stunning',
        optionB: 'Others find magnetically confident',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_PHY_FC07',
        stem: 'When attraction fades, it is usually because:',
        optionA: 'Physical attraction decreased',
        optionB: 'Her confidence or self-possession decreased',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_PHY_FC08',
        stem: 'I would rather hear my friends say my partner is:',
        optionA: 'Gorgeous',
        optionB: 'Captivating',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_PHY_FC09',
        stem: 'If she gained significant weight but remained confident and self-assured, I would:',
        optionA: 'Likely lose attraction over time',
        optionB: 'Likely maintain attraction',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_PHY_FC10',
        stem: 'I am more drawn to:',
        optionA: 'A beautiful woman who doubts herself',
        optionB: 'A plain woman who owns herself completely',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_PHY_FC11',
        stem: 'When I think about what I want in a partner, I think first about:',
        optionA: 'What she looks like',
        optionB: 'What she is like',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_PHY_FC12',
        stem: 'Physical attraction, for me, is primarily about:',
        optionA: 'How a woman looks',
        optionB: 'How a woman makes me feel in her presence',
        type: QUESTION_TYPES.FORCED_CHOICE
      }
    ]
  },

  // ===========================================================================
  // SOCIAL DIMENSION: Allure (A) vs Charm (B)
  // 32 Questions: 12 Likert Direct + 8 Likert Behavioral + 12 Forced Choice
  // ===========================================================================

  social: {
    dimension: 'social',
    poleA: 'Allure',
    poleB: 'Charm',
    description: {
      poleA: 'Prioritizes magnetism. She commands attention. Others are drawn to her.',
      poleB: 'Prioritizes warmth. She creates comfort. Others feel good around her.'
    },

    likertDirect: {
      poleA: [
        {
          id: 'M1_SOC_A_D01',
          text: 'I am attracted to women who naturally command attention in social situations.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_SOC_A_D02',
          text: 'There is something magnetic about a woman other people are drawn to.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_SOC_A_D03',
          text: 'I want a partner who turns heads when she walks into a room.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_SOC_A_D04',
          text: 'I am drawn to women who have presence that others notice.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_SOC_A_D05',
          text: 'I want to be with someone other people want to be around.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_SOC_A_D06',
          text: 'I like being with someone who makes an impression on people.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        }
      ],
      poleB: [
        {
          id: 'M1_SOC_B_D01',
          text: 'I am most attracted to women who make others feel comfortable and welcome.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_SOC_B_D02',
          text: 'Warmth is more appealing to me than social magnetism.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_SOC_B_D03',
          text: 'I want a partner who puts people at ease rather than impressing them.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_SOC_B_D04',
          text: 'A woman who makes everyone feel included attracts me more than one who stands out.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_SOC_B_D05',
          text: 'I value a partner who creates warmth more than one who commands attention.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_SOC_B_D06',
          text: 'I am drawn to women who make spaces feel welcoming.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        }
      ]
    },

    likertBehavioral: {
      poleA: [
        {
          id: 'M1_SOC_A_B01',
          text: 'I have been more attracted to someone after seeing how others responded to her.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_SOC_A_B02',
          text: 'I have felt a surge of pride introducing a partner who impressed everyone.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_SOC_A_B03',
          text: 'I have pursued women who were clearly the center of attention.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_SOC_A_B04',
          text: 'I have been drawn to a woman specifically because of her social status or popularity.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        }
      ],
      poleB: [
        {
          id: 'M1_SOC_B_B01',
          text: 'I have fallen for women who were not the center of attention but made everyone around them feel good.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_SOC_B_B02',
          text: 'I have been more attracted to someone after watching how kind she was to a stranger.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_SOC_B_B03',
          text: 'I have lost interest in impressive women who seemed cold or dismissive.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_SOC_B_B04',
          text: 'I have been drawn to a woman specifically because of how she treated people others overlooked.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        }
      ]
    },

    forcedChoice: [
      {
        id: 'M1_SOC_FC01',
        stem: 'I would rather my partner be:',
        optionA: 'Admired by many',
        optionB: 'Beloved by a few',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_SOC_FC02',
        stem: 'At a party, I would gravitate toward the woman who:',
        optionA: 'Everyone is watching',
        optionB: 'Is making someone shy feel included',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_SOC_FC03',
        stem: 'I would feel prouder introducing a partner my friends described as:',
        optionA: 'Magnetic',
        optionB: 'Easy to talk to',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_SOC_FC04',
        stem: 'I would rather my partner be known for:',
        optionA: 'Her presence that commands a room',
        optionB: 'Her warmth that makes people feel safe',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_SOC_FC05',
        stem: 'In a long-term relationship, I value more:',
        optionA: 'A partner others are drawn to',
        optionB: 'A partner who makes our home warm',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_SOC_FC06',
        stem: 'I am more attracted to women who:',
        optionA: 'Dazzle a room',
        optionB: 'Nurture a room',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_SOC_FC07',
        stem: 'I would rather hear my friends say my partner is:',
        optionA: 'Impressive',
        optionB: 'Lovely',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_SOC_FC08',
        stem: 'When I imagine bringing my partner to a work event, I picture her:',
        optionA: 'Making a memorable impression',
        optionB: 'Making everyone feel comfortable',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_SOC_FC09',
        stem: 'I am more likely to approach a woman who:',
        optionA: 'Has a crowd around her',
        optionB: 'Is having a genuine one-on-one conversation',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_SOC_FC10',
        stem: 'I value more in a partner:',
        optionA: 'Public charisma',
        optionB: 'Private warmth',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_SOC_FC11',
        stem: 'I would rather my partner:',
        optionA: 'Command respect from strangers',
        optionB: 'Earn affection from friends',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_SOC_FC12',
        stem: 'The social quality that attracts me most is:',
        optionA: 'Magnetism others cannot ignore',
        optionB: 'Kindness others cannot resist',
        type: QUESTION_TYPES.FORCED_CHOICE
      }
    ]
  },

  // ===========================================================================
  // LIFESTYLE DIMENSION: Thrill (A) vs Peace (B)
  // 32 Questions: 16 Likert Direct + 12 Likert Behavioral + 4 Forced Choice
  // ===========================================================================

  lifestyle: {
    dimension: 'lifestyle',
    poleA: 'Thrill',
    poleB: 'Peace',
    description: {
      poleA: 'Prioritizes excitement, novelty, adventure. Life should be vivid.',
      poleB: 'Prioritizes calm, stability, routine. Life should be peaceful.'
    },

    likertDirect: {
      poleA: [
        {
          id: 'M1_LIFE_A_D01',
          text: 'I have gotten restless in good relationships because they felt too settled.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_A_D02',
          text: 'I am drawn to partners who are spontaneous and unpredictable.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_A_D03',
          text: 'Knowing exactly what next month looks like makes me feel stuck.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_A_D04',
          text: 'I have created drama or change in relationships that were going fine because I needed something to happen.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_A_D05',
          text: 'I would rather have an intense, passionate relationship than a calm, stable one.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_A_D06',
          text: 'When a relationship settles into a routine, I start looking for escape hatches.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_A_D07',
          text: 'I want a partner who pushes me out of my comfort zone.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_A_D08',
          text: 'The best relationships keep you on your toes.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        }
      ],
      poleB: [
        {
          id: 'M1_LIFE_B_D01',
          text: 'The best thing about my favorite relationships was knowing exactly what to expect.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_B_D02',
          text: 'I am drawn to partners who are steady and reliable.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_B_D03',
          text: 'I have turned down exciting opportunities because I did not want to disrupt what was working.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_B_D04',
          text: 'Surprisesâ€”even good onesâ€”stress me out.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_B_D05',
          text: 'I would rather have a calm, stable relationship than an intense, passionate one.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_B_D06',
          text: 'My ideal weekend is doing exactly what we did last weekend.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_B_D07',
          text: 'I want a partner who helps me feel grounded.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_B_D08',
          text: 'The best relationships feel peaceful and safe.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        }
      ]
    },

    likertBehavioral: {
      poleA: [
        {
          id: 'M1_LIFE_A_B01',
          text: 'I have ended relationships because they felt too predictable.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_A_B02',
          text: 'I have made major life changes on impulse and felt energized by it.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_A_B03',
          text: 'I have chosen partners specifically because they were unpredictable.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_A_B04',
          text: 'I have felt trapped in relationships that others would consider stable.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_A_B05',
          text: 'I have prioritized excitement over security in past relationships.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_A_B06',
          text: 'I have been told I need too much stimulation or novelty.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_A_B07',
          text: 'I have been more attracted to someone after an argument than before.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_A_B08',
          text: 'There is something that dies in me when sex becomes routine.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_A_B09',
          text: 'I have wanted someone more when they seemed slightly out of reach.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_A_B10',
          text: 'I have lost desire for partners who became too available.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_A_B11',
          text: 'The chase is part of what excites me.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        }
      ],
      poleB: [
        {
          id: 'M1_LIFE_B_B01',
          text: 'I have ended relationships because they felt too chaotic or unpredictable.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_B_B02',
          text: 'I have turned down exciting opportunities because I valued my stability more.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_B_B03',
          text: 'I have chosen partners specifically because they were steady and reliable.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_B_B04',
          text: 'I have felt overwhelmed in relationships that others would consider exciting.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_B_B05',
          text: 'I have prioritized security over excitement in past relationships.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_B_B06',
          text: 'I have been told I am too cautious or need too much routine.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_LIFE_B_B07',
          text: 'Knowing someone completely has not killed my desire for themâ€”it has deepened it.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        }
      ]
    },

    forcedChoice: [
      {
        id: 'M1_LIFE_FC01',
        stem: 'I would rather my life with a partner be:',
        optionA: 'Exciting and unpredictable',
        optionB: 'Calm and predictable',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_LIFE_FC02',
        stem: 'On a typical weekend, I would prefer to:',
        optionA: 'Do something new and spontaneous',
        optionB: 'Enjoy familiar routines at home',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_LIFE_FC03',
        stem: 'If I had to choose, I would pick a partner who:',
        optionA: 'Keeps life interesting',
        optionB: 'Keeps life peaceful',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_LIFE_FC04',
        stem: 'The relationship that sounds better to me is one where:',
        optionA: 'Every year looks different from the last',
        optionB: 'Every year feels comfortably similar',
        type: QUESTION_TYPES.FORCED_CHOICE
      }
    ]
  },

  // ===========================================================================
  // VALUES DIMENSION: Traditional (A) vs Egalitarian (B)
  // 32 Questions: 16 Likert Direct + 12 Likert Behavioral + 4 Forced Choice
  // ===========================================================================

  values: {
    dimension: 'values',
    poleA: 'Traditional',
    poleB: 'Egalitarian',
    description: {
      poleA: 'Prioritizes complementary roles, clear structure, defined responsibilities.',
      poleB: 'Prioritizes equal partnership, shared everything, no default roles.'
    },

    likertDirect: {
      poleA: [
        {
          id: 'M1_VAL_A_D01',
          text: 'I want to know who handles the money, who handles the home, who handles the social calendarâ€”and stick to it.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_A_D02',
          text: 'I am most comfortable when I know what is expected of me in a relationship.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_A_D03',
          text: 'I would rather be with someone who is strong where I am weak than someone just like me.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_A_D04',
          text: 'I want to be the primary provider for my family.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_A_D05',
          text: 'I am more attracted to women who want to build a home than women who want to build a career.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_A_D06',
          text: 'I would rather make the big decisions than negotiate every one.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_A_D07',
          text: 'I would prefer my partner focus more on home and family than career.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_A_D08',
          text: 'I find it stressful when everyday responsibilities are not clearly assigned.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        }
      ],
      poleB: [
        {
          id: 'M1_VAL_B_D01',
          text: 'I expect us to split housework, childcare, and earning roughly 50/50.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_B_D02',
          text: 'I am most comfortable when roles in a relationship are flexible and negotiated.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_B_D03',
          text: 'I feel uncomfortable when one person has more power in a relationship than the other.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_B_D04',
          text: 'I want a partner who is equally invested in her career as I am in mine.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_B_D05',
          text: 'I am attracted to women who prioritize their ambitions over domestic comfort.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_B_D06',
          text: 'I would rather negotiate every decision than have one person in charge.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_B_D07',
          text: 'I would prefer my partner pursue her ambitions fully, even if it complicates our logistics.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_B_D08',
          text: 'I would rather figure out who does what as we go than lock in roles early.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        }
      ]
    },

    likertBehavioral: {
      poleA: [
        {
          id: 'M1_VAL_A_B01',
          text: 'I have felt uncomfortable when a partner earned significantly more than me.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_A_B02',
          text: 'I have been happiest in relationships where roles were clearly divided.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_A_B03',
          text: 'I have taken pride in being the primary provider in past relationships.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_A_B04',
          text: 'I have been attracted to partners who wanted to prioritize family over career.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_A_B05',
          text: 'I have felt most secure when I knew my role in the relationship was clear.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_A_B06',
          text: 'I have preferred making final decisions on major issues in past relationships.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        }
      ],
      poleB: [
        {
          id: 'M1_VAL_B_B01',
          text: 'I have felt proud when a partner earned more or achieved more than me.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_B_B02',
          text: 'I have been happiest in relationships where responsibilities were fully shared.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_B_B03',
          text: 'I have supported partners in prioritizing their careers even when it was inconvenient for me.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_B_B04',
          text: 'I have been attracted to partners who were ambitious and career-driven.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_B_B05',
          text: 'I have felt most secure when decisions were made jointly.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'M1_VAL_B_B06',
          text: 'I have preferred negotiating decisions equally in past relationships.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        }
      ]
    },

    forcedChoice: [
      {
        id: 'M1_VAL_FC01',
        stem: 'I would rather have a partner who:',
        optionA: 'Supports my career while managing our home',
        optionB: 'Pursues her own career while we share home duties',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_VAL_FC02',
        stem: 'In my ideal relationship:',
        optionA: 'Each person has their domain of responsibility',
        optionB: 'Both people share all domains equally',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_VAL_FC03',
        stem: 'I would feel more comfortable if my partner:',
        optionA: 'Looked to me for major decisions',
        optionB: 'Expected equal say in all decisions',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'M1_VAL_FC04',
        stem: 'The relationship structure that appeals to me more is:',
        optionA: 'Complementary roles with clear expectations',
        optionB: 'Equal partnership with flexible roles',
        type: QUESTION_TYPES.FORCED_CHOICE
      }
    ]
  }
};

// =============================================================================
// WOMEN'S MODULE 1 QUESTIONS
// =============================================================================

const WOMEN_MODULE1_QUESTIONS = {

  // ===========================================================================
  // PHYSICAL DIMENSION: Fitness (A) vs Maturity (B)
  // 32 Questions: 12 Likert Direct + 8 Likert Behavioral + 12 Forced Choice
  // ===========================================================================

  physical: {
    dimension: 'physical',
    poleA: 'Fitness',
    poleB: 'Maturity',
    description: {
      poleA: 'Prioritizes physical fitness, strength, vitality. His body shows discipline.',
      poleB: 'Prioritizes depth, experience, substance. His presence shows wisdom.'
    },

    likertDirect: {
      poleA: [
        {
          id: 'W1_PHY_A_D01',
          text: 'I am attracted to men who are visibly fit and take care of their bodies.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_PHY_A_D02',
          text: 'Physical fitness in a man signals discipline and self-respect to me.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_PHY_A_D03',
          text: 'I notice a man\'s physique early when assessing attraction.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_PHY_A_D04',
          text: 'I want a partner who prioritizes his physical health.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_PHY_A_D05',
          text: 'A man\'s body matters to me in romantic attraction.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_PHY_A_D06',
          text: 'I am more attracted to men who look strong and physically capable.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        }
      ],
      poleB: [
        {
          id: 'W1_PHY_B_D01',
          text: 'I am attracted to men who carry themselves with depth and substance.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_PHY_B_D02',
          text: 'Life experience in a man is more attractive to me than physical fitness.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_PHY_B_D03',
          text: 'I notice a man\'s presence and gravitas before I notice his body.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_PHY_B_D04',
          text: 'I want a partner who has wisdom that comes from having lived.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_PHY_B_D05',
          text: 'A man\'s depth matters more to me than his physique.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_PHY_B_D06',
          text: 'I am more attracted to men who seem seasoned and grounded than men who seem youthful and energetic.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        }
      ]
    },

    likertBehavioral: {
      poleA: [
        {
          id: 'W1_PHY_A_B01',
          text: 'I have been more attracted to a man after seeing him with his shirt off.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_PHY_A_B02',
          text: 'I have lost interest in men who let themselves go physically.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_PHY_A_B03',
          text: 'I have pursued men primarily because of their physical appearance.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_PHY_A_B04',
          text: 'I have felt more attracted to partners who worked out regularly.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        }
      ],
      poleB: [
        {
          id: 'W1_PHY_B_B01',
          text: 'I have been attracted to men significantly older than me because of their depth.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_PHY_B_B02',
          text: 'I have lost interest in attractive men who seemed immature or inexperienced.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_PHY_B_B03',
          text: 'I have pursued men primarily because of their wisdom or life experience.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_PHY_B_B04',
          text: 'I have felt more attracted to partners after learning about their life experiences.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        }
      ]
    },

    forcedChoice: [
      {
        id: 'W1_PHY_FC01',
        stem: 'I would rather my partner be:',
        optionA: 'Physically fit but emotionally inexperienced',
        optionB: 'Out of shape but emotionally mature',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_PHY_FC02',
        stem: 'When I first notice a man, I notice:',
        optionA: 'His body and physical presence',
        optionB: 'His depth and how he carries himself',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_PHY_FC03',
        stem: 'I am more attracted to:',
        optionA: 'A man who looks like he spends time in the gym',
        optionB: 'A man who looks like he has spent time in the world',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_PHY_FC04',
        stem: 'If I could only have one, I would choose a partner who:',
        optionA: 'Takes excellent care of his body',
        optionB: 'Has profound life experience',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_PHY_FC05',
        stem: 'I would feel prouder introducing a partner who:',
        optionA: 'Others find physically impressive',
        optionB: 'Others find wise and substantial',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_PHY_FC06',
        stem: 'In a long-term partner, I value more:',
        optionA: 'Maintaining his physical fitness',
        optionB: 'Continuing to grow in wisdom and depth',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_PHY_FC07',
        stem: 'The man I picture myself with long-term is:',
        optionA: 'Someone who will always prioritize staying fit',
        optionB: 'Someone who will always prioritize personal growth',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_PHY_FC08',
        stem: 'I am more likely to approach a man who:',
        optionA: 'Looks physically attractive',
        optionB: 'Seems interesting and experienced',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_PHY_FC09',
        stem: 'Physical attraction, for me, is primarily about:',
        optionA: 'How a man\'s body looks',
        optionB: 'How a man\'s presence feels',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_PHY_FC10',
        stem: 'I would rather hear my friends say my partner is:',
        optionA: 'Hot',
        optionB: 'Fascinating',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_PHY_FC11',
        stem: 'If he gained significant weight but remained wise and present, I would:',
        optionA: 'Likely lose attraction over time',
        optionB: 'Likely maintain attraction',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_PHY_FC12',
        stem: 'The quality that creates instant attraction for me is:',
        optionA: 'Physical fitness I can see',
        optionB: 'Depth I can sense',
        type: QUESTION_TYPES.FORCED_CHOICE
      }
    ]
  },

  // ===========================================================================
  // SOCIAL DIMENSION: Leadership (A) vs Presence (B)
  // 32 Questions: 12 Likert Direct + 8 Likert Behavioral + 12 Forced Choice
  // ===========================================================================

  social: {
    dimension: 'social',
    poleA: 'Leadership',
    poleB: 'Presence',
    description: {
      poleA: 'Prioritizes decisiveness, command, direction. He takes charge.',
      poleB: 'Prioritizes attentiveness, depth, focus. He is fully present with her.'
    },

    likertDirect: {
      poleA: [
        {
          id: 'W1_SOC_A_D01',
          text: 'I am attracted to men who naturally take charge in situations.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_SOC_A_D02',
          text: 'I feel more secure with a partner who is decisive and directive.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_SOC_A_D03',
          text: 'I want a man others look to for leadership.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_SOC_A_D04',
          text: 'A man who commands a room is attractive to me.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_SOC_A_D05',
          text: 'I prefer partners who take the lead in planning and decision-making.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_SOC_A_D06',
          text: 'I am drawn to men who have clear vision and direction.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        }
      ],
      poleB: [
        {
          id: 'W1_SOC_B_D01',
          text: 'I am attracted to men who are fully present and attentive.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_SOC_B_D02',
          text: 'I feel more valued with a partner who truly listens and focuses on me.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_SOC_B_D03',
          text: 'I want a man who makes me feel like the only person in the room.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_SOC_B_D04',
          text: 'A man who gives his complete attention is attractive to me.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_SOC_B_D05',
          text: 'I prefer partners who are deeply curious about my inner world.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_SOC_B_D06',
          text: 'I am drawn to men who have depth and stillness rather than command and direction.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        }
      ]
    },

    likertBehavioral: {
      poleA: [
        {
          id: 'W1_SOC_A_B01',
          text: 'I have been more attracted to men after watching them lead a group or situation.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_SOC_A_B02',
          text: 'I have lost interest in men who seemed indecisive or passive.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_SOC_A_B03',
          text: 'I have pursued men specifically because they were in positions of authority or leadership.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_SOC_A_B04',
          text: 'I have felt most attracted to partners who took charge of planning our dates and lives.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        }
      ],
      poleB: [
        {
          id: 'W1_SOC_B_B01',
          text: 'I have been more attracted to men after they gave me their complete, undivided attention.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_SOC_B_B02',
          text: 'I have lost interest in successful men who seemed distracted or unavailable.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_SOC_B_B03',
          text: 'I have pursued men specifically because of how seen and heard they made me feel.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_SOC_B_B04',
          text: 'I have felt most attracted to partners who remembered small details about me and my life.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        }
      ]
    },

    forcedChoice: [
      {
        id: 'W1_SOC_FC01',
        stem: 'I would rather my partner be:',
        optionA: 'A leader others follow who is sometimes distracted',
        optionB: 'Deeply attentive to me but not a natural leader',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_SOC_FC02',
        stem: 'When I imagine my ideal partner, I picture someone who:',
        optionA: 'Commands respect in public',
        optionB: 'Makes me feel cherished in private',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_SOC_FC03',
        stem: 'I am more attracted to:',
        optionA: 'A man who takes charge of situations',
        optionB: 'A man who takes interest in me',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_SOC_FC04',
        stem: 'I would feel prouder introducing a partner who:',
        optionA: 'Others see as a natural leader',
        optionB: 'Others see as deeply thoughtful',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_SOC_FC05',
        stem: 'In a long-term relationship, I value more:',
        optionA: 'A partner who leads our life with vision',
        optionB: 'A partner who is fully present in our moments',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_SOC_FC06',
        stem: 'I am more likely to fall for a man who:',
        optionA: 'Knows where he is going',
        optionB: 'Knows who I am',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_SOC_FC07',
        stem: 'The quality I find more attractive is:',
        optionA: 'Decisiveness',
        optionB: 'Attentiveness',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_SOC_FC08',
        stem: 'I would rather my partner be known for:',
        optionA: 'His ability to lead',
        optionB: 'His ability to listen',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_SOC_FC09',
        stem: 'On a date, I am more impressed when a man:',
        optionA: 'Takes charge of the plans and evening',
        optionB: 'Asks deep questions and truly listens to my answers',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_SOC_FC10',
        stem: 'I feel most attracted when a man:',
        optionA: 'Makes decisions confidently',
        optionB: 'Makes me feel understood completely',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_SOC_FC11',
        stem: 'I would rather hear my friends say my partner is:',
        optionA: 'A born leader',
        optionB: 'Incredibly present and attentive',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_SOC_FC12',
        stem: 'The man I want is one who:',
        optionA: 'Others want to follow',
        optionB: 'I feel truly seen by',
        type: QUESTION_TYPES.FORCED_CHOICE
      }
    ]
  },

  // ===========================================================================
  // LIFESTYLE DIMENSION: Thrill (A) vs Peace (B)
  // 32 Questions: 16 Likert Direct + 12 Likert Behavioral + 4 Forced Choice
  // (Same as Men's - universal dimension)
  // ===========================================================================

  lifestyle: {
    dimension: 'lifestyle',
    poleA: 'Thrill',
    poleB: 'Peace',
    description: {
      poleA: 'Prioritizes excitement, novelty, adventure. Life should be vivid.',
      poleB: 'Prioritizes calm, stability, routine. Life should be peaceful.'
    },

    likertDirect: {
      poleA: [
        {
          id: 'W1_LIFE_A_D01',
          text: 'I have gotten restless in good relationships because they felt too settled.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_A_D02',
          text: 'I am drawn to partners who are spontaneous and unpredictable.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_A_D03',
          text: 'Knowing exactly what next month looks like makes me feel stuck.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_A_D04',
          text: 'I have created drama or change in relationships that were going fine because I needed something to happen.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_A_D05',
          text: 'I would rather have an intense, passionate relationship than a calm, stable one.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_A_D06',
          text: 'When a relationship settles into a routine, I start looking for escape hatches.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_A_D07',
          text: 'I want a partner who pushes me out of my comfort zone.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_A_D08',
          text: 'The best relationships keep you on your toes.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        }
      ],
      poleB: [
        {
          id: 'W1_LIFE_B_D01',
          text: 'The best thing about my favorite relationships was knowing exactly what to expect.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_B_D02',
          text: 'I am drawn to partners who are steady and reliable.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_B_D03',
          text: 'I have turned down exciting opportunities because I did not want to disrupt what was working.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_B_D04',
          text: 'Surprisesâ€”even good onesâ€”stress me out.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_B_D05',
          text: 'I would rather have a calm, stable relationship than an intense, passionate one.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_B_D06',
          text: 'My ideal weekend is doing exactly what we did last weekend.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_B_D07',
          text: 'I want a partner who helps me feel grounded.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_B_D08',
          text: 'The best relationships feel peaceful and safe.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        }
      ]
    },

    likertBehavioral: {
      poleA: [
        {
          id: 'W1_LIFE_A_B01',
          text: 'I have ended relationships because they felt too predictable.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_A_B02',
          text: 'I have made major life changes on impulse and felt energized by it.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_A_B03',
          text: 'I have chosen partners specifically because they were unpredictable.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_A_B04',
          text: 'I have felt trapped in relationships that others would consider stable.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_A_B05',
          text: 'I have prioritized excitement over security in past relationships.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_A_B06',
          text: 'I have been told I need too much stimulation or novelty.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_A_B07',
          text: 'I have been more attracted to someone after an argument than before.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_A_B08',
          text: 'There is something that dies in me when sex becomes routine.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_A_B09',
          text: 'I have wanted someone more when he seemed slightly out of reach.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_A_B10',
          text: 'I have lost desire for partners who became too available.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_A_B11',
          text: 'The chase is part of what excites me.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        }
      ],
      poleB: [
        {
          id: 'W1_LIFE_B_B01',
          text: 'I have ended relationships because they felt too chaotic or unpredictable.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_B_B02',
          text: 'I have turned down exciting opportunities because I valued my stability more.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_B_B03',
          text: 'I have chosen partners specifically because they were steady and reliable.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_B_B04',
          text: 'I have felt overwhelmed in relationships that others would consider exciting.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_B_B05',
          text: 'I have prioritized security over excitement in past relationships.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_B_B06',
          text: 'I have been told I am too cautious or need too much routine.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_LIFE_B_B07',
          text: 'Knowing someone completely has not killed my desire for themâ€”it has deepened it.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        }
      ]
    },

    forcedChoice: [
      {
        id: 'W1_LIFE_FC01',
        stem: 'I would rather my life with a partner be:',
        optionA: 'Exciting and unpredictable',
        optionB: 'Calm and predictable',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_LIFE_FC02',
        stem: 'On a typical weekend, I would prefer to:',
        optionA: 'Do something new and spontaneous',
        optionB: 'Enjoy familiar routines at home',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_LIFE_FC03',
        stem: 'If I had to choose, I would pick a partner who:',
        optionA: 'Keeps life interesting',
        optionB: 'Keeps life peaceful',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_LIFE_FC04',
        stem: 'The relationship that sounds better to me is one where:',
        optionA: 'Every year looks different from the last',
        optionB: 'Every year feels comfortably similar',
        type: QUESTION_TYPES.FORCED_CHOICE
      }
    ]
  },

  // ===========================================================================
  // VALUES DIMENSION: Traditional (A) vs Egalitarian (B)
  // 32 Questions: 16 Likert Direct + 12 Likert Behavioral + 4 Forced Choice
  // (Same as Men's - universal dimension)
  // ===========================================================================

  values: {
    dimension: 'values',
    poleA: 'Traditional',
    poleB: 'Egalitarian',
    description: {
      poleA: 'Prioritizes complementary roles, clear structure, defined responsibilities.',
      poleB: 'Prioritizes equal partnership, shared everything, no default roles.'
    },

    likertDirect: {
      poleA: [
        {
          id: 'W1_VAL_A_D01',
          text: 'I want to know who handles the money, who handles the home, who handles the social calendarâ€”and stick to it.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_A_D02',
          text: 'I am most comfortable when I know what is expected of me in a relationship.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_A_D03',
          text: 'I would rather be with someone who is strong where I am weak than someone just like me.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_A_D04',
          text: 'I want a partner who takes the lead as the primary provider.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_A_D05',
          text: 'I am more attracted to men who want to provide and protect than men who want an equal partnership.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_A_D06',
          text: 'I would rather have him make the big decisions than negotiate every one.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_A_D07',
          text: 'I would prefer to focus more on home and family than career if financially possible.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_A_D08',
          text: 'I find it stressful when everyday responsibilities are not clearly assigned.',
          pole: 'A',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        }
      ],
      poleB: [
        {
          id: 'W1_VAL_B_D01',
          text: 'I expect us to split housework, childcare, and earning roughly 50/50.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_B_D02',
          text: 'I am most comfortable when roles in a relationship are flexible and negotiated.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_B_D03',
          text: 'I feel uncomfortable when one person has more power in a relationship than the other.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_B_D04',
          text: 'I want a partner who supports my career as much as I support his.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_B_D05',
          text: 'I am attracted to men who see themselves as equal partners, not providers or protectors.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_B_D06',
          text: 'I would rather negotiate every decision than have one person in charge.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_B_D07',
          text: 'I want to pursue my career fully, even if it complicates family logistics.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_B_D08',
          text: 'I would rather figure out who does what as we go than lock in roles early.',
          pole: 'B',
          type: QUESTION_TYPES.DIRECT,
          reverseCoded: false
        }
      ]
    },

    likertBehavioral: {
      poleA: [
        {
          id: 'W1_VAL_A_B01',
          text: 'I have felt most secure with partners who were the primary earners.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_A_B02',
          text: 'I have been happiest in relationships where roles were clearly divided.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_A_B03',
          text: 'I have been attracted to men who wanted to be the provider.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_A_B04',
          text: 'I have willingly taken on more domestic responsibilities in past relationships.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_A_B05',
          text: 'I have felt most secure when I knew my role in the relationship was clear.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_A_B06',
          text: 'I have preferred when my partner made final decisions on major issues.',
          pole: 'A',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        }
      ],
      poleB: [
        {
          id: 'W1_VAL_B_B01',
          text: 'I have felt proud being an equal or primary earner in relationships.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_B_B02',
          text: 'I have been happiest in relationships where responsibilities were fully shared.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_B_B03',
          text: 'I have been attracted to men who wanted an equal partner, not a supporter.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_B_B04',
          text: 'I have expected partners to share domestic responsibilities equally.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_B_B05',
          text: 'I have felt most secure when decisions were made jointly.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        },
        {
          id: 'W1_VAL_B_B06',
          text: 'I have preferred negotiating decisions equally in past relationships.',
          pole: 'B',
          type: QUESTION_TYPES.BEHAVIORAL,
          reverseCoded: false
        }
      ]
    },

    forcedChoice: [
      {
        id: 'W1_VAL_FC01',
        stem: 'I would rather have a partner who:',
        optionA: 'Provides financially while I manage our home',
        optionB: 'Shares all financial and domestic duties equally',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_VAL_FC02',
        stem: 'In my ideal relationship:',
        optionA: 'Each person has their domain of responsibility',
        optionB: 'Both people share all domains equally',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_VAL_FC03',
        stem: 'I would feel more comfortable if my partner:',
        optionA: 'Took the lead on major decisions',
        optionB: 'Expected equal say in all decisions',
        type: QUESTION_TYPES.FORCED_CHOICE
      },
      {
        id: 'W1_VAL_FC04',
        stem: 'The relationship structure that appeals to me more is:',
        optionA: 'Complementary roles with clear expectations',
        optionB: 'Equal partnership with flexible roles',
        type: QUESTION_TYPES.FORCED_CHOICE
      }
    ]
  }
};

// =============================================================================
// SCORING FUNCTIONS
// =============================================================================

/**
 * Score a single dimension from responses
 * @param {Object} responses - Map of questionId -> response value
 * @param {Object} dimensionQuestions - The dimension's question objects
 * @returns {Object} Scoring result with direction, strength, consistency
 */
function scoreM1Dimension(responses, dimensionQuestions) {
  let poleAScore = 0;
  let poleBScore = 0;
  let poleAResponses = [];
  let poleBResponses = [];

  // Score Likert Direct
  dimensionQuestions.likertDirect.poleA.forEach(q => {
    const response = responses[q.id];
    if (response !== undefined) {
      const score = q.reverseCoded ? (6 - response) : response;
      poleAScore += score;
      poleAResponses.push(score);
    }
  });

  dimensionQuestions.likertDirect.poleB.forEach(q => {
    const response = responses[q.id];
    if (response !== undefined) {
      const score = q.reverseCoded ? (6 - response) : response;
      poleBScore += score;
      poleBResponses.push(score);
    }
  });

  // Score Likert Behavioral
  dimensionQuestions.likertBehavioral.poleA.forEach(q => {
    const response = responses[q.id];
    if (response !== undefined) {
      const score = q.reverseCoded ? (6 - response) : response;
      poleAScore += score;
      poleAResponses.push(score);
    }
  });

  dimensionQuestions.likertBehavioral.poleB.forEach(q => {
    const response = responses[q.id];
    if (response !== undefined) {
      const score = q.reverseCoded ? (6 - response) : response;
      poleBScore += score;
      poleBResponses.push(score);
    }
  });

  // Score Forced Choice
  dimensionQuestions.forcedChoice.forEach(q => {
    const response = responses[q.id];
    if (response === 'A') {
      poleAScore += 1;
    } else if (response === 'B') {
      poleBScore += 1;
    }
  });

  // Calculate direction
  const direction = poleAScore >= poleBScore ? 'A' : 'B';

  // Calculate strength (0-100%)
  const total = poleAScore + poleBScore;
  const strength = total > 0 ? Math.abs(poleAScore - poleBScore) / total * 100 : 0;

  // Calculate consistency (variance within each pole's Likert responses)
  const poleAConsistency = calculateConsistency(poleAResponses);
  const poleBConsistency = calculateConsistency(poleBResponses);

  // Determine flexibility
  let flexibility;
  if (strength < 20) {
    flexibility = 'high';
  } else if (strength < 45) {
    flexibility = 'moderate';
  } else {
    flexibility = 'low';
  }

  return {
    poleAScore,
    poleBScore,
    direction,
    strength: Math.round(strength * 10) / 10,
    flexibility,
    consistency: {
      poleA: poleAConsistency,
      poleB: poleBConsistency
    },
    assignedPole: direction === 'A' ? dimensionQuestions.poleA : dimensionQuestions.poleB
  };
}

/**
 * Calculate response consistency (variance)
 * @param {Array} responses - Array of numeric responses
 * @returns {Object} Variance and consistency rating
 */
function calculateConsistency(responses) {
  if (responses.length < 2) {
    return { variance: 0, rating: 'insufficient_data' };
  }

  const mean = responses.reduce((a, b) => a + b, 0) / responses.length;
  const variance = responses.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (responses.length - 1);

  let rating;
  if (variance < 0.8) {
    rating = 'high';
  } else if (variance < 1.5) {
    rating = 'moderate';
  } else {
    rating = 'low';
  }

  return {
    variance: Math.round(variance * 100) / 100,
    rating
  };
}

/**
 * Score all dimensions and produce full Module 1 profile
 * @param {string} gender - 'M' or 'W'
 * @param {Object} responses - Map of questionId -> response value
 * @returns {Object} Full profile with code, dimensions, key driver
 */
function scoreModule1(gender, responses) {
  const questions = gender === 'M' ? MEN_MODULE1_QUESTIONS : WOMEN_MODULE1_QUESTIONS;

  const dimensions = {
    physical: scoreM1Dimension(responses, questions.physical),
    social: scoreM1Dimension(responses, questions.social),
    lifestyle: scoreM1Dimension(responses, questions.lifestyle),
    values: scoreM1Dimension(responses, questions.values)
  };

  // Build 4-letter code using ACEG system
  // A/B for Physical, C/D for Social, E/F for Lifestyle, G/H for Values
  const codeMap = {
    physical: { A: 'A', B: 'B' },
    social: { A: 'C', B: 'D' },
    lifestyle: { A: 'E', B: 'F' },
    values: { A: 'G', B: 'H' }
  };

  const code = [
    codeMap.physical[dimensions.physical.direction],
    codeMap.social[dimensions.social.direction],
    codeMap.lifestyle[dimensions.lifestyle.direction],
    codeMap.values[dimensions.values.direction]
  ].join('');

  // Determine Key Driver (highest strength on non-Values dimension)
  const keyDriverCandidates = [
    { dimension: 'physical', strength: dimensions.physical.strength },
    { dimension: 'social', strength: dimensions.social.strength },
    { dimension: 'lifestyle', strength: dimensions.lifestyle.strength }
  ].sort((a, b) => b.strength - a.strength);

  const keyDriver = {
    dimension: keyDriverCandidates[0].dimension,
    strength: keyDriverCandidates[0].strength,
    confidence: keyDriverCandidates[0].strength - keyDriverCandidates[1].strength > 15 ? 'high' :
                keyDriverCandidates[0].strength - keyDriverCandidates[1].strength > 8 ? 'moderate' : 'low',
    coDriver: keyDriverCandidates[0].strength - keyDriverCandidates[1].strength <= 8 ? 
              keyDriverCandidates[1].dimension : null
  };

  // Flag any consistency issues
  const flags = [];
  Object.entries(dimensions).forEach(([dim, result]) => {
    if (result.consistency.poleA.rating === 'low') {
      flags.push(`INCONSISTENT_${dim.toUpperCase()}_POLE_A`);
    }
    if (result.consistency.poleB.rating === 'low') {
      flags.push(`INCONSISTENT_${dim.toUpperCase()}_POLE_B`);
    }
    if (result.strength < 10) {
      flags.push(`BALANCED_${dim.toUpperCase()}`);
    }
  });

  return {
    gender,
    module: 1,
    code,
    dimensions,
    keyDriver,
    flags,
    timestamp: new Date().toISOString()
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all questions for a gender in presentation order
 * @param {string} gender - 'M' or 'W'
 * @returns {Array} Ordered array of all questions
 */
function getAllQuestions(gender) {
  const questions = gender === 'M' ? MEN_MODULE1_QUESTIONS : WOMEN_MODULE1_QUESTIONS;
  const allQuestions = [];

  ['physical', 'social', 'lifestyle', 'values'].forEach(dimension => {
    const dim = questions[dimension];
    
    // Add Likert Direct Pole A
    allQuestions.push(...dim.likertDirect.poleA);
    
    // Add Likert Direct Pole B
    allQuestions.push(...dim.likertDirect.poleB);
    
    // Add Likert Behavioral (mixed)
    const behavioralMixed = [];
    const maxLen = Math.max(dim.likertBehavioral.poleA.length, dim.likertBehavioral.poleB.length);
    for (let i = 0; i < maxLen; i++) {
      if (dim.likertBehavioral.poleA[i]) behavioralMixed.push(dim.likertBehavioral.poleA[i]);
      if (dim.likertBehavioral.poleB[i]) behavioralMixed.push(dim.likertBehavioral.poleB[i]);
    }
    allQuestions.push(...behavioralMixed);
    
    // Add Forced Choice
    allQuestions.push(...dim.forcedChoice);
  });

  return allQuestions;
}

/**
 * Count questions by type and dimension
 * @param {string} gender - 'M' or 'W'
 * @returns {Object} Counts by dimension and type
 */
function getM1QuestionCounts(gender) {
  const questions = gender === 'M' ? MEN_MODULE1_QUESTIONS : WOMEN_MODULE1_QUESTIONS;
  const counts = {};

  ['physical', 'social', 'lifestyle', 'values'].forEach(dimension => {
    const dim = questions[dimension];
    counts[dimension] = {
      likertDirectA: dim.likertDirect.poleA.length,
      likertDirectB: dim.likertDirect.poleB.length,
      likertBehavioralA: dim.likertBehavioral.poleA.length,
      likertBehavioralB: dim.likertBehavioral.poleB.length,
      forcedChoice: dim.forcedChoice.length,
      total: dim.likertDirect.poleA.length + dim.likertDirect.poleB.length +
             dim.likertBehavioral.poleA.length + dim.likertBehavioral.poleB.length +
             dim.forcedChoice.length
    };
  });

  counts.grandTotal = Object.values(counts).reduce((sum, dim) => sum + (dim.total || 0), 0);

  return counts;
}

// =============================================================================
// SEARCH CHANNEL & MARKET COACHING
// =============================================================================

/**
 * When filter adjustment is hard, we coach on WHERE to look, not just WHO.
 * Two levers:
 *   1. SEARCH CHANNELS - High-trust networks vs. cold markets (apps)
 *   2. MARKET SELECTION - Relocation or expanded search radius
 */

const SEARCH_CHANNELS = {
  // Cold market channels (apps, bars, events with strangers)
  cold: {
    apps: {
      name: 'Dating Apps',
      trustLevel: 'low',
      poolMultiplier: 1.0, // Baseline
      signalQuality: 'low',
      effort: 'low',
      bestFor: ['large_pool', 'specific_filters', 'efficiency'],
      weaknesses: ['low_trust', 'misrepresentation', 'overwhelm', 'commodification'],
      personaFit: {
        high: ['ACEG', 'ACEH', 'BCEG', 'BCEH'], // High-demand personas need volume
        low: ['BDFH', 'BDEH', 'ADFH'] // Presence/depth personas struggle with app dynamics
      },
      coaching: 'Apps give you volume but low signal quality. Best when your pool is healthy and you can afford to filter aggressively.'
    },
    events: {
      name: 'Singles Events / Speed Dating',
      trustLevel: 'low',
      poolMultiplier: 0.8,
      signalQuality: 'medium',
      effort: 'medium',
      bestFor: ['in_person_chemistry', 'quick_filtering', 'social_practice'],
      weaknesses: ['limited_selection', 'pressure', 'same_crowd'],
      personaFit: {
        high: ['ACEG', 'ADEG', 'BCEG'], // Leadership/allure personas thrive
        low: ['BDFH', 'BCFH'] // Quiet presence types overwhelmed
      },
      coaching: 'Events let you assess chemistry quickly but pool is whoever shows up. Good for social personas.'
    },
    bars_clubs: {
      name: 'Bars & Nightlife',
      trustLevel: 'very_low',
      poolMultiplier: 0.6,
      signalQuality: 'very_low',
      effort: 'low',
      bestFor: ['spontaneity', 'physical_attraction', 'social_personas'],
      weaknesses: ['selection_bias', 'alcohol', 'superficial_filtering'],
      personaFit: {
        high: ['ACEG', 'ACEH'], // Thrill + Allure personas
        low: ['BDFG', 'BDFH', 'BCFG'] // Peace + Traditional personas
      },
      coaching: 'Nightlife selects for a specific type. If you want Peace or Traditional values, this channel works against you.'
    }
  },
  
  // Warm market channels (some existing connection)
  warm: {
    friends_of_friends: {
      name: 'Friends of Friends',
      trustLevel: 'high',
      poolMultiplier: 1.5, // Trust increases effective pool
      signalQuality: 'high',
      effort: 'medium',
      bestFor: ['pre_vetting', 'shared_context', 'reputation_matters'],
      weaknesses: ['limited_pool', 'social_pressure', 'awkward_if_fails'],
      personaFit: {
        high: ['ADFH', 'BDFH', 'ADEG', 'BDEG'], // Charm/Presence personas thrive with warm intros
        low: ['ACEG', 'BCEG'] // High-demand seekers need more volume
      },
      coaching: 'Friends-of-friends is your highest ROI channel. One good introduction beats 100 app matches. Invest in your network.',
      activation: [
        'Tell 3 close friends specifically what you are looking for',
        'Host dinners and ask friends to bring interesting single people',
        'Be explicit: "I am actively looking - please think of me when you meet someone"',
        'Follow up on every introduction seriously, even if not immediate fit'
      ]
    },
    alumni_networks: {
      name: 'Alumni Networks',
      trustLevel: 'medium_high',
      poolMultiplier: 1.3,
      signalQuality: 'medium_high',
      effort: 'medium',
      bestFor: ['shared_values', 'education_match', 'professional_class'],
      weaknesses: ['homogeneity', 'may_not_be_local'],
      personaFit: {
        high: ['BCFG', 'BCFH', 'ACFG', 'ACFH'], // Status/achievement personas
        low: ['ADEG', 'BDEG'] // Rural/traditional personas
      },
      coaching: 'Alumni networks pre-filter for education and shared formative experience. High trust, but pool depends on school size and your engagement.',
      activation: [
        'Attend alumni events in your city',
        'Join alumni clubs or professional groups',
        'Use LinkedIn alumni feature strategically',
        'Reconnect with college friends who might make introductions'
      ]
    },
    professional_networks: {
      name: 'Professional Networks',
      trustLevel: 'medium',
      poolMultiplier: 1.2,
      signalQuality: 'medium',
      effort: 'medium',
      bestFor: ['ambition_match', 'career_alignment', 'professional_respect'],
      weaknesses: ['workplace_complications', 'competition_dynamics'],
      personaFit: {
        high: ['BCEH', 'ACFH', 'BCFH'], // Egalitarian achievers
        low: ['ADFG', 'BDFG'] // Peace + Traditional (work/life separation)
      },
      coaching: 'Professional networks show you people in their competence zone. Good for assessing capability and ambition.',
      activation: [
        'Attend industry conferences with social components',
        'Join professional associations with events',
        'Take leadership roles that increase visibility',
        'Be known as someone who makes good introductions (reciprocity)'
      ]
    },
    religious_community: {
      name: 'Religious Community',
      trustLevel: 'high',
      poolMultiplier: 1.4,
      signalQuality: 'high',
      effort: 'high',
      bestFor: ['values_alignment', 'family_orientation', 'community_integration'],
      weaknesses: ['requires_genuine_participation', 'limited_pool', 'pressure'],
      personaFit: {
        high: ['ADEG', 'ADFG', 'BDEG', 'BDFG'], // Traditional personas
        low: ['ACEH', 'BCEH'] // Egalitarian adventurers
      },
      coaching: 'Religious communities offer deep values alignment and family/community buy-in. Only works if faith is genuine.',
      activation: [
        'Join small groups or service teams (not just Sunday attendance)',
        'Participate in singles-specific programming if available',
        'Let community leaders know you are looking',
        'Focus on shared service - relationships form through shared purpose'
      ]
    },
    hobby_communities: {
      name: 'Hobby & Interest Communities',
      trustLevel: 'medium',
      poolMultiplier: 1.2,
      signalQuality: 'medium_high',
      effort: 'medium',
      bestFor: ['shared_interests', 'natural_context', 'repeated_interaction'],
      weaknesses: ['may_be_gender_imbalanced', 'slow_build'],
      personaFit: {
        high: ['ADEH', 'BDEH', 'ADFH', 'BDFH'], // Presence + Egalitarian personas
        low: ['ACEG', 'BCEG'] // High-intensity personas may find hobbies too slow
      },
      coaching: 'Hobby communities let you meet people in authentic contexts with repeated exposure. Chemistry builds naturally.',
      activation: [
        'Choose hobbies with balanced gender ratios (cooking, hiking, dance, photography)',
        'Commit to regular attendance (relationships need repeated contact)',
        'Take leadership or organizing roles',
        'Suggest social extensions (post-class drinks, weekend trips)'
      ]
    }
  },
  
  // Hot market channels (direct network)
  hot: {
    direct_network: {
      name: 'Your Direct Network',
      trustLevel: 'very_high',
      poolMultiplier: 2.0, // Highest trust = highest effective multiplier
      signalQuality: 'very_high',
      effort: 'high',
      bestFor: ['maximum_trust', 'character_verification', 'long_term_potential'],
      weaknesses: ['very_limited_pool', 'high_stakes', 'network_effects'],
      personaFit: {
        high: ['all'], // Everyone benefits from direct network
        low: []
      },
      coaching: 'People who already know and respect you are your best source. The constraint is pool size, not quality.',
      activation: [
        'Audit your network: who do you know who is single or knows singles?',
        'Reactivate dormant connections (old colleagues, distant friends)',
        'Be direct: "I am seriously looking for a partner. Who should I meet?"',
        'Host and attend gatherings that mix friend groups'
      ]
    },
    matchmakers: {
      name: 'Professional Matchmakers',
      trustLevel: 'high',
      poolMultiplier: 1.3,
      signalQuality: 'high',
      effort: 'low',
      bestFor: ['time_constrained', 'high_income', 'specific_requirements'],
      weaknesses: ['expensive', 'limited_pool', 'quality_varies'],
      personaFit: {
        high: ['ACFG', 'BCFG', 'ACEG'], // High-demand traditional personas
        low: ['ADFH', 'BDFH'] // Accessible personas don't need this investment
      },
      coaching: 'Matchmakers pre-vet and handle logistics. Worth it if your time is very valuable and your requirements are specific.',
      activation: [
        'Research matchmakers who specialize in your demographic',
        'Be extremely clear about non-negotiables vs. preferences',
        'Give honest feedback - it improves future matches',
        'Treat it as one channel, not your only channel'
      ]
    }
  }
};

/**
 * Channel recommendation based on pool health and persona
 */
function recommendSearchChannels(poolHealth, personaCode, userContext = {}) {
  const recommendations = {
    primary: [],
    secondary: [],
    avoid: [],
    reasoning: null,
    networkActivation: []
  };
  
  // Get all channels flattened
  const allChannels = [
    ...Object.entries(SEARCH_CHANNELS.cold).map(([k, v]) => ({ ...v, id: k, temperature: 'cold' })),
    ...Object.entries(SEARCH_CHANNELS.warm).map(([k, v]) => ({ ...v, id: k, temperature: 'warm' })),
    ...Object.entries(SEARCH_CHANNELS.hot).map(([k, v]) => ({ ...v, id: k, temperature: 'hot' }))
  ];
  
  // Score channels based on pool health
  const healthWeights = {
    healthy: { cold: 1.0, warm: 0.8, hot: 0.6 }, // Can afford volume plays
    tight: { cold: 0.7, warm: 1.0, hot: 0.9 }, // Balance volume and quality
    constrained: { cold: 0.4, warm: 1.0, hot: 1.2 }, // Shift to high-trust
    critical: { cold: 0.2, warm: 1.0, hot: 1.5 }, // Maximize trust channels
    unrealistic: { cold: 0.1, warm: 0.8, hot: 1.5 } // Trust channels + market change
  };
  
  const weights = healthWeights[poolHealth] || healthWeights.tight;
  
  // Score each channel
  const scoredChannels = allChannels.map(channel => {
    let score = channel.poolMultiplier * weights[channel.temperature];
    
    // Persona fit bonus/penalty
    if (channel.personaFit?.high?.includes(personaCode)) {
      score *= 1.3;
    }
    if (channel.personaFit?.low?.includes(personaCode)) {
      score *= 0.6;
    }
    
    // Context adjustments
    if (userContext.timeConstrained && channel.effort === 'low') {
      score *= 1.2;
    }
    if (userContext.highIncome && channel.id === 'matchmakers') {
      score *= 1.3;
    }
    if (userContext.religious && channel.id === 'religious_community') {
      score *= 1.5;
    }
    if (!userContext.religious && channel.id === 'religious_community') {
      score *= 0.3;
    }
    
    return { ...channel, score };
  });
  
  // Sort by score
  scoredChannels.sort((a, b) => b.score - a.score);
  
  // Assign to categories
  recommendations.primary = scoredChannels.slice(0, 3).map(c => ({
    channel: c.name,
    id: c.id,
    temperature: c.temperature,
    trustLevel: c.trustLevel,
    coaching: c.coaching,
    activation: c.activation || []
  }));
  
  recommendations.secondary = scoredChannels.slice(3, 6).map(c => ({
    channel: c.name,
    id: c.id,
    temperature: c.temperature
  }));
  
  recommendations.avoid = scoredChannels.filter(c => c.score < 0.5).map(c => ({
    channel: c.name,
    reason: c.personaFit?.low?.includes(personaCode) 
      ? 'Poor fit for your persona type'
      : 'Low ROI given your pool constraints'
  }));
  
  // Overall reasoning
  if (poolHealth === 'healthy') {
    recommendations.reasoning = 'With a healthy pool, you can use volume channels (apps) efficiently. Warm channels add quality but are not essential.';
  } else if (poolHealth === 'tight' || poolHealth === 'constrained') {
    recommendations.reasoning = 'Your constrained pool means cold channels will feel frustrating. Shift investment toward warm and hot channels where trust multiplies your effective options.';
  } else {
    recommendations.reasoning = 'Your pool constraints make cold channels nearly impossible. Focus almost exclusively on high-trust networks and consider market relocation.';
  }
  
  // Compile network activation steps
  recommendations.primary.forEach(rec => {
    if (rec.activation && rec.activation.length > 0) {
      recommendations.networkActivation.push({
        channel: rec.channel,
        steps: rec.activation
      });
    }
  });
  
  return recommendations;
}

// =============================================================================
// RELOCATION ANALYSIS FRAMEWORK
// =============================================================================

/**
 * Market relocation analysis - placeholder for demographics integration
 * Will be populated when relocation question is added to demographics
 */

const RELOCATION_FRAMEWORK = {
  /**
   * Factors that make relocation worth considering:
   */
  triggers: {
    poolCritical: 'Your local pool is critically small (<25 ideal matches)',
    marketMismatch: 'Your target persona concentrates in markets unlike yours',
    careerFlexible: 'Your career allows remote work or easy transfer',
    noRoots: 'You have weak ties to current location',
    repeatedFailure: 'You have exhausted local options over 2+ years'
  },
  
  /**
   * Market archetypes and what they offer:
   */
  marketTypes: {
    majorMetro: {
      examples: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
      population: '2M+',
      strengths: ['Maximum pool size', 'Diversity of types', 'Career opportunities'],
      weaknesses: ['High competition', 'Paradox of choice', 'Transient population'],
      bestForPersonas: {
        seeking: ['ACEG', 'ACEH', 'BCEG', 'BCEH'], // High-demand personas exist here
        offering: ['ACFG', 'BCFG'] // Status personas valued here
      },
      poolMultiplier: 1.0 // Baseline
    },
    techHub: {
      examples: ['San Francisco', 'Seattle', 'Austin', 'Denver', 'Boston'],
      population: '500K-2M',
      strengths: ['High income', 'Educated', 'Progressive values'],
      weaknesses: ['Gender imbalance (more men)', 'Workaholism', 'High cost'],
      bestForPersonas: {
        seeking: ['ACEH', 'BCEH', 'ACFH', 'BCFH'], // Egalitarian achievers
        offering: ['ACFH', 'BCFH'] // Career-oriented women valued
      },
      poolMultiplier: 0.9, // Slightly smaller but higher quality for some
      genderNote: 'Significantly more single men than women. Advantage: women. Disadvantage: men.'
    },
    collegeTown: {
      examples: ['Ann Arbor', 'Boulder', 'Madison', 'Chapel Hill', 'Charlottesville'],
      population: '100K-500K',
      strengths: ['Educated', 'Young', 'Cultural activities'],
      weaknesses: ['Transient', 'Skews young', 'Limited career ceiling'],
      bestForPersonas: {
        seeking: ['BCFH', 'BDEH'], // Intellectual personas
        offering: ['BCFH', 'BDEH']
      },
      poolMultiplier: 0.7,
      ageNote: 'Pool drops significantly after age 35 as people leave.'
    },
    traditionalCity: {
      examples: ['Salt Lake City', 'Dallas', 'Atlanta suburbs', 'Charlotte', 'Nashville'],
      population: '500K-2M',
      strengths: ['Family values', 'Lower cost', 'Religious communities'],
      weaknesses: ['Less diversity', 'More conservative'],
      bestForPersonas: {
        seeking: ['ADEG', 'ADFG', 'BDEG', 'BDFG'], // Traditional personas
        offering: ['ADEG', 'ADFG', 'BDEG', 'BDFG']
      },
      poolMultiplier: 0.85,
      valuesNote: 'Traditional values are mainstream here. Egalitarian personas may struggle.'
    },
    smallCity: {
      examples: ['Boise', 'Reno', 'Des Moines', 'Omaha', 'Spokane'],
      population: '100K-500K',
      strengths: ['Community-oriented', 'Lower competition', 'Affordable'],
      weaknesses: ['Limited pool', 'Everyone knows everyone', 'Less diversity'],
      bestForPersonas: {
        seeking: ['ADFH', 'BDFH', 'ADEG', 'BDEG'], // Grounded, community personas
        offering: ['ADFH', 'BDFH']
      },
      poolMultiplier: 0.5,
      communityNote: 'Warm channels dominate here. Apps are less effective; everyone is two degrees connected.'
    },
    ruralArea: {
      examples: ['Most non-metro areas'],
      population: '<100K',
      strengths: ['Deep community', 'Traditional values', 'Authenticity'],
      weaknesses: ['Very limited pool', 'Homogeneity', 'Limited career'],
      bestForPersonas: {
        seeking: ['BDEG', 'BDFG'], // Ranger, Arborist types
        offering: ['ADEG', 'ADFG'] // Barrel Racer, Coach types
      },
      poolMultiplier: 0.2,
      criticalNote: 'Cold channels nearly useless. Success requires deep community integration or relocation.'
    }
  },
  
  /**
   * Relocation decision framework
   */
  decisionFactors: {
    poolGain: {
      weight: 0.30,
      question: 'How much larger is my ideal pool in the new market?',
      threshold: '2x or greater pool gain makes relocation worth considering'
    },
    careerImpact: {
      weight: 0.25,
      question: 'Can I maintain or improve my career there?',
      threshold: 'Career regression makes relocation risky'
    },
    costOfLiving: {
      weight: 0.15,
      question: 'Can I maintain my lifestyle on equivalent income?',
      threshold: 'Major lifestyle downgrade undermines relationship capacity'
    },
    socialCapital: {
      weight: 0.15,
      question: 'How long to rebuild network and social proof?',
      threshold: 'Expect 1-2 years to establish warm channels in new market'
    },
    personaFit: {
      weight: 0.15,
      question: 'Does the market culture match my values and target?',
      threshold: 'Cultural mismatch creates friction even with larger pool'
    }
  }
};

/**
 * Generate relocation coaching based on current market analysis
 * This is a framework - full implementation requires demographics integration
 */
function generateRelocationCoaching(currentMarketData, poolAnalysis, personaCode, userPreferences = {}) {
  const coaching = {
    shouldConsider: false,
    reasoning: null,
    potentialMarkets: [],
    decisionFramework: [],
    immediateSteps: [],
    warnings: []
  };
  
  // Determine if relocation should be considered
  const triggers = [];
  
  if (poolAnalysis.health.status === 'critical' || poolAnalysis.health.status === 'unrealistic') {
    triggers.push(RELOCATION_FRAMEWORK.triggers.poolCritical);
  }
  
  if (currentMarketData?.population < 100000) {
    triggers.push('Your market is small (<100K). Pool limitations may be structural.');
  }
  
  if (userPreferences.careerFlexible) {
    triggers.push(RELOCATION_FRAMEWORK.triggers.careerFlexible);
  }
  
  if (userPreferences.weakLocalTies) {
    triggers.push(RELOCATION_FRAMEWORK.triggers.noRoots);
  }
  
  coaching.shouldConsider = triggers.length >= 2;
  
  if (coaching.shouldConsider) {
    coaching.reasoning = `Relocation may be worth considering because: ${triggers.join('; ')}`;
    
    // Suggest market types based on persona
    const marketTypes = RELOCATION_FRAMEWORK.marketTypes;
    const suggestedMarkets = [];
    
    Object.entries(marketTypes).forEach(([typeId, market]) => {
      let score = market.poolMultiplier;
      
      // Persona seeking fit
      if (market.bestForPersonas?.seeking?.includes(personaCode)) {
        score *= 1.4;
        suggestedMarkets.push({
          type: typeId,
          name: market.examples.slice(0, 3).join(', '),
          score: score,
          strengths: market.strengths,
          note: market.valuesNote || market.genderNote || market.communityNote || null
        });
      }
    });
    
    suggestedMarkets.sort((a, b) => b.score - a.score);
    coaching.potentialMarkets = suggestedMarkets.slice(0, 3);
    
    // Decision framework
    coaching.decisionFramework = Object.entries(RELOCATION_FRAMEWORK.decisionFactors).map(([id, factor]) => ({
      factor: id,
      question: factor.question,
      weight: factor.weight,
      threshold: factor.threshold
    }));
    
    // Immediate steps
    coaching.immediateSteps = [
      'Research 2-3 target markets using dating apps with location set there',
      'Calculate income equivalency (cost of living adjustment)',
      'Identify career opportunities in target markets',
      'Plan exploratory visits (1-2 weeks) to test cultural fit',
      'Map your existing network connections in potential markets'
    ];
    
    // Warnings
    coaching.warnings = [
      'Relocation resets your social capital. Expect 1-2 years to rebuild warm channels.',
      'The grass often looks greener. Research thoroughly before committing.',
      'Consider trial periods (3-6 months) before permanent moves.',
      'Career stability should not be sacrificed for dating pool - it affects your long-term value.'
    ];
  } else {
    coaching.reasoning = 'Relocation is not indicated at this time. Focus on optimizing within your current market.';
    coaching.immediateSteps = [
      'Maximize warm channel activation in current market',
      'Consider expanding search radius (45-60 min drive time)',
      'Explore adjacent markets for weekend dating',
      'Optimize for the pool you have before considering relocation'
    ];
  }
  
  return coaching;
}

// =============================================================================
// INTEGRATED ADJUSTMENT COACHING
// =============================================================================

/**
 * Master function that combines all adjustment coaching:
 * - Filter adjustments (what to change)
 * - Channel recommendations (where to look)
 * - Relocation analysis (where to move)
 */
function generateAdjustmentCoaching(poolAnalysis, personaCode, personaDemandLevel, demographics, userContext = {}) {
  const coaching = {
    summary: null,
    filterAdjustments: null,
    channelStrategy: null,
    relocationAnalysis: null,
    prioritizedActions: [],
    timeframes: {
      immediate: [], // This week
      shortTerm: [],  // This month
      mediumTerm: [], // 3-6 months
      longTerm: []    // 6+ months
    }
  };
  
  // 1. Pool-based coaching (from earlier function)
  coaching.filterAdjustments = generatePoolCoaching(poolAnalysis, personaDemandLevel);
  
  // 2. Channel strategy
  coaching.channelStrategy = recommendSearchChannels(
    poolAnalysis.health.status, 
    personaCode, 
    userContext
  );
  
  // 3. Relocation analysis
  coaching.relocationAnalysis = generateRelocationCoaching(
    demographics,
    poolAnalysis,
    personaCode,
    userContext
  );
  
  // 4. Generate summary
  const healthSummaries = {
    healthy: 'Your pool is healthy. Success is about execution and channel optimization.',
    tight: 'Your pool is tight but workable. Shift toward high-trust channels and consider minor filter adjustments.',
    constrained: 'Your pool is constrained. Prioritize warm channels, adjust filters where possible, and evaluate market fit.',
    critical: 'Your pool is critically small. Major action needed: filter overhaul, channel pivot, or market change.',
    unrealistic: 'Your current combination is not viable. Fundamental recalibration required across filters, channels, and possibly market.'
  };
  coaching.summary = healthSummaries[poolAnalysis.health.status];
  
  // 5. Prioritize actions by timeframe
  
  // Immediate (this week)
  coaching.timeframes.immediate = [
    'Audit your network: List 10 people who might know good matches',
    'Tell 3 friends specifically what you are looking for',
    ...coaching.channelStrategy.primary.slice(0, 1).map(c => `Activate ${c.channel}: ${c.activation?.[0] || 'Start engaging'}`)
  ];
  
  // Short-term (this month)
  if (poolAnalysis.health.status !== 'healthy') {
    coaching.timeframes.shortTerm.push('Review your costliest filter and test removing it');
  }
  coaching.timeframes.shortTerm.push(
    ...coaching.channelStrategy.primary.slice(0, 2).flatMap(c => 
      (c.activation || []).slice(0, 2).map(a => `${c.channel}: ${a}`)
    )
  );
  
  // Medium-term (3-6 months)
  if (poolAnalysis.health.status === 'constrained' || poolAnalysis.health.status === 'critical') {
    coaching.timeframes.mediumTerm.push('Evaluate whether filter adjustments have improved results');
    coaching.timeframes.mediumTerm.push('Consider expanding geographic search radius');
  }
  coaching.timeframes.mediumTerm.push('Build and strengthen warm network connections');
  coaching.timeframes.mediumTerm.push('Develop skills that improve relationship capacity (Modules 3-4)');
  
  // Long-term (6+ months)
  if (coaching.relocationAnalysis.shouldConsider) {
    coaching.timeframes.longTerm.push('Research and visit potential relocation markets');
    coaching.timeframes.longTerm.push('Evaluate career opportunities in better-fit markets');
  }
  coaching.timeframes.longTerm.push('If current market remains difficult, make relocation decision');
  coaching.timeframes.longTerm.push('Continue skill development and self-improvement');
  
  // 6. Top 5 prioritized actions
  coaching.prioritizedActions = [
    ...coaching.timeframes.immediate.slice(0, 2),
    ...coaching.timeframes.shortTerm.slice(0, 2),
    coaching.timeframes.mediumTerm[0]
  ].filter(Boolean).slice(0, 5);
  
  return coaching;
}

// =============================================================================
// MATCH POOL TIER DEFINITIONS & COACHING
// =============================================================================

/**
 * Match Pool Tiers represent progressively filtered dating pools.
 * Each tier adds filters, shrinking the pool but increasing "fit."
 * 
 * The coaching opportunity: Help users understand tradeoffs and
 * identify which filters are worth the cost.
 */

const POOL_TIER_DEFINITIONS = {
  realistic: {
    name: 'Realistic Pool',
    description: 'Singles in your market who meet your non-negotiable requirements',
    filters: ['age_range', 'minimum_income'],
    meaning: 'These are people you would actually consider if you met them. The floor of possibility.',
    coachingContext: 'If this number is small, your non-negotiables are excluding most of the market.',
    adjustmentType: 'CORE_REQUIREMENTS',
    adjustmentDifficulty: 'high', // Hardest to adjust because these feel non-negotiable
    typicalPercentOfLocal: { healthy: 0.15, tight: 0.05, crisis: 0.02 }
  },
  
  preferred: {
    name: 'Preferred Pool',
    description: 'Realistic matches whose lifestyle and values align with yours',
    filters: ['political_views', 'has_children', 'smoking'],
    meaning: 'These are people you would likely enjoy dating. Shared context reduces friction.',
    coachingContext: 'If this drops significantly from Realistic, your lifestyle filters are costly.',
    adjustmentType: 'LIFESTYLE_PREFERENCES',
    adjustmentDifficulty: 'medium', // Moderate - some flexibility possible
    typicalPercentOfRealistic: { healthy: 0.50, tight: 0.25, crisis: 0.10 }
  },
  
  ideal: {
    name: 'Ideal Pool',
    description: 'Preferred matches who also meet your physical and appearance standards',
    filters: ['height', 'body_type', 'fitness_level'],
    meaning: 'These are people who check every box. The ceiling of selectivity.',
    coachingContext: 'Physical filters often have the highest cost-per-filter. Each one cuts deeply.',
    adjustmentType: 'PHYSICAL_PREFERENCES',
    adjustmentDifficulty: 'low', // Easiest to adjust - often inflated by aspiration
    typicalPercentOfPreferred: { healthy: 0.40, tight: 0.15, crisis: 0.05 }
  }
};

/**
 * Filter cost analysis - how much each filter typically costs
 * Based on typical US distributions
 */
const FILTER_COST_ESTIMATES = {
  // Realistic tier filters
  age_range: {
    name: 'Age Range',
    typicalCost: 0.30, // 30% of pool typically excluded
    highCostThreshold: 0.50,
    costDrivers: ['narrow_range', 'young_preference', 'large_gap_sought'],
    adjustmentOptions: [
      { action: 'Expand range by 5 years', typicalGain: 0.15 },
      { action: 'Expand range by 10 years', typicalGain: 0.30 },
      { action: 'Shift range to match your age Ã‚Â±5', typicalGain: 0.20 }
    ],
    coachingNote: 'Age preferences often reflect assumptions rather than experience. Many successful relationships exist outside "preferred" age ranges.'
  },
  
  minimum_income: {
    name: 'Minimum Income',
    typicalCost: 0.40,
    highCostThreshold: 0.60,
    costDrivers: ['high_threshold', 'small_market', 'young_target_age'],
    adjustmentOptions: [
      { action: 'Lower threshold by $25k', typicalGain: 0.15 },
      { action: 'Remove income requirement', typicalGain: 0.40 },
      { action: 'Focus on trajectory over current income', typicalGain: 0.20 }
    ],
    coachingNote: 'Income requirements disproportionately affect younger markets and smaller cities. Consider potential over current state.'
  },
  
  // Preferred tier filters
  political_views: {
    name: 'Political Views',
    typicalCost: 0.35,
    highCostThreshold: 0.50,
    costDrivers: ['single_party_only', 'extreme_positions', 'mismatch_with_market'],
    adjustmentOptions: [
      { action: 'Add "moderate" to acceptable', typicalGain: 0.20 },
      { action: 'Remove political filter', typicalGain: 0.35 },
      { action: 'Relocate to politically aligned market', typicalGain: 0.25 }
    ],
    coachingNote: 'Political compatibility matters for values alignment, but many couples thrive across moderate differences.'
  },
  
  has_children: {
    name: 'Has Children',
    typicalCost: 0.45,
    highCostThreshold: 0.50,
    costDrivers: ['no_kids_only_over_35', 'yes_kids_only_under_30'],
    adjustmentOptions: [
      { action: 'Accept either status', typicalGain: 0.45 },
      { action: 'Consider your actual dealbreaker', typicalGain: 0.20 }
    ],
    coachingNote: 'By age 40, roughly half of singles have children. "No kids" filters become very costly in older demographics.'
  },
  
  smoking: {
    name: 'Smoking Status',
    typicalCost: 0.15,
    highCostThreshold: 0.20,
    costDrivers: ['non_smoker_only'],
    adjustmentOptions: [
      { action: 'Accept occasional/social smokers', typicalGain: 0.10 },
      { action: 'Remove filter', typicalGain: 0.15 }
    ],
    coachingNote: 'Smoking rates have declined significantly. This filter is usually low-cost.'
  },
  
  // Ideal tier filters
  height: {
    name: 'Height Requirement',
    typicalCost: 0.50,
    highCostThreshold: 0.60,
    costDrivers: ['6ft_plus_requirement', 'tall_woman_seeking_taller'],
    adjustmentOptions: [
      { action: 'Lower requirement by 2 inches', typicalGain: 0.20 },
      { action: 'Remove height filter', typicalGain: 0.50 },
      { action: 'Set relative to your height (+2 inches)', typicalGain: 0.15 }
    ],
    coachingNote: 'Only 14% of men are 6\'0" or taller. Height requirements are among the most expensive filters.'
  },
  
  body_type: {
    name: 'Body Type',
    typicalCost: 0.40,
    highCostThreshold: 0.50,
    costDrivers: ['athletic_only', 'slim_only', 'single_type_selected'],
    adjustmentOptions: [
      { action: 'Add one adjacent body type', typicalGain: 0.15 },
      { action: 'Accept "average" and above', typicalGain: 0.30 },
      { action: 'Remove body type filter', typicalGain: 0.40 }
    ],
    coachingNote: 'Body type preferences often reflect media ideals rather than actual attraction patterns. Real attraction is more flexible.'
  },
  
  fitness_level: {
    name: 'Fitness Level',
    typicalCost: 0.35,
    highCostThreshold: 0.45,
    costDrivers: ['very_fit_only', 'athletic_only'],
    adjustmentOptions: [
      { action: 'Accept "average fitness" and above', typicalGain: 0.20 },
      { action: 'Remove fitness filter', typicalGain: 0.35 }
    ],
    coachingNote: 'Consider whether you need a gym partner or just someone healthy. These are different filters.'
  }
};

/**
 * Analyze the gaps between pool tiers and generate coaching
 * 
 * @param {Object} poolResult - Output from calculateMatchPool()
 * @param {Object} preferences - User's stated preferences
 * @param {Object} demographics - User's own demographics
 * @returns {Object} Tier analysis with coaching recommendations
 */
function analyzePoolTiers(poolResult, preferences, demographics) {
  const { localSinglePool, realisticPool, preferredPool, idealPool, funnel } = poolResult;
  
  const analysis = {
    tiers: {
      local: { count: localSinglePool, label: 'All Singles in Your Market' },
      realistic: { 
        count: realisticPool, 
        label: 'Realistic Pool',
        percentOfLocal: localSinglePool > 0 ? (realisticPool / localSinglePool) : 0,
        dropFromPrevious: localSinglePool - realisticPool
      },
      preferred: { 
        count: preferredPool, 
        label: 'Preferred Pool',
        percentOfRealistic: realisticPool > 0 ? (preferredPool / realisticPool) : 0,
        dropFromPrevious: realisticPool - preferredPool
      },
      ideal: { 
        count: idealPool, 
        label: 'Ideal Pool',
        percentOfPreferred: preferredPool > 0 ? (idealPool / preferredPool) : 0,
        dropFromPrevious: preferredPool - idealPool
      }
    },
    
    health: null, // Will be set below
    bottleneck: null, // Which tier is causing the biggest problem
    costlyFilters: [], // Filters that are disproportionately expensive
    recommendations: [], // Specific coaching recommendations
    tradeoffAnalysis: null // What they gain by adjusting
  };
  
  // Determine overall health
  if (idealPool >= 500) {
    analysis.health = {
      status: 'healthy',
      message: 'Your Ideal Pool is substantial. You have real options.',
      urgency: 'none'
    };
  } else if (idealPool >= 100) {
    analysis.health = {
      status: 'tight',
      message: 'Your Ideal Pool is manageable but limited. Consider which filters matter most.',
      urgency: 'low'
    };
  } else if (idealPool >= 25) {
    analysis.health = {
      status: 'constrained',
      message: 'Your Ideal Pool is quite small. You may need to adjust expectations or expand search.',
      urgency: 'medium'
    };
  } else if (idealPool >= 5) {
    analysis.health = {
      status: 'critical',
      message: 'Your Ideal Pool is nearly empty. Significant adjustments needed for realistic dating.',
      urgency: 'high'
    };
  } else {
    analysis.health = {
      status: 'unrealistic',
      message: 'Your filters have eliminated virtually everyone. This combination does not exist in meaningful numbers.',
      urgency: 'critical'
    };
  }
  
  // Identify bottleneck tier
  const realToLocalRatio = analysis.tiers.realistic.percentOfLocal;
  const prefToRealRatio = analysis.tiers.preferred.percentOfRealistic;
  const idealToPrefRatio = analysis.tiers.ideal.percentOfPreferred;
  
  const thresholds = POOL_TIER_DEFINITIONS;
  
  if (realToLocalRatio < thresholds.realistic.typicalPercentOfLocal.crisis) {
    analysis.bottleneck = {
      tier: 'realistic',
      severity: 'critical',
      message: 'Your age and income requirements are eliminating most of the market.',
      filters: ['age_range', 'minimum_income']
    };
  } else if (prefToRealRatio < thresholds.preferred.typicalPercentOfRealistic.crisis) {
    analysis.bottleneck = {
      tier: 'preferred',
      severity: 'critical',
      message: 'Your lifestyle filters (politics, kids, smoking) are very costly in your market.',
      filters: ['political_views', 'has_children', 'smoking']
    };
  } else if (idealToPrefRatio < thresholds.ideal.typicalPercentOfPreferred.crisis) {
    analysis.bottleneck = {
      tier: 'ideal',
      severity: 'critical',
      message: 'Your physical preferences are eliminating most compatible matches.',
      filters: ['height', 'body_type', 'fitness_level']
    };
  } else if (realToLocalRatio < thresholds.realistic.typicalPercentOfLocal.tight) {
    analysis.bottleneck = {
      tier: 'realistic',
      severity: 'moderate',
      message: 'Your core requirements are stricter than average.',
      filters: ['age_range', 'minimum_income']
    };
  } else if (idealToPrefRatio < thresholds.ideal.typicalPercentOfPreferred.tight) {
    analysis.bottleneck = {
      tier: 'ideal',
      severity: 'moderate',
      message: 'Your physical preferences are narrowing your options significantly.',
      filters: ['height', 'body_type', 'fitness_level']
    };
  }
  
  // Analyze individual filter costs from funnel
  funnel.forEach(step => {
    if (step.filter && !step.isMilestone) {
      const filterPercent = parseFloat(step.filter) / 100;
      if (filterPercent < 0.50) { // Filter removes more than half
        analysis.costlyFilters.push({
          stage: step.stage,
          retention: filterPercent,
          cost: 1 - filterPercent,
          remaining: step.count
        });
      }
    }
  });
  
  // Sort costly filters by cost
  analysis.costlyFilters.sort((a, b) => b.cost - a.cost);
  
  // Generate specific recommendations
  if (analysis.bottleneck) {
    analysis.bottleneck.filters.forEach(filterKey => {
      const filterInfo = FILTER_COST_ESTIMATES[filterKey];
      if (filterInfo) {
        filterInfo.adjustmentOptions.forEach(option => {
          analysis.recommendations.push({
            filter: filterKey,
            filterName: filterInfo.name,
            action: option.action,
            estimatedGain: option.typicalGain,
            potentialNewPool: Math.round(idealPool / (1 - option.typicalGain)),
            note: filterInfo.coachingNote
          });
        });
      }
    });
  }
  
  // Tradeoff analysis
  if (analysis.health.status !== 'healthy') {
    const potentialWithRelaxedIdeal = preferredPool; // If all Ideal filters removed
    const potentialWithRelaxedPreferred = realisticPool; // If Ideal + Preferred filters removed
    
    analysis.tradeoffAnalysis = {
      currentIdealPool: idealPool,
      ifRelaxPhysical: {
        pool: preferredPool,
        gain: preferredPool - idealPool,
        gainPercent: idealPool > 0 ? ((preferredPool - idealPool) / idealPool * 100) : 0,
        whatYouLose: 'Certainty about height, body type, fitness level',
        whatYouGain: 'Access to people who match your values and lifestyle'
      },
      ifRelaxLifestyle: {
        pool: realisticPool,
        gain: realisticPool - idealPool,
        gainPercent: idealPool > 0 ? ((realisticPool - idealPool) / idealPool * 100) : 0,
        whatYouLose: 'Alignment on politics, kids, smoking',
        whatYouGain: 'Access to people who meet your core requirements'
      },
      recommendation: null
    };
    
    // Determine which relaxation is most beneficial
    if (preferredPool > idealPool * 3) {
      analysis.tradeoffAnalysis.recommendation = {
        tier: 'ideal',
        message: 'Your biggest gains come from relaxing physical preferences. Your Preferred Pool is 3x+ your Ideal Pool.',
        priority: 'high'
      };
    } else if (realisticPool > preferredPool * 3) {
      analysis.tradeoffAnalysis.recommendation = {
        tier: 'preferred',
        message: 'Your lifestyle filters are very costly. Consider which truly matter vs. which are nice-to-haves.',
        priority: 'high'
      };
    }
  }
  
  return analysis;
}

/**
 * Generate coaching message for pool tier analysis
 */
function generatePoolCoaching(tierAnalysis, personaDemandLevel) {
  const coaching = {
    headline: null,
    context: null,
    primaryRecommendation: null,
    secondaryRecommendations: [],
    personaAlignment: null,
    nextSteps: []
  };
  
  // Headline based on health status
  const healthMessages = {
    healthy: 'Your dating pool is healthy. Focus on quality over quantity.',
    tight: 'Your dating pool is workable but tight. Small adjustments could open significant doors.',
    constrained: 'Your dating pool is constrained. Without adjustment, you may face a numbers problem.',
    critical: 'Your dating pool is critically small. Your current filters are not compatible with your market.',
    unrealistic: 'Your filter combination does not exist in meaningful numbers. This is not a pool - it is a fantasy.'
  };
  
  coaching.headline = healthMessages[tierAnalysis.health.status];
  
  // Context based on bottleneck
  if (tierAnalysis.bottleneck) {
    const tierContexts = {
      realistic: 'The issue is at the foundation - your age and income requirements are eliminating candidates before other factors are considered.',
      preferred: 'Your core requirements are reasonable, but lifestyle filters (politics, kids, smoking) are proving costly in your market.',
      ideal: 'Your lifestyle match pool is solid, but physical preferences are narrowing it significantly. This is the most common bottleneck.'
    };
    coaching.context = tierContexts[tierAnalysis.bottleneck.tier];
  }
  
  // Primary recommendation
  if (tierAnalysis.recommendations && tierAnalysis.recommendations.length > 0) {
    const topRec = tierAnalysis.recommendations[0];
    coaching.primaryRecommendation = {
      action: topRec.action,
      filter: topRec.filterName,
      impact: `Could increase your pool by approximately ${Math.round(topRec.estimatedGain * 100)}%`,
      note: topRec.note
    };
  }
  
  // Secondary recommendations
  coaching.secondaryRecommendations = (tierAnalysis.recommendations || []).slice(1, 4).map(rec => ({
    action: rec.action,
    filter: rec.filterName
  }));
  
  // Persona alignment check
  if (personaDemandLevel) {
    const demandAlignmentMessages = {
      very_high: {
        healthy: 'Your healthy pool supports pursuing high-demand personas, but competition will be fierce.',
        tight: 'High-demand personas like your target require maximum pool access. Consider relaxing filters.',
        constrained: 'Your target persona is very high demand. Your constrained pool makes this very difficult.',
        critical: 'You are seeking a high-demand persona with a critically small pool. This combination is extremely unlikely to succeed.',
        unrealistic: 'High-demand personas require market access you do not have. Fundamental recalibration needed.'
      },
      high: {
        healthy: 'Your pool supports pursuing high-demand personas. Solid position.',
        tight: 'Your target is high-demand. A tight pool is workable but not ideal.',
        constrained: 'Your target is high-demand and your pool is constrained. Consider adjustments.',
        critical: 'High-demand target + critical pool = very low probability. Adjust targets or filters.',
        unrealistic: 'Recalibration needed - your pool cannot support your target.'
      },
      moderate: {
        healthy: 'Excellent position - healthy pool pursuing moderate-demand target.',
        tight: 'Moderate-demand targets are accessible even with a tight pool.',
        constrained: 'Your moderate-demand target is achievable but filters are costing you options.',
        critical: 'Even moderate-demand targets need more pool than this. Time to adjust.',
        unrealistic: 'Pool recalibration needed.'
      },
      low: {
        healthy: 'Strong position - large pool for accessible target.',
        tight: 'Low-demand targets are very achievable. Your pool is fine.',
        constrained: 'Your accessible target does not require this much filtering. Consider why you are limiting yourself.',
        critical: 'You are over-filtering for a target that does not require it. Relax constraints.',
        unrealistic: 'Your filters are eliminating even accessible partners. Significant recalibration needed.'
      },
      very_low: {
        healthy: 'Maximum optionality. Your target is accessible and your pool is large.',
        tight: 'Your accessible target is within reach. Pool size is not your limiting factor.',
        constrained: 'You are filtering aggressively for a target that does not require it. Why?',
        critical: 'Your filters are self-sabotaging. Your target is accessible but you have eliminated them.',
        unrealistic: 'Fundamental mismatch between your filters and reality.'
      }
    };
    
    const demandLevel = personaDemandLevel.toLowerCase().replace(' ', '_');
    const healthStatus = tierAnalysis.health.status;
    
    if (demandAlignmentMessages[demandLevel] && demandAlignmentMessages[demandLevel][healthStatus]) {
      coaching.personaAlignment = demandAlignmentMessages[demandLevel][healthStatus];
    }
  }
  
  // Next steps based on urgency
  if (tierAnalysis.health.urgency === 'critical') {
    coaching.nextSteps = [
      'Identify which 1-2 filters are truly non-negotiable vs. preferences',
      'Test removing the most costly filter and observe pool change',
      'Consider whether your target persona matches your market access',
      'Evaluate relocation to a larger or better-aligned market'
    ];
  } else if (tierAnalysis.health.urgency === 'high') {
    coaching.nextSteps = [
      'Review your Ideal tier filters (physical preferences) for flexibility',
      'Consider whether media-influenced standards match real attraction',
      'Test expanding one filter and observe how it feels'
    ];
  } else if (tierAnalysis.health.urgency === 'medium') {
    coaching.nextSteps = [
      'Your pool is workable but optimization could help',
      'Identify which filters give you the least value for their cost',
      'Consider expanding search radius or using multiple apps'
    ];
  } else {
    coaching.nextSteps = [
      'Focus on profile optimization and first-message quality',
      'Your numbers are solid - success is about execution now',
      'Consider whether you are being too passive vs. too selective'
    ];
  }
  
  return coaching;
}

// =============================================================================
// PERSONA DEMAND LEVELS
// =============================================================================
// Some personas are "high demand" - they require above-average demographics to access
// This maps each persona code to its structural requirements

const PERSONA_DEMAND_PROFILES = {
  // Women personas (what men want) - demand level for HIM to access HER
  W2: {
    'ACEG': { // The Debutante
      demandLevel: 'very_high',
      name: 'The Debutante',
      requirements: {
        income: { min: 100000, ideal: 150000, reason: 'Expects traditional provision and exciting lifestyle' },
        age: { maxGap: 10, reason: 'High-value women have options; large age gaps reduce access' },
        fitness: { min: 'average', ideal: 'fit', reason: 'Beauty-seeking is reciprocal; she has physical standards too' },
        location: { minPopulation: 500000, reason: 'These women concentrate in major metros' }
      },
      accessWarning: 'The Debutante expects to be pursued by high-status men who can provide an exciting, aesthetically pleasing life with traditional structure.'
    },
    'ACEH': { // The Correspondent
      demandLevel: 'high',
      name: 'The Correspondent',
      requirements: {
        income: { min: 75000, ideal: 120000, reason: 'Adventurous lifestyle requires resources' },
        age: { maxGap: 12, reason: 'Values experience but also excitement' },
        fitness: { min: 'average', ideal: 'fit', reason: 'Active lifestyle expectation' },
        location: { minPopulation: 250000, reason: 'Career-oriented women in mid-to-large markets' }
      },
      accessWarning: 'The Correspondent is adventurous and egalitarian but still expects a partner who can keep up with her ambitions.'
    },
    'ACFG': { // The Duchess
      demandLevel: 'very_high',
      name: 'The Duchess',
      requirements: {
        income: { min: 150000, ideal: 250000, reason: 'Expects stability AND status' },
        age: { maxGap: 8, reason: 'Traditional values often mean age-appropriate matching' },
        fitness: { min: 'average', ideal: 'average', reason: 'Less physically focused' },
        location: { minPopulation: 100000, reason: 'Can exist in smaller affluent communities' }
      },
      accessWarning: 'The Duchess expects traditional provision with stability and social standing. She is selecting for demonstrated success.'
    },
    'ACFH': { // The Influencer
      demandLevel: 'high',
      name: 'The Influencer',
      requirements: {
        income: { min: 75000, ideal: 100000, reason: 'Stable lifestyle to complement her visibility' },
        age: { maxGap: 10, reason: 'Image-conscious; age gap affects her brand' },
        fitness: { min: 'average', ideal: 'fit', reason: 'Appearance matters in her world' },
        location: { minPopulation: 500000, reason: 'Major metros where influence is built' }
      },
      accessWarning: 'The Influencer needs a partner who fits her public image and supports her ambitions equally.'
    },
    'ADEG': { // The Barrel Racer
      demandLevel: 'moderate',
      name: 'The Barrel Racer',
      requirements: {
        income: { min: 50000, ideal: 75000, reason: 'Traditional but not lavish expectations' },
        age: { maxGap: 15, reason: 'Traditional values accept broader age ranges' },
        fitness: { min: 'average', ideal: 'fit', reason: 'Active lifestyle valued' },
        location: { minPopulation: 50000, reason: 'Can thrive in smaller/rural markets' }
      },
      accessWarning: 'The Barrel Racer wants traditional adventure - she is more accessible but expects you to lead an active life.'
    },
    'ADEH': { // The Podcaster
      demandLevel: 'moderate',
      name: 'The Podcaster',
      requirements: {
        income: { min: 50000, ideal: 75000, reason: 'Egalitarian on provision' },
        age: { maxGap: 12, reason: 'Values connection over convention' },
        fitness: { min: 'average', ideal: 'average', reason: 'Presence matters more than physique' },
        location: { minPopulation: 100000, reason: 'Needs intellectual community' }
      },
      accessWarning: 'The Podcaster is warm and adventurous with realistic expectations - focus on genuine connection.'
    },
    'ADFG': { // The Trophy
      demandLevel: 'high',
      name: 'The Trophy',
      requirements: {
        income: { min: 100000, ideal: 150000, reason: 'Traditional provision for peaceful lifestyle' },
        age: { maxGap: 12, reason: 'Traditional roles accept some age gap' },
        fitness: { min: 'average', ideal: 'average', reason: 'Stability over excitement' },
        location: { minPopulation: 100000, reason: 'Suburban/stable communities' }
      },
      accessWarning: 'The Trophy offers beauty and warmth in exchange for stability and traditional provision.'
    },
    'ADFH': { // The Girl Next Door
      demandLevel: 'low',
      name: 'The Girl Next Door',
      requirements: {
        income: { min: 35000, ideal: 60000, reason: 'Egalitarian; shares financial responsibility' },
        age: { maxGap: 15, reason: 'Values character over demographics' },
        fitness: { min: 'any', ideal: 'average', reason: 'Not appearance-focused' },
        location: { minPopulation: 25000, reason: 'Everywhere; not market-dependent' }
      },
      accessWarning: 'The Girl Next Door is warm, grounded, and accessible - demographic barriers are minimal.'
    },
    'BCEG': { // The Party Planner
      demandLevel: 'high',
      name: 'The Party Planner',
      requirements: {
        income: { min: 75000, ideal: 100000, reason: 'Social lifestyle requires resources' },
        age: { maxGap: 10, reason: 'Socially visible; age affects dynamics' },
        fitness: { min: 'average', ideal: 'average', reason: 'Confidence over physique' },
        location: { minPopulation: 250000, reason: 'Needs social scene to thrive' }
      },
      accessWarning: 'The Party Planner commands social attention and expects a partner who can participate in her world.'
    },
    'BCEH': { // The Marketer
      demandLevel: 'moderate',
      name: 'The Marketer',
      requirements: {
        income: { min: 60000, ideal: 90000, reason: 'Career-focused; expects peer' },
        age: { maxGap: 12, reason: 'Egalitarian but professional' },
        fitness: { min: 'average', ideal: 'average', reason: 'Professional presence matters' },
        location: { minPopulation: 250000, reason: 'Career markets' }
      },
      accessWarning: 'The Marketer is confident and ambitious - she wants a partner, not a project.'
    },
    'BCFG': { // The Executive
      demandLevel: 'very_high',
      name: 'The Executive',
      requirements: {
        income: { min: 100000, ideal: 150000, reason: 'Expects peer-level success or traditional complement' },
        age: { maxGap: 8, reason: 'Status-conscious; age affects perception' },
        fitness: { min: 'average', ideal: 'average', reason: 'Professional polish matters' },
        location: { minPopulation: 500000, reason: 'Executive roles concentrate in major markets' }
      },
      accessWarning: 'The Executive has achieved and expects either a peer or someone who can provide traditional stability at her level.'
    },
    'BCFH': { // The Producer
      demandLevel: 'moderate',
      name: 'The Producer',
      requirements: {
        income: { min: 50000, ideal: 80000, reason: 'Egalitarian; values partnership over provision' },
        age: { maxGap: 12, reason: 'Flexible on convention' },
        fitness: { min: 'any', ideal: 'average', reason: 'Values substance' },
        location: { minPopulation: 100000, reason: 'Creative/professional communities' }
      },
      accessWarning: 'The Producer creates and builds - she wants a co-creator, not a consumer.'
    },
    'BDEG': { // The Coach
      demandLevel: 'low',
      name: 'The Coach',
      requirements: {
        income: { min: 40000, ideal: 60000, reason: 'Traditional but practical' },
        age: { maxGap: 15, reason: 'Values character and shared mission' },
        fitness: { min: 'average', ideal: 'fit', reason: 'Active lifestyle important' },
        location: { minPopulation: 25000, reason: 'Community-oriented; anywhere' }
      },
      accessWarning: 'The Coach is grounded and traditional with accessible expectations - lead with character.'
    },
    'BDEH': { // The Founder
      demandLevel: 'moderate',
      name: 'The Founder',
      requirements: {
        income: { min: 50000, ideal: 80000, reason: 'Building something; needs stable partner' },
        age: { maxGap: 12, reason: 'Mission-focused over convention' },
        fitness: { min: 'any', ideal: 'average', reason: 'Values depth' },
        location: { minPopulation: 100000, reason: 'Entrepreneurial ecosystems' }
      },
      accessWarning: 'The Founder is building her vision - she needs a partner who supports without controlling.'
    },
    'BDFG': { // The Designer
      demandLevel: 'low',
      name: 'The Designer',
      requirements: {
        income: { min: 40000, ideal: 65000, reason: 'Traditional but creative; not materialistic' },
        age: { maxGap: 15, reason: 'Values aesthetic and character' },
        fitness: { min: 'any', ideal: 'average', reason: 'Confidence over physique' },
        location: { minPopulation: 50000, reason: 'Creative communities exist everywhere' }
      },
      accessWarning: 'The Designer values beauty and stability but is accessible - lead with authenticity and vision.'
    },
    'BDFH': { // The Therapist
      demandLevel: 'very_low',
      name: 'The Therapist',
      requirements: {
        income: { min: 30000, ideal: 50000, reason: 'Egalitarian; not income-focused' },
        age: { maxGap: 20, reason: 'Values depth; age is just context' },
        fitness: { min: 'any', ideal: 'any', reason: 'Sees past physical' },
        location: { minPopulation: 10000, reason: 'Values community; anywhere' }
      },
      accessWarning: 'The Therapist sees you for who you are - demographic barriers are minimal. Lead with emotional availability.'
    }
  },
  
  // Men personas (what women want) - demand level for HER to access HIM
  M2: {
    'ACEG': { // The Gladiator
      demandLevel: 'very_high',
      name: 'The Gladiator',
      requirements: {
        age: { maxAge: 45, reason: 'These men typically partner younger; supply decreases with her age' },
        fitness: { min: 'average', ideal: 'fit', reason: 'Physical match expected' },
        location: { minPopulation: 250000, reason: 'Athletic/competitive men concentrate in metros' },
        attractiveness: { min: 'above_average', reason: 'Gladiators have abundant options' }
      },
      accessWarning: 'The Gladiator is elite and knows it. He has options and typically selects for beauty and traditional femininity.'
    },
    'ACEH': { // The Maverick
      demandLevel: 'high',
      name: 'The Maverick',
      requirements: {
        age: { maxAge: 50, reason: 'Mavericks value energy and can partner across ages' },
        fitness: { min: 'average', ideal: 'fit', reason: 'Active lifestyle' },
        location: { minPopulation: 200000, reason: 'Innovation/adventure hubs' },
        attractiveness: { min: 'average', reason: 'Values spark over conventional beauty' }
      },
      accessWarning: 'The Maverick wants a co-adventurer, not a follower. He needs someone who can match his energy.'
    },
    'ACFG': { // The Spy
      demandLevel: 'high',
      name: 'The Spy',
      requirements: {
        age: { maxAge: 50, reason: 'Traditional values accept age range' },
        fitness: { min: 'average', ideal: 'fit', reason: 'Maintains himself; expects same' },
        location: { minPopulation: 100000, reason: 'Can exist in various markets' },
        attractiveness: { min: 'average', reason: 'Traditional but not flashy' }
      },
      accessWarning: 'The Spy is capable and traditional but private. Trust is earned slowly.'
    },
    'ACFH': { // The Engineer
      demandLevel: 'moderate',
      name: 'The Engineer',
      requirements: {
        age: { maxAge: 55, reason: 'Egalitarian; values intellectual match' },
        fitness: { min: 'any', ideal: 'average', reason: 'Mind over body focus' },
        location: { minPopulation: 100000, reason: 'Technical hubs' },
        attractiveness: { min: 'average', reason: 'Practical orientation' }
      },
      accessWarning: 'The Engineer builds systems - he wants a partner who thinks, not just feels.'
    },
    'ADEG': { // The Cowboy
      demandLevel: 'moderate',
      name: 'The Cowboy',
      requirements: {
        age: { maxAge: 55, reason: 'Traditional; accepts broader age range' },
        fitness: { min: 'average', ideal: 'fit', reason: 'Active lifestyle required' },
        location: { minPopulation: 25000, reason: 'Rural/outdoor markets' },
        attractiveness: { min: 'average', reason: 'Character over flash' }
      },
      accessWarning: 'The Cowboy is grounded and traditional - he wants loyalty and shared values over urban polish.'
    },
    'ADEH': { // The Sherpa
      demandLevel: 'low',
      name: 'The Sherpa',
      requirements: {
        age: { maxAge: 60, reason: 'Values depth; flexible on age' },
        fitness: { min: 'average', ideal: 'fit', reason: 'Active but accepting' },
        location: { minPopulation: 25000, reason: 'Anywhere with nature/adventure' },
        attractiveness: { min: 'any', reason: 'Sees past surface' }
      },
      accessWarning: 'The Sherpa guides others - he is accessible to those who value presence and growth.'
    },
    'ADFG': { // The Curator
      demandLevel: 'moderate',
      name: 'The Curator',
      requirements: {
        age: { maxAge: 55, reason: 'Traditional; appreciates maturity' },
        fitness: { min: 'any', ideal: 'average', reason: 'Aesthetic but not gym-focused' },
        location: { minPopulation: 50000, reason: 'Cultural communities' },
        attractiveness: { min: 'average', reason: 'Values style and taste' }
      },
      accessWarning: 'The Curator values beauty and order - he appreciates those who create harmony.'
    },
    'ADFH': { // The Recruiter
      demandLevel: 'low',
      name: 'The Recruiter',
      requirements: {
        age: { maxAge: 60, reason: 'Egalitarian; values capability' },
        fitness: { min: 'any', ideal: 'average', reason: 'Presence over physique' },
        location: { minPopulation: 50000, reason: 'Professional communities' },
        attractiveness: { min: 'any', reason: 'Sees potential' }
      },
      accessWarning: 'The Recruiter develops talent - he is accessible to those with genuine ambition.'
    },
    'BCEG': { // The Legionnaire
      demandLevel: 'high',
      name: 'The Legionnaire',
      requirements: {
        age: { maxAge: 50, reason: 'Traditional structure; respects age dynamics' },
        fitness: { min: 'average', ideal: 'average', reason: 'Values loyalty over appearance' },
        location: { minPopulation: 100000, reason: 'Institutional settings' },
        attractiveness: { min: 'average', reason: 'Character-focused' }
      },
      accessWarning: 'The Legionnaire serves a code - he expects the same commitment he gives.'
    },
    'BCEH': { // The Astronaut
      demandLevel: 'high',
      name: 'The Astronaut',
      requirements: {
        age: { maxAge: 55, reason: 'Accomplished; flexible but ambitious' },
        fitness: { min: 'average', ideal: 'average', reason: 'Achievement-focused' },
        location: { minPopulation: 250000, reason: 'Innovation/achievement hubs' },
        attractiveness: { min: 'average', reason: 'Values drive' }
      },
      accessWarning: 'The Astronaut has achieved - he wants someone who can share the journey, not spectate.'
    },
    'BCFG': { // The Statesman
      demandLevel: 'very_high',
      name: 'The Statesman',
      requirements: {
        age: { maxAge: 50, reason: 'Public role; age affects dynamics' },
        fitness: { min: 'average', ideal: 'average', reason: 'Professional polish' },
        location: { minPopulation: 500000, reason: 'Power centers' },
        attractiveness: { min: 'above_average', reason: 'Public-facing; image matters' }
      },
      accessWarning: 'The Statesman operates in public - he needs a partner who enhances his position.'
    },
    'BCFH': { // The Professor
      demandLevel: 'low',
      name: 'The Professor',
      requirements: {
        age: { maxAge: 65, reason: 'Values intellectual connection' },
        fitness: { min: 'any', ideal: 'any', reason: 'Mind-focused' },
        location: { minPopulation: 50000, reason: 'Academic/intellectual communities' },
        attractiveness: { min: 'any', reason: 'Sees beyond surface' }
      },
      accessWarning: 'The Professor values ideas - lead with curiosity and depth.'
    },
    'BDEG': { // The Ranger
      demandLevel: 'low',
      name: 'The Ranger',
      requirements: {
        age: { maxAge: 60, reason: 'Traditional but grounded' },
        fitness: { min: 'average', ideal: 'fit', reason: 'Active outdoor life' },
        location: { minPopulation: 10000, reason: 'Rural/nature settings' },
        attractiveness: { min: 'any', reason: 'Character over appearance' }
      },
      accessWarning: 'The Ranger protects what matters - he is accessible to those who share his values.'
    },
    'BDEH': { // The Playwright
      demandLevel: 'very_low',
      name: 'The Playwright',
      requirements: {
        age: { maxAge: 65, reason: 'Values emotional depth' },
        fitness: { min: 'any', ideal: 'any', reason: 'Soul over body' },
        location: { minPopulation: 25000, reason: 'Creative communities anywhere' },
        attractiveness: { min: 'any', reason: 'Sees the story, not the cover' }
      },
      accessWarning: 'The Playwright sees your story - demographic barriers are minimal.'
    },
    'BDFG': { // The Arborist
      demandLevel: 'very_low',
      name: 'The Arborist',
      requirements: {
        age: { maxAge: 65, reason: 'Values roots and growth' },
        fitness: { min: 'any', ideal: 'average', reason: 'Practical' },
        location: { minPopulation: 10000, reason: 'Anywhere with community' },
        attractiveness: { min: 'any', reason: 'Sees character' }
      },
      accessWarning: 'The Arborist cultivates growth - he is accessible and values what you are becoming.'
    },
    'BDFH': { // The Builder
      demandLevel: 'very_low',
      name: 'The Builder',
      requirements: {
        age: { maxAge: 65, reason: 'Egalitarian; values partnership' },
        fitness: { min: 'any', ideal: 'any', reason: 'Values capability' },
        location: { minPopulation: 10000, reason: 'Anywhere' },
        attractiveness: { min: 'any', reason: 'Sees potential and character' }
      },
      accessWarning: 'The Builder creates foundations - demographic barriers are minimal. Lead with authenticity.'
    }
  }
};

// =============================================================================
// DEMOGRAPHIC MISMATCH DETECTION
// =============================================================================

/**
 * Assess structural mismatch between what user wants (M1) and their demographics
 * This is Type 1 mismatch - can be detected before M2
 * 
 * @param {string} m1Code - The 4-letter code from M1 assessment
 * @param {string} userGender - 'M' or 'W'
 * @param {Object} demographics - User's demographic data
 * @returns {Object} Mismatch analysis with coaching flags
 */
function assessDemographicMismatch(m1Code, userGender, demographics) {
  // Determine which persona they want
  const targetGender = userGender === 'M' ? 'W2' : 'M2';
  const demandProfile = PERSONA_DEMAND_PROFILES[targetGender][m1Code];
  
  if (!demandProfile) {
    return { error: 'Unknown persona code', code: m1Code };
  }
  
  const mismatches = [];
  const warnings = [];
  const requirements = demandProfile.requirements;
  
  // Check income (for men seeking women primarily)
  if (requirements.income && demographics.income !== undefined) {
    if (demographics.income < requirements.income.min) {
      const gap = requirements.income.min - demographics.income;
      const severity = gap > 50000 ? 'severe' : gap > 25000 ? 'significant' : 'moderate';
      mismatches.push({
        type: 'INCOME_MISMATCH',
        severity: severity,
        userValue: demographics.income,
        required: requirements.income.min,
        ideal: requirements.income.ideal,
        reason: requirements.income.reason,
        coaching: `${demandProfile.name} typically expects partners earning $${requirements.income.min.toLocaleString()}+. Your income of $${demographics.income.toLocaleString()} may limit access to this archetype.`
      });
    }
  }
  
  // Check age dynamics
  if (requirements.age) {
    if (requirements.age.maxGap && demographics.age && demographics.targetAgeMin) {
      const ageGap = demographics.age - demographics.targetAgeMin;
      if (ageGap > requirements.age.maxGap) {
        mismatches.push({
          type: 'AGE_GAP_MISMATCH',
          severity: ageGap > requirements.age.maxGap + 10 ? 'severe' : 'moderate',
          userAge: demographics.age,
          targetAgeMin: demographics.targetAgeMin,
          maxAcceptableGap: requirements.age.maxGap,
          reason: requirements.age.reason,
          coaching: `You're seeking partners ${ageGap} years younger, but ${demandProfile.name} typically accepts gaps of ${requirements.age.maxGap} years or less.`
        });
      }
    }
    
    if (requirements.age.maxAge && demographics.age > requirements.age.maxAge) {
      mismatches.push({
        type: 'AGE_CEILING_MISMATCH',
        severity: demographics.age > requirements.age.maxAge + 10 ? 'severe' : 'moderate',
        userAge: demographics.age,
        maxTypicalAge: requirements.age.maxAge,
        reason: requirements.age.reason,
        coaching: `${demandProfile.name} is typically pursued by/pursues partners under ${requirements.age.maxAge}. At ${demographics.age}, your pool of this archetype is significantly reduced.`
      });
    }
  }
  
  // Check fitness
  if (requirements.fitness && demographics.fitness) {
    const fitnessLevels = { 'obese': 0, 'overweight': 1, 'average': 2, 'fit': 3 };
    const userFitness = fitnessLevels[demographics.fitness.toLowerCase()] || 2;
    const minFitness = fitnessLevels[requirements.fitness.min] || 0;
    
    if (userFitness < minFitness) {
      mismatches.push({
        type: 'FITNESS_MISMATCH',
        severity: userFitness < minFitness - 1 ? 'severe' : 'moderate',
        userLevel: demographics.fitness,
        requiredMin: requirements.fitness.min,
        reason: requirements.fitness.reason,
        coaching: `${demandProfile.name} typically expects partners who are at least ${requirements.fitness.min}. Your current fitness level may be a barrier.`,
        changeable: true,
        action: 'CHANGE'
      });
    }
  }
  
  // Check location/market size
  if (requirements.location && demographics.marketPopulation) {
    if (demographics.marketPopulation < requirements.location.minPopulation) {
      mismatches.push({
        type: 'MARKET_MISMATCH',
        severity: demographics.marketPopulation < requirements.location.minPopulation / 2 ? 'severe' : 'moderate',
        userMarket: demographics.marketPopulation,
        requiredMin: requirements.location.minPopulation,
        reason: requirements.location.reason,
        coaching: `${demandProfile.name} concentrates in markets of ${requirements.location.minPopulation.toLocaleString()}+ population. Your market may have very few.`,
        changeable: true,
        action: 'RELOCATE'
      });
    }
  }
  
  // Calculate overall mismatch severity
  const severityScores = { 'severe': 3, 'significant': 2, 'moderate': 1 };
  const totalSeverity = mismatches.reduce((sum, m) => sum + (severityScores[m.severity] || 1), 0);
  
  let overallAssessment;
  if (totalSeverity === 0) {
    overallAssessment = 'aligned';
  } else if (totalSeverity <= 2) {
    overallAssessment = 'minor_friction';
  } else if (totalSeverity <= 5) {
    overallAssessment = 'significant_barriers';
  } else {
    overallAssessment = 'structural_mismatch';
  }
  
  // Generate main coaching flag
  const coachingFlag = {
    type: 'DEMOGRAPHIC_MISMATCH',
    severity: overallAssessment,
    wantedPersona: demandProfile.name,
    demandLevel: demandProfile.demandLevel,
    mismatches: mismatches,
    summary: null,
    recommendation: null
  };
  
  if (overallAssessment === 'structural_mismatch') {
    coachingFlag.summary = `Your demographics create significant structural barriers to accessing ${demandProfile.name}. ${demandProfile.accessWarning}`;
    coachingFlag.recommendation = 'Consider whether this archetype reflects authentic desire or aspirational fantasy. Module 2 will help clarify what you actually offer and whether that attracts who you want.';
  } else if (overallAssessment === 'significant_barriers') {
    coachingFlag.summary = `Your demographics create some barriers to accessing ${demandProfile.name}, but the gap is bridgeable.`;
    coachingFlag.recommendation = 'Focus on changeable factors (fitness, location, income growth) while being realistic about timelines.';
  } else if (overallAssessment === 'minor_friction') {
    coachingFlag.summary = `Minor demographic friction with ${demandProfile.name} - manageable with positioning.`;
    coachingFlag.recommendation = 'Your demographics are workable. Focus on optimizing presentation and expanding search radius.';
  } else {
    coachingFlag.summary = `Your demographics align well with accessing ${demandProfile.name}.`;
    coachingFlag.recommendation = 'Demographic barriers are minimal. Success depends on what you offer (Module 2) and skills (Modules 3-4).';
  }
  
  return {
    m1Code: m1Code,
    wantedPersona: demandProfile.name,
    demandLevel: demandProfile.demandLevel,
    accessWarning: demandProfile.accessWarning,
    overallAssessment: overallAssessment,
    mismatches: mismatches,
    coachingFlag: coachingFlag,
    // Placeholder for Type 2 and 3 mismatches (need M2)
    pendingAnalysis: {
      type2_m1_vs_m2: 'Requires Module 2 completion',
      type3_m2_vs_demographics: 'Requires Module 2 completion'
    }
  };
}

// =============================================================================
// M1 Ã¢â€ â€™ MODIFIER SIGNAL EXTRACTION
// =============================================================================

/**
 * Detect cognitive dissonance (high agreement on opposing poles)
 * Signals potential low self-awareness or social desirability bias
 */
function detectDissonance(dimensionResult) {
  // Normalize to average per-question score (rough estimate based on question counts)
  const likertCount = 10; // 6 direct + 4 behavioral per pole
  const avgA = dimensionResult.poleAScore / (likertCount + dimensionResult.poleBScore > 0 ? 1 : 0);
  const avgB = dimensionResult.poleBScore / (likertCount + dimensionResult.poleAScore > 0 ? 1 : 0);
  
  // Dissonance: both poles scored highly (>70% of max) but low differentiation
  const maxPossible = likertCount * 5 + 12; // Likert max + forced choice
  const aRatio = dimensionResult.poleAScore / maxPossible;
  const bRatio = dimensionResult.poleBScore / maxPossible;
  
  const bothHigh = aRatio > 0.6 && bRatio > 0.6;
  const lowStrength = dimensionResult.strength < 25;
  
  return bothHigh && lowStrength;
}

/**
 * Extract modifier signals from M1 assessment results
 * These feed into the modifier system as partial skill indicators
 * 
 * @param {Object} m1Result - Output from scoreModule1()
 * @returns {Object} Signals for modifier system
 */
function extractModifierSignals(m1Result) {
  const signals = {
    // Self-Awareness Indicators
    selfAwareness: {
      level: 'moderate', // default
      confidence: 'low', // M1 alone cannot fully assess this
      evidence: []
    },
    
    // Flexibility/Adaptability Indicators
    adaptability: {
      level: 'moderate',
      confidence: 'medium',
      evidence: []
    },
    
    // Response Quality Indicators
    responseQuality: {
      carelessResponding: false,
      socialDesirability: false,
      cognitiveDissonance: [],
      confidence: 'medium'
    },
    
    // Flags for coaching
    coachingFlags: [],
    
    // Key Driver info (for relationship dynamics)
    keyDriver: m1Result.keyDriver
  };
  
  // Check each dimension for dissonance
  Object.entries(m1Result.dimensions).forEach(([dimName, dim]) => {
    if (detectDissonance(dim)) {
      signals.responseQuality.cognitiveDissonance.push(dimName);
      signals.coachingFlags.push({
        type: 'DISSONANCE',
        dimension: dimName,
        message: `You scored high on both ${dim.assignedPole} and its opposite. This may indicate unexamined preferences or conflicting desires worth exploring.`
      });
    }
  });
  
  // Assess self-awareness based on dissonance count
  const dissonanceCount = signals.responseQuality.cognitiveDissonance.length;
  if (dissonanceCount === 0) {
    signals.selfAwareness.level = 'high';
    signals.selfAwareness.evidence.push('Clear differentiation across all dimensions');
  } else if (dissonanceCount === 1) {
    signals.selfAwareness.level = 'moderate';
    signals.selfAwareness.evidence.push(`Some contradiction in ${signals.responseQuality.cognitiveDissonance[0]} dimension`);
  } else if (dissonanceCount === 2) {
    signals.selfAwareness.level = 'low';
    signals.selfAwareness.evidence.push('Multiple dimensions show contradictory preferences');
  } else {
    signals.selfAwareness.level = 'very_low';
    signals.selfAwareness.evidence.push('Widespread contradictions suggest unexamined preferences');
    signals.coachingFlags.push({
      type: 'ASSESSMENT_VALIDITY',
      message: 'Your responses showed contradictions across multiple areas. Consider retaking after reflection, or discuss with a coach.'
    });
  }
  
  // Assess adaptability based on flexibility ratings
  const flexibilityScores = Object.values(m1Result.dimensions).map(d => {
    if (d.flexibility === 'high') return 3;
    if (d.flexibility === 'moderate') return 2;
    return 1;
  });
  const avgFlexibility = flexibilityScores.reduce((a, b) => a + b, 0) / 4;
  
  if (avgFlexibility >= 2.5) {
    signals.adaptability.level = 'very_flexible';
    signals.adaptability.evidence.push('Balanced preferences across multiple dimensions');
    signals.coachingFlags.push({
      type: 'FLEXIBILITY',
      message: 'You show flexibility in what you seek. This expands your dating pool but may indicate you are still discovering your preferences.'
    });
  } else if (avgFlexibility >= 2) {
    signals.adaptability.level = 'flexible';
    signals.adaptability.evidence.push('Some flexibility in preferences');
  } else if (avgFlexibility >= 1.5) {
    signals.adaptability.level = 'moderate';
    signals.adaptability.evidence.push('Mix of clear and flexible preferences');
  } else {
    signals.adaptability.level = 'rigid';
    signals.adaptability.evidence.push('Strong, clear preferences across dimensions');
    signals.coachingFlags.push({
      type: 'RIGIDITY',
      message: 'You have very clear preferences. This helps targeting but narrows your pool. Ensure these are authentic, not defensive.'
    });
  }
  
  // Check for consistency issues (within-pole variance)
  Object.entries(m1Result.dimensions).forEach(([dimName, dim]) => {
    if (dim.consistency.poleA.rating === 'low' || dim.consistency.poleB.rating === 'low') {
      signals.responseQuality.carelessResponding = true;
      signals.coachingFlags.push({
        type: 'INCONSISTENT_RESPONSES',
        dimension: dimName,
        message: `Your ${dimName} responses varied significantly. This may indicate uncertainty or careless responding.`
      });
    }
  });
  
  // Include original flags
  m1Result.flags.forEach(flag => {
    if (flag.startsWith('BALANCED_')) {
      const dim = flag.replace('BALANCED_', '').toLowerCase();
      signals.coachingFlags.push({
        type: 'BALANCED_DIMENSION',
        dimension: dim,
        message: `You are genuinely balanced on ${dim}. Consider what contexts might tip your preference one way or another.`
      });
    }
  });
  
  return signals;
}

/**
 * Convert M1 signals to modifier system input format
 * 
 * @param {Object} signals - Output from extractModifierSignals()
 * @returns {Object} Partial userModifiers object for modifier system
 */
function signalsToModifierInput(signals) {
  // Map self-awareness level to skill score (1-100)
  const selfAwarenessMap = {
    'very_low': 25,
    'low': 40,
    'moderate': 55,
    'high': 75
  };
  
  // Map adaptability to a trait score
  const adaptabilityMap = {
    'rigid': 30,
    'moderate': 50,
    'flexible': 70,
    'very_flexible': 85
  };
  
  return {
    // Partial skill scores (to be combined with Module 3/4 results)
    partialSkills: {
      selfAwareness: {
        score: selfAwarenessMap[signals.selfAwareness.level] || 55,
        confidence: signals.selfAwareness.confidence,
        source: 'M1_inference',
        evidence: signals.selfAwareness.evidence
      }
    },
    
    // Traits (not skills, but affect matching)
    traits: {
      adaptability: {
        score: adaptabilityMap[signals.adaptability.level] || 50,
        confidence: signals.adaptability.confidence,
        source: 'M1_direct',
        evidence: signals.adaptability.evidence
      }
    },
    
    // Flags for coaching integration
    coachingFlags: signals.coachingFlags,
    
    // Response quality (affects assessment confidence)
    responseQuality: signals.responseQuality,
    
    // Key driver (affects relationship dynamics coaching)
    keyDriver: signals.keyDriver
  };
}

// =============================================================================
// EXPORTS
// =============================================================================


// =============================================================================
// SECTION 2: MODULE 2 - WHO ARE YOU
// =============================================================================

const MEN_M2_POLES = {
  physical: {
    A: 'Fitness',
    B: 'Maturity',
    description: 'Source of physical gravity: body and vitality vs depth and experience'
  },
  social: {
    A: 'Leadership',
    B: 'Presence',
    description: 'Source of social gravity: taking charge vs deep attention'
  },
  lifestyle: {
    A: 'Thrill',
    B: 'Peace',
    description: 'Life orientation: adventure and excitement vs stability and calm'
  },
  values: {
    A: 'Traditional',
    B: 'Egalitarian',
    description: 'Partnership structure: inherited roles vs constructed roles'
  }
};

// =============================================================================
// W2 POLE DEFINITIONS (Women - What She Offers)
// =============================================================================

const WOMEN_W2_POLES = {
  physical: {
    A: 'Beauty',
    B: 'Confidence',
    description: 'Source of physical gravity: aesthetic appeal vs self-assured presence'
  },
  social: {
    A: 'Allure',
    B: 'Charm',
    description: 'Source of social gravity: magnetic mystery vs warm engagement'
  },
  lifestyle: {
    A: 'Thrill',
    B: 'Peace',
    description: 'Life orientation: adventure and excitement vs stability and calm'
  },
  values: {
    A: 'Traditional',
    B: 'Egalitarian',
    description: 'Partnership structure: inherited roles vs constructed roles'
  }
};

// =============================================================================
// VALIDATION QUESTIONS
// =============================================================================

/**
 * Attention checks: Questions with obvious correct answers
 * If user fails 2+ attention checks, flag responses as unreliable
 */
const ATTENTION_CHECKS = {
  men: [
    {
      id: 'M2_ATT_01',
      text: 'Please select "Agree" for this question to confirm you are reading carefully.',
      expectedResponse: 4, // Agree or Strongly Agree
      minAcceptable: 4
    },
    {
      id: 'M2_ATT_02',
      text: 'I have never used any form of technology in my entire life.',
      expectedResponse: 1, // Should disagree
      maxAcceptable: 2
    },
    {
      id: 'M2_ATT_03',
      text: 'For quality purposes, please select "Disagree" for this item.',
      expectedResponse: 2,
      minAcceptable: 1,
      maxAcceptable: 2
    }
  ],
  women: [
    {
      id: 'W2_ATT_01',
      text: 'Please select "Agree" for this question to confirm you are reading carefully.',
      expectedResponse: 4,
      minAcceptable: 4
    },
    {
      id: 'W2_ATT_02',
      text: 'I have never used any form of technology in my entire life.',
      expectedResponse: 1,
      maxAcceptable: 2
    },
    {
      id: 'W2_ATT_03',
      text: 'For quality purposes, please select "Disagree" for this item.',
      expectedResponse: 2,
      minAcceptable: 1,
      maxAcceptable: 2
    }
  ]
};

/**
 * Consistency checks: Repeated questions with different wording
 * Large divergence (3+ points) suggests random responding or acquiescence
 */
const CONSISTENCY_CHECKS = {
  men: [
    {
      id: 'M2_CON_01',
      text: 'I tend to stay calm under pressure.',
      pairedWith: 'M2_PHY_B_D01', // "I need calm and predictability..." - should correlate
      dimension: 'lifestyle',
      expectedCorrelation: 'positive'
    },
    {
      id: 'M2_CON_02',
      text: 'I prefer when someone else takes the lead in group settings.',
      pairedWith: 'M2_SOC_A_D01', // "I naturally take charge..." - should be inverse
      dimension: 'social',
      expectedCorrelation: 'negative'
    }
  ],
  women: [
    {
      id: 'W2_CON_01',
      text: 'I tend to stay calm under pressure.',
      pairedWith: 'W2_LIF_B_D01',
      dimension: 'lifestyle',
      expectedCorrelation: 'positive'
    },
    {
      id: 'W2_CON_02',
      text: 'I prefer to let others approach me first in social situations.',
      pairedWith: 'W2_SOC_A_D03', // "I do not need to pursue; I am pursued"
      dimension: 'social',
      expectedCorrelation: 'positive'
    }
  ]
};

/**
 * Acquiescence detection: Check if user agrees with contradictory statements
 */
function detectAcquiescenceBias(responses, gender) {
  // Check if user scored high (4+) on BOTH poles of any dimension
  const questions = gender === 'M' ? MEN_MODULE2_QUESTIONS : WOMEN_MODULE2_QUESTIONS;
  const flags = [];
  
  ['physical', 'social', 'lifestyle', 'values'].forEach(dim => {
    const dimQ = questions[dim];
    
    // Calculate average for each pole's direct questions
    let poleASum = 0, poleBSum = 0;
    let poleACount = 0, poleBCount = 0;
    
    dimQ.likertDirect.poleA.forEach(q => {
      if (responses[q.id] !== undefined) {
        poleASum += responses[q.id];
        poleACount++;
      }
    });
    
    dimQ.likertDirect.poleB.forEach(q => {
      if (responses[q.id] !== undefined) {
        poleBSum += responses[q.id];
        poleBCount++;
      }
    });
    
    const poleAAvg = poleACount > 0 ? poleASum / poleACount : 0;
    const poleBAvg = poleBCount > 0 ? poleBSum / poleBCount : 0;
    
    // If both poles average 4+, flag acquiescence
    if (poleAAvg >= 4 && poleBAvg >= 4) {
      flags.push({
        dimension: dim,
        poleAAvg,
        poleBAvg,
        severity: 'high',
        message: `User agreed strongly with contradictory ${dim} statements. Possible acquiescence bias.`
      });
    } else if (poleAAvg >= 3.5 && poleBAvg >= 3.5) {
      flags.push({
        dimension: dim,
        poleAAvg,
        poleBAvg,
        severity: 'moderate',
        message: `User showed agreement tendency on contradictory ${dim} statements.`
      });
    }
  });
  
  return flags;
}

/**
 * Validate all attention and consistency checks
 */
function validateResponses(responses, gender) {
  const attentionChecks = gender === 'M' ? ATTENTION_CHECKS.men : ATTENTION_CHECKS.women;
  const consistencyChecks = gender === 'M' ? CONSISTENCY_CHECKS.men : CONSISTENCY_CHECKS.women;
  
  const validation = {
    attentionChecksPassed: 0,
    attentionChecksFailed: 0,
    attentionFailures: [],
    consistencyScore: 100,
    consistencyFlags: [],
    acquiescenceFlags: [],
    overallValidity: 'valid'
  };
  
  // Check attention items
  attentionChecks.forEach(check => {
    const response = responses[check.id];
    if (response === undefined) {
      validation.attentionChecksFailed++;
      validation.attentionFailures.push({ id: check.id, reason: 'not_answered' });
    } else {
      let passed = true;
      if (check.minAcceptable !== undefined && response < check.minAcceptable) passed = false;
      if (check.maxAcceptable !== undefined && response > check.maxAcceptable) passed = false;
      
      if (passed) {
        validation.attentionChecksPassed++;
      } else {
        validation.attentionChecksFailed++;
        validation.attentionFailures.push({ id: check.id, response, expected: check.expectedResponse });
      }
    }
  });
  
  // Check consistency items
  consistencyChecks.forEach(check => {
    const response1 = responses[check.id];
    const response2 = responses[check.pairedWith];
    
    if (response1 !== undefined && response2 !== undefined) {
      let expectedDiff;
      if (check.expectedCorrelation === 'positive') {
        // Should be similar (diff < 2)
        expectedDiff = Math.abs(response1 - response2);
        if (expectedDiff > 2) {
          validation.consistencyFlags.push({
            check: check.id,
            paired: check.pairedWith,
            diff: expectedDiff,
            message: `Inconsistent responses on ${check.dimension} dimension`
          });
          validation.consistencyScore -= 15;
        }
      } else {
        // Should be inverse (sum should be ~6 for 1-5 scale)
        const sum = response1 + response2;
        if (sum > 8 || sum < 4) {
          validation.consistencyFlags.push({
            check: check.id,
            paired: check.pairedWith,
            sum,
            message: `Inconsistent inverse responses on ${check.dimension} dimension`
          });
          validation.consistencyScore -= 15;
        }
      }
    }
  });
  
  // Check acquiescence
  validation.acquiescenceFlags = detectAcquiescenceBias(responses, gender);
  if (validation.acquiescenceFlags.some(f => f.severity === 'high')) {
    validation.consistencyScore -= 25;
  } else if (validation.acquiescenceFlags.length > 0) {
    validation.consistencyScore -= 10;
  }
  
  // Determine overall validity
  if (validation.attentionChecksFailed >= 2) {
    validation.overallValidity = 'unreliable';
  } else if (validation.consistencyScore < 60) {
    validation.overallValidity = 'questionable';
  } else if (validation.attentionChecksFailed === 1 || validation.consistencyScore < 85) {
    validation.overallValidity = 'minor_concerns';
  }
  
  return validation;
}

// =============================================================================
// MEN'S MODULE 2 QUESTIONS
// =============================================================================

const MEN_MODULE2_QUESTIONS = {
  
  // ===========================================================================
  // PHYSICAL DIMENSION: Fitness (A) vs Maturity (B)
  // ===========================================================================
  
  physical: {
    poleA: 'Fitness',
    poleB: 'Maturity',
    
    likertDirect: {
      poleA: [
        {
          id: 'M2_PHY_A_D01',
          text: 'My physical fitness is a core part of who I am.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_PHY_A_D02',
          text: 'I am aware that my body gets noticed when I enter a room.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_PHY_A_D03',
          text: 'I invest significant time and energy in maintaining my physique.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_PHY_A_D04',
          text: 'I feel most confident when I am in peak physical condition.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_PHY_A_D05',
          text: 'My physical strength and capability matter to my sense of self.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_PHY_A_D06',
          text: 'I take pride in my body and how I present physically.',
          pole: 'A',
          type: 'direct'
        }
      ],
      poleB: [
        {
          id: 'M2_PHY_B_D01',
          text: 'My life experience and depth are a core part of who I am.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_PHY_B_D02',
          text: 'I am aware that my groundedness gets noticed when I enter a room.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_PHY_B_D03',
          text: 'I invest significant time and energy in personal growth and self-knowledge.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_PHY_B_D04',
          text: 'I feel most confident when I am emotionally centered and clear.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_PHY_B_D05',
          text: 'My wisdom and what I have learned matter to my sense of self.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_PHY_B_D06',
          text: 'I take pride in my depth and who I have become through experience.',
          pole: 'B',
          type: 'direct'
        }
      ]
    },
    
    likertBehavioral: {
      poleA: [
        {
          id: 'M2_PHY_A_B01',
          text: 'People have complimented my body or physical appearance.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'M2_PHY_A_B02',
          text: 'Partners have told me my physicality was part of what attracted them.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'M2_PHY_A_B03',
          text: 'I have been described as athletic or physically impressive.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'M2_PHY_A_B04',
          text: 'My physical presence has opened doors for me socially or professionally.',
          pole: 'A',
          type: 'behavioral'
        }
      ],
      poleB: [
        {
          id: 'M2_PHY_B_B01',
          text: 'People have told me I have a calming or grounding presence.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'M2_PHY_B_B02',
          text: 'Partners have told me my depth or stability was part of what attracted them.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'M2_PHY_B_B03',
          text: 'I have been described as wise or emotionally mature for my age.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'M2_PHY_B_B04',
          text: 'My steadiness has helped others through difficult situations.',
          pole: 'B',
          type: 'behavioral'
        }
      ]
    },
    
    forcedChoice: [
      {
        id: 'M2_PHY_FC01',
        text: 'I lead with:',
        optionA: 'My body and physical presence',
        optionB: 'My depth and emotional presence',
        type: 'forcedChoice'
      },
      {
        id: 'M2_PHY_FC02',
        text: 'People are more likely to remember me for:',
        optionA: 'How I looked',
        optionB: 'How I made them feel',
        type: 'forcedChoice'
      },
      {
        id: 'M2_PHY_FC03',
        text: 'When I meet someone new, they first notice:',
        optionA: 'My physical appearance',
        optionB: 'My demeanor and energy',
        type: 'forcedChoice'
      },
      {
        id: 'M2_PHY_FC04',
        text: 'I am more defined by:',
        optionA: 'My physical discipline',
        optionB: 'My emotional discipline',
        type: 'forcedChoice'
      },
      {
        id: 'M2_PHY_FC05',
        text: 'My confidence comes more from:',
        optionA: 'How my body looks and performs',
        optionB: 'What I have been through and learned',
        type: 'forcedChoice'
      },
      {
        id: 'M2_PHY_FC06',
        text: 'In a relationship, I bring more value through:',
        optionA: 'Physical vitality and presence',
        optionB: 'Emotional steadiness and perspective',
        type: 'forcedChoice'
      },
      {
        id: 'M2_PHY_FC07',
        text: 'I would rather be known as:',
        optionA: 'Physically impressive',
        optionB: 'Deeply grounded',
        type: 'forcedChoice'
      },
      {
        id: 'M2_PHY_FC08',
        text: 'I have worked harder on:',
        optionA: 'My body',
        optionB: 'My character',
        type: 'forcedChoice'
      },
      {
        id: 'M2_PHY_FC09',
        text: 'When facing a challenge, I rely more on:',
        optionA: 'Physical capability and energy',
        optionB: 'Perspective and patience',
        type: 'forcedChoice'
      },
      {
        id: 'M2_PHY_FC10',
        text: 'My presence in a room comes more from:',
        optionA: 'How I look and carry my body',
        optionB: 'The weight of who I am',
        type: 'forcedChoice'
      },
      {
        id: 'M2_PHY_FC11',
        text: 'Partners have valued me more for:',
        optionA: 'My physical attractiveness',
        optionB: 'My emotional reliability',
        type: 'forcedChoice'
      },
      {
        id: 'M2_PHY_FC12',
        text: 'If I had to sacrifice one, I would keep:',
        optionA: 'My physical fitness',
        optionB: 'My hard-won wisdom',
        type: 'forcedChoice'
      }
    ]
  },
  
  // ===========================================================================
  // SOCIAL DIMENSION: Leadership (A) vs Presence (B)
  // ===========================================================================
  
  social: {
    poleA: 'Leadership',
    poleB: 'Presence',
    
    likertDirect: {
      poleA: [
        {
          id: 'M2_SOC_A_D01',
          text: 'I naturally take charge in group situations.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_SOC_A_D02',
          text: 'People look to me to make decisions and set direction.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_SOC_A_D03',
          text: 'I am comfortable being the one who handles things.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_SOC_A_D04',
          text: 'I prefer to lead rather than follow.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_SOC_A_D05',
          text: 'When something needs to get done, I step up and organize it.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_SOC_A_D06',
          text: 'I see myself as a natural leader.',
          pole: 'A',
          type: 'direct'
        }
      ],
      poleB: [
        {
          id: 'M2_SOC_B_D01',
          text: 'I naturally give people my full, undivided attention.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_SOC_B_D02',
          text: 'People have said I make them feel like the only person in the room.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_SOC_B_D03',
          text: 'I am comfortable sitting with someone in silence.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_SOC_B_D04',
          text: 'I prefer depth in conversation over breadth.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_SOC_B_D05',
          text: 'I notice small things about people that others miss.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_SOC_B_D06',
          text: 'I see myself as someone who truly listens.',
          pole: 'B',
          type: 'direct'
        }
      ]
    },
    
    likertBehavioral: {
      poleA: [
        {
          id: 'M2_SOC_A_B01',
          text: 'Partners have told me they value how I take charge and handle things.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'M2_SOC_A_B02',
          text: 'I have been put in leadership roles by others who looked to me for direction.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'M2_SOC_A_B03',
          text: 'Friends or colleagues have described me as decisive.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'M2_SOC_A_B04',
          text: 'In past relationships, I was usually the one who made plans and drove decisions.',
          pole: 'A',
          type: 'behavioral'
        }
      ],
      poleB: [
        {
          id: 'M2_SOC_B_B01',
          text: 'Partners have told me they value how seen and heard I make them feel.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'M2_SOC_B_B02',
          text: 'People have come to me specifically because I listen without trying to fix.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'M2_SOC_B_B03',
          text: 'Friends or colleagues have described me as deeply attentive.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'M2_SOC_B_B04',
          text: 'In past relationships, I was usually the one who remembered details and noticed when something was off.',
          pole: 'B',
          type: 'behavioral'
        }
      ]
    },
    
    forcedChoice: [
      {
        id: 'M2_SOC_FC01',
        text: 'In a group, I am more often:',
        optionA: 'The one steering',
        optionB: 'The one paying close attention',
        type: 'forcedChoice'
      },
      {
        id: 'M2_SOC_FC02',
        text: 'Partners have valued me more for:',
        optionA: 'Handling things',
        optionB: 'Understanding them',
        type: 'forcedChoice'
      },
      {
        id: 'M2_SOC_FC03',
        text: 'My social strength is:',
        optionA: 'Getting things done through people',
        optionB: 'Making people feel known',
        type: 'forcedChoice'
      },
      {
        id: 'M2_SOC_FC04',
        text: 'When a partner is stressed, I am more likely to:',
        optionA: 'Take action to solve the problem',
        optionB: 'Be fully present with them in it',
        type: 'forcedChoice'
      },
      {
        id: 'M2_SOC_FC05',
        text: 'I am more energized by:',
        optionA: 'Leading a group toward a goal',
        optionB: 'Deep conversation with one person',
        type: 'forcedChoice'
      },
      {
        id: 'M2_SOC_FC06',
        text: 'I would rather be known as:',
        optionA: 'Someone who gets things done',
        optionB: 'Someone who truly sees people',
        type: 'forcedChoice'
      },
      {
        id: 'M2_SOC_FC07',
        text: 'In conflict, I tend to:',
        optionA: 'Take charge and push toward resolution',
        optionB: 'Listen carefully before responding',
        type: 'forcedChoice'
      },
      {
        id: 'M2_SOC_FC08',
        text: 'My presence in social settings comes more from:',
        optionA: 'The direction I provide',
        optionB: 'The attention I give',
        type: 'forcedChoice'
      },
      {
        id: 'M2_SOC_FC09',
        text: 'I am better at:',
        optionA: 'Making decisions under pressure',
        optionB: 'Holding space for difficult emotions',
        type: 'forcedChoice'
      },
      {
        id: 'M2_SOC_FC10',
        text: 'Friends come to me when they need:',
        optionA: 'Someone to take charge and help fix things',
        optionB: 'Someone to really listen and understand',
        type: 'forcedChoice'
      },
      {
        id: 'M2_SOC_FC11',
        text: 'In a relationship, I bring more value through:',
        optionA: 'Being the one who handles logistics and decisions',
        optionB: 'Being the one who notices and remembers',
        type: 'forcedChoice'
      },
      {
        id: 'M2_SOC_FC12',
        text: 'If I had to choose, I would rather be:',
        optionA: 'Respected for my competence',
        optionB: 'Cherished for my attentiveness',
        type: 'forcedChoice'
      }
    ]
  },
  
  // ===========================================================================
  // LIFESTYLE DIMENSION: Thrill (A) vs Peace (B)
  // ===========================================================================
  
  lifestyle: {
    poleA: 'Thrill',
    poleB: 'Peace',
    
    likertDirect: {
      poleA: [
        {
          id: 'M2_LIF_A_D01',
          text: 'I need novelty and new experiences to feel alive.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_LIF_A_D02',
          text: 'I get restless when life becomes too predictable.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_LIF_A_D03',
          text: 'I am energized by risk and the unknown.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_LIF_A_D04',
          text: 'I would rather have an exciting life than a stable one.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_LIF_A_D05',
          text: 'Routine feels like a cage to me.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_LIF_A_D06',
          text: 'I seek out experiences that push my limits.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_LIF_A_D07',
          text: 'I am drawn to the unfamiliar over the comfortable.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_LIF_A_D08',
          text: 'My ideal life has more adventure than security.',
          pole: 'A',
          type: 'direct'
        }
      ],
      poleB: [
        {
          id: 'M2_LIF_B_D01',
          text: 'I need calm and predictability to feel grounded.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_LIF_B_D02',
          text: 'I feel most myself when life has a steady rhythm.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_LIF_B_D03',
          text: 'I am energized by stability and routine.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_LIF_B_D04',
          text: 'I would rather have a peaceful life than an exciting one.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_LIF_B_D05',
          text: 'Routine feels like freedom to me.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_LIF_B_D06',
          text: 'I seek out experiences that deepen rather than disrupt.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_LIF_B_D07',
          text: 'I am drawn to the familiar over the novel.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_LIF_B_D08',
          text: 'My ideal life has more security than adventure.',
          pole: 'B',
          type: 'direct'
        }
      ]
    },
    
    likertBehavioral: {
      poleA: [
        {
          id: 'M2_LIF_A_B01',
          text: 'Partners have described me as adventurous or spontaneous.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'M2_LIF_A_B02',
          text: 'I have made major life changes in pursuit of new experiences.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'M2_LIF_A_B03',
          text: 'Friends see me as the one who pushes for something different.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'M2_LIF_A_B04',
          text: 'My life history includes significant risks that others would not have taken.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'M2_LIF_A_B05',
          text: 'Partners have had to adjust to my need for novelty.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'M2_LIF_A_B06',
          text: 'I have chosen excitement over security when forced to pick.',
          pole: 'A',
          type: 'behavioral'
        }
      ],
      poleB: [
        {
          id: 'M2_LIF_B_B01',
          text: 'Partners have described me as stable or grounding.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'M2_LIF_B_B02',
          text: 'I have built a life with consistent routines and structures.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'M2_LIF_B_B03',
          text: 'Friends see me as the one who keeps things steady.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'M2_LIF_B_B04',
          text: 'My life history reflects careful building rather than dramatic leaps.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'M2_LIF_B_B05',
          text: 'Partners have relied on my predictability.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'M2_LIF_B_B06',
          text: 'I have chosen security over excitement when forced to pick.',
          pole: 'B',
          type: 'behavioral'
        }
      ]
    },
    
    forcedChoice: [
      {
        id: 'M2_LIF_FC01',
        text: 'I am more:',
        optionA: 'A seeker of new horizons',
        optionB: 'A builder of lasting foundations',
        type: 'forcedChoice'
      },
      {
        id: 'M2_LIF_FC02',
        text: 'My life has been shaped more by:',
        optionA: 'Adventures I have pursued',
        optionB: 'Commitments I have kept',
        type: 'forcedChoice'
      },
      {
        id: 'M2_LIF_FC03',
        text: 'A partner would need to accept that I:',
        optionA: 'Need novelty and change to thrive',
        optionB: 'Need stability and routine to thrive',
        type: 'forcedChoice'
      },
      {
        id: 'M2_LIF_FC04',
        text: 'I would describe my life orientation as:',
        optionA: 'Exploring the unknown',
        optionB: 'Cultivating the known',
        type: 'forcedChoice'
      }
    ]
  },
  
  // ===========================================================================
  // VALUES DIMENSION: Traditional (A) vs Egalitarian (B)
  // ===========================================================================
  
  values: {
    poleA: 'Traditional',
    poleB: 'Egalitarian',
    
    likertDirect: {
      poleA: [
        {
          id: 'M2_VAL_A_D01',
          text: 'I trust patterns that have been proven over generations.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_VAL_A_D02',
          text: 'Faith, family, or tradition anchor my sense of right and wrong.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_VAL_A_D03',
          text: 'I believe there is wisdom in how things have always been done.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_VAL_A_D04',
          text: 'I value loyalty and keeping my word above flexibility.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_VAL_A_D05',
          text: 'I find meaning in honoring something larger than myself.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_VAL_A_D06',
          text: 'I believe complementary roles between men and women work better than sameness.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_VAL_A_D07',
          text: 'I am drawn to partners who hold traditional values about family and commitment.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'M2_VAL_A_D08',
          text: 'I follow a code, even when it is inconvenient.',
          pole: 'A',
          type: 'direct'
        }
      ],
      poleB: [
        {
          id: 'M2_VAL_B_D01',
          text: 'I trust patterns we build together over patterns handed down.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_VAL_B_D02',
          text: 'I define my own sense of right and wrong rather than inheriting it.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_VAL_B_D03',
          text: 'I believe old ways should be questioned to see if they still serve us.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_VAL_B_D04',
          text: 'I value growth and adaptation above rigid commitment.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_VAL_B_D05',
          text: 'I find meaning in creating something new rather than preserving something old.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_VAL_B_D06',
          text: 'I believe equal partnership works better than complementary roles.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_VAL_B_D07',
          text: 'I am drawn to partners who share progressive values about relationships.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'M2_VAL_B_D08',
          text: 'I write my own code based on what works for me.',
          pole: 'B',
          type: 'direct'
        }
      ]
    },
    
    likertBehavioral: {
      poleA: [
        {
          id: 'M2_VAL_A_B01',
          text: 'I maintain traditions from my family or culture in my daily life.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'M2_VAL_A_B02',
          text: 'Faith or spiritual practice plays a meaningful role in how I live.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'M2_VAL_A_B03',
          text: 'Partners have described me as traditional or old-fashioned.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'M2_VAL_A_B04',
          text: 'I have chosen partners who share my values about family structure.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'M2_VAL_A_B05',
          text: 'I have ended relationships over differences in core values or beliefs.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'M2_VAL_A_B06',
          text: 'My political and social views lean toward preserving what works.',
          pole: 'A',
          type: 'behavioral'
        }
      ],
      poleB: [
        {
          id: 'M2_VAL_B_B01',
          text: 'I have broken from traditions that did not serve me.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'M2_VAL_B_B02',
          text: 'I define my own spirituality or do not prioritize spiritual practice.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'M2_VAL_B_B03',
          text: 'Partners have described me as progressive or modern.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'M2_VAL_B_B04',
          text: 'I have chosen partners who share my values about equality and flexibility.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'M2_VAL_B_B05',
          text: 'I have ended relationships when partners held traditional expectations of me.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'M2_VAL_B_B06',
          text: 'My political and social views lean toward change and progress.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'M2_VAL_B_B07',
          text: 'I have hidden parts of myself from partners because I was afraid they would leave if they really knew me.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'M2_VAL_B_B08',
          text: 'I have pretended to be okay when I was not because I did not want to be a burden.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'M2_VAL_B_B09',
          text: 'There are things about my past I have never told anyone I have dated.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'M2_VAL_B_B10',
          text: 'I have ended relationships before they could end me.',
          pole: 'B',
          type: 'behavioral'
        }
      ]
    },
    
    forcedChoice: [
      {
        id: 'M2_VAL_FC01',
        text: 'I am more guided by:',
        optionA: 'What has been proven to work',
        optionB: 'What I believe could work better',
        type: 'forcedChoice'
      },
      {
        id: 'M2_VAL_FC02',
        text: 'In relationships, I value:',
        optionA: 'Clear roles and lasting commitment',
        optionB: 'Flexibility and evolving partnership',
        type: 'forcedChoice'
      },
      {
        id: 'M2_VAL_FC03',
        text: 'My worldview is shaped more by:',
        optionA: 'Tradition, faith, or inherited values',
        optionB: 'Personal experience and independent thinking',
        type: 'forcedChoice'
      },
      {
        id: 'M2_VAL_FC04',
        text: 'I identify more as:',
        optionA: 'A keeper of what matters',
        optionB: 'A builder of what is next',
        type: 'forcedChoice'
      }
    ]
  }
};

// =============================================================================
// WOMEN'S MODULE 2 QUESTIONS
// =============================================================================

const WOMEN_MODULE2_QUESTIONS = {
  
  // ===========================================================================
  // PHYSICAL DIMENSION: Beauty (A) vs Confidence (B)
  // ===========================================================================
  
  physical: {
    poleA: 'Beauty',
    poleB: 'Confidence',
    
    likertDirect: {
      poleA: [
        {
          id: 'W2_PHY_A_D01',
          text: 'My physical appearance is a core part of who I am.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_PHY_A_D02',
          text: 'I am aware that my looks get noticed when I enter a room.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_PHY_A_D03',
          text: 'I invest significant time and energy in how I look.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_PHY_A_D04',
          text: 'I feel most confident when I know I look my best.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_PHY_A_D05',
          text: 'My appearance matters to my sense of self.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_PHY_A_D06',
          text: 'I take pride in my beauty and how I present visually.',
          pole: 'A',
          type: 'direct'
        }
      ],
      poleB: [
        {
          id: 'W2_PHY_B_D01',
          text: 'My self-assurance is a core part of who I am.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_PHY_B_D02',
          text: 'I am aware that my presence gets noticed when I enter a room.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_PHY_B_D03',
          text: 'I invest significant time and energy in developing my sense of self.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_PHY_B_D04',
          text: 'I feel most confident when I am grounded in who I am.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_PHY_B_D05',
          text: 'How I carry myself matters more to me than how I look.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_PHY_B_D06',
          text: 'I take pride in my presence and how I hold myself.',
          pole: 'B',
          type: 'direct'
        }
      ]
    },
    
    likertBehavioral: {
      poleA: [
        {
          id: 'W2_PHY_A_B01',
          text: 'People have complimented my looks or physical appearance.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'W2_PHY_A_B02',
          text: 'Partners have told me my beauty was part of what attracted them.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'W2_PHY_A_B03',
          text: 'I have been described as beautiful, pretty, or attractive.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'W2_PHY_A_B04',
          text: 'My appearance has opened doors for me socially or professionally.',
          pole: 'A',
          type: 'behavioral'
        }
      ],
      poleB: [
        {
          id: 'W2_PHY_B_B01',
          text: 'People have told me I have a commanding or assured presence.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'W2_PHY_B_B02',
          text: 'Partners have told me my confidence was part of what attracted them.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'W2_PHY_B_B03',
          text: 'I have been described as self-possessed or sure of myself.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'W2_PHY_B_B04',
          text: 'My presence has earned me respect in rooms where I was underestimated.',
          pole: 'B',
          type: 'behavioral'
        }
      ]
    },
    
    forcedChoice: [
      {
        id: 'W2_PHY_FC01',
        text: 'I lead with:',
        optionA: 'How I look',
        optionB: 'How I carry myself',
        type: 'forcedChoice'
      },
      {
        id: 'W2_PHY_FC02',
        text: 'People are more likely to remember me for:',
        optionA: 'My appearance',
        optionB: 'My presence',
        type: 'forcedChoice'
      },
      {
        id: 'W2_PHY_FC03',
        text: 'When I meet someone new, they first notice:',
        optionA: 'My looks',
        optionB: 'My energy',
        type: 'forcedChoice'
      },
      {
        id: 'W2_PHY_FC04',
        text: 'I am more defined by:',
        optionA: 'My beauty',
        optionB: 'My self-assurance',
        type: 'forcedChoice'
      },
      {
        id: 'W2_PHY_FC05',
        text: 'My power comes more from:',
        optionA: 'Being seen',
        optionB: 'Being felt',
        type: 'forcedChoice'
      },
      {
        id: 'W2_PHY_FC06',
        text: 'In a relationship, I bring more value through:',
        optionA: 'My physical appeal',
        optionB: 'My grounded presence',
        type: 'forcedChoice'
      },
      {
        id: 'W2_PHY_FC07',
        text: 'I would rather be known as:',
        optionA: 'Beautiful',
        optionB: 'Formidable',
        type: 'forcedChoice'
      },
      {
        id: 'W2_PHY_FC08',
        text: 'I have worked harder on:',
        optionA: 'My appearance',
        optionB: 'My sense of self',
        type: 'forcedChoice'
      },
      {
        id: 'W2_PHY_FC09',
        text: 'When I walk into a room, I rely more on:',
        optionA: 'How I look',
        optionB: 'Who I am',
        type: 'forcedChoice'
      },
      {
        id: 'W2_PHY_FC10',
        text: 'My gravity comes more from:',
        optionA: 'My aesthetic appeal',
        optionB: 'My inner certainty',
        type: 'forcedChoice'
      },
      {
        id: 'W2_PHY_FC11',
        text: 'Partners have valued me more for:',
        optionA: 'My beauty',
        optionB: 'My confidence',
        type: 'forcedChoice'
      },
      {
        id: 'W2_PHY_FC12',
        text: 'If I had to sacrifice one, I would keep:',
        optionA: 'My looks',
        optionB: 'My self-assurance',
        type: 'forcedChoice'
      }
    ]
  },
  
  // ===========================================================================
  // SOCIAL DIMENSION: Allure (A) vs Charm (B)
  // ===========================================================================
  
  social: {
    poleA: 'Allure',
    poleB: 'Charm',
    
    likertDirect: {
      poleA: [
        {
          id: 'W2_SOC_A_D01',
          text: 'I am naturally selective about who gets my attention.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_SOC_A_D02',
          text: 'I draw people in by being somewhat mysterious.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_SOC_A_D03',
          text: 'I do not need to pursue; I am pursued.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_SOC_A_D04',
          text: 'My social power comes from what I withhold, not what I give.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_SOC_A_D05',
          text: 'I create intrigue by not being fully available.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_SOC_A_D06',
          text: 'I see myself as someone who is noticed across a room.',
          pole: 'A',
          type: 'direct'
        }
      ],
      poleB: [
        {
          id: 'W2_SOC_B_D01',
          text: 'I naturally make people feel at ease around me.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_SOC_B_D02',
          text: 'I draw people in by being warm and engaging.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_SOC_B_D03',
          text: 'I enjoy being the one who initiates connection.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_SOC_B_D04',
          text: 'My social power comes from how I make people feel.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_SOC_B_D05',
          text: 'I create connection by being genuinely interested in others.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_SOC_B_D06',
          text: 'I see myself as someone who lights up a conversation.',
          pole: 'B',
          type: 'direct'
        }
      ]
    },
    
    likertBehavioral: {
      poleA: [
        {
          id: 'W2_SOC_A_B01',
          text: 'Partners have told me I was hard to read at first.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'W2_SOC_A_B02',
          text: 'I have been described as mysterious or intriguing.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'W2_SOC_A_B03',
          text: 'Men have pursued me persistently because I did not make it easy.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'W2_SOC_A_B04',
          text: 'My selectivity has been noticed and commented on by others.',
          pole: 'A',
          type: 'behavioral'
        }
      ],
      poleB: [
        {
          id: 'W2_SOC_B_B01',
          text: 'Partners have told me I made them feel comfortable immediately.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'W2_SOC_B_B02',
          text: 'I have been described as warm, friendly, or approachable.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'W2_SOC_B_B03',
          text: 'People open up to me quickly because I put them at ease.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'W2_SOC_B_B04',
          text: 'My warmth has been noticed and commented on by others.',
          pole: 'B',
          type: 'behavioral'
        }
      ]
    },
    
    forcedChoice: [
      {
        id: 'W2_SOC_FC01',
        text: 'I draw people in through:',
        optionA: 'Intrigue and selectivity',
        optionB: 'Warmth and engagement',
        type: 'forcedChoice'
      },
      {
        id: 'W2_SOC_FC02',
        text: 'People are more likely to describe me as:',
        optionA: 'Mysterious',
        optionB: 'Approachable',
        type: 'forcedChoice'
      },
      {
        id: 'W2_SOC_FC03',
        text: 'In social settings, I am more often:',
        optionA: 'Noticed from across the room',
        optionB: 'Magnetic in conversation',
        type: 'forcedChoice'
      },
      {
        id: 'W2_SOC_FC04',
        text: 'My social strength is:',
        optionA: 'Creating desire through scarcity',
        optionB: 'Creating connection through openness',
        type: 'forcedChoice'
      },
      {
        id: 'W2_SOC_FC05',
        text: 'Partners have been drawn to me because:',
        optionA: 'I was a challenge to win',
        optionB: 'I was easy to be with',
        type: 'forcedChoice'
      },
      {
        id: 'W2_SOC_FC06',
        text: 'I would rather be known as:',
        optionA: 'Captivating',
        optionB: 'Delightful',
        type: 'forcedChoice'
      },
      {
        id: 'W2_SOC_FC07',
        text: 'When meeting someone new, I tend to:',
        optionA: 'Hold back and let them come to me',
        optionB: 'Engage warmly and draw them out',
        type: 'forcedChoice'
      },
      {
        id: 'W2_SOC_FC08',
        text: 'My presence in social settings comes more from:',
        optionA: 'What people cannot quite figure out about me',
        optionB: 'How good I make people feel',
        type: 'forcedChoice'
      },
      {
        id: 'W2_SOC_FC09',
        text: 'In dating, I have been more:',
        optionA: 'Pursued',
        optionB: 'The one creating connection',
        type: 'forcedChoice'
      },
      {
        id: 'W2_SOC_FC10',
        text: 'My appeal is more:',
        optionA: 'Enigmatic',
        optionB: 'Inviting',
        type: 'forcedChoice'
      },
      {
        id: 'W2_SOC_FC11',
        text: 'In a relationship, I bring more value through:',
        optionA: 'Being someone he continues to discover',
        optionB: 'Being someone he feels completely at home with',
        type: 'forcedChoice'
      },
      {
        id: 'W2_SOC_FC12',
        text: 'If I had to choose, I would rather be:',
        optionA: 'Desired from afar',
        optionB: 'Cherished up close',
        type: 'forcedChoice'
      }
    ]
  },
  
  // ===========================================================================
  // LIFESTYLE DIMENSION: Thrill (A) vs Peace (B)
  // ===========================================================================
  
  lifestyle: {
    poleA: 'Thrill',
    poleB: 'Peace',
    
    likertDirect: {
      poleA: [
        {
          id: 'W2_LIF_A_D01',
          text: 'I need novelty and new experiences to feel alive.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_LIF_A_D02',
          text: 'I get restless when life becomes too predictable.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_LIF_A_D03',
          text: 'I am energized by risk and the unknown.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_LIF_A_D04',
          text: 'I would rather have an exciting life than a stable one.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_LIF_A_D05',
          text: 'Routine feels like a cage to me.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_LIF_A_D06',
          text: 'I seek out experiences that push my limits.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_LIF_A_D07',
          text: 'I am drawn to the unfamiliar over the comfortable.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_LIF_A_D08',
          text: 'My ideal life has more adventure than security.',
          pole: 'A',
          type: 'direct'
        }
      ],
      poleB: [
        {
          id: 'W2_LIF_B_D01',
          text: 'I need calm and predictability to feel grounded.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_LIF_B_D02',
          text: 'I feel most myself when life has a steady rhythm.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_LIF_B_D03',
          text: 'I am energized by stability and routine.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_LIF_B_D04',
          text: 'I would rather have a peaceful life than an exciting one.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_LIF_B_D05',
          text: 'Routine feels like freedom to me.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_LIF_B_D06',
          text: 'I seek out experiences that deepen rather than disrupt.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_LIF_B_D07',
          text: 'I am drawn to the familiar over the novel.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_LIF_B_D08',
          text: 'My ideal life has more security than adventure.',
          pole: 'B',
          type: 'direct'
        }
      ]
    },
    
    likertBehavioral: {
      poleA: [
        {
          id: 'W2_LIF_A_B01',
          text: 'Partners have described me as adventurous or spontaneous.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'W2_LIF_A_B02',
          text: 'I have made major life changes in pursuit of new experiences.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'W2_LIF_A_B03',
          text: 'Friends see me as the one who pushes for something different.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'W2_LIF_A_B04',
          text: 'My life history includes significant risks that others would not have taken.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'W2_LIF_A_B05',
          text: 'Partners have had to adjust to my need for novelty.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'W2_LIF_A_B06',
          text: 'I have chosen excitement over security when forced to pick.',
          pole: 'A',
          type: 'behavioral'
        }
      ],
      poleB: [
        {
          id: 'W2_LIF_B_B01',
          text: 'Partners have described me as stable or grounding.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'W2_LIF_B_B02',
          text: 'I have built a life with consistent routines and structures.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'W2_LIF_B_B03',
          text: 'Friends see me as the one who keeps things steady.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'W2_LIF_B_B04',
          text: 'My life history reflects careful building rather than dramatic leaps.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'W2_LIF_B_B05',
          text: 'Partners have relied on my predictability.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'W2_LIF_B_B06',
          text: 'I have chosen security over excitement when forced to pick.',
          pole: 'B',
          type: 'behavioral'
        }
      ]
    },
    
    forcedChoice: [
      {
        id: 'W2_LIF_FC01',
        text: 'I am more:',
        optionA: 'A seeker of new horizons',
        optionB: 'A builder of lasting foundations',
        type: 'forcedChoice'
      },
      {
        id: 'W2_LIF_FC02',
        text: 'My life has been shaped more by:',
        optionA: 'Adventures I have pursued',
        optionB: 'Commitments I have kept',
        type: 'forcedChoice'
      },
      {
        id: 'W2_LIF_FC03',
        text: 'A partner would need to accept that I:',
        optionA: 'Need novelty and change to thrive',
        optionB: 'Need stability and routine to thrive',
        type: 'forcedChoice'
      },
      {
        id: 'W2_LIF_FC04',
        text: 'I would describe my life orientation as:',
        optionA: 'Exploring the unknown',
        optionB: 'Cultivating the known',
        type: 'forcedChoice'
      }
    ]
  },
  
  // ===========================================================================
  // VALUES DIMENSION: Traditional (A) vs Egalitarian (B)
  // ===========================================================================
  
  values: {
    poleA: 'Traditional',
    poleB: 'Egalitarian',
    
    likertDirect: {
      poleA: [
        {
          id: 'W2_VAL_A_D01',
          text: 'I trust patterns that have been proven over generations.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_VAL_A_D02',
          text: 'Faith, family, or tradition anchor my sense of right and wrong.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_VAL_A_D03',
          text: 'I believe there is wisdom in how things have always been done.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_VAL_A_D04',
          text: 'I value loyalty and keeping my word above flexibility.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_VAL_A_D05',
          text: 'I find meaning in honoring something larger than myself.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_VAL_A_D06',
          text: 'I believe complementary roles between men and women work better than sameness.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_VAL_A_D07',
          text: 'I am drawn to partners who hold traditional values about family and commitment.',
          pole: 'A',
          type: 'direct'
        },
        {
          id: 'W2_VAL_A_D08',
          text: 'I follow a code, even when it is inconvenient.',
          pole: 'A',
          type: 'direct'
        }
      ],
      poleB: [
        {
          id: 'W2_VAL_B_D01',
          text: 'I trust patterns we build together over patterns handed down.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_VAL_B_D02',
          text: 'I define my own sense of right and wrong rather than inheriting it.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_VAL_B_D03',
          text: 'I believe old ways should be questioned to see if they still serve us.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_VAL_B_D04',
          text: 'I value growth and adaptation above rigid commitment.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_VAL_B_D05',
          text: 'I find meaning in creating something new rather than preserving something old.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_VAL_B_D06',
          text: 'I believe equal partnership works better than complementary roles.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_VAL_B_D07',
          text: 'I am drawn to partners who share progressive values about relationships.',
          pole: 'B',
          type: 'direct'
        },
        {
          id: 'W2_VAL_B_D08',
          text: 'I write my own code based on what works for me.',
          pole: 'B',
          type: 'direct'
        }
      ]
    },
    
    likertBehavioral: {
      poleA: [
        {
          id: 'W2_VAL_A_B01',
          text: 'I maintain traditions from my family or culture in my daily life.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'W2_VAL_A_B02',
          text: 'Faith or spiritual practice plays a meaningful role in how I live.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'W2_VAL_A_B03',
          text: 'Partners have described me as traditional or old-fashioned.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'W2_VAL_A_B04',
          text: 'I have chosen partners who share my values about family structure.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'W2_VAL_A_B05',
          text: 'I have ended relationships over differences in core values or beliefs.',
          pole: 'A',
          type: 'behavioral'
        },
        {
          id: 'W2_VAL_A_B06',
          text: 'My political and social views lean toward preserving what works.',
          pole: 'A',
          type: 'behavioral'
        }
      ],
      poleB: [
        {
          id: 'W2_VAL_B_B01',
          text: 'I have broken from traditions that did not serve me.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'W2_VAL_B_B02',
          text: 'I define my own spirituality or do not prioritize spiritual practice.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'W2_VAL_B_B03',
          text: 'Partners have described me as progressive or modern.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'W2_VAL_B_B04',
          text: 'I have chosen partners who share my values about equality and flexibility.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'W2_VAL_B_B05',
          text: 'I have ended relationships when partners held traditional expectations of me.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'W2_VAL_B_B06',
          text: 'My political and social views lean toward change and progress.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'W2_VAL_B_B07',
          text: 'I have hidden parts of myself from partners because I was afraid they would leave if they really knew me.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'W2_VAL_B_B08',
          text: 'I have pretended to be okay when I was not because I did not want to be a burden.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'W2_VAL_B_B09',
          text: 'There are things about my past I have never told anyone I have dated.',
          pole: 'B',
          type: 'behavioral'
        },
        {
          id: 'W2_VAL_B_B10',
          text: 'I have ended relationships before they could end me.',
          pole: 'B',
          type: 'behavioral'
        }
      ]
    },
    
    forcedChoice: [
      {
        id: 'W2_VAL_FC01',
        text: 'I am more guided by:',
        optionA: 'What has been proven to work',
        optionB: 'What I believe could work better',
        type: 'forcedChoice'
      },
      {
        id: 'W2_VAL_FC02',
        text: 'In relationships, I value:',
        optionA: 'Clear roles and lasting commitment',
        optionB: 'Flexibility and evolving partnership',
        type: 'forcedChoice'
      },
      {
        id: 'W2_VAL_FC03',
        text: 'My worldview is shaped more by:',
        optionA: 'Tradition, faith, or inherited values',
        optionB: 'Personal experience and independent thinking',
        type: 'forcedChoice'
      },
      {
        id: 'W2_VAL_FC04',
        text: 'I identify more as:',
        optionA: 'A keeper of what matters',
        optionB: 'A builder of what is next',
        type: 'forcedChoice'
      }
    ]
  }
};

// =============================================================================
// QUESTION COUNTS (For Validation)
// =============================================================================

function getM2QuestionCounts() {
  const counts = {
    men: { physical: 0, social: 0, lifestyle: 0, values: 0, total: 0 },
    women: { physical: 0, social: 0, lifestyle: 0, values: 0, total: 0 }
  };
  
  ['physical', 'social', 'lifestyle', 'values'].forEach(dim => {
    const mDim = MEN_MODULE2_QUESTIONS[dim];
    const mCount = 
      mDim.likertDirect.poleA.length +
      mDim.likertDirect.poleB.length +
      mDim.likertBehavioral.poleA.length +
      mDim.likertBehavioral.poleB.length +
      mDim.forcedChoice.length;
    counts.men[dim] = mCount;
    counts.men.total += mCount;
    
    const wDim = WOMEN_MODULE2_QUESTIONS[dim];
    const wCount = 
      wDim.likertDirect.poleA.length +
      wDim.likertDirect.poleB.length +
      wDim.likertBehavioral.poleA.length +
      wDim.likertBehavioral.poleB.length +
      wDim.forcedChoice.length;
    counts.women[dim] = wCount;
    counts.women.total += wCount;
  });
  
  return counts;
}

// =============================================================================
// M2 SCORING ENGINE
// =============================================================================

/**
 * Score a single dimension from M2 responses
 * Returns pole assignment, strength, and self-perception gap
 */
function scoreM2Dimension(gender, dimension, responses) {
  const questions = gender === 'M' ? MEN_MODULE2_QUESTIONS[dimension] : WOMEN_MODULE2_QUESTIONS[dimension];
  const poles = gender === 'M' ? MEN_M2_POLES[dimension] : WOMEN_W2_POLES[dimension];
  
  // Score direct questions (self-concept)
  let directPoleASum = 0, directPoleBSum = 0;
  let directPoleACount = 0, directPoleBCount = 0;
  
  questions.likertDirect.poleA.forEach(q => {
    if (responses[q.id] !== undefined) {
      directPoleASum += responses[q.id];
      directPoleACount++;
    }
  });
  
  questions.likertDirect.poleB.forEach(q => {
    if (responses[q.id] !== undefined) {
      directPoleBSum += responses[q.id];
      directPoleBCount++;
    }
  });
  
  const directPoleAAvg = directPoleACount > 0 ? directPoleASum / directPoleACount : 0;
  const directPoleBAvg = directPoleBCount > 0 ? directPoleBSum / directPoleBCount : 0;
  
  // Score behavioral questions (evidence from world)
  let behavPoleASum = 0, behavPoleBSum = 0;
  let behavPoleACount = 0, behavPoleBCount = 0;
  
  questions.likertBehavioral.poleA.forEach(q => {
    if (responses[q.id] !== undefined) {
      behavPoleASum += responses[q.id];
      behavPoleACount++;
    }
  });
  
  questions.likertBehavioral.poleB.forEach(q => {
    if (responses[q.id] !== undefined) {
      behavPoleBSum += responses[q.id];
      behavPoleBCount++;
    }
  });
  
  const behavPoleAAvg = behavPoleACount > 0 ? behavPoleASum / behavPoleACount : 0;
  const behavPoleBAvg = behavPoleBCount > 0 ? behavPoleBSum / behavPoleBCount : 0;
  
  // Score forced choice
  let fcPoleACount = 0, fcPoleBCount = 0;
  questions.forcedChoice.forEach(q => {
    if (responses[q.id] === 'A') fcPoleACount++;
    else if (responses[q.id] === 'B') fcPoleBCount++;
  });
  
  // Calculate combined scores
  // AUDIT-ADJUSTED WEIGHTS: Direct 30%, Behavioral 50%, Forced Choice 20%
  // Behavioral weighted higher because self-report is less reliable than evidence
  const totalFC = fcPoleACount + fcPoleBCount;
  const fcPoleAScore = totalFC > 0 ? (fcPoleACount / totalFC) * 5 : 2.5;
  const fcPoleBScore = totalFC > 0 ? (fcPoleBCount / totalFC) * 5 : 2.5;
  
  const combinedPoleA = (directPoleAAvg * 0.30) + (behavPoleAAvg * 0.50) + (fcPoleAScore * 0.20);
  const combinedPoleB = (directPoleBAvg * 0.30) + (behavPoleBAvg * 0.50) + (fcPoleBScore * 0.20);
  
  // Calculate self-perception gap BEFORE final assignment
  const directDelta = directPoleAAvg - directPoleBAvg;
  const behavDelta = behavPoleAAvg - behavPoleBAvg;
  const selfPerceptionGap = Math.abs(directDelta - behavDelta);
  
  // Detect perception mismatch (direct says A but behavioral says B)
  const directAssignment = directPoleAAvg >= directPoleBAvg ? 'A' : 'B';
  const behavAssignment = behavPoleAAvg >= behavPoleBAvg ? 'A' : 'B';
  const perceptionMismatch = directAssignment !== behavAssignment;
  
  // AUDIT FIX: Self-perception gap adjusts final score
  // When there's a mismatch, we trust behavioral more
  let adjustedPoleA = combinedPoleA;
  let adjustedPoleB = combinedPoleB;
  
  if (perceptionMismatch && selfPerceptionGap > 0.8) {
    // Shift score toward behavioral assignment
    const adjustmentFactor = Math.min(selfPerceptionGap * 0.15, 0.3); // Max 30% adjustment
    if (behavAssignment === 'A') {
      adjustedPoleA += adjustmentFactor;
      adjustedPoleB -= adjustmentFactor * 0.5;
    } else {
      adjustedPoleB += adjustmentFactor;
      adjustedPoleA -= adjustmentFactor * 0.5;
    }
  }
  
  // Determine assigned pole using adjusted scores
  const assignedPole = adjustedPoleA >= adjustedPoleB ? 'A' : 'B';
  const poleName = assignedPole === 'A' ? poles.A : poles.B;
  
  // Calculate strength with confidence penalty for perception gap
  const totalScore = adjustedPoleA + adjustedPoleB;
  const dominantScore = Math.max(adjustedPoleA, adjustedPoleB);
  let strength = totalScore > 0 ? Math.round((dominantScore / totalScore) * 100) : 50;
  
  // Apply confidence penalty for significant perception gaps
  let confidencePenalty = 0;
  if (selfPerceptionGap > 1.5) {
    confidencePenalty = 15;
  } else if (selfPerceptionGap > 0.8) {
    confidencePenalty = 8;
  }
  
  const confidence = Math.max(50, strength - confidencePenalty);
  
  // Determine gap interpretation
  let gapInterpretation = 'aligned';
  if (selfPerceptionGap > 1.5) {
    gapInterpretation = 'significant_gap';
  } else if (selfPerceptionGap > 0.8) {
    gapInterpretation = 'moderate_gap';
  }
  
  return {
    dimension,
    assignedPole,
    poleName,
    strength,
    confidence, // New: strength adjusted for perception gap
    flexibility: 100 - strength,
    scores: {
      direct: { poleA: directPoleAAvg, poleB: directPoleBAvg },
      behavioral: { poleA: behavPoleAAvg, poleB: behavPoleBAvg },
      forcedChoice: { poleA: fcPoleACount, poleB: fcPoleBCount },
      combined: { poleA: combinedPoleA, poleB: combinedPoleB },
      adjusted: { poleA: adjustedPoleA, poleB: adjustedPoleB } // New: gap-adjusted scores
    },
    selfPerceptionGap: {
      value: selfPerceptionGap,
      interpretation: gapInterpretation,
      perceptionMismatch,
      directSays: directAssignment === 'A' ? poles.A : poles.B,
      behavioralSays: behavAssignment === 'A' ? poles.A : poles.B,
      confidencePenalty
    }
  };
}

/**
 * Score complete Module 2 assessment
 * Returns persona code, all dimension scores, and pattern analysis
 */
function scoreModule2(gender, responses) {
  const dimensions = ['physical', 'social', 'lifestyle', 'values'];
  const poles = gender === 'M' ? MEN_M2_POLES : WOMEN_W2_POLES;
  
  const results = {};
  let code = '';
  
  // Code letter mapping for each dimension position
  const codeMap = {
    physical: { A: 'A', B: 'B' },
    social: { A: 'C', B: 'D' },
    lifestyle: { A: 'E', B: 'F' },
    values: { A: 'G', B: 'H' }
  };
  
  dimensions.forEach(dim => {
    results[dim] = scoreM2Dimension(gender, dim, responses);
    code += codeMap[dim][results[dim].assignedPole];
  });
  
  // Find key driver (strongest dimension)
  let keyDriver = null;
  let maxStrength = 0;
  dimensions.forEach(dim => {
    if (results[dim].strength > maxStrength) {
      maxStrength = results[dim].strength;
      keyDriver = {
        dimension: dim,
        pole: results[dim].poleName,
        strength: results[dim].strength
      };
    }
  });
  
  // Calculate overall self-perception gap score
  const totalGap = dimensions.reduce((sum, dim) => sum + results[dim].selfPerceptionGap.value, 0);
  const avgGap = totalGap / dimensions.length;
  
  // Count perception mismatches
  const perceptionMismatches = dimensions.filter(dim => results[dim].selfPerceptionGap.perceptionMismatch);
  
  // Generate flags
  const flags = [];
  
  dimensions.forEach(dim => {
    if (results[dim].selfPerceptionGap.interpretation === 'significant_gap') {
      flags.push({
        type: 'SELF_PERCEPTION_GAP',
        dimension: dim,
        severity: 'high',
        message: `Your self-concept (${results[dim].selfPerceptionGap.directSays}) differs from what the world reflects back (${results[dim].selfPerceptionGap.behavioralSays}) on ${dim}.`
      });
    }
    
    if (results[dim].strength < 55) {
      flags.push({
        type: 'BALANCED_IDENTITY',
        dimension: dim,
        severity: 'info',
        message: `You show balanced traits on ${dim}. You may express both ${poles[dim].A} and ${poles[dim].B} depending on context.`
      });
    }
    
    if (results[dim].strength > 85) {
      flags.push({
        type: 'STRONG_IDENTITY',
        dimension: dim,
        severity: 'info',
        message: `You have a strong ${results[dim].poleName} identity. This is core to who you are.`
      });
    }
  });
  
  return {
    gender,
    code,
    dimensions: results,
    keyDriver,
    overallSelfPerceptionGap: {
      average: avgGap,
      interpretation: avgGap > 1.2 ? 'significant' : avgGap > 0.6 ? 'moderate' : 'aligned',
      mismatchedDimensions: perceptionMismatches.map(dim => dim)
    },
    flags
  };
}

// =============================================================================
// TYPE 2 MISMATCH: M1 vs M2 (What You Want vs What You Offer)
// =============================================================================

/**
 * Analyze mismatch between what user wants (M1) and what they offer (M2)
 * This reveals structural attraction problems
 */
function analyzeType2Mismatch(m1Code, m2Code, gender) {
  // For men: His M1 is what he wants in her, His M2 is what he offers
  // For women: Her M1 is what she wants in him, Her W2 is what she offers
  
  // The key insight: What you offer should attract people who want what you want
  // If you want ACEG women but offer BDFH traits, you have a problem
  // Because ACEG women (who offer Beauty/Allure/Thrill/Traditional) typically want
  // men who offer complementary high-status traits
  
  const dimensionNames = ['Physical', 'Social', 'Lifestyle', 'Values'];
  const mismatches = [];
  
  // Parse codes into positions
  const m1Positions = m1Code.split('');
  const m2Positions = m2Code.split('');
  
  // Define what each pole typically attracts
  const attractionMatrix = {
    // What men who offer X typically attract in women
    M: {
      A: ['A', 'B'], // Fitness attracts both Beauty and Confidence seekers
      B: ['B'],      // Maturity primarily attracts Confidence seekers
      C: ['C', 'D'], // Leadership attracts both Allure and Charm seekers
      D: ['D'],      // Presence primarily attracts Charm seekers
      E: ['E'],      // Thrill attracts Thrill seekers
      F: ['F'],      // Peace attracts Peace seekers
      G: ['G'],      // Traditional attracts Traditional
      H: ['H']       // Egalitarian attracts Egalitarian
    },
    // What women who offer X typically attract in men
    W: {
      A: ['A'],      // Beauty primarily attracts Beauty seekers
      B: ['A', 'B'], // Confidence attracts both Fitness and Maturity seekers
      C: ['C'],      // Allure primarily attracts Allure seekers
      D: ['C', 'D'], // Charm attracts both Leadership and Presence seekers
      E: ['E'],      // Thrill attracts Thrill seekers
      F: ['F'],      // Peace attracts Peace seekers
      G: ['G'],      // Traditional attracts Traditional
      H: ['H']       // Egalitarian attracts Egalitarian
    }
  };
  
  // Check each dimension
  for (let i = 0; i < 4; i++) {
    const m1Want = m1Positions[i];
    const m2Offer = m2Positions[i];
    
    // Does what I offer attract people who want what I want?
    const whatMyOfferAttracts = attractionMatrix[gender][m2Offer] || [];
    
    // Simplified check: Does my M1 want match what my M2 offer typically attracts?
    // For lifestyle and values, they should match directly
    if (i >= 2) {
      // Lifestyle and Values should match
      if (m1Want !== m2Offer) {
        mismatches.push({
          dimension: dimensionNames[i],
          position: i,
          want: m1Want,
          offer: m2Offer,
          severity: i === 3 ? 'critical' : 'significant', // Values mismatch is critical
          explanation: getType2Explanation(gender, i, m1Want, m2Offer)
        });
      }
    } else {
      // Physical and Social have more complex dynamics
      // Check if there is meaningful divergence
      if (m1Want !== m2Offer) {
        mismatches.push({
          dimension: dimensionNames[i],
          position: i,
          want: m1Want,
          offer: m2Offer,
          severity: 'moderate',
          explanation: getType2Explanation(gender, i, m1Want, m2Offer)
        });
      }
    }
  }
  
  // Calculate overall coherence
  const criticalMismatches = mismatches.filter(m => m.severity === 'critical').length;
  const significantMismatches = mismatches.filter(m => m.severity === 'significant').length;
  
  let coherenceLevel;
  if (criticalMismatches > 0) {
    coherenceLevel = 'incoherent';
  } else if (significantMismatches > 1) {
    coherenceLevel = 'strained';
  } else if (mismatches.length > 2) {
    coherenceLevel = 'some_tension';
  } else {
    coherenceLevel = 'coherent';
  }
  
  return {
    m1Code,
    m2Code,
    gender,
    mismatches,
    coherenceLevel,
    coaching: generateType2Coaching(mismatches, coherenceLevel, gender)
  };
}

function getType2Explanation(gender, position, want, offer) {
  const explanations = {
    M: {
      0: {
        'A-B': 'You want Beauty in her but lead with Maturity yourself. Beautiful women often seek Fitness to match their investment in appearance.',
        'B-A': 'You want Confidence in her but lead with Fitness yourself. Confident women may value depth over physique.'
      },
      1: {
        'C-D': 'You want Allure in her but lead with Presence yourself. Alluring women often seek Leadership that matches their social power.',
        'D-C': 'You want Charm in her but lead with Leadership yourself. Charming women may prefer Presence that makes them feel seen.'
      },
      2: {
        'E-F': 'You want Thrill in her but offer Peace yourself. This creates lifestyle friction. She wants adventure; you offer stability.',
        'F-E': 'You want Peace in her but offer Thrill yourself. This creates lifestyle friction. She wants stability; you offer adventure.'
      },
      3: {
        'G-H': 'You want Traditional values in her but hold Egalitarian values yourself. This is a structural incompatibility.',
        'H-G': 'You want Egalitarian values in her but hold Traditional values yourself. This is a structural incompatibility.'
      }
    },
    W: {
      0: {
        'A-B': 'You want Fitness in him but lead with Confidence yourself. Fit men often seek Beauty to match their physical investment.',
        'B-A': 'You want Maturity in him but lead with Beauty yourself. Mature men may value confidence over appearance.'
      },
      1: {
        'C-D': 'You want Leadership in him but lead with Charm yourself. Leaders often seek Allure that matches their status.',
        'D-C': 'You want Presence in him but lead with Allure yourself. Present men may prefer Charm that feels warm and accessible.'
      },
      2: {
        'E-F': 'You want Thrill in him but offer Peace yourself. This creates lifestyle friction. He wants adventure; you offer stability.',
        'F-E': 'You want Peace in him but offer Thrill yourself. This creates lifestyle friction. He wants stability; you offer adventure.'
      },
      3: {
        'G-H': 'You want Traditional values in him but hold Egalitarian values yourself. This is a structural incompatibility.',
        'H-G': 'You want Egalitarian values in him but hold Traditional values yourself. This is a structural incompatibility.'
      }
    }
  };
  
  const key = `${want}-${offer}`;
  return explanations[gender]?.[position]?.[key] || 'Mismatch detected between what you want and what you offer.';
}

function generateType2Coaching(mismatches, coherenceLevel, gender) {
  const coaching = {
    summary: '',
    actions: []
  };
  
  if (coherenceLevel === 'coherent') {
    coaching.summary = 'What you want and what you offer are well-aligned. You are likely to attract people who want what you want.';
    return coaching;
  }
  
  if (coherenceLevel === 'incoherent') {
    coaching.summary = 'There is a significant gap between what you want and what you offer. The people you desire are often seeking something different from what you bring.';
    coaching.actions.push({
      priority: 'high',
      action: 'RECALIBRATE_EXPECTATIONS',
      message: 'Consider whether your ideal partner profile reflects genuine compatibility or aspirational fantasy.'
    });
  } else if (coherenceLevel === 'strained') {
    coaching.summary = 'There is tension between what you want and what you offer. You may find yourself attracted to people who are not naturally attracted to you.';
  } else {
    coaching.summary = 'Minor tensions exist between what you want and what you offer. These are manageable with awareness.';
  }
  
  // Add specific coaching for each mismatch
  mismatches.forEach(m => {
    if (m.severity === 'critical') {
      coaching.actions.push({
        priority: 'critical',
        dimension: m.dimension,
        action: 'VALUES_ALIGNMENT',
        message: m.explanation + ' Values mismatch predicts relationship failure. This requires serious reflection.'
      });
    } else if (m.severity === 'significant') {
      coaching.actions.push({
        priority: 'high',
        dimension: m.dimension,
        action: 'LIFESTYLE_ALIGNMENT',
        message: m.explanation + ' Consider partners who share your actual lifestyle orientation.'
      });
    } else {
      coaching.actions.push({
        priority: 'medium',
        dimension: m.dimension,
        action: 'AWARENESS',
        message: m.explanation
      });
    }
  });
  
  return coaching;
}

// =============================================================================
// TYPE 3 MISMATCH: M2 vs Demographics (What You Claim vs Reality)
// =============================================================================

/**
 * Analyze mismatch between M2 self-assessment and demographic reality
 * This reveals self-deception or aspiration vs current state
 */
function analyzeType3Mismatch(m2Result, demographics) {
  const mismatches = [];
  
  // Check Fitness claims against BMI/fitness demographics
  if (m2Result.gender === 'M' && m2Result.dimensions.physical) {
    const physicalResult = m2Result.dimensions.physical;
    
    if (physicalResult.assignedPole === 'A' && physicalResult.poleName === 'Fitness') {
      // He claims Fitness identity
      if (demographics.bmi && demographics.bmi > 30) {
        mismatches.push({
          type: 'FITNESS_BMI_MISMATCH',
          claimed: 'Fitness',
          demographic: 'BMI ' + demographics.bmi + ' (Obese range)',
          severity: 'significant',
          message: 'You identify as leading with Fitness, but your BMI suggests otherwise. This may indicate aspiration rather than current reality.',
          changeable: true
        });
      } else if (demographics.bmi && demographics.bmi > 25) {
        mismatches.push({
          type: 'FITNESS_BMI_MISMATCH',
          claimed: 'Fitness',
          demographic: 'BMI ' + demographics.bmi + ' (Overweight range)',
          severity: 'moderate',
          message: 'You identify as leading with Fitness, but your BMI is in the overweight range. Consider whether this is identity or aspiration.',
          changeable: true
        });
      }
      
      if (demographics.fitnessLevel && demographics.fitnessLevel === 'sedentary') {
        mismatches.push({
          type: 'FITNESS_ACTIVITY_MISMATCH',
          claimed: 'Fitness',
          demographic: 'Sedentary lifestyle',
          severity: 'significant',
          message: 'You identify as leading with Fitness, but report a sedentary lifestyle. There is a gap between identity and behavior.',
          changeable: true
        });
      }
    }
  }
  
  // Check Beauty claims against self-reported attractiveness
  if (m2Result.gender === 'W' && m2Result.dimensions.physical) {
    const physicalResult = m2Result.dimensions.physical;
    
    if (physicalResult.assignedPole === 'A' && physicalResult.poleName === 'Beauty') {
      // She claims Beauty identity - harder to validate objectively
      // Could cross-reference with behavioral evidence scores
      const behavScore = physicalResult.scores.behavioral.poleA;
      const directScore = physicalResult.scores.direct.poleA;
      
      if (directScore > 4 && behavScore < 3) {
        mismatches.push({
          type: 'BEAUTY_EVIDENCE_GAP',
          claimed: 'Strong Beauty identity',
          demographic: 'Limited behavioral evidence',
          severity: 'moderate',
          message: 'You strongly identify with Beauty, but report limited external validation. Consider whether this is aspiration or how you currently show up.'
        });
      }
    }
  }
  
  // Check Leadership claims against career/income
  if (m2Result.dimensions.social) {
    const socialResult = m2Result.dimensions.social;
    
    if (socialResult.assignedPole === 'A') {
      const leadershipClaim = m2Result.gender === 'M' ? 'Leadership' : 'Allure';
      
      if (m2Result.gender === 'M' && demographics.income && demographics.income < 40000) {
        // Low income may conflict with Leadership identity in some contexts
        // This is delicate - Leadership is not just about money
        // Only flag if behavioral evidence is also weak
        const behavScore = socialResult.scores.behavioral.poleA;
        if (behavScore < 3) {
          mismatches.push({
            type: 'LEADERSHIP_EVIDENCE_GAP',
            claimed: 'Leadership',
            demographic: 'Limited positional evidence',
            severity: 'low',
            message: 'You identify with Leadership. Ensure this reflects how you actually show up, not just how you see yourself.'
          });
        }
      }
    }
  }
  
  // Self-perception gap as a Type 3 indicator
  if (m2Result.overallSelfPerceptionGap.interpretation === 'significant') {
    mismatches.push({
      type: 'SELF_PERCEPTION_GAP',
      claimed: 'Self-concept',
      demographic: 'External feedback',
      severity: 'moderate',
      message: 'There is a significant gap between how you see yourself and what the world reflects back. This affects the accuracy of your persona assignment.',
      dimensions: m2Result.overallSelfPerceptionGap.mismatchedDimensions
    });
  }
  
  return {
    m2Code: m2Result.code,
    mismatches,
    overallValidity: mismatches.length === 0 ? 'validated' : 
                     mismatches.some(m => m.severity === 'significant') ? 'questioned' : 'minor_concerns',
    coaching: generateType3Coaching(mismatches)
  };
}

function generateType3Coaching(mismatches) {
  if (mismatches.length === 0) {
    return {
      summary: 'Your self-assessment aligns with demographic and behavioral evidence.',
      actions: []
    };
  }
  
  const coaching = {
    summary: 'Some aspects of your self-assessment may not match external reality. This is common and worth exploring.',
    actions: []
  };
  
  mismatches.forEach(m => {
    if (m.changeable) {
      coaching.actions.push({
        type: 'CHANGE_OR_ACCEPT',
        message: m.message,
        options: [
          'Work to align reality with identity (e.g., fitness changes)',
          'Recalibrate identity to match current reality',
          'Acknowledge gap and proceed with awareness'
        ]
      });
    } else {
      coaching.actions.push({
        type: 'AWARENESS',
        message: m.message
      });
    }
  });
  
  return coaching;
}

// =============================================================================
// MODIFIER SIGNAL EXTRACTION FROM M2
// =============================================================================

/**
 * Extract signals that feed into the modifier system
 */
function extractM2ModifierSignals(m2Result) {
  const signals = {
    selfAwareness: {
      score: 0,
      evidence: [],
      confidence: 'low'
    },
    shameResilience: {
      score: 0,
      evidence: [],
      confidence: 'low'
    },
    adaptability: {
      score: 0,
      evidence: []
    }
  };
  
  // Self-awareness: Based on self-perception gap
  // Low gap = high self-awareness (they know themselves)
  const gapScore = m2Result.overallSelfPerceptionGap.average;
  if (gapScore < 0.4) {
    signals.selfAwareness.score = 85;
    signals.selfAwareness.evidence.push('Direct self-assessment closely matches behavioral evidence');
    signals.selfAwareness.confidence = 'high';
  } else if (gapScore < 0.8) {
    signals.selfAwareness.score = 65;
    signals.selfAwareness.evidence.push('Moderate alignment between self-concept and behavioral evidence');
    signals.selfAwareness.confidence = 'medium';
  } else if (gapScore < 1.2) {
    signals.selfAwareness.score = 45;
    signals.selfAwareness.evidence.push('Some divergence between self-concept and behavioral evidence');
    signals.selfAwareness.confidence = 'medium';
  } else {
    signals.selfAwareness.score = 25;
    signals.selfAwareness.evidence.push('Significant gap between self-concept and behavioral evidence');
    signals.selfAwareness.confidence = 'high';
  }
  
  // Add specific dimension gaps
  Object.keys(m2Result.dimensions).forEach(dim => {
    const dimResult = m2Result.dimensions[dim];
    if (dimResult.selfPerceptionGap.perceptionMismatch) {
      signals.selfAwareness.evidence.push(
        `${dim}: See yourself as ${dimResult.selfPerceptionGap.directSays} but evidence suggests ${dimResult.selfPerceptionGap.behavioralSays}`
      );
    }
  });
  
  // Shame resilience: Based on overclaiming patterns
  // If someone scores very high on direct but low on behavioral, may indicate defensive inflation
  let overclaims = 0;
  Object.keys(m2Result.dimensions).forEach(dim => {
    const dimResult = m2Result.dimensions[dim];
    const directMax = Math.max(dimResult.scores.direct.poleA, dimResult.scores.direct.poleB);
    const behavMax = Math.max(dimResult.scores.behavioral.poleA, dimResult.scores.behavioral.poleB);
    
    if (directMax > 4 && behavMax < 3) {
      overclaims++;
      signals.shameResilience.evidence.push(`${dim}: High self-rating without behavioral evidence may indicate defensive inflation`);
    }
  });
  
  if (overclaims === 0) {
    signals.shameResilience.score = 70;
    signals.shameResilience.evidence.push('No overclaiming patterns detected');
    signals.shameResilience.confidence = 'medium';
  } else if (overclaims === 1) {
    signals.shameResilience.score = 55;
    signals.shameResilience.confidence = 'low';
  } else {
    signals.shameResilience.score = 35;
    signals.shameResilience.evidence.push('Multiple dimensions show inflation patterns');
    signals.shameResilience.confidence = 'medium';
  }
  
  // Adaptability: Based on flexibility scores across dimensions
  const flexScores = Object.keys(m2Result.dimensions).map(dim => m2Result.dimensions[dim].flexibility);
  const avgFlex = flexScores.reduce((a, b) => a + b, 0) / flexScores.length;
  
  signals.adaptability.score = Math.round(avgFlex);
  if (avgFlex > 40) {
    signals.adaptability.evidence.push('Shows flexibility across identity dimensions');
  } else if (avgFlex > 25) {
    signals.adaptability.evidence.push('Moderate identity flexibility');
  } else {
    signals.adaptability.evidence.push('Strong fixed identity across dimensions');
  }
  
  return signals;
}

// =============================================================================
// PERSONA PROFILES (Bridge to Compatibility Engine)
// =============================================================================

/**
 * Full persona profiles with behavioral predictions
 * These bridge M2 code to actionable relationship insights
 */
const M2_PERSONA_PROFILES = {
  'ACEG': {
    name: 'The Gladiator',
    code: 'ACEG',
    summary: 'Fitness + Leadership + Thrill + Traditional',
    datingBehavior: [
      'Leads with physical presence and takes charge immediately',
      'Pursues actively and decisively',
      'Prefers traditional courtship dynamics',
      'Seeks adventure-oriented dates'
    ],
    inRelationships: [
      'Takes the lead on major decisions',
      'Provides physical protection and presence',
      'Maintains traditional role expectations',
      'Keeps relationship exciting with new experiences'
    ],
    howValued: [
      'Physical fitness and capability',
      'Decisive leadership',
      'Adventurous spirit',
      'Clear masculine identity'
    ],
    disappointments: [
      'Partners who want to negotiate everything',
      'Sedentary or routine-heavy lifestyle expectations',
      'Challenges to his leadership role',
      'Lack of appreciation for traditional values'
    ]
  },
  'ACEH': {
    name: 'The Maverick',
    code: 'ACEH',
    summary: 'Fitness + Leadership + Thrill + Egalitarian',
    datingBehavior: [
      'Confident physical presence with progressive mindset',
      'Takes initiative but values equal partnership',
      'Seeks adventure with intellectual connection',
      'Modern approach to dating dynamics'
    ],
    inRelationships: [
      'Active leadership with collaborative decision-making',
      'Maintains fitness as shared lifestyle value',
      'Pushes for growth and new experiences together',
      'Flexible on roles, firm on adventure'
    ],
    howValued: [
      'Physical vitality combined with open mind',
      'Decisive when needed, flexible when appropriate',
      'Exciting yet emotionally intelligent',
      'Modern masculinity without rigidity'
    ],
    disappointments: [
      'Partners who want traditional role rigidity',
      'Complacency or resistance to growth',
      'Stagnant or overly predictable relationship patterns',
      'Closed-mindedness about lifestyle choices'
    ]
  },
  'ACFG': {
    name: 'The Spy',
    code: 'ACFG',
    summary: 'Fitness + Leadership + Peace + Traditional',
    datingBehavior: [
      'Controlled physical presence, strategic approach',
      'Takes charge but values stability over excitement',
      'Traditional courtship with measured pacing',
      'Prefers quality over quantity in dating'
    ],
    inRelationships: [
      'Quiet strength and steady leadership',
      'Creates secure, stable home environment',
      'Maintains fitness while prioritizing peace',
      'Traditional values expressed through calm competence'
    ],
    howValued: [
      'Physical capability without showiness',
      'Reliable leadership and decision-making',
      'Calm under pressure',
      'Traditional values with sophistication'
    ],
    disappointments: [
      'Drama and unnecessary conflict',
      'Partners who need constant excitement',
      'Challenges to his quiet authority',
      'Chaotic or unpredictable lifestyle demands'
    ]
  },
  'ACFH': {
    name: 'The Engineer',
    code: 'ACFH',
    summary: 'Fitness + Leadership + Peace + Egalitarian',
    datingBehavior: [
      'Methodical approach with physical confidence',
      'Takes initiative but seeks collaborative partnership',
      'Values stability and intellectual connection',
      'Prefers low-key dates with meaningful conversation'
    ],
    inRelationships: [
      'Leads through competence rather than dominance',
      'Builds stable systems for shared life',
      'Maintains health as partnership value',
      'Equal partnership with clear communication'
    ],
    howValued: [
      'Physical fitness with intellectual depth',
      'Problem-solving and practical leadership',
      'Emotional stability and reliability',
      'Modern partnership approach'
    ],
    disappointments: [
      'Partners who create unnecessary drama',
      'Rigid traditional role expectations',
      'Chaos or poor planning',
      'Resistance to rational discussion'
    ]
  },
  'ADEG': {
    name: 'The Cowboy',
    code: 'ADEG',
    summary: 'Fitness + Presence + Thrill + Traditional',
    datingBehavior: [
      'Strong physical presence with attentive nature',
      'Pursues through focused attention, not domination',
      'Seeks adventure while honoring traditions',
      'Values authentic connection over games'
    ],
    inRelationships: [
      'Makes partner feel truly seen and protected',
      'Combines adventure with traditional commitment',
      'Physically present and emotionally attentive',
      'Honors his word and keeps commitments'
    ],
    howValued: [
      'Physical capability with emotional depth',
      'Authentic attention and presence',
      'Adventurous spirit with traditional honor',
      'Reliability wrapped in excitement'
    ],
    disappointments: [
      'Superficial or attention-seeking partners',
      'Disrespect for tradition and commitment',
      'Partners who do not appreciate being truly seen',
      'Sedentary lifestyle expectations'
    ]
  },
  'ADEH': {
    name: 'The Sherpa',
    code: 'ADEH',
    summary: 'Fitness + Presence + Thrill + Egalitarian',
    datingBehavior: [
      'Physical vitality with deep attentiveness',
      'Guides rather than leads, explores together',
      'Seeks adventure as shared growth experience',
      'Values equal partnership in exploration'
    ],
    inRelationships: [
      'Makes partner feel seen on shared adventures',
      'Physical partnership without role constraints',
      'Pushes growth while staying present',
      'Collaborative decision-making on lifestyle'
    ],
    howValued: [
      'Physical capability with emotional presence',
      'Guides without controlling',
      'Adventure partner who truly listens',
      'Progressive values with physical grounding'
    ],
    disappointments: [
      'Partners who want to be led rather than joined',
      'Rigid role expectations',
      'Complacency or fear of growth',
      'Superficial attention or distraction'
    ]
  },
  'ADFG': {
    name: 'The Curator',
    code: 'ADFG',
    summary: 'Fitness + Presence + Peace + Traditional',
    datingBehavior: [
      'Quiet physical confidence with deep attention',
      'Patient pursuit focused on genuine connection',
      'Values stability and traditional courtship',
      'Quality time over exciting activities'
    ],
    inRelationships: [
      'Creates peaceful sanctuary with physical security',
      'Deeply attentive within traditional structure',
      'Maintains health as calm discipline',
      'Honors traditions through presence, not pronouncement'
    ],
    howValued: [
      'Physical strength expressed as protection',
      'Deep attention without drama',
      'Stable and traditional with emotional depth',
      'Quiet competence and reliability'
    ],
    disappointments: [
      'Chaos and constant change',
      'Partners who do not value being truly seen',
      'Challenges to traditional values',
      'Superficiality or restlessness'
    ]
  },
  'ADFH': {
    name: 'The Recruiter',
    code: 'ADFH',
    summary: 'Fitness + Presence + Peace + Egalitarian',
    datingBehavior: [
      'Approachable physical presence with genuine interest',
      'Draws people in through attention, not pursuit',
      'Values stability and equal partnership',
      'Builds connection through consistent presence'
    ],
    inRelationships: [
      'Creates calm partnership with physical security',
      'Equal voice with deep attention to partner',
      'Maintains health as shared lifestyle value',
      'Flexible on roles, consistent on presence'
    ],
    howValued: [
      'Physical fitness with emotional availability',
      'Makes partner feel known and valued',
      'Stable and modern partnership approach',
      'Reliable without rigidity'
    ],
    disappointments: [
      'Drama and unnecessary conflict',
      'Partners who want traditional dominance',
      'Restlessness or inability to be present',
      'Superficial engagement'
    ]
  },
  'BCEG': {
    name: 'The Legionnaire',
    code: 'BCEG',
    summary: 'Maturity + Leadership + Thrill + Traditional',
    datingBehavior: [
      'Commands respect through experience and authority',
      'Pursues decisively with mature confidence',
      'Seeks adventure within traditional framework',
      'Values heritage and honor in courtship'
    ],
    inRelationships: [
      'Leads through wisdom and experience',
      'Provides stability through adventures',
      'Traditional patriarch with exciting spirit',
      'Honors commitments while seeking growth'
    ],
    howValued: [
      'Depth and wisdom with decisive action',
      'Leadership earned through experience',
      'Traditional values with adventurous execution',
      'Mature masculinity with vitality'
    ],
    disappointments: [
      'Disrespect for experience and wisdom',
      'Challenges to his earned authority',
      'Partners who reject traditional structure',
      'Stagnation or fear of adventure'
    ]
  },
  'BCEH': {
    name: 'The Astronaut',
    code: 'BCEH',
    summary: 'Maturity + Leadership + Thrill + Egalitarian',
    datingBehavior: [
      'Confident maturity with progressive outlook',
      'Takes initiative on shared exploration',
      'Seeks intellectual and experiential adventure',
      'Modern approach with depth of experience'
    ],
    inRelationships: [
      'Leads exploration as equal partners',
      'Uses wisdom to navigate new territory together',
      'Maintains growth mindset through maturity',
      'Equal partnership with experienced guidance'
    ],
    howValued: [
      'Wisdom combined with openness to new',
      'Leadership without ego attachment',
      'Exciting intellectual and experiential depth',
      'Modern values with mature grounding'
    ],
    disappointments: [
      'Closed-mindedness or fear of growth',
      'Partners who want traditional rigidity',
      'Complacency or intellectual stagnation',
      'Superficiality in adventure-seeking'
    ]
  },
  'BCFG': {
    name: 'The Statesman',
    code: 'BCFG',
    summary: 'Maturity + Leadership + Peace + Traditional',
    datingBehavior: [
      'Distinguished presence with measured approach',
      'Courts with traditional values and patience',
      'Seeks lasting stability over excitement',
      'Values heritage and proven patterns'
    ],
    inRelationships: [
      'Leads household with wisdom and tradition',
      'Creates stable, respected home environment',
      'Mature guidance within traditional structure',
      'Long-term vision with steady execution'
    ],
    howValued: [
      'Wisdom and experience as foundation',
      'Reliable leadership and decision-making',
      'Traditional values with dignity',
      'Calm authority and respectability'
    ],
    disappointments: [
      'Chaos and instability',
      'Disrespect for tradition and experience',
      'Partners who crave constant excitement',
      'Challenges to established order'
    ]
  },
  'BCFH': {
    name: 'The Professor',
    code: 'BCFH',
    summary: 'Maturity + Leadership + Peace + Egalitarian',
    datingBehavior: [
      'Intellectual depth with calm confidence',
      'Engages through ideas and thoughtful attention',
      'Values stability and equal discourse',
      'Builds connection through understanding'
    ],
    inRelationships: [
      'Leads through competence and wisdom',
      'Creates intellectually stimulating stability',
      'Equal partnership with mature guidance',
      'Collaborative decision-making with depth'
    ],
    howValued: [
      'Wisdom without arrogance',
      'Thoughtful leadership and reliability',
      'Intellectual depth with emotional stability',
      'Modern partnership with mature grounding'
    ],
    disappointments: [
      'Anti-intellectualism or closed-mindedness',
      'Drama and unnecessary conflict',
      'Partners who want traditional dominance patterns',
      'Restlessness or inability to appreciate depth'
    ]
  },
  'BDEG': {
    name: 'The Ranger',
    code: 'BDEG',
    summary: 'Maturity + Presence + Thrill + Traditional',
    datingBehavior: [
      'Quiet depth with adventurous spirit',
      'Connects through presence, not performance',
      'Seeks authentic adventure with traditional values',
      'Patient pursuit of genuine connection'
    ],
    inRelationships: [
      'Deeply attentive within traditional commitment',
      'Shares adventures while honoring roots',
      'Mature presence with exciting experiences',
      'Keeps word and honors traditions'
    ],
    howValued: [
      'Depth and experience with authentic attention',
      'Adventurous spirit grounded in values',
      'Traditional honor without rigidity',
      'Makes partner feel truly known'
    ],
    disappointments: [
      'Superficiality and game-playing',
      'Disrespect for tradition and commitment',
      'Partners who do not value deep presence',
      'Stagnation or fear of authentic adventure'
    ]
  },
  'BDEH': {
    name: 'The Playwright',
    code: 'BDEH',
    summary: 'Maturity + Presence + Thrill + Egalitarian',
    datingBehavior: [
      'Deep attention with creative spirit',
      'Connects through understanding and shared exploration',
      'Seeks meaningful adventures as equals',
      'Values authentic connection over roles'
    ],
    inRelationships: [
      'Creates meaningful experiences together',
      'Deep presence in equal partnership',
      'Grows through shared exploration',
      'Collaborative meaning-making'
    ],
    howValued: [
      'Depth of attention and understanding',
      'Creative approach to shared life',
      'Progressive values with mature depth',
      'Makes partner feel truly seen and valued'
    ],
    disappointments: [
      'Superficiality or inauthenticity',
      'Rigid role expectations',
      'Complacency or resistance to growth',
      'Partners who cannot receive deep presence'
    ]
  },
  'BDFG': {
    name: 'The Arborist',
    code: 'BDFG',
    summary: 'Maturity + Presence + Peace + Traditional',
    datingBehavior: [
      'Patient depth with traditional values',
      'Connects through quiet attention',
      'Seeks lasting roots and stability',
      'Values heritage and proven patterns'
    ],
    inRelationships: [
      'Creates deep roots and lasting security',
      'Attentive presence within traditional structure',
      'Nurtures growth through patient attention',
      'Honors traditions through daily presence'
    ],
    howValued: [
      'Depth and patience combined',
      'Traditional values with emotional depth',
      'Makes partner feel deeply known',
      'Reliable and rooted presence'
    ],
    disappointments: [
      'Restlessness and constant change',
      'Superficial engagement',
      'Disrespect for tradition and roots',
      'Partners who cannot appreciate depth and stability'
    ]
  },
  'BDFH': {
    name: 'The Builder',
    code: 'BDFH',
    summary: 'Maturity + Presence + Peace + Egalitarian',
    datingBehavior: [
      'Calm depth with collaborative spirit',
      'Builds connection through understanding',
      'Seeks stable equal partnership',
      'Values genuine connection over excitement'
    ],
    inRelationships: [
      'Creates secure partnership as equals',
      'Deep presence in collaborative building',
      'Nurtures shared growth and stability',
      'Flexible roles with consistent attention'
    ],
    howValued: [
      'Depth and reliability combined',
      'Equal partnership with mature grounding',
      'Makes partner feel known and valued',
      'Builds lasting security together'
    ],
    disappointments: [
      'Drama and instability',
      'Superficial engagement',
      'Partners who want traditional dominance',
      'Restlessness or inability to build together'
    ]
  }
};

const W2_PERSONA_PROFILES = {
  'ACEG': {
    name: 'The Debutante',
    code: 'ACEG',
    summary: 'Beauty + Allure + Thrill + Traditional',
    datingBehavior: [
      'Leads with striking beauty and selective attention',
      'Creates intrigue through measured availability',
      'Seeks exciting courtship within traditional framework',
      'Values being pursued with effort and intention'
    ],
    inRelationships: [
      'Maintains beauty and mystery',
      'Traditional feminine role with exciting spirit',
      'Keeps relationship dynamic and interesting',
      'Values clear masculine leadership'
    ],
    howValued: [
      'Striking beauty that commands attention',
      'Selective nature that validates pursuit',
      'Adventurous spirit with traditional grace',
      'Feminine mystique with exciting energy'
    ],
    disappointments: [
      'Partners who do not pursue with intention',
      'Boring or routine relationship patterns',
      'Challenges to traditional dynamics',
      'Being taken for granted'
    ]
  },
  'ACEH': {
    name: 'The Correspondent',
    code: 'ACEH',
    summary: 'Beauty + Allure + Thrill + Egalitarian',
    datingBehavior: [
      'Striking presence with independent spirit',
      'Maintains mystery while seeking equal partnership',
      'Pursues adventure and intellectual stimulation',
      'Modern approach with captivating presence'
    ],
    inRelationships: [
      'Maintains allure within equal partnership',
      'Seeks growth and adventure together',
      'Beauty as personal expression, not obligation',
      'Collaborative with exciting energy'
    ],
    howValued: [
      'Beauty combined with independence',
      'Intriguing and intellectually engaging',
      'Adventurous spirit with modern values',
      'Captivating without being dependent'
    ],
    disappointments: [
      'Traditional role expectations',
      'Partners who want to control or possess',
      'Stagnation or complacency',
      'Being valued only for appearance'
    ]
  },
  'ACFG': {
    name: 'The Duchess',
    code: 'ACFG',
    summary: 'Beauty + Allure + Peace + Traditional',
    datingBehavior: [
      'Elegant beauty with composed mystery',
      'Selective and patient in courtship',
      'Values stability within traditional framework',
      'Commands respect through grace'
    ],
    inRelationships: [
      'Creates beautiful, stable home environment',
      'Traditional feminine role with dignity',
      'Maintains allure through composed presence',
      'Values security and lasting commitment'
    ],
    howValued: [
      'Elegant beauty with emotional stability',
      'Grace and composure under pressure',
      'Traditional values with sophistication',
      'Creates peace and beauty together'
    ],
    disappointments: [
      'Chaos and instability',
      'Partners who lack ambition or standing',
      'Disrespect for traditional values',
      'Crudeness or lack of refinement'
    ]
  },
  'ACFH': {
    name: 'The Influencer',
    code: 'ACFH',
    summary: 'Beauty + Allure + Peace + Egalitarian',
    datingBehavior: [
      'Modern beauty with selective engagement',
      'Creates intrigue within equal dynamic',
      'Values stability and partnership',
      'Builds connection through curated presence'
    ],
    inRelationships: [
      'Maintains personal brand and partnership',
      'Equal voice with aesthetic sensibility',
      'Creates beautiful shared life',
      'Collaborative with calm confidence'
    ],
    howValued: [
      'Beauty as personal expression',
      'Intriguing and emotionally stable',
      'Modern partnership approach',
      'Creates aesthetic and peaceful environment'
    ],
    disappointments: [
      'Drama and unnecessary conflict',
      'Traditional role expectations',
      'Partners who dismiss her platform or presence',
      'Chaos or instability'
    ]
  },
  'ADEG': {
    name: 'The Barrel Racer',
    code: 'ADEG',
    summary: 'Beauty + Charm + Thrill + Traditional',
    datingBehavior: [
      'Warm beauty with adventurous spirit',
      'Engages openly within traditional values',
      'Seeks exciting connection with clear roles',
      'Accessible and exciting presence'
    ],
    inRelationships: [
      'Warm and exciting partnership',
      'Traditional roles with adventurous execution',
      'Beauty expressed through vitality',
      'Loyal and exciting companion'
    ],
    howValued: [
      'Warm beauty that invites connection',
      'Adventurous spirit with traditional heart',
      'Makes partner feel welcomed and excited',
      'Loyal with exciting energy'
    ],
    disappointments: [
      'Boring or sedentary partners',
      'Challenges to traditional values',
      'Partners who cannot match her energy',
      'Being held back from adventure'
    ]
  },
  'ADEH': {
    name: 'The Podcaster',
    code: 'ADEH',
    summary: 'Beauty + Charm + Thrill + Egalitarian',
    datingBehavior: [
      'Engaging beauty with open approach',
      'Connects warmly as equals',
      'Seeks shared adventure and growth',
      'Accessible and intellectually curious'
    ],
    inRelationships: [
      'Warm equal partnership with adventure',
      'Engages openly in shared exploration',
      'Beauty as one facet of whole self',
      'Collaborative growth orientation'
    ],
    howValued: [
      'Warm beauty with intellectual engagement',
      'Makes partner feel interesting and valued',
      'Adventurous and progressive',
      'Genuinely engaging presence'
    ],
    disappointments: [
      'Closed-mindedness or rigidity',
      'Traditional role expectations',
      'Complacency or fear of growth',
      'Partners who cannot engage substantively'
    ]
  },
  'ADFG': {
    name: 'The Trophy',
    code: 'ADFG',
    summary: 'Beauty + Charm + Peace + Traditional',
    datingBehavior: [
      'Classic beauty with warm approach',
      'Engages gracefully within traditional framework',
      'Values stability and clear roles',
      'Accessible within appropriate boundaries'
    ],
    inRelationships: [
      'Creates beautiful, stable home',
      'Warm traditional partnership',
      'Beauty maintained as part of role',
      'Supportive and gracious presence'
    ],
    howValued: [
      'Classic beauty with warm nature',
      'Creates peaceful, beautiful environment',
      'Traditional values with genuine warmth',
      'Enhances partner standing gracefully'
    ],
    disappointments: [
      'Instability or chaos',
      'Partners who do not provide security',
      'Disrespect for traditional values',
      'Being undervalued or neglected'
    ]
  },
  'ADFH': {
    name: 'The Girl Next Door',
    code: 'ADFH',
    summary: 'Beauty + Charm + Peace + Egalitarian',
    datingBehavior: [
      'Approachable beauty with genuine warmth',
      'Engages authentically as equals',
      'Values stability and partnership',
      'Easy to connect with, real and grounded'
    ],
    inRelationships: [
      'Warm equal partnership',
      'Creates comfortable shared life',
      'Beauty expressed naturally',
      'Genuine and stable presence'
    ],
    howValued: [
      'Natural beauty with authentic warmth',
      'Easy to be with and genuinely caring',
      'Stable and real partnership',
      'Comfortable and comforting presence'
    ],
    disappointments: [
      'Drama and game-playing',
      'Traditional role expectations',
      'Partners who want performance over reality',
      'Instability or unreliability'
    ]
  },
  'BCEG': {
    name: 'The Party Planner',
    code: 'BCEG',
    summary: 'Confidence + Allure + Thrill + Traditional',
    datingBehavior: [
      'Confident presence with selective mystery',
      'Commands room while maintaining intrigue',
      'Seeks exciting connections within traditional structure',
      'Knows her worth and values clear pursuit'
    ],
    inRelationships: [
      'Brings confidence and excitement',
      'Traditional roles with dynamic energy',
      'Creates exciting shared experiences',
      'Values masculine leadership'
    ],
    howValued: [
      'Confident presence that captivates',
      'Creates exciting experiences',
      'Traditional values with bold execution',
      'Commands respect while creating fun'
    ],
    disappointments: [
      'Weak or indecisive partners',
      'Boring routine-heavy relationships',
      'Challenges to traditional dynamics',
      'Partners who cannot keep up'
    ]
  },
  'BCEH': {
    name: 'The Marketer',
    code: 'BCEH',
    summary: 'Confidence + Allure + Thrill + Egalitarian',
    datingBehavior: [
      'Confident presence with strategic mystery',
      'Engages as equals while maintaining intrigue',
      'Seeks exciting growth and partnership',
      'Modern approach with captivating presence'
    ],
    inRelationships: [
      'Confident equal partnership',
      'Creates exciting shared ventures',
      'Maintains personal power and allure',
      'Collaborative with ambitious energy'
    ],
    howValued: [
      'Confidence with captivating presence',
      'Ambitious and exciting partner',
      'Modern values with strategic thinking',
      'Creates opportunity and excitement'
    ],
    disappointments: [
      'Partners who feel threatened by her success',
      'Traditional role expectations',
      'Complacency or lack of ambition',
      'Being underestimated or dismissed'
    ]
  },
  'BCFG': {
    name: 'The Executive',
    code: 'BCFG',
    summary: 'Confidence + Allure + Peace + Traditional',
    datingBehavior: [
      'Composed confidence with measured mystery',
      'Selective and discerning in courtship',
      'Values stability and appropriate traditional structure',
      'Commands respect through competence'
    ],
    inRelationships: [
      'Confident presence within traditional framework',
      'Creates stable, well-ordered home',
      'Maintains composure and appropriate mystery',
      'Values partnership with clear structure'
    ],
    howValued: [
      'Competent confidence with grace',
      'Creates stability and order',
      'Traditional values executed with sophistication',
      'Commands respect in all settings'
    ],
    disappointments: [
      'Chaos and poor planning',
      'Partners who lack ambition or competence',
      'Challenges to appropriate structure',
      'Unprofessional or undignified behavior'
    ]
  },
  'BCFH': {
    name: 'The Producer',
    code: 'BCFH',
    summary: 'Confidence + Allure + Peace + Egalitarian',
    datingBehavior: [
      'Competent confidence with selective engagement',
      'Seeks stable partnership as equals',
      'Values substance over flash',
      'Gets things done while maintaining intrigue'
    ],
    inRelationships: [
      'Confident equal partnership',
      'Creates stable, productive shared life',
      'Maintains personal power collaboratively',
      'Practical with captivating depth'
    ],
    howValued: [
      'Gets things done with confidence',
      'Stable and capable partner',
      'Modern partnership with substance',
      'Competent without arrogance'
    ],
    disappointments: [
      'Drama and inefficiency',
      'Traditional role expectations',
      'Partners who cannot pull their weight',
      'Style over substance'
    ]
  },
  'BDEG': {
    name: 'The Coach',
    code: 'BDEG',
    summary: 'Confidence + Charm + Thrill + Traditional',
    datingBehavior: [
      'Warm confidence with energetic engagement',
      'Connects openly with traditional values',
      'Seeks exciting partnership with clear roles',
      'Encouraging and accessible presence'
    ],
    inRelationships: [
      'Warm leadership within traditional structure',
      'Encourages and supports partner growth',
      'Creates exciting, positive environment',
      'Traditional values with dynamic energy'
    ],
    howValued: [
      'Warm confidence that encourages',
      'Creates positive, exciting energy',
      'Traditional values with genuine engagement',
      'Makes partner feel capable and valued'
    ],
    disappointments: [
      'Negative or pessimistic partners',
      'Challenges to traditional values',
      'Sedentary or boring lifestyle',
      'Partners who cannot receive encouragement'
    ]
  },
  'BDEH': {
    name: 'The Founder',
    code: 'BDEH',
    summary: 'Confidence + Charm + Thrill + Egalitarian',
    datingBehavior: [
      'Confident warmth with ambitious energy',
      'Engages openly as equal partners',
      'Seeks exciting shared ventures',
      'Creates connection through genuine engagement'
    ],
    inRelationships: [
      'Warm equal partnership in building',
      'Creates exciting shared ventures',
      'Genuine engagement in growth',
      'Collaborative ambition'
    ],
    howValued: [
      'Warm confidence with ambition',
      'Creates opportunity together',
      'Genuine partnership in building',
      'Makes things happen with warmth'
    ],
    disappointments: [
      'Complacency or fear of risk',
      'Traditional role expectations',
      'Partners who cannot match her drive',
      'Negativity or pessimism'
    ]
  },
  'BDFG': {
    name: 'The Designer',
    code: 'BDFG',
    summary: 'Confidence + Charm + Peace + Traditional',
    datingBehavior: [
      'Warm confidence with aesthetic sensibility',
      'Engages gracefully within traditional framework',
      'Values stability and beauty in connection',
      'Creates appealing, welcoming presence'
    ],
    inRelationships: [
      'Creates beautiful, stable environment',
      'Traditional roles with creative expression',
      'Warm confidence in partnership',
      'Designs shared life with care'
    ],
    howValued: [
      'Creates beauty and stability',
      'Warm confidence with aesthetic sense',
      'Traditional values with creative execution',
      'Makes home and relationship beautiful'
    ],
    disappointments: [
      'Chaos and disorganization',
      'Partners who lack aesthetic sense',
      'Challenges to traditional structure',
      'Crudeness or lack of refinement'
    ]
  },
  'BDFH': {
    name: 'The Therapist',
    code: 'BDFH',
    summary: 'Confidence + Charm + Peace + Egalitarian',
    datingBehavior: [
      'Warm confidence with genuine understanding',
      'Engages authentically as equals',
      'Values stable, meaningful connection',
      'Creates safe space for genuine exchange'
    ],
    inRelationships: [
      'Deep equal partnership',
      'Creates safe, stable environment',
      'Genuine engagement and understanding',
      'Collaborative growth and healing'
    ],
    howValued: [
      'Warm confidence that heals',
      'Creates genuine safety and connection',
      'Stable partnership with depth',
      'Makes partner feel truly understood'
    ],
    disappointments: [
      'Superficiality or inauthenticity',
      'Traditional role expectations',
      'Partners who cannot engage deeply',
      'Drama or instability'
    ]
  }
};

/**
 * Get full persona profile from code
 */
function getPersonaProfile(code, gender) {
  const profiles = gender === 'M' ? M2_PERSONA_PROFILES : W2_PERSONA_PROFILES;
  return profiles[code] || null;
}

// =============================================================================
// UNIFIED MODIFIER SYSTEM (Integrates M1, M2, Demographics)
// =============================================================================

/**
 * The unified modifier system combines signals from all sources:
 * - M1: What they want (consistency, flexibility)
 * - M2: What they are (self-perception gap, overclaiming)
 * - Demographics: Reality checks and context
 * 
 * Produces four modifier scores that affect compatibility predictions:
 * - Self-Awareness: How well do they know themselves?
 * - Shame Resilience: How do they handle identity threats?
 * - Adaptability: How flexible are they in relationships?
 * - Growth Orientation: Are they building or defending?
 */
function calculateUnifiedModifiers(m1Signals, m2Signals, demographics, m2Result) {
  const modifiers = {
    selfAwareness: {
      score: 0,
      sources: [],
      confidence: 'low'
    },
    shameResilience: {
      score: 0,
      sources: [],
      confidence: 'low'
    },
    adaptability: {
      score: 0,
      sources: [],
      confidence: 'low'
    },
    growthOrientation: {
      score: 0,
      sources: [],
      confidence: 'low'
    }
  };
  
  // ==========================================================================
  // SELF-AWARENESS (How well do they know themselves?)
  // ==========================================================================
  
  let selfAwarenessSum = 0;
  let selfAwarenessWeight = 0;
  
  // M1 signal: Consistency score (if available)
  if (m1Signals && m1Signals.selfAwareness) {
    selfAwarenessSum += m1Signals.selfAwareness.score * 0.3;
    selfAwarenessWeight += 0.3;
    modifiers.selfAwareness.sources.push({
      source: 'M1_consistency',
      score: m1Signals.selfAwareness.score,
      weight: 0.3
    });
  }
  
  // M2 signal: Self-perception gap (primary)
  if (m2Signals && m2Signals.selfAwareness) {
    selfAwarenessSum += m2Signals.selfAwareness.score * 0.5;
    selfAwarenessWeight += 0.5;
    modifiers.selfAwareness.sources.push({
      source: 'M2_perception_gap',
      score: m2Signals.selfAwareness.score,
      weight: 0.5
    });
  }
  
  // Demographics: Age adjustment (older = more life experience to know self)
  if (demographics && demographics.age) {
    let ageBonus = 0;
    if (demographics.age >= 35 && demographics.age < 45) {
      ageBonus = 5;
    } else if (demographics.age >= 45 && demographics.age < 55) {
      ageBonus = 10;
    } else if (demographics.age >= 55) {
      ageBonus = 12;
    }
    
    if (ageBonus > 0) {
      selfAwarenessSum += ageBonus * 0.2;
      selfAwarenessWeight += 0.2;
      modifiers.selfAwareness.sources.push({
        source: 'age_experience',
        score: ageBonus,
        weight: 0.2
      });
    }
  }
  
  // Demographics: Relationship history adjustment
  if (demographics && demographics.relationshipHistory) {
    let historyAdjust = 0;
    if (demographics.relationshipHistory.longTermCount >= 2) {
      historyAdjust = 8; // Multiple long-term relationships suggest learning
    } else if (demographics.relationshipHistory.longTermCount === 1 && demographics.relationshipHistory.marriedBefore) {
      historyAdjust = 5;
    }
    
    // Penalty for many short relationships without reflection
    if (demographics.relationshipHistory.shortTermCount > 5 && demographics.relationshipHistory.longTermCount === 0) {
      historyAdjust = -10; // Pattern without learning
    }
    
    if (historyAdjust !== 0) {
      selfAwarenessSum += historyAdjust * 0.15;
      selfAwarenessWeight += 0.15;
      modifiers.selfAwareness.sources.push({
        source: 'relationship_history',
        score: historyAdjust,
        weight: 0.15
      });
    }
  }
  
  modifiers.selfAwareness.score = selfAwarenessWeight > 0 
    ? Math.round(selfAwarenessSum / selfAwarenessWeight) 
    : 50;
  modifiers.selfAwareness.confidence = selfAwarenessWeight >= 0.7 ? 'high' : selfAwarenessWeight >= 0.4 ? 'medium' : 'low';
  
  // ==========================================================================
  // SHAME RESILIENCE (How do they handle identity threats?)
  // ==========================================================================
  
  let shameSum = 0;
  let shameWeight = 0;
  
  // M2 signal: Overclaiming patterns (primary)
  if (m2Signals && m2Signals.shameResilience) {
    shameSum += m2Signals.shameResilience.score * 0.5;
    shameWeight += 0.5;
    modifiers.shameResilience.sources.push({
      source: 'M2_overclaiming',
      score: m2Signals.shameResilience.score,
      weight: 0.5
    });
  }
  
  // M1 signal: If available
  if (m1Signals && m1Signals.shameResilience) {
    shameSum += m1Signals.shameResilience.score * 0.3;
    shameWeight += 0.3;
    modifiers.shameResilience.sources.push({
      source: 'M1_patterns',
      score: m1Signals.shameResilience.score,
      weight: 0.3
    });
  }
  
  // Demographics: Type 3 mismatch as shame indicator
  if (m2Result && demographics) {
    // Check if they claim things demographics contradict
    let type3Penalty = 0;
    
    // Fitness claim with high BMI
    if (m2Result.dimensions && m2Result.dimensions.physical) {
      const physical = m2Result.dimensions.physical;
      if (physical.poleName === 'Fitness' && demographics.bmi && demographics.bmi > 30) {
        type3Penalty -= 15; // Significant gap may indicate defensive inflation
        modifiers.shameResilience.sources.push({
          source: 'fitness_bmi_gap',
          score: -15,
          weight: 0.2,
          note: 'Claims Fitness identity despite BMI indicating otherwise'
        });
      }
    }
    
    // High overclaiming across multiple dimensions
    const perceptionMismatches = Object.keys(m2Result.dimensions || {}).filter(
      dim => m2Result.dimensions[dim].selfPerceptionGap.perceptionMismatch
    ).length;
    
    if (perceptionMismatches >= 3) {
      type3Penalty -= 10;
      modifiers.shameResilience.sources.push({
        source: 'multi_dimension_mismatch',
        score: -10,
        weight: 0.15,
        note: 'Self-perception mismatches in 3+ dimensions'
      });
    }
    
    if (type3Penalty !== 0) {
      shameSum += type3Penalty * 0.2;
      shameWeight += 0.2;
    }
  }
  
  modifiers.shameResilience.score = shameWeight > 0 
    ? Math.max(20, Math.min(95, Math.round(shameSum / shameWeight)))
    : 50;
  modifiers.shameResilience.confidence = shameWeight >= 0.6 ? 'high' : shameWeight >= 0.4 ? 'medium' : 'low';
  
  // ==========================================================================
  // ADAPTABILITY (How flexible are they in relationships?)
  // ==========================================================================
  
  let adaptSum = 0;
  let adaptWeight = 0;
  
  // M2 signal: Flexibility scores
  if (m2Signals && m2Signals.adaptability) {
    adaptSum += m2Signals.adaptability.score * 0.4;
    adaptWeight += 0.4;
    modifiers.adaptability.sources.push({
      source: 'M2_flexibility',
      score: m2Signals.adaptability.score,
      weight: 0.4
    });
  }
  
  // M1 signal: Flexibility
  if (m1Signals && m1Signals.flexibility) {
    adaptSum += m1Signals.flexibility.score * 0.3;
    adaptWeight += 0.3;
    modifiers.adaptability.sources.push({
      source: 'M1_flexibility',
      score: m1Signals.flexibility.score,
      weight: 0.3
    });
  }
  
  // Demographics: Age can reduce adaptability (entrenchment)
  if (demographics && demographics.age) {
    let ageAdjust = 0;
    if (demographics.age < 30) {
      ageAdjust = 10; // Younger = more adaptable typically
    } else if (demographics.age >= 50) {
      ageAdjust = -5; // Older = potentially more set in ways
    }
    
    adaptSum += ageAdjust * 0.15;
    adaptWeight += 0.15;
    modifiers.adaptability.sources.push({
      source: 'age_factor',
      score: ageAdjust,
      weight: 0.15
    });
  }
  
  // M2 Values dimension: Egalitarian = more adaptable on roles
  if (m2Result && m2Result.dimensions && m2Result.dimensions.values) {
    const values = m2Result.dimensions.values;
    if (values.assignedPole === 'B') { // Egalitarian
      adaptSum += 10 * 0.15;
      adaptWeight += 0.15;
      modifiers.adaptability.sources.push({
        source: 'egalitarian_values',
        score: 10,
        weight: 0.15
      });
    }
  }
  
  modifiers.adaptability.score = adaptWeight > 0 
    ? Math.round(adaptSum / adaptWeight) 
    : 50;
  modifiers.adaptability.confidence = adaptWeight >= 0.6 ? 'high' : adaptWeight >= 0.4 ? 'medium' : 'low';
  
  // ==========================================================================
  // GROWTH ORIENTATION (Are they building or defending?)
  // ==========================================================================
  
  let growthSum = 0;
  let growthWeight = 0;
  
  // Self-awareness feeds growth (you can't grow what you can't see)
  growthSum += modifiers.selfAwareness.score * 0.3;
  growthWeight += 0.3;
  modifiers.growthOrientation.sources.push({
    source: 'self_awareness_base',
    score: modifiers.selfAwareness.score,
    weight: 0.3
  });
  
  // Low shame resilience inhibits growth (too defensive)
  if (modifiers.shameResilience.score < 40) {
    growthSum += -15 * 0.25;
    growthWeight += 0.25;
    modifiers.growthOrientation.sources.push({
      source: 'defensive_posture',
      score: -15,
      weight: 0.25
    });
  } else if (modifiers.shameResilience.score > 70) {
    growthSum += 10 * 0.25;
    growthWeight += 0.25;
    modifiers.growthOrientation.sources.push({
      source: 'secure_foundation',
      score: 10,
      weight: 0.25
    });
  }
  
  // Adaptability feeds growth
  growthSum += modifiers.adaptability.score * 0.25;
  growthWeight += 0.25;
  modifiers.growthOrientation.sources.push({
    source: 'adaptability_base',
    score: modifiers.adaptability.score,
    weight: 0.25
  });
  
  // Lifestyle: Thrill orientation suggests growth seeking
  if (m2Result && m2Result.dimensions && m2Result.dimensions.lifestyle) {
    const lifestyle = m2Result.dimensions.lifestyle;
    if (lifestyle.assignedPole === 'A') { // Thrill
      growthSum += 8 * 0.2;
      growthWeight += 0.2;
      modifiers.growthOrientation.sources.push({
        source: 'thrill_orientation',
        score: 8,
        weight: 0.2
      });
    }
  }
  
  modifiers.growthOrientation.score = growthWeight > 0 
    ? Math.round(growthSum / growthWeight) 
    : 50;
  modifiers.growthOrientation.confidence = growthWeight >= 0.7 ? 'high' : growthWeight >= 0.4 ? 'medium' : 'low';
  
  return modifiers;
}

// =============================================================================
// COMPLETE M2 ASSESSMENT FUNCTION
// =============================================================================

/**
 * Run complete M2 assessment with all analysis
 * 
 * @param {string} gender - 'M' or 'W'
 * @param {object} responses - All M2 question responses
 * @param {string} m1Code - Optional M1 code for Type 2 analysis
 * @param {object} demographics - Optional demographics for Type 3 analysis
 * @param {object} m1Signals - Optional M1 modifier signals for unified integration
 */
function runModule2Assessment(gender, responses, m1Code, demographics, m1Signals) {
  // Step 1: Validate responses
  const validation = validateResponses(responses, gender);
  
  // Step 2: Score M2 (even if validation has concerns, we proceed with flag)
  const m2Result = scoreModule2(gender, responses);
  
  // Step 3: Run Type 2 mismatch analysis if M1 code provided
  let type2Analysis = null;
  if (m1Code) {
    type2Analysis = analyzeType2Mismatch(m1Code, m2Result.code, gender);
  }
  
  // Step 4: Run Type 3 mismatch analysis if demographics provided
  let type3Analysis = null;
  if (demographics) {
    type3Analysis = analyzeType3Mismatch(m2Result, demographics);
  }
  
  // Step 5: Extract M2-specific modifier signals
  const m2ModifierSignals = extractM2ModifierSignals(m2Result);
  
  // Step 6: Calculate UNIFIED modifiers (integrates M1 + M2 + Demographics)
  const unifiedModifiers = calculateUnifiedModifiers(
    m1Signals || null,
    m2ModifierSignals,
    demographics || null,
    m2Result
  );
  
  // Step 7: Get full persona profile
  const personaProfile = getPersonaProfile(m2Result.code, gender);
  
  // Step 8: Generate comprehensive coaching
  const coaching = generateM2Coaching(m2Result, type2Analysis, type3Analysis, unifiedModifiers);
  
  // Step 9: Compile summary
  const summary = {
    personaCode: m2Result.code,
    personaName: getPersonaName(m2Result.code, gender),
    personaSummary: personaProfile ? personaProfile.summary : null,
    keyDriver: m2Result.keyDriver,
    coherenceWithM1: type2Analysis ? type2Analysis.coherenceLevel : 'unknown',
    demographicValidity: type3Analysis ? type3Analysis.overallValidity : 'unknown',
    responseValidity: validation.overallValidity,
    overallConfidence: calculateOverallConfidence(m2Result, validation, type3Analysis)
  };
  
  return {
    validation,
    m2Result,
    personaProfile,
    type2Analysis,
    type3Analysis,
    m2ModifierSignals,
    unifiedModifiers,
    coaching,
    summary
  };
}

/**
 * Calculate overall confidence in the assessment
 */
function calculateOverallConfidence(m2Result, validation, type3Analysis) {
  let confidence = 80; // Base confidence
  
  // Validation penalties
  if (validation.overallValidity === 'unreliable') {
    confidence -= 40;
  } else if (validation.overallValidity === 'questionable') {
    confidence -= 25;
  } else if (validation.overallValidity === 'minor_concerns') {
    confidence -= 10;
  }
  
  // Self-perception gap penalties (already calculated per dimension)
  const avgConfidencePenalty = Object.keys(m2Result.dimensions).reduce((sum, dim) => {
    return sum + (m2Result.dimensions[dim].selfPerceptionGap.confidencePenalty || 0);
  }, 0) / 4;
  confidence -= avgConfidencePenalty;
  
  // Type 3 mismatch penalties
  if (type3Analysis) {
    if (type3Analysis.overallValidity === 'questioned') {
      confidence -= 15;
    } else if (type3Analysis.overallValidity === 'minor_concerns') {
      confidence -= 5;
    }
  }
  
  return Math.max(20, Math.min(95, Math.round(confidence)));
}

/**
 * Get persona name from code
 */
function getPersonaName(code, gender) {
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
  
  return gender === 'M' ? M2_PERSONA_NAMES[code] : W2_PERSONA_NAMES[code];
}

/**
 * Generate comprehensive M2 coaching
 */
function generateM2Coaching(m2Result, type2Analysis, type3Analysis, unifiedModifiers) {
  const coaching = {
    identity: [],
    alignment: [],
    growth: [],
    modifierInsights: []
  };
  
  // Identity coaching from M2 result
  const profile = getPersonaProfile(m2Result.code, m2Result.gender);
  coaching.identity.push({
    type: 'PERSONA_ASSIGNMENT',
    message: `You are ${getPersonaName(m2Result.code, m2Result.gender)} (${m2Result.code}).`,
    detail: `Your key driver is ${m2Result.keyDriver.pole} in ${m2Result.keyDriver.dimension} (${m2Result.keyDriver.strength}% strength).`,
    profile: profile ? {
      summary: profile.summary,
      howValued: profile.howValued,
      disappointments: profile.disappointments
    } : null
  });
  
  // Add flags as coaching items
  m2Result.flags.forEach(flag => {
    if (flag.type === 'SELF_PERCEPTION_GAP') {
      coaching.growth.push({
        type: 'SELF_PERCEPTION',
        priority: 'high',
        message: flag.message,
        action: 'Explore why your self-concept differs from external feedback.'
      });
    } else if (flag.type === 'BALANCED_IDENTITY') {
      coaching.identity.push({
        type: 'FLEXIBILITY',
        priority: 'info',
        message: flag.message
      });
    }
  });
  
  // Alignment coaching from Type 2 analysis
  if (type2Analysis) {
    if (type2Analysis.coherenceLevel !== 'coherent') {
      coaching.alignment.push({
        type: 'M1_M2_SUMMARY',
        priority: type2Analysis.coherenceLevel === 'incoherent' ? 'critical' : 'high',
        message: type2Analysis.coaching.summary
      });
    }
    
    type2Analysis.coaching.actions.forEach(action => {
      coaching.alignment.push({
        type: action.action,
        priority: action.priority,
        dimension: action.dimension,
        message: action.message
      });
    });
  }
  
  // Growth coaching from Type 3 analysis
  if (type3Analysis) {
    type3Analysis.coaching.actions.forEach(action => {
      coaching.growth.push({
        type: action.type,
        message: action.message,
        options: action.options
      });
    });
  }
  
  // Modifier insights (from unified modifier system)
  if (unifiedModifiers) {
    // Self-awareness insight
    if (unifiedModifiers.selfAwareness.score < 40) {
      coaching.modifierInsights.push({
        modifier: 'selfAwareness',
        score: unifiedModifiers.selfAwareness.score,
        priority: 'high',
        message: 'Your self-assessment shows significant gaps from external evidence. Consider seeking honest feedback from trusted friends or a therapist.',
        sources: unifiedModifiers.selfAwareness.sources
      });
    } else if (unifiedModifiers.selfAwareness.score > 75) {
      coaching.modifierInsights.push({
        modifier: 'selfAwareness',
        score: unifiedModifiers.selfAwareness.score,
        priority: 'positive',
        message: 'You show strong self-awareness. Your self-concept aligns well with how you show up in the world.'
      });
    }
    
    // Shame resilience insight
    if (unifiedModifiers.shameResilience.score < 40) {
      coaching.modifierInsights.push({
        modifier: 'shameResilience',
        score: unifiedModifiers.shameResilience.score,
        priority: 'high',
        message: 'Patterns suggest defensive self-presentation. This can interfere with genuine connection. Consider exploring what feels threatening about honest self-assessment.',
        sources: unifiedModifiers.shameResilience.sources
      });
    }
    
    // Adaptability insight
    if (unifiedModifiers.adaptability.score < 30) {
      coaching.modifierInsights.push({
        modifier: 'adaptability',
        score: unifiedModifiers.adaptability.score,
        priority: 'medium',
        message: 'You show strong fixed identity across dimensions. This clarity is valuable but may limit flexibility in partnership. Consider where you might have room to grow.',
        sources: unifiedModifiers.adaptability.sources
      });
    }
    
    // Growth orientation insight
    if (unifiedModifiers.growthOrientation.score > 70) {
      coaching.modifierInsights.push({
        modifier: 'growthOrientation',
        score: unifiedModifiers.growthOrientation.score,
        priority: 'positive',
        message: 'You show strong growth orientation. You are likely to improve relationship skills over time and adapt well to partnership.',
        sources: unifiedModifiers.growthOrientation.sources
      });
    } else if (unifiedModifiers.growthOrientation.score < 35) {
      coaching.modifierInsights.push({
        modifier: 'growthOrientation',
        score: unifiedModifiers.growthOrientation.score,
        priority: 'medium',
        message: 'Growth orientation is lower. This may reflect contentment or resistance to change. Consider whether current patterns serve your relationship goals.',
        sources: unifiedModifiers.growthOrientation.sources
      });
    }
  }
  
  return coaching;
}

// =============================================================================
// EXPORTS
// =============================================================================


// =============================================================================
// SECTION 3: MODULE 3 - HOW YOU CONNECT
// =============================================================================

const LIKERT_SCALE_LABELS = {
  1: 'Strongly Disagree',
  2: 'Disagree',
  3: 'Neutral',
  4: 'Agree',
  5: 'Strongly Agree'
};

// =============================================================================
// REPORT METADATA
// =============================================================================

const M3_REPORT_METADATA = {
  moduleId: 'M3',
  reportName: 'How You Connect',
  reportSubtitle: 'Your Intimacy Style',
  reportOrder: 3,
  reportSections: [
    {
      id: 'intimacy_type',
      title: 'Your Connection Type',
      description: 'How you create closeness and what you seek in a partner',
      source: 'contextSwitchingType'
    },
    {
      id: 'want_profile',
      title: 'What You Seek',
      description: 'The kind of intimacy access you want from a partner',
      source: 'wantScore'
    },
    {
      id: 'offer_profile',
      title: 'What You Offer',
      description: 'The kind of intimacy access you provide',
      source: 'offerScore'
    },
    {
      id: 'alignment',
      title: 'Want vs Offer Alignment',
      description: 'How your desires match your capacity',
      source: 'wantOfferGap'
    }
  ],
  compatibilityWeight: 0.10, // 10% of compatibility score
  coachingIntegration: true
};

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

const CONTEXT_SWITCHING_TYPES = {
  1: {
    name: 'Type 1: Duality Seeker & Provider',
    want: 'high',
    offer: 'high',
    description: 'You are drawn to partners who show you a different side than they show the world, and you can do the same. There is erotic charge in exclusivity, in being the one who sees behind the curtain. You naturally adapt your energy to context, and you want a partner who does too.',
    strengths: [
      'Creates powerful intimacy through mutual exclusivity of access',
      'Both partners feel they have something special others do not see',
      'High adaptability means you can navigate different social contexts together',
      'The relationship has built-in mystery and discovery'
    ],
    challenges: [
      'May struggle with partners who are "what you see is what you get"',
      'Risk of feeling the public persona is performance if not grounded',
      'Need to ensure private vulnerability is genuine, not just another role'
    ],
    compatibleWith: [1, 3],
    tensionWith: [4]
  },
  2: {
    name: 'Type 2: Duality Seeker, Consistency Provider',
    want: 'high',
    offer: 'low',
    description: 'You are drawn to partners who have range, who show you something special that others do not see. But you yourself are consistent across contexts. You are the same person in the boardroom and the bedroom. This creates an asymmetry worth understanding.',
    strengths: [
      'Your consistency provides stability and predictability',
      'Partners know exactly who they are getting',
      'Your attraction to range means you appreciate depth in others',
      'You offer reliability that range-seekers may crave'
    ],
    challenges: [
      'You may attract chameleons who find you "readable" or predictable',
      'The duality you seek in others you cannot reciprocate',
      'Partners with high range may eventually want someone who matches their flexibility',
      'Consider: develop more range, or recalibrate expectations'
    ],
    compatibleWith: [1, 3],
    tensionWith: [4]
  },
  3: {
    name: 'Type 3: Consistency Seeker, Duality Provider',
    want: 'low',
    offer: 'high',
    description: 'You want partners who are authentic and consistent, the same person everywhere. But you yourself have range. You can command a room and then be soft in private. This means you offer something you do not require in return.',
    strengths: [
      'You provide the exclusive access others crave',
      'Your range makes you adaptable to different partners',
      'You value authenticity and can spot performance in others',
      'You offer depth while seeking groundedness'
    ],
    challenges: [
      'You may feel your range is wasted on partners who do not value it',
      'Consistent partners may not understand why you shift',
      'Your adaptability might be misread as inauthenticity by those who value sameness',
      'Consider: find partners who appreciate your range even if they do not match it'
    ],
    compatibleWith: [1, 2, 4],
    tensionWith: []
  },
  4: {
    name: 'Type 4: Consistency Seeker & Provider',
    want: 'low',
    offer: 'low',
    description: 'You want what you see to be what you get, and you offer the same. Authenticity means being the same person everywhere. You value partners who are integrated, transparent, and predictable. Games and hidden sides feel like red flags, not intrigue.',
    strengths: [
      'Deep trust through complete transparency',
      'No guessing about who your partner really is',
      'Relationships feel stable and grounded',
      'Both partners can relax into authenticity'
    ],
    challenges: [
      'May miss partners who have healthy range (not deception)',
      'Could interpret adaptability as inauthenticity',
      'Less tolerance for the mystery that creates erotic charge for some',
      'May find "charismatic in public, different in private" types unsettling'
    ],
    compatibleWith: [3, 4],
    tensionWith: [1, 2]
  }
};

// =============================================================================
// MEN'S MODULE 3 QUESTIONS
// =============================================================================
// Men seeking women: Want questions describe what he wants in her
// Offer questions describe what he provides

const MEN_M3_QUESTIONS = {
  // -------------------------------------------------------------------------
  // SECTION A: CONTEXT-SWITCHING WANT (What he wants in her)
  // -------------------------------------------------------------------------
  want: [
    // Scenario 1: Public vs Private Presentation
    {
      id: 'M3_WANT_01',
      scenario: 'public_private',
      text: 'I am attracted to women who show me a side of themselves that others never see.',
      pole: 'high', // Agreement = high context-switching want
      reversed: false
    },
    {
      id: 'M3_WANT_02',
      scenario: 'public_private',
      text: 'I prefer partners who are exactly the same person whether we are alone or at a party.',
      pole: 'low', // Agreement = low context-switching want
      reversed: true
    },

    // Scenario 2: Professional vs Intimate Energy
    {
      id: 'M3_WANT_03',
      scenario: 'professional_intimate',
      text: 'There is something appealing about a woman who is commanding in her work but softens completely with me.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'M3_WANT_04',
      scenario: 'professional_intimate',
      text: 'I want her professional energy and her intimate energy to feel like the same person.',
      pole: 'low',
      reversed: true
    },

    // Scenario 3: Social vs One-on-One Persona
    {
      id: 'M3_WANT_05',
      scenario: 'social_intimate',
      text: 'I find it attractive when she is the life of the party but becomes quiet and present when we are alone.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'M3_WANT_06',
      scenario: 'social_intimate',
      text: 'Her energy in groups should match her energy with me. Consistency is attractive.',
      pole: 'low',
      reversed: false
    },

    // Scenario 4: Vulnerability Access
    {
      id: 'M3_WANT_07',
      scenario: 'vulnerability',
      text: 'I want to be the only one who sees her vulnerable side.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'M3_WANT_08',
      scenario: 'vulnerability',
      text: 'I prefer women who are open about their struggles with everyone, not just me.',
      pole: 'low',
      reversed: false
    },

    // Scenario 5: Adaptability vs Consistency
    {
      id: 'M3_WANT_09',
      scenario: 'adaptability',
      text: 'I am drawn to women who can become what the moment requires, shifting easily between contexts.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'M3_WANT_10',
      scenario: 'adaptability',
      text: 'I value women who are reliably themselves regardless of the situation.',
      pole: 'low',
      reversed: false
    },

    // Scenario 6: Mystery vs Transparency
    {
      id: 'M3_WANT_11',
      scenario: 'mystery',
      text: 'I like that she reveals herself to me incrementally. The mystery is part of the attraction.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'M3_WANT_12',
      scenario: 'mystery',
      text: 'I prefer women who are transparent from the start. "What you see is what you get" is appealing.',
      pole: 'low',
      reversed: false
    }
  ],

  // -------------------------------------------------------------------------
  // SECTION B: CONTEXT-SWITCHING OFFER (What he provides)
  // -------------------------------------------------------------------------
  offer: [
    // Scenario 1: Public vs Private Presentation
    {
      id: 'M3_OFFER_01',
      scenario: 'public_private',
      text: 'Partners have told me they feel like they see a side of me that no one else does.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'M3_OFFER_02',
      scenario: 'public_private',
      text: 'People who know me casually would describe me the same way my partner would.',
      pole: 'low',
      reversed: true
    },

    // Scenario 2: Professional vs Intimate Energy
    {
      id: 'M3_OFFER_03',
      scenario: 'professional_intimate',
      text: 'I am noticeably different at work than I am with a romantic partner. The contrast is real.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'M3_OFFER_04',
      scenario: 'professional_intimate',
      text: 'My professional demeanor and my romantic demeanor are essentially the same.',
      pole: 'low',
      reversed: true
    },

    // Scenario 3: Social vs One-on-One Persona
    {
      id: 'M3_OFFER_05',
      scenario: 'social_intimate',
      text: 'I can be high energy in social settings but become much calmer and more focused one-on-one.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'M3_OFFER_06',
      scenario: 'social_intimate',
      text: 'My personality is consistent whether I am with a group or alone with someone.',
      pole: 'low',
      reversed: false
    },

    // Scenario 4: Vulnerability Access
    {
      id: 'M3_OFFER_07',
      scenario: 'vulnerability',
      text: 'There are parts of myself I only show to romantic partners, never to friends or colleagues.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'M3_OFFER_08',
      scenario: 'vulnerability',
      text: 'I am equally open about my struggles with close friends as I am with romantic partners.',
      pole: 'low',
      reversed: false
    },

    // Scenario 5: Adaptability vs Consistency
    {
      id: 'M3_OFFER_09',
      scenario: 'adaptability',
      text: 'I naturally adjust my energy and approach based on who I am with and what the situation requires.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'M3_OFFER_10',
      scenario: 'adaptability',
      text: 'I am the same person in every room. Adapting to contexts feels inauthentic to me.',
      pole: 'low',
      reversed: false
    },

    // Scenario 6: Mystery vs Transparency
    {
      id: 'M3_OFFER_11',
      scenario: 'mystery',
      text: 'I reveal myself gradually in relationships. Partners have said I have layers they discovered over time.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'M3_OFFER_12',
      scenario: 'mystery',
      text: 'I am an open book. Partners know who I am from early on because I do not hold back.',
      pole: 'low',
      reversed: false
    }
  ],

  // -------------------------------------------------------------------------
  // SECTION C: ATTENTIVENESS (Self-Absorbed ↔ Other-Focused)
  // -------------------------------------------------------------------------
  attentiveness: [
    {
      id: 'M3_ATT_01',
      scenario: 'perspective_taking',
      text: 'When she is upset about something unrelated to me, my first instinct is to try to understand what she is feeling.',
      pole: 'other_focused',
      reversed: false
    },
    {
      id: 'M3_ATT_02',
      scenario: 'emotional_attunement',
      text: 'When she shares good news, I feel genuinely excited with her.',
      pole: 'other_focused',
      reversed: false
    },
    {
      id: 'M3_ATT_03',
      scenario: 'conversational_balance',
      text: 'In conversations with a romantic partner, I tend to talk more than I listen.',
      pole: 'self_focused',
      reversed: false
    },
    {
      id: 'M3_ATT_04',
      scenario: 'partner_memory',
      text: 'I remember the emotional details of what my partner tells me, not just the facts.',
      pole: 'other_focused',
      reversed: false
    }
  ]
};

// =============================================================================
// WOMEN'S MODULE 3 QUESTIONS
// =============================================================================
// Women seeking men: Want questions describe what she wants in him
// Offer questions describe what she provides

const WOMEN_M3_QUESTIONS = {
  // -------------------------------------------------------------------------
  // SECTION A: CONTEXT-SWITCHING WANT (What she wants in him)
  // -------------------------------------------------------------------------
  want: [
    // Scenario 1: Public vs Private Presentation
    {
      id: 'W3_WANT_01',
      scenario: 'public_private',
      text: 'I am attracted to men who show me a side of themselves that others never see.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'W3_WANT_02',
      scenario: 'public_private',
      text: 'I prefer partners who are exactly the same person whether we are alone or in public.',
      pole: 'low',
      reversed: true
    },

    // Scenario 2: Professional vs Intimate Energy
    {
      id: 'W3_WANT_03',
      scenario: 'professional_intimate',
      text: 'There is something appealing about a man who commands authority at work but is tender and soft with me.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'W3_WANT_04',
      scenario: 'professional_intimate',
      text: 'I want his professional energy and his intimate energy to feel like the same person.',
      pole: 'low',
      reversed: true
    },

    // Scenario 3: Social vs One-on-One Persona
    {
      id: 'W3_WANT_05',
      scenario: 'social_intimate',
      text: 'I find it attractive when he is charismatic in groups but becomes quiet and focused when we are alone.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'W3_WANT_06',
      scenario: 'social_intimate',
      text: 'His energy in social settings should match his energy with me. Consistency is attractive.',
      pole: 'low',
      reversed: false
    },

    // Scenario 4: Vulnerability Access
    {
      id: 'W3_WANT_07',
      scenario: 'vulnerability',
      text: 'I want to be the only one who sees his vulnerable side.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'W3_WANT_08',
      scenario: 'vulnerability',
      text: 'I prefer men who are open about their struggles with everyone, not just me.',
      pole: 'low',
      reversed: false
    },

    // Scenario 5: Adaptability vs Consistency
    {
      id: 'W3_WANT_09',
      scenario: 'adaptability',
      text: 'I am drawn to men who can shift their energy to match different situations and people.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'W3_WANT_10',
      scenario: 'adaptability',
      text: 'I value men who are reliably themselves regardless of the context.',
      pole: 'low',
      reversed: false
    },

    // Scenario 6: Mystery vs Transparency
    {
      id: 'W3_WANT_11',
      scenario: 'mystery',
      text: 'I like that he reveals himself to me over time. The mystery draws me in.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'W3_WANT_12',
      scenario: 'mystery',
      text: 'I prefer men who are transparent from the start. "What you see is what you get" is what I want.',
      pole: 'low',
      reversed: false
    }
  ],

  // -------------------------------------------------------------------------
  // SECTION B: CONTEXT-SWITCHING OFFER (What she provides)
  // -------------------------------------------------------------------------
  offer: [
    // Scenario 1: Public vs Private Presentation
    {
      id: 'W3_OFFER_01',
      scenario: 'public_private',
      text: 'Partners have told me they feel like they see a side of me that no one else does.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'W3_OFFER_02',
      scenario: 'public_private',
      text: 'People who know me casually would describe me the same way my partner would.',
      pole: 'low',
      reversed: true
    },

    // Scenario 2: Professional vs Intimate Energy
    {
      id: 'W3_OFFER_03',
      scenario: 'professional_intimate',
      text: 'I am noticeably different at work than I am with a romantic partner. The contrast is real.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'W3_OFFER_04',
      scenario: 'professional_intimate',
      text: 'My professional demeanor and my romantic demeanor are essentially the same.',
      pole: 'low',
      reversed: true
    },

    // Scenario 3: Social vs One-on-One Persona
    {
      id: 'W3_OFFER_05',
      scenario: 'social_intimate',
      text: 'I can be vibrant and outgoing in social settings but become much softer one-on-one.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'W3_OFFER_06',
      scenario: 'social_intimate',
      text: 'My personality is consistent whether I am with a group or alone with someone.',
      pole: 'low',
      reversed: false
    },

    // Scenario 4: Vulnerability Access
    {
      id: 'W3_OFFER_07',
      scenario: 'vulnerability',
      text: 'There are parts of myself I only show to romantic partners, never to friends or family.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'W3_OFFER_08',
      scenario: 'vulnerability',
      text: 'I am equally open about my struggles with close friends as I am with romantic partners.',
      pole: 'low',
      reversed: false
    },

    // Scenario 5: Adaptability vs Consistency
    {
      id: 'W3_OFFER_09',
      scenario: 'adaptability',
      text: 'I naturally adjust my energy and presentation based on who I am with and what the context requires.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'W3_OFFER_10',
      scenario: 'adaptability',
      text: 'I am the same person in every room. Changing how I present feels inauthentic to me.',
      pole: 'low',
      reversed: false
    },

    // Scenario 6: Mystery vs Transparency
    {
      id: 'W3_OFFER_11',
      scenario: 'mystery',
      text: 'I reveal myself gradually in relationships. Partners have said I have depth they discovered over time.',
      pole: 'high',
      reversed: false
    },
    {
      id: 'W3_OFFER_12',
      scenario: 'mystery',
      text: 'I am an open book. Partners know who I am from early on because I hold nothing back.',
      pole: 'low',
      reversed: false
    }
  ],

  // -------------------------------------------------------------------------
  // SECTION C: ATTENTIVENESS (Self-Absorbed ↔ Other-Focused)
  // -------------------------------------------------------------------------
  attentiveness: [
    {
      id: 'W3_ATT_01',
      scenario: 'perspective_taking',
      text: 'When he is upset about something unrelated to me, my first instinct is to try to understand what he is feeling.',
      pole: 'other_focused',
      reversed: false
    },
    {
      id: 'W3_ATT_02',
      scenario: 'emotional_attunement',
      text: 'When he shares good news, I feel genuinely excited with him.',
      pole: 'other_focused',
      reversed: false
    },
    {
      id: 'W3_ATT_03',
      scenario: 'conversational_balance',
      text: 'In conversations with a romantic partner, I tend to talk more than I listen.',
      pole: 'self_focused',
      reversed: false
    },
    {
      id: 'W3_ATT_04',
      scenario: 'partner_memory',
      text: 'I remember the emotional details of what my partner tells me, not just the facts.',
      pole: 'other_focused',
      reversed: false
    }
  ]
};

// =============================================================================
// SCORING CONFIGURATION
// =============================================================================

const M3_SCORING_CONFIG = {
  // Likert scale range
  minResponse: 1,
  maxResponse: 5,
  
  // Threshold for high vs low classification (on 0-100 scale)
  typeThreshold: 50,
  
  // Questions per section
  questionsPerSection: 12,
  
  // Maximum raw score per section (12 questions * 5 points)
  maxRawScore: 60,
  
  // Minimum raw score per section (12 questions * 1 point)
  minRawScore: 12
};

// =============================================================================
// SCORING FUNCTIONS
// =============================================================================

/**
 * Calculates the raw score for a section (want or offer)
 * Higher scores = higher context-switching preference/ability
 * 
 * @param {Object} responses - Object mapping question IDs to response values (1-5)
 * @param {Array} questions - Array of question objects for the section
 * @returns {number} Raw score (12-60 range)
 */
function calculateRawScore(responses, questions) {
  let totalScore = 0;
  
  for (const question of questions) {
    const response = responses[question.id];
    
    if (response === undefined || response === null) {
      console.warn(`Missing response for question ${question.id}`);
      continue;
    }
    
    let adjustedResponse = response;
    
    // Handle reverse-coded items
    if (question.reversed) {
      // For reversed items, flip the scale: 1->5, 2->4, 3->3, 4->2, 5->1
      adjustedResponse = 6 - response;
    }
    
    // For "low" pole questions (non-reversed), agreement means LOW context-switching
    // So we need to invert: high agreement with "low" pole = low score
    if (question.pole === 'low' && !question.reversed) {
      adjustedResponse = 6 - adjustedResponse;
    }
    
    totalScore += adjustedResponse;
  }
  
  return totalScore;
}

/**
 * Converts raw score to 0-100 scale
 * 
 * @param {number} rawScore - Raw score from calculateRawScore
 * @returns {number} Normalized score (0-100)
 */
function normalizeScore(rawScore) {
  const { minRawScore, maxRawScore } = M3_SCORING_CONFIG;
  const range = maxRawScore - minRawScore;
  const normalized = ((rawScore - minRawScore) / range) * 100;
  return Math.round(Math.max(0, Math.min(100, normalized)));
}

/**
 * Determines context-switching type based on want and offer scores
 * 
 * @param {number} wantScore - Normalized want score (0-100)
 * @param {number} offerScore - Normalized offer score (0-100)
 * @returns {number} Type (1, 2, 3, or 4)
 */
function determineType(wantScore, offerScore) {
  const threshold = M3_SCORING_CONFIG.typeThreshold;
  const highWant = wantScore >= threshold;
  const highOffer = offerScore >= threshold;
  
  if (highWant && highOffer) return 1;
  if (highWant && !highOffer) return 2;
  if (!highWant && highOffer) return 3;
  return 4;
}

/**
 * Calculates the want-offer gap (mismatch indicator)
 * Positive = wants more than offers
 * Negative = offers more than wants
 * 
 * @param {number} wantScore - Normalized want score (0-100)
 * @param {number} offerScore - Normalized offer score (0-100)
 * @returns {number} Gap (-100 to +100)
 */
function calculateWantOfferGap(wantScore, offerScore) {
  return wantScore - offerScore;
}

/**
 * Main scoring function for Module 3
 * 
 * @param {string} gender - 'M' or 'W'
 * @param {Object} responses - Object mapping question IDs to response values
 * @returns {Object} Complete M3 scoring results
 */
function scoreModule3(gender, responses) {
  const questions = gender === 'M' ? MEN_M3_QUESTIONS : WOMEN_M3_QUESTIONS;
  
  // Calculate raw scores
  const wantRaw = calculateRawScore(responses, questions.want);
  const offerRaw = calculateRawScore(responses, questions.offer);
  
  // Normalize to 0-100
  const wantScore = normalizeScore(wantRaw);
  const offerScore = normalizeScore(offerRaw);
  
  // Determine type
  const contextSwitchingType = determineType(wantScore, offerScore);
  
  // Calculate gap
  const wantOfferGap = calculateWantOfferGap(wantScore, offerScore);
  
  // Get type details
  const typeDetails = CONTEXT_SWITCHING_TYPES[contextSwitchingType];
  
  return {
    // Raw data
    rawScores: {
      want: wantRaw,
      offer: offerRaw
    },
    
    // Normalized scores
    wantScore,
    offerScore,
    
    // Classification
    contextSwitchingType,
    typeName: typeDetails.name,
    typeDescription: typeDetails.description,
    
    // Mismatch indicator
    wantOfferGap,
    
    // Strength indicators (how far from threshold)
    wantStrength: Math.abs(wantScore - M3_SCORING_CONFIG.typeThreshold),
    offerStrength: Math.abs(offerScore - M3_SCORING_CONFIG.typeThreshold),
    
    // Detailed type info for coaching
    typeDetails: {
      strengths: typeDetails.strengths,
      challenges: typeDetails.challenges,
      compatibleWith: typeDetails.compatibleWith,
      tensionWith: typeDetails.tensionWith
    }
  };
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Checks for response validity patterns
 * 
 * @param {Object} responses - All M3 responses
 * @param {string} gender - 'M' or 'W'
 * @returns {Object} Validation results
 */
function validateM3Responses(responses, gender) {
  const questions = gender === 'M' ? MEN_M3_QUESTIONS : WOMEN_M3_QUESTIONS;
  const allQuestions = [...questions.want, ...questions.offer];
  
  const responseValues = allQuestions.map(q => responses[q.id]).filter(v => v !== undefined);
  
  // Check for straight-lining (all same response)
  const uniqueResponses = new Set(responseValues);
  const straightLining = uniqueResponses.size === 1;
  
  // Check for pattern responding (alternating)
  let alternatingCount = 0;
  for (let i = 1; i < responseValues.length; i++) {
    if (responseValues[i] !== responseValues[i-1]) {
      alternatingCount++;
    }
  }
  const highAlternation = alternatingCount > responseValues.length * 0.9;
  
  // Check for extreme responding (all 1s or 5s)
  const extremeCount = responseValues.filter(v => v === 1 || v === 5).length;
  const extremeResponding = extremeCount > responseValues.length * 0.8;
  
  // Check for acquiescence (all agrees)
  const agreeCount = responseValues.filter(v => v >= 4).length;
  const acquiescence = agreeCount > responseValues.length * 0.85;
  
  // Calculate internal consistency (correlation between similar scenarios)
  // For simplicity, check if reversed items diverge appropriately from non-reversed
  const reversedQuestions = allQuestions.filter(q => q.reversed);
  const nonReversedHighPole = allQuestions.filter(q => !q.reversed && q.pole === 'high');
  
  const reversedAvg = reversedQuestions.reduce((sum, q) => sum + (responses[q.id] || 3), 0) / reversedQuestions.length;
  const nonReversedAvg = nonReversedHighPole.reduce((sum, q) => sum + (responses[q.id] || 3), 0) / nonReversedHighPole.length;
  
  // If someone is consistent, reversed and non-reversed should diverge
  // If they are close, it suggests random responding
  const consistencyCheck = Math.abs(reversedAvg - nonReversedAvg) > 0.5;
  
  return {
    isValid: !straightLining && !highAlternation && consistencyCheck,
    flags: {
      straightLining,
      highAlternation,
      extremeResponding,
      acquiescence,
      failedConsistencyCheck: !consistencyCheck
    },
    confidence: straightLining || !consistencyCheck ? 'low' : 
                (extremeResponding || acquiescence) ? 'medium' : 'high'
  };
}

// =============================================================================
// COACHING CONTENT
// =============================================================================

/**
 * Generates coaching content based on M3 results
 * 
 * @param {Object} m3Results - Results from scoreModule3
 * @returns {Object} Coaching content
 */
function generateM3Coaching(m3Results) {
  const { contextSwitchingType, wantScore, offerScore, wantOfferGap } = m3Results;
  const typeInfo = CONTEXT_SWITCHING_TYPES[contextSwitchingType];
  
  const coaching = {
    summary: typeInfo.description,
    strengths: typeInfo.strengths,
    growthEdges: typeInfo.challenges,
    
    // Specific coaching based on gap
    gapCoaching: null,
    
    // Compatibility guidance
    compatibilityGuidance: {
      seekTypes: typeInfo.compatibleWith.map(t => CONTEXT_SWITCHING_TYPES[t].name),
      cautionTypes: typeInfo.tensionWith.map(t => CONTEXT_SWITCHING_TYPES[t].name)
    }
  };
  
  // Add gap-specific coaching
  if (Math.abs(wantOfferGap) > 25) {
    if (wantOfferGap > 0) {
      coaching.gapCoaching = {
        observation: 'You want more context-switching in a partner than you currently offer yourself.',
        reflection: 'This asymmetry is worth examining. You are drawn to partners with range, but you present consistently. Some options to consider:',
        options: [
          'Develop your own range. Practice showing different sides in different contexts. This is not inauthenticity; it is flexibility.',
          'Recalibrate your attraction. Recognize that high-range partners may eventually seek someone who matches their flexibility.',
          'Find partners who value your consistency. Some high-range people specifically want a grounded, predictable partner.'
        ]
      };
    } else {
      coaching.gapCoaching = {
        observation: 'You offer more context-switching than you want in a partner.',
        reflection: 'You have range but seek consistency in others. This is a coherent position, but worth understanding:',
        options: [
          'Your adaptability may be wasted on partners who do not recognize or value it.',
          'Consider that your range makes you attractive to those who want exclusive access to your private side.',
          'Ensure your desire for consistency is about genuine preference, not about wanting to be the only complex one.'
        ]
      };
    }
  }
  
  return coaching;
}

// =============================================================================
// M3 COMPATIBILITY FUNCTIONS
// =============================================================================

/**
 * Calculates context-switching compatibility between two users
 * 
 * @param {Object} user1M3 - M3 results for user 1
 * @param {Object} user2M3 - M3 results for user 2
 * @returns {Object} Compatibility assessment
 */
function calculateM3Compatibility(user1M3, user2M3) {
  const type1 = user1M3.contextSwitchingType;
  const type2 = user2M3.contextSwitchingType;
  
  const type1Info = CONTEXT_SWITCHING_TYPES[type1];
  
  // Check if types are compatible
  const isCompatible = type1Info.compatibleWith.includes(type2);
  const hasTension = type1Info.tensionWith.includes(type2);
  
  // Calculate score based on type matching
  let compatibilityScore;
  if (type1 === type2) {
    compatibilityScore = 90; // Same type = high compatibility
  } else if (isCompatible) {
    compatibilityScore = 75; // Compatible types
  } else if (hasTension) {
    compatibilityScore = 40; // Tension types
  } else {
    compatibilityScore = 60; // Neutral
  }
  
  // Adjust based on want/offer alignment
  // User1's want should align with User2's offer and vice versa
  const wantOfferMatch1 = 100 - Math.abs(user1M3.wantScore - user2M3.offerScore);
  const wantOfferMatch2 = 100 - Math.abs(user2M3.wantScore - user1M3.offerScore);
  const wantOfferFit = (wantOfferMatch1 + wantOfferMatch2) / 2;
  
  // Blend type compatibility with want/offer fit
  const finalScore = Math.round(compatibilityScore * 0.6 + wantOfferFit * 0.4);
  
  return {
    score: finalScore,
    typeCompatibility: {
      isCompatible,
      hasTension,
      type1,
      type2
    },
    wantOfferFit: {
      user1WantToUser2Offer: wantOfferMatch1,
      user2WantToUser1Offer: wantOfferMatch2,
      average: wantOfferFit
    },
    narrative: generateCompatibilityNarrative(user1M3, user2M3, finalScore)
  };
}

/**
 * Generates narrative explanation of M3 compatibility
 */
function generateCompatibilityNarrative(user1M3, user2M3, score) {
  const type1 = user1M3.contextSwitchingType;
  const type2 = user2M3.contextSwitchingType;
  
  const narratives = {
    '1-1': 'You both seek and provide duality. You understand the erotic charge of exclusive access, and you can give each other what you crave. The risk is that with two chameleons, you may need to work harder to know who you each really are.',
    '1-2': 'You seek duality, and they offer it. They want duality but provide consistency. This can work: they get the range they seek from you, and you get the exclusive access you desire. The question is whether their consistency satisfies your need to see their hidden sides.',
    '1-3': 'You seek duality, and they offer it even though they do not require it. This is a good fit for you. They may need reassurance that their range is appreciated.',
    '1-4': 'You seek duality, but they offer and want consistency. This is the core tension. You may find them flat; they may find you unsettling. Proceed with awareness.',
    '2-2': 'You both want duality but offer consistency. Neither of you gets what you seek from the other. This pairing may leave both partners wanting.',
    '2-3': 'You want duality and they offer it. They want consistency and you provide it. This is a natural fit where each provides what the other seeks.',
    '2-4': 'You want duality but they offer consistency. They want consistency and you offer it. Half the equation works. The question is whether you can release your desire for their hidden sides.',
    '3-3': 'You both have range but neither requires it. You may appreciate each other\'s depth without needing exclusive access to it. A grounded pairing.',
    '3-4': 'You offer duality to someone who values consistency. Your range may be wasted on them, or they may find it unsettling. Calibrate expectations.',
    '4-4': 'You both offer and want consistency. What you see is what you get, on both sides. If authenticity and transparency are your values, this is ideal. Just know that some mystery and discovery may be sacrificed.'
  };
  
  const key = type1 <= type2 ? `${type1}-${type2}` : `${type2}-${type1}`;
  return narratives[key] || 'Context-switching compatibility varies. Discuss your preferences openly.';
}

// =============================================================================
// EXPORTS
// =============================================================================


// =============================================================================
// SECTION 4: MODULE 4 - WHEN THINGS GET HARD
// =============================================================================

const M4_REPORT_METADATA = {
  moduleId: 'M4',
  reportName: 'When Things Get Hard',
  reportSubtitle: 'Your Conflict & Repair Style',
  reportOrder: 4,
  reportSections: [
    {
      id: 'conflict_approach',
      title: 'Your Conflict Approach',
      description: 'How you move when tension arises',
      source: 'conflictApproach'
    },
    {
      id: 'emotional_driver',
      title: 'Your Emotional Driver',
      description: 'The fear that activates first when things get hard',
      source: 'emotionalDrivers'
    },
    {
      id: 'repair_style',
      title: 'How You Repair',
      description: 'What you need to reconnect after conflict',
      source: 'repairRecovery'
    },
    {
      id: 'emotional_capacity',
      title: 'Your Emotional Capacity',
      description: 'How much intensity you can hold before needing a break',
      source: 'emotionalCapacity'
    },
    {
      id: 'growth_edges',
      title: 'Growth Edges',
      description: 'Patterns to watch and skills to develop',
      source: 'gottmanScreener',
      note: 'Coaching guidance, not compatibility criteria'
    }
  ],
  compatibilityWeight: 0.05, // 5% of compatibility score
  coachingIntegration: true,
  gottmanIsCoachingOnly: true // Explicit flag per handoff requirements
};

// =============================================================================
// SECTION 1: CONFLICT APPROACH DEFINITIONS
// =============================================================================

const CONFLICT_APPROACH = {
  pursue: {
    name: 'Pursue',
    description: 'Moves toward conflict. Needs resolution, engagement, and connection. Cannot rest until things are addressed.',
    behaviors: [
      'Initiates difficult conversations',
      'Follows partner who tries to leave',
      'Cannot sleep on unresolved conflict',
      'Needs verbal confirmation that things are okay',
      'Experiences partner withdrawal as abandonment'
    ],
    strengths: [
      'Issues get addressed rather than buried',
      'Partners know where they stand',
      'Commitment to resolution is genuine',
      'Willing to do the hard work of conflict'
    ],
    challenges: [
      'Can overwhelm withdrawing partners',
      'May escalate when de-escalation is needed',
      'Difficulty giving partner space',
      'Can mistake partner silence for rejection'
    ]
  },
  withdraw: {
    name: 'Withdraw',
    description: 'Moves away from conflict. Needs space, calm, and time to process. Cannot engage productively when flooded.',
    behaviors: [
      'Needs time before discussing issues',
      'May leave the room during heated moments',
      'Processes internally before speaking',
      'Shuts down when overwhelmed',
      'Experiences partner pursuit as invasion'
    ],
    strengths: [
      'Prevents escalation through disengagement',
      'Allows emotions to settle before responding',
      'Thoughtful rather than reactive',
      'Protects relationship from words said in anger'
    ],
    challenges: [
      'Partners may feel abandoned or dismissed',
      'Issues can remain unresolved indefinitely',
      'Withdrawal can become stonewalling',
      'May miss bids for repair'
    ]
  }
};

// =============================================================================
// SECTION 2: EMOTIONAL DRIVER DEFINITIONS
// =============================================================================

const EMOTIONAL_DRIVERS = {
  abandonment: {
    name: 'Abandonment',
    coreFear: 'You are leaving me',
    internalExperience: 'Panic, desperation, emptiness, terror of being alone',
    externalBehavior: [
      'Pursues and clings during conflict',
      'Demands reassurance repeatedly',
      'Checks phone, monitors partner location',
      'Catastrophizes partner distance as permanent'
    ],
    partnerExperience: 'Feels suffocated, pulled at, responsible for constant reassurance',
    triggers: [
      'Partner withdrawal or silence',
      'Partner spending time with others',
      'Any sign of decreased interest',
      'Physical or emotional distance'
    ],
    healthyExpression: 'I need reassurance that we are okay. Can you help me feel secure?',
    unhealthyExpression: 'If you loved me, you would not need space from me.'
  },
  engulfment: {
    name: 'Engulfment',
    coreFear: 'You are controlling me / I am losing myself',
    internalExperience: 'Trapped, invaded, loss of self, suffocation',
    externalBehavior: [
      'Withdraws to protect autonomy',
      'Creates distance when partner pursues',
      'Needs alone time to feel like self',
      'Resists being told what to feel or do'
    ],
    partnerExperience: 'Feels shut out, rejected, like they are too much',
    triggers: [
      'Partner demands for closeness',
      'Expectations of constant togetherness',
      'Being told how to feel',
      'Loss of independent identity'
    ],
    healthyExpression: 'I need some space to process. I will come back to this.',
    unhealthyExpression: 'You are too needy. I cannot breathe around you.'
  },
  inadequacy: {
    name: 'Inadequacy',
    coreFear: 'I am failing you / I am not enough',
    internalExperience: 'Shame, worthlessness, paralysis, wanting to disappear',
    externalBehavior: [
      'Over-apologizes even when not at fault',
      'Freezes rather than engaging',
      'Self-deprecates to preempt criticism',
      'Assumes they are the problem'
    ],
    partnerExperience: 'Feels responsible for their pain, frustrated they cannot reassure enough',
    triggers: [
      'Any criticism or disappointment',
      'Partner expressing needs',
      'Comparison to others',
      'Failure to meet expectations'
    ],
    healthyExpression: 'I am feeling like I have let you down. Can we talk about what happened?',
    unhealthyExpression: 'I know, I am terrible. You deserve better than me.'
  },
  injustice: {
    name: 'Injustice',
    coreFear: 'You are being unfair / I am not being heard',
    internalExperience: 'Righteous anger, invalidation, need to be understood',
    externalBehavior: [
      'Digs in and argues the point',
      'Builds case with evidence',
      'Cannot let go until acknowledged',
      'Experiences disagreement as disrespect'
    ],
    partnerExperience: 'Feels attacked, defensive, like they cannot win',
    triggers: [
      'Being misunderstood or misrepresented',
      'Double standards',
      'Dismissal of valid points',
      'Partner not acknowledging their role'
    ],
    healthyExpression: 'I need you to understand my perspective before we move on.',
    unhealthyExpression: 'You always do this. You never listen. Here is why you are wrong.'
  }
};

// =============================================================================
// SECTION 3: REPAIR STYLE DEFINITIONS
// =============================================================================

const REPAIR_STYLES = {
  speed: {
    quick: {
      name: 'Quick Repair',
      description: 'Needs to resolve immediately. Cannot sleep on conflict. Reconciliation is urgent.',
      behaviors: [
        'Initiates repair within hours',
        'Cannot rest until things are okay',
        'Prefers immediate conversation over space',
        'Feels physical discomfort from unresolved tension'
      ]
    },
    slow: {
      name: 'Slow Repair',
      description: 'Needs time to process before reconnecting. Space is part of the repair process.',
      behaviors: [
        'Needs hours or days before ready to repair',
        'Processing happens internally first',
        'Premature repair attempts feel forced',
        'Returns when genuinely ready, not before'
      ]
    }
  },
  mode: {
    verbal: {
      name: 'Verbal Repair',
      description: 'Repairs through talking, explaining, understanding. Words are the bridge back.',
      behaviors: [
        'Needs to talk through what happened',
        'Wants to understand and be understood',
        'Apologies and acknowledgments are verbal',
        'Feels repair is incomplete without conversation'
      ]
    },
    physical: {
      name: 'Physical Repair',
      description: 'Repairs through touch, presence, acts of service. Actions speak louder than words.',
      behaviors: [
        'Reaches for physical connection after conflict',
        'Makes coffee, does a chore, offers touch',
        'Presence and proximity signal repair',
        'May struggle to articulate but shows care through action'
      ]
    }
  }
};

// =============================================================================
// SECTION 4: EMOTIONAL CAPACITY DEFINITIONS
// =============================================================================

const EMOTIONAL_CAPACITY = {
  high: {
    name: 'High Capacity',
    description: 'Can hold significant emotional intensity before flooding. Stays regulated longer under stress.',
    threshold: 'Extended conflict tolerance; can engage repeatedly without shutdown',
    risk: 'May push partners past their capacity without realizing'
  },
  medium: {
    name: 'Medium Capacity',
    description: 'Average tolerance for emotional intensity. Needs breaks but recovers and re-engages.',
    threshold: 'Moderate conflict tolerance; benefits from breaks but returns',
    risk: 'May underestimate own flooding; benefits from check-ins'
  },
  low: {
    name: 'Low Capacity',
    description: 'Floods quickly under emotional intensity. Needs careful pacing and frequent breaks.',
    threshold: 'Limited conflict tolerance; requires structured breaks to prevent shutdown',
    risk: 'Partners may feel abandoned; stonewalling risk without proper self-care'
  }
};

// =============================================================================
// SECTION 5: GOTTMAN FOUR HORSEMEN DEFINITIONS
// =============================================================================

const GOTTMAN_HORSEMEN = {
  criticism: {
    name: 'Criticism',
    description: 'Attacking partner character rather than addressing specific behavior',
    indicators: [
      'You always... / You never...',
      'What is wrong with you?',
      'Focuses on who they ARE rather than what they DID',
      'Global character attacks during conflict'
    ],
    antidote: 'Gentle startup. Focus on specific behavior and your feelings. Use "I" statements.',
    riskLevels: {
      low: { min: 4, max: 8, label: 'Low Risk' },
      medium: { min: 9, max: 13, label: 'Elevated Risk' },
      high: { min: 14, max: 20, label: 'High Risk' }
    }
  },
  contempt: {
    name: 'Contempt',
    description: 'Disgust, superiority, mockery. The most destructive horseman.',
    indicators: [
      'Eye-rolling, sneering, hostile humor',
      'Sarcasm meant to wound',
      'Name-calling and belittling',
      'Treating partner as beneath you'
    ],
    antidote: 'Build culture of appreciation. Express fondness and admiration regularly.',
    riskLevels: {
      low: { min: 4, max: 7, label: 'Low Risk' },
      medium: { min: 8, max: 12, label: 'Elevated Risk' },
      high: { min: 13, max: 20, label: 'High Risk - Immediate Intervention' }
    }
  },
  defensiveness: {
    name: 'Defensiveness',
    description: 'Refusing responsibility. Counter-attacking. Playing victim.',
    indicators: [
      'It is not my fault',
      'Yes, but you...',
      'Excuses and justifications',
      'Counter-complaints in response to complaints'
    ],
    antidote: 'Take responsibility for even a small part. Validate partner perspective first.',
    riskLevels: {
      low: { min: 4, max: 9, label: 'Low Risk' },
      medium: { min: 10, max: 14, label: 'Elevated Risk' },
      high: { min: 15, max: 20, label: 'High Risk' }
    }
  },
  stonewalling: {
    name: 'Stonewalling',
    description: 'Complete emotional shutdown. Withdrawal from interaction entirely.',
    indicators: [
      'Leaving the room without explanation',
      'Silent treatment lasting hours or days',
      'Emotional unavailability during conflict',
      'Refusing to engage at all'
    ],
    antidote: 'Self-soothe physiologically. Take breaks with commitment to return. Communicate need for space.',
    riskLevels: {
      low: { min: 4, max: 8, label: 'Low Risk' },
      medium: { min: 9, max: 13, label: 'Elevated Risk' },
      high: { min: 14, max: 20, label: 'High Risk' }
    }
  }
};

// =============================================================================
// DRIVER COMPATIBILITY MATRIX
// =============================================================================
// From handoff document lines 611-618

const DRIVER_COMPATIBILITY = {
  'abandonment-engulfment': {
    dynamic: 'Classic pursue-withdraw spiral',
    prognosis: 'Challenging without intervention',
    pattern: 'One pursues, other withdraws, pursuit intensifies, withdrawal deepens',
    coaching: 'Requires explicit negotiation of space and reassurance. Both must learn partner language.'
  },
  'abandonment-abandonment': {
    dynamic: 'Both pursue, may escalate together',
    prognosis: 'Can work with boundaries',
    pattern: 'Intensity matches but can spiral into mutual panic',
    coaching: 'Neither will abandon the other, which provides security. Need external grounding.'
  },
  'engulfment-engulfment': {
    dynamic: 'Both withdraw, may drift apart',
    prognosis: 'Needs intentional connection',
    pattern: 'Comfortable distance can become disconnection',
    coaching: 'Must schedule intentional connection. Parallel play is fine but intimacy needs effort.'
  },
  'inadequacy-injustice': {
    dynamic: 'One collapses, one fights',
    prognosis: 'Power imbalance risk',
    pattern: 'Injustice pushes, inadequacy crumbles, injustice feels unheard, inadequacy feels attacked',
    coaching: 'Injustice must soften approach. Inadequacy must hold ground. Rebalance power.'
  },
  'same-driver': {
    dynamic: 'Understand each other\'s fear',
    prognosis: 'Generally easier',
    pattern: 'Shared vulnerability creates empathy',
    coaching: 'Can also trigger each other. Need awareness of shared blindspots.'
  }
};

// =============================================================================
// MEN'S MODULE 4 QUESTIONS
// =============================================================================

const MEN_M4_QUESTIONS = {
  // -------------------------------------------------------------------------
  // SECTION 1: CONFLICT APPROACH (12 questions)
  // -------------------------------------------------------------------------
  conflictApproach: [
    {
      id: 'M4_CA_01',
      text: 'When my partner and I have a disagreement, I need to talk about it right away.',
      pole: 'pursue',
      reversed: false
    },
    {
      id: 'M4_CA_02',
      text: 'During heated moments, I find myself needing to step away and collect my thoughts.',
      pole: 'withdraw',
      reversed: false
    },
    {
      id: 'M4_CA_03',
      text: 'I have followed a partner into another room to continue a conversation they were trying to end.',
      pole: 'pursue',
      reversed: false
    },
    {
      id: 'M4_CA_04',
      text: 'I process conflict better when I have time alone first.',
      pole: 'withdraw',
      reversed: false
    },
    {
      id: 'M4_CA_05',
      text: 'I cannot sleep if there is unresolved tension between us.',
      pole: 'pursue',
      reversed: false
    },
    {
      id: 'M4_CA_06',
      text: 'When overwhelmed in an argument, I shut down and cannot find words.',
      pole: 'withdraw',
      reversed: false
    },
    {
      id: 'M4_CA_07',
      text: 'Partners have told me I push too hard to resolve things immediately.',
      pole: 'pursue',
      reversed: false
    },
    {
      id: 'M4_CA_08',
      text: 'Partners have complained that I go quiet when things get intense.',
      pole: 'withdraw',
      reversed: false
    },
    {
      id: 'M4_CA_09',
      text: 'I would rather have an uncomfortable conversation now than let something fester.',
      pole: 'pursue',
      reversed: false
    },
    {
      id: 'M4_CA_10',
      text: 'I need space after conflict before I can reconnect.',
      pole: 'withdraw',
      reversed: false
    },
    {
      id: 'M4_CA_11',
      text: 'When she pulls away during a fight, I feel panicked and need to re-engage.',
      pole: 'pursue',
      reversed: false
    },
    {
      id: 'M4_CA_12',
      text: 'When she keeps pushing during a fight, I feel overwhelmed and need to escape.',
      pole: 'withdraw',
      reversed: false
    }
  ],

  // -------------------------------------------------------------------------
  // SECTION 2: EMOTIONAL DRIVERS (16 questions, 4 per driver)
  // -------------------------------------------------------------------------
  emotionalDrivers: [
    // Abandonment (4)
    {
      id: 'M4_ED_01',
      driver: 'abandonment',
      text: 'When she needs space, part of me fears she might not come back.',
      reversed: false
    },
    {
      id: 'M4_ED_02',
      driver: 'abandonment',
      text: 'I need reassurance that we are okay more often than my partners seem to need it.',
      reversed: false
    },
    {
      id: 'M4_ED_03',
      driver: 'abandonment',
      text: 'Her silence feels like rejection, even when she says it is not.',
      reversed: false
    },
    {
      id: 'M4_ED_04',
      driver: 'abandonment',
      text: 'I have been told I am clingy or need too much reassurance.',
      reversed: false
    },

    // Engulfment (4)
    {
      id: 'M4_ED_05',
      driver: 'engulfment',
      text: 'When she wants to talk about everything, I feel suffocated.',
      reversed: false
    },
    {
      id: 'M4_ED_06',
      driver: 'engulfment',
      text: 'I need time alone to feel like myself, even in a good relationship.',
      reversed: false
    },
    {
      id: 'M4_ED_07',
      driver: 'engulfment',
      text: 'Partners have said I create too much distance or seem emotionally unavailable.',
      reversed: false
    },
    {
      id: 'M4_ED_08',
      driver: 'engulfment',
      text: 'I worry about losing myself when I get too close to someone.',
      reversed: false
    },

    // Inadequacy (4)
    {
      id: 'M4_ED_09',
      driver: 'inadequacy',
      text: 'When she is disappointed, my first thought is that I have failed her.',
      reversed: false
    },
    {
      id: 'M4_ED_10',
      driver: 'inadequacy',
      text: 'I apologize even when I am not sure what I did wrong.',
      reversed: false
    },
    {
      id: 'M4_ED_11',
      driver: 'inadequacy',
      text: 'During conflict, I feel like I am fundamentally not good enough.',
      reversed: false
    },
    {
      id: 'M4_ED_12',
      driver: 'inadequacy',
      text: 'I freeze up when criticized because shame takes over.',
      reversed: false
    },

    // Injustice (4)
    {
      id: 'M4_ED_13',
      driver: 'injustice',
      text: 'I cannot let go of an argument until she acknowledges my point.',
      reversed: false
    },
    {
      id: 'M4_ED_14',
      driver: 'injustice',
      text: 'When I feel misunderstood, I dig in harder to make my case.',
      reversed: false
    },
    {
      id: 'M4_ED_15',
      driver: 'injustice',
      text: 'Double standards in relationships make me furious.',
      reversed: false
    },
    {
      id: 'M4_ED_16',
      driver: 'injustice',
      text: 'Partners have said I argue like a lawyer, building a case rather than connecting.',
      reversed: false
    }
  ],

  // -------------------------------------------------------------------------
  // SECTION 3: REPAIR & RECOVERY (12 questions)
  // -------------------------------------------------------------------------
  repairRecovery: [
    // Speed: Quick (3)
    {
      id: 'M4_RR_01',
      dimension: 'speed',
      pole: 'quick',
      text: 'After a fight, I need to make up immediately. I cannot wait.',
      reversed: false
    },
    {
      id: 'M4_RR_02',
      dimension: 'speed',
      pole: 'quick',
      text: 'Unresolved conflict feels physically uncomfortable to me.',
      reversed: false
    },
    {
      id: 'M4_RR_03',
      dimension: 'speed',
      pole: 'quick',
      text: 'I would rather have a hard conversation at 2am than go to sleep upset.',
      reversed: false
    },

    // Speed: Slow (3)
    {
      id: 'M4_RR_04',
      dimension: 'speed',
      pole: 'slow',
      text: 'I need time to process before I can genuinely reconnect after conflict.',
      reversed: false
    },
    {
      id: 'M4_RR_05',
      dimension: 'speed',
      pole: 'slow',
      text: 'Premature apologies feel hollow to me. I need to mean it first.',
      reversed: false
    },
    {
      id: 'M4_RR_06',
      dimension: 'speed',
      pole: 'slow',
      text: 'Partners have said I take too long to come back after a fight.',
      reversed: false
    },

    // Mode: Verbal (3)
    {
      id: 'M4_RR_07',
      dimension: 'mode',
      pole: 'verbal',
      text: 'I need to talk through what happened before I feel like we have repaired.',
      reversed: false
    },
    {
      id: 'M4_RR_08',
      dimension: 'mode',
      pole: 'verbal',
      text: 'Hearing "I am sorry" and "I understand" matters more to me than gestures.',
      reversed: false
    },
    {
      id: 'M4_RR_09',
      dimension: 'mode',
      pole: 'verbal',
      text: 'I cannot feel reconnected until we have had the conversation.',
      reversed: false
    },

    // Mode: Physical (3)
    {
      id: 'M4_RR_10',
      dimension: 'mode',
      pole: 'physical',
      text: 'After a fight, I reach for physical touch before words.',
      reversed: false
    },
    {
      id: 'M4_RR_11',
      dimension: 'mode',
      pole: 'physical',
      text: 'I show I am sorry through actions: making coffee, doing something thoughtful.',
      reversed: false
    },
    {
      id: 'M4_RR_12',
      dimension: 'mode',
      pole: 'physical',
      text: 'Just being physically close helps me feel reconnected, even without talking.',
      reversed: false
    },

    // Repair Attempts (4) - Gottman predictors
    {
      id: 'M4_RR_13',
      dimension: 'attempt',
      pole: 'success',
      text: 'I have made a joke to break tension during a fight, and it worked.',
      reversed: false
    },
    {
      id: 'M4_RR_14',
      dimension: 'attempt',
      pole: 'success',
      text: 'I have reached for her hand in the middle of an argument.',
      reversed: false
    },
    {
      id: 'M4_RR_15',
      dimension: 'attempt',
      pole: 'success',
      text: 'I have said "I am sorry, can we start over?" and meant it.',
      reversed: false
    },
    {
      id: 'M4_RR_16',
      dimension: 'attempt',
      pole: 'success',
      text: 'I have successfully de-escalated a fight that was getting out of control.',
      reversed: false
    }
  ],

  // -------------------------------------------------------------------------
  // SECTION 4: EMOTIONAL CAPACITY (4 questions)
  // -------------------------------------------------------------------------
  emotionalCapacity: [
    {
      id: 'M4_EC_01',
      text: 'I can stay engaged in a difficult conversation for a long time without shutting down.',
      direction: 'high', // Agreement = high capacity
      reversed: false
    },
    {
      id: 'M4_EC_02',
      text: 'Intense emotional conversations drain me quickly. I need frequent breaks.',
      direction: 'low', // Agreement = low capacity
      reversed: false
    },
    {
      id: 'M4_EC_03',
      text: 'When emotions run high, I can usually stay calm and present.',
      direction: 'high',
      reversed: false
    },
    {
      id: 'M4_EC_04',
      text: 'I get overwhelmed faster than most people during emotional discussions.',
      direction: 'low',
      reversed: false
    }
  ],

  // -------------------------------------------------------------------------
  // SECTION 5: GOTTMAN SCREENER (16 questions, 4 per horseman)
  // -------------------------------------------------------------------------
  gottmanScreener: [
    // Criticism (4)
    {
      id: 'M4_GS_01',
      horseman: 'criticism',
      text: 'When upset, I focus on what is wrong with her as a person, not just the behavior.',
      reversed: false
    },
    {
      id: 'M4_GS_02',
      horseman: 'criticism',
      text: 'I have said things like "You always..." or "You never..." during arguments.',
      reversed: false
    },
    {
      id: 'M4_GS_03',
      horseman: 'criticism',
      text: 'When frustrated, I question her character or judgment rather than the specific issue.',
      reversed: false
    },
    {
      id: 'M4_GS_04',
      horseman: 'criticism',
      text: 'Partners have told me my complaints feel like attacks on who they are.',
      reversed: false
    },

    // Contempt (4)
    {
      id: 'M4_GS_05',
      horseman: 'contempt',
      text: 'I have rolled my eyes or made sarcastic comments during serious conversations.',
      reversed: false
    },
    {
      id: 'M4_GS_06',
      horseman: 'contempt',
      text: 'Sometimes I feel like I am smarter or more reasonable than my partner.',
      reversed: false
    },
    {
      id: 'M4_GS_07',
      horseman: 'contempt',
      text: 'I have used mockery or hostile humor when I was really angry.',
      reversed: false
    },
    {
      id: 'M4_GS_08',
      horseman: 'contempt',
      text: 'I have felt genuine disgust toward a partner during conflict.',
      reversed: false
    },

    // Defensiveness (4)
    {
      id: 'M4_GS_09',
      horseman: 'defensiveness',
      text: 'When she brings up a complaint, my first instinct is to explain why it is not my fault.',
      reversed: false
    },
    {
      id: 'M4_GS_10',
      horseman: 'defensiveness',
      text: 'I often respond to her complaints with a complaint of my own.',
      reversed: false
    },
    {
      id: 'M4_GS_11',
      horseman: 'defensiveness',
      text: 'I find it hard to take responsibility when I feel like I am being unfairly blamed.',
      reversed: false
    },
    {
      id: 'M4_GS_12',
      horseman: 'defensiveness',
      text: 'Partners have said I make excuses instead of really hearing them.',
      reversed: false
    },

    // Stonewalling (4)
    {
      id: 'M4_GS_13',
      horseman: 'stonewalling',
      text: 'When overwhelmed, I shut down completely and cannot respond at all.',
      reversed: false
    },
    {
      id: 'M4_GS_14',
      horseman: 'stonewalling',
      text: 'I have left the room or house during an argument without saying when I would be back.',
      reversed: false
    },
    {
      id: 'M4_GS_15',
      horseman: 'stonewalling',
      text: 'I have given a partner the silent treatment for hours or days.',
      reversed: false
    },
    {
      id: 'M4_GS_16',
      horseman: 'stonewalling',
      text: 'When flooded, I become emotionally unavailable even if physically present.',
      reversed: false
    }
  ],

  // -------------------------------------------------------------------------
  // SECTION 6: ATTENTIVENESS IN CONFLICT (Self-Absorbed ↔ Other-Focused)
  // -------------------------------------------------------------------------
  attentiveness: [
    {
      id: 'M4_ATT_01',
      dimension: 'unintentional_hurt',
      text: 'When she is hurt by something I did unintentionally, my first response is to ask what hurt her and why.',
      pole: 'other_focused',
      reversed: false
    },
    {
      id: 'M4_ATT_02',
      dimension: 'conflict_curiosity',
      text: 'During conflict, I rarely ask what she needs. I am focused on making my point.',
      pole: 'self_focused',
      reversed: false
    },
    {
      id: 'M4_ATT_03',
      dimension: 'mood_awareness',
      text: 'When I am upset, I think about how my mood is affecting her.',
      pole: 'other_focused',
      reversed: false
    },
    {
      id: 'M4_ATT_04',
      dimension: 'partner_experience',
      text: 'I often wonder what it is like to be in a relationship with me.',
      pole: 'other_focused',
      reversed: false
    }
  ]
};

// =============================================================================
// WOMEN'S MODULE 4 QUESTIONS
// =============================================================================

const WOMEN_M4_QUESTIONS = {
  // -------------------------------------------------------------------------
  // SECTION 1: CONFLICT APPROACH (12 questions)
  // -------------------------------------------------------------------------
  conflictApproach: [
    {
      id: 'W4_CA_01',
      text: 'When my partner and I have a disagreement, I need to talk about it right away.',
      pole: 'pursue',
      reversed: false
    },
    {
      id: 'W4_CA_02',
      text: 'During heated moments, I find myself needing to step away and collect my thoughts.',
      pole: 'withdraw',
      reversed: false
    },
    {
      id: 'W4_CA_03',
      text: 'I have followed a partner into another room to continue a conversation they were trying to end.',
      pole: 'pursue',
      reversed: false
    },
    {
      id: 'W4_CA_04',
      text: 'I process conflict better when I have time alone first.',
      pole: 'withdraw',
      reversed: false
    },
    {
      id: 'W4_CA_05',
      text: 'I cannot sleep if there is unresolved tension between us.',
      pole: 'pursue',
      reversed: false
    },
    {
      id: 'W4_CA_06',
      text: 'When overwhelmed in an argument, I shut down and cannot find words.',
      pole: 'withdraw',
      reversed: false
    },
    {
      id: 'W4_CA_07',
      text: 'Partners have told me I push too hard to resolve things immediately.',
      pole: 'pursue',
      reversed: false
    },
    {
      id: 'W4_CA_08',
      text: 'Partners have complained that I go quiet when things get intense.',
      pole: 'withdraw',
      reversed: false
    },
    {
      id: 'W4_CA_09',
      text: 'I would rather have an uncomfortable conversation now than let something fester.',
      pole: 'pursue',
      reversed: false
    },
    {
      id: 'W4_CA_10',
      text: 'I need space after conflict before I can reconnect.',
      pole: 'withdraw',
      reversed: false
    },
    {
      id: 'W4_CA_11',
      text: 'When he pulls away during a fight, I feel panicked and need to re-engage.',
      pole: 'pursue',
      reversed: false
    },
    {
      id: 'W4_CA_12',
      text: 'When he keeps pushing during a fight, I feel overwhelmed and need to escape.',
      pole: 'withdraw',
      reversed: false
    }
  ],

  // -------------------------------------------------------------------------
  // SECTION 2: EMOTIONAL DRIVERS (16 questions, 4 per driver)
  // -------------------------------------------------------------------------
  emotionalDrivers: [
    // Abandonment (4)
    {
      id: 'W4_ED_01',
      driver: 'abandonment',
      text: 'When he needs space, part of me fears he might not come back.',
      reversed: false
    },
    {
      id: 'W4_ED_02',
      driver: 'abandonment',
      text: 'I need reassurance that we are okay more often than my partners seem to need it.',
      reversed: false
    },
    {
      id: 'W4_ED_03',
      driver: 'abandonment',
      text: 'His silence feels like rejection, even when he says it is not.',
      reversed: false
    },
    {
      id: 'W4_ED_04',
      driver: 'abandonment',
      text: 'I have been told I am clingy or need too much reassurance.',
      reversed: false
    },

    // Engulfment (4)
    {
      id: 'W4_ED_05',
      driver: 'engulfment',
      text: 'When he wants to process everything together, I feel suffocated.',
      reversed: false
    },
    {
      id: 'W4_ED_06',
      driver: 'engulfment',
      text: 'I need time alone to feel like myself, even in a good relationship.',
      reversed: false
    },
    {
      id: 'W4_ED_07',
      driver: 'engulfment',
      text: 'Partners have said I create too much distance or seem emotionally unavailable.',
      reversed: false
    },
    {
      id: 'W4_ED_08',
      driver: 'engulfment',
      text: 'I worry about losing myself when I get too close to someone.',
      reversed: false
    },

    // Inadequacy (4)
    {
      id: 'W4_ED_09',
      driver: 'inadequacy',
      text: 'When he is disappointed, my first thought is that I have failed him.',
      reversed: false
    },
    {
      id: 'W4_ED_10',
      driver: 'inadequacy',
      text: 'I apologize even when I am not sure what I did wrong.',
      reversed: false
    },
    {
      id: 'W4_ED_11',
      driver: 'inadequacy',
      text: 'During conflict, I feel like I am fundamentally not good enough.',
      reversed: false
    },
    {
      id: 'W4_ED_12',
      driver: 'inadequacy',
      text: 'I freeze up when criticized because shame takes over.',
      reversed: false
    },

    // Injustice (4)
    {
      id: 'W4_ED_13',
      driver: 'injustice',
      text: 'I cannot let go of an argument until he acknowledges my point.',
      reversed: false
    },
    {
      id: 'W4_ED_14',
      driver: 'injustice',
      text: 'When I feel misunderstood, I dig in harder to make my case.',
      reversed: false
    },
    {
      id: 'W4_ED_15',
      driver: 'injustice',
      text: 'Double standards in relationships make me furious.',
      reversed: false
    },
    {
      id: 'W4_ED_16',
      driver: 'injustice',
      text: 'Partners have said I argue like a lawyer, building a case rather than connecting.',
      reversed: false
    }
  ],

  // -------------------------------------------------------------------------
  // SECTION 3: REPAIR & RECOVERY (12 questions)
  // -------------------------------------------------------------------------
  repairRecovery: [
    // Speed: Quick (3)
    {
      id: 'W4_RR_01',
      dimension: 'speed',
      pole: 'quick',
      text: 'After a fight, I need to make up immediately. I cannot wait.',
      reversed: false
    },
    {
      id: 'W4_RR_02',
      dimension: 'speed',
      pole: 'quick',
      text: 'Unresolved conflict feels physically uncomfortable to me.',
      reversed: false
    },
    {
      id: 'W4_RR_03',
      dimension: 'speed',
      pole: 'quick',
      text: 'I would rather have a hard conversation at 2am than go to sleep upset.',
      reversed: false
    },

    // Speed: Slow (3)
    {
      id: 'W4_RR_04',
      dimension: 'speed',
      pole: 'slow',
      text: 'I need time to process before I can genuinely reconnect after conflict.',
      reversed: false
    },
    {
      id: 'W4_RR_05',
      dimension: 'speed',
      pole: 'slow',
      text: 'Premature apologies feel hollow to me. I need to mean it first.',
      reversed: false
    },
    {
      id: 'W4_RR_06',
      dimension: 'speed',
      pole: 'slow',
      text: 'Partners have said I take too long to come back after a fight.',
      reversed: false
    },

    // Mode: Verbal (3)
    {
      id: 'W4_RR_07',
      dimension: 'mode',
      pole: 'verbal',
      text: 'I need to talk through what happened before I feel like we have repaired.',
      reversed: false
    },
    {
      id: 'W4_RR_08',
      dimension: 'mode',
      pole: 'verbal',
      text: 'Hearing "I am sorry" and "I understand" matters more to me than gestures.',
      reversed: false
    },
    {
      id: 'W4_RR_09',
      dimension: 'mode',
      pole: 'verbal',
      text: 'I cannot feel reconnected until we have had the conversation.',
      reversed: false
    },

    // Mode: Physical (3)
    {
      id: 'W4_RR_10',
      dimension: 'mode',
      pole: 'physical',
      text: 'After a fight, I reach for physical touch before words.',
      reversed: false
    },
    {
      id: 'W4_RR_11',
      dimension: 'mode',
      pole: 'physical',
      text: 'I show I am sorry through actions: making a gesture, doing something thoughtful.',
      reversed: false
    },
    {
      id: 'W4_RR_12',
      dimension: 'mode',
      pole: 'physical',
      text: 'Just being physically close helps me feel reconnected, even without talking.',
      reversed: false
    },

    // Repair Attempts (4) - Gottman predictors
    {
      id: 'W4_RR_13',
      dimension: 'attempt',
      pole: 'success',
      text: 'I have made a joke to break tension during a fight, and it worked.',
      reversed: false
    },
    {
      id: 'W4_RR_14',
      dimension: 'attempt',
      pole: 'success',
      text: 'I have reached for his hand in the middle of an argument.',
      reversed: false
    },
    {
      id: 'W4_RR_15',
      dimension: 'attempt',
      pole: 'success',
      text: 'I have said "I am sorry, can we start over?" and meant it.',
      reversed: false
    },
    {
      id: 'W4_RR_16',
      dimension: 'attempt',
      pole: 'success',
      text: 'I have successfully de-escalated a fight that was getting out of control.',
      reversed: false
    }
  ],

  // -------------------------------------------------------------------------
  // SECTION 4: EMOTIONAL CAPACITY (4 questions)
  // -------------------------------------------------------------------------
  emotionalCapacity: [
    {
      id: 'W4_EC_01',
      text: 'I can stay engaged in a difficult conversation for a long time without shutting down.',
      direction: 'high',
      reversed: false
    },
    {
      id: 'W4_EC_02',
      text: 'Intense emotional conversations drain me quickly. I need frequent breaks.',
      direction: 'low',
      reversed: false
    },
    {
      id: 'W4_EC_03',
      text: 'When emotions run high, I can usually stay calm and present.',
      direction: 'high',
      reversed: false
    },
    {
      id: 'W4_EC_04',
      text: 'I get overwhelmed faster than most people during emotional discussions.',
      direction: 'low',
      reversed: false
    }
  ],

  // -------------------------------------------------------------------------
  // SECTION 5: GOTTMAN SCREENER (16 questions, 4 per horseman)
  // -------------------------------------------------------------------------
  gottmanScreener: [
    // Criticism (4)
    {
      id: 'W4_GS_01',
      horseman: 'criticism',
      text: 'When upset, I focus on what is wrong with him as a person, not just the behavior.',
      reversed: false
    },
    {
      id: 'W4_GS_02',
      horseman: 'criticism',
      text: 'I have said things like "You always..." or "You never..." during arguments.',
      reversed: false
    },
    {
      id: 'W4_GS_03',
      horseman: 'criticism',
      text: 'When frustrated, I question his character or judgment rather than the specific issue.',
      reversed: false
    },
    {
      id: 'W4_GS_04',
      horseman: 'criticism',
      text: 'Partners have told me my complaints feel like attacks on who they are.',
      reversed: false
    },

    // Contempt (4)
    {
      id: 'W4_GS_05',
      horseman: 'contempt',
      text: 'I have rolled my eyes or made sarcastic comments during serious conversations.',
      reversed: false
    },
    {
      id: 'W4_GS_06',
      horseman: 'contempt',
      text: 'Sometimes I feel like I am smarter or more reasonable than my partner.',
      reversed: false
    },
    {
      id: 'W4_GS_07',
      horseman: 'contempt',
      text: 'I have used mockery or hostile humor when I was really angry.',
      reversed: false
    },
    {
      id: 'W4_GS_08',
      horseman: 'contempt',
      text: 'I have felt genuine disgust toward a partner during conflict.',
      reversed: false
    },

    // Defensiveness (4)
    {
      id: 'W4_GS_09',
      horseman: 'defensiveness',
      text: 'When he brings up a complaint, my first instinct is to explain why it is not my fault.',
      reversed: false
    },
    {
      id: 'W4_GS_10',
      horseman: 'defensiveness',
      text: 'I often respond to his complaints with a complaint of my own.',
      reversed: false
    },
    {
      id: 'W4_GS_11',
      horseman: 'defensiveness',
      text: 'I find it hard to take responsibility when I feel like I am being unfairly blamed.',
      reversed: false
    },
    {
      id: 'W4_GS_12',
      horseman: 'defensiveness',
      text: 'Partners have said I make excuses instead of really hearing them.',
      reversed: false
    },

    // Stonewalling (4)
    {
      id: 'W4_GS_13',
      horseman: 'stonewalling',
      text: 'When overwhelmed, I shut down completely and cannot respond at all.',
      reversed: false
    },
    {
      id: 'W4_GS_14',
      horseman: 'stonewalling',
      text: 'I have left the room or house during an argument without saying when I would be back.',
      reversed: false
    },
    {
      id: 'W4_GS_15',
      horseman: 'stonewalling',
      text: 'I have given a partner the silent treatment for hours or days.',
      reversed: false
    },
    {
      id: 'W4_GS_16',
      horseman: 'stonewalling',
      text: 'When flooded, I become emotionally unavailable even if physically present.',
      reversed: false
    }
  ],

  // -------------------------------------------------------------------------
  // SECTION 6: ATTENTIVENESS IN CONFLICT (Self-Absorbed ↔ Other-Focused)
  // -------------------------------------------------------------------------
  attentiveness: [
    {
      id: 'W4_ATT_01',
      dimension: 'unintentional_hurt',
      text: 'When he is hurt by something I did unintentionally, my first response is to ask what hurt him and why.',
      pole: 'other_focused',
      reversed: false
    },
    {
      id: 'W4_ATT_02',
      dimension: 'conflict_curiosity',
      text: 'During conflict, I rarely ask what he needs. I am focused on making my point.',
      pole: 'self_focused',
      reversed: false
    },
    {
      id: 'W4_ATT_03',
      dimension: 'mood_awareness',
      text: 'When I am upset, I think about how my mood is affecting him.',
      pole: 'other_focused',
      reversed: false
    },
    {
      id: 'W4_ATT_04',
      dimension: 'partner_experience',
      text: 'I often wonder what it is like to be in a relationship with me.',
      pole: 'other_focused',
      reversed: false
    }
  ]
};

// =============================================================================
// SCORING CONFIGURATION
// =============================================================================

const M4_SCORING_CONFIG = {
  likertMin: 1,
  likertMax: 5,
  
  // Conflict approach threshold (50 = midpoint)
  conflictApproachThreshold: 50,
  
  // Driver scoring
  driverQuestions: 4,
  maxDriverScore: 20, // 4 questions * 5 max
  
  // Repair dimensions
  repairQuestionsPerPole: 3,
  repairThreshold: 50,
  
  // Emotional capacity
  capacityQuestions: 4,
  capacityThresholds: {
    high: 65,
    medium: 35
  },
  
  // Gottman risk thresholds per horseman
  gottmanQuestions: 4,
  gottmanThresholds: {
    low: { max: 8 },
    medium: { max: 13 },
    high: { min: 14 }
  }
};

// =============================================================================
// SCORING FUNCTIONS
// =============================================================================

/**
 * Scores conflict approach (Pursue vs Withdraw)
 * Returns score 0-100 where high = Pursue, low = Withdraw
 */
function scoreConflictApproach(responses, questions) {
  let pursueScore = 0;
  let withdrawScore = 0;
  
  for (const q of questions) {
    const response = responses[q.id] || 3;
    if (q.pole === 'pursue') {
      pursueScore += response;
    } else {
      withdrawScore += response;
    }
  }
  
  // Normalize: 6 questions each, range 6-30 per pole
  const pursueNorm = ((pursueScore - 6) / 24) * 100;
  const withdrawNorm = ((withdrawScore - 6) / 24) * 100;
  
  // Final score: 100 = pure pursue, 0 = pure withdraw
  const total = pursueNorm - withdrawNorm + 50;
  const normalized = Math.max(0, Math.min(100, total));
  
  return {
    score: Math.round(normalized),
    approach: normalized >= 50 ? 'pursue' : 'withdraw',
    intensity: Math.abs(normalized - 50),
    pursueRaw: pursueScore,
    withdrawRaw: withdrawScore
  };
}

/**
 * Scores emotional drivers and identifies primary/secondary
 */
function scoreEmotionalDrivers(responses, questions) {
  const drivers = {
    abandonment: 0,
    engulfment: 0,
    inadequacy: 0,
    injustice: 0
  };
  
  for (const q of questions) {
    const response = responses[q.id] || 3;
    drivers[q.driver] += response;
  }
  
  // Normalize each to 0-100
  const normalized = {};
  for (const [driver, score] of Object.entries(drivers)) {
    // Range: 4-20, normalize to 0-100
    normalized[driver] = Math.round(((score - 4) / 16) * 100);
  }
  
  // Sort to find primary and secondary
  const sorted = Object.entries(normalized).sort((a, b) => b[1] - a[1]);
  
  return {
    scores: normalized,
    rawScores: drivers,
    primary: sorted[0][0],
    primaryScore: sorted[0][1],
    secondary: sorted[1][0],
    secondaryScore: sorted[1][1]
  };
}

/**
 * Scores repair style (speed and mode)
 */
function scoreRepairRecovery(responses, questions) {
  const scores = {
    quick: 0,
    slow: 0,
    verbal: 0,
    physical: 0
  };
  
  for (const q of questions) {
    const response = responses[q.id] || 3;
    scores[q.pole] += response;
  }
  
  // Normalize speed: quick vs slow (3 questions each, range 3-15)
  const speedScore = ((scores.quick - 3) / 12) * 100 - ((scores.slow - 3) / 12) * 100 + 50;
  const speedNorm = Math.max(0, Math.min(100, speedScore));
  
  // Normalize mode: verbal vs physical (3 questions each)
  const modeScore = ((scores.verbal - 3) / 12) * 100 - ((scores.physical - 3) / 12) * 100 + 50;
  const modeNorm = Math.max(0, Math.min(100, modeScore));
  
  return {
    speed: {
      score: Math.round(speedNorm),
      style: speedNorm >= 50 ? 'quick' : 'slow',
      intensity: Math.abs(speedNorm - 50)
    },
    mode: {
      score: Math.round(modeNorm),
      style: modeNorm >= 50 ? 'verbal' : 'physical',
      intensity: Math.abs(modeNorm - 50)
    },
    rawScores: scores
  };
}

/**
 * Scores emotional capacity
 */
function scoreEmotionalCapacity(responses, questions) {
  let highCapScore = 0;
  let lowCapScore = 0;
  
  for (const q of questions) {
    const response = responses[q.id] || 3;
    if (q.direction === 'high') {
      highCapScore += response;
    } else {
      lowCapScore += response;
    }
  }
  
  // Net score: high agreement with high-cap questions minus low-cap questions
  const netScore = highCapScore - lowCapScore;
  // Range: -8 to +8, normalize to 0-100
  const normalized = Math.round(((netScore + 8) / 16) * 100);
  
  let level;
  if (normalized >= M4_SCORING_CONFIG.capacityThresholds.high) {
    level = 'high';
  } else if (normalized >= M4_SCORING_CONFIG.capacityThresholds.medium) {
    level = 'medium';
  } else {
    level = 'low';
  }
  
  return {
    score: normalized,
    level,
    rawHigh: highCapScore,
    rawLow: lowCapScore
  };
}

/**
 * Scores Gottman Four Horsemen (COACHING FLAGS ONLY)
 */
function scoreGottmanScreener(responses, questions) {
  const horsemen = {
    criticism: 0,
    contempt: 0,
    defensiveness: 0,
    stonewalling: 0
  };
  
  for (const q of questions) {
    const response = responses[q.id] || 3;
    horsemen[q.horseman] += response;
  }
  
  // Determine risk level for each (raw score 4-20)
  const results = {};
  for (const [horseman, score] of Object.entries(horsemen)) {
    let riskLevel;
    if (score <= M4_SCORING_CONFIG.gottmanThresholds.low.max) {
      riskLevel = 'low';
    } else if (score <= M4_SCORING_CONFIG.gottmanThresholds.medium.max) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'high';
    }
    
    results[horseman] = {
      score,
      riskLevel,
      antidote: GOTTMAN_HORSEMEN[horseman].antidote
    };
  }
  
  // Find primary horseman (highest score)
  const sorted = Object.entries(horsemen).sort((a, b) => b[1] - a[1]);
  const primaryHorseman = sorted[0][0];
  const hasHighRisk = Object.values(results).some(r => r.riskLevel === 'high');
  const hasMediumRisk = Object.values(results).some(r => r.riskLevel === 'medium');
  
  return {
    horsemen: results,
    primary: primaryHorseman,
    primaryScore: horsemen[primaryHorseman],
    overallRisk: hasHighRisk ? 'high' : hasMediumRisk ? 'medium' : 'low',
    coachingPriority: hasHighRisk ? 'immediate' : hasMediumRisk ? 'recommended' : 'maintenance'
  };
}

/**
 * Main scoring function for Module 4
 */
function scoreModule4(gender, responses) {
  const questions = gender === 'M' ? MEN_M4_QUESTIONS : WOMEN_M4_QUESTIONS;
  
  const conflictApproach = scoreConflictApproach(responses, questions.conflictApproach);
  const emotionalDrivers = scoreEmotionalDrivers(responses, questions.emotionalDrivers);
  const repairRecovery = scoreRepairRecovery(responses, questions.repairRecovery);
  const emotionalCapacity = scoreEmotionalCapacity(responses, questions.emotionalCapacity);
  const gottmanScreener = scoreGottmanScreener(responses, questions.gottmanScreener);
  
  return {
    conflictApproach,
    emotionalDrivers,
    repairRecovery,
    emotionalCapacity,
    gottmanScreener,
    
    // Summary for compatibility calculator
    summary: {
      approach: conflictApproach.approach,
      primaryDriver: emotionalDrivers.primary,
      repairSpeed: repairRecovery.speed.style,
      repairMode: repairRecovery.mode.style,
      capacity: emotionalCapacity.level,
      gottmanRisk: gottmanScreener.overallRisk
    }
  };
}

// =============================================================================
// ATTENTIVENESS SCORING
// =============================================================================

/**
 * Scores attentiveness (self-absorbed ↔ other-focused) from M3 and M4 responses
 * 
 * @param {Object} allResponses - All responses (M3 + M4)
 * @param {string} gender - 'M' or 'W'
 * @param {Object} m3Scores - Existing M3 scores (want/offer)
 * @param {Object} gottmanScores - Gottman screener scores
 * @param {number} selfPerceptionGap - From M2 (optional)
 * @returns {Object} Attentiveness assessment
 */
function scoreAttentiveness(allResponses, gender, m3Scores, gottmanScores, selfPerceptionGap = 0) {
  // Score direct attentiveness questions
  let otherFocusedScore = 0;
  let selfFocusedScore = 0;
  
  const prefix = gender === 'M' ? 'M' : 'W';
  
  // M3 attentiveness (4 questions)
  const m3AttIds = ['ATT_01', 'ATT_02', 'ATT_03', 'ATT_04'];
  for (const id of m3AttIds) {
    const response = allResponses[`${prefix}3_${id}`] || allResponses[`M3_${id}`] || allResponses[`W3_${id}`];
    if (response) {
      if (id === 'ATT_03') { // self_focused question
        selfFocusedScore += response;
      } else {
        otherFocusedScore += response;
      }
    }
  }
  
  // M4 attentiveness (4 questions)
  const m4AttIds = ['ATT_01', 'ATT_02', 'ATT_03', 'ATT_04'];
  for (const id of m4AttIds) {
    const response = allResponses[`${prefix}4_${id}`] || allResponses[`M4_${id}`] || allResponses[`W4_${id}`];
    if (response) {
      if (id === 'ATT_02') { // self_focused question
        selfFocusedScore += response;
      } else {
        otherFocusedScore += response;
      }
    }
  }
  
  // Add derived signals
  // M3 Offer contributes to other-focus (giving to partner)
  if (m3Scores && m3Scores.offerScore !== undefined) {
    otherFocusedScore += (m3Scores.offerScore / 100) * 10;
  }
  
  // M3 Want contributes to self-focus (wanting from partner)
  if (m3Scores && m3Scores.wantScore !== undefined) {
    selfFocusedScore += (m3Scores.wantScore / 100) * 10;
  }
  
  // Contempt and Criticism are strong self-focus signals
  if (gottmanScores) {
    if (gottmanScores.contempt && gottmanScores.contempt.score !== undefined) {
      selfFocusedScore += (gottmanScores.contempt.score / 10) * 3;
    }
    if (gottmanScores.criticism && gottmanScores.criticism.score !== undefined) {
      selfFocusedScore += (gottmanScores.criticism.score / 10) * 3;
    }
  }
  
  // Self-perception gap magnitude suggests self-focus
  selfFocusedScore += (Math.abs(selfPerceptionGap) / 100) * 5;
  
  // Calculate ratio
  const ratio = otherFocusedScore / Math.max(selfFocusedScore, 1);
  
  // Determine level
  let level, description;
  if (ratio > 1.5) {
    level = 'strongly_other_focused';
    description = 'Strongly Other-Focused';
  } else if (ratio >= 0.8) {
    level = 'balanced';
    description = 'Balanced';
  } else if (ratio >= 0.5) {
    level = 'moderately_self_focused';
    description = 'Moderately Self-Focused';
  } else {
    level = 'self_absorbed';
    description = 'Self-Absorbed';
  }
  
  return {
    otherFocusedScore: Math.round(otherFocusedScore),
    selfFocusedScore: Math.round(selfFocusedScore),
    ratio: Math.round(ratio * 100) / 100,
    level,
    description,
    score: Math.round((ratio / (ratio + 1)) * 100), // Normalized 0-100 score
    
    // For coaching
    components: {
      directQuestions: {
        otherFocused: otherFocusedScore,
        selfFocused: selfFocusedScore
      },
      m3Contribution: m3Scores ? {
        offer: (m3Scores.offerScore / 100) * 10,
        want: (m3Scores.wantScore / 100) * 10
      } : null,
      gottmanContribution: gottmanScores ? {
        contempt: gottmanScores.contempt ? (gottmanScores.contempt.score / 10) * 3 : 0,
        criticism: gottmanScores.criticism ? (gottmanScores.criticism.score / 10) * 3 : 0
      } : null,
      gapContribution: (Math.abs(selfPerceptionGap) / 100) * 5
    }
  };
}

// =============================================================================
// COMPATIBILITY FUNCTIONS
// =============================================================================

/**
 * Calculates M4 conflict compatibility between two users
 * This contributes 5% to overall compatibility score
 */
function calculateM4Compatibility(user1M4, user2M4) {
  let score = 50; // Start neutral
  
  // 1. Conflict approach compatibility
  const approach1 = user1M4.conflictApproach.approach;
  const approach2 = user2M4.conflictApproach.approach;
  
  if (approach1 === approach2) {
    score += 10; // Same approach = easier
  } else {
    // Pursue-withdraw: check intensity
    const intensity1 = user1M4.conflictApproach.intensity;
    const intensity2 = user2M4.conflictApproach.intensity;
    if (intensity1 > 30 && intensity2 > 30) {
      score -= 15; // Strong pursue-withdraw = challenging
    } else {
      score -= 5; // Mild difference = manageable
    }
  }
  
  // 2. Driver compatibility
  const driver1 = user1M4.emotionalDrivers.primary;
  const driver2 = user2M4.emotionalDrivers.primary;
  
  const driverKey = [driver1, driver2].sort().join('-');
  if (driver1 === driver2) {
    score += 15; // Same driver = understand each other
  } else if (driverKey === 'abandonment-engulfment') {
    score -= 20; // Classic problematic pairing
  } else if (driverKey === 'inadequacy-injustice') {
    score -= 10; // Power imbalance risk
  } else {
    score += 5; // Other combinations are neutral to positive
  }
  
  // 3. Repair style compatibility
  const speed1 = user1M4.repairRecovery.speed.style;
  const speed2 = user2M4.repairRecovery.speed.style;
  const mode1 = user1M4.repairRecovery.mode.style;
  const mode2 = user2M4.repairRecovery.mode.style;
  
  if (speed1 === speed2) score += 5;
  else score -= 5;
  
  if (mode1 === mode2) score += 5;
  // Different modes can complement, so no penalty
  
  // 4. Capacity matching
  const cap1 = user1M4.emotionalCapacity.level;
  const cap2 = user2M4.emotionalCapacity.level;
  
  if (cap1 === cap2) {
    score += 5;
  } else if ((cap1 === 'high' && cap2 === 'low') || (cap1 === 'low' && cap2 === 'high')) {
    score -= 10; // Big mismatch
  }
  
  // Normalize to 0-100
  score = Math.max(0, Math.min(100, score));
  
  return {
    score: Math.round(score),
    factors: {
      approachMatch: approach1 === approach2,
      driverCompatibility: getDriverCompatibilityDescription(driver1, driver2),
      repairAlignment: {
        speedMatch: speed1 === speed2,
        modeMatch: mode1 === mode2
      },
      capacityMatch: cap1 === cap2
    },
    narrative: generateM4CompatibilityNarrative(user1M4, user2M4)
  };
}

/**
 * Gets driver compatibility description from matrix
 */
function getDriverCompatibilityDescription(driver1, driver2) {
  if (driver1 === driver2) {
    return DRIVER_COMPATIBILITY['same-driver'];
  }
  
  const key = [driver1, driver2].sort().join('-');
  return DRIVER_COMPATIBILITY[key] || {
    dynamic: 'Mixed driver pairing',
    prognosis: 'Varies',
    pattern: 'No established pattern',
    coaching: 'Observe and adapt based on specific dynamics'
  };
}

/**
 * Generates narrative for M4 compatibility
 */
function generateM4CompatibilityNarrative(user1M4, user2M4) {
  const narratives = [];
  
  // Conflict approach
  const a1 = user1M4.conflictApproach.approach;
  const a2 = user2M4.conflictApproach.approach;
  
  if (a1 === a2 && a1 === 'pursue') {
    narratives.push('You both move toward conflict. Issues will get addressed, but you may escalate together. One of you may need to practice de-escalation.');
  } else if (a1 === a2 && a1 === 'withdraw') {
    narratives.push('You both need space during conflict. Issues may go unresolved without intentional effort. Schedule conversations when you are both ready.');
  } else {
    narratives.push('One of you pursues while the other withdraws. This is the most common dynamic and can create a painful spiral. The pursuer must give space; the withdrawer must commit to returning.');
  }
  
  // Driver narrative
  const d1 = user1M4.emotionalDrivers.primary;
  const d2 = user2M4.emotionalDrivers.primary;
  const driverInfo = getDriverCompatibilityDescription(d1, d2);
  narratives.push(driverInfo.pattern + ' ' + driverInfo.coaching);
  
  return narratives.join(' ');
}

// =============================================================================
// COACHING FUNCTIONS
// =============================================================================

/**
 * Generates coaching content based on M4 results
 * This is the primary output; Gottman flags drive coaching, not matching
 */
function generateM4Coaching(m4Results) {
  const coaching = {
    conflictApproach: generateApproachCoaching(m4Results.conflictApproach),
    emotionalDrivers: generateDriverCoaching(m4Results.emotionalDrivers),
    repairStyle: generateRepairCoaching(m4Results.repairRecovery),
    emotionalCapacity: generateCapacityCoaching(m4Results.emotionalCapacity),
    gottmanFlags: generateGottmanCoaching(m4Results.gottmanScreener)
  };
  
  return coaching;
}

function generateApproachCoaching(approachResults) {
  const approach = CONFLICT_APPROACH[approachResults.approach];
  return {
    style: approach.name,
    description: approach.description,
    strengths: approach.strengths,
    challenges: approach.challenges,
    partnerGuidance: approachResults.approach === 'pursue' 
      ? 'If your partner withdraws, give them explicit time ("Let us talk in 30 minutes") rather than following them. They will come back faster if not chased.'
      : 'If your partner pursues, give them reassurance that you are coming back ("I need 30 minutes, but we will resolve this"). Disappearing without timeline triggers their fear.'
  };
}

function generateDriverCoaching(driverResults) {
  const primaryDriver = EMOTIONAL_DRIVERS[driverResults.primary];
  const secondaryDriver = EMOTIONAL_DRIVERS[driverResults.secondary];
  
  return {
    primary: {
      name: primaryDriver.name,
      coreFear: primaryDriver.coreFear,
      triggers: primaryDriver.triggers,
      healthyExpression: primaryDriver.healthyExpression,
      unhealthyExpression: primaryDriver.unhealthyExpression
    },
    secondary: {
      name: secondaryDriver.name,
      coreFear: secondaryDriver.coreFear
    },
    selfWork: `When you feel ${primaryDriver.coreFear.toLowerCase()}, pause before reacting. Notice this is your driver activating, not necessarily reality. Practice saying: "${primaryDriver.healthyExpression}"`
  };
}

function generateRepairCoaching(repairResults) {
  const speedStyle = REPAIR_STYLES.speed[repairResults.speed.style];
  const modeStyle = REPAIR_STYLES.mode[repairResults.mode.style];
  
  return {
    speed: {
      style: speedStyle.name,
      description: speedStyle.description,
      behaviors: speedStyle.behaviors
    },
    mode: {
      style: modeStyle.name,
      description: modeStyle.description,
      behaviors: modeStyle.behaviors
    },
    partnerGuidance: `Tell your partner: "After we fight, I need ${repairResults.speed.style === 'quick' ? 'to reconnect quickly' : 'time before I can genuinely reconnect'}. The best way to repair with me is ${repairResults.mode.style === 'verbal' ? 'through conversation and words' : 'through touch and actions'}."`
  };
}

function generateCapacityCoaching(capacityResults) {
  const levelInfo = EMOTIONAL_CAPACITY[capacityResults.level];
  
  return {
    level: levelInfo.name,
    description: levelInfo.description,
    threshold: levelInfo.threshold,
    risk: levelInfo.risk,
    guidance: capacityResults.level === 'low' 
      ? 'Build in structured breaks during difficult conversations. Tell your partner: "I flood quickly. When I say I need a break, it is not abandonment; it is self-regulation."'
      : capacityResults.level === 'high'
        ? 'Be aware that your partner may flood before you do. Check in: "Are you still with me?" Do not mistake their need for breaks as avoidance.'
        : 'You have average emotional bandwidth. Take breaks when needed, but push yourself to return and complete repair.'
  };
}

function generateGottmanCoaching(gottmanResults) {
  const coaching = {
    overallRisk: gottmanResults.overallRisk,
    priority: gottmanResults.coachingPriority,
    horsemen: {}
  };
  
  for (const [horseman, data] of Object.entries(gottmanResults.horsemen)) {
    if (data.riskLevel !== 'low') {
      coaching.horsemen[horseman] = {
        riskLevel: data.riskLevel,
        description: GOTTMAN_HORSEMEN[horseman].description,
        indicators: GOTTMAN_HORSEMEN[horseman].indicators,
        antidote: data.antidote
      };
    }
  }
  
  if (gottmanResults.overallRisk === 'high') {
    coaching.urgentMessage = 'You have elevated risk on one or more of the Four Horsemen. These patterns predict relationship failure when chronic. Consider couples therapy or a Gottman workshop to address these patterns before they become entrenched.';
  }
  
  return coaching;
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validates M4 responses for quality
 */
function validateM4Responses(responses, gender) {
  const questions = gender === 'M' ? MEN_M4_QUESTIONS : WOMEN_M4_QUESTIONS;
  const allQuestions = [
    ...questions.conflictApproach,
    ...questions.emotionalDrivers,
    ...questions.repairRecovery,
    ...questions.emotionalCapacity,
    ...questions.gottmanScreener
  ];
  
  const responseValues = allQuestions.map(q => responses[q.id]).filter(v => v !== undefined);
  
  // Check completion
  const completionRate = responseValues.length / allQuestions.length;
  
  // Check for straight-lining
  const uniqueResponses = new Set(responseValues);
  const straightLining = uniqueResponses.size === 1;
  
  // Check for extreme responding
  const extremeCount = responseValues.filter(v => v === 1 || v === 5).length;
  const extremeResponding = extremeCount > responseValues.length * 0.8;
  
  return {
    isValid: completionRate > 0.9 && !straightLining,
    completionRate,
    flags: {
      straightLining,
      extremeResponding,
      incomplete: completionRate < 0.9
    },
    confidence: straightLining ? 'low' : extremeResponding ? 'medium' : 'high'
  };
}

// =============================================================================
// EXPORTS
// =============================================================================


// =============================================================================

// =============================================================================
// CHECKPOINT SYSTEM DOCUMENTATION
// =============================================================================
// 
// RELATE uses a 3-session checkpoint system to allow users to complete the
// assessment across multiple sittings. Each checkpoint saves progress.
// 
// Time estimates based on Enneagram benchmark: 144 questions in 40 min = ~17 sec/question
//
// PRIMARY: window.storage API (Claude artifact persistent storage)
// BACKUP: Exportable/importable checkpoint strings
//
// -----------------------------------------------------------------------------
// SESSION BOUNDARIES
// -----------------------------------------------------------------------------
//
// DEMOGRAPHICS: (~4 minutes, ~15-20 questions)
// â”œâ”€â”€ Collected BEFORE Session 1, but NOT part of checkpoint system
// â”œâ”€â”€ Questions defined separately from relate_questions.js
// â””â”€â”€ Users who exit during demographics must restart this section
//
// SESSION 1: Module 1 - "Who You Want" (~38 minutes)
// â”œâ”€â”€ Questions: 134 per user
// â”œâ”€â”€ Men IDs: M1_PHY_*, M1_SOC_*, M1_LIFE_*, M1_VAL_*
// â”œâ”€â”€ Women IDs: W1_PHY_*, W1_SOC_*, W1_LIFE_*, W1_VAL_*
// â””â”€â”€ Checkpoint 1 fires after last M1 question answered
//
// SESSION 2: Module 2 - "Who You Are" (~39 minutes)  
// â”œâ”€â”€ Questions: 132 core + 5 validation = 137 per user
// â”œâ”€â”€ Men IDs: M2_PHY_*, M2_SOC_*, M2_LIFE_*, M2_VAL_*, ATT_*, CON_*
// â”œâ”€â”€ Women IDs: W2_PHY_*, W2_SOC_*, W2_LIFE_*, W2_VAL_*, ATT_*, CON_*
// â””â”€â”€ Checkpoint 2 fires after last M2 question answered
//
// SESSION 3: Modules 3+4 - "How You Connect & Handle Conflict" (~25 minutes)
// â”œâ”€â”€ Questions: 24 (M3) + 64 (M4) = 88 per user
// â”œâ”€â”€ M3 IDs: M3_WANT_*, M3_OFFER_* (shared pattern, gender in questions obj)
// â”œâ”€â”€ M4 Men IDs: M4_CA_*, M4_ED_*, M4_RR_*, M4_EC_*, M4_GS_*
// â”œâ”€â”€ M4 Women IDs: W4_CA_*, W4_ED_*, W4_RR_*, W4_EC_*, W4_GS_*
// â””â”€â”€ Assessment complete - generate full report
//
// TOTAL: ~106 minutes (including demographics)
//
// -----------------------------------------------------------------------------
// CHECKPOINT STRING FORMAT
// -----------------------------------------------------------------------------
//
// Format: RELATE_v1_{gender}_{session}_{encodedResponses}_{checksum}
//
// Example: RELATE_v1_M_1_3342514325143251432514325143251432514325...AB_a7f2
//
// Encoding:
// - Likert responses: 1-5 (single digit)
// - Forced choice: A or B
// - Responses ordered by question ID (alphabetically sorted)
// - Checksum: first 4 chars of MD5 hash for validation
//
// -----------------------------------------------------------------------------
// STORAGE API KEYS (for artifact implementation)
// -----------------------------------------------------------------------------
//
// window.storage keys:
// - 'relate_gender': 'M' or 'F'
// - 'relate_session': 1, 2, or 3 (current/completed session)
// - 'relate_m1_responses': JSON stringified responses object
// - 'relate_m2_responses': JSON stringified responses object
// - 'relate_m3_responses': JSON stringified responses object
// - 'relate_m4_responses': JSON stringified responses object
// - 'relate_checkpoint_string': backup string (regenerated at each checkpoint)
//
// =============================================================================

const CHECKPOINT_CONFIG = {
  version: 1,
  // Note: Demographics (~4 min, ~15-20 questions) collected BEFORE Session 1
  // but NOT included in checkpoint system. Demographics are defined separately.
  sessions: {
    1: {
      name: 'Who You Want',
      module: 'M1',
      questionCount: 134,
      estimatedMinutes: 38, // @ 17 sec/question (Enneagram benchmark)
      questionIdPatterns: {
        men: ['M1_PHY_', 'M1_SOC_', 'M1_LIFE_', 'M1_VAL_'],
        women: ['W1_PHY_', 'W1_SOC_', 'W1_LIFE_', 'W1_VAL_']
      }
    },
    2: {
      name: 'Who You Are',
      module: 'M2',
      questionCount: 137, // 132 + 5 validation
      estimatedMinutes: 39, // @ 17 sec/question
      questionIdPatterns: {
        men: ['M2_PHY_', 'M2_SOC_', 'M2_LIFE_', 'M2_VAL_', 'ATT_M', 'CON_M'],
        women: ['W2_PHY_', 'W2_SOC_', 'W2_LIFE_', 'W2_VAL_', 'ATT_W', 'CON_W']
      }
    },
    3: {
      name: 'How You Connect & Handle Conflict',
      modules: ['M3', 'M4'],
      questionCount: 88, // 24 + 64
      estimatedMinutes: 25, // @ 17 sec/question
      questionIdPatterns: {
        men: ['M3_WANT_', 'M3_OFFER_', 'M4_CA_', 'M4_ED_', 'M4_RR_', 'M4_EC_', 'M4_GS_'],
        women: ['W3_WANT_', 'W3_OFFER_', 'W4_CA_', 'W4_ED_', 'W4_RR_', 'W4_EC_', 'W4_GS_']
      }
    }
  },
  totalQuestions: 359, // 134 + 137 + 88 (excludes demographics)
  totalEstimatedMinutes: 102, // excludes ~4 min demographics
  // Full assessment with demographics: ~106 minutes
};

/**
 * Encode responses to a checkpoint string
 * @param {string} gender - 'M' or 'F'
 * @param {number} session - 1, 2, or 3
 * @param {Object} responses - All responses up to this checkpoint
 * @returns {string} Checkpoint string
 */
function encodeCheckpointString(gender, session, responses) {
  const sortedIds = Object.keys(responses).sort();
  let encoded = '';
  
  for (const id of sortedIds) {
    const response = responses[id];
    if (typeof response === 'number') {
      // Likert: 1-5
      encoded += response;
    } else if (response === 'A' || response === 'B') {
      // Forced choice
      encoded += response;
    } else {
      // Unknown format, skip
      console.warn('Unknown response format for', id, response);
    }
  }
  
  // Simple checksum (first 4 chars of base64 encoded length + content sample)
  const checksumSource = encoded.length + encoded.substring(0, 20) + encoded.substring(encoded.length - 20);
  const checksum = btoa(checksumSource).substring(0, 4).replace(/[^a-zA-Z0-9]/g, 'x');
  
  return `RELATE_v1_${gender}_${session}_${encoded}_${checksum}`;
}

/**
 * Decode a checkpoint string back to responses
 * @param {string} checkpointString - The encoded checkpoint string
 * @param {string} gender - Expected gender for validation
 * @returns {Object} { valid: boolean, session: number, responses: Object, error?: string }
 */
function decodeCheckpointString(checkpointString, gender) {
  try {
    const parts = checkpointString.split('_');
    
    if (parts[0] !== 'RELATE' || parts[1] !== 'v1') {
      return { valid: false, error: 'Invalid checkpoint format' };
    }
    
    const checkpointGender = parts[2];
    const session = parseInt(parts[3]);
    const encoded = parts[4];
    const checksum = parts[5];
    
    if (checkpointGender !== gender) {
      return { valid: false, error: `Gender mismatch: checkpoint is for ${checkpointGender === 'M' ? 'men' : 'women'}` };
    }
    
    if (session < 1 || session > 3) {
      return { valid: false, error: 'Invalid session number' };
    }
    
    // Verify checksum
    const checksumSource = encoded.length + encoded.substring(0, 20) + encoded.substring(encoded.length - 20);
    const expectedChecksum = btoa(checksumSource).substring(0, 4).replace(/[^a-zA-Z0-9]/g, 'x');
    
    if (checksum !== expectedChecksum) {
      return { valid: false, error: 'Checksum mismatch - string may be corrupted' };
    }
    
    // Get question IDs for completed sessions
    const questionIds = getQuestionIdsForSessions(gender, session);
    
    if (encoded.length !== questionIds.length) {
      return { valid: false, error: `Response count mismatch: expected ${questionIds.length}, got ${encoded.length}` };
    }
    
    // Decode responses
    const responses = {};
    for (let i = 0; i < questionIds.length; i++) {
      const char = encoded[i];
      if (char >= '1' && char <= '5') {
        responses[questionIds[i]] = parseInt(char);
      } else if (char === 'A' || char === 'B') {
        responses[questionIds[i]] = char;
      } else {
        return { valid: false, error: `Invalid response character at position ${i}: ${char}` };
      }
    }
    
    return { valid: true, session, responses };
  } catch (e) {
    return { valid: false, error: 'Failed to parse checkpoint string: ' + e.message };
  }
}

/**
 * Get ordered question IDs for all sessions up to and including the specified session
 * @param {string} gender - 'M' or 'F'
 * @param {number} upToSession - Include sessions 1 through this number
 * @returns {string[]} Ordered array of question IDs
 */
function getQuestionIdsForSessions(gender, upToSession) {
  const ids = [];
  const genderKey = gender === 'M' ? 'men' : 'women';
  
  for (let s = 1; s <= upToSession; s++) {
    const sessionConfig = CHECKPOINT_CONFIG.sessions[s];
    const patterns = sessionConfig.questionIdPatterns[genderKey];
    
    // This is a simplified version - the actual implementation in JSX
    // will extract IDs directly from the question objects
    // For now, this serves as documentation of the expected structure
  }
  
  return ids.sort();
}

/**
 * Get session info for UI display
 * @param {number} session - Session number (1, 2, or 3)
 * @returns {Object} Session configuration
 */
function getSessionInfo(session) {
  return CHECKPOINT_CONFIG.sessions[session] || null;
}

/**
 * Calculate progress percentage
 * @param {number} currentSession - Current session (1, 2, or 3)
 * @param {number} questionsInSession - Questions answered in current session
 * @returns {number} Percentage complete (0-100)
 */
function calculateProgress(currentSession, questionsInSession) {
  let completed = 0;
  
  // Add completed sessions
  for (let s = 1; s < currentSession; s++) {
    completed += CHECKPOINT_CONFIG.sessions[s].questionCount;
  }
  
  // Add progress in current session
  completed += questionsInSession;
  
  return Math.round((completed / CHECKPOINT_CONFIG.totalQuestions) * 100);
}


// SECTION 5: UNIFIED EXPORTS
// =============================================================================

module.exports = {
  // =========================================================================
  // MODULE 1: WHO YOU WANT
  // =========================================================================
  
  // M1 Constants
  QUESTION_TYPES,
  LIKERT_SCALE,
  DIMENSIONS,
  MEN_POLES,
  WOMEN_POLES,
  
  // M1 Question Banks
  MEN_MODULE1_QUESTIONS,
  WOMEN_MODULE1_QUESTIONS,
  
  // M1 Scoring Functions (renamed from scoreDimension/getQuestionCounts)
  scoreM1Dimension,
  scoreModule1,
  calculateConsistency,
  
  // M1 Helper Functions
  getAllQuestions,
  getM1QuestionCounts,
  
  // M1 Modifier Signal Extraction
  detectDissonance,
  extractModifierSignals,
  signalsToModifierInput,
  
  // M1 Demographic Mismatch Detection
  PERSONA_DEMAND_PROFILES,
  assessDemographicMismatch,
  
  // M1 Pool Tier Analysis & Coaching
  POOL_TIER_DEFINITIONS,
  FILTER_COST_ESTIMATES,
  analyzePoolTiers,
  generatePoolCoaching,
  
  // M1 Search Channel & Market Coaching
  SEARCH_CHANNELS,
  RELOCATION_FRAMEWORK,
  recommendSearchChannels,
  generateRelocationCoaching,
  generateAdjustmentCoaching,
  
  // =========================================================================
  // MODULE 2: WHO ARE YOU
  // =========================================================================
  
  // M2 Pole Definitions
  MEN_M2_POLES,
  WOMEN_W2_POLES,
  
  // M2 Question Banks
  MEN_MODULE2_QUESTIONS,
  WOMEN_MODULE2_QUESTIONS,
  
  // M2 Validation
  ATTENTION_CHECKS,
  CONSISTENCY_CHECKS,
  validateResponses,
  detectAcquiescenceBias,
  
  // M2 Scoring Functions (renamed from scoreDimension/getQuestionCounts)
  getM2QuestionCounts,
  scoreM2Dimension,
  scoreModule2,
  
  // M2 Mismatch Analysis
  analyzeType2Mismatch,
  analyzeType3Mismatch,
  
  // M2 Persona Profiles
  M2_PERSONA_PROFILES,
  W2_PERSONA_PROFILES,
  getPersonaProfile,
  getPersonaName,
  
  // M2 Modifier Systems
  extractM2ModifierSignals,
  calculateUnifiedModifiers,
  
  // M2 Complete Assessment
  runModule2Assessment,
  calculateOverallConfidence,
  generateM2Coaching,
  
  // =========================================================================
  // MODULE 3: HOW YOU CONNECT
  // =========================================================================
  
  // M3 Metadata (renamed from REPORT_METADATA)
  M3_REPORT_METADATA,
  
  // M3 Question Sets
  MEN_M3_QUESTIONS,
  WOMEN_M3_QUESTIONS,
  
  // M3 Type Definitions
  CONTEXT_SWITCHING_TYPES,
  
  // M3 Configuration (renamed from LIKERT_SCALE and SCORING_CONFIG)
  LIKERT_SCALE_LABELS,
  M3_SCORING_CONFIG,
  
  // M3 Scoring Functions
  calculateRawScore,
  normalizeScore,
  determineType,
  calculateWantOfferGap,
  scoreModule3,
  
  // M3 Validation
  validateM3Responses,
  
  // M3 Coaching
  generateM3Coaching,
  
  // M3 Compatibility
  calculateM3Compatibility,
  generateCompatibilityNarrative,
  
  // =========================================================================
  // MODULE 4: WHEN THINGS GET HARD
  // =========================================================================
  
  // M4 Metadata (renamed from REPORT_METADATA)
  M4_REPORT_METADATA,
  
  // M4 Question Sets
  MEN_M4_QUESTIONS,
  WOMEN_M4_QUESTIONS,
  
  // M4 Definitions
  CONFLICT_APPROACH,
  EMOTIONAL_DRIVERS,
  REPAIR_STYLES,
  EMOTIONAL_CAPACITY,
  GOTTMAN_HORSEMEN,
  DRIVER_COMPATIBILITY,
  
  // M4 Configuration (renamed from SCORING_CONFIG)
  M4_SCORING_CONFIG,
  
  // M4 Scoring Functions
  scoreConflictApproach,
  scoreEmotionalDrivers,
  scoreRepairRecovery,
  scoreEmotionalCapacity,
  scoreGottmanScreener,
  scoreModule4,
  
  // Attentiveness Scoring
  scoreAttentiveness,
  
  // M4 Compatibility
  calculateM4Compatibility,
  getDriverCompatibilityDescription,
  generateM4CompatibilityNarrative,
  
  // M4 Coaching
  generateM4Coaching,
  generateApproachCoaching,
  generateDriverCoaching,
  generateRepairCoaching,
  generateCapacityCoaching,
  generateGottmanCoaching,
  
  // M4 Validation
  validateM4Responses,
  
  // -------------------------------------------------------------------------
  // CHECKPOINT SYSTEM
  // -------------------------------------------------------------------------
  CHECKPOINT_CONFIG,
  encodeCheckpointString,
  decodeCheckpointString,
  getQuestionIdsForSessions,
  getSessionInfo,
  calculateProgress
};


