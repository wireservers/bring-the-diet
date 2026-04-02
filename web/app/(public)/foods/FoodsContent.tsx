'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface FoodItem {
  id: string;
  name: string;
  servingLabel: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const DEFAULT_FOODS: FoodItem[] = [
  { id: '1', name: 'Chicken Breast', servingLabel: 'Per 100g', calories: 165, protein: 31, carbs: 0, fats: 3.6 },
  { id: '2', name: 'Brown Rice', servingLabel: 'Per 100g', calories: 112, protein: 2.6, carbs: 24, fats: 0.9 },
  { id: '3', name: 'Broccoli', servingLabel: 'Per 100g', calories: 34, protein: 2.8, carbs: 7, fats: 0.4 },
  { id: '4', name: 'Salmon', servingLabel: 'Per 100g', calories: 208, protein: 20, carbs: 0, fats: 13 },
  { id: '5', name: 'Sweet Potato', servingLabel: 'Per 100g', calories: 86, protein: 1.6, carbs: 20, fats: 0.1 },
  { id: '6', name: 'Eggs', servingLabel: 'Per 100g', calories: 155, protein: 13, carbs: 1.1, fats: 11 },
  { id: '7', name: 'Avocado', servingLabel: 'Per 100g', calories: 160, protein: 2, carbs: 9, fats: 15 },
  { id: '8', name: 'Greek Yogurt', servingLabel: 'Per 100g', calories: 59, protein: 10, carbs: 3.6, fats: 0.7 },
  { id: '9', name: 'Quinoa', servingLabel: 'Per 100g', calories: 120, protein: 4.4, carbs: 21, fats: 1.9 },
  { id: '10', name: 'Almonds', servingLabel: 'Per 100g', calories: 579, protein: 21, carbs: 22, fats: 50 },
];

export function FoodsContent() {
  const [foods] = useState<FoodItem[]>(DEFAULT_FOODS);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return foods;
    const term = search.toLowerCase();
    return foods.filter((f) => f.name.toLowerCase().includes(term));
  }, [foods, search]);

  const handleDelete = (id: string) => {
    if (!confirm('Delete this food item?')) return;
    // placeholder — would call API
    console.log('Delete food', id);
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <Link href="/" style={styles.backBtn}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 style={styles.headerTitle}>Food Database</h1>
        <div style={{ width: 22 }} />
      </div>

      {/* Search */}
      <div style={styles.searchWrap}>
        <span style={styles.searchIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search foods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Food List */}
      <div style={styles.foodList}>
        {filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No foods found</p>
          </div>
        ) : (
          filtered.map((food) => (
            <div key={food.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.foodName}>{food.name}</h2>
                <div style={styles.cardActions}>
                  <button type="button" style={styles.editBtn} aria-label="Edit food">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => handleDelete(food.id)} style={styles.deleteBtn} aria-label="Delete food">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
              <span style={styles.servingLabel}>{food.servingLabel}</span>
              <div style={styles.nutrientRow}>
                <div style={styles.nutrientBox}>
                  <span style={styles.nutrientLabel}>Calories</span>
                  <span style={styles.nutrientValue}>{food.calories}</span>
                </div>
                <div style={styles.nutrientBox}>
                  <span style={styles.nutrientLabel}>Protein</span>
                  <span style={styles.nutrientValue}>{food.protein}g</span>
                </div>
                <div style={styles.nutrientBox}>
                  <span style={styles.nutrientLabel}>Carbs</span>
                  <span style={styles.nutrientValue}>{food.carbs}g</span>
                </div>
                <div style={styles.nutrientBox}>
                  <span style={styles.nutrientLabel}>Fats</span>
                  <span style={styles.nutrientValue}>{food.fats}g</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <Link href="/foods/new" style={styles.fab}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </Link>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: 'calc(100vh - 120px)',
    backgroundColor: '#111827',
    padding: '0 16px 100px',
    position: 'relative',
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
    fontSize: 20,
    fontWeight: 700,
    color: 'white',
  },
  searchWrap: {
    position: 'relative',
    marginBottom: 20,
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
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: 14,
    color: 'white',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
  },
  foodList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    border: '1px solid #374151',
    padding: '20px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  foodName: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: 'white',
  },
  cardActions: {
    display: 'flex',
    gap: 8,
  },
  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'var(--btn-primary-bg)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#374151',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  servingLabel: {
    display: 'block',
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 14,
  },
  nutrientRow: {
    display: 'flex',
    gap: 8,
  },
  nutrientBox: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 10,
    padding: '10px 8px',
    textAlign: 'center',
  },
  nutrientLabel: {
    display: 'block',
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  nutrientValue: {
    display: 'block',
    fontSize: 16,
    fontWeight: 700,
    color: 'white',
  },
  fab: {
    position: 'fixed',
    bottom: 90,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: '50%',
    backgroundColor: 'var(--btn-primary-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
};
