'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const DIET_TAGS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Paleo',
  'Low-Carb',
  'High-Protein',
];

interface Ingredient {
  name: string;
}

export default function NewRecipePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '' }]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [saving, setSaving] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { name: '' }]);
  };

  const updateIngredient = (index: number, value: string) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { name: value } : ing))
    );
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const addInstruction = () => {
    setInstructions((prev) => [...prev, '']);
  };

  const updateInstruction = (index: number, value: string) => {
    setInstructions((prev) =>
      prev.map((inst, i) => (i === index ? value : inst))
    );
  };

  const removeInstruction = (index: number) => {
    if (instructions.length <= 1) return;
    setInstructions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        description: description.trim() || undefined,
        image: image.trim() || undefined,
        diet: selectedTags[0] || undefined,
        prepTime: prepTime ? parseInt(prepTime) + (cookTime ? parseInt(cookTime) : 0) : undefined,
        calories: calories ? parseInt(calories) : undefined,
        ingredients: ingredients
          .filter((ing) => ing.name.trim())
          .map((ing) => ({ name: ing.name.trim() })),
        instructions: instructions.filter((inst) => inst.trim()),
      };
      // Mock save — just redirect back
      console.log('[mock] creating recipe', body);
      router.push('/recipes');
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <Link href="/recipes" style={styles.backBtn}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 style={styles.headerTitle}>Add Recipe</h1>
        <div style={{ width: 22 }} />
      </div>

      {/* Basic Information */}
      <h2 style={styles.sectionHeading}>Basic Information</h2>

      <label style={styles.label}>
        Recipe Title <span style={{ color: '#ef4444' }}>*</span>
      </label>
      <input
        type="text"
        placeholder="e.g., Creamy Tomato Pasta"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={styles.input}
      />

      <label style={styles.label}>Description</label>
      <textarea
        placeholder="Brief description of your recipe..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        style={{ ...styles.input, resize: 'vertical', minHeight: 80 }}
      />

      <label style={styles.label}>Image URL</label>
      <div style={styles.imageRow}>
        <input
          type="text"
          placeholder="https://example.com/image.jpg"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          style={{ ...styles.input, flex: 1, marginBottom: 0 }}
        />
        <div style={styles.uploadBtn}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
      </div>

      <div style={styles.threeCol}>
        <div style={styles.colItem}>
          <label style={styles.label}>Prep Time (min)</label>
          <input
            type="number"
            placeholder="15"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.colItem}>
          <label style={styles.label}>Cook Time (min)</label>
          <input
            type="number"
            placeholder="30"
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.colItem}>
          <label style={styles.label}>Servings</label>
          <input
            type="number"
            placeholder="4"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            style={styles.input}
          />
        </div>
      </div>

      {/* Diet Tags */}
      <h2 style={styles.sectionHeading}>Diet Tags</h2>
      <div style={styles.tagWrap}>
        {DIET_TAGS.map((tag) => (
          <button
            type="button"
            key={tag}
            onClick={() => toggleTag(tag)}
            style={selectedTags.includes(tag) ? styles.tagActive : styles.tag}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Ingredients */}
      <div style={styles.sectionRow}>
        <h2 style={styles.sectionHeading}>Ingredients</h2>
        <button type="button" onClick={addIngredient} style={styles.addBtn}>
          + Add
        </button>
      </div>
      <div style={styles.listWrap}>
        {ingredients.map((ing, i) => (
          <div key={i} style={styles.listItem}>
            <span style={styles.listNumber}>{i + 1}</span>
            <input
              type="text"
              placeholder="e.g., 2 cups all-purpose flour"
              value={ing.name}
              onChange={(e) => updateIngredient(i, e.target.value)}
              style={{ ...styles.input, flex: 1, marginBottom: 0 }}
            />
            {ingredients.length > 1 && (
              <button type="button" onClick={() => removeIngredient(i)} style={styles.removeBtn} aria-label="Remove ingredient">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div style={styles.sectionRow}>
        <h2 style={styles.sectionHeading}>Instructions</h2>
        <button type="button" onClick={addInstruction} style={styles.addBtn}>
          + Add
        </button>
      </div>
      <div style={styles.listWrap}>
        {instructions.map((inst, i) => (
          <div key={i} style={styles.stepBlock}>
            <div style={styles.stepHeader}>
              <span style={styles.stepNumber}>{i + 1}</span>
              <span style={styles.stepLabel}>Step {i + 1}</span>
              {instructions.length > 1 && (
                <button type="button" onClick={() => removeInstruction(i)} style={styles.removeBtn} aria-label="Remove instruction">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
            <textarea
              placeholder="Describe this step in detail..."
              value={inst}
              onChange={(e) => updateInstruction(i, e.target.value)}
              rows={3}
              style={{ ...styles.input, resize: 'vertical', minHeight: 80, marginBottom: 0 }}
            />
          </div>
        ))}
      </div>

      {/* Nutrition Information */}
      <h2 style={styles.sectionHeading}>Nutrition Information (per serving)</h2>
      <div style={styles.twoCol}>
        <div style={styles.colItem}>
          <label style={styles.label}>Calories</label>
          <input
            type="number"
            placeholder="250"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.colItem}>
          <label style={styles.label}>Protein (g)</label>
          <input
            type="number"
            placeholder="12"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            style={styles.input}
          />
        </div>
      </div>
      <div style={styles.twoCol}>
        <div style={styles.colItem}>
          <label style={styles.label}>Carbs (g)</label>
          <input
            type="number"
            placeholder="35"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.colItem}>
          <label style={styles.label}>Fats (g)</label>
          <input
            type="number"
            placeholder="8"
            value={fats}
            onChange={(e) => setFats(e.target.value)}
            style={styles.input}
          />
        </div>
      </div>

      {/* Buttons */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!title.trim() || saving}
        style={{
          ...styles.submitBtn,
          opacity: !title.trim() || saving ? 0.5 : 1,
        }}
      >
        {saving ? 'Saving...' : 'Save Recipe'}
      </button>
      <button
        type="button"
        onClick={() => router.push('/recipes')}
        style={styles.cancelBtn}
      >
        Cancel
      </button>
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
    fontSize: 20,
    fontWeight: 700,
    color: 'white',
  },
  sectionHeading: {
    margin: '0 0 12px',
    fontSize: 20,
    fontWeight: 700,
    color: 'white',
  },
  label: {
    display: 'block',
    fontSize: 15,
    fontWeight: 600,
    color: 'white',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: 14,
    color: 'white',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: 16,
  },
  imageRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#d1d5db',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
  threeCol: {
    display: 'flex',
    gap: 12,
    marginBottom: 0,
  },
  colItem: {
    flex: 1,
  },
  tagWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  tag: {
    padding: '10px 20px',
    backgroundColor: '#374151',
    color: '#d1d5db',
    border: 'none',
    borderRadius: 24,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  tagActive: {
    padding: '10px 20px',
    backgroundColor: 'white',
    color: '#111827',
    border: 'none',
    borderRadius: 24,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  sectionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '8px 18px',
    backgroundColor: '#374151',
    color: 'white',
    border: '1px solid #4b5563',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  twoCol: {
    display: 'flex',
    gap: 12,
    marginBottom: 0,
  },
  listWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginBottom: 24,
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  stepBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: '#374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6ee7b7',
    fontSize: 14,
    fontWeight: 600,
    flexShrink: 0,
  },
  stepLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: 600,
    color: 'white',
  },
  listNumber: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: '#374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: 600,
    flexShrink: 0,
  },
  removeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
  },
  submitBtn: {
    width: '100%',
    padding: '16px',
    backgroundColor: 'var(--btn-primary-bg)',
    color: 'var(--btn-primary-text)',
    border: 'none',
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 8,
  },
  cancelBtn: {
    width: '100%',
    padding: '16px',
    backgroundColor: 'var(--btn-secondary-bg)',
    color: 'var(--btn-secondary-text)',
    border: '1px solid var(--card-border)',
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 12,
  },
};
