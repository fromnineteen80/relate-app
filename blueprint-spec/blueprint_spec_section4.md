# RELATE DATING BLUEPRINT
## Technical and Clinical Specification
### Section 4: The Question Engine Specification

---

## The Function of the Question Engine

The question engine does two things simultaneously. It generates the data needed to score the four Quadrants and route the user to their Profiles. And it generates the raw experiential material the report generation engine draws on to make the narrative feel personal rather than categorical.

These two functions are not separate. The same question that produces a scoring signal also produces a fragment of lived experience that the report can reflect back. A question that asks the user to describe what happened in their body the last time someone they were dating went quiet does not just measure trigger emotion. It gives the report generation engine a texture, a specific kind of fear or numbness or controlled calm, that the report can use to demonstrate it understands this person's interior before it names what is underneath. The question engine is therefore not just a scoring instrument. It is the first act of the report.

This dual function has a direct implication for question design. Every question must be worth asking on both dimensions. A question that produces a clean scoring signal but no experiential material is a clinical survey question and does not belong in the Blueprint. A question that produces rich experiential material but no scoring signal is a journaling prompt and does not belong either. Every question earns its place by doing both.

---

## The Dynamic Structure: How RELATE Results Shape the Question Engine

This is the architectural feature that distinguishes the Blueprint question engine from a static assessment instrument. The question engine is not the same for every user. It is personalized before the first question is asked, because every user arrives with two fixed inputs from the RELATE assessment that change what the Blueprint needs to ask and how it needs to ask it.

**Fixed Input One: Attachment Type**

The user's attachment type is known before the Blueprint begins. This matters to the question engine in two specific ways.

First, certain Quadrant One questions can be refined based on attachment type. An Anchored attachment type arriving at Quadrant One questions about disruption character and repair history needs different question framing than an Oscillating type arriving at the same territory. The Anchored user's disruption is more likely to be subtle and harder to name. The Oscillating user's disruption is more likely to be visible but inconsistently processed. The question engine uses attachment type to weight which experiential anchors it emphasizes, which specific memories it asks the user to access, and which follow-up probes it deploys when a response is ambiguous.

Second, attachment type determines the ceiling of what Quadrant Two needs to establish. If the existing RELATE assessment has already produced a strong anxiety signal, the Quadrant Two questions can move more quickly to differentiating between the specific trigger emotions that produce anxious behavior, rather than spending questions confirming that anxiety is present. The scoring efficiency gained here means more questions can be directed toward the experiential texture that makes the report specific.

**Fixed Input Two: The RELATE Persona Code**

The four-letter persona code is the more structurally significant of the two fixed inputs because it directly determines the architecture of Quadrant Four.

Quadrant Four does not ask universal questions and then interpret them through a persona lens after the fact. It asks persona-specific questions from the beginning. The question engine receives the persona code, retrieves the relevant persona metadata from the relate_persona_definitions.js reference data, and constructs the Quadrant Four question set dynamically from three sources.

The first source is the persona's struggles field. These are the shadow expressions of the persona, the places where the authentic register tips into the defensive register. The question engine uses these as the target territory for Axis One questions, asking about situations where the user has experienced or been told about the specific patterns listed in the struggles field, without naming those patterns directly.

The second source is the persona's disappointments field. These describe the moments when the persona's relational strategy fails, when partners reach a limit, when the cost of the persona becomes visible. The question engine uses these as the target territory for Axis Two questions, asking about what partners have said, what criticism tends to repeat across relationships, and what the user has come to understand about how they are experienced from the outside.

The third source is the persona's dating-specific behavioral metadata. The datingBehavior and inRelationships fields describe how the persona operates in the specific context the Blueprint is measuring. The question engine uses these as reference points for Axis Three questions, asking about whether the user recognizes the described behaviors in themselves equally across casual and serious relationships or whether something changes when the stakes rise.

This means a user who arrives with the ACEG persona code receives a materially different set of Quadrant Four questions than a user who arrives with the BDFH persona code. The scoring axes are universal. The questions that measure them are specific to the persona. This is the dynamic structure. The axes are the constant. The persona is the variable that shapes how the axes are probed.

The question engine must therefore be built to accept the persona code as a parameter at runtime and construct the Quadrant Four question set accordingly rather than serving a fixed question bank. The 32 persona codes require 32 distinct Quadrant Four question configurations, though in practice the configurations share significant structural overlap and differ primarily in the specific behavioral content referenced in the questions rather than in the question architecture itself.

---

## The Indirect Inference Principle

The question engine never asks the diagnostic question directly. This is the foundational design rule from which all other question design principles follow.

The diagnostic question for Quadrant One is: was your primary attachment disruption chronic or acute, did it originate with a caregiver or a romantic partner, and was it ever repaired? No user can answer that question accurately through direct inquiry. The categories are not intuitive, the self-report is subject to motivated reasoning, and the most important answers, particularly around repair history, are often the ones the user has the most investment in misrepresenting to themselves.

The diagnostic question for Quadrant Two is: what is the primary emotion underneath your attachment behavior when threat activates? Direct inquiry produces answers shaped by what the user wants to be true about themselves rather than what is actually running the behavior. A person whose trigger emotion is contempt will rarely identify contempt as their primary emotional driver. They will report something more sympathetic, usually fear or grief, because contempt is harder to claim.

The diagnostic question for Quadrant Three is: what is your default decision mode under relational ambiguity? Direct inquiry here produces the mode the person uses consciously, which is often different from the mode that runs automatically. The person who intellectualizes will describe themselves as thoughtful and analytical. The person who catastrophizes forward will describe themselves as someone who thinks ahead. These are not inaccurate self-descriptions. They are accurate descriptions of the conscious experience of patterns that are actually doing something else underneath.

The diagnostic question for Quadrant Four is: how rigidly are you identified with your persona, how aware are you of its defensive register, and where does romantic activation amplify it beyond its healthy range? No one answers this accurately from direct inquiry because the persona is experienced as identity rather than as behavior, and identity is not something people assess with clinical detachment.

The question engine therefore approaches all four Quadrants through experiential and narrative questions that produce the scoring signal indirectly. The user is never positioned as a subject being measured. They are positioned as a person being invited to reflect on their own experience with genuine specificity. The scoring happens invisibly, derived from the pattern of responses rather than from any single answer.

---

## Question Design Principles

**Experiential Anchoring**

Every question is anchored in a specific experiential moment rather than a general behavioral pattern. The question does not ask what the user generally does when a partner goes quiet. It asks about the last time a person they were dating went quiet, what happened in their body, what thought came first, and what they did next. The specificity of the temporal anchor, the last time, a specific relationship, a particular kind of moment, produces more diagnostically accurate responses than general self-report because it bypasses the user's self-concept and accesses the actual memory of the experience.

**Body Before Behavior**

Where possible, questions ask about somatic experience before they ask about action. What happened in your body. Where did you feel it. What did the feeling want you to do. This sequence matters because the body carries the trigger emotion before the behavior follows from it, and asking about the body first produces responses that are less filtered through self-justification than asking about behavior directly.

**Past Tense Over Present Tense**

Questions about past relationships and past moments produce more accurate responses than questions about current states or general tendencies. The user has more distance from past experiences and therefore more access to what actually happened rather than what they want to believe happened. The Blueprint uses present tense only for questions about the user's current understanding of themselves, not for questions designed to produce scoring signals.

**Repetition Across Angles**

The same underlying construct is approached from multiple angles across the question bank. Behavioral, emotional, relational, and somatic questions all probe the same diagnostic territory from different entry points. This is intentional and serves two functions. First, consistency across angles confirms the scoring signal. Second, and more importantly, tension between angles is itself diagnostically significant. A user who describes calm, measured responses to relational threat on a behavioral question and then describes a racing heart and an overwhelming urge to act on a somatic question is telling the question engine something important about the gap between their self-concept and their actual experience. That gap is some of the most valuable material the report can work with.

**Family of Origin Without Trauma Language**

Quadrant One questions access the user's early relational environment without using clinical or therapeutic language that might trigger defensiveness or produce overly rehearsed responses. The questions do not ask about trauma, attachment, or wounds. They ask about emotional climate, about how affection was expressed or withheld in the household, about what happened when someone in the family was upset, about whether the user remembers feeling certain of their place or uncertain of it, about the relationship between their parents or caregivers and what it modeled about love. The diagnostic inferences are drawn from those answers by the scoring engine, not from the user's self-assessment of their own history.

**Partner Feedback as a Diagnostic Source**

Questions about what partners have said, what criticism tends to repeat across relationships, and what the user has been told they do in conflict are among the most diagnostically reliable in the entire bank. Partners often have more accurate perception of the user's defensive patterns than the user does, and asking the user to report what partners have said accesses that perception indirectly without requiring the user to validate it. The user can report what a partner said without agreeing with it. The scoring engine treats the content of the partner feedback as significant regardless of whether the user endorsed it.

**The Gap Question**

Each Quadrant includes at least one question that specifically asks about the gap between intention and outcome. Who did you intend to be in that relationship versus who you found yourself being. What you meant to say versus what came out. How you wanted to respond versus what you actually did. Gap questions are among the most productive in the bank because the gap itself is the diagnostic signal. The size and character of the gap tells the scoring engine something about defense rigidity, awareness level, and the degree to which the automatic pattern is running faster than the conscious intention.

---

## Question Format

The Blueprint uses two question formats. Both serve the dual function of producing scoring signals and experiential material for the report.

**Narrative Response Questions**

These are open-ended prompts that invite the user to write a response of several sentences. They are the primary format for Quadrant One and for the most diagnostically important questions in Quadrants Two and Three. Narrative responses produce the richest experiential material for the report generation engine and also allow the scoring engine to derive signals from the content, tone, and structure of the response rather than from a pre-defined answer set.

Narrative response questions require a minimum response length to be enforced by the interface. A one-sentence response to a narrative prompt does not produce sufficient signal. The interface should prompt the user to say more if the response falls below a threshold, framing the prompt as an invitation rather than a requirement.

**Scaled Response Questions**

These are Likert-format questions scored on a five-point scale from strongly disagree to strongly agree, or from never to always, depending on the construct being measured. They are used for Quadrant Four and for the behavioral and somatic confirmation questions in Quadrants Two and Three. Scaled responses produce cleaner scoring signals for the axes that require numerical modifier values rather than categorical Profile assignments.

The Blueprint does not use forced-choice binary questions. Research on question design in deep personality assessment demonstrates that forced-choice formats produce higher rates of response abandonment on emotionally sensitive topics. The Blueprint's question content is frequently emotionally sensitive, and preserving the user's sense of agency and comfort throughout the experience is a product requirement as well as a design preference.

---

## Question Count and Session Architecture

The Blueprint question bank contains between 80 and 100 questions across the four Quadrants. Not all questions are served to every user. The dynamic structure of Quadrant Four means the total question count varies by persona code. The attachment-type-weighted variations in Quadrants One and Two also produce small variations in question count across users.

The target completion time is 25 to 35 minutes. This is longer than most dating assessment experiences and shorter than a therapy intake. The length is deliberate. The Blueprint is positioned as a serious instrument that requires genuine reflection, and the time commitment signals that seriousness to the user before they begin. The question experience should feel like it is taking the user somewhere rather than processing them through a survey.

The question engine uses the existing RELATE checkpoint architecture extended with a Blueprint-specific session configuration. The user's responses are saved at each Quadrant boundary so that an incomplete session can be resumed without loss of progress. The Blueprint does not require completion in a single session, but the question engine should note the time elapsed since the previous session when the user resumes, because responses to emotionally sensitive questions are more consistent when the user is in a similar emotional state across sessions. If more than 72 hours have elapsed since the previous session, the interface should gently note that the user may want to re-read their previous responses before continuing.

---

## Quadrant-Level Question Targets

The following targets specify what the question bank for each Quadrant is designed to establish. These are engineering targets for the question engine, not user-facing descriptions.

**Quadrant One Question Targets**

The question bank establishes the character of the primary disruption by asking about emotional climate and specific memories rather than asking about disruption directly. It establishes the source figure by asking about the user's earliest models of love, about specific relationships that shaped them, and about whether the patterns they recognize in themselves feel like they have always been there or feel like they developed at a specific point. It establishes repair history by asking about how significant ruptures ended, about whether the user has a sense of completion or incompletion around past relational wounds, and about what corrective experiences if any have changed what the user believes about love or about themselves as a partner.

**Quadrant Two Question Targets**

The question bank differentiates between the five trigger emotions by asking about the specific phenomenology of threat activation. What arrives first, the physical sensation, the thought, or the impulse to act. What the user is most afraid of losing when a relationship feels uncertain. What the user does when they cannot act on whatever the first impulse is. What partners have said about how the user behaves when things feel bad. The differentiation between fear of abandonment and shame is the most clinically important distinction the Quadrant Two questions make, because these two trigger emotions produce superficially similar behavior and require meaningfully different report language.

**Quadrant Three Question Targets**

The question bank establishes the dominant decision mode by asking about specific past moments of relational ambiguity, about what the user did in the gap between feeling something and acting, and about the outcomes of those actions over time. It also asks about what the user does when they cannot deploy their dominant mode, which reveals the secondary mode and produces important context for the report's conflict section. The gap between what the user intended and what they did in specific high-stakes moments is the primary scoring signal for this Quadrant.

**Quadrant Four Question Targets**

The question bank is constructed dynamically from the persona code as described in the dynamic structure section above. The universal targets across all persona configurations are: whether the persona is currently in its authentic or defensive register in dating contexts, how aware the user is of the defensive version of their persona and whether they have received feedback about it from partners, and where the persona amplifies under romantic pressure in ways that differ from how the user presents in lower-stakes contexts. The persona-specific questions provide the experiential content that makes these universal targets feel specific to this user rather than generic.

---

## Scoring Engine Interface

The question engine passes the following data structure to the scoring engine upon completion of each Quadrant. The scoring engine uses this structure to assign the Profile and, for Quadrants Three and Four, to calculate the axis modifier values.

For each question: the question identifier, the Quadrant and Dimension the question maps to, the response content for narrative questions or the numerical value for scaled questions, and any flags set by the branching logic when a response triggers a follow-up probe.

The scoring engine returns: the assigned Profile identifier for each Quadrant, the axis modifier values for Quadrants Three and Four expressed as numerical scores on defined scales, and a confidence score for each Profile assignment that reflects the consistency of the responses across the Dimensions that produced it. Low confidence scores flag for the report generation engine that the user's responses showed significant tension across angles, which is itself clinically meaningful and should be reflected in the report's language about that Quadrant.

The complete scoring logic, Profile routing tables, and axis calculation formulas are documented in the scoring engine specification, which is a separate technical document referenced by but not contained within this specification.

---

*Section 5: Cross-Quadrant Interaction and the Synthesis Architecture follows.*
