'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { blogPosts as mockBlogPosts } from '../../data/mock';

const PAGE_SIZE = 10;

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: string;
  category: string;
  author: string;
  readTime: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = ['All', 'Nutrition', 'Recipes', 'Wellness', 'Fitness'];

export function BlogListContent() {
  const [posts] = useState<BlogPost[]>(mockBlogPosts as BlogPost[]);
  const loading = false;
  const loadingMore = false;
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = false;

  // Client-side search filter on loaded posts
  const filtered = search.trim()
    ? posts.filter((p) => {
        const term = search.toLowerCase();
        return (
          p.title.toLowerCase().includes(term) ||
          p.excerpt?.toLowerCase().includes(term) ||
          p.author.toLowerCase().includes(term)
        );
      })
    : posts;

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    console.log('[mock] delete blog post', id);
  };

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Blog</h1>
          <p style={styles.subtitle}>{posts.length} articles</p>
        </div>
        <div style={styles.headerActions}>
          <Link href="/admin/blog-posts/new" style={styles.addButton}>
            <span style={styles.plusIcon}>+</span> Add Post
          </Link>
        </div>
      </div>

      {/* Search */}
      <div style={styles.searchWrap}>
        <span style={styles.searchIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Category Chips */}
      <div style={styles.chipRow}>
        {CATEGORIES.map((cat) => (
          <button
            type="button"
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={activeCategory === cat ? styles.chipActive : styles.chip}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div style={styles.postList}>
          {[1, 2].map((i) => (
            <div key={i} style={styles.skeleton} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No articles found</p>
        </div>
      ) : (
        <div style={styles.postList}>
          {filtered.map((post) => (
            <div key={post.id} style={styles.card}>
              <Link href={`/blog/${post.slug}`} style={styles.cardLink}>
                {/* Image */}
                <div style={styles.imageWrap}>
                  {post.image ? (
                    <img src={post.image} alt={post.title} style={styles.image} />
                  ) : (
                    <div style={styles.imagePlaceholder}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={styles.cardBody}>
                  <span style={styles.categoryBadge}>{post.category}</span>
                  <h2 style={styles.cardTitle}>{post.title}</h2>
                  {post.excerpt && (
                    <p style={styles.cardExcerpt}>{post.excerpt}</p>
                  )}
                  <div style={styles.cardMeta}>
                    <span style={styles.metaItem}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {post.author}
                    </span>
                    <span style={styles.metaItem}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {post.createdAt.slice(0, 10)}
                    </span>
                    <span style={styles.metaItem}>
                      {post.readTime} min read
                    </span>
                  </div>
                </div>
              </Link>

              {/* Action buttons */}
              <div style={styles.actionBar}>
                <Link href={`/admin/blog-posts/${post.id}/edit`} style={styles.editBtn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </Link>
                <button type="button" onClick={() => handleDelete(post.id)} style={styles.deleteBtn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} style={{ height: 1 }} />

          {/* Loading more indicator */}
          {loadingMore && (
            <div style={styles.loadingMore}>
              <div style={styles.spinner} />
              <span style={{ color: '#9ca3af', fontSize: 14 }}>Loading more articles...</span>
            </div>
          )}

          {/* End of list */}
          {!hasMore && posts.length > PAGE_SIZE && (
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 14, padding: '16px 0' }}>
              You&apos;ve reached the end
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: 'calc(100vh - 120px)',
    backgroundColor: 'var(--page-bg)',
    padding: '24px 16px 100px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  subtitle: {
    margin: '4px 0 0',
    fontSize: 14,
    color: 'var(--text-muted)',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 20px',
    backgroundColor: 'var(--badge-bg)',
    color: 'var(--text-primary)',
    borderRadius: 12,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
    border: '1px solid var(--card-border)',
  },
  plusIcon: {
    fontSize: 18,
    fontWeight: 300,
    lineHeight: 1,
  },
  searchWrap: {
    position: 'relative',
    marginBottom: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
  },
  searchInput: {
    width: '100%',
    padding: '14px 16px 14px 44px',
    backgroundColor: 'var(--input-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: 14,
    color: 'var(--text-primary)',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
  },
  chipRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
    overflowX: 'auto',
    scrollbarWidth: 'none',
    paddingBottom: 4,
  },
  chip: {
    padding: '8px 18px',
    backgroundColor: 'var(--badge-bg)',
    color: 'var(--text-secondary)',
    border: 'none',
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  chipActive: {
    padding: '8px 18px',
    backgroundColor: 'var(--text-primary)',
    color: 'var(--page-bg)',
    border: 'none',
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  postList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  skeleton: {
    height: 400,
    backgroundColor: 'var(--skeleton-bg)',
    borderRadius: 16,
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: 16,
  },
  card: {
    backgroundColor: 'var(--card-bg)',
    borderRadius: 16,
    border: '1px solid var(--card-border)',
    overflow: 'hidden',
  },
  cardLink: {
    display: 'block',
    textDecoration: 'none',
    color: 'inherit',
  },
  imageWrap: {
    width: '100%',
    height: 220,
    overflow: 'hidden',
    backgroundColor: 'var(--card-border)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--card-bg)',
  },
  cardBody: {
    padding: '16px 16px 12px',
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: 'var(--badge-bg)',
    color: 'var(--badge-text)',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 500,
    marginBottom: 10,
  },
  cardTitle: {
    margin: '0 0 8px',
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--text-primary)',
    lineHeight: 1.3,
  },
  cardExcerpt: {
    margin: '0 0 14px',
    fontSize: 14,
    lineHeight: 1.6,
    color: 'var(--text-muted)',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 13,
    color: 'var(--text-muted)',
  },
  actionBar: {
    display: 'flex',
    borderTop: '1px solid var(--card-border)',
  },
  editBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '12px 0',
    color: 'var(--btn-primary-bg)',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    borderRight: '1px solid var(--card-border)',
  },
  deleteBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '12px 0',
    color: '#ef4444',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  loadingMore: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '24px 0',
  },
  spinner: {
    width: 20,
    height: 20,
    border: '2px solid var(--card-border)',
    borderTopColor: 'var(--text-muted)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};
