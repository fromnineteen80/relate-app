# RELATE Production Build

## Execution Mode
```
ultrathink
```

---

## Setup: GitHub + Vercel + Supabase

Before writing code, set up the deployment pipeline so every push is testable.

### Step 1: GitHub Repository
This project is in a GitHub repository. You are working directly in it. After completing each major section in the build order, commit with a descriptive message and push:

```bash
git add .
git commit -m "feat: [description]"
git push origin main
```

Use conventional commits:
- `feat:` new feature
- `fix:` bug fix  
- `refactor:` code restructuring
- `docs:` documentation

Commit frequently so progress is saved and deployments trigger.

### Step 2: Vercel (Auto-Deploy)
The repo should be connected to Vercel. Every push to `main` triggers automatic deployment to a live URL.

If not already connected:
1. Go to vercel.com → Import Project → Select this repo
2. Framework: Next.js (auto-detected)
3. Leave environment variables blank initially
4. Deploy

The app will be live at `https://[repo-name]-[username].vercel.app`

### Step 3: Supabase (Database + Auth)
1. Create project at supabase.com
2. Run the schema SQL (provided below) in SQL Editor
3. Copy these values from Project Settings → API:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service role key → `SUPABASE_SERVICE_ROLE_KEY`
4. Add to Vercel: Settings → Environment Variables

### Step 4: Enable Testing Before All APIs Ready
Create mock/placeholder modes so the app is testable immediately:

```javascript
// lib/config.js
export const config = {
  useMockAuth: process.env.NEXT_PUBLIC_MOCK_AUTH === 'true',
  useMockPayments: process.env.NEXT_PUBLIC_MOCK_PAYMENTS === 'true',
  useMockAdvisor: process.env.NEXT_PUBLIC_MOCK_ADVISOR === 'true'
};
```

When `MOCK_AUTH=true`:
- Skip Supabase, use localStorage for session
- Auto-login with test user

When `MOCK_PAYMENTS=true`:
- Skip Stripe, auto-unlock full report
- Show "[TEST MODE]" badge

When `MOCK_ADVISOR=true`:
- Return canned responses instead of calling Claude API

Set these in `.env.local` for local dev, or Vercel env vars for preview deploys.

### Step 5: Create .env.example
Create this file documenting all required variables:

```env
# Supabase (required for auth + database)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (required for payments)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Anthropic (required for Claude Advisor)
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_URL=https://your-app.vercel.app

# Email (for partner invitations)
RESEND_API_KEY=

# Mock modes (for testing without APIs)
NEXT_PUBLIC_MOCK_AUTH=false
NEXT_PUBLIC_MOCK_PAYMENTS=false
NEXT_PUBLIC_MOCK_ADVISOR=false
```

---

## What You're Building

RELATE is a relationship intelligence platform. Users complete a ~367-question assessment across 4 modules. The system assigns them one of 32 personas, ranks their compatibility with 16 opposite-gender personas, and generates detailed reports with coaching.

This is a production app with authentication, payments, partner comparison, an embedded AI advisor, and referral monetization.

---

## Files Attached

You have 8 files. Read them in this order before writing any code:

| File | What It Contains | When to Reference |
|------|------------------|-------------------|
| `relate_questions.js` | All ~360 questions + scoring functions for M1-M4 | Building assessment UI, calling scoring functions |
| `relate_persona_definitions.js` | 32 persona definitions + 256 tier mappings | Displaying persona results, determining compatibility tiers |
| `relate_frameworks.js` | Tension stack calculations | After all modules scored, computing tension analysis |
| `relate_demographics_engine.js` | Full demographics schema + market calculations | Building demographics intake form |
| `relate_modifier_system.js` | Skill modifiers that adjust compatibility | Fine-tuning compatibility scores |
| `draft_report_outline.md` | Complete interpretation template (Builder × Influencer example) | Writing generateReport() and match detail functions |
| `CHECKPOINT_NOTES.md` | Save/resume implementation notes | Building checkpoint system |
| `RELATE_ASSESSMENT_UX.md` | UI flow documentation | Designing question flow and transitions |

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database + Auth:** Supabase
- **Payments:** Stripe
- **Styling:** Tailwind CSS
- **AI:** Anthropic Claude API
- **Deployment:** Vercel

---

## Design System

Build from scratch with this aesthetic. Ignore any design patterns in the attached files.

### Typography
- **Headings:** Serif font — load Newsreader, Lora, or Spectral from Google Fonts
- **Body:** Sans-serif — Inter or system stack
- **Data/Codes:** Monospace for persona codes and scores

### Colors
```css
--background: #fafaf9;      /* stone-50 */
--text-primary: #292524;    /* stone-800 */
--text-secondary: #78716c;  /* stone-500 */
--accent: #c2410c;          /* orange-700 */
--border: #e7e5e4;          /* stone-200 */
--success: #047857;         /* emerald-700 */
--warning: #d97706;         /* amber-600 */
--danger: #be123c;          /* rose-700 */
```
No gradients. No shadows except `shadow-sm` where essential. No bright colors.

### Layout
- Information-dense like a research tool, not a consumer app
- Tight spacing, minimal padding
- Cards: White background, subtle borders, no shadows
- Tables for data, not marketing cards
- Think Bloomberg terminal meets academic journal

### Components
- Progress bars: Thin, `stone-300` track, `orange-700` fill
- Buttons: Solid `orange-700` primary, outlined secondary
- Inputs: Clean borders, no rounded corners beyond `rounded-md`
- Icons: Lucide, minimal set, functional only

### Overall
- Professional, restrained, trustworthy
- Should feel like an Anthropic internal tool
- No illustrations, no decorative elements
- Show the numbers — users paid for data, not fluff

---

## Database Schema

Run this in Supabase SQL editor:

```sql
-- Users table with full demographics
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  
  -- Core demographics (required)
  gender char(1) check (gender in ('M', 'W')),
  age integer check (age >= 18 and age <= 100),
  zip_code text,
  ethnicity text,
  orientation text default 'Straight',
  
  -- About you demographics
  income integer,
  education text,
  height text,
  body_type text,
  fitness_level text,
  political text,
  smoking boolean,
  has_kids boolean,
  want_kids text,
  relationship_status text,
  
  -- Partner preferences
  pref_age_min integer,
  pref_age_max integer,
  pref_income_min integer,
  pref_height_min text,
  pref_body_types text[],
  pref_fitness_levels text[],
  pref_smoking text,
  pref_has_kids text,
  pref_want_kids text,
  pref_ethnicities text[],
  pref_political text[],
  pref_education_min text,
  
  -- Seeking context
  seeking text,
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Assessment progress (checkpoint saves)
create table assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  module integer not null check (module between 1 and 4),
  responses jsonb not null default '{}',
  question_index integer default 0,
  started_at timestamptz default now(),
  completed_at timestamptz,
  unique(user_id, module)
);

-- Completed results
create table results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade unique,
  persona_code char(4) not null,
  m1_scores jsonb not null,
  m2_scores jsonb not null,
  m3_scores jsonb not null,
  m4_scores jsonb not null,
  dimensions jsonb not null,
  tension_stacks jsonb,
  attentiveness jsonb,
  modifiers jsonb,
  market_position jsonb,
  ranked_matches jsonb,
  created_at timestamptz default now()
);

-- Partner invitations
create table partnerships (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid references users(id) on delete cascade,
  user2_id uuid references users(id) on delete set null,
  invite_email text not null,
  invite_token text unique not null,
  invited_at timestamptz default now(),
  accepted_at timestamptz,
  both_completed_at timestamptz,
  compatibility_report jsonb,
  created_at timestamptz default now()
);

-- Payments
create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  product text not null check (product in ('full_report', 'couples_report')),
  amount integer not null,
  currency text default 'usd',
  stripe_session_id text,
  stripe_payment_intent text,
  status text default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz default now()
);

-- Referral click tracking
create table referral_clicks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  service text not null,
  affiliate_url text not null,
  clicked_at timestamptz default now()
);

-- Claude advisor conversations
create table advisor_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  partnership_id uuid references partnerships(id) on delete cascade,
  messages jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on all tables
alter table users enable row level security;
alter table assessments enable row level security;
alter table results enable row level security;
alter table partnerships enable row level security;
alter table payments enable row level security;
alter table referral_clicks enable row level security;
alter table advisor_conversations enable row level security;

-- RLS policies
create policy "Users read own data" on users for select using (auth.uid() = id);
create policy "Users update own data" on users for update using (auth.uid() = id);
create policy "Users insert own data" on users for insert with check (auth.uid() = id);
create policy "Users manage own assessments" on assessments for all using (auth.uid() = user_id);
create policy "Users manage own results" on results for all using (auth.uid() = user_id);
create policy "Users view own partnerships" on partnerships for all using (auth.uid() = user1_id or auth.uid() = user2_id);
create policy "Users view own payments" on payments for select using (auth.uid() = user_id);
create policy "Users track own referrals" on referral_clicks for all using (auth.uid() = user_id);
create policy "Users manage own conversations" on advisor_conversations for all using (auth.uid() = user_id);

-- Indexes
create index idx_assessments_user on assessments(user_id);
create index idx_results_user on results(user_id);
create index idx_partnerships_token on partnerships(invite_token);
create index idx_payments_user on payments(user_id);
```

---

## Route Structure

```
/                               Landing page
├── /auth
│   ├── /login                  Email/password login
│   ├── /signup                 Registration → redirect to demographics
│   └── /invite/[token]         Partner invitation acceptance
├── /onboarding
│   └── /demographics           Full demographics intake (required)
├── /assessment
│   ├── /                       Assessment hub (shows progress)
│   ├── /module-1               What You Want (~134 questions)
│   ├── /module-2               Who You Are (~137 questions)
│   ├── /module-3               How You Connect (~28 questions)
│   ├── /module-4               When Things Get Hard (~68 questions)
│   └── /processing             Scoring + results calculation
├── /results
│   ├── /                       Results dashboard
│   ├── /persona                Detailed persona profile
│   ├── /matches                All 16 matches ranked
│   ├── /match/[code]           Individual match deep-dive
│   ├── /conflict               M4 breakdown
│   └── /compare                Partner comparison (couples only)
├── /advisor                    Claude chat interface (paid only)
├── /invite                     Send partner invitation
├── /settings
│   ├── /profile                Update demographics
│   └── /billing                Payment history
└── /api
    ├── /auth/*                 Supabase auth
    ├── /checkout               Stripe session
    ├── /webhook                Stripe webhook
    ├── /advisor                Claude API proxy
    ├── /invite                 Send invitation email
    └── /results                Calculate and store results
```

---

## Demographics Intake

**READ:** `relate_demographics_engine.js` — contains complete `DEMOGRAPHIC_QUESTIONS` schema

Collect in this order before allowing assessment:

### Section A: Location
- ZIP code (required) — used for CBSA market lookup
- City (optional)
- State (optional)

### Section B: Identity
- Gender (required) — determines question wording and match pool
- Age (required)
- Ethnicity (required)
- Sexual orientation (required)

### Section C: About You
- Income (required)
- Education (required)
- Height (men only)
- Body type (required)
- Fitness level (required)
- Political views (required)
- Smoking (required)
- Has children (required)
- Wants children (required)
- Relationship status (required)

### Section D: Partner Preferences
- Age range (min/max)
- Minimum income
- Minimum height (women only)
- Acceptable body types (multi-select)
- Acceptable fitness levels (multi-select)
- Smoking preference
- Has kids preference
- Wants kids preference
- Acceptable ethnicities (multi-select)
- Acceptable political views (multi-select)
- Minimum education

### Section E: Context
- What are you here for? (partner / self-knowledge / relationship-improvement)

Store all fields in `users` table. Use functions from `relate_demographics_engine.js` to calculate market position.

---

## Assessment Modules

### Module 1: What You Want

**READ:** `relate_questions.js` — find `MEN_MODULE1_QUESTIONS` and `WOMEN_MODULE1_QUESTIONS`

**Questions:** ~134 (varies by gender)

**Structure:** 4 dimensions with two poles each

| Dimension | Men's Poles | Women's Poles |
|-----------|-------------|---------------|
| Physical | Beauty (A) vs Confidence (B) | Fitness (A) vs Maturity (B) |
| Social | Allure (C) vs Warmth (D) | Leadership (C) vs Presence (D) |
| Lifestyle | Thrill (E) vs Peace (F) | Thrill (E) vs Peace (F) |
| Values | Traditional (G) vs Egalitarian (H) | Traditional (G) vs Egalitarian (H) |

**Per Dimension:**
- 12 Likert Direct (6 per pole)
- 8 Likert Behavioral (4 per pole)
- 12 Forced Choice

**Scoring:**
```javascript
import { scoreModule1 } from './relate_questions.js';
const m1Result = scoreModule1(gender, responses);
```

**Checkpoint:** Save to `assessments` table after completion.

---

### Module 2: Who You Are

**READ:** `relate_questions.js` — find `MEN_MODULE2_QUESTIONS` and `WOMEN_MODULE2_QUESTIONS`

**Questions:** ~137

**Structure:** Same 4 dimensions, self-assessment

| Dimension | Men's Poles | Women's Poles |
|-----------|-------------|---------------|
| Physical | Fitness (A) vs Maturity (B) | Beauty (A) vs Confidence (B) |
| Social | Reserved (C) vs Charm (D) | Allure (C) vs Warmth (D) |
| Lifestyle | Drive (E) vs Peace (F) | Drive (E) vs Peace (F) |
| Values | Traditional (G) vs Egalitarian (H) | Traditional (G) vs Egalitarian (H) |

**Per Dimension:**
- 12 Likert Direct
- 8 Likert Behavioral
- 12 Forced Choice
- 2 Attention checks
- 2 Consistency checks

**Scoring:**
```javascript
import { scoreModule2, validateResponses } from './relate_questions.js';
const validation = validateResponses(responses, gender);
const m2Result = scoreModule2(gender, responses);
// Returns persona code: 'BDFH', etc.
```

**Output:** 4-letter persona code

---

### Module 3: How You Connect

**READ:** `relate_questions.js` — find `MODULE3_QUESTIONS`

**Questions:** ~28 (includes 4 attentiveness questions)

**Measures:**
- **Want Score** (0-100): How much differentiated access you seek
- **Offer Score** (0-100): How much differentiated access you give
- **Attentiveness**: Self-focused vs other-focused orientation

**Scoring:**
```javascript
import { scoreModule3, scoreAttentiveness } from './relate_questions.js';
const m3Result = scoreModule3(gender, responses);
// Attentiveness scored after M4 when gottmanScores available
```

---

### Module 4: When Things Get Hard

**READ:** `relate_questions.js` — find `MODULE4_QUESTIONS`

**Questions:** ~68 (includes 4 attentiveness questions)

**Measures:**

1. **Conflict Approach:** Pursue vs Withdraw
2. **Emotional Drivers:** Abandonment, Engulfment, Inadequacy, Injustice
3. **Repair Style:** Quick/Slow speed + Verbal/Physical mode
4. **Capacity:** High/Medium/Low emotional bandwidth
5. **Gottman Horsemen:** Criticism, Contempt, Defensiveness, Stonewalling scores

**Scoring:**
```javascript
import { scoreModule4 } from './relate_questions.js';
const m4Result = scoreModule4(gender, responses);
```

---

## Post-Assessment Processing

After all 4 modules complete:

```javascript
// READ: relate_questions.js, relate_frameworks.js, relate_persona_definitions.js, relate_modifier_system.js

import { scoreModule1, scoreModule2, scoreModule3, scoreModule4, scoreAttentiveness } from './relate_questions.js';
import { computeAllTensionStacks } from './relate_frameworks.js';
import { M2_PERSONA_METADATA, W2_PERSONA_METADATA, M2_COMPATIBILITY_TABLE, W2_COMPATIBILITY_TABLE } from './relate_persona_definitions.js';
import { calculateRelateModifiers } from './relate_modifier_system.js';

// Score each module
const m1Result = scoreModule1(gender, m1Responses);
const m2Result = scoreModule2(gender, m2Responses);
const m3Result = scoreModule3(gender, m3Responses);
const m4Result = scoreModule4(gender, m4Responses);

// Calculate derived metrics
const attentiveness = scoreAttentiveness(allResponses, gender, m3Result, m4Result.gottmanScores, m2Result.selfPerceptionGap);
const tensionStacks = computeAllTensionStacks(m1Result, m2Result, m3Result, m4Result, demographics, gender);
const modifiers = calculateRelateModifiers(m1Result, m2Result, m3Result, m4Result, demographics);

// Build results object
const userResults = {
  gender,
  personaCode: m2Result.personaCode,
  m1: m1Result,
  m2: m2Result,
  m3: m3Result,
  m4: m4Result,
  attentiveness,
  tensionStacks,
  modifiers,
  demographics
};

// YOU BUILD THESE:
const rankedMatches = rankCompatiblePersonas(userResults);
const report = generateReport(userResults, rankedMatches);
```

---

## What You Must Build: Orchestration Layer

### 1. PERSONA_TYPICAL_PROFILES

**READ:** `relate_persona_definitions.js` — examine behavioral descriptions in `M2_PERSONA_METADATA` and `W2_PERSONA_METADATA`

Derive typical M3/M4 patterns for each of 32 personas:

```javascript
const PERSONA_TYPICAL_PROFILES = {
  'ACEG': { // Gladiator
    m3: { typicalWant: 45, typicalOffer: 35, typicalAttentiveness: 'self-focused' },
    m4: { typicalApproach: 'withdraw', typicalDriver: 'inadequacy', typicalRepairSpeed: 'slow', typicalRepairMode: 'physical', typicalCapacity: 'high' }
  },
  'BDFH': { // Builder
    m3: { typicalWant: 75, typicalOffer: 80, typicalAttentiveness: 'other-focused' },
    m4: { typicalApproach: 'withdraw', typicalDriver: 'inadequacy', typicalRepairSpeed: 'slow', typicalRepairMode: 'verbal', typicalCapacity: 'high' }
  },
  // ... all 32 personas
};
```

### 2. rankCompatiblePersonas()

**READ:** `relate_persona_definitions.js` — find `M2_COMPATIBILITY_TABLE` and `W2_COMPATIBILITY_TABLE`

```javascript
const TIER_BASE_SCORES = { ideal: 80, kismet: 65, effort: 45, longShot: 25, atRisk: 10, incompatible: 2 };

function rankCompatiblePersonas(userResults) {
  const { gender, personaCode, m2, m3, m4 } = userResults;
  
  const compatTable = gender === 'M' ? M2_COMPATIBILITY_TABLE : W2_COMPATIBILITY_TABLE;
  const targetPersonas = gender === 'M' ? W2_PERSONA_METADATA : M2_PERSONA_METADATA;
  const tierAssignments = compatTable[personaCode];
  
  const matches = Object.entries(targetPersonas).map(([code, persona]) => {
    const tier = getTierForMatch(tierAssignments, code);
    const tierScore = TIER_BASE_SCORES[tier];
    const dimensionScore = calculateDimensionAlignment(m2.dimensions, persona);
    const m3Score = calculateM3Compatibility(m3, PERSONA_TYPICAL_PROFILES[code].m3);
    const m4Score = calculateM4Compatibility(m4, PERSONA_TYPICAL_PROFILES[code].m4);
    
    const compatibilityScore = Math.round(
      tierScore * 0.50 + dimensionScore * 0.20 + m3Score * 0.15 + m4Score * 0.15
    );
    
    return { code, persona, tier, tierScore, dimensionScore, m3Score, m4Score, compatibilityScore };
  });
  
  matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  matches.forEach((m, i) => m.rank = i + 1);
  return matches;
}
```

### 3. generateReport()

**READ:** `draft_report_outline.md` — this shows the complete interpretation pattern for Builder × Influencer. Apply this to all 256 pairings.

```javascript
function generateReport(userResults, rankedMatches) {
  const persona = getPersonaMetadata(userResults.personaCode, userResults.gender);
  
  return {
    persona: { code: userResults.personaCode, name: persona.name, tagline: persona.tagline, description: persona.description, strengths: persona.strengths, challenges: persona.challenges },
    dimensions: formatAllDimensions(userResults.m2.dimensions, userResults.gender),
    tensionAnalysis: { stacks: userResults.tensionStacks, gaps: identifyWantVsAreGaps(userResults.m1, userResults.m2) },
    connectionStyle: { wantScore: userResults.m3.wantScore, offerScore: userResults.m3.offerScore, attentiveness: userResults.attentiveness },
    conflictProfile: { approach: userResults.m4.approach, primaryDriver: userResults.m4.primaryDriver, repairSpeed: userResults.m4.repairSpeed, repairMode: userResults.m4.repairMode, capacity: userResults.m4.capacity, gottmanScores: userResults.m4.gottmanScores },
    matches: rankedMatches.map(match => ({
      rank: match.rank,
      code: match.code,
      name: match.persona.name,
      tier: match.tier,
      compatibilityScore: match.compatibilityScore,
      summary: generateMatchSummary(userResults, match),
      detail: {
        chemistry: generateChemistryAnalysis(userResults, match),
        dynamics: generateDynamicsAnalysis(userResults, match),
        conflictPrediction: generateConflictPrediction(userResults, match),
        dailyLife: generateDailyLifePreview(userResults, match),
        coaching: generateMatchCoaching(userResults, match)
      }
    })),
    growthEdges: identifyGrowthEdges(userResults),
    coaching: generateCoachingRecommendations(userResults, rankedMatches)
  };
}
```

### 4. Match Detail Generators

**READ:** `draft_report_outline.md` — follow Layer 6 (Chemistry), Layer 7 (Arcs), and Layer 8 (Coaching) patterns

```javascript
function generateConflictPrediction(user, match) {
  const targetM4 = PERSONA_TYPICAL_PROFILES[match.code].m4;
  return {
    pursueWithdrawRisk: assessPursueWithdraw(user.m4, targetM4),
    driverCollision: assessDriverCollision(user.m4, targetM4),
    repairCompatibility: assessRepairMatch(user.m4, targetM4),
    typicalPattern: describeConflictPattern(user, match),
    deescalationPath: suggestDeescalation(user.m4, targetM4)
  };
}
```

---

## Checkpoint System

**READ:** `CHECKPOINT_NOTES.md`

```javascript
async function saveCheckpoint(userId, module, responses, questionIndex) {
  await supabase.from('assessments').upsert({
    user_id: userId,
    module,
    responses,
    question_index: questionIndex,
    completed_at: questionIndex >= totalQuestions ? new Date().toISOString() : null
  }, { onConflict: 'user_id,module' });
}
```

---

## Module Completion UX

**READ:** `RELATE_ASSESSMENT_UX.md`

Between modules show:
- Simple checkmark (no confetti)
- "Module X Complete"
- One teaser insight
- Progress bar
- Continue button

---

## Monetization

| Product | Price | Access |
|---------|-------|--------|
| Free | $0 | Persona + top 3 matches (tier labels only) |
| Full Report | $19 | All 16 matches + details + coaching + Claude Advisor |
| Couples Report | $29 | Both partners + comparison + shared Advisor |

### Stripe Integration

```javascript
// /api/checkout/route.js
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{ price_data: { currency: 'usd', product_data: { name: 'RELATE Full Report' }, unit_amount: 1900 }, quantity: 1 }],
  mode: 'payment',
  success_url: `${process.env.NEXT_PUBLIC_URL}/results?success=true`,
  cancel_url: `${process.env.NEXT_PUBLIC_URL}/results?canceled=true`,
  metadata: { userId, product }
});
```

---

## Claude Advisor

```javascript
// /api/advisor/route.js
const systemPrompt = `You are RELATE Advisor. The user is a ${persona.name} (${results.persona_code}).

**Dimensions:** Physical: ${results.dimensions.physical.assignedPole}, Social: ${results.dimensions.social.assignedPole}, Lifestyle: ${results.dimensions.lifestyle.assignedPole}, Values: ${results.dimensions.values.assignedPole}

**Conflict Profile:** ${results.m4_scores.approach} approach, ${results.m4_scores.primaryDriver} driver, ${results.m4_scores.repairSpeed}/${results.m4_scores.repairMode} repair

Provide specific, actionable advice referencing their persona traits.`;

const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  system: systemPrompt,
  messages: [...history, { role: 'user', content: message }]
});
```

---

## Partner Mode

1. User sends invite with partner's email
2. System creates partnership record with token
3. Partner clicks link, signs up, completes assessment
4. When both complete, generate couples comparison

```javascript
function generateCouplesReport(user1Results, user2Results) {
  return {
    partner1: generateReport(user1Results, rankCompatiblePersonas(user1Results)),
    partner2: generateReport(user2Results, rankCompatiblePersonas(user2Results)),
    compatibility: { tier: determineTierForPairing(user1Results.personaCode, user2Results.personaCode, user1Results.gender), dimensionComparison: compareDimensions(user1Results, user2Results) },
    conflictDynamics: { pursueWithdrawRisk: assessPursueWithdraw(user1Results.m4, user2Results.m4), driverCollisions: identifyDriverCollisions(user1Results.m4, user2Results.m4) },
    coaching: generateCouplesCoaching(user1Results, user2Results)
  };
}
```

---

## Referrals

Show contextual referrals based on results:

```javascript
function generateReferrals(results) {
  const referrals = [];
  const horsemenSum = Object.values(results.m4.gottmanScores).reduce((a, b) => a + b, 0);
  
  if (horsemenSum > 50) {
    referrals.push({ service: 'betterhelp', url: 'https://betterhelp.com/?affiliate=RELATE', cta: 'Try BetterHelp' });
  }
  if (results.demographics.relationshipStatus === 'Single') {
    referrals.push({ service: 'matchmaking', url: 'https://example.com?ref=RELATE', cta: 'Connect with a Matchmaker' });
  }
  return referrals;
}
```

Track clicks in `referral_clicks` table.

---

## External Data

```javascript
const DATA_URLS = {
  cbsa: 'https://raw.githubusercontent.com/fromnineteen80/salaryarc/main/cbsa-data.js',
  zip: 'https://raw.githubusercontent.com/fromnineteen80/salaryarc/main/zip-lat-lng.json'
};
```

Fetch at runtime. Do not bundle. Do not rename fields.

---

## Environment Variables

See `.env.example` created in Step 5. Summary:

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase admin key (server only) |
| `STRIPE_SECRET_KEY` | For payments | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | For payments | Stripe webhook signing |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | For payments | Stripe public key |
| `ANTHROPIC_API_KEY` | For advisor | Claude API key |
| `NEXT_PUBLIC_URL` | Yes | App URL for redirects |
| `RESEND_API_KEY` | For invites | Email sending |
| `NEXT_PUBLIC_MOCK_AUTH` | Testing | Skip real auth |
| `NEXT_PUBLIC_MOCK_PAYMENTS` | Testing | Skip Stripe |
| `NEXT_PUBLIC_MOCK_ADVISOR` | Testing | Skip Claude API |

For initial testing, set mock flags to `true` and skip the API keys.

---

## Build Order

Each step ends with a commit. Test the deploy before moving on.

### Phase 1: Foundation
1. **Setup** — Initialize Next.js 14 with App Router, configure Tailwind with design system colors/fonts, create `.env.example`
   ```bash
   git commit -m "feat: initial Next.js setup with Tailwind"
   ```

2. **Mock Infrastructure** — Create `lib/config.js` with mock flags, create mock auth/payment utilities
   ```bash
   git commit -m "feat: add mock modes for testing"
   ```
   
3. **Database Schema** — Run SQL in Supabase, verify tables created
   ```bash
   git commit -m "docs: add database schema"
   ```

### Phase 2: Auth + Demographics
4. **Auth Pages** — Login/signup with Supabase (or mock mode), protected route middleware
   ```bash
   git commit -m "feat: authentication flow"
   ```

5. **Demographics Form** — (read: `relate_demographics_engine.js`) Full intake form with all 27 fields, store in users table
   ```bash
   git commit -m "feat: demographics intake"
   ```

**TEST:** Sign up → complete demographics → verify data in Supabase

### Phase 3: Assessment
6. **Assessment UI** — (read: `RELATE_ASSESSMENT_UX.md`) Question component, progress bar, module navigation shell
   ```bash
   git commit -m "feat: assessment UI components"
   ```

7. **Module 1** — (read: `relate_questions.js` → M1 questions) Load questions by gender, Likert + forced choice UIs, checkpoint save
   ```bash
   git commit -m "feat: module 1 - what you want"
   ```

8. **Module 2** — (read: `relate_questions.js` → M2 questions) Same pattern, include validation checks
   ```bash
   git commit -m "feat: module 2 - who you are"
   ```

9. **Module 3** — (read: `relate_questions.js` → M3 questions) Want/offer/attentiveness
   ```bash
   git commit -m "feat: module 3 - how you connect"
   ```

10. **Module 4** — (read: `relate_questions.js` → M4 questions) Conflict patterns, gottman screener, attentiveness
    ```bash
    git commit -m "feat: module 4 - conflict patterns"
    ```

**TEST:** Complete full assessment → verify checkpoints save → verify all responses stored

### Phase 4: Scoring + Results
11. **Scoring Integration** — Import all scoring functions, call after Module 4, store results
    ```bash
    git commit -m "feat: scoring integration"
    ```

12. **Orchestration Layer** — (read: `relate_persona_definitions.js`, `draft_report_outline.md`) Build PERSONA_TYPICAL_PROFILES, rankCompatiblePersonas(), generateReport()
    ```bash
    git commit -m "feat: compatibility ranking and report generation"
    ```

13. **Results UI** — Persona profile, dimension bars, match ranking table, expandable details, paywall
    ```bash
    git commit -m "feat: results display"
    ```

**TEST:** Complete assessment → see correct persona → see 16 ranked matches → paywall blocks details

### Phase 5: Monetization
14. **Stripe Integration** — Checkout flow, webhook handler, access control
    ```bash
    git commit -m "feat: stripe payments"
    ```

**TEST:** (Use Stripe test mode) Purchase → verify webhook → verify full access unlocked

### Phase 6: Advanced Features
15. **Claude Advisor** — Chat UI, API route with persona context in system prompt
    ```bash
    git commit -m "feat: claude advisor"
    ```

16. **Partner Mode** — Invitation flow, couples report generation, comparison view
    ```bash
    git commit -m "feat: partner invitations and comparison"
    ```

17. **Referrals** — Conditional display based on results, click tracking
    ```bash
    git commit -m "feat: referral tracking"
    ```

### Phase 7: Polish
18. **Polish** — Loading states, error handling, mobile responsive, PDF export
    ```bash
    git commit -m "fix: polish and responsive design"
    ```

### Phase 8: Data Refresh (Post-Launch)
Once the app is working, refresh the demographic datasets with current sources.

19. **Audit Current Data** — Document all CBSA fields currently used, identify what's stale
20. **Collect Fresh Sources** — Pull latest Census ACS 5-year, BLS metro data, demographic surveys
21. **Generate New Dataset** — Match existing schema exactly (field names, structure) so it's drop-in compatible
22. **Move Into Repo** — Place updated `cbsa-data.js` and `zip-centroids.js` in `/public/data/` instead of fetching from external salaryarc repo
23. **Update Fetch URLs** — Change data URLs to local paths:
    ```javascript
    // Before (external)
    const CBSA_URL = 'https://raw.githubusercontent.com/fromnineteen80/salaryarc/main/cbsa-data.js';
    
    // After (local)
    const CBSA_URL = '/data/cbsa-data.js';
    ```
24. **Validate** — Compare old vs new outputs, verify calculations still work
    ```bash
    git commit -m "feat: refresh demographic data with 2024 sources"
    ```

**Data sources for refresh:**
- Census ACS 5-year estimates (demographics, income, education)
- BLS Quarterly Census of Employment and Wages (metro income)
- CDC BRFSS (fitness, health behaviors)
- Pew Research (political, religious affiliation)
- Census ZCTA shapefiles (ZIP centroids)

---

## Success Criteria

**Deployment:**
- [ ] Every commit triggers Vercel deploy
- [ ] Live URL accessible after each push
- [ ] Mock mode works without API keys

**Core Flow:**
- [ ] Sign up → demographics → 4 modules with checkpoints → results
- [ ] Correct persona code from scoring
- [ ] All 16 matches correctly tiered
- [ ] Resume from checkpoint works

**Monetization:**
- [ ] Paywall blocks full results
- [ ] Stripe test payment unlocks access
- [ ] Payment status persists

**Advanced:**
- [ ] Claude Advisor loads with profile context
- [ ] Partner invitation and comparison work
- [ ] Referral clicks tracked

**Quality:**
- [ ] Design matches spec (serif headings, dense layout)
- [ ] Mobile responsive
- [ ] No console errors

---

Start by reading this document completely. Then read the attached files in order. Set up the GitHub → Vercel pipeline first, then begin coding.
