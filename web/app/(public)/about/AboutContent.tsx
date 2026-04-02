'use client';

import Link from 'next/link';

const VALUES = [
  {
    title: 'Health First',
    description:
      'We believe that good health is the foundation of a fulfilling life.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    title: 'Sustainability',
    description:
      'Promoting sustainable eating practices that are good for you and the planet.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    title: 'Community',
    description:
      'Building a supportive community where everyone can share and grow together.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'Quality',
    description:
      'Every recipe is tested and refined to ensure the best taste and nutrition.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    ),
  },
];

const TEAM = [
  {
    name: 'Sarah Johnson',
    role: 'Head Nutritionist',
    bio: 'Certified nutritionist with 10+ years of experience in dietary planning and wellness coaching.',
  },
  {
    name: 'Michael Chen',
    role: 'Executive Chef',
    bio: 'Award-winning chef specializing in healthy cuisine and recipe development for various dietary needs.',
  },
  {
    name: 'Emily Roberts',
    role: 'Wellness Coach',
    bio: 'Passionate about helping people build sustainable healthy habits through personalized guidance.',
  },
  {
    name: 'David Park',
    role: 'Community Manager',
    bio: 'Building and nurturing our vibrant community of health-conscious food enthusiasts.',
  },
];

export function AboutContent() {
  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <Link href="/" style={styles.backBtn}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 style={styles.headerTitle}>About Us</h1>
        <div style={{ width: 22 }} />
      </div>

      {/* Welcome */}
      <div style={styles.welcomeSection}>
        <h2 style={styles.welcomeHeading}>Welcome to BringTheDiet</h2>
        <p style={styles.welcomeText}>
          BringTheDiet is your ultimate companion for healthy living. We provide
          carefully curated recipes, personalized meal plans, and expert nutrition
          guidance to help you achieve your dietary goals. Whether you&apos;re following
          a specific diet or simply looking to eat healthier, we&apos;re here to make
          your journey enjoyable and sustainable.
        </p>
      </div>

      {/* Our Mission */}
      <div style={styles.missionCard}>
        <h3 style={styles.missionTitle}>Our Mission</h3>
        <p style={styles.missionText}>
          To make healthy eating accessible, enjoyable, and sustainable for everyone.
          We believe that good nutrition shouldn&apos;t be complicated — it should be
          a natural part of your daily life. Our mission is to empower people with
          the tools, knowledge, and inspiration they need to make informed food
          choices and build lasting healthy habits.
        </p>
      </div>

      {/* Our Values */}
      <div style={styles.valuesSection}>
        <h3 style={styles.sectionHeading}>Our Values</h3>
        <div style={styles.valuesGrid}>
          {VALUES.map((value) => (
            <div key={value.title} style={styles.valueCard}>
              <div style={styles.valueIconCircle}>
                {value.icon}
              </div>
              <div style={styles.valueContent}>
                <h4 style={styles.valueTitle}>{value.title}</h4>
                <p style={styles.valueDescription}>{value.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meet Our Team */}
      <div style={styles.teamSection}>
        <h3 style={styles.sectionHeading}>Meet Our Team</h3>
        <div style={styles.teamGrid}>
          {TEAM.map((member) => (
            <div key={member.name} style={styles.teamCard}>
              <div style={styles.teamImageWrap}>
                <div style={styles.teamImagePlaceholder}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>
              <div style={styles.teamCardBody}>
                <h4 style={styles.teamName}>{member.name}</h4>
                <span style={styles.teamRole}>{member.role}</span>
                <p style={styles.teamBio}>{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Get In Touch */}
      <div style={styles.contactSection}>
        <h3 style={styles.sectionHeading}>Get In Touch</h3>
        <div style={styles.contactCard}>
          <div style={styles.contactRow}>
            <div style={styles.contactIconCircle}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <span style={styles.contactLabel}>Email</span>
              <span style={styles.contactValue}>hello@bringthediet.com</span>
            </div>
          </div>
          <div style={styles.contactRow}>
            <div style={styles.contactIconCircle}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div>
              <span style={styles.contactLabel}>Phone</span>
              <span style={styles.contactValue}>+1 (555) 123-4567</span>
            </div>
          </div>
          <div style={styles.contactRow}>
            <div style={styles.contactIconCircle}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <span style={styles.contactLabel}>Location</span>
              <span style={styles.contactValue}>123 Health Street, San Francisco, CA 94102</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>500+</span>
          <span style={styles.statLabel}>Recipes</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>50K+</span>
          <span style={styles.statLabel}>Users</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>100+</span>
          <span style={styles.statLabel}>Meal Plans</span>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: 'calc(100vh - 120px)',
    backgroundColor: '#111827',
    padding: '0 16px 100px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 0',
    marginBottom: 8,
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 12,
    textDecoration: 'none',
  },
  headerTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: 'white',
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeHeading: {
    margin: '0 0 12px',
    fontSize: 26,
    fontWeight: 700,
    color: 'white',
  },
  welcomeText: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.7,
    color: '#9ca3af',
  },
  missionCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    border: '1px solid #374151',
    padding: '20px',
    marginBottom: 28,
  },
  missionTitle: {
    margin: '0 0 10px',
    fontSize: 20,
    fontWeight: 700,
    color: 'white',
  },
  missionText: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.7,
    color: '#9ca3af',
  },
  sectionHeading: {
    margin: '0 0 16px',
    fontSize: 22,
    fontWeight: 700,
    color: 'white',
  },
  valuesSection: {
    marginBottom: 32,
  },
  valuesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  valueCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    backgroundColor: '#1f2937',
    borderRadius: 16,
    border: '1px solid #374151',
    padding: '20px',
  },
  valueIconCircle: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    backgroundColor: '#374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    margin: '0 0 6px',
    fontSize: 17,
    fontWeight: 600,
    color: 'white',
  },
  valueDescription: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.6,
    color: '#9ca3af',
  },
  teamSection: {
    marginBottom: 32,
  },
  teamGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  teamCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    border: '1px solid #374151',
    overflow: 'hidden',
  },
  teamImageWrap: {
    width: '100%',
    height: 220,
    backgroundColor: '#374151',
    overflow: 'hidden',
  },
  teamImagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
  },
  teamCardBody: {
    padding: '16px 20px 20px',
  },
  teamName: {
    margin: '0 0 4px',
    fontSize: 18,
    fontWeight: 600,
    color: 'white',
  },
  teamRole: {
    display: 'block',
    fontSize: 14,
    fontWeight: 500,
    color: '#6ee7b7',
    marginBottom: 10,
  },
  teamBio: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.6,
    color: '#9ca3af',
  },
  contactSection: {
    marginBottom: 28,
  },
  contactCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    border: '1px solid #374151',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  contactRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  contactIconCircle: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    backgroundColor: '#374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contactLabel: {
    display: 'block',
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 2,
  },
  contactValue: {
    display: 'block',
    fontSize: 16,
    fontWeight: 600,
    color: 'white',
  },
  statsRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 16,
    border: '1px solid #374151',
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 700,
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
};
