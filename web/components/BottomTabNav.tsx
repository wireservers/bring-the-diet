'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS: Array<{ label: string; href: string; icon: (active: boolean) => React.ReactNode }> = [
  {
    label: 'Home', href: '/',
    icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? '#ef4444' : '#9ca3af'} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  },
  {
    label: 'Recipes', href: '/recipes',
    icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? '#ef4444' : '#9ca3af'} strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
  },
  {
    label: 'Meal\nPlans', href: '/meal-plans',
    icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? '#ef4444' : '#9ca3af'} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
  },
  {
    label: 'Diets', href: '/diets',
    icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? '#ef4444' : '#9ca3af'} strokeWidth="2"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66L7 18" /><path d="M11 2a10 10 0 0 1 0 12c-2.5-3-2.5-9 0-12z" /><path d="M15 5a8 8 0 0 1 0 10c-2-2.5-2-7.5 0-10z" /></svg>,
  },
  {
    label: 'Blog', href: '/blog',
    icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? '#ef4444' : '#9ca3af'} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  },
  {
    label: 'Profile', href: '/profile',
    icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? '#ef4444' : '#9ca3af'} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  },
];

export function BottomTabNav() {
  const pathname = usePathname();

  return (
    <>
      <style>{`
        .bottom-tab-nav { display: none; }
        @media (max-width: 768px) {
          .bottom-tab-nav { display: block !important; }
        }
      `}</style>
      <nav className="bottom-tab-nav" style={styles.nav}>
        <div style={styles.inner}>
          {TABS.map((t) => {
            const active = t.href === '/' ? pathname === '/' : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                style={{
                  ...styles.tab,
                  color: active ? '#ef4444' : '#9ca3af',
                }}
              >
                {t.icon(active)}
                <span style={styles.tabLabel}>
                  {t.label.split('\n').map((line, i) => (
                    <span key={i}>{line}{i === 0 && t.label.includes('\n') ? <br /> : null}</span>
                  ))}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: 'var(--bottom-nav-bg)',
    borderTop: '1px solid var(--bottom-nav-border)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '8px 0 12px',
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    textDecoration: 'none',
    fontSize: 10,
    fontWeight: 500,
    minWidth: 48,
  },
  tabLabel: {
    textAlign: 'center',
    lineHeight: 1.2,
  },
};
