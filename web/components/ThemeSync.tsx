'use client';

import { useEffect } from 'react';
import { useAppSelector } from '../lib/hooks';

export function ThemeSync() {
  const mode = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(`theme-${mode}`);
  }, [mode]);

  return null;
}
