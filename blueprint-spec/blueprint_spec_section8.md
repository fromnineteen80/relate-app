# RELATE DATING BLUEPRINT
## Technical and Clinical Specification
### Section 8: Integration with the Existing RELATE System

---

## Critical Instruction

This section governs how the Blueprint integrates with everything Claude Code has already built. The existing RELATE assessment, its checkpoint architecture, its storage patterns, its results display, its subnav structure, and its report outputs are all functioning and must not be disturbed. Every integration described in this section is additive. Nothing in this section modifies existing logic, existing component behavior, or existing data structures unless the modification is explicitly stated, narrowly scoped, and described in precise terms.

When in doubt, extend rather than modify. When extension is not possible, document the modification precisely before implementing it. The existing system is the foundation. The Blueprint is a new floor built on top of it, not a renovation of what is already there.

---

## What the Blueprint Receives from the Existing System

The Blueprint is downstream of the RELATE assessment. It cannot begin until the RELATE assessment is complete. It receives two fixed inputs from the completed assessment and must access them without modifying the data structures that produced them.

**Input One: Attachment Type**

The attachment type result produced by the existing Session 3 scoring. The Blueprint reads this value from the completed assessment results object. It does not re-derive it. It does not modify it. It uses it as a read-only input parameter passed to the question engine and the report generation engine.

The attachment type is passed to the Blueprint engine as the type name string, not as a code. The existing system's attachment type output format should be used exactly as it is produced. If the existing system produces the attachment type as a named string such as Anchored or Oscillating, that string is passed directly. No transformation is required.

**Input Two: Persona Code**

The four-letter persona code produced by the existing Session 2 scoring. The Blueprint reads this value from the completed assessment results object. It does not re-derive it. It does not modify it. It uses it as a read-only input parameter that drives the dynamic construction of the Quadrant Four question set.

The persona code is passed to the Blueprint question engine at session initialization. The engine uses it to retrieve the relevant metadata from relate_persona_definitions.js and construct the Quadrant Four questions as specified in Section 4. The persona_definitions file is read-only from the Blueprint's perspective. The Blueprint adds no new data to it.

**Additional Context**

The Blueprint engine also receives, as read-only context, the following values from the completed assessment if they are available in the results object: gender, relationship status, and any partner link status. These values affect the framing of specific questions and the routing logic for couples mode but do not affect scoring or Profile assignment.

---

## Checkpoint Architecture Extension

The existing checkpoint system uses a session-based architecture with checkpoint strings generated at session boundaries and stored via the storage API. The Blueprint extends this architecture with a new session type rather than modifying the existing session logic.

**Blueprint Session Identifier**

The Blueprint runs as a distinct session following the completion of the three existing RELATE sessions. It is identified in the checkpoint system as Session 4, Blueprint. This naming convention extends the existing session numbering without conflicting with the existing Session 1, 2, and 3 identifiers.

**Checkpoint Generation**

The Blueprint generates checkpoints at each Quadrant boundary using the same checkpoint string pattern already implemented in the existing system. The Blueprint checkpoint string includes the session identifier, the Quadrant index at which the user stopped, all responses captured to that point, and the fixed input values received from the completed RELATE assessment. This allows a Blueprint session to be resumed without requiring the user to re-enter their RELATE results.

The checkpoint is stored under a Blueprint-specific storage key to prevent any possibility of collision with existing checkpoint storage keys. The key format follows the existing pattern with a Blueprint prefix. If the existing system uses relate_checkpoint as its storage key, the Blueprint uses relate_blueprint_checkpoint. The exact key name should match whatever convention the existing system uses, extended with the blueprint prefix.

**Resume Logic**

The Blueprint resume logic follows the same pattern as the existing resume detection. On initialization, the Blueprint checks for a stored Blueprint checkpoint. If one is found, it presents the resume confirmation screen using the same UI pattern the existing system uses. If the user resumes, the Blueprint restores all captured responses and navigates to the appropriate Quadrant. If the user starts over, it clears only the Blueprint checkpoint and does not touch any existing RELATE checkpoint data.

The Blueprint never clears or modifies existing RELATE checkpoint data under any circumstance.

---

## Results Display: Two Specific Changes

The existing Results display has an established layout, card structure, and subnav architecture. The Blueprint adds new elements to this display and requests two specific modifications to the existing layout. Both modifications are scoped precisely below.

**Modification One: Persona Card and Attachment Card Reordering**

The Attachment card in the Results display should be moved to appear directly below the Persona card. This is a product decision made for a specific reason: the Blueprint's central architectural premise is that attachment type and persona are the two fixed inputs that everything else deepens. Presenting them as adjacent cards in the Results display reinforces that relationship visually and conceptually before the user encounters the Blueprint results that build on both of them.

This modification affects only the visual ordering of cards in the Results display. It does not affect the content of either card, the data that populates them, the scoring logic that produces them, or any other component of the existing system. The Persona card remains above the Attachment card in the new order. The Attachment card moves from its current position to the position immediately below the Persona card.

Claude Code should implement this as a change to the card ordering array or render sequence in the Results display component only. No other component should be touched.

**Modification Two: Subnav Addition**

The Results subnav currently contains links to the sections of the existing results. Attachment should be added as a named link in this subnav, positioned directly after Persona in the link sequence. This is consistent with the card reordering above and ensures the subnav reflects the visual hierarchy of the Results display.

This modification adds one item to the subnav link list. It does not modify any existing subnav item, its label, its scroll target, or its behavior. The new Attachment link scrolls to the Attachment card using the same anchor pattern the existing subnav items use.

If the existing subnav is generated from a configuration array or a list of section identifiers, the modification is a single insertion into that array at the correct index. Claude Code should locate the existing subnav configuration and add the Attachment entry there rather than hardcoding it separately.

---

## Blueprint Entry Point in the Results Display

The Blueprint is surfaced to the user from within the Results display after the RELATE assessment is complete. It is not a separate application. It is an extension of the existing results experience.

The Blueprint entry point is a new card in the Results display positioned after the existing results cards. Its visual treatment should be consistent with the existing card design language. Its content introduces the Blueprint in one to two sentences, names the approximate completion time of 25 to 35 minutes, and presents a single call to action that initiates the Blueprint session.

The entry point card is conditional. It displays only when the RELATE assessment is fully complete, meaning all three sessions have been scored and the results object contains both a valid persona code and a valid attachment type. If either value is missing, the card does not display. It does not display a locked or coming soon state. It simply does not appear until the prerequisite is met.

The Blueprint entry point does not appear in the Results subnav. It is a card that initiates a new experience rather than a section of the existing results display. Adding it to the subnav would imply it is a section of the existing report, which it is not.

---

## Blueprint Results in the Results Display

When the user completes the Blueprint, their results are surfaced in the existing Results display as a new section that integrates with rather than appends to the existing layout.

The Blueprint results section contains three elements rendered in the Results display.

The first element is the four Profile names card, displaying the user's four Quadrant results as named Profiles with their Quadrant labels as specified in Section 3. This card uses the same visual language as existing results cards.

The second element is the Blueprint report access point, a card that links to the full generated report. The report is rendered as a separate view rather than inline in the Results display, using whatever full-page or modal report rendering pattern the existing system uses for extended report content. If the existing system renders the single report or relationship report as a separate view, the Blueprint report follows the same pattern.

The third element is the Growth Plan access point, a card that links to the generated growth plan document. This follows the same rendering pattern as the Blueprint report.

The Blueprint results section is added to the Results subnav as a single entry labeled Blueprint, positioned after the existing subnav items. Clicking this entry scrolls to the Blueprint results section. The Blueprint subnav entry does not expand into sub-links for the individual Quadrant results. The four Profiles are visible in the card without requiring subnav navigation.

If a couples overlay has been generated, a fourth element appears in the Blueprint results section: the Couples Overlay access point. This card is conditional on partner link status and overlay generation completion. It follows the same rendering pattern as the individual report and growth plan.

---

## Storage Keys

All Blueprint data is stored under Blueprint-specific keys that follow the existing storage key naming convention. The following keys are used by the Blueprint and must not conflict with any existing storage key.

relate_blueprint_checkpoint stores the Blueprint session checkpoint string and follows the same format as the existing relate_checkpoint key, extended to include Blueprint-specific fields.

relate_blueprint_results stores the complete Blueprint results object including all four Quadrant Profile identifiers, all axis scores, the emergent pattern identifier if applicable, and all confidence scores. This object is read by the report generation engine and by the Results display component.

relate_blueprint_report stores the generated individual report as a structured object containing each of the six report sections as named string fields. Storing the report by section allows individual sections to be regenerated if quality evaluation fails without requiring a full report regeneration.

relate_blueprint_growth stores the generated growth plan as a structured object containing each of the four growth plan parts as named string fields.

relate_blueprint_couples stores the couples overlay report as a structured object when applicable. This key is only written when both partners have completed the Blueprint and the overlay generation call has succeeded.

No existing storage key is modified, overwritten, or deleted by the Blueprint under any circumstance.

---

## API Surface

The Blueprint exposes the following functions to the existing RELATE codebase. These are the only integration points between the Blueprint and the existing system. Claude Code should implement these as the defined interface between the two systems.

initializeBlueprint(assessmentResults) accepts the completed RELATE assessment results object and returns a Blueprint session configuration object containing the fixed input values, the dynamically constructed Quadrant Four question set, and the session identifier. This function is called when the user initiates the Blueprint from the entry point card.

saveBlueprintProgress(quadrantIndex, responses) accepts the current Quadrant index and all responses captured to that point and writes the Blueprint checkpoint. This function is called at each Quadrant boundary.

scoreBlueprintSession(allResponses, assessmentResults) accepts the complete set of Blueprint responses and the RELATE assessment results and returns the Blueprint results object containing all four Quadrant Profile identifiers, axis scores, emergent pattern identifier, and confidence scores. This function is called when the user completes the final Quadrant.

generateBlueprintReport(blueprintResults, assessmentResults, personaMetadata) accepts the Blueprint results object, the RELATE assessment results, and the persona metadata for the user's persona code retrieved from relate_persona_definitions.js, and returns the generated individual report object. This function calls the report generation engine as specified in Section 6.

generateGrowthPlan(blueprintResults, blueprintReport, assessmentResults, personaMetadata) accepts the Blueprint results, the generated report, the full RELATE assessment results, and the persona metadata, and returns the generated growth plan object. This function is called immediately after generateBlueprintReport completes successfully.

generateCouplesOverlay(blueprintResults1, blueprintResults2, assessmentResults1, assessmentResults2) accepts the Blueprint results and RELATE assessment results for both partners and returns the couples overlay report object. This function is called when both partners have completed the Blueprint and the partner link is active.

---

## File Structure and Read-Only Inventory

Before writing any Blueprint files or touching any existing component, Claude Code must run a full directory listing of the relate-app repository and read the current file tree. The specification does not assume knowledge of what currently exists in the repo beyond the project reference files that were present at the time this specification was written. The actual repo may contain additional files, renamed files, or restructured directories that this specification could not anticipate.

The inventory step serves two purposes. First, it tells Claude Code which Blueprint files already exist from prior build sessions and should be extended rather than replaced. Any file whose name begins with relate_blueprint should be read before being modified so that existing logic is preserved and built upon. Second, it tells Claude Code the exact names and locations of the existing RELATE components that the two Results display modifications touch, so that the card reordering and subnav addition are implemented against the actual current component rather than an assumed filename.

The principle governing all file decisions is the same one that governs all integration decisions in this section: extend rather than replace, and modify only what is explicitly scoped. Everything in the existing repo that does not have a specific modification described in this specification is read-only from the Blueprint's perspective. Claude Code should treat any file it did not create as something that must be understood before it is touched and preserved in its current behavior after it is touched.

The three functional areas the Blueprint needs to introduce as new files are the question engine, the scoring engine, and the prompt template library. If prior Blueprint build sessions have already created files serving any of these functions, those files are the starting point. If they do not yet exist, they are created fresh. In either case, the file content must be consistent with the architecture described in Sections 4, 5, and 6 of this specification.

---

## Sequencing the Build

The recommended build sequence minimizes the risk of breaking existing functionality while making steady forward progress on the Blueprint.

Build the question engine first, in isolation, without connecting it to the existing system. Test it with hardcoded fixture values for the persona code and attachment type inputs before integrating it with the live assessment results.

Build the scoring engine second, testing it against the question engine output with fixture data before connecting either to the existing storage or results systems.

Build the prompt templates third, testing them against the report generation API with fixture scoring outputs before integrating them into the full pipeline.

Connect the Blueprint session to the existing Results display entry point fourth, using the existing storage and checkpoint patterns. Verify that the connection does not affect existing checkpoint behavior before proceeding.

Implement the two Results display modifications fifth, as the final step. These are the only changes to existing components and should be made last, after all Blueprint-specific functionality has been verified in isolation.

---

*This concludes the RELATE Dating Blueprint Technical and Clinical Specification. The eight sections together constitute the complete source of truth for the Blueprint build. Claude Code should reference this specification for all architectural, clinical, and product decisions encountered during implementation.*
