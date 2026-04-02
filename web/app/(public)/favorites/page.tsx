import Link from 'next/link';

export default function FavoritesPage() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconCircle}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <span style={styles.badge}>Coming Soon</span>
        <h1 style={styles.title}>Saved Recipes</h1>
        <p style={styles.description}>
          Your personal collection of favorite recipes, all in one place.
          Quickly access the meals you love and organize them into custom collections.
        </p>
        <div style={styles.featureList}>
          <div style={styles.featureItem}>
            <span style={styles.featureDot} />
            Save recipes with one tap
          </div>
          <div style={styles.featureItem}>
            <span style={styles.featureDot} />
            Organize into custom collections
          </div>
          <div style={styles.featureItem}>
            <span style={styles.featureDot} />
            Quick access from any device
          </div>
        </div>
        <Link href="/" style={styles.backLink}>Back to Home</Link>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: 'calc(100vh - 100px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    margin: -16,
    padding: 20,
  },
  card: {
    maxWidth: 480,
    width: '100%',
    textAlign: 'center',
    padding: '48px 32px',
    backgroundColor: '#1f2937',
    borderRadius: 24,
    border: '1px solid #374151',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: '50%',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 16px',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    color: '#3b82f6',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 16,
  },
  title: {
    margin: '0 0 12px',
    fontSize: 28,
    fontWeight: 700,
    color: 'white',
  },
  description: {
    margin: '0 0 24px',
    fontSize: 15,
    lineHeight: 1.6,
    color: '#9ca3af',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 32,
    textAlign: 'left',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 14,
    color: '#d1d5db',
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    flexShrink: 0,
  },
  backLink: {
    display: 'inline-block',
    padding: '12px 32px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    borderRadius: 12,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
  },
};
