'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';

export default function ProfileSettings() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(localStorage.getItem('relate_profile_name') || '');
    setPhotoUrl(localStorage.getItem('relate_profile_photo') || null);
  }, []);

  function handleSave() {
    localStorage.setItem('relate_profile_name', name.trim());
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

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="max-w-md mx-auto px-6 py-8 w-full">
        <h2 className="font-serif text-2xl font-semibold mb-6">Edit Profile</h2>

        {/* Photo */}
        <div className="card mb-4">
          <p className="text-sm text-secondary mb-3">Profile Photo</p>
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

        {/* Name */}
        <div className="card mb-4">
          <label className="text-sm text-secondary block mb-1">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="input mb-3"
          />
          <button onClick={handleSave} className="btn-primary text-xs">
            {saved ? 'Saved' : 'Save Name'}
          </button>
        </div>

        {/* Email (read-only) */}
        <div className="card mb-4">
          <p className="text-sm text-secondary">Email</p>
          <p className="font-mono text-sm">{user?.email || '-'}</p>
        </div>

        <Link href="/onboarding/demographics" className="btn-secondary block text-center mb-4">
          Update Demographics
        </Link>
        <button onClick={handleSignOut} className="text-sm text-danger hover:underline">
          Sign out
        </button>
      </main>
    </div>
  );
}
