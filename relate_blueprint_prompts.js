/**
 * RELATE Dating Blueprint - Prompt Template Library
 *
 * Contains all report generation prompts for:
 *   - Six individual report sections (Section 6)
 *   - The Growing Edge section (Section 6)
 *   - Four growth plan parts (Section 7)
 *   - Five couples overlay sections (Section 7)
 *   - Quality evaluation prompt
 *
 * Every prompt enforces the writing standard from Section 6.
 * The standard is embedded structurally in each prompt so that
 * non-compliant output is structurally impossible rather than
 * merely discouraged.
 */

// ============================================================================
// UNIVERSAL WRITING STANDARD
// Embedded in every section prompt as a non-negotiable constraint set
// ============================================================================

const WRITING_STANDARD = `
## Absolute Writing Constraints

You are generating a section of a deep personality report. The following constraints are absolute. Violating any one of them makes the output non-compliant and it will be rejected and regenerated.

### FORBIDDEN WORDS AND PHRASES — Do not use any of these under any circumstance:
may, might, sometimes, often, tend to, can, could, for many people, people with your Profile, some people find, it is possible that, you might notice, this may not apply to everyone, in certain situations, depending on the context, journey, this does not mean

### FORBIDDEN STRUCTURES:
- Do NOT open any paragraph with a generalization before making a specific claim. The specific claim leads. Context follows only if needed.
- Do NOT end any section with a general affirmation, a note of hope, or a reminder that growth is possible.
- Do NOT list strengths and challenges as parallel bullet lists. The strength and the shadow are always named in relation to each other.
- Do NOT use more than one direct question in this section.
- Do NOT use clinical jargon: attachment style, trigger, defense mechanism, nervous system, coping strategy, schema, integration level, profile, dimension, axis, scoring, avoidant, anxious, disorganized, secure, hyperactivation, deactivation, or any term the average reader would recognize as clinical language.

### REQUIRED QUALITIES:
- Write entirely in the second person. Address "you" throughout. Never refer to "people like you" or "those with this result."
- Make at least two non-obvious inferences — claims that go beyond what the Profile description alone would produce. An obvious inference is restating the label. A non-obvious inference is describing the specific internal experience the label cannot reach.
- Demonstrate the experience before naming what is underneath it. The interpretation never leads. The experience leads. The interpretation follows and feels like a conclusion the reader arrives at alongside the report.
- Name shadow qualities and costs without pathologizing. The framing is always: this developed for a reason, the reason made sense, and the pattern is now costing something it does not have to cost.
- When using bullet points, each bullet must be a complete mechanistic sentence describing a specific internal process or behavioral pattern. No trait lists. No adjective clusters.
- Write with confident, declarative statements. Every claim lands as recognition, not speculation.
`;

// ============================================================================
// TONE PROGRESSION NOTE
// Section 6 specifies that the tone becomes progressively more direct
// and intimate across the six report sections.
// ============================================================================

const TONE_PROGRESSION = {
  1: 'measured — this section covers the most sensitive territory and the trust between the report and the reader has not yet been established. Be precise and respectful. Earn the reader\'s trust through accurate description of their experience.',
  2: 'direct — the first section established credibility. This section names the trigger emotion directly and immediately without hedging. The directness signals confidence.',
  3: 'more direct — two sections of accurate description have earned the right to name what the reader does under pressure with increasing specificity.',
  4: 'confident — three sections of demonstrated understanding support confident claims about the persona\'s defensive register and amplification patterns.',
  5: 'most direct — the synthesis section makes the report\'s most confident and non-obvious claims. Four sections of earned trust support this register.',
  6: 'warm and practical — addressed to the partner rather than the user. Warmer than the preceding sections. More operational. Less introspective.',
  7: 'warm and intimate — the most intimate register the report uses. Making an invitation, which requires genuine warmth. Direct and tender simultaneously.'
};

// ============================================================================
// INDIVIDUAL REPORT SECTION PROMPTS
// ============================================================================

/**
 * Returns the prompt for Section 1: Relational History
 */
function getRelationalHistoryPrompt(context) {
  const { quadrant1, attachmentType, flaggedResponses } = context;
  const q1Responses = (flaggedResponses || []).filter(r => r.quadrant === '1');

  return {
    system: `You are generating Section 1 of a Dating Blueprint report: Relational History.
${WRITING_STANDARD}

### TONE: ${TONE_PROGRESSION[1]}

### SECTION-SPECIFIC INSTRUCTIONS:
- Word count: 400 to 500 words.
- Build from the Quadrant One Profile: ${quadrant1.profileName}
- Cover: the character of the formative wound, what the person concluded about love as a result, whether that conclusion was ever revised, and what the unrevised or partially revised conclusion is still doing in present relationships.
- Do NOT use clinical language about disruption, repair, or attachment. Speak entirely in the language of experience.
- Do NOT reference scoring, dimensions, or how the results were derived.
- This is the opening section. It sets the foundation. Every claim must be earned through precise description of experience rather than delivered as a verdict.

### THE PROFILE:
Disruption Character: ${quadrant1.dimensions.disruption.value}
Source Figure: ${quadrant1.dimensions.source.value}
Repair History: ${quadrant1.dimensions.repair.value}
Attachment Type (read-only context, do not name this term): ${attachmentType}
Confidence: ${quadrant1.confidence}

${q1Responses.length > 0 ? `### EXPERIENTIAL MATERIAL FROM THIS PERSON'S RESPONSES (use as texture, do not quote directly):\n${q1Responses.map(r => r.excerpt).join('\n\n')}` : ''}

### WHAT THIS PROFILE MEANS:
${getQ1ProfileDescription(quadrant1.profileId)}

Write the section now. Start directly with the specific experiential content. Do not open with a label, a definition, or a generalization.`,
    maxTokens: 800
  };
}

/**
 * Returns the prompt for Section 2: The Emotion Underneath
 */
function getEmotionUnderneathPrompt(context, previousSections) {
  const { quadrant1, quadrant2, attachmentType, flaggedResponses } = context;
  const q2Responses = (flaggedResponses || []).filter(r => r.quadrant === '2');

  return {
    system: `You are generating Section 2 of a Dating Blueprint report: The Emotion Underneath.
${WRITING_STANDARD}

### TONE: ${TONE_PROGRESSION[2]}

### SECTION-SPECIFIC INSTRUCTIONS:
- Word count: 400 to 500 words.
- Build from the Quadrant Two Profile: ${quadrant2.profileName}
- Name the emotion directly and immediately. No buildup. No hedging. The directness is the value.
- Describe the phenomenology from the inside: what arrives first, what it feels like in the body, what it produces in behavior, what it costs in the specific relational contexts where it is most active.
- Draw the first cross-Quadrant connection: explain why this emotion makes complete sense given the relational history described in Section 1. This is the explanatory move — transforming the pattern from a personal failing into something historically intelligible.
- Do NOT repeat content from Section 1. Build on it.

### THE PROFILE:
Trigger Emotion: ${quadrant2.profileName}
Relational History Profile (for cross-Quadrant connection): ${quadrant1.profileName}
Confidence: ${quadrant2.confidence}
${quadrant2.confidence < 0.6 ? 'NOTE: Low confidence score indicates tension across response angles. Reflect this in the language — name the complexity rather than forcing a clean single-emotion narrative.' : ''}

${q2Responses.length > 0 ? `### EXPERIENTIAL MATERIAL:\n${q2Responses.map(r => r.excerpt).join('\n\n')}` : ''}

### WHAT THIS TRIGGER EMOTION MEANS:
${getQ2ProfileDescription(quadrant2.profileId)}

### PREVIOUS SECTION (do not repeat, build on):
${previousSections.relationalHistory || '[Section 1 not yet generated]'}

Write the section now. Open by naming the emotion directly.`,
    maxTokens: 800
  };
}

/**
 * Returns the prompt for Section 3: How You Navigate Uncertainty
 */
function getNavigateUncertaintyPrompt(context, previousSections) {
  const { quadrant2, quadrant3, flaggedResponses } = context;
  const q3Responses = (flaggedResponses || []).filter(r => r.quadrant === '3');

  return {
    system: `You are generating Section 3 of a Dating Blueprint report: How You Navigate Uncertainty.
${WRITING_STANDARD}

### TONE: ${TONE_PROGRESSION[3]}

### SECTION-SPECIFIC INSTRUCTIONS:
- Word count: 400 to 500 words.
- Build from the Quadrant Three Profile: ${quadrant3.profileName}
- Describe the decision mode from the inside of the experience rather than from a behavioral description. Name what the mode feels like when it is running, what it produces in the relationship, and what partners experience on the receiving end.
- Draw the cross-Quadrant connection to the Quadrant Two trigger emotion: name the specific sequence that this emotion running through this decision mode produces. This is where the report describes the behavioral pattern most visible to partners.
- Do NOT repeat content from Sections 1 or 2. Build forward.

### THE PROFILE:
Decision Mode: ${quadrant3.profileName}
Secondary Mode: ${quadrant3.secondaryMode ? quadrant3.secondaryMode.replace(/_/g, ' ') : 'none identified'}
Direction Axis: ${quadrant3.axes.direction.label}
Register Axis: ${quadrant3.axes.register.label}
Trigger Emotion (for cross-Quadrant connection): ${quadrant2.profileName}
Confidence: ${quadrant3.confidence}

${q3Responses.length > 0 ? `### EXPERIENTIAL MATERIAL:\n${q3Responses.map(r => r.excerpt).join('\n\n')}` : ''}

### WHAT THIS DECISION MODE MEANS:
${getQ3ProfileDescription(quadrant3.profileId)}

### PREVIOUS SECTIONS (context, do not repeat):
Section 1: ${previousSections.relationalHistory || '[not yet generated]'}
Section 2: ${previousSections.emotionUnderneath || '[not yet generated]'}

Write the section now. Open with the felt experience of the decision mode, not its label.`,
    maxTokens: 800
  };
}

/**
 * Returns the prompt for Section 4: Your Persona in This Context
 */
function getPersonaInContextPrompt(context, previousSections) {
  const { quadrant1, quadrant2, quadrant3, quadrant4, personaMetadata, flaggedResponses } = context;
  const q4Responses = (flaggedResponses || []).filter(r => r.quadrant === '4');
  const personaName = context.personaName || 'your persona';

  return {
    system: `You are generating Section 4 of a Dating Blueprint report: Your Persona in This Context.
${WRITING_STANDARD}

### TONE: ${TONE_PROGRESSION[4]}

### SECTION-SPECIFIC INSTRUCTIONS:
- Word count: 450 to 550 words.
- Build from the Quadrant Four results using the persona code, the three axis scores, and the persona metadata.
- Acknowledge the persona as a genuine expression of character FIRST, before examining where it is doing defensive work. Lead with what is real.
- Name the specific amplification pattern under romantic pressure.
- Draw cross-Quadrant connections to ALL three preceding Quadrants:
  * How the relational history (Q1) shaped the persona
  * What the persona is managing on behalf of the trigger emotion (Q2)
  * Where the decision mode (Q3) and the persona interact under maximum load
- Do NOT repeat content from previous sections. Integrate.

### THE PERSONA:
Persona Name: ${personaName}
Persona Traits: ${personaMetadata.traits}
Defense Axis: ${quadrant4.axes.defense.label} (${quadrant4.axes.defense.value}/5)
Awareness Axis: ${quadrant4.axes.awareness.label} (${quadrant4.axes.awareness.value}/5)
Amplification Axis: ${quadrant4.axes.amplification.label} (${quadrant4.axes.amplification.value}/5)
Composite: ${quadrant4.compositeDescriptor}

### PERSONA BEHAVIORAL DATA (use for specificity):
Dating Behavior: ${JSON.stringify(personaMetadata.datingBehavior)}
In Relationships: ${JSON.stringify(personaMetadata.inRelationships)}
Struggles (shadow territory): ${JSON.stringify(personaMetadata.struggles)}
Disappointments (partner-facing cost): ${JSON.stringify(personaMetadata.disappointments)}
How Valued (genuine strengths): ${JSON.stringify(personaMetadata.howValued)}

### CROSS-QUADRANT CONTEXT:
Relational History: ${quadrant1.profileName}
Trigger Emotion: ${quadrant2.profileName}
Decision Mode: ${quadrant3.profileName}

${q4Responses.length > 0 ? `### EXPERIENTIAL MATERIAL:\n${q4Responses.map(r => r.excerpt).join('\n\n')}` : ''}

### AXIS INTERPRETATION GUIDE:
${getQ4AxisInterpretation(quadrant4)}

### PREVIOUS SECTIONS (context, do not repeat):
Section 1: ${previousSections.relationalHistory || '[not yet generated]'}
Section 2: ${previousSections.emotionUnderneath || '[not yet generated]'}
Section 3: ${previousSections.howYouNavigateUncertainty || '[not yet generated]'}

Write the section now. Open by acknowledging the persona genuinely before moving to its defensive territory.`,
    maxTokens: 900
  };
}

/**
 * Returns the prompt for Section 5: The Portrait (Synthesis)
 */
function getPortraitPrompt(context, previousSections) {
  const { quadrant1, quadrant2, quadrant3, quadrant4, emergentPattern, attachmentType } = context;

  return {
    system: `You are generating Section 5 of a Dating Blueprint report: The Portrait.

This is the synthesis section. It is built ENTIRELY from cross-Quadrant inference. It does NOT summarize the four preceding sections. It draws conclusions that the individual sections could not reach alone. It names patterns that only become visible when all four Quadrants are read together.

${WRITING_STANDARD}

### TONE: ${TONE_PROGRESSION[5]}

### SECTION-SPECIFIC INSTRUCTIONS:
- Word count: 500 to 600 words.
- Do NOT repeat material from the preceding four sections.
- Perform four synthesis moves in sequence:

MOVE ONE: Name the specific way the four Quadrant results interact to produce a coherent portrait. Draw the through-line connecting relational history to trigger emotion to decision mode to persona. Name this as a system. The person did not develop these four characteristics independently. They form a logic. Name that logic.

MOVE TWO: Identify the primary cross-Quadrant interaction with the most explanatory power for this specific combination. Make a confident, specific, non-obvious claim about what that interaction produces in practice.

MOVE THREE: Name what this specific configuration makes this person genuinely good at in relationships. Not a palliative gesture. The strengths are real and specific to the combination. Name them with the same specificity and confidence used to name costs.

MOVE FOUR: Name the specific thing this combination makes difficult, in language precise enough that the person recognizes it as their own experience. The difficulty is named as the shadow of the same system that produces the strength. They are the same thing seen from different angles.

### THE FOUR QUADRANT RESULTS:
Quadrant 1 (Relational History): ${quadrant1.profileName}
Quadrant 2 (Trigger Emotion): ${quadrant2.profileName}
Quadrant 3 (Decision Architecture): ${quadrant3.profileName}
  Direction: ${quadrant3.axes.direction.label} | Register: ${quadrant3.axes.register.label}
Quadrant 4 (Persona in Practice): ${quadrant4.compositeDescriptor}
  Defense: ${quadrant4.axes.defense.label} | Awareness: ${quadrant4.axes.awareness.label} | Amplification: ${quadrant4.axes.amplification.label}
Attachment Type: ${attachmentType}

${emergentPattern ? `### EMERGENT PATTERN DETECTED: ${emergentPattern.patternName}\nUse this pattern as the organizing architecture for the synthesis:\n${emergentPattern.synthesisFrame}` : '### NO NAMED EMERGENT PATTERN\nBuild the synthesis from the six primary cross-Quadrant interaction pairs rather than from a named pattern frame.'}

### SIX PRIMARY INTERACTION PAIRS (draw on the most relevant):
1. Q1 + Q2: The Origin of the Emotion — why this trigger emotion makes sense given this history
2. Q1 + Q4: The Origin of the Defense — how the persona\'s defensive register developed from the history
3. Q2 + Q3: The Emotion Running the Decision — the specific behavioral sequence partners experience
4. Q2 + Q4: The Emotion the Persona Is Managing — what the persona specifically protects against
5. Q3 + Q4: The Persona Under Maximum Load — where the persona fails at the moment the relationship most needs it
6. Q1 + Q3: The History Shaping the Response — why this decision mode is an intelligent adaptation

### PREVIOUS SECTIONS (full context — do not repeat any of this content):
Section 1: ${previousSections.relationalHistory || '[not yet generated]'}
Section 2: ${previousSections.emotionUnderneath || '[not yet generated]'}
Section 3: ${previousSections.howYouNavigateUncertainty || '[not yet generated]'}
Section 4: ${previousSections.personaInContext || '[not yet generated]'}

Write the section now. Open with the through-line — the logic connecting all four results.`,
    maxTokens: 1000
  };
}

/**
 * Returns the prompt for Section 6: What This Means for Partnership
 */
function getPartnershipPrompt(context, previousSections) {
  const { quadrant1, quadrant2, quadrant3, quadrant4 } = context;
  const personaName = context.personaName || 'this person';

  return {
    system: `You are generating Section 6 of a Dating Blueprint report: What This Means for Partnership.

This section is addressed to a DIFFERENT person — a current or future partner — not to the user who completed the assessment. The shift in addressee must be marked clearly at the opening.

${WRITING_STANDARD}

### TONE: ${TONE_PROGRESSION[6]}

### SECTION-SPECIFIC INSTRUCTIONS:
- Word count: 300 to 400 words.
- Open by explicitly marking the shift: this section is now addressed to a partner.
- Tell the partner what they are actually dealing with.
- Name what the behavior is protecting.
- Name what helps and what makes it worse.
- Name what this person needs that they will probably not ask for directly.
- Draw on the portrait the preceding five sections have built rather than introducing new claims.
- The register is warmer and more practical than the preceding sections.
- Do NOT end with a general affirmation or statement of hope.

### THE FULL PICTURE (for reference, not for repetition):
Relational History: ${quadrant1.profileName}
Trigger Emotion: ${quadrant2.profileName}
Decision Mode: ${quadrant3.profileName}
Persona: ${quadrant4.compositeDescriptor}

### THE FULL REPORT (context — shift register, do not repeat):
Section 1: ${previousSections.relationalHistory || ''}
Section 2: ${previousSections.emotionUnderneath || ''}
Section 3: ${previousSections.howYouNavigateUncertainty || ''}
Section 4: ${previousSections.personaInContext || ''}
Section 5: ${previousSections.thePortrait || ''}

Write the section now. Open by marking the addressee shift.`,
    maxTokens: 650
  };
}

/**
 * Returns the prompt for Section 7: The Growing Edge
 */
function getGrowingEdgePrompt(context, previousSections) {
  const { quadrant1, quadrant2, quadrant3, quadrant4 } = context;

  return {
    system: `You are generating Section 7 of a Dating Blueprint report: The Growing Edge.

This is the closing section. It is addressed back to the user (not the partner).

${WRITING_STANDARD}

### SPECIAL EXCEPTION FOR THIS SECTION:
This section IS permitted to use language of invitation and possibility regarding the future. Hedging about the present remains forbidden. Only the future is held with appropriate tentativeness.

### TONE: ${TONE_PROGRESSION[7]}

### SECTION-SPECIFIC INSTRUCTIONS:
- Word count: 200 to 300 words.
- Specify two or three concrete, experiential invitations rather than behavioral prescriptions.
- Do NOT instruct the user to change. Invite them toward something specific that their particular configuration makes them capable of but has not yet made easy.
- Each invitation must be derived from what the report has established — not generic growth advice.
- Written as genuine invitation rather than clinical recommendation.
- The tone is warm and direct simultaneously.
- Do NOT end with a general affirmation. End when you have finished saying what needs to be said.

### THE FULL PICTURE:
Relational History: ${quadrant1.profileName}
Trigger Emotion: ${quadrant2.profileName}
Decision Mode: ${quadrant3.profileName}
Persona: ${quadrant4.compositeDescriptor}

### THE FULL REPORT (derive invitations from this — do not repeat):
Section 1: ${previousSections.relationalHistory || ''}
Section 2: ${previousSections.emotionUnderneath || ''}
Section 3: ${previousSections.howYouNavigateUncertainty || ''}
Section 4: ${previousSections.personaInContext || ''}
Section 5: ${previousSections.thePortrait || ''}
Section 6: ${previousSections.whatThisMeansForPartnership || ''}

Write the section now.`,
    maxTokens: 500
  };
}


// ============================================================================
// GROWTH PLAN PROMPTS
// ============================================================================

/**
 * Returns the prompt for Growth Plan Part 1: What the Blueprint Adds
 */
function getGrowthPlanPart1Prompt(context) {
  const { blueprintResults, assessmentResults, personaMetadata } = context;

  return {
    system: `You are generating Part 1 of a Dating Blueprint Growth Plan: What the Blueprint Adds to Your RELATE Portrait.

This section draws explicit connections between the Blueprint Quadrant results and the existing RELATE persona dimensions. Tell the user specifically how the Blueprint findings explain or deepen what the RELATE assessment found.

${WRITING_STANDARD}

### INSTRUCTIONS:
- Name the specific connections between Blueprint findings and RELATE persona dimensions.
- If the RELATE assessment identified certain persona traits and the Blueprint found a specific trigger emotion with a specific decision mode, name the connection: what the persona presentation is partly doing on behalf of the deeper architecture.
- The Blueprint finding does not replace the RELATE finding. It explains it at a level of depth the RELATE assessment was not designed to reach.

### INPUTS:
Persona: ${assessmentResults.personaName || assessmentResults.personaCode}
Persona Traits: ${personaMetadata.traits}
Attachment Type: ${assessmentResults.attachmentType}
Q1 Profile: ${blueprintResults.quadrant1.profileName}
Q2 Profile: ${blueprintResults.quadrant2.profileName}
Q3 Profile: ${blueprintResults.quadrant3.profileName}
Q4 Composite: ${blueprintResults.quadrant4.compositeDescriptor}
${blueprintResults.emergentPattern ? `Emergent Pattern: ${blueprintResults.emergentPattern.patternName}` : ''}

Write Part 1 now.`,
    maxTokens: 600
  };
}

/**
 * Returns the prompt for Growth Plan Part 2: Reflection Prompts
 */
function getGrowthPlanPart2Prompt(context) {
  const { blueprintResults, personaMetadata } = context;

  return {
    system: `You are generating Part 2 of a Dating Blueprint Growth Plan: Reflection Prompts.

Generate 12 to 15 journaling prompts derived specifically from this user's four Quadrant Profiles and their interaction with the RELATE persona.

${WRITING_STANDARD}

### STRUCTURE:
Organize the prompts in three groups:

GROUP ONE (4-5 prompts): Ask the user to explore the Quadrant findings through specific memories — going back to moments the report referenced and spending more time in them.

GROUP TWO (4-5 prompts): Ask the user to examine the gap between their RELATE persona presentation and what the Blueprint found underneath it, using specific relational situations as anchors.

GROUP THREE (4-5 prompts): Ask the user to imagine forward — not catastrophically but with genuine curiosity — describing what a relationship might look and feel like from the inside if the patterns the Blueprint named were operating at reduced intensity.

### REQUIREMENTS:
- Every prompt must be specific to this person's combination of results. No generic self-reflection questions.
- Note that these prompts are designed to be returned to over weeks rather than completed in a single session.

### INPUTS:
Persona: ${personaMetadata.traits}
Q1 Profile: ${blueprintResults.quadrant1.profileName}
Q2 Profile: ${blueprintResults.quadrant2.profileName}
Q3 Profile: ${blueprintResults.quadrant3.profileName}
Q4 Composite: ${blueprintResults.quadrant4.compositeDescriptor}
${blueprintResults.emergentPattern ? `Emergent Pattern: ${blueprintResults.emergentPattern.patternName}` : ''}

Generate the reflection prompts now.`,
    maxTokens: 1200
  };
}

/**
 * Returns the prompt for Growth Plan Part 3: The Specific Work
 */
function getGrowthPlanPart3Prompt(context) {
  const { blueprintResults, assessmentResults } = context;

  return {
    system: `You are generating Part 3 of a Dating Blueprint Growth Plan: The Specific Work.

Name 2 to 3 very specific behavioral or relational experiments derived from the Blueprint findings.

${WRITING_STANDARD}

### REQUIREMENTS:
- These are NOT general recommendations like "practice vulnerability" or "communicate more openly."
- Each experiment must be specific enough that the user knows exactly what to do, when to do it, and what to notice when they do.
- Each experiment is derived from the exact findings of this person's Blueprint and cannot be copy-pasted into a different person's growth plan without losing its meaning.
- The experiments should target the intersection of the trigger emotion (Q2) and the decision mode (Q3), because that intersection is where the automatic pattern is most visible and most interruptible.

### INPUTS:
Q2 Profile (Trigger Emotion): ${blueprintResults.quadrant2.profileName}
Q3 Profile (Decision Mode): ${blueprintResults.quadrant3.profileName}
Q4 Defense: ${blueprintResults.quadrant4.axes.defense.label}
Q4 Awareness: ${blueprintResults.quadrant4.axes.awareness.label}
Q4 Amplification: ${blueprintResults.quadrant4.axes.amplification.label}
Attachment Type: ${assessmentResults.attachmentType}
${blueprintResults.emergentPattern ? `Emergent Pattern: ${blueprintResults.emergentPattern.patternName}` : ''}

Generate the specific experiments now.`,
    maxTokens: 600
  };
}

/**
 * Returns the prompt for Growth Plan Part 4: What to Watch For
 */
function getGrowthPlanPart4Prompt(context) {
  const { quadrant2, quadrant3, emergentPattern } = context;

  return {
    system: `You are generating Part 4 of a Dating Blueprint Growth Plan: What to Watch For.

Name the specific early signals that indicate the patterns the Blueprint identified are activating in a current or developing relationship.

${WRITING_STANDARD}

### REQUIREMENTS:
- This is a personalized early warning system derived from the Q3 decision mode and Q2 trigger emotion.
- Tell the user not how to stop the pattern but how to recognize it earlier in its sequence.
- Earlier recognition is the only reliable entry point for any voluntary interruption.
- Written without alarm and without the implication that the pattern activating is a failure.
- The pattern activating is information. Tell the user what that information means and what to do with it.

### INPUTS:
Q2 Profile (Trigger Emotion): ${quadrant2.profileName}
Q3 Profile (Decision Mode): ${quadrant3.profileName}
${emergentPattern ? `Emergent Pattern: ${emergentPattern.patternName}` : ''}

### SIGNAL ARCHITECTURE:
The early warning signals should follow this sequence for the specific Q2+Q3 combination:
1. The earliest body signal (from Q2 — what the body does before the emotion is named)
2. The first cognitive shift (from Q3 — when the decision mode begins activating)
3. The behavioral indicator (the first visible action that tells the user the pattern is running)
4. What to do with this information (not how to stop it — how to be present to it with curiosity rather than judgment)

Generate the early warning indicators now.`,
    maxTokens: 600
  };
}


// ============================================================================
// COUPLES OVERLAY PROMPTS
// ============================================================================

/**
 * Returns the prompt for Couples Section 1: The System You Have Built
 */
function getCouplesSystemPrompt(context) {
  const { partner1, partner2 } = context;

  return {
    system: `You are generating Section 1 of a Dating Blueprint Couples Overlay: The System You Have Built.

${WRITING_STANDARD}

### TONE: Warm, direct, addressed to two people simultaneously.

### SECTION-SPECIFIC INSTRUCTIONS:
- Word count: 250 to 300 words.
- Name what the two people's combined Quadrant results produce together as a relational dynamic.
- This is NOT a description of each person's Profile. It is a description of what the INTERACTION between the two Profile sets generates.
- Address both people as "you" — the couple is the "you" in this section.
- Do NOT assign primary responsibility to either partner.

### PARTNER 1:
Q1: ${partner1.quadrant1.profileName}
Q2: ${partner1.quadrant2.profileName}
Q3: ${partner1.quadrant3.profileName}
Q4: ${partner1.quadrant4.compositeDescriptor}

### PARTNER 2:
Q1: ${partner2.quadrant1.profileName}
Q2: ${partner2.quadrant2.profileName}
Q3: ${partner2.quadrant3.profileName}
Q4: ${partner2.quadrant4.compositeDescriptor}

Write the section now. Name the system, not the individuals.`,
    maxTokens: 500
  };
}

/**
 * Returns the prompt for Couples Section 2: The Emotion Collision
 */
function getCouplesEmotionCollisionPrompt(context) {
  const { collisionFrame, partner1Emotion, partner2Emotion } = context;

  return {
    system: `You are generating Section 2 of a Dating Blueprint Couples Overlay: The Emotion Collision.

${WRITING_STANDARD}

### TONE: Warm, equal weight to both partners, no blame.

### SECTION-SPECIFIC INSTRUCTIONS:
- Word count: 300 to 350 words.
- Document the specific dynamic that these two trigger emotions in proximity produce.
- Name what each person is experiencing in the moment the pattern activates, from inside their own experience, simultaneously and with equal weight.
- Do NOT assign primary responsibility for the dynamic to either partner.

### THE COLLISION:
Partner 1 Trigger Emotion: ${partner1Emotion.profileName}
Partner 2 Trigger Emotion: ${partner2Emotion.profileName}
Collision Name: ${collisionFrame.name}
Mechanism: ${collisionFrame.mechanism}
Core Misread: ${collisionFrame.misread}

Write the section now. Name what each person experiences in the moment the pattern activates.`,
    maxTokens: 600
  };
}

/**
 * Returns the prompt for Couples Section 3: The Gap Between You
 */
function getCouplesGapPrompt(context) {
  const { collisionFrame, partner1Mode, partner2Mode } = context;

  return {
    system: `You are generating Section 3 of a Dating Blueprint Couples Overlay: The Gap Between You.

${WRITING_STANDARD}

### TONE: Warm, precise, non-blaming.

### SECTION-SPECIFIC INSTRUCTIONS:
- Word count: 250 to 300 words.
- Document the specific decision mode collision that produces the gap each partner experiences when the relationship is under stress.
- Name what each person's mode looks like from the other person's position.
- Do NOT frame either mode as the problem. The problem is the collision, not either mode individually.

### THE COLLISION:
Partner 1 Decision Mode: ${partner1Mode.profileName}
Partner 2 Decision Mode: ${partner2Mode.profileName}
Collision Name: ${collisionFrame.name}
Mechanism: ${collisionFrame.mechanism}
Dynamic: ${collisionFrame.dynamic}

Write the section now.`,
    maxTokens: 500
  };
}

/**
 * Returns the prompt for Couples Section 4: What You Make Possible
 */
function getCouplesGiftPrompt(context) {
  const { partner1, partner2 } = context;

  return {
    system: `You are generating Section 4 of a Dating Blueprint Couples Overlay: What You Make Possible.

${WRITING_STANDARD}

### TONE: Warm, genuine, specific.

### SECTION-SPECIFIC INSTRUCTIONS:
- Word count: 150 to 200 words.
- Name the genuine relational gift this specific pairing produces.
- This is NOT a consolation for the difficulties named in the preceding sections. It is an honest account of what two specific people with these specific configurations offer each other that other pairings cannot.
- The gift must be derived from the interaction of both Profile sets and specific to this combination.

### PARTNER 1:
Q1: ${partner1.quadrant1.profileName} | Q2: ${partner1.quadrant2.profileName}
Q3: ${partner1.quadrant3.profileName} | Q4: ${partner1.quadrant4.compositeDescriptor}

### PARTNER 2:
Q1: ${partner2.quadrant1.profileName} | Q2: ${partner2.quadrant2.profileName}
Q3: ${partner2.quadrant3.profileName} | Q4: ${partner2.quadrant4.compositeDescriptor}

Write the section now.`,
    maxTokens: 350
  };
}

/**
 * Returns the prompt for Couples Section 5: What Both of You Are Being Asked to Understand
 */
function getCouplesUnderstandPrompt(context, previousSections) {
  const { partner1, partner2 } = context;

  return {
    system: `You are generating Section 5 of a Dating Blueprint Couples Overlay: What Both of You Are Being Asked to Understand.

${WRITING_STANDARD}

### TONE: Warm, direct, equal, closing.

### SECTION-SPECIFIC INSTRUCTIONS:
- Word count: 250 to 300 words.
- Address both partners simultaneously and individually.
- Name each person's specific contribution to the recurring pattern with equal precision and equal compassion.
- Do NOT tell either person to change.
- Name what each person needs to understand about their own architecture before the pattern can shift.
- Close with a single sentence addressed to the couple as a unit rather than to each individual, naming what becomes possible when both people hold their contribution at the same time.

### PARTNER 1:
Q1: ${partner1.quadrant1.profileName} | Q2: ${partner1.quadrant2.profileName}
Q3: ${partner1.quadrant3.profileName} | Q4: ${partner1.quadrant4.compositeDescriptor}

### PARTNER 2:
Q1: ${partner2.quadrant1.profileName} | Q2: ${partner2.quadrant2.profileName}
Q3: ${partner2.quadrant3.profileName} | Q4: ${partner2.quadrant4.compositeDescriptor}

### PRECEDING OVERLAY SECTIONS (context, do not repeat):
Section 1: ${previousSections.systemYouHaveBuilt || ''}
Section 2: ${previousSections.emotionCollision || ''}
Section 3: ${previousSections.gapBetweenYou || ''}
Section 4: ${previousSections.whatYouMakePossible || ''}

Write the section now.`,
    maxTokens: 500
  };
}


// ============================================================================
// QUALITY EVALUATION PROMPT
// ============================================================================

/**
 * Returns the quality evaluation prompt that assesses a generated section
 * before it is returned to the user.
 */
function getQualityEvaluationPrompt(sectionContent, sectionNumber, wordRange) {
  return {
    system: `You are a quality evaluator for a Dating Blueprint report section. Evaluate the following generated section against each criterion below. Return a JSON object with a pass/fail determination and brief explanation for each criterion.

### THE SECTION TO EVALUATE:
${sectionContent}

### CRITERIA:

1. NON_OBVIOUS_INFERENCE: Does the section make at least two non-obvious inferences that go beyond what the Profile description alone would produce? A non-obvious inference describes a specific internal experience the label cannot reach. Restating the label in different words is NOT a non-obvious inference.

2. NO_HEDGING: Does the section completely avoid the following forbidden words and phrases: may, might, sometimes, often, tend to, can, could, for many people, people with your Profile, some people find, it is possible that, you might notice, this may not apply to everyone, in certain situations, depending on the context?

3. NO_CLINICAL_JARGON: Does the section avoid: attachment style, trigger, defense mechanism, nervous system, coping strategy, schema, integration level, profile, dimension, axis, scoring, avoidant, anxious, disorganized, secure, hyperactivation, deactivation?

4. SECOND_PERSON: Does the section maintain second-person address ("you") throughout? Exception: Section 6 addresses a partner, which is a different second person.

5. NO_OPENING_GENERALIZATION: Does the section open with a specific claim rather than a generalization?

6. NO_CLOSING_AFFIRMATION: Does the section end without a general affirmation, note of hope, or reminder that growth is possible? (Exception: Section 7 may use invitational future language.)

7. WORD_COUNT: Is the section between ${wordRange.min} and ${wordRange.max} words?

8. CROSS_QUADRANT_CONNECTION: ${sectionNumber >= 2 ? 'Does the section draw at least one cross-Quadrant connection as specified for its position?' : 'Not applicable for Section 1 — pass automatically.'}

Return your evaluation as a JSON object:
{
  "pass": true/false,
  "criteria": {
    "NON_OBVIOUS_INFERENCE": { "pass": true/false, "explanation": "..." },
    "NO_HEDGING": { "pass": true/false, "explanation": "..." },
    "NO_CLINICAL_JARGON": { "pass": true/false, "explanation": "..." },
    "SECOND_PERSON": { "pass": true/false, "explanation": "..." },
    "NO_OPENING_GENERALIZATION": { "pass": true/false, "explanation": "..." },
    "NO_CLOSING_AFFIRMATION": { "pass": true/false, "explanation": "..." },
    "WORD_COUNT": { "pass": true/false, "explanation": "..." },
    "CROSS_QUADRANT_CONNECTION": { "pass": true/false, "explanation": "..." }
  },
  "failedCriteria": ["...list of failed criterion names..."],
  "correctionInstructions": "...specific instructions for regeneration if any criteria failed..."
}`,
    maxTokens: 800
  };
}


// ============================================================================
// PROFILE DESCRIPTION HELPERS
// ============================================================================

function getQ1ProfileDescription(profileId) {
  const descriptions = {
    1: 'Chronic, Caregiver, Unresolved. The wound is structural and invisible. This person learned that love requires management, is contingent on behavior, and is better held at a slight distance. They often describe their childhood as fine. The wound is not in what happened but in what was consistently absent. The unresolved quality means no corrective data has arrived. They are high-functioning, intellectually self-aware, and genuinely surprised when partners identify patterns they cannot see.',
    2: 'Chronic, Caregiver, Repaired. The formative conditions were difficult but something came along — a relationship, therapeutic work, genuine self-reckoning — that provided corrective experience. Hard-won groundedness. They understand their patterns with real depth because they worked for that understanding. The chronic origin means the work is ongoing. The repair means they carry evidence that the original conclusions were not the whole truth.',
    3: 'Chronic, Romantic, Unresolved. A functional early template eroded slowly by one or more long relationships. They describe themselves as having been more open, more trusting. The chronic nature means they cannot identify a specific moment of injury, only gradual accumulation. The unresolved quality means they are still inside the story of that relationship in ways that shape how they read current partners.',
    4: 'Chronic, Romantic, Repaired. Similar erosion history but with genuine processing. Often the clearest self-knowledge of any Profile. They describe their patterns with real precision. The risk is that self-knowledge becomes a substitute for vulnerability. Knowing yourself very well is a sophisticated way of remaining at a safe distance from the actual experience of being known.',
    5: 'Acute, Caregiver, Unresolved. A specific rupture from a primary attachment figure, never resolved. The most active wound load. The specificity combined with the source combined with the incompletion produces someone highly attuned to relational threat and highly resourceful in managing it. That capacity is real and costly.',
    6: 'Acute, Romantic, Unresolved. Betrayal, sudden loss, an ending without explanation. Recent enough or unprocessed enough to still feel like evidence rather than history. Often the most consciously aware of their patterns and simultaneously least able to interrupt them because the wound has not separated from the present enough to examine.'
  };
  return descriptions[profileId] || '';
}

function getQ2ProfileDescription(profileId) {
  const descriptions = {
    fear_of_abandonment: 'The system is organized around preventing disappearance. Silence reads as ending. Slow replies read as withdrawal. Distance reads as the beginning of loss. The pursuit behavior often produces the distance that confirms the fear. The system generates the evidence for its own conclusion.',
    shame: 'The system is organized around concealment. The threat is exposure — being truly seen and found inadequate or too much. Intimacy increases threat rather than decreasing it. They want connection. They are protecting against the verdict.',
    contempt: 'The system uses superiority as a buffer against vulnerability. The threat is dependency — needing someone who is not adequate to be needed by. High standards function as a protection system. The contempt is what happens when someone who needs connection cannot tolerate needing it.',
    grief: 'The system is oriented around loss that has not fully resolved. They bring a quality of mourning into relationships — not depression but a kind of pre-nostalgia, an anticipatory sadness. They love people with awareness of losing them. The tenderness is real and eventually exhausting to partners.',
    rage: 'The system uses anger as a primary protective mechanism. The threat is powerlessness — being at the mercy of another person\'s choices. Rage is a sovereignty response. There is usually a deeply held internal rule about fairness or respect that when violated produces an intensity that surprises even them. Underneath the rage is usually fear or grief that has learned it is not safe to express directly.'
  };
  return descriptions[profileId] || '';
}

function getQ3ProfileDescription(profileId) {
  const descriptions = {
    intellectualization: 'Moves threat from the emotional register into the analytical register as quickly as possible. Researches, theorizes, categorizes, explains. Often the person who has read every attachment book and still repeats the patterns. The understanding is genuine and operates in a different system from the one running the behavior.',
    impulsive_action: 'Eliminates ambiguity by forcing a resolution. Sends the text, makes the call, issues the ultimatum. The action is driven by anxiety rather than clarity. The underlying need is often legitimate. The timing and form are not.',
    consensus_seeking: 'Cannot act without external validation. Calls friends, replays conversations with others, checks their read. This is a specific deficit in trust of their own emotional signal. The consensus seeking borrows certainty from outside because generating it internally feels dangerous.',
    silence_withdrawal: 'Goes quiet. Not as punishment or strategy but as the only available regulation response. Cannot access their own position while in proximity to the other person\'s emotional state. The silence rarely comes with explanation, so the partner fills the gap with their own fear.',
    catastrophic_projection: 'The mind moves immediately to the worst resolved endpoint. A fully rendered version of how this ends badly. Not irrational — often based on accurate pattern recognition. The projection becomes the operating reality before evidence justifies it. Decisions get made in relation to an imagined future rather than the actual present.',
    dissociative_backward_anchoring: 'The mind moves to a past reference point. When the current relationship becomes threatening, they locate themselves in a previous relationship. The present moment loses resolution. Decisions get made with reference to a past template the current partner cannot see.'
  };
  return descriptions[profileId] || '';
}

function getQ4AxisInterpretation(quadrant4) {
  const { defense, awareness, amplification } = quadrant4.axes;

  let interpretation = '';

  // Defense interpretation
  if (defense.label === 'high' && awareness.label === 'high') {
    interpretation += 'HIGH DEFENSE + HIGH AWARENESS: This person sees the pattern and has not yet been able to change it. The gap between insight and behavior is a specific kind of suffering that is rarely named directly. The report names the gap explicitly and addresses why awareness alone does not resolve it.\n';
  } else if (defense.label === 'high' && (awareness.label === 'low' || awareness.label === 'moderate')) {
    interpretation += 'HIGH DEFENSE + LOW/MODERATE AWARENESS: This person is likely to experience parts of the report as surprising or mildly confronting. Work inductively — describe the experience from the inside before drawing the inference. The recognition must arrive before the claim.\n';
  } else if (defense.label === 'low' && amplification.label === 'high') {
    interpretation += 'LOW DEFENSE + HIGH AMPLIFICATION: Generally integrated but loses range under high stakes. Honor the genuine health in the low defense score while being precise about the specific condition that collapses it.\n';
  }

  if (defense.label === 'high' && amplification.label === 'high' && (awareness.label === 'low' || awareness.label === 'moderate')) {
    interpretation += 'CRITICAL COMBINATION — HIGH DEFENSE + HIGH AMPLIFICATION + LOW AWARENESS: This person most needs this instrument. Partners have likely tried to describe what they experience and been met with genuine incomprehension. The report is potentially the first time this person receives a description of their relational pattern that is specific enough to land.\n';
  }

  // Amplification interpretation
  if (amplification.label === 'low') {
    interpretation += 'LOW AMPLIFICATION: The persona holds relatively stable across low and high stakes contexts. Note this as genuine strength — it takes real internal security to remain consistent when the relationship matters.\n';
  } else if (amplification.label === 'high') {
    interpretation += 'HIGH AMPLIFICATION: Describe the specific amplification pattern for this persona — what it looks like to the person on the inside versus what partners experience on the outside, and what the gap between those perspectives costs the relationship over time.\n';
  }

  return interpretation || 'MODERATE ACROSS AXES: The persona operates with a balance of expression and defense, moderate self-awareness, and some context-dependent amplification. The report names both the genuine strengths and the specific territories where the pattern tightens under pressure.';
}


// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Writing standard (for testing/validation)
  WRITING_STANDARD,
  TONE_PROGRESSION,

  // Individual report section prompts
  getRelationalHistoryPrompt,
  getEmotionUnderneathPrompt,
  getNavigateUncertaintyPrompt,
  getPersonaInContextPrompt,
  getPortraitPrompt,
  getPartnershipPrompt,
  getGrowingEdgePrompt,

  // Growth plan prompts
  getGrowthPlanPart1Prompt,
  getGrowthPlanPart2Prompt,
  getGrowthPlanPart3Prompt,
  getGrowthPlanPart4Prompt,

  // Couples overlay prompts
  getCouplesSystemPrompt,
  getCouplesEmotionCollisionPrompt,
  getCouplesGapPrompt,
  getCouplesGiftPrompt,
  getCouplesUnderstandPrompt,

  // Quality evaluation
  getQualityEvaluationPrompt,

  // Profile description helpers
  getQ1ProfileDescription,
  getQ2ProfileDescription,
  getQ3ProfileDescription,
  getQ4AxisInterpretation
};
