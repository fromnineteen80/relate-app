'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { lookupZip } from '@/lib/zip-lookup';
import { SiteHeader } from '@/components/SiteHeader';

export default function ProfileSetupPage() {
  const { user, loading, emailVerified } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [county, setCounty] = useState('');
  const [counties, setCounties] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);

  // Load saved profile on mount
  useEffect(() => {
    const stored = localStorage.getItem('relate_profile');
    if (stored) {
      try {
        const p = JSON.parse(stored);
        setFirstName(p.firstName || '');
        setLastName(p.lastName || '');
        setZipCode(p.zipCode || '');
        setCity(p.city || '');
        setState(p.state || '');
        setCounty(p.county || '');
        setPhotoUrl(p.photoUrl || null);
      } catch { /* ignore */ }
    }
    // Also load legacy photo
    const legacyPhoto = localStorage.getItem('relate_profile_photo');
    if (legacyPhoto && !photoUrl) setPhotoUrl(legacyPhoto);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guard: must be logged in and verified
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (!loading && user && !emailVerified) {
      router.push('/auth/verify-email');
    }
  }, [loading, user, emailVerified, router]);

  const saveProfile = useCallback(() => {
    const profile = { firstName, lastName, zipCode, city, state, county, photoUrl };
    localStorage.setItem('relate_profile', JSON.stringify(profile));
    // Also save name for legacy profile settings compat
    localStorage.setItem('relate_profile_name', `${firstName} ${lastName}`.trim());
    if (photoUrl) localStorage.setItem('relate_profile_photo', photoUrl);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1500);
  }, [firstName, lastName, zipCode, city, state, county, photoUrl]);

  // Zip code lookup
  useEffect(() => {
    if (zipCode.length !== 5) {
      setCounties([]);
      return;
    }
    let cancelled = false;
    setZipLoading(true);
    lookupZip(zipCode).then(result => {
      if (cancelled) return;
      setZipLoading(false);
      if (result) {
        setCity(result.city);
        setState(result.state);
        setCounties(result.counties);
        if (result.counties.length === 1) {
          setCounty(result.counties[0]);
        } else {
          setCounty('');
        }
      }
    });
    return () => { cancelled = true; };
  }, [zipCode]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    setPhotoUrl(null);
    localStorage.removeItem('relate_profile_photo');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const canContinue = firstName.trim() && lastName.trim() && zipCode.match(/^\d{5}$/) && city && state && county;

  function handleContinue() {
    saveProfile();
    router.push('/onboarding/demographics');
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;
  }

  const initial = firstName ? firstName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || '?';

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
          <span className="font-mono text-xs text-secondary">Step 1 of 3</span>
          <h2 className="font-serif text-2xl font-semibold mt-1">Set up your profile</h2>
          <p className="text-sm text-secondary">Your name and location help personalize your experience.</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 mb-8">
          <div className="h-1 flex-1 rounded-full bg-accent" />
          <div className="h-1 flex-1 rounded-full bg-stone-200" />
          <div className="h-1 flex-1 rounded-full bg-stone-200" />
        </div>

        <div className="space-y-6">
          {/* Photo */}
          <div className="card">
            <p className="text-sm text-secondary mb-3">Profile Photo (optional)</p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 border-2 border-border">
                {photoUrl ? (
                  <Image src={photoUrl} alt="Profile" width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center bg-accent/10 text-accent text-xl font-medium">
                    {initial}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="btn-secondary text-xs">
                  {photoUrl ? 'Change Photo' : 'Upload Photo'}
                </button>
                {photoUrl && (
                  <button onClick={handleRemovePhoto} className="text-xs text-danger hover:underline text-left">
                    Remove
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-secondary mt-2">Max 2MB. JPG, PNG, or WebP.</p>
          </div>

          {/* Name */}
          <div className="card space-y-4">
            <div>
              <label className="label">First Name *</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                onBlur={saveProfile}
                className="input"
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                onBlur={saveProfile}
                className="input"
                placeholder="Smith"
              />
            </div>
          </div>

          {/* Location */}
          <div className="card space-y-4">
            <div>
              <label className="label">ZIP Code *</label>
              <input
                type="text"
                value={zipCode}
                onChange={e => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                onBlur={saveProfile}
                className="input"
                maxLength={5}
                placeholder="10001"
              />
              {zipLoading && <p className="text-xs text-secondary mt-1">Looking up...</p>}
            </div>

            <div>
              <label className="label">City</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                onBlur={saveProfile}
                className="input"
                placeholder={zipCode.length === 5 ? 'Auto-filled from ZIP' : 'Enter ZIP code first'}
              />
            </div>

            <div>
              <label className="label">State</label>
              <input
                type="text"
                value={state}
                readOnly
                className="input bg-stone-50"
                placeholder="Auto-filled from ZIP"
              />
            </div>

            <div>
              <label className="label">County *</label>
              {counties.length > 1 ? (
                <select
                  value={county}
                  onChange={e => { setCounty(e.target.value); }}
                  onBlur={saveProfile}
                  className="input"
                >
                  <option value="">Select your county...</option>
                  {counties.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  value={county}
                  onChange={e => setCounty(e.target.value)}
                  onBlur={saveProfile}
                  className="input"
                  placeholder={zipCode.length === 5 ? 'Auto-filled from ZIP' : 'Enter ZIP code first'}
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="btn-primary w-full"
          >
            Continue to Demographics
          </button>
        </div>
      </main>
    </div>
  );
}
