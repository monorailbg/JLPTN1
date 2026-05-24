'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BookOpen, Languages, FileText, LayoutDashboard } from 'lucide-react';

const links = [
  { href: '/', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/vocabulary', label: '語彙', icon: Languages },
  { href: '/grammar', label: '文法', icon: BookOpen },
  { href: '/reading', label: '読解', icon: FileText },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-ink/10 bg-aged-paper/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl text-vermillion font-bold leading-none">日</span>
          <span className="font-semibold text-ink tracking-wide text-sm">JLPT N1 Trainer</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-all',
                pathname === href
                  ? 'bg-vermillion text-white font-medium'
                  : 'text-ink/70 hover:text-ink hover:bg-ink/5'
              )}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
