'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { SubNav } from '@/components/SubNav';
import { saveProfileToDb } from '@/lib/supabase/progress';

/* eslint-disable @typescript-eslint/no-explicit-any */

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-xs text-secondary">{label}</span>
      <span className="text-xs font-mono">{value}</span>
    </div>
  );
}

function formatCurrency(val: number) {
  if (val >= 1000000) return '$1M+';
  return '$' + val.toLocaleString();
}

export default function ProfileSettings() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [demographics, setDemographics] = useState<any>(null);

  useEffect(() => {
    setName(localStorage.getItem('relate_profile_name') || '');
    setPhotoUrl(localStorage.getItem('relate_profile_photo') || null);

    const storedProfile = localStorage.getItem('relate_profile');
    if (storedProfile) {
      try { setProfile(JSON.parse(storedProfile)); } catch { /* ignore */ }
    }

    const storedDemo = localStorage.getItem('relate_demographics');
    if (storedDemo) {
      try { setDemographics(JSON.parse(storedDemo)); } catch { /* ignore */ }
    }
  }, []);

  function handleSave() {
    localStorage.setItem('relate_profile_name', name.trim());
    const stored = localStorage.getItem('relate_profile');
    const p = stored ? JSON.parse(stored) : {};
    const parts = name.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    p.firstName = firstName;
    p.lastName = lastName;
    localStorage.setItem('relate_profile', JSON.stringify(p));
    if (user) {
      saveProfileToDb(user.id, user.email, {
        firstName,
        lastName,
        zipCode: p.zipCode || '',
        city: p.city || '',
        state: p.state || '',
        county: p.county || '',
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      localStorage.setItem('relate_profile_photo', dataUrl);
      setPhotoUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    localStorage.removeItem('relate_profile_photo');
    setPhotoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  const initial = name ? name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || '?';

  // Format demographics display values
  const genderDisplay = demographics?.gender === 'M' ? 'Man' : demographics?.gender === 'W' ? 'Woman' : demographics?.gender || null;
  const smokingDisplay = demographics?.smoking === true ? 'Yes' : demographics?.smoking === false ? 'No' : demographics?.smoking || null;
  const hasKidsDisplay = demographics?.has_kids === true ? 'Yes' : demographics?.has_kids === false ? 'No' : demographics?.has_kids || null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SubNav />
      <main className="max-w-2xl mx-auto px-6 py-8 w-full">
        <h2 className="font-serif text-2xl font-semibold mb-6">Edit Profile</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Photo */}
          <div className="card">
            <p className="text-sm text-secondary mb-3">Profile Photo</p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 border-2 border-border">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center bg-accent/10 text-accent text-xl font-medium">
                    {initial}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary text-xs"
                >
                  {photoUrl ? 'Change Photo' : 'Upload Photo'}
                </button>
                {photoUrl && (
                  <button
                    onClick={handleRemovePhoto}
                    className="text-xs text-danger hover:underline text-left"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-secondary mt-2">Max 2MB. JPG, PNG, or WebP.</p>
          </div>

          {/* Name & Email */}
          <div className="card">
            <label className="text-sm text-secondary block mb-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="input mb-3"
            />
            <button onClick={handleSave} className="btn-secondary text-xs mb-4">
              {saved ? 'Saved' : 'Save Name'}
            </button>
            <p className="text-sm text-secondary">Email</p>
            <p className="font-mono text-sm">{user?.email || '-'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* About You (Step 2) */}
          {demographics ? (
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">About You</p>
                <Link href="/onboarding/demographics" className="text-xs text-accent hover:underline">Edit</Link>
              </div>
              <InfoRow label="Gender" value={genderDisplay} />
              <InfoRow label="Age" value={demographics.age?.toString()} />
              <InfoRow label="Ethnicity" value={demographics.ethnicity} />
              <InfoRow label="Orientation" value={demographics.orientation} />
              <InfoRow label="Income" value={demographics.income != null ? formatCurrency(demographics.income) : null} />
              <InfoRow label="Education" value={demographics.education} />
              <InfoRow label="Height" value={demographics.height} />
              <InfoRow label="Body Type" value={demographics.body_type} />
              <InfoRow label="Fitness" value={demographics.fitness_level} />
              <InfoRow label="Political" value={demographics.political} />
              <InfoRow label="Smoking" value={smokingDisplay} />
              <InfoRow label="Has Kids" value={hasKidsDisplay} />
              <InfoRow label="Want Kids" value={demographics.want_kids} />
              <InfoRow label="Status" value={demographics.relationship_status} />
            </div>
          ) : (
            <Link href="/onboarding/demographics" className="btn-secondary block text-center">
              Complete Demographics
            </Link>
          )}

          {/* Partner Preferences */}
          {demographics?.pref_age_min != null && (
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Partner Preferences</p>
                <Link href="/onboarding/demographics" className="text-xs text-accent hover:underline">Edit</Link>
              </div>
              <InfoRow label="Age Range" value={`${demographics.pref_age_min} – ${demographics.pref_age_max}`} />
              <InfoRow label="Min Income" value={demographics.pref_income_min != null ? formatCurrency(demographics.pref_income_min) : null} />
              <InfoRow label="Min Height" value={demographics.pref_height_min} />
              <InfoRow label="Body Types" value={demographics.pref_body_types?.join(', ')} />
              <InfoRow label="Fitness" value={demographics.pref_fitness_levels?.join(', ')} />
              <InfoRow label="Political" value={demographics.pref_political?.join(', ')} />
              <InfoRow label="Partner Has Kids" value={demographics.pref_has_kids} />
              <InfoRow label="Partner Wants Kids" value={demographics.pref_want_kids} />
              <InfoRow label="Partner Smokes" value={demographics.pref_smoking} />
              <InfoRow label="Seeking" value={demographics.seeking} />
            </div>
          )}
        </div>

        {/* Location — last card */}
        {profile && (
          <div className="card mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Location</p>
              <Link href="/onboarding/profile" className="text-xs text-accent hover:underline">Edit</Link>
            </div>
            <InfoRow label="City" value={profile.city} />
            <InfoRow label="State" value={profile.state} />
            <InfoRow label="County" value={profile.county} />
            <InfoRow label="ZIP" value={profile.zipCode} />
          </div>
        )}

        <div className="pt-4 border-t border-border flex justify-end">
          <button onClick={handleSignOut} className="btn-secondary text-xs">
            Sign out
          </button>
        </div>
      </main>
    </div>
  );
}
