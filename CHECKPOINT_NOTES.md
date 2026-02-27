# RELATE Checkpoint System Notes

## Overview

The assessment is divided into **3 sessions** (plus demographics) to allow completion across multiple sittings:

| Section | Questions | Time (@ 17 sec/q) | Checkpoint |
|---------|-----------|-------------------|------------|
| Demographics | ~15-20 | ~4 min | None (must complete) |
| Session 1: Who You Want (M1) | 134 | ~38 min | After M1 complete |
| Session 2: Who You Are (M2) | 137 | ~39 min | After M2 complete |
| Session 3: Connect & Conflict (M3+M4) | 88 | ~25 min | Assessment complete |
| **Total** | **~375** | **~106 min** | |

*Time estimates based on Enneagram benchmark: 144 questions in 40 minutes â‰ˆ 17 seconds per question*

**Note:** Demographics are collected BEFORE Session 1 but do NOT have a checkpoint. Demographics questions are defined separately from relate_questions.js.

## Save/Resume Architecture

### Primary: Storage API (Claude Artifacts)

```javascript
// Auto-save after each question
await window.storage.set('relate_m1_responses', JSON.stringify(responses));

// On artifact load, check for saved progress
const saved = await window.storage.get('relate_m1_responses');
if (saved) {
  // Offer to resume
}
```

Storage keys:
- `relate_gender` - 'M' or 'F'
- `relate_session` - Current session (1, 2, or 3)
- `relate_m1_responses` - Module 1 responses
- `relate_m2_responses` - Module 2 responses
- `relate_m3_responses` - Module 3 responses
- `relate_m4_responses` - Module 4 responses
- `relate_checkpoint_string` - Backup string

### Backup: Checkpoint Strings

For users who:
- Close and reopen the artifact
- Want to export their progress manually
- Need a fallback if storage fails

**Format:** `RELATE_v1_{gender}_{session}_{encodedResponses}_{checksum}`

**Example:** `RELATE_v1_M_1_435214352143521435...AB_a7f2`

**Encoding:**
- Likert: 1-5 (single digit)
- Forced choice: A or B
- Responses sorted alphabetically by question ID
- Checksum for validation

## JSX Implementation Notes

### On Session Start
```javascript
// Check for existing progress
useEffect(() => {
  const checkProgress = async () => {
    try {
      const savedSession = await window.storage.get('relate_session');
      const savedGender = await window.storage.get('relate_gender');
      
      if (savedSession && savedGender) {
        setResumeAvailable(true);
        setLastSession(JSON.parse(savedSession.value));
      }
    } catch (e) {
      // Storage not available, proceed without resume
    }
  };
  checkProgress();
}, []);
```

### On Checkpoint Reached
```javascript
const handleCheckpoint = async (session, responses) => {
  // Save to storage
  await window.storage.set(`relate_m${session}_responses`, JSON.stringify(responses));
  await window.storage.set('relate_session', JSON.stringify(session));
  
  // Generate backup string
  const checkpointString = encodeCheckpointString(gender, session, allResponses);
  await window.storage.set('relate_checkpoint_string', checkpointString);
  
  // Show checkpoint modal with:
  // 1. Progress saved message
  // 2. Option to copy checkpoint string
  // 3. "Continue to Session X" or "Take a Break" buttons
};
```

### On Resume (string import)
```javascript
const handleImportCheckpoint = (checkpointString) => {
  const result = decodeCheckpointString(checkpointString, gender);
  
  if (!result.valid) {
    showError(result.error);
    return;
  }
  
  // Restore responses
  setResponses(result.responses);
  setCurrentSession(result.session + 1); // Start next session
};
```

## Exports Added to relate_questions.js

```javascript
// Checkpoint System
CHECKPOINT_CONFIG,           // Session definitions
encodeCheckpointString,      // Responses â†’ string
decodeCheckpointString,      // String â†’ responses
getQuestionIdsForSessions,   // Get IDs for encoding
getSessionInfo,              // Session metadata
calculateProgress            // Progress percentage
```

## Question ID Patterns by Session

**Session 1 (M1):**
- Men: `M1_PHY_*`, `M1_SOC_*`, `M1_LIFE_*`, `M1_VAL_*`
- Women: `W1_PHY_*`, `W1_SOC_*`, `W1_LIFE_*`, `W1_VAL_*`

**Session 2 (M2):**
- Men: `M2_PHY_*`, `M2_SOC_*`, `M2_LIFE_*`, `M2_VAL_*`, `ATT_M*`, `CON_M*`
- Women: `W2_PHY_*`, `W2_SOC_*`, `W2_LIFE_*`, `W2_VAL_*`, `ATT_W*`, `CON_W*`

**Session 3 (M3+M4):**
- M3: `M3_WANT_*`, `M3_OFFER_*` (shared), `W3_WANT_*`, `W3_OFFER_*`
- M4 Men: `M4_CA_*`, `M4_ED_*`, `M4_RR_*`, `M4_EC_*`, `M4_GS_*`
- M4 Women: `W4_CA_*`, `W4_ED_*`, `W4_RR_*`, `W4_EC_*`, `W4_GS_*`
