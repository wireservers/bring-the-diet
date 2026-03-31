'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApiHealthRedirect } from '../../../../../lib/useApiHealthRedirect';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

interface IngredientForm {
  name: string;
  quantity: string;
  unit: string;
  notes: string;
}

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { handleApiError } = useApiHealthRedirect();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [diet, setDiet] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [calories, setCalories] = useState('');
  const [ingredients, setIngredients] = useState<IngredientForm[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function fetchRecipe() {
      try {
        const res = await fetch(`${API_URL}/api/recipes/${id}`);
        if (!res.ok) {
          if (res.status >= 502 && res.status <= 504) {
            throw new Error(`Service unavailable (${res.status})`);
          }
          setError(res.status === 404 ? 'Recipe not found' : 'Failed to load recipe');
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (cancelled) return;

        setTitle(data.title || '');
        setDescription(data.description || '');
        setImage(data.image || '');
        setDiet(data.diet || '');
        setPrepTime(data.prepTime != null ? String(data.prepTime) : '');
        setCalories(data.calories != null ? String(data.calories) : '');
        setIngredients(
          (data.ingredients || []).map((i: { name: string; quantity?: number; unit?: string; notes?: string }) => ({
            name: i.name || '',
            quantity: i.quantity != null ? String(i.quantity) : '',
            unit: i.unit || '',
            notes: i.notes || '',
          }))
        );
        setInstructions(data.instructions || []);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          if (!handleApiError(err)) {
            setError('Failed to load recipe');
            setLoading(false);
          }
        }
      }
    }

    fetchRecipe();
    return () => { cancelled = true; };
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    setError(null);

    const body: Record<string, unknown> = { title: title.trim() };
    if (description.trim()) body.description = description.trim();
    if (image.trim()) body.image = image.trim();
    if (diet.trim()) {
      body.diet = diet.trim();
      body.dietSlug = diet.trim().toLowerCase().replace(/\s+/g, '-');
    }
    if (prepTime.trim()) body.prepTime = parseInt(prepTime, 10);
    if (calories.trim()) body.calories = parseInt(calories, 10);

    if (ingredients.length > 0) {
      body.ingredients = ingredients
        .filter(i => i.name.trim())
        .map(i => ({
          name: i.name.trim(),
          ...(i.quantity.trim() ? { quantity: parseFloat(i.quantity) } : {}),
          ...(i.unit.trim() ? { unit: i.unit.trim() } : {}),
          ...(i.notes.trim() ? { notes: i.notes.trim() } : {}),
        }));
    }

    if (instructions.length > 0) {
      body.instructions = instructions.filter(s => s.trim());
    }

    try {
      const res = await fetch(`${API_URL}/api/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok || res.status === 204) {
        router.push(`/recipes/${id}`);
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.message || `Failed to save (${res.status})`);
      }
    } catch (err) {
      if (!handleApiError(err)) {
        setError('Failed to save recipe');
      }
    } finally {
      setSaving(false);
    }
  };

  const updateIngredient = (index: number, field: keyof IngredientForm, value: string) => {
    setIngredients(prev => prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)));
  };

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const addIngredient = () => {
    setIngredients(prev => [...prev, { name: '', quantity: '', unit: '', notes: '' }]);
  };

  const updateInstruction = (index: number, value: string) => {
    setInstructions(prev => prev.map((s, i) => (i === index ? value : s)));
  };

  const removeInstruction = (index: number) => {
    setInstructions(prev => prev.filter((_, i) => i !== index));
  };

  const addInstruction = () => {
    setInstructions(prev => [...prev, '']);
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9ca3af' }}>Loading...</p>
      </div>
    );
  }

  if (error && !title) {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: '#ef4444' }}>{error}</p>
        <Link href="/recipes" style={styles.cancelLink}>Back to Recipes</Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link href={`/recipes/${id}`} style={styles.backBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 style={styles.heading}>Edit Recipe</h1>
      </div>

      {error && <p style={styles.errorMsg}>{error}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Title */}
        <label style={styles.label}>
          Title *
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            style={styles.input}
            placeholder="Recipe title"
          />
        </label>

        {/* Description */}
        <label style={styles.label}>
          Description
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            style={{ ...styles.input, resize: 'vertical' as const }}
            placeholder="Brief description"
          />
        </label>

        {/* Image URL */}
        <label style={styles.label}>
          Image URL
          <input
            type="url"
            value={image}
            onChange={e => setImage(e.target.value)}
            style={styles.input}
            placeholder="https://..."
          />
        </label>

        {/* Row: Diet, Prep Time, Calories */}
        <div style={styles.row}>
          <label style={{ ...styles.label, flex: 1 }}>
            Diet
            <input
              type="text"
              value={diet}
              onChange={e => setDiet(e.target.value)}
              style={styles.input}
              placeholder="e.g. Mediterranean"
            />
          </label>
          <label style={{ ...styles.label, flex: 1 }}>
            Prep Time (min)
            <input
              type="number"
              value={prepTime}
              onChange={e => setPrepTime(e.target.value)}
              style={styles.input}
              min="0"
            />
          </label>
          <label style={{ ...styles.label, flex: 1 }}>
            Calories
            <input
              type="number"
              value={calories}
              onChange={e => setCalories(e.target.value)}
              style={styles.input}
              min="0"
            />
          </label>
        </div>

        {/* Ingredients */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Ingredients</h3>
            <button type="button" onClick={addIngredient} style={styles.addBtn}>+ Add</button>
          </div>
          {ingredients.map((ing, i) => (
            <div key={i} style={styles.ingredientRow}>
              <input
                type="text"
                value={ing.quantity}
                onChange={e => updateIngredient(i, 'quantity', e.target.value)}
                style={{ ...styles.input, width: 70 }}
                placeholder="Qty"
              />
              <input
                type="text"
                value={ing.unit}
                onChange={e => updateIngredient(i, 'unit', e.target.value)}
                style={{ ...styles.input, width: 80 }}
                placeholder="Unit"
              />
              <input
                type="text"
                value={ing.name}
                onChange={e => updateIngredient(i, 'name', e.target.value)}
                style={{ ...styles.input, flex: 1 }}
                placeholder="Ingredient name"
              />
              <input
                type="text"
                value={ing.notes}
                onChange={e => updateIngredient(i, 'notes', e.target.value)}
                style={{ ...styles.input, width: 120 }}
                placeholder="Notes"
              />
              <button type="button" onClick={() => removeIngredient(i)} style={styles.removeBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Instructions</h3>
            <button type="button" onClick={addInstruction} style={styles.addBtn}>+ Add Step</button>
          </div>
          {instructions.map((step, i) => (
            <div key={i} style={styles.stepRow}>
              <span style={styles.stepNum}>{i + 1}</span>
              <textarea
                value={step}
                onChange={e => updateInstruction(i, e.target.value)}
                rows={2}
                style={{ ...styles.input, flex: 1, resize: 'vertical' as const }}
                placeholder={`Step ${i + 1}`}
              />
              <button type="button" onClick={() => removeInstruction(i)} style={styles.removeBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <Link href={`/recipes/${id}`} style={styles.cancelBtn}>Cancel</Link>
          <button type="submit" disabled={saving || !title.trim()} style={styles.saveBtn}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#111827',
    color: 'white',
    margin: -16,
    padding: '0 0 48px',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '20px 20px 0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  heading: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
  },
  errorMsg: {
    margin: '12px 20px 0',
    padding: '12px 16px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    color: '#fca5a5',
    fontSize: 14,
  },
  form: {
    padding: '20px 20px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    color: '#9ca3af',
  },
  input: {
    padding: '12px 14px',
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: 10,
    color: 'white',
    fontSize: 15,
    outline: 'none',
    fontFamily: 'inherit',
  },
  row: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap' as const,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: 'white',
  },
  addBtn: {
    padding: '6px 14px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: 8,
    color: '#10b981',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  ingredientRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  stepRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
  },
  stepNum: {
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
    marginTop: 10,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: 'none',
    color: '#ef4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
  actions: {
    display: 'flex',
    gap: 12,
    paddingTop: 8,
  },
  cancelBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px 24px',
    backgroundColor: 'var(--btn-secondary-bg)',
    border: 'none',
    borderRadius: 14,
    color: 'var(--btn-secondary-text)',
    fontSize: 16,
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
  },
  saveBtn: {
    flex: 1,
    padding: '16px 24px',
    backgroundColor: 'var(--btn-primary-bg)',
    border: 'none',
    borderRadius: 14,
    color: 'var(--btn-primary-text)',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
  cancelLink: {
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
