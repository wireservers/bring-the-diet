'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../lib/useAuth';
import { fetchWithAuth } from '../../../lib/fetchWithAuth';
import { useApiHealthRedirect } from '../../../lib/useApiHealthRedirect';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MEAL_ICONS: Record<string, string> = {
  breakfast: '\u{1F35E}',
  lunch: '\u{2600}\u{FE0F}',
  dinner: '\u{1F319}',
  snack: '\u{1F34E}',
};

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];

interface MealPlanEntry {
  day?: string;
  mealType?: string;
  recipeId?: string;
  servings?: number;
  notes?: string;
}

interface MealPlan {
  id: string;
  userId: string;
  weekStart?: string;
  entries?: MealPlanEntry[];
  createdAt: string;
  updatedAt: string;
}

interface RecipeInfo {
  id: string;
  title: string;
  calories?: number;
}

function getMonday(offset: number): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1 - day) + offset * 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
  return monday;
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateFull(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function toWeekKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function MealPlansContent() {
  const { isAuthenticated, getAccessToken } = useAuth();
  const { handleApiError } = useApiHealthRedirect();
  const [weekOffset, setWeekOffset] = useState(0);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [recipes, setRecipes] = useState<Record<string, RecipeInfo>>({});
  const [loading, setLoading] = useState(true);

  const monday = getMonday(weekOffset);
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
  const weekLabel = weekOffset === 0 ? 'This Week' : weekOffset === -1 ? 'Last Week' : weekOffset === 1 ? 'Next Week' : `Week of ${formatDateShort(monday)}`;
  const dateRange = `${formatDateShort(monday)} - ${formatDateShort(sunday)}, ${sunday.getFullYear()}`;

  const fetchMealPlan = useCallback(async () => {
    setLoading(true);
    try {
      const weekKey = toWeekKey(monday);
      const res = await fetch(`${API_URL}/api/mealplans?page=1&pageSize=100`);
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      const plans: MealPlan[] = data.items || [];

      const match = plans.find(p => p.weekStart === weekKey);
      setMealPlan(match || null);

      if (match?.entries) {
        const recipeIds = [...new Set(match.entries.map(e => e.recipeId).filter(Boolean))] as string[];
        const fetched: Record<string, RecipeInfo> = {};
        await Promise.all(
          recipeIds.map(async (rid) => {
            try {
              const r = await fetch(`${API_URL}/api/recipes/${rid}`);
              if (r.ok) {
                const recipe = await r.json();
                fetched[rid] = { id: recipe.id, title: recipe.title, calories: recipe.calories };
              }
            } catch { /* skip */ }
          })
        );
        setRecipes(fetched);
      } else {
        setRecipes({});
      }
    } catch (err) { handleApiError(err); }
    setLoading(false);
  }, [monday.getTime()]);

  useEffect(() => { fetchMealPlan(); }, [fetchMealPlan]);

  const handleDeleteEntry = async (entryIndex: number) => {
    if (!mealPlan) return;
    const updated = (mealPlan.entries || []).filter((_, i) => i !== entryIndex);
    try {
      const res = await fetchWithAuth(
        `/api/mealplans/${mealPlan.id}`,
        getAccessToken,
        {
          method: 'PUT',
          body: JSON.stringify({ entries: updated }),
        }
      );
      if (res.ok || res.status === 204) {
        setMealPlan({ ...mealPlan, entries: updated });
      }
    } catch { /* ignore */ }
  };

  const entries = mealPlan?.entries || [];
  const totalMeals = entries.length;
  const totalCalories = entries.reduce((sum, e) => {
    const r = e.recipeId ? recipes[e.recipeId] : null;
    return sum + (r?.calories || 0);
  }, 0);

  const dayGroups = DAYS.map((day, dayIndex) => {
    const dayEntries = entries
      .map((e, originalIndex) => ({ ...e, originalIndex }))
      .filter(e => e.day === day)
      .sort((a, b) => MEAL_ORDER.indexOf(a.mealType || '') - MEAL_ORDER.indexOf(b.mealType || ''));
    const dayCal = dayEntries.reduce((sum, e) => {
      const r = e.recipeId ? recipes[e.recipeId] : null;
      return sum + (r?.calories || 0);
    }, 0);
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + dayIndex);
    return { day, date, entries: dayEntries, calories: dayCal };
  }).filter(g => g.entries.length > 0);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>Meal Plans</h1>
          <p style={styles.subtitle}>Plan your weekly meals</p>
        </div>
        <button type="button" style={styles.settingsBtn} aria-label="Settings">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Week Navigator */}
      <div style={styles.weekNav}>
        <button type="button" onClick={() => setWeekOffset(w => w - 1)} style={styles.arrowBtn} aria-label="Previous week">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div style={styles.weekInfo}>
          <span style={styles.weekLabel}>{weekLabel}</span>
          <span style={styles.weekDates}>{dateRange}</span>
        </div>
        <button type="button" onClick={() => setWeekOffset(w => w + 1)} style={styles.arrowBtn} aria-label="Next week">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Summary Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{totalMeals}</span>
          <span style={styles.statLabel}>Meals Planned</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{totalCalories}</span>
          <span style={styles.statLabel}>Total Calories</span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={styles.emptyState}>
          <p style={{ color: '#9ca3af' }}>Loading...</p>
        </div>
      ) : dayGroups.length === 0 ? (
        <div style={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <p style={styles.emptyText}>No meals planned for this week</p>
          <p style={styles.emptyHint}>Create a meal plan to get started</p>
        </div>
      ) : (
        <div style={styles.dayList}>
          {dayGroups.map(group => (
            <div key={group.day} style={styles.daySection}>
              {/* Day Header */}
              <div style={styles.dayHeader}>
                <div>
                  <span style={styles.dayName}>{group.day}</span>
                  <span style={styles.dayDate}>{formatDateFull(group.date)}</span>
                </div>
                {group.calories > 0 && (
                  <span style={styles.dayCalBadge}>{group.calories} cal</span>
                )}
              </div>

              {/* Meal Cards */}
              {group.entries.map(entry => {
                const recipe = entry.recipeId ? recipes[entry.recipeId] : null;
                const mealType = (entry.mealType || 'meal').toLowerCase();
                const icon = MEAL_ICONS[mealType] || '\u{1F37D}\u{FE0F}';
                return (
                  <div key={entry.originalIndex} style={styles.mealCard}>
                    <div style={styles.mealContent}>
                      <div style={styles.mealTypeRow}>
                        <span style={styles.mealIcon}>{icon}</span>
                        <span style={styles.mealTypeLabel}>{mealType.toUpperCase()}</span>
                      </div>
                      <span style={styles.mealName}>{recipe?.title || entry.notes || 'Untitled meal'}</span>
                      {recipe?.calories != null && (
                        <span style={styles.mealCal}>{recipe.calories} cal</span>
                      )}
                    </div>
                    {isAuthenticated && (
                      <button
                        type="button"
                        onClick={() => handleDeleteEntry(entry.originalIndex)}
                        style={styles.deleteMealBtn}
                        aria-label="Remove meal"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
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
    margin: -16,
    padding: '0 0 32px',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 20px 0',
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    backgroundColor: 'transparent',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
  heading: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
  },
  subtitle: {
    margin: '4px 0 0',
    fontSize: 14,
    color: 'var(--text-muted)',
  },
  weekNav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 20px',
    gap: 12,
  },
  arrowBtn: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
  weekInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  weekLabel: {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  weekDates: {
    fontSize: 14,
    color: 'var(--text-muted)',
  },
  statsRow: {
    display: 'flex',
    gap: 12,
    padding: '0 20px 20px',
  },
  statCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '20px 16px',
    backgroundColor: 'var(--card-bg)',
    borderRadius: 16,
    border: '1px solid var(--card-border)',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  statLabel: {
    fontSize: 13,
    color: 'var(--text-muted)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: '64px 20px',
  },
  emptyText: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text-muted)',
  },
  emptyHint: {
    margin: 0,
    fontSize: 14,
    color: 'var(--text-muted)',
  },
  dayList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: '0 20px',
  },
  daySection: {
    backgroundColor: 'var(--card-bg)',
    borderRadius: 20,
    border: '1px solid var(--card-border)',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  dayHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  dayName: {
    display: 'block',
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  dayDate: {
    display: 'block',
    fontSize: 13,
    color: 'var(--text-muted)',
    marginTop: 2,
  },
  dayCalBadge: {
    padding: '6px 14px',
    backgroundColor: 'var(--badge-bg)',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--badge-text)',
  },
  mealCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--input-bg)',
    borderRadius: 14,
    border: '1px solid var(--card-border)',
    padding: '14px 16px',
  },
  mealContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
  },
  mealTypeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  mealIcon: {
    fontSize: 16,
  },
  mealTypeLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-muted)',
    letterSpacing: 0.5,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  mealCal: {
    fontSize: 13,
    color: 'var(--text-muted)',
  },
  deleteMealBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: 'none',
    color: '#ef4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    marginLeft: 12,
  },
};
