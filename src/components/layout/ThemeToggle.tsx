'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'dark' : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'ライトモードに切替' : 'ダークモードに切替'}
      className="grid place-items-center w-9 h-9 rounded-full bg-paper border border-hairline text-ink-2 hover:text-ink hover:bg-paper-elev transition-colors"
    >
      {mounted ? (dark ? <Sun size={15} /> : <Moon size={15} />) : <Sun size={15} className="opacity-0" />}
    </button>
  );
}
