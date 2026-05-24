'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BookOpen, Languages, FileText, LayoutDashboard, Brain, FileEdit, BarChart3, Archive } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/',            label: 'ホーム',  short: 'ホーム',  icon: LayoutDashboard },
  { href: '/vocabulary',  label: '語彙',    short: '語彙',    icon: Languages },
  { href: '/grammar',     label: '文法',    short: '文法',    icon: BookOpen },
  { href: '/exercises',   label: '演習',    short: '演習',    icon: FileEdit },
  { href: '/reading',     label: '読解',    short: '読解',    icon: FileText },
  { href: '/srs',         label: 'SRS',     short: 'SRS',     icon: Brain },
  { href: '/analytics',   label: '分析',    short: '分析',    icon: BarChart3 },
  { href: '/past-tests',  label: '過去問',  short: '過去問',  icon: Archive },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Top bar (all screens) ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-hairline bg-washi/85 backdrop-blur-md safe-top">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <span className="grid place-items-center w-8 h-8 rounded-xl bg-vermillion text-white font-serif text-base leading-none">日</span>
            <span className="font-semibold text-ink tracking-tight text-[15px] hidden xs:inline">JLPT N1</span>
          </Link>

          {/* Desktop: scrollable pill nav */}
          <nav className="hidden md:flex flex-1 justify-center">
            <ul className="flex items-center gap-0.5">
              {links.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all',
                        active
                          ? 'bg-vermillion text-white'
                          : 'text-ink-2 hover:text-ink hover:bg-ink/[0.04]'
                      )}
                    >
                      <Icon size={14} strokeWidth={2} />
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1 flex-shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Mobile bottom tab bar ─────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-hairline bg-washi/95 backdrop-blur-md safe-bottom"
        aria-label="メインナビゲーション"
      >
        <ul className="grid grid-cols-5 max-w-md mx-auto px-1 pt-1.5">
          {links.slice(0, 5).map(({ href, short, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-colors',
                    active
                      ? 'text-vermillion'
                      : 'text-ink-3 hover:text-ink-2'
                  )}
                >
                  <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
                  <span className="text-[10px] font-medium tracking-tight">{short}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Mobile secondary scroll-bar (for nav items beyond bottom tab) ─ */}
      <div className="md:hidden border-b border-hairline bg-washi/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-3">
          <ul className="flex gap-1 overflow-x-auto py-2 scrollbar-hide -mx-1 px-1">
            {links.slice(5).map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href} className="flex-shrink-0">
                  <Link
                    href={href}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap',
                      active
                        ? 'bg-vermillion text-white'
                        : 'bg-paper text-ink-2 hover:text-ink'
                    )}
                  >
                    <Icon size={13} strokeWidth={2} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
