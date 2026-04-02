'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/useAuth';
import { recipes as mockRecipes } from '../../../data/mock';

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

export function RecipeDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const found = mockRecipes.find(r => r.id === id);
    if (found) {
      setRecipe(found as unknown as Recipe);
      setError(null);
    } else {
      setError('Recipe not found');
    }
    setLoading(false);
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    setDeleting(true);
    router.push('/recipes');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: recipe?.title, url });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9ca3af' }}>Loading...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: '#ef4444' }}>{error || 'Recipe not found'}</p>
        <Link href="/recipes" style={styles.backLink}>Back to Recipes</Link>
      </div>
    );
  }

  const formatQuantity = (q: number) => (q % 1 === 0 ? q.toFixed(0) : String(q));

  return (
    <div style={styles.container}>
      {/* Hero Image */}
      <div style={styles.heroContainer}>
        {recipe.image ? (
          <img src={recipe.image} alt={recipe.title} style={styles.heroImage} />
        ) : (
          <div style={styles.heroPlaceholder}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}

        {/* Floating Buttons */}
        <div style={styles.floatingButtonRow}>
          <Link href="/recipes" style={styles.floatingButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" style={styles.floatingButton} aria-label="Favorite">
              <svg width="20" height="20" viewBox="0 0 24 24" fill={recipe.isFavorite ? 'white' : 'none'} stroke="white" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button type="button" style={styles.floatingButton} onClick={handleShare} aria-label="Share">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Title */}
        <h1 style={styles.title}>{recipe.title}</h1>

        {/* Description */}
        {recipe.description && (
          <p style={styles.description}>{recipe.description}</p>
        )}

        {/* Diet Tag */}
        {recipe.diet && (
          <div style={styles.tagRow}>
            <span style={styles.tag}>{recipe.diet}</span>
          </div>
        )}

        {/* Meta Row */}
        {(recipe.prepTime != null || recipe.calories != null) && (
          <div style={styles.metaRow}>
            {recipe.prepTime != null && (
              <span style={styles.metaItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                Prep
                <span style={{ color: 'white', fontWeight: 600 }}>{recipe.prepTime} min</span>
              </span>
            )}
            {recipe.calories != null && (
              <span style={styles.metaItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                  <path d="M12 12c-2-2.67-4-4-4-6a4 4 0 0 1 8 0c0 2-2 3.33-4 6zm0 0c2 2.67 4 4 4 6a4 4 0 0 1-8 0c0-2 2-3.33 4-6z" />
                </svg>
                Calories
                <span style={{ color: 'white', fontWeight: 600 }}>{recipe.calories}</span>
              </span>
            )}
          </div>
        )}

        {/* Nutrition Facts */}
        {recipe.calories != null && (
          <div style={styles.nutritionCard}>
            <h3 style={styles.nutritionTitle}>Nutrition Facts</h3>
            <div style={styles.nutritionGrid}>
              <div style={styles.nutritionItem}>
                <span style={styles.nutritionValue}>{recipe.calories}</span>
                <span style={styles.nutritionLabel}>Calories</span>
              </div>
            </div>
          </div>
        )}

        {/* Ingredients */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionHeading}>Ingredients</h3>
            <div style={styles.ingredientCard}>
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} style={styles.ingredientItem}>
                  <span style={styles.bulletDot} />
                  <span>
                    {ingredient.quantity != null && `${formatQuantity(ingredient.quantity)} `}
                    {ingredient.unit && `${ingredient.unit} `}
                    {ingredient.name}
                    {ingredient.notes && (
                      <span style={{ color: '#6b7280' }}> ({ingredient.notes})</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {recipe.instructions && recipe.instructions.filter(s => s.trim()).length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionHeading}>Instructions</h3>
            {recipe.instructions.filter(s => s.trim()).map((step, index) => (
              <div
                key={index}
                style={{
                  ...styles.instructionItem,
                  ...(index < (recipe.instructions?.filter(s => s.trim()).length ?? 0) - 1
                    ? { borderBottom: '1px solid rgba(55, 65, 81, 0.5)' }
                    : {}),
                }}
              >
                <span style={styles.stepNumber}>{index + 1}</span>
                <span style={styles.stepText}>{step}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        <div style={styles.bottomActions}>
          {isAuthenticated && (
            <>
              <Link href={`/recipes/${id}/edit`} style={styles.editButton}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={styles.deleteButton}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#111827',
    color: 'white',
    margin: -16,
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  },
  heroContainer: {
    position: 'relative',
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
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a2332',
  },
  floatingButtonRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  floatingButton: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backdropFilter: 'blur(4px)',
    textDecoration: 'none',
  },
  content: {
    padding: '0 20px 32px',
  },
  title: {
    margin: '20px 0 12px',
    fontSize: 28,
    fontWeight: 700,
    color: 'white',
    lineHeight: 1.2,
  },
  description: {
    margin: '0 0 16px',
    fontSize: 15,
    lineHeight: 1.6,
    color: '#9ca3af',
  },
  tagRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    padding: '6px 16px',
    backgroundColor: '#374151',
    borderRadius: 20,
    fontSize: 13,
    color: '#d1d5db',
    fontWeight: 500,
  },
  metaRow: {
    display: 'flex',
    gap: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    color: '#9ca3af',
  },
  nutritionCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    border: '1px solid #374151',
    padding: 20,
    marginBottom: 24,
  },
  nutritionTitle: {
    margin: '0 0 16px',
    fontSize: 18,
    fontWeight: 700,
    color: 'white',
  },
  nutritionGrid: {
    display: 'flex',
    gap: 16,
  },
  nutritionItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  nutritionValue: {
    fontSize: 28,
    fontWeight: 700,
    color: 'white',
  },
  nutritionLabel: {
    fontSize: 13,
    color: '#9ca3af',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeading: {
    margin: '0 0 16px',
    fontSize: 20,
    fontWeight: 700,
    color: 'white',
  },
  ingredientCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    border: '1px solid #374151',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  ingredientItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 1.6,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#6b7280',
    flexShrink: 0,
    marginTop: 8,
  },
  instructionItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    padding: '14px 0',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },
  stepText: {
    color: '#d1d5db',
    fontSize: 15,
    lineHeight: 1.6,
    paddingTop: 3,
  },
  bottomActions: {
    display: 'flex',
    gap: 12,
    paddingTop: 16,
  },
  editButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '16px 24px',
    backgroundColor: 'var(--btn-primary-bg)',
    border: 'none',
    borderRadius: 14,
    color: 'var(--btn-primary-text)',
    fontSize: 16,
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
  },
  deleteButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '16px 24px',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: 14,
    color: 'white',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
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
