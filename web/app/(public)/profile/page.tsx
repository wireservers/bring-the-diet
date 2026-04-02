'use client';

const BENEFITS = [
  'Save unlimited recipes and meal plans',
  'Personalized nutrition recommendations',
  'Track your daily nutrition goals',
  'Sync across all your devices',
];

export default function ProfilePage() {
  return (
    <div style={styles.page}>
      {/* Welcome Card */}
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
      </div>

      {/* Sign In Options */}
      <h2 style={styles.sectionHeading}>Sign in with</h2>

      <button type="button" style={styles.socialBtn}>
        <div style={{ ...styles.socialIconCircle, backgroundColor: 'var(--card-bg)' }}>
          <span style={{ color: '#ea4335', fontSize: 22, fontWeight: 700 }}>G</span>
        </div>
        <span style={styles.socialLabel}>Continue with Google</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={styles.chevron}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <button type="button" style={styles.socialBtn}>
        <div style={{ ...styles.socialIconCircle, backgroundColor: '#1877f2' }}>
          <span style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>f</span>
        </div>
        <span style={styles.socialLabel}>Continue with Facebook</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={styles.chevron}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <button type="button" style={styles.socialBtn}>
        <div style={{ ...styles.socialIconCircle, backgroundColor: '#d1d5db' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1f2937">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
        </div>
        <span style={styles.socialLabel}>Continue with Apple</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={styles.chevron}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Benefits */}
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
  socialBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    width: '100%',
    padding: '16px 20px',
    backgroundColor: 'var(--card-bg)',
    borderRadius: 16,
    border: '1px solid var(--card-border)',
    color: 'var(--text-primary)',
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer',
    marginBottom: 12,
    textAlign: 'left',
  },
  socialIconCircle: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  socialLabel: {
    flex: 1,
  },
  chevron: {
    flexShrink: 0,
  },
  benefitsCard: {
    backgroundColor: 'var(--card-bg)',
    borderRadius: 16,
    border: '1px solid var(--card-border)',
    padding: '24px 20px',
    marginTop: 20,
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
