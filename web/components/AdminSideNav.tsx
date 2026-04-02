'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV: Array<{ label: string; href: string }> = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Recipes', href: '/admin/recipes' },
  { label: 'Foods', href: '/admin/foods' },
  { label: 'Nutrition Facts', href: '/admin/nutrition-facts' },
  { label: 'Diets', href: '/admin/diets' },
  { label: 'Blog Posts', href: '/admin/blog-posts' },
  { label: 'Comments', href: '/admin/comments' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Roles', href: '/admin/roles' }
];

export function AdminSideNav() {
  const pathname = usePathname();

  return (
    <aside style={{ width: 240, borderRight: '1px solid #e5e7eb', padding: 12 }}>
      <div style={{ fontWeight: 700, padding: '8px 10px', marginBottom: 8 }}>Admin Console</div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map((item) => {
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                textDecoration: 'none',
                padding: '8px 10px',
                borderRadius: 8,
                background: active ? '#111827' : 'transparent',
                color: active ? 'white' : '#111827',
                fontSize: 13,
                fontWeight: active ? 600 : 500
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            padding: '8px 10px',
            fontSize: 12,
            color: '#6b7280'
          }}
        >
          ← Back to Site
        </Link>
      </div>
    </aside>
  );
}
