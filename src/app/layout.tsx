import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/layout/Nav';

export const metadata: Metadata = {
  title: 'JLPT N1 Trainer',
  description: 'Master JLPT N1 vocabulary, grammar, and reading comprehension',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen washi-texture antialiased">
        <Nav />
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
