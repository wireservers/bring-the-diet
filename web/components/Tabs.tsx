'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Home' },
  { href: '/recipes', label: 'Recipes' },
  { href: '/meal-plans', label: 'Meal Plans' },
  { href: '/diets', label: 'Diets' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/profile', label: 'Profile' },
];

export function Tabs() {
  const pathname = usePathname();

  return (
    <nav style={{ display: 'flex', gap: 10, padding: 12, borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            style={{
              padding: '8px 12px',
              borderRadius: 999,
              border: '1px solid #e5e7eb',
              textDecoration: 'none',
              color: '#111827',
              fontWeight: active ? 700 : 500,
              background: active ? '#f3f4f6' : 'transparent',
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
