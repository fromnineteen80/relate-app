'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { useAuth } from '@/lib/auth-context';
import { config } from '@/lib/config';
import { getSupabase } from '@/lib/supabase/client';
import { isProfileComplete, getProfile } from '@/lib/onboarding';

const ETHNICITIES = ['White','Hispanic/Latino','Black','Asian','Native American','Pacific Islander','Other/Mixed'];
const ORIENTATIONS = ['Straight','Gay/Lesbian','Bisexual','Other'];
const EDUCATION_LEVELS = ['Less than High School','High School Graduate','Trade/Vocational','Associate Degree','Some College','Bachelor\'s Degree','Graduate Degree'];
const HEIGHTS = [
  '4\'10"','4\'11"','5\'0"','5\'1"','5\'2"','5\'3"','5\'4"','5\'5"','5\'6"','5\'7"',
  '5\'8"','5\'9"','5\'10"','5\'11"','6\'0"','6\'1"','6\'2"','6\'3"','6\'4"','6\'5"','6\'6"','6\'7"','6\'8"',
];
const BODY_TYPES = ['Lean or Fit','Average','Overweight','Obese'];
const FITNESS_LEVELS = ['Never','1 day a week','2 to 3 days a week','4 to 6 days a week','Every day'];
const POLITICAL_VIEWS = ['Apolitical','Liberal','Moderate','Conservative'];

type FormData = {
  gender: string;
  age: string;
  ethnicity: string;
  orientation: string;
  income: number;
  education: string;
  height: string;
  bodyType: string;
  fitness: string;
  political: string;
  smoking: string;
  hasKids: string;
  wantKids: string;
  relationshipStatus: string;
  prefAgeMin: string;
  prefAgeMax: string;
  prefIncome: number;
  prefHeight: string;
  prefBodyTypes: string[];
  prefFitnessLevels: string[];
  prefPolitical: string[];
  prefHasKids: string;
  prefSmoking: string;
  seeking: string;
};

const SECTIONS = [
  { id: 'identity', title: 'Identity', subtitle: 'Core demographics' },
  { id: 'about', title: 'About You', subtitle: 'Your profile' },
  { id: 'preferences', title: 'Partner Preferences', subtitle: 'What you\'re looking for' },
  { id: 'context', title: 'Context', subtitle: 'Why you\'re here' },
];

function formatCurrency(val: number) {
  if (val >= 1000000) return '$1M+';
  return '$' + val.toLocaleString();
}

export default function DemographicsPage() {
  const { user, loading, emailVerified } = useAuth();
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedToast, setSavedToast] = useState(false);

  const [form, setForm] = useState<FormData>({
    gender: '', age: '', ethnicity: '', orientation: 'Straight',
    income: 50000, education: '', height: '', bodyType: '', fitness: '',
    political: '', smoking: '', hasKids: '', wantKids: '', relationshipStatus: '',
    prefAgeMin: '', prefAgeMax: '', prefIncome: 0, prefHeight: '',
    prefBodyTypes: [], prefFitnessLevels: [], prefPolitical: [],
    prefHasKids: '', prefSmoking: '', seeking: '',
  });

  // Load saved demographics on mount
  useEffect(() => {
    const stored = localStorage.getItem('relate_demographics_draft');
    if (stored) {
      try {
        const d = JSON.parse(stored);
        setForm(prev => ({ ...prev, ...d }));
      } catch { /* ignore */ }
    }
  }, []);

  // Guard: must be logged in, verified, and have profile completed
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (!loading && user && !emailVerified) {
      router.push('/auth/verify-email');
    } else if (!loading && user && emailVerified && !isProfileComplete()) {
      router.push('/onboarding/profile');
    }
  }, [loading, user, emailVerified, router]);

  function updateField(field: keyof FormData, value: string | number | string[]) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function toggleMultiSelect(field: 'prefBodyTypes' | 'prefFitnessLevels' | 'prefPolitical', value: string) {
    setForm(prev => {
      const current = prev[field];
      if (value === 'No preference') return { ...prev, [field]: ['No preference'] };
      const without = current.filter(v => v !== 'No preference');
      if (without.includes(value)) return { ...prev, [field]: without.filter(v => v !== value) };
      return { ...prev, [field]: [...without, value] };
    });
  }

  const autoSave = useCallback(() => {
    localStorage.setItem('relate_demographics_draft', JSON.stringify(form));
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1500);
  }, [form]);

  function canAdvance() {
    switch (currentSection) {
      case 0: return form.gender && form.age && form.ethnicity && form.orientation;
      case 1: {
        const base = form.income >= 0 && form.education && form.bodyType && form.fitness &&
          form.political && form.smoking && form.hasKids && form.wantKids && form.relationshipStatus;
        if (form.gender === 'Man') return base && form.height;
        return base;
      }
      case 2: {
        const base = form.prefAgeMin && form.prefAgeMax && form.prefBodyTypes.length > 0 &&
          form.prefFitnessLevels.length > 0 && form.prefPolitical.length > 0 &&
          form.prefHasKids && form.prefSmoking;
        if (form.gender === 'Woman') return base && form.prefHeight;
        return base;
      }
      case 3: return !!form.seeking;
      default: return false;
    }
  }

  function handleAdvance() {
    autoSave();
    setCurrentSection(prev => prev + 1);
  }

  async function handleSave() {
    setSaving(true);
    setError('');

    const profile = getProfile();

    const userData = {
      gender: form.gender === 'Man' ? 'M' : 'W',
      age: parseInt(form.age),
      zip_code: profile?.zipCode || '',
      city: profile?.city || '',
      state: profile?.state || '',
      county: profile?.county || '',
      ethnicity: form.ethnicity,
      orientation: form.orientation,
      income: form.income,
      education: form.education,
      height: form.height || null,
      body_type: form.bodyType,
      fitness_level: form.fitness,
      political: form.political,
      smoking: form.smoking === 'Yes',
      has_kids: form.hasKids === 'Yes',
      want_kids: form.wantKids,
      relationship_status: form.relationshipStatus,
      pref_age_min: parseInt(form.prefAgeMin),
      pref_age_max: parseInt(form.prefAgeMax),
      pref_income_min: form.prefIncome,
      pref_height_min: form.prefHeight || null,
      pref_body_types: form.prefBodyTypes,
      pref_fitness_levels: form.prefFitnessLevels,
      pref_smoking: form.prefSmoking,
      pref_has_kids: form.prefHasKids,
      pref_want_kids: form.wantKids,
      pref_ethnicities: [],
      pref_political: form.prefPolitical,
      pref_education_min: null,
      seeking: form.seeking,
    };

    if (config.useMockAuth) {
      localStorage.setItem('relate_demographics', JSON.stringify(userData));
      localStorage.setItem('relate_gender', userData.gender);
      localStorage.removeItem('relate_demographics_draft');
      router.push('/account');
      return;
    }

    try {
      const supabase = getSupabase();
      if (!supabase || !user) throw new Error('Not authenticated');
      const { error: dbError } = await supabase.from('users').upsert({ id: user.id, email: user.email, ...userData });
      if (dbError) throw dbError;
      localStorage.setItem('relate_demographics', JSON.stringify(userData));
      localStorage.setItem('relate_gender', userData.gender);
      localStorage.removeItem('relate_demographics_draft');
      router.push('/account');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setSaving(false);
    }
  }

  function renderSection() {
    switch (currentSection) {
      case 0: return (
        <div className="space-y-4">
          <div>
            <label className="label">Gender *</label>
            <select value={form.gender} onChange={e => updateField('gender', e.target.value)} className="input">
              <option value="">Select...</option>
              <option value="Man">Man</option>
              <option value="Woman">Woman</option>
            </select>
          </div>
          <div>
            <label className="label">Age *</label>
            <input type="number" value={form.age} onChange={e => updateField('age', e.target.value)}
              className="input" min={18} max={100} placeholder="25" />
          </div>
          <div>
            <label className="label">Ethnicity *</label>
            <select value={form.ethnicity} onChange={e => updateField('ethnicity', e.target.value)} className="input">
              <option value="">Select...</option>
              {ETHNICITIES.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Sexual Orientation *</label>
            <select value={form.orientation} onChange={e => updateField('orientation', e.target.value)} className="input">
              {ORIENTATIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      );

      case 1: return (
        <div className="space-y-4">
          <div>
            <label className="label">Annual Income *</label>
            <input type="range" min={0} max={1000000} step={10000} value={form.income}
              onChange={e => updateField('income', parseInt(e.target.value))}
              className="w-full accent-accent" />
            <span className="text-sm font-mono text-secondary">{formatCurrency(form.income)}</span>
          </div>
          <div>
            <label className="label">Education *</label>
            <select value={form.education} onChange={e => updateField('education', e.target.value)} className="input">
              <option value="">Select...</option>
              {EDUCATION_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          {form.gender === 'Man' && (
            <div>
              <label className="label">Height *</label>
              <select value={form.height} onChange={e => updateField('height', e.target.value)} className="input">
                <option value="">Select...</option>
                {HEIGHTS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Body Type *</label>
            <select value={form.bodyType} onChange={e => updateField('bodyType', e.target.value)} className="input">
              <option value="">Select...</option>
              {BODY_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Fitness Level *</label>
            <select value={form.fitness} onChange={e => updateField('fitness', e.target.value)} className="input">
              <option value="">Select...</option>
              {FITNESS_LEVELS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Political Views *</label>
            <select value={form.political} onChange={e => updateField('political', e.target.value)} className="input">
              <option value="">Select...</option>
              {POLITICAL_VIEWS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Do you smoke? *</label>
            <select value={form.smoking} onChange={e => updateField('smoking', e.target.value)} className="input">
              <option value="">Select...</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="label">Do you have children? *</label>
            <select value={form.hasKids} onChange={e => updateField('hasKids', e.target.value)} className="input">
              <option value="">Select...</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="label">Do you want children (or more children)? *</label>
            <select value={form.wantKids} onChange={e => updateField('wantKids', e.target.value)} className="input">
              <option value="">Select...</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Maybe">Maybe</option>
            </select>
          </div>
          <div>
            <label className="label">Relationship Status *</label>
            <select value={form.relationshipStatus} onChange={e => updateField('relationshipStatus', e.target.value)} className="input">
              <option value="">Select...</option>
              <option value="Single">Single</option>
              <option value="Dating">Dating</option>
              <option value="Separated">Separated</option>
              <option value="Married">Married</option>
            </select>
          </div>
        </div>
      );

      case 2: return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Min Age *</label>
              <input type="number" value={form.prefAgeMin} onChange={e => updateField('prefAgeMin', e.target.value)}
                className="input" min={18} max={100} placeholder="18" />
            </div>
            <div>
              <label className="label">Max Age *</label>
              <input type="number" value={form.prefAgeMax} onChange={e => updateField('prefAgeMax', e.target.value)}
                className="input" min={18} max={100} placeholder="45" />
            </div>
          </div>
          <div>
            <label className="label">Minimum Partner Income</label>
            <input type="range" min={0} max={1000000} step={10000} value={form.prefIncome}
              onChange={e => updateField('prefIncome', parseInt(e.target.value))}
              className="w-full accent-accent" />
            <span className="text-sm font-mono text-secondary">{formatCurrency(form.prefIncome)}</span>
          </div>
          {form.gender === 'Woman' && (
            <div>
              <label className="label">Minimum Height *</label>
              <select value={form.prefHeight} onChange={e => updateField('prefHeight', e.target.value)} className="input">
                <option value="">Select...</option>
                <option value="No preference">No preference</option>
                {HEIGHTS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Acceptable Body Types *</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {['No preference', ...BODY_TYPES].map(bt => (
                <button key={bt} type="button" onClick={() => toggleMultiSelect('prefBodyTypes', bt)}
                  className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                    form.prefBodyTypes.includes(bt) ? 'bg-accent text-white border-accent' : 'border-border hover:border-accent'
                  }`}>
                  {bt}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Acceptable Fitness Levels *</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {['No preference', ...FITNESS_LEVELS].map(fl => (
                <button key={fl} type="button" onClick={() => toggleMultiSelect('prefFitnessLevels', fl)}
                  className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                    form.prefFitnessLevels.includes(fl) ? 'bg-accent text-white border-accent' : 'border-border hover:border-accent'
                  }`}>
                  {fl}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Acceptable Political Views *</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {['No preference', ...POLITICAL_VIEWS].map(pv => (
                <button key={pv} type="button" onClick={() => toggleMultiSelect('prefPolitical', pv)}
                  className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                    form.prefPolitical.includes(pv) ? 'bg-accent text-white border-accent' : 'border-border hover:border-accent'
                  }`}>
                  {pv}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Would you date someone who has kids? *</label>
            <select value={form.prefHasKids} onChange={e => updateField('prefHasKids', e.target.value)} className="input">
              <option value="">Select...</option>
              <option value="No preference">No preference</option>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          <div>
            <label className="label">Would you date someone who smokes? *</label>
            <select value={form.prefSmoking} onChange={e => updateField('prefSmoking', e.target.value)} className="input">
              <option value="">Select...</option>
              <option value="No preference">No preference</option>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
        </div>
      );

      case 3: return (
        <div className="space-y-4">
          <div>
            <label className="label">What brings you to RELATE? *</label>
            <div className="space-y-2 mt-2">
              {[
                { value: 'partner', label: 'Finding a compatible partner' },
                { value: 'self-knowledge', label: 'Understanding myself better' },
                { value: 'relationship-improvement', label: 'Improving my current relationship' },
              ].map(opt => (
                <button key={opt.value} type="button" onClick={() => updateField('seeking', opt.value)}
                  className={`w-full text-left text-sm px-4 py-3 rounded-md border transition-colors ${
                    form.seeking === opt.value ? 'border-accent bg-orange-50' : 'border-border hover:border-accent'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-lg mx-auto px-6 py-8 w-full">
        {/* Saved toast */}
        {savedToast && (
          <div className="fixed top-4 right-4 bg-success text-white text-xs px-3 py-1.5 rounded-md shadow-lg z-50 animate-fade-in">
            Saved
          </div>
        )}

        <div className="mb-6">
          <span className="font-mono text-xs text-secondary">Step 2 of 3</span>
          <h2 className="font-serif text-2xl font-semibold mt-1">{SECTIONS[currentSection].title}</h2>
          <p className="text-sm text-secondary">{SECTIONS[currentSection].subtitle}</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 mb-8">
          <div className="h-1 flex-1 rounded-full bg-accent" />
          <div className="h-1 flex-1 rounded-full bg-accent" />
          <div className="h-1 flex-1 rounded-full bg-stone-200" />
        </div>

        {/* Section progress */}
        <div className="flex gap-1 mb-6">
          {SECTIONS.map((s, i) => (
            <div key={s.id} className={`h-1 flex-1 rounded-full ${i <= currentSection ? 'bg-accent' : 'bg-stone-200'}`} />
          ))}
        </div>

        {renderSection()}

        {error && <p className="text-sm text-danger mt-4">{error}</p>}

        <div className="flex justify-between mt-8">
          <button
            onClick={() => {
              autoSave();
              if (currentSection === 0) {
                router.push('/onboarding/profile');
              } else {
                setCurrentSection(prev => prev - 1);
              }
            }}
            className="btn-secondary"
          >
            Back
          </button>
          {currentSection < SECTIONS.length - 1 ? (
            <button
              onClick={handleAdvance}
              className="btn-primary"
              disabled={!canAdvance()}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="btn-primary"
              disabled={!canAdvance() || saving}
            >
              {saving ? 'Saving...' : 'Continue to Account'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
