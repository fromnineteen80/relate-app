'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAdvisor } from '@/lib/advisor-context';
import { Icon } from '@/components/Icon';

export default function AdvisorHeader() {
  const { close } = useAdvisor();
  const [initial, setInitial] = useState('?');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isWoman, setIsWoman] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem('relate_profile_name');
    const email = localStorage.getItem('relate_user_email');
    const photo = localStorage.getItem('relate_profile_photo');
    const g = localStorage.getItem('relate_gender');
    setInitial(name ? name.charAt(0).toUpperCase() : email ? email.charAt(0).toUpperCase() : '?');
    setPhotoUrl(photo);
    setIsWoman(g === 'W' || g === 'Woman');
  }, []);

  return (
    <div className="border-b border-border bg-white px-6 py-2 flex-shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-base font-semibold tracking-tight">Your Advisor</h2>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold overflow-hidden border-2 border-transparent`}>
            {photoUrl ? (
              <Image src={photoUrl} alt="Profile" width={28} height={28} className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className={`w-full h-full flex items-center justify-center ${isWoman ? 'text-rose-400 bg-rose-400/15' : 'text-blue-500 bg-blue-500/15'}`}>
                {initial}
              </span>
            )}
          </div>
          {/* Sidebar panel icon — close sidebar, matches hamburger icon style */}
          <button
            onClick={close}
            aria-label="Close sidebar"
            title="Close sidebar"
            className="group relative text-secondary hover:text-foreground transition-colors p-1"
          >
            <Icon name="thumbnail_bar" size={19} fill={false} weight={300} />
            {/* Tooltip */}
            <span className="absolute right-0 top-full mt-1 px-2 py-1 text-xs text-secondary bg-white border border-border rounded shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
              Close sidebar
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
