'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { blogPosts as mockBlogPosts } from '../../../data/mock';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image?: string;
  category: string;
  author: string;
  readTime: number;
  tags?: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export function BlogPostContent({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = mockBlogPosts.find(p => p.slug === slug);
    if (found) {
      setPost(found as BlogPost);
      setRelated(
        (mockBlogPosts as BlogPost[]).filter(p => p.slug !== slug).slice(0, 3)
      );
    } else {
      const displayTitle = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      setPost({
        id: slug,
        title: displayTitle,
        slug,
        excerpt: `Discover the secrets to ${displayTitle.toLowerCase()} and achieving your wellness goals.`,
        category: 'Nutrition',
        author: 'BringTheDiet Team',
        readTime: 5,
        tags: ['nutrition', 'wellness', 'healthy-eating', 'meal-prep'],
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content: [
          '## Introduction',
          '',
          `Healthy eating is the foundation of a vibrant, energetic life. In this comprehensive guide, we'll explore the key principles of ${displayTitle.toLowerCase()} and how you can apply them to your daily routine.`,
          '',
          '## Getting Started',
          '',
          'The journey to better nutrition begins with understanding what your body needs. Focus on whole, unprocessed foods and aim for a colorful plate at every meal.',
          '',
          '## Key Takeaways',
          '',
          'Remember that small, consistent changes are more sustainable than drastic overhauls. Start with one meal at a time and build from there.',
        ].join('\n'),
      });
      setRelated([
        { id: 'r1', title: '10 Superfoods for Better Health', slug: 'superfoods-health', category: 'Nutrition', author: '', readTime: 5, published: true, createdAt: '', updatedAt: '' },
        { id: 'r2', title: 'Meal Prep Made Easy', slug: 'meal-prep-easy', category: 'Recipes', author: '', readTime: 6, published: true, createdAt: '', updatedAt: '' },
        { id: 'r3', title: 'Understanding Food Labels', slug: 'food-labels', category: 'Tips', author: '', readTime: 4, published: true, createdAt: '', updatedAt: '' },
      ]);
    }
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.topBar}>
          <Link href="/blog" style={styles.backArrow}>←</Link>
          <div style={styles.topBarRight}>
            <div style={styles.skeletonIcon} />
            <div style={styles.skeletonIcon} />
          </div>
        </div>
        <div style={styles.skeletonImage} />
        <div style={styles.content}>
          <div style={styles.skeletonBadge} />
          <div style={styles.skeletonTitleLg} />
          <div style={styles.skeletonBlock} />
          <div style={styles.skeletonBlock} />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={styles.page}>
        <div style={styles.content}>
          <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: 60 }}>Article not found.</p>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link href="/blog" style={styles.linkGreen}>Back to Blog</Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // Parse content: lines starting with ## become section headings
  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith('## ')) {
        return <h2 key={i} style={styles.sectionHeading}>{trimmed.slice(3)}</h2>;
      }
      if (trimmed.startsWith('### ')) {
        return <h3 key={i} style={styles.subHeading}>{trimmed.slice(4)}</h3>;
      }
      return <p key={i} style={styles.paragraph}>{trimmed}</p>;
    });
  };

  return (
    <div style={styles.page}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <Link href="/blog" style={styles.backArrow}>←</Link>
        <div style={styles.topBarRight}>
          <button type="button" style={styles.iconBtn} aria-label="Bookmark">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          <button type="button" style={styles.iconBtn} aria-label="Share">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hero image */}
      {post.image ? (
        <div style={styles.heroImageWrap}>
          <img src={post.image} alt={post.title} style={styles.heroImage} />
        </div>
      ) : (
        <div style={styles.heroPlaceholder}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
      )}

      <div style={styles.content}>
        {/* Category */}
        <span style={styles.categoryBadge}>{post.category}</span>

        {/* Title */}
        <h1 style={styles.articleTitle}>{post.title}</h1>

        {/* Excerpt / subtitle */}
        {post.excerpt && (
          <p style={styles.excerpt}>{post.excerpt}</p>
        )}

        {/* Author row */}
        <div style={styles.authorRow}>
          <div style={styles.authorAvatar}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <p style={styles.authorName}>{post.author}</p>
            <div style={styles.authorMeta}>
              <span style={styles.authorMetaItem}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {formattedDate}
              </span>
              <span style={styles.authorMetaItem}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {post.readTime} min read
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Article body */}
        <div style={styles.articleBody}>
          {post.content ? (
            renderContent(post.content)
          ) : (
            <p style={styles.paragraph}>Full article content coming soon.</p>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <>
            <div style={styles.divider} />
            <div>
              <h3 style={styles.tagsTitle}>Tags</h3>
              <div style={styles.tagsWrap}>
                {post.tags.map((tag) => (
                  <span key={tag} style={styles.tag}>#{tag}</span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Related Articles */}
        {related.length > 0 && (
          <>
            <div style={styles.dividerLarge} />
            <h3 style={styles.relatedTitle}>Related Articles</h3>
            <div style={styles.relatedList}>
              {related.map((article) => (
                <Link key={article.id} href={`/blog/${article.slug}`} style={styles.relatedCard}>
                  <div style={styles.relatedThumb}>
                    {article.image ? (
                      <img src={article.image} alt={article.title} style={styles.relatedThumbImg} />
                    ) : (
                      <div style={styles.relatedThumbPlaceholder}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div style={styles.relatedInfo}>
                    <span style={styles.relatedBadge}>{article.category}</span>
                    <h4 style={styles.relatedName}>{article.title}</h4>
                    <span style={styles.relatedMeta}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {article.readTime} min read
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div style={styles.divider} />
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#111827',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#111827',
  },
  backArrow: {
    color: 'white',
    textDecoration: 'none',
    fontSize: 22,
    lineHeight: 1,
    padding: '4px 8px',
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    padding: 4,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  heroImageWrap: {
    width: '100%',
    height: 300,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  heroPlaceholder: {
    width: '100%',
    height: 260,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a2332',
  },
  content: {
    padding: '24px 16px 100px',
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '5px 14px',
    backgroundColor: '#374151',
    color: '#d1d5db',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 16,
  },
  articleTitle: {
    margin: '0 0 12px',
    fontSize: 28,
    fontWeight: 700,
    color: 'white',
    lineHeight: 1.25,
  },
  excerpt: {
    margin: '0 0 24px',
    fontSize: 16,
    lineHeight: 1.6,
    color: '#9ca3af',
  },
  authorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    backgroundColor: '#374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  authorName: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: 'white',
  },
  authorMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginTop: 3,
  },
  authorMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 13,
    color: '#6b7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
    margin: '28px 0',
  },
  articleBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  sectionHeading: {
    margin: '8px 0 0',
    fontSize: 22,
    fontWeight: 700,
    color: '#6ee7b7',
    lineHeight: 1.3,
  },
  subHeading: {
    margin: '4px 0 0',
    fontSize: 18,
    fontWeight: 600,
    color: '#6ee7b7',
    lineHeight: 1.3,
  },
  paragraph: {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.8,
    color: '#d1d5db',
  },
  tagsTitle: {
    margin: '0 0 12px',
    fontSize: 16,
    fontWeight: 700,
    color: 'white',
  },
  tagsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    display: 'inline-block',
    padding: '6px 14px',
    backgroundColor: '#374151',
    color: '#d1d5db',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
  },
  dividerLarge: {
    height: 1,
    backgroundColor: '#374151',
    margin: '36px 0 28px',
  },
  relatedTitle: {
    margin: '0 0 20px',
    fontSize: 22,
    fontWeight: 700,
    color: 'white',
  },
  relatedList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  relatedCard: {
    display: 'flex',
    gap: 14,
    textDecoration: 'none',
    backgroundColor: '#1f2937',
    borderRadius: 14,
    border: '1px solid #374151',
    overflow: 'hidden',
  },
  relatedThumb: {
    width: 120,
    minHeight: 110,
    flexShrink: 0,
    overflow: 'hidden',
  },
  relatedThumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  relatedThumbPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a2332',
  },
  relatedInfo: {
    flex: 1,
    padding: '14px 14px 14px 0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 6,
  },
  relatedBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    backgroundColor: '#374151',
    color: '#d1d5db',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 500,
    alignSelf: 'flex-start',
  },
  relatedName: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    color: 'white',
    lineHeight: 1.3,
  },
  relatedMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 12,
    color: '#6b7280',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
  },
  backLink: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#1f2937',
    color: '#9ca3af',
    borderRadius: 12,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    border: '1px solid #374151',
  },
  linkGreen: {
    color: '#6ee7b7',
    textDecoration: 'none',
  },
  skeletonIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#374151',
  },
  skeletonImage: {
    width: '100%',
    height: 280,
    backgroundColor: '#1a2332',
  },
  skeletonBadge: {
    width: 80,
    height: 28,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    marginBottom: 16,
  },
  skeletonTitleLg: {
    width: '80%',
    height: 32,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    marginBottom: 16,
  },
  skeletonBlock: {
    width: '100%',
    height: 80,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    marginBottom: 16,
  },
};
