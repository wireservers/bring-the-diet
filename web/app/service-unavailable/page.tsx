'use client';

export default function ServiceUnavailablePage() {

  const handleRetry = () => {
    window.location.href = '/';
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconCircle}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h1 style={styles.title}>Service Unavailable</h1>
        <p style={styles.message}>
          We&apos;re having trouble connecting to our servers. This is usually temporary &mdash; please try again in a moment.
        </p>
        <button
          onClick={handleRetry}
          style={{ ...styles.retryButton, cursor: 'pointer' }}
        >
          Try Again
        </button>
        <p style={styles.hint}>
          If the problem persists, please check back later.
        </p>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--page-bg, #f9fafb)',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    padding: 20,
  },
  card: {
    maxWidth: 480,
    width: '100%',
    textAlign: 'center',
    padding: '48px 32px',
    backgroundColor: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--card-border, #e5e7eb)',
    borderRadius: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  title: {
    margin: '0 0 12px',
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text-primary, #111827)',
  },
  message: {
    margin: '0 0 28px',
    fontSize: 16,
    lineHeight: 1.6,
    color: 'var(--text-muted, #6b7280)',
  },
  retryButton: {
    display: 'inline-block',
    padding: '14px 36px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: 25,
    fontSize: 16,
    fontWeight: 600,
    transition: 'opacity 0.2s',
  },
  hint: {
    marginTop: 24,
    fontSize: 13,
    color: 'var(--text-muted, #9ca3af)',
  },
  code: {
    padding: '2px 6px',
    backgroundColor: 'var(--page-bg, #f3f4f6)',
    borderRadius: 4,
    fontSize: 12,
  },
};
