'use client';

import { useAuth } from '../../../lib/useAuth';

const BENEFITS = [
  'Save unlimited recipes and meal plans',
  'Personalized nutrition recommendations',
  'Track your daily nutrition goals',
  'Sync across all your devices',
];

export default function ProfilePage() {
  const { isAuthenticated, isLoading, user, login, logout, error } = useAuth();

  if (isLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.welcomeCard}>
          <p style={styles.welcomeText}>Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div style={styles.page}>
        <div style={styles.welcomeCard}>
          <div style={styles.avatarCircle}>
            <span style={styles.avatarInitials}>{initials(user.name || user.email)}</span>
          </div>
          <h1 style={styles.welcomeTitle}>{user.name || 'Welcome'}</h1>
          <p style={styles.welcomeText}>{user.email}</p>
          <button type="button" onClick={logout} style={styles.signOutBtn}>
            Sign out
          </button>
        </div>

        <h2 style={styles.sectionHeading}>Account details</h2>
        <div style={styles.detailsCard}>
          <DetailRow label="User ID" value={user.id} mono />
          <DetailRow label="Tenant ID" value={user.tenantId} mono />
          <DetailRow label="Username" value={user.username} />
          {user.roles.length > 0 && <DetailRow label="Roles" value={user.roles.join(', ')} />}
          {user.groups.length > 0 && <DetailRow label="Groups" value={`${user.groups.length} groups`} />}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.welcomeCard}>
        <div style={styles.avatarCircle}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h1 style={styles.welcomeTitle}>Welcome!</h1>
        <p style={styles.welcomeText}>
          Sign in to save your favorite recipes, create meal plans, and track your nutrition journey
        </p>
        <button type="button" onClick={login} style={styles.primaryBtn}>
          Sign in with Microsoft
        </button>
        {error && <p style={styles.errorText}>{error.message}</p>}
      </div>

      <div style={styles.benefitsCard}>
        <h3 style={styles.benefitsTitle}>Benefits of signing in:</h3>
        <div style={styles.benefitsList}>
          {BENEFITS.map((benefit) => (
            <div key={benefit} style={styles.benefitRow}>
              <div style={styles.checkCircle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span style={styles.benefitText}>{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={{ ...styles.detailValue, ...(mono ? { fontFamily: 'monospace', fontSize: 12 } : {}) }}>
        {value}
      </span>
    </div>
  );
}

function initials(s: string): string {
  return s
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: 'calc(100vh - 120px)',
    backgroundColor: 'var(--page-bg)',
    padding: '0 16px 100px',
  },
  welcomeCard: {
    backgroundColor: 'var(--card-bg)',
    borderRadius: 16,
    border: '1px solid var(--card-border)',
    padding: '36px 24px 32px',
    textAlign: 'center',
    marginBottom: 28,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: '50%',
    backgroundColor: 'var(--card-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  welcomeTitle: {
    margin: '0 0 10px',
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  welcomeText: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.6,
    color: 'var(--text-muted)',
  },
  sectionHeading: {
    margin: '0 0 16px',
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  detailsCard: {
    backgroundColor: 'var(--card-bg)',
    borderRadius: 16,
    border: '1px solid var(--card-border)',
    padding: '8px 20px',
    marginBottom: 28,
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid var(--card-border)',
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--text-muted)',
  },
  detailValue: {
    fontSize: 14,
    color: 'var(--text-primary)',
    textAlign: 'right',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  primaryBtn: {
    marginTop: 20,
    padding: '12px 24px',
    borderRadius: 10,
    border: 'none',
    background: '#10b981',
    color: 'white',
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
  },
  signOutBtn: {
    marginTop: 20,
    padding: '10px 20px',
    borderRadius: 10,
    border: '1px solid var(--card-border)',
    background: 'none',
    color: 'var(--text-muted)',
    fontWeight: 500,
    fontSize: 14,
    cursor: 'pointer',
  },
  errorText: {
    marginTop: 12,
    fontSize: 13,
    color: '#ef4444',
  },
  benefitsCard: {
    backgroundColor: 'var(--card-bg)',
    borderRadius: 16,
    border: '1px solid var(--card-border)',
    padding: '24px 20px',
  },
  benefitsTitle: {
    margin: '0 0 16px',
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  benefitsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  benefitRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: '#6ee7b7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  benefitText: {
    fontSize: 15,
    color: 'var(--text-secondary)',
  },
};
