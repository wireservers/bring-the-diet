'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/useAuth';
import { ThemeToggle } from './ThemeToggle';

const TABS: Array<{ label: string; href: string; icon: React.ReactNode }> = [
  {
    label: 'Home', href: '/',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  },
  {
    label: 'Recipes', href: '/recipes',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
  },
  {
    label: 'Meal Plans', href: '/meal-plans',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
  },
  {
    label: 'Diets', href: '/diets',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66L7 18" /><path d="M11 2a10 10 0 0 1 0 12c-2.5-3-2.5-9 0-12z" /><path d="M15 5a8 8 0 0 1 0 10c-2-2.5-2-7.5 0-10z" /></svg>,
  },
  {
    label: 'Blog', href: '/blog',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
  },
  {
    label: 'Profile', href: '/profile',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  },
];

export function TabNav() {
  const pathname = usePathname();
  const { isAuthenticated, user, login, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  return (
    <nav ref={menuRef} style={styles.nav}>
      <style>{`
        .tn-tabs { display: flex; gap: 2px; align-items: center; }
        .tn-burger { display: none; }
        .tn-mobile-menu { display: none; }
        .tn-auth-desktop { display: flex; }
        .tn-auth-mobile { display: none; }

        @media (max-width: 768px) {
          .tn-tabs { display: none; }
          .tn-burger { display: flex; }
          .tn-mobile-menu {
            display: ${menuOpen ? 'flex' : 'none'};
            flex-direction: column;
            padding: 8px 16px 16px;
            gap: 2px;
            border-top: 1px solid rgba(255,255,255,0.06);
            animation: tn-slide 0.2s ease-out;
          }
          .tn-auth-desktop { display: none; }
          .tn-auth-mobile {
            display: ${menuOpen ? 'flex' : 'none'};
            padding: 8px 16px 16px;
            gap: 8px;
            border-top: 1px solid rgba(255,255,255,0.06);
          }
        }

        @keyframes tn-slide {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Top bar */}
      <div style={styles.topBar}>
        {/* Hamburger (mobile only) */}
        <button
          type="button"
          className="tn-burger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          style={styles.burgerBtn}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? (
              <><path d="M18 6L6 18" /><path d="M6 6l12 12" /></>
            ) : (
              <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>
            )}
          </svg>
        </button>

        {/* Brand */}
        <Link href="/" style={styles.brand}>
          <span style={styles.brandAccent}>Bring</span>The
        </Link>

        {/* Desktop tabs */}
        <div className="tn-tabs">
          {TABS.map((t) => {
            const active = t.href === '/' ? pathname === '/' : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                style={{
                  ...styles.tab,
                  ...(active ? styles.tabActive : {}),
                }}
              >
                <span style={{ display: 'flex', color: active ? '#10b981' : 'inherit' }}>{t.icon}</span>
                {t.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop auth + theme toggle */}
        <div className="tn-auth-desktop" style={styles.authRow}>
          <ThemeToggle />
          {isAuthenticated && user ? (
            <>
              <Link href="/profile" style={styles.profileBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                {user.name}
              </Link>
              <button type="button" onClick={logout} style={styles.signOutBtn}>Sign Out</button>
            </>
          ) : (
            <button type="button" onClick={login} style={styles.signInBtn}>Sign In</button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <div className="tn-mobile-menu">
        {TABS.map((t) => {
          const active = t.href === '/' ? pathname === '/' : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              onClick={() => setMenuOpen(false)}
              style={{
                ...styles.mobileTab,
                ...(active ? styles.mobileTabActive : {}),
              }}
            >
              <span style={{ display: 'flex', color: active ? '#10b981' : 'inherit' }}>{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Mobile auth */}
      <div className="tn-auth-mobile">
        {isAuthenticated && user ? (
          <>
            <Link href="/profile" onClick={() => setMenuOpen(false)} style={{ ...styles.signInBtn, flex: 1, textAlign: 'center', textDecoration: 'none' }}>
              {user.name}
            </Link>
            <button type="button" onClick={() => { logout(); setMenuOpen(false); }} style={{ ...styles.signOutBtn, flex: 1 }}>Sign Out</button>
          </>
        ) : (
          <button type="button" onClick={() => { login(); setMenuOpen(false); }} style={{ ...styles.signInBtn, flex: 1 }}>Sign In</button>
        )}
      </div>
    </nav>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    backgroundColor: 'var(--nav-bg)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--nav-border)',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    height: 56,
    gap: 16,
  },
  burgerBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 6,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontWeight: 700,
    fontSize: 18,
    color: 'white',
    textDecoration: 'none',
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: '#10b981',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    textDecoration: 'none',
    padding: '8px 14px',
    borderRadius: 10,
    color: '#9ca3af',
    fontWeight: 500,
    fontSize: 13,
    transition: 'all 0.15s ease',
  },
  tabActive: {
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  authRow: {
    marginLeft: 'auto',
    alignItems: 'center',
    gap: 8,
  },
  signInBtn: {
    padding: '8px 18px',
    borderRadius: 10,
    border: 'none',
    background: '#10b981',
    color: 'white',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
  },
  signOutBtn: {
    padding: '8px 14px',
    borderRadius: 10,
    border: '1px solid #374151',
    background: 'none',
    color: '#9ca3af',
    fontWeight: 500,
    fontSize: 13,
    cursor: 'pointer',
  },
  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 10,
    border: '1px solid #374151',
    color: '#d1d5db',
    fontWeight: 500,
    fontSize: 13,
    textDecoration: 'none',
  },
  mobileTab: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    textDecoration: 'none',
    padding: '12px 16px',
    borderRadius: 12,
    color: '#9ca3af',
    fontWeight: 500,
    fontSize: 15,
  },
  mobileTabActive: {
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
};
