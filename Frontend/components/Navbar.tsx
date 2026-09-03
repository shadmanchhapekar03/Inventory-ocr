'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/ThemeProvider';
import { themes, ThemeKey } from '@/lib/themes';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme, colors } = useTheme();

  const isActive = (path: string) => {
    return pathname === path
      ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] font-semibold'
      : 'text-[var(--text-muted)] hover:text-[var(--foreground)] border-b-2 border-transparent hover:border-[var(--primary)]/40';
  };

  const themeLabels: Record<ThemeKey, string> = {
    'dark-premium': 'Dark Premium',
    'light-modern': 'Light Modern',
    'futuristic': 'Futuristic',
  };

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-500"
      style={{
        backgroundColor: 'rgba(10,15,28, 0.7)',
        borderColor: 'rgba(212,168,67, 0.1)',
        background: 'linear-gradient(90deg, rgba(10,15,28,0.85) 0%, rgba(17,24,51,0.9) 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-[var(--primary)]/20 group-hover:shadow-[var(--primary)]/40 transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #b88a30 100%)' }}
            >
              <span className="text-white font-bold text-xl">📦</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">Inventory</span>
          </Link>

          {/* Nav links */}
          <div className="flex gap-6 items-center">
            <Link
              href="/upload"
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-300 ${isActive('/upload')}`}
            >
              Upload
            </Link>
            <Link
              href="/bulk-process"
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-300 ${isActive('/bulk-process')}`}
            >
              Bulk
            </Link>
            <Link
              href="/data"
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-300 ${isActive('/data')}`}
            >
              View Data
            </Link>
            <Link
              href="/review"
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-300 ${isActive('/review')}`}
            >
              Review
            </Link>

            {/* Theme Switcher */}
            <div className="flex items-center gap-1 ml-4 pl-4 border-l border-[rgba(255,255,255,0.1)]">
              {(Object.keys(themes) as ThemeKey[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  title={themeLabels[t]}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    theme === t
                      ? 'text-[var(--foreground)] bg-[var(--primary)] shadow-lg shadow-[var(--primary)]/30 scale-105'
                      : 'text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-white/5 hover:scale-105'
                  }`}
                >
                  {t === 'dark-premium' ? '🌙' : t === 'light-modern' ? '☀️' : '🌌'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
