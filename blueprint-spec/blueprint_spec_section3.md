# RELATE DATING BLUEPRINT
## Technical and Clinical Specification
### Section 3: Terminology and User-Facing Results

---

## Resolved Terminology

Four terms structure the entire Blueprint architecture. They are used consistently across every file, every prompt, and every user-facing surface. No synonyms. No substitutions. Consistency in naming is not a style preference. It is a technical requirement that prevents Claude Code from making judgment calls about what a term means in context.

**Quadrant**

The top-level unit of measurement. There are four Quadrants. Each measures a distinct dimension of relational psychology. The word Quadrant surfaces to the user. It appears in the question experience, in the results display, and in the report. It is spatial and systemic without being clinical. It implies that the four measurements form a complete picture together, which is accurate.

**Profile**

The named position a user lands in within a Quadrant. Every Quadrant produces a Profile. Profiles have names. They have clinical depth behind them. They are what the user receives as their result for each Quadrant. The word Profile surfaces to the user. It implies individuality and specificity, which is the correct implication. The user does not receive a type or a category. They receive a Profile, which is a portrait of a specific position within a larger system.

**Dimension**

The scoring input that produces a Profile. Each Quadrant has between two and three Dimensions. Dimensions are the variables the question engine measures. They are the levers the scoring logic uses to route the user to their Profile. The word Dimension does not surface to the user in most contexts. It is architectural language used in this specification and in the question engine documentation. If it appears in the user interface at all, it is only in an explanatory context where the user is being told how the scoring works, not as a label for something they receive.

**Axis**

The internal scoring structure used within specific Quadrants where the Dimensions do not produce a single discrete Profile but instead produce modifier scores that shape how the report speaks. Quadrant Three and Quadrant Four both use internal axes. The word Axis never surfaces to the user under any circumstance. It is specification and engineering language only. Users do not see axis scores. They do not see axis labels. They experience the output the axes produce, which is a Profile and a report section calibrated to that Profile.

---

## What the User Sees

The user-facing results display has three layers. Each layer serves a different purpose and is written in a different register.

**Layer One: The Four Profile Names**

Before the narrative report begins, the user sees their four Profile names presented cleanly as a set. This is the Blueprint equivalent of the four-letter MBTI code or the Enneagram type number. It gives the user a coordinate system they can hold, reference, and share. It also establishes the credibility of what follows. The user can see that something specific was measured before they read the narrative that explains what was found.

The four Profile names are presented with their Quadrant labels so the user understands what each result represents. The format is:

Quadrant One: Relational History — [Profile Name]
Quadrant Two: Trigger Emotion — [Profile Name]
Quadrant Three: Decision Architecture — [Profile Name]
Quadrant Four: Persona in Practice — [Profile Name, drawn from RELATE persona plus axis modifiers]

No scores are shown. No numerical results are displayed. The user sees named Profiles, not ranked positions or percentile placements. The Blueprint does not produce a hierarchy of health. It produces a portrait of a specific person. Scores are internal architecture. Portraits are what the user receives.

**Layer Two: The Short Profile Summaries**

Beneath the four Profile names, each Profile is accompanied by a two to three sentence summary written in the same direct, non-hedged register as the full report. These summaries are not clinical descriptions of the Profile in general. They are written in the second person, addressed directly to this user, and they make one or two specific claims that give the user an immediate sense that the result is about them specifically rather than about a general category they happen to fall into.

The short summaries function as the threshold between the results display and the full report. They give the user enough of a signal to want to read further. They do not explain the Profile. They demonstrate it.

**Layer Three: The Full Narrative Report**

The complete generated report. Documented in full in Section 6 of this specification. The user accesses the full report from the results display. In single mode the report is one continuous document. In couples mode each partner's individual report is accessible separately, and the couples overlay report is accessible as a third document generated from both result sets together.

---

## What the User Does Not See

The following elements are internal to the scoring engine and the report generation system. They are never displayed to the user, never referenced in user-facing language, and never surfaced in any form in the question experience or the results display.

Dimension scores. The numerical or categorical outputs of each Dimension within a Quadrant are internal inputs to the Profile routing logic. The user does not see that they scored at a particular position on Dimension A or Dimension C. They see the Profile that resulted from the combination of all Dimension scores.

Axis scores. The internal axis measurements within Quadrant Three and Quadrant Four produce modifier values that calibrate the report register. These values are passed to the report generation prompt as context. They are never labeled, displayed, or described to the user.

Defense scores, awareness scores, and amplification scores. These are the specific axis measurements within Quadrant Four. They are technical inputs. The user experiences their effect in how the report speaks to them. They do not see the scores themselves.

Routing logic. The decision tree that maps Dimension scores to Profile assignments is internal. The user does not see why they landed in a particular Profile. They see what the Profile means for them, which is delivered through the narrative report.

Cross-Quadrant weighting. The synthesis section of the report is generated from the interaction of all four Quadrant results. The weighting logic that determines which cross-Quadrant combinations are most clinically significant is internal. The user experiences the synthesis as a coherent portrait. They do not see the combinatorial logic that produced it.

---

## Naming Conventions for the Question Experience

The question experience uses Quadrant as the organizing label when sectioning is visible to the user. If the question interface shows the user where they are in the assessment, it references Quadrant One, Quadrant Two, and so on. It does not use Dimension or Axis as navigational labels.

The question experience does not tell the user what each Quadrant is measuring in diagnostic terms. It tells the user what territory the questions explore in experiential terms. The user is told they are about to explore their relational history, the emotional patterns underneath their behavior, how they navigate uncertainty in relationships, and how they show up inside a relationship specifically. They are not told that the scoring is deriving their disruption character, source figure, repair history, or trigger emotion. The diagnostic language is reserved for the report, where it arrives as insight rather than as a label the user applied to themselves.

---

## Profile Naming Philosophy

Profile names are not clinical labels. They are not diagnostic categories. They are not evaluative. No Profile name implies health or dysfunction, success or failure, ease or difficulty. Every Profile name describes a position that has genuine strengths and genuine costs. The naming convention reflects this.

Profile names for Quadrant One describe the character of the relational history in terms that are honest without being reductive. Profile names for Quadrant Two are the emotion names themselves, stated plainly, because the precision of naming the trigger emotion directly is itself part of the value the report delivers. Profile names for Quadrant Three describe the decision mode in functional terms that the user will recognize from the inside. Profile names for Quadrant Four are drawn from the RELATE persona system and modified by the axis scores, so the user sees their familiar persona name in a new context rather than a foreign label assigned by the Blueprint scoring.

The complete Profile name list for each Quadrant is documented in the question engine specification in Section 4 of this document, where the routing logic that assigns each Profile is also defined.

---

## Terminology in the Report Itself

The report uses Quadrant as an organizational label for its sections. It does not use Dimension or Axis anywhere in the narrative. It does not reference scoring. It does not explain how the results were derived. The report is not a description of the assessment. It is the insight the assessment made possible.

When the report references the user's Profile, it uses the Profile name naturally within prose rather than presenting it as a labeled result. The report demonstrates what the Profile means by describing the experience of being this person rather than by defining the Profile and then applying it. This is the difference between a report that says you scored in the Grief trigger emotion Profile, which means you experience anticipatory loss in relationships, and a report that says you carry love and loss at the same time, and that awareness has made you one of the more tender people in any room, and also one of the more tired ones. The first approach labels and defines. The second approach knows.

---

*Section 4: The Question Engine Specification follows.*
