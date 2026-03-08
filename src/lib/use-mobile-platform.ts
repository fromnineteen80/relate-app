'use client';

import { useState, useEffect } from 'react';

/**
 * Detects iOS or Android via user agent string.
 * Returns false on tablets with desktop-class screens, desktops, and all non-mobile platforms.
 * This is NOT a responsive breakpoint — it targets the actual platform.
 */
export function useIsMobileDevice(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    const isIOS = /iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua) && /Mobile/.test(ua);
    setIsMobile(isIOS || isAndroid);
  }, []);

  return isMobile;
}
