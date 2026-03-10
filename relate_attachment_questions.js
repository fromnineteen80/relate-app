/**
 * RELATE Attachment Deep Dive - Question Engine
 *
 * Implements the question bank for all four Quadrants as specified in
 * the spec (Section 4). Quadrants One through Three use static
 * question sets. Quadrant Four constructs its question set dynamically
 * at runtime from the user's persona code and the behavioral metadata
 * in relate_persona_definitions.js.
 *
 * Every question serves the dual function described in the spec:
 *   1. Producing a scoring signal for pattern routing / axis calculation
 *   2. Generating experiential material the report can draw on
 *
 * Question formats:
 *   - 'narrative'  => open-ended text response (min length enforced by UI)
 *   - 'scaled'     => 5-point Likert (1-5) with custom anchors
 *
 * Each question carries:
 *   id         : unique stable identifier
 *   quadrant   : 1 | 2 | 3 | 4
 *   dimension  : which Dimension(s) the question scores against
 *   format     : 'narrative' | 'scaled'
 *   prompt     : the user-facing question text
 *   anchors    : (scaled only) labels for the 1 and 5 endpoints
 *   scoringNote: internal note for the scoring engine (never shown to user)
 *   angle      : 'behavioral' | 'emotional' | 'somatic' | 'relational'
 *                 Used to detect cross-angle consistency/tension
 */

// ============================================================================
// QUADRANT ONE: RELATIONAL HISTORY
// Dimensions: A (Disruption Character), B (Source Figure), C (Repair History)
// ============================================================================

const QUADRANT_ONE_QUESTIONS = [
  // ---------- Disruption Character (chronic vs acute) ----------
  {
    id: 'q1_01',
    quadrant: 1,
    dimension: ['A'],
    format: 'narrative',
    angle: 'emotional',
    prompt:
      'Think about the emotional weather of the household you grew up in. Not specific events, the atmosphere. If you had to describe it as a season or a climate, what would it be? What did that atmosphere teach you about what love requires from the person inside it?',
    scoringNote:
      'Chronic disruption answers describe sustained atmosphere. Acute disruption answers pivot to a specific event that changed the weather.'
  },
  {
    id: 'q1_02',
    quadrant: 1,
    dimension: ['A'],
    format: 'narrative',
    angle: 'relational',
    prompt:
      'When you think about the relationship or experience that shaped how you approach love the most, do you remember a single moment that changed things, or is it more of a feeling that built up over time without a clear starting point?',
    scoringNote:
      'Direct probe for chronic (no clear origin) vs acute (identifiable moment). Answers describing both indicate mixed disruption; score toward dominant signal.'
  },
  {
    id: 'q1_03',
    quadrant: 1,
    dimension: ['A'],
    format: 'scaled',
    angle: 'behavioral',
    prompt:
      'When someone asks about your childhood, you can point to a specific event that changed how you understood love.',
    anchors: { low: 'There was no single event, it was just how things were', high: 'There is a clear before and after' },
    scoringNote:
      'Low scores indicate chronic disruption. High scores indicate acute disruption.'
  },
  {
    id: 'q1_04',
    quadrant: 1,
    dimension: ['A'],
    format: 'narrative',
    angle: 'somatic',
    prompt:
      'Describe what conflict looked like in your earliest home. Not what it was about, what happened to the room when tension arrived. What did you learn to do with your body, your voice, or your attention when the air changed?',
    scoringNote:
      'Chronic disruption: conflict was avoided, constant low-grade tension, or never resolved. Acute disruption: references specific explosive events or ruptures.'
  },

  // ---------- Source Figure (caregiver vs romantic) ----------
  {
    id: 'q1_05',
    quadrant: 1,
    dimension: ['B'],
    format: 'narrative',
    angle: 'relational',
    prompt:
      'Think about the patterns you bring into relationships, the way you protect yourself, the things you watch for, the distance you keep or cannot keep. Do those patterns feel like they have always been part of you, or can you trace them to a specific person you loved as an adult?',
    scoringNote:
      'Caregiver origin: "always been this way." Romantic origin: names a specific relationship. Both = complex history; weight toward dominant narrative.'
  },
  {
    id: 'q1_06',
    quadrant: 1,
    dimension: ['B'],
    format: 'narrative',
    angle: 'emotional',
    prompt:
      'Describe the earliest model of love you witnessed. What did it teach you about what love looks like when nobody is performing it? If that model is still running your expectations today, describe how. If something came along to replace it, describe when that shift happened.',
    scoringNote:
      'Caregiver origin: describes parental/household model still operating. Romantic origin: describes a specific relationship that replaced or overwrote the early model.'
  },
  {
    id: 'q1_07',
    quadrant: 1,
    dimension: ['B'],
    format: 'scaled',
    angle: 'behavioral',
    prompt:
      'The way you handle closeness in romantic relationships was shaped more by a specific past partner than by your family of origin.',
    anchors: { low: 'My family shaped this more', high: 'A specific past partner shaped this more' },
    scoringNote:
      'Low = caregiver origin. High = romantic origin.'
  },

  // ---------- Repair History ----------
  {
    id: 'q1_08',
    quadrant: 1,
    dimension: ['C'],
    format: 'narrative',
    angle: 'relational',
    prompt:
      'Think about the most significant relational wound you carry. Did anything ever come along, a relationship, a conversation, a period of work on yourself, that genuinely changed what that wound concluded about love? Not intellectually. Did something shift in what you actually believe is possible?',
    scoringNote:
      'Repaired: describes a specific corrective experience with genuine shift in belief. Partially repaired: intellectual understanding without felt shift. Unresolved: no corrective experience or experience that did not land.'
  },
  {
    id: 'q1_09',
    quadrant: 1,
    dimension: ['C'],
    format: 'narrative',
    angle: 'emotional',
    prompt:
      'When you imagine entering a new relationship with someone who is genuinely trustworthy, what happens in your body? Describe the first feeling that arrives, not what you think should happen, but what actually happens before you have time to manage it.',
    scoringNote:
      'Repaired: describes cautious openness with felt evidence of safety. Unresolved: describes fear, constriction, or habitual protection even when acknowledging the partner is safe.'
  },
  {
    id: 'q1_10',
    quadrant: 1,
    dimension: ['C'],
    format: 'scaled',
    angle: 'emotional',
    prompt:
      'When you think about your most significant past relational wound, you feel a sense of completion rather than something unfinished.',
    anchors: { low: 'It still feels unfinished', high: 'Something in me has settled about it' },
    scoringNote:
      'Low = unresolved. Mid = partial repair. High = repaired.'
  },
  {
    id: 'q1_11',
    quadrant: 1,
    dimension: ['C'],
    format: 'narrative',
    angle: 'relational',
    prompt:
      'Has anyone, a parent, a partner, a therapist, a friend, ever acknowledged what happened to you in a way that changed how you carried it? Describe that moment if it exists. If it does not, describe what it would need to sound like for it to land.',
    scoringNote:
      'Repaired: describes a real moment of witnessed acknowledgment. Unresolved: describes what they would need to hear but have not. The specificity of the hypothetical is itself diagnostic.'
  },

  // ---------- Gap Question (Q1) ----------
  {
    id: 'q1_12',
    quadrant: 1,
    dimension: ['A', 'B', 'C'],
    format: 'narrative',
    angle: 'relational',
    prompt:
      'Describe the version of yourself you were before your most defining relational experience, and the version you became after it. What changed that you wish had not? What changed that you are quietly grateful for?',
    scoringNote:
      'Gap question. The character of what changed maps to disruption type. Whether the person can identify gratitude alongside loss maps to repair history. Whether the "before" is childhood or a specific relationship maps to source figure.'
  },

  // ---------- Cross-angle confirmation ----------
  {
    id: 'q1_13',
    quadrant: 1,
    dimension: ['A', 'C'],
    format: 'scaled',
    angle: 'somatic',
    prompt:
      'When someone you are dating does something that reminds you of an old wound, your body responds before your mind has time to evaluate what is happening.',
    anchors: { low: 'I can usually pause and assess first', high: 'My body is already reacting before I understand why' },
    scoringNote:
      'High somatic reactivity combined with unresolved repair history confirms active wound load. High reactivity with repaired history suggests the repair is intellectual, not somatic.'
  },

  // ---------- Partner feedback probe ----------
  {
    id: 'q1_14',
    quadrant: 1,
    dimension: ['A', 'B'],
    format: 'narrative',
    angle: 'relational',
    prompt:
      'Has a partner or close friend ever said something about your past that surprised you, a connection they drew between your history and your behavior that you had not made yourself? What did they say, and how did it land?',
    scoringNote:
      'The content of the partner observation maps to disruption type and source. Whether the observation "landed" maps to awareness and repair status.'
  }
];


// ============================================================================
// QUADRANT TWO: TRIGGER EMOTION
// patterns: Fear of Abandonment, Shame, Contempt, Grief, Rage
// ============================================================================

const QUADRANT_TWO_QUESTIONS = [
  // ---------- Phenomenology of threat activation ----------
  {
    id: 'q2_01',
    quadrant: 2,
    dimension: ['trigger_emotion'],
    format: 'narrative',
    angle: 'somatic',
    prompt:
      'Think about the last time a relationship felt genuinely uncertain, not a small misunderstanding, but a moment when you did not know if the other person was still in it. What happened in your body before you did anything? Describe the physical sensation as precisely as you can.',
    scoringNote:
      'Abandonment: chest tightness, reaching/grasping quality, heart racing. Shame: heat, face flushing, desire to hide or shrink. Contempt: jaw tightening, cooling, pulling upward. Grief: heaviness, sinking, pre-emptive sadness settling in chest. Rage: heat rising, fists, chest expanding, surge forward.'
  },
  {
    id: 'q2_02',
    quadrant: 2,
    dimension: ['trigger_emotion'],
    format: 'narrative',
    angle: 'emotional',
    prompt:
      'In that same moment of uncertainty, what was the very first thought that arrived, not the reasonable one you eventually talked yourself into, but the raw, unedited thought that came before you had time to manage it?',
    scoringNote:
      'Abandonment: "They are leaving." Shame: "They have seen the real me." Contempt: "They are not enough / cannot handle this." Grief: "This is already over." Rage: "This is not fair / I will not be treated this way."'
  },
  {
    id: 'q2_03',
    quadrant: 2,
    dimension: ['trigger_emotion'],
    format: 'narrative',
    angle: 'behavioral',
    prompt:
      'When a relationship feels threatened, what is the first thing you want to do, not what you actually do, but the impulse that arrives before you decide whether to follow it? And what is the thing you are most afraid of losing in that moment?',
    scoringNote:
      'Abandonment: impulse to pursue, reach out, confirm presence. Fears losing the person entirely. Shame: impulse to withdraw, deflect, perform normalcy. Fears being exposed as inadequate. Contempt: impulse to critique, distance, locate the flaw in the other. Fears dependency. Grief: impulse to withdraw quietly, pre-mourn. Fears this confirming that love does not hold. Rage: impulse to confront, assert, demand accountability. Fears powerlessness.'
  },

  // ---------- Differentiating abandonment vs shame ----------
  {
    id: 'q2_04',
    quadrant: 2,
    dimension: ['trigger_emotion'],
    format: 'narrative',
    angle: 'relational',
    prompt:
      'When someone you are dating goes quiet, a slow reply, a change in tone, a cancelled plan, what is the story your mind builds in the silence? Walk through it: what do you conclude first, and where does the story end up if you let it run without interrupting it?',
    scoringNote:
      'Critical differentiator. Abandonment: story ends with the person gone. Shame: story ends with being found out, found wanting, or found to be too much. Contempt: story reframes the other as not worth worrying about. Grief: story arrives at inevitable loss. Rage: story builds a case for having been wronged.'
  },
  {
    id: 'q2_05',
    quadrant: 2,
    dimension: ['trigger_emotion'],
    format: 'scaled',
    angle: 'emotional',
    prompt:
      'When a relationship feels uncertain, the emotion that arrives first feels more like losing someone than like being found out.',
    anchors: { low: 'It feels more like being exposed or judged', high: 'It feels more like someone disappearing' },
    scoringNote:
      'Low = shame. High = abandonment. Mid-range may indicate both are active; flag for confidence scoring.'
  },

  // ---------- Identifying contempt, grief, rage ----------
  {
    id: 'q2_06',
    quadrant: 2,
    dimension: ['trigger_emotion'],
    format: 'scaled',
    angle: 'behavioral',
    prompt:
      'When you feel hurt by a partner, your first internal response is closer to anger or a sense of injustice than to sadness or fear.',
    anchors: { low: 'Sadness or fear arrives first', high: 'Anger or a sense of unfairness arrives first' },
    scoringNote:
      'High = rage. Low combined with somatic heaviness = grief. Low combined with constriction/hiding = shame or abandonment.'
  },
  {
    id: 'q2_07',
    quadrant: 2,
    dimension: ['trigger_emotion'],
    format: 'narrative',
    angle: 'relational',
    prompt:
      'Think about a moment when a partner disappointed you in a way that felt significant. Not what they did, what happened to your perception of them in that moment. Did they become smaller in your mind? Did they become dangerous? Did they become someone who was already leaving? Or did the moment confirm something you had been quietly expecting?',
    scoringNote:
      'Became smaller = contempt. Became dangerous = rage or abandonment. Already leaving = abandonment. Quietly expected = grief. Answers involving self-reflection (what does this say about me) = shame.'
  },
  {
    id: 'q2_08',
    quadrant: 2,
    dimension: ['trigger_emotion'],
    format: 'narrative',
    angle: 'emotional',
    prompt:
      'Describe what intimacy feels like at its most difficult for you. Not conflict, closeness. The moment when someone is fully present and paying attention to you with no distraction. What arrives in you when that happens?',
    scoringNote:
      'Shame: discomfort with being seen, desire to redirect attention. Abandonment: brief relief followed by fear of losing this. Contempt: scanning for whether the person deserves this closeness. Grief: tenderness mixed with awareness of impermanence. Rage: vulnerability feels like exposure; may generate defensiveness.'
  },
  {
    id: 'q2_09',
    quadrant: 2,
    dimension: ['trigger_emotion'],
    format: 'scaled',
    angle: 'emotional',
    prompt:
      'When you love someone, you carry an awareness of losing them that is present even when things are going well.',
    anchors: { low: 'When things are good I am fully in the good', high: 'The awareness of losing them is always there underneath' },
    scoringNote:
      'High = grief. Moderate with somatic activation = abandonment. Low = contempt or rage (protection over vulnerability).'
  },
  {
    id: 'q2_10',
    quadrant: 2,
    dimension: ['trigger_emotion'],
    format: 'scaled',
    angle: 'behavioral',
    prompt:
      'When a partner fails to meet your standards in a way that matters, you find it difficult to stop noticing their other shortcomings.',
    anchors: { low: 'I can usually let one thing be one thing', high: 'One shortcoming opens the door to all the others' },
    scoringNote:
      'High = contempt. The cascade pattern (one failure revealing all failures) is characteristic of contempt as a defensive structure.'
  },

  // ---------- Partner feedback probe ----------
  {
    id: 'q2_11',
    quadrant: 2,
    dimension: ['trigger_emotion'],
    format: 'narrative',
    angle: 'relational',
    prompt:
      'What have partners consistently said about how you behave when things feel bad between you? Not what you think you do, what have you been told? If the same observation has come from more than one person, describe it.',
    scoringNote:
      'Partner observations are among the most diagnostically reliable signals. The content maps directly to trigger emotion. The repetition across partners confirms the pattern is structural rather than relational.'
  },

  // ---------- Gap question (Q2) ----------
  {
    id: 'q2_12',
    quadrant: 2,
    dimension: ['trigger_emotion'],
    format: 'narrative',
    angle: 'behavioral',
    prompt:
      'Describe a moment in a past relationship when you wanted to respond one way, the way you believe a healthy, secure person would respond, and found yourself doing something else entirely. What did you intend? What happened instead? And what was the emotion that was running faster than your intention?',
    scoringNote:
      'Gap question. The emotion named as "running faster" is often the trigger emotion stated directly. Tension between intention and action is itself a signal of how strongly the trigger operates.'
  },

  // ---------- Cross-angle confirmation ----------
  {
    id: 'q2_13',
    quadrant: 2,
    dimension: ['trigger_emotion'],
    format: 'scaled',
    angle: 'somatic',
    prompt:
      'When a relationship feels uncertain, you notice the physical sensation before you can name the emotion.',
    anchors: { low: 'I understand the emotion clearly before I feel it in my body', high: 'My body knows before my mind catches up' },
    scoringNote:
      'Confirms somatic primacy of trigger emotion. High scores suggest the trigger is deeply embedded and operates pre-reflectively.'
  },

  // ---------- Attachment-type-weighted refinement ----------
  {
    id: 'q2_14',
    quadrant: 2,
    dimension: ['trigger_emotion'],
    format: 'narrative',
    angle: 'emotional',
    prompt:
      'If you could guarantee that a partner would never leave, would the fear go away? Or is there something else underneath the fear that would remain even if departure were impossible?',
    scoringNote:
      'Critical differentiator for anxious presentations. Abandonment: yes, the fear would go away. Shame: no, the fear is about being seen, not about being left. Contempt: reframes, the issue is not their leaving but whether they deserve staying for. Grief: the fear is not about this person leaving but about love itself being temporary. Rage: the issue is not departure but control/fairness.'
  }
];


// ============================================================================
// QUADRANT THREE: DECISION ARCHITECTURE
// patterns: Intellectualization, Impulsive Action, Consensus Seeking,
//           Silence & Withdrawal, Catastrophic Forward Projection,
//           Dissociative Backward Anchoring
// Internal Axes: Direction (toward/away), Register (cognitive/behavioral/relational)
// ============================================================================

const QUADRANT_THREE_QUESTIONS = [
  // ---------- Decision mode identification ----------
  {
    id: 'q3_01',
    quadrant: 3,
    dimension: ['decision_mode', 'direction', 'register'],
    format: 'narrative',
    angle: 'behavioral',
    prompt:
      'Think about the last time you were in a new relationship and something felt off, not a dealbreaker, but a signal you could not quite read. What did you do in the hours after you noticed it? Walk through the sequence: the first thing, then the next thing, then what happened overnight.',
    scoringNote:
      'Intellectualization: researched, analyzed, built a framework. Impulsive action: texted, called, confronted, or made a decision. Consensus seeking: called a friend, replayed the conversation to someone else. Silence/withdrawal: went quiet, needed space, pulled inward. Catastrophic projection: mind went to the endpoint. Backward anchoring: compared to a past relationship.'
  },
  {
    id: 'q3_02',
    quadrant: 3,
    dimension: ['decision_mode'],
    format: 'narrative',
    angle: 'emotional',
    prompt:
      'When you cannot tell what someone you are dating is thinking or feeling, what happens to you internally? Not what you do, what is the experience of not knowing? Describe the texture of that uncertainty.',
    scoringNote:
      'The texture of the uncertainty reveals the mode. Intellectualization: the uncertainty feels like a problem to solve. Impulsive action: the uncertainty is physically intolerable. Consensus seeking: the uncertainty feels like unreliable self-perception. Silence: the uncertainty collapses the ability to locate the self. Projection: the uncertainty fills with a specific imagined outcome. Backward anchoring: the uncertainty triggers comparison to something known.'
  },
  {
    id: 'q3_03',
    quadrant: 3,
    dimension: ['decision_mode'],
    format: 'narrative',
    angle: 'behavioral',
    prompt:
      'Describe a time in a past relationship when you acted on something, sent a message, made a decision, said something, and immediately or soon after wished you had waited. What drove the action? What was happening in the gap between the feeling and the doing?',
    scoringNote:
      'Impulsive action: gap was very small or nonexistent. Intellectualization: acted on an analysis that felt certain. Consensus seeking: acted on advice that overrode own signal. Projection: acted on an imagined future. Backward anchoring: acted on a comparison. Silence: may report the opposite, wished they had said something.'
  },
  {
    id: 'q3_04',
    quadrant: 3,
    dimension: ['decision_mode', 'direction'],
    format: 'scaled',
    angle: 'behavioral',
    prompt:
      'When a relationship feels uncertain, you are more likely to move toward the other person than to pull away.',
    anchors: { low: 'I pull inward or away', high: 'I move toward them, to talk, to check, to resolve' },
    scoringNote:
      'Direction axis. High = toward (intellectualization, impulsive action, catastrophic projection). Low = away (consensus seeking, silence, backward anchoring).'
  },
  {
    id: 'q3_05',
    quadrant: 3,
    dimension: ['decision_mode', 'register'],
    format: 'scaled',
    angle: 'behavioral',
    prompt:
      'When you are trying to figure out what is happening in a relationship, you are more likely to think about it than to act on it.',
    anchors: { low: 'I act before I have finished thinking', high: 'I think extensively before I act, sometimes instead of acting' },
    scoringNote:
      'Register axis. High = cognitive register (intellectualization, catastrophic projection). Low = behavioral register (impulsive action, silence). Mid = relational register (consensus seeking, backward anchoring).'
  },

  // ---------- Specific mode identification ----------
  {
    id: 'q3_06',
    quadrant: 3,
    dimension: ['decision_mode'],
    format: 'scaled',
    angle: 'behavioral',
    prompt:
      'When something in a relationship feels uncertain, you find yourself calling or texting a friend to check your read on the situation before deciding what to do.',
    anchors: { low: 'I figure it out on my own', high: 'I need to hear someone else confirm what I am seeing' },
    scoringNote:
      'High = consensus seeking. The need for external validation of internal perception is the hallmark.'
  },
  {
    id: 'q3_07',
    quadrant: 3,
    dimension: ['decision_mode'],
    format: 'scaled',
    angle: 'emotional',
    prompt:
      'When a relationship feels ambiguous, your mind moves to how it will end rather than what is happening right now.',
    anchors: { low: 'I stay in the present situation', high: 'I am already at the ending in my mind' },
    scoringNote:
      'High = catastrophic forward projection. The temporal displacement toward a resolved (usually negative) endpoint.'
  },
  {
    id: 'q3_08',
    quadrant: 3,
    dimension: ['decision_mode'],
    format: 'scaled',
    angle: 'emotional',
    prompt:
      'When a current relationship hits difficulty, you find your mind going to a past relationship, comparing, remembering, or measuring this person against someone who came before.',
    anchors: { low: 'Past relationships stay in the past', high: 'A specific past relationship becomes very present in my mind' },
    scoringNote:
      'High = dissociative backward anchoring. The temporal displacement toward a past reference point.'
  },
  {
    id: 'q3_09',
    quadrant: 3,
    dimension: ['decision_mode'],
    format: 'narrative',
    angle: 'relational',
    prompt:
      'Think about a conflict in a past relationship where you went quiet, not as strategy, but because you genuinely could not access your own position in the presence of the other person\'s emotion. What was happening inside the silence? What were you trying to find in there?',
    scoringNote:
      'Silence/withdrawal: describes loss of self-access, needing to leave the field to locate own position. Other modes: may describe silence differently (shame withdrawal, strategic withdrawal, freezing).'
  },
  {
    id: 'q3_10',
    quadrant: 3,
    dimension: ['decision_mode'],
    format: 'narrative',
    angle: 'behavioral',
    prompt:
      'When a relationship produces a feeling you do not know what to do with, what is the thing you reach for to make the uncertainty bearable? A conversation with someone? An action that forces a resolution? An analysis that makes sense of it? Silence? Something else?',
    scoringNote:
      'Direct mapping: conversation = consensus seeking, action = impulsive action, analysis = intellectualization, silence = withdrawal, "something else" often reveals projection or backward anchoring.'
  },

  // ---------- Secondary mode and what happens under maximum load ----------
  {
    id: 'q3_11',
    quadrant: 3,
    dimension: ['decision_mode'],
    format: 'narrative',
    angle: 'behavioral',
    prompt:
      'When your usual way of handling relational uncertainty is not available to you, when you cannot analyze, cannot reach anyone, cannot act, cannot withdraw, what happens next? What is the backup system that runs when the primary one fails?',
    scoringNote:
      'Reveals secondary decision mode. The backup system is diagnostically important for the conflict section of the report.'
  },

  // ---------- Gap question (Q3) ----------
  {
    id: 'q3_12',
    quadrant: 3,
    dimension: ['decision_mode'],
    format: 'narrative',
    angle: 'relational',
    prompt:
      'Describe a high-stakes moment in a past relationship, the kind where what you did next would determine something important. Who did you intend to be in that moment? Who did you actually find yourself being? What was the distance between those two people, and what do you understand about that distance now?',
    scoringNote:
      'Gap question. The nature of the distance between intention and action reveals the decision mode. The quality of current understanding maps to awareness level (relevant for Q4 cross-quadrant scoring).'
  },

  // ---------- Partner feedback probe ----------
  {
    id: 'q3_13',
    quadrant: 3,
    dimension: ['decision_mode'],
    format: 'narrative',
    angle: 'relational',
    prompt:
      'What have partners said about how you handle conflict or uncertainty? Not how you think you handle it, what have you been told you do? If a pattern has been named by more than one person, describe it.',
    scoringNote:
      'Partner observations on decision mode are highly reliable. Repeated patterns across partners confirm structural mode rather than relational artifact.'
  },

  // ---------- Temporal orientation confirmation ----------
  {
    id: 'q3_14',
    quadrant: 3,
    dimension: ['decision_mode', 'direction'],
    format: 'scaled',
    angle: 'emotional',
    prompt:
      'When a relationship is under stress, you spend more time thinking about how it might end than about what happened in the past.',
    anchors: { low: 'I go to the past, what went wrong before', high: 'I go to the future, how this will end' },
    scoringNote:
      'High = catastrophic forward projection. Low = backward anchoring. Mid = present-oriented modes (intellectualization, impulsive action, consensus seeking, silence).'
  }
];


// ============================================================================
// QUADRANT FOUR: PERSONA IN PRACTICE
// Dynamic construction from persona code + metadata
// Universal Axes: Expression/Defense, Awareness/Automaticity, Amplification
// ============================================================================

/**
 * Constructs the Quadrant Four question set for a specific persona code.
 *
 * @param {string} personaCode - The four-letter RELATE persona code (e.g. 'ACEG')
 * @param {object} personaMetadata - The metadata object for this persona from
 *   relate_persona_definitions.js (M2_PERSONA_METADATA or W2_PERSONA_METADATA).
 *   Must contain: traits, datingBehavior, inRelationships, struggles,
 *   disappointments, howValued
 * @param {string} personaName - The persona name (e.g. 'The Gladiator')
 * @returns {Array} Array of question objects for Quadrant Four
 */
function buildQuadrantFourQuestions(personaCode, personaMetadata, personaName) {
  if (!personaMetadata) {
    throw new Error(`No persona metadata found for code: ${personaCode}`);
  }

  const {
    traits,
    datingBehavior,
    inRelationships,
    struggles,
    disappointments,
    howValued
  } = personaMetadata;

  // Extract the dimension names from the traits string for natural language use
  // traits format: "Fitness + Leadership + Adventure + Traditional"
  const dimensionNames = traits.split(' + ').map(d => d.trim());
  const socialDimension = dimensionNames[1] || 'social style';
  const lifestyleDimension = dimensionNames[2] || 'lifestyle orientation';

  // Select specific items from metadata arrays for question construction
  const primaryStruggle = struggles[0] || '';
  const secondaryStruggle = struggles[1] || '';
  const tertiaryStruggle = struggles[2] || '';
  const primaryDisappointment = disappointments[0] || '';
  const secondaryDisappointment = disappointments[1] || '';
  const primaryDatingBehavior = datingBehavior[0] || '';
  const secondaryDatingBehavior = datingBehavior[1] || '';
  const primaryInRelationship = inRelationships[0] || '';
  const secondaryInRelationship = inRelationships[1] || '';
  const primaryHowValued = howValued[0] || '';

  const questions = [
    // ---------- Axis One: Expression vs Defense ----------
    // Source: struggles field
    {
      id: `q4_01_${personaCode}`,
      quadrant: 4,
      dimension: ['expression_defense'],
      format: 'narrative',
      angle: 'relational',
      prompt:
        `Your RELATE results describe you as someone whose ${socialDimension.toLowerCase()} and ${lifestyleDimension.toLowerCase()} shape how you show up in relationships. Think about the last time those qualities were most visible in a dating context. Were you expressing something genuine about who you are, or were you reaching for those qualities because the situation required you to perform a version of yourself that felt safe?`,
      scoringNote:
        'Expression: describes genuine comfort and authenticity. Defense: describes reaching, performing, or deploying the persona under pressure. The distinction between "being" and "doing" is the key signal.'
    },
    {
      id: `q4_02_${personaCode}`,
      quadrant: 4,
      dimension: ['expression_defense'],
      format: 'narrative',
      angle: 'behavioral',
      prompt:
        `People who know you in relationships have likely experienced a version of you that looks like this: "${primaryStruggle.toLowerCase().replace(/;.*/, '')}." Does that land? If it does, describe a specific moment when that pattern was running. If it does not, describe what partners would say instead.`,
      scoringNote:
        'High defense: recognizes the struggle pattern and can describe it. Low defense: genuinely does not recognize it (or the partner feedback contradicts the metadata, which is itself informative). The specificity of the described moment maps to awareness.'
    },
    {
      id: `q4_03_${personaCode}`,
      quadrant: 4,
      dimension: ['expression_defense'],
      format: 'scaled',
      angle: 'emotional',
      prompt:
        `In relationships, the qualities your partners have valued most about you are also the ones that have cost the relationship the most.`,
      anchors: { low: 'My strengths in relationships are straightforwardly good', high: 'My greatest strength is also my most expensive habit' },
      scoringNote:
        'High = defensive register awareness. The recognition that the strength and the shadow are the same thing is diagnostic for defense level. Low = authentic expression or high automaticity (cannot see the cost).'
    },
    {
      id: `q4_04_${personaCode}`,
      quadrant: 4,
      dimension: ['expression_defense'],
      format: 'narrative',
      angle: 'relational',
      prompt:
        `Think about a moment in a relationship when "${secondaryStruggle.toLowerCase().replace(/;.*/, '')}" was active. Not the version of it that you managed well, the version that a partner saw before you could catch it. What did they experience, and what were you protecting?`,
      scoringNote:
        'Defense score: the ability to name what the pattern protects indicates defense awareness. Inability to identify the protected territory suggests high automaticity. Rich description of the partner experience confirms the shadow is active in relationships.'
    },

    // ---------- Axis Two: Awareness vs Automaticity ----------
    // Source: disappointments field
    {
      id: `q4_05_${personaCode}`,
      quadrant: 4,
      dimension: ['awareness_automaticity'],
      format: 'narrative',
      angle: 'relational',
      prompt:
        `A pattern that has shown up across your relationships: "${primaryDisappointment.toLowerCase()}." How many relationships did it take before you recognized this as your pattern rather than as something the other person caused? Or is this the first time you are hearing it described this way?`,
      scoringNote:
        'High awareness: recognized the pattern early, can describe the recognition moment. High automaticity: this framing is new, or the pattern is attributed to partner selection rather than to self. The transition from "they did this" to "I contribute to this" is the awareness marker.'
    },
    {
      id: `q4_06_${personaCode}`,
      quadrant: 4,
      dimension: ['awareness_automaticity'],
      format: 'scaled',
      angle: 'emotional',
      prompt:
        `You are aware that you have a specific way of showing up in relationships that is partly a choice and partly automatic, and you know which parts are which.`,
      anchors: { low: 'I am just being myself, I do not see separate parts', high: 'I can distinguish the chosen parts from the automatic parts clearly' },
      scoringNote:
        'Low = automaticity. High = awareness. The ability to parse the persona into chosen vs automatic components is the core awareness signal.'
    },
    {
      id: `q4_07_${personaCode}`,
      quadrant: 4,
      dimension: ['awareness_automaticity'],
      format: 'narrative',
      angle: 'relational',
      prompt:
        `If a partner told you: "${secondaryDisappointment.toLowerCase()}", would this be the first time you have heard something like that, or a version of something you have heard before? If you have heard it before, describe what you have done with that feedback.`,
      scoringNote:
        'High awareness: has heard it, has worked with it, can describe the effort. High automaticity: has heard it but does not recognize it as a pattern, or has not heard it. The treatment of partner feedback (dismissed, integrated, partially processed) maps directly to awareness level.'
    },
    {
      id: `q4_08_${personaCode}`,
      quadrant: 4,
      dimension: ['awareness_automaticity', 'expression_defense'],
      format: 'narrative',
      angle: 'emotional',
      prompt:
        `Describe the gap between who you intend to be as a partner and who you find yourself actually being when a relationship reaches a certain depth. If there is no gap, describe what it takes to maintain that consistency. If there is a gap, describe the moment when it opens.`,
      scoringNote:
        'Gap question for Q4. High awareness with high defense: can describe the gap precisely but cannot close it. High automaticity: reports no gap or describes the gap as caused by the partner. The moment when the gap opens is diagnostically rich for amplification scoring.'
    },

    // ---------- Axis Three: Dating-Specific Amplification ----------
    // Source: datingBehavior and inRelationships fields
    {
      id: `q4_09_${personaCode}`,
      quadrant: 4,
      dimension: ['amplification'],
      format: 'narrative',
      angle: 'behavioral',
      prompt:
        `Your results describe the way you show up early in dating as: "${primaryDatingBehavior.toLowerCase()}." Think about how that quality operates when a relationship is three weeks old versus six months old. Does it intensify, change character, or stay roughly the same? If it changes, describe what it becomes.`,
      scoringNote:
        'Low amplification: consistent across low and high stakes. High amplification: the quality intensifies, rigidifies, or becomes compulsive under attachment. The character of the change maps to the specific amplification pattern.'
    },
    {
      id: `q4_10_${personaCode}`,
      quadrant: 4,
      dimension: ['amplification'],
      format: 'scaled',
      angle: 'behavioral',
      prompt:
        `You show up differently in relationships that matter to you than in relationships where the stakes are low. The version of you that appears when you care deeply is more intense than the version people see at the beginning.`,
      anchors: { low: 'I am roughly the same person at all stages', high: 'When I care deeply, something in me amplifies significantly' },
      scoringNote:
        'Low = low amplification. High = high amplification. The intensity differential between casual and serious is the amplification signal.'
    },
    {
      id: `q4_11_${personaCode}`,
      quadrant: 4,
      dimension: ['amplification'],
      format: 'narrative',
      angle: 'relational',
      prompt:
        `Think about what partners have experienced from you at the six-month mark compared to the first month. In your relationships, your approach includes: "${secondaryDatingBehavior.toLowerCase()}." Has a partner ever expressed surprise or confusion about how you changed after they got closer? What did they say?`,
      scoringNote:
        'High amplification: partner named a change. Low amplification: no reported change or partners confirmed consistency. The content of the partner observation maps to the specific amplification pattern for this persona.'
    },
    {
      id: `q4_12_${personaCode}`,
      quadrant: 4,
      dimension: ['amplification'],
      format: 'narrative',
      angle: 'emotional',
      prompt:
        `In relationships, you "${primaryInRelationship.toLowerCase()}." When the relationship feels secure, this quality is likely a strength. Describe what happens to this same quality when the relationship feels uncertain or when you are afraid of losing the person. Does it hold steady, or does it become something with a different edge to it?`,
      scoringNote:
        'The transformation of a strength into its shadow under threat is the amplification mechanism. Stable = low amplification. "Different edge" = high amplification. The specific edge described maps to the persona defensive register.'
    },

    // ---------- Cross-axis interactions ----------
    {
      id: `q4_13_${personaCode}`,
      quadrant: 4,
      dimension: ['expression_defense', 'awareness_automaticity'],
      format: 'scaled',
      angle: 'relational',
      prompt:
        `You can see a pattern in how you behave in relationships, and you have not yet been able to change it despite understanding it.`,
      anchors: { low: 'I do not see a pattern, or I have changed the ones I have seen', high: 'I see it clearly and it still runs' },
      scoringNote:
        'High = high defense + high awareness (the gap between insight and behavior). Low can indicate either low defense (genuine change) or high automaticity (no pattern visible). Cross-reference with awareness axis to disambiguate.'
    },
    {
      id: `q4_14_${personaCode}`,
      quadrant: 4,
      dimension: ['expression_defense', 'amplification'],
      format: 'narrative',
      angle: 'behavioral',
      prompt:
        `Partners have valued you for: "${primaryHowValued.toLowerCase()}." Describe a moment when that exact quality, the thing partners value, became the thing that was hurting the relationship. If you cannot recall a moment like that, describe what it would look like if that quality went too far.`,
      scoringNote:
        'The strength-to-shadow flip under amplification. High defense + high amplification: can describe the moment precisely. Low defense + low amplification: the hypothetical version is abstract. The specificity of the described moment maps to both defense level and amplification intensity.'
    },

    // ---------- Partner feedback probe ----------
    {
      id: `q4_15_${personaCode}`,
      quadrant: 4,
      dimension: ['expression_defense', 'awareness_automaticity', 'amplification'],
      format: 'narrative',
      angle: 'relational',
      prompt:
        `What is the single piece of feedback from a past partner that you have carried the longest, the one that still sits with you, whether you agree with it or not? What did they say? And what have you done with it since?`,
      scoringNote:
        'Comprehensive probe across all three axes. Content maps to which axis is most active. Whether the feedback was integrated (awareness), dismissed (automaticity), or acknowledged but unchanged (defense + awareness). Duration of carrying it maps to defense rigidity.'
    },

    // ---------- Somatic confirmation ----------
    {
      id: `q4_16_${personaCode}`,
      quadrant: 4,
      dimension: ['expression_defense', 'amplification'],
      format: 'scaled',
      angle: 'somatic',
      prompt:
        `When someone you are dating gets too close to seeing something about you that you do not usually show, you feel a physical impulse to redirect, deflect, or change the subject.`,
      anchors: { low: 'Being seen deeply feels comfortable', high: 'There is a physical pull to redirect the attention away from that territory' },
      scoringNote:
        'High = defense is somatically active. The physical impulse to redirect is the body-level defense signal. Low = authentic expression (persona is not protecting against exposure).'
    }
  ];

  return questions;
}


// ============================================================================
// QUESTION ENGINE API
// ============================================================================

/**
 * Returns the full question bank for the Attachment assessment session.
 *
 * @param {object} params
 * @param {string} params.personaCode - Four-letter RELATE persona code
 * @param {object} params.personaMetadata - Persona metadata from relate_persona_definitions.js
 * @param {string} params.personaName - Persona name (e.g. 'The Gladiator')
 * @param {string} params.attachmentType - Attachment type from RELATE Session 3
 * @returns {object} { quadrant1, quadrant2, quadrant3, quadrant4, totalCount }
 */
function getAttachmentQuestions(params) {
  const { personaCode, personaMetadata, personaName, attachmentType } = params;

  const quadrant4 = buildQuadrantFourQuestions(personaCode, personaMetadata, personaName);

  return {
    quadrant1: QUADRANT_ONE_QUESTIONS,
    quadrant2: QUADRANT_TWO_QUESTIONS,
    quadrant3: QUADRANT_THREE_QUESTIONS,
    quadrant4: quadrant4,
    totalCount:
      QUADRANT_ONE_QUESTIONS.length +
      QUADRANT_TWO_QUESTIONS.length +
      QUADRANT_THREE_QUESTIONS.length +
      quadrant4.length,
    metadata: {
      personaCode,
      personaName,
      attachmentType,
      sessionType: 'attachment'
    }
  };
}


// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  QUADRANT_ONE_QUESTIONS,
  QUADRANT_TWO_QUESTIONS,
  QUADRANT_THREE_QUESTIONS,
  buildQuadrantFourQuestions,
  getAttachmentQuestions
};
