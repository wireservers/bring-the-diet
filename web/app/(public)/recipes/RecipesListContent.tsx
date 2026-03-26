'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/useAuth';
import { fetchWithAuth } from '../../../lib/fetchWithAuth';
import { useApiHealthRedirect } from '../../../lib/useApiHealthRedirect';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

interface Diet {
  _id: string;
  id: string;
  name: string;
  slug: string;
}

interface RecipeIngredient {
  name: string;
  quantity?: number;
  unit?: string;
  notes?: string;
}

interface Recipe {
  id: string;
  title: string;
  image?: string;
  diet?: string;
  dietSlug?: string;
  prepTime?: number;
  calories?: number;
  isFavorite: boolean;
  featured: boolean;
  description?: string;
  ingredients?: RecipeIngredient[];
  instructions?: string[];
  createdAt: string;
  updatedAt: string;
}

export function RecipesListContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [diets, setDiets] = useState<Diet[]>([]);
  const [selectedDiet, setSelectedDiet] = useState('All');
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, getAccessToken } = useAuth();
  const { handleApiError } = useApiHealthRedirect();

  useEffect(() => {
    async function fetchData() {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const [dietsResult, recipesResult] = await Promise.allSettled([
          fetch(`${API_URL}/api/diets`, { signal: controller.signal }).then(async (res) => {
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? data : data.items || [];
          }),
          fetch(`${API_URL}/api/recipes`, { signal: controller.signal }).then(async (res) => {
            if (!res.ok) {
              const body = await res.json().catch(() => null);
              throw new Error(body?.message || `Failed to fetch recipes (${res.status})`);
            }
            const data = await res.json();
            return data.items || [];
          }),
        ]);

        clearTimeout(timeout);

        if (dietsResult.status === 'rejected' && recipesResult.status === 'rejected') {
          throw dietsResult.reason;
        }

        if (dietsResult.status === 'fulfilled') {
          setDiets(dietsResult.value);
        }

        if (recipesResult.status === 'fulfilled') {
          setRecipes(recipesResult.value);
        } else {
          throw recipesResult.reason;
        }

        setLoading(false);
      } catch (err) {
        if (!handleApiError(err)) {
          setLoading(false);
        }
      }
    }

    fetchData();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!isAuthenticated) {
      alert('Please sign in to delete recipes.');
      return;
    }
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const res = await fetchWithAuth(`/api/recipes/${id}`, getAccessToken, { method: 'DELETE' });
      if (res.ok) {
        setRecipes(prev => prev.filter(r => r.id !== id));
      }
    } catch {
      alert('Failed to delete recipe. Are you signed in?');
    }
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesDiet = selectedDiet === 'All' || recipe.diet === selectedDiet;
    const matchesSearch = !searchQuery || recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDiet && matchesSearch;
  });

  // Get unique diet names from the diets collection for filter pills
  const dietNames = ['All', ...new Set(diets.map(d => d.name).filter(Boolean))];

  if (loading) {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9ca3af' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        .diet-filter-scroll {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 4px 0;
        }
        .diet-filter-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.pageTitle}>Recipes</h1>
        <button style={styles.settingsButton} type="button" aria-label="Settings">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>
      </header>

      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <svg style={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Filter by Diet */}
      <div style={styles.filterSection}>
        <div style={styles.filterHeader}>
          <h2 style={styles.filterTitle}>Filter by Diet</h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </div>
        <div className="diet-filter-scroll">
          {dietNames.map((diet) => (
            <button
              key={diet}
              type="button"
              onClick={() => setSelectedDiet(diet)}
              style={{
                ...styles.filterPill,
                ...(selectedDiet === diet ? styles.filterPillActive : {}),
              }}
            >
              {diet}
            </button>
          ))}
        </div>
      </div>

      {/* Add New Recipe */}
      <Link href="/recipes/new" style={styles.addButton}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add New Recipe
      </Link>

      {/* Recipe Count */}
      <p style={styles.recipeCount}>{filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found</p>

      {/* Recipe List */}
      <div style={styles.recipeList}>
        {filteredRecipes.map((recipe) => (
          <Link key={recipe.id} href={`/recipes/${recipe.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={styles.recipeCard}>
              {/* Recipe Image */}
              <div style={styles.recipeImageContainer}>
                {recipe.image ? (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    style={styles.recipeImage}
                  />
                ) : (
                  <div style={styles.recipeImagePlaceholder}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Recipe Info */}
              <div style={styles.recipeInfo}>
                <h3 style={styles.recipeTitle}>{recipe.title}</h3>

                {/* Diet Tags */}
                {recipe.diet && (
                  <div style={styles.tagRow}>
                    <span style={styles.tag}>{recipe.diet}</span>
                  </div>
                )}

                {/* Meta: prep time + calories */}
                <div style={styles.metaRow}>
                  {recipe.prepTime != null && (
                    <span style={styles.metaItem}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      {recipe.prepTime} min
                    </span>
                  )}
                  {recipe.calories != null && (
                    <span style={styles.metaItem}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                        <path d="M12 12c-2-2.67-4-4-4-6a4 4 0 0 1 8 0c0 2-2 3.33-4 6zm0 0c2 2.67 4 4 4 6a4 4 0 0 1-8 0c0-2 2-3.33 4-6z" />
                      </svg>
                      {recipe.calories} cal
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={styles.actionRow}>
                  <button
                    type="button"
                    style={styles.editButton}
                    onClick={(e) => { e.preventDefault(); }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    type="button"
                    style={styles.deleteButton}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(recipe.id, recipe.title); }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div style={styles.emptyState}>
          <p style={{ color: '#9ca3af', fontSize: 16 }}>No recipes match your filters.</p>
          <button
            type="button"
            style={styles.clearFilters}
            onClick={() => { setSelectedDiet('All'); setSearchQuery(''); }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--page-bg)',
    color: 'var(--text-primary)',
    padding: '0 0 32px',
    margin: -16,
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
  },
  pageTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
  },
  settingsButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    padding: 8,
  },
  searchContainer: {
    position: 'relative',
    margin: '0 20px 20px',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  searchInput: {
    width: '100%',
    padding: '16px 16px 16px 48px',
    backgroundColor: 'var(--input-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: 16,
    color: 'var(--text-primary)',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  },
  filterSection: {
    padding: '0 20px',
    marginBottom: 20,
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
  },
  filterPill: {
    padding: '8px 20px',
    borderRadius: 20,
    border: '1px solid var(--card-border)',
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  filterPillActive: {
    backgroundColor: 'var(--text-primary)',
    color: 'var(--page-bg)',
    border: '1px solid var(--text-primary)',
    fontWeight: 600,
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: '0 20px 20px',
    padding: '16px 24px',
    backgroundColor: 'var(--card-bg)',
    border: '1px dashed var(--card-border)',
    borderRadius: 16,
    color: 'var(--text-primary)',
    fontSize: 16,
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
  },
  recipeCount: {
    padding: '0 20px',
    margin: '0 0 16px',
    fontSize: 14,
    color: 'var(--text-muted)',
  },
  recipeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    padding: '0 20px',
  },
  recipeCard: {
    backgroundColor: 'var(--card-bg)',
    borderRadius: 20,
    overflow: 'hidden',
    border: '1px solid var(--card-border)',
  },
  recipeImageContainer: {
    width: '100%',
    height: 220,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  recipeImagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--input-bg)',
  },
  recipeInfo: {
    padding: '16px 20px 20px',
  },
  recipeTitle: {
    margin: '0 0 12px',
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  tagRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    padding: '5px 14px',
    backgroundColor: 'var(--badge-bg)',
    borderRadius: 16,
    fontSize: 13,
    color: 'var(--badge-text)',
    fontWeight: 500,
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    color: 'var(--text-muted)',
  },
  actionRow: {
    display: 'flex',
    gap: 12,
  },
  editButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 16px',
    backgroundColor: 'var(--btn-primary-bg)',
    border: 'none',
    borderRadius: 12,
    color: 'var(--btn-primary-text)',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
  },
  deleteButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 16px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: 'none',
    borderRadius: 12,
    color: '#ef4444',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    padding: '48px 20px',
  },
  clearFilters: {
    padding: '10px 24px',
    backgroundColor: 'var(--badge-bg)',
    border: 'none',
    borderRadius: 12,
    color: 'var(--text-primary)',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
};
