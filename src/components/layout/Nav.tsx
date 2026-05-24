'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BookOpen, Languages, FileText, LayoutDashboard, Brain, FileEdit, BarChart3, Archive, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/',            label: 'ホーム',   icon: LayoutDashboard },
  { href: '/vocabulary',  label: '語彙',     icon: Languages },
  { href: '/grammar',     label: '文法',     icon: BookOpen },
  { href: '/exercises',   label: '演習',     icon: FileEdit },
  { href: '/reading',     label: '読解',     icon: FileText },
  { href: '/srs',         label: 'SRS',      icon: Brain },
  { href: '/analytics',   label: '分析',     icon: BarChart3 },
  { href: '/past-tests',  label: '過去問',   icon: Archive },
];

export default function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-ink/10 bg-aged-paper/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="font-serif text-2xl text-vermillion font-bold leading-none">日</span>
          <span className="font-semibold text-ink tracking-wide text-sm hidden xs:inline">JLPT N1</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 overflow-x-auto">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-sm transition-all whitespace-nowrap',
                pathname === href
                  ? 'bg-vermillion text-white font-medium'
                  : 'text-ink/70 hover:text-ink hover:bg-ink/5'
              )}
            >
              <Icon size={14} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden p-2 rounded text-ink/60 hover:text-ink hover:bg-ink/5 transition-colors"
            aria-label="メニュー"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-ink/10 bg-aged-paper/95 backdrop-blur-sm">
          <nav className="max-w-5xl mx-auto px-4 py-3 grid grid-cols-4 gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-2.5 rounded text-xs transition-all',
                  pathname === href
                    ? 'bg-vermillion text-white font-medium'
                    : 'text-ink/60 hover:text-ink hover:bg-ink/5'
                )}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
