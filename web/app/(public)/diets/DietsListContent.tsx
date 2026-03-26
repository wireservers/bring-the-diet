'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApiHealthRedirect } from '../../../lib/useApiHealthRedirect';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

interface DietType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  recipeCount: number;
  color?: string;
}

const DEFAULT_DIETS: DietType[] = [
  { id: '1', name: 'Keto', slug: 'keto', icon: '🥑', description: 'High-fat, low-carb diet for weight loss and energy', recipeCount: 0 },
  { id: '2', name: 'Paleo', slug: 'paleo', icon: '🍖', description: 'Whole foods, no processed items - eat like our ancestors', recipeCount: 0 },
  { id: '3', name: 'Vegan', slug: 'vegan', icon: '🌿', description: 'Plant-based diet with no animal products', recipeCount: 0 },
  { id: '4', name: 'Vegetarian', slug: 'vegetarian', icon: '🍅', description: 'Plant-focused diet that may include dairy and eggs', recipeCount: 0 },
  { id: '5', name: 'Mediterranean', slug: 'mediterranean', icon: '🫒', description: 'Heart-healthy diet rich in olive oil, fish, and whole grains', recipeCount: 0 },
  { id: '6', name: 'Low Carb', slug: 'low-carb', icon: '🥩', description: 'Reduced carbohydrate intake for weight management', recipeCount: 0 },
  { id: '7', name: 'Gluten Free', slug: 'gluten-free', icon: '🌾', description: 'Eliminates gluten-containing grains and products', recipeCount: 0 },
  { id: '8', name: 'DASH', slug: 'dash', icon: '❤️', description: 'Dietary approach to stop hypertension', recipeCount: 0 },
  { id: '9', name: 'High Protein', slug: 'high-protein', icon: '💪', description: 'Protein-rich diet for muscle building and recovery', recipeCount: 0 },
  { id: '10', name: 'Diabetic', slug: 'diabetic', icon: '🩺', description: 'Blood sugar-friendly meals for diabetes management', recipeCount: 0 },
  { id: '11', name: 'Low FODMAP', slug: 'low-fodmap', icon: '🧘', description: 'Reduces fermentable carbs for digestive comfort', recipeCount: 0 },
];

export function DietsListContent() {
  const { handleApiError } = useApiHealthRedirect();
  const [diets, setDiets] = useState<DietType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDiets() {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(`${API_URL}/api/diets`, { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.items || [];
        setDiets(items.length > 0 ? items : DEFAULT_DIETS);
      } catch (err) {
        if (!handleApiError(err)) setDiets(DEFAULT_DIETS);
      } finally {
        setLoading(false);
      }
    }
    fetchDiets();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Special Diets</h1>
          <p style={styles.subtitle}>Browse popular diet types</p>
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={styles.skeletonCard} />
          ))}
        </div>
      ) : (
        <div style={styles.list}>
          {diets.map((diet) => (
            <Link
              key={diet.id || diet.slug}
              href={`/diets/${diet.slug}`}
              style={styles.card}
            >
              <div style={styles.cardContent}>
                <span style={styles.icon}>{diet.icon || '🍽️'}</span>
                <div style={styles.cardText}>
                  <h2 style={styles.cardTitle}>{diet.name}</h2>
                  {diet.description && (
                    <p style={styles.cardDescription}>{diet.description}</p>
                  )}
                  <div style={styles.cardMeta}>
                    <span style={styles.recipeCount}>
                      {diet.recipeCount} recipes
                    </span>
                    <span style={styles.chevron}>›</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: 'calc(100vh - 120px)',
    backgroundColor: 'var(--page-bg)',
    padding: '24px 16px 100px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
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
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  skeletonCard: {
    height: 100,
    backgroundColor: 'var(--skeleton-bg)',
    borderRadius: 16,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    display: 'block',
    textDecoration: 'none',
    backgroundColor: 'var(--card-bg)',
    borderRadius: 16,
    border: '1px solid var(--card-border)',
    padding: 16,
    transition: 'border-color 0.2s',
  },
  cardContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
  },
  icon: {
    fontSize: 32,
    lineHeight: 1,
    flexShrink: 0,
    marginTop: 2,
  },
  cardText: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  cardDescription: {
    margin: '6px 0 0',
    fontSize: 13,
    lineHeight: 1.5,
    color: 'var(--text-muted)',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  recipeCount: {
    fontSize: 13,
    color: '#6ee7b7',
    fontWeight: 500,
  },
  chevron: {
    fontSize: 20,
    color: 'var(--text-muted)',
    fontWeight: 300,
  },
};
