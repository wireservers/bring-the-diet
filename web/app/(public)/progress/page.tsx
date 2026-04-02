import Link from 'next/link';

export default function ProgressPage() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconCircle}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.5">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <span style={styles.badge}>Coming Soon</span>
        <h1 style={styles.title}>My Progress</h1>
        <p style={styles.description}>
          Track your nutrition and diet journey over time. Set goals, log meals,
          and see visual charts of your progress toward a healthier lifestyle.
        </p>
        <div style={styles.featureList}>
          <div style={styles.featureItem}>
            <span style={styles.featureDot} />
            Daily calorie and macro tracking
          </div>
          <div style={styles.featureItem}>
            <span style={styles.featureDot} />
            Visual progress charts and streaks
          </div>
          <div style={styles.featureItem}>
            <span style={styles.featureDot} />
            Weekly and monthly summary reports
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
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 16px',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    color: '#a855f7',
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
    backgroundColor: '#a855f7',
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
