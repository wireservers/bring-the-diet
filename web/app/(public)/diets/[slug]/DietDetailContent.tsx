'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApiHealthRedirect } from '../../../../lib/useApiHealthRedirect';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

interface DietType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  recipeCount: number;
  color?: string;
  category?: string;
}

interface Recipe {
  id: string;
  title: string;
  description?: string;
  image?: string;
  diet?: string;
  dietSlug?: string;
  prepTime?: number;
  calories?: number;
}

interface MealPlan {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snacks: string[];
}

interface DietGuide {
  displayName: string;
  overview: string;
  benefits: string[];
  foodsToEat: string[];
  foodsToAvoid: string[];
  sampleMealPlan: MealPlan;
}

const DIET_GUIDES: Record<string, DietGuide> = {
  keto: {
    displayName: 'Ketogenic Diet',
    overview: 'The ketogenic diet is a high-fat, low-carbohydrate eating plan that puts your body into a metabolic state called ketosis. In ketosis, your body becomes incredibly efficient at burning fat for energy.',
    benefits: [
      'Rapid weight loss and fat burning',
      'Improved mental clarity and focus',
      'Stable blood sugar levels',
      'Reduced inflammation',
      'Increased energy throughout the day',
    ],
    foodsToEat: [
      'Fatty fish (salmon, mackerel, sardines)',
      'Avocados and avocado oil',
      'Nuts and seeds (almonds, walnuts, chia)',
      'Leafy greens (spinach, kale, arugula)',
      'Eggs and full-fat dairy',
      'Olive oil and coconut oil',
      'Meat and poultry',
    ],
    foodsToAvoid: [
      'Sugary foods and drinks',
      'Grains and starches',
      'Most fruits (except berries)',
      'Beans and legumes',
      'Root vegetables',
      'Low-fat or diet products',
    ],
    sampleMealPlan: {
      breakfast: ['Scrambled eggs with avocado', 'Bulletproof coffee', 'Bacon strips'],
      lunch: ['Grilled salmon over spinach salad', 'Olive oil & lemon dressing', 'Macadamia nuts'],
      dinner: ['Ribeye steak with garlic butter', 'Roasted broccoli with parmesan', 'Side salad with ranch'],
      snacks: ['Cheese crisps', 'Pork rinds', 'Celery with almond butter'],
    },
  },
  paleo: {
    displayName: 'Paleo Diet',
    overview: 'The Paleolithic diet focuses on eating whole, unprocessed foods similar to what our hunter-gatherer ancestors consumed. It emphasizes nutrient-dense foods while eliminating modern processed items.',
    benefits: [
      'Improved gut health and digestion',
      'Reduced inflammation throughout the body',
      'Better blood sugar regulation',
      'Increased nutrient intake',
      'Natural weight management',
    ],
    foodsToEat: [
      'Grass-fed meats and wild-caught fish',
      'Fresh vegetables and fruits',
      'Nuts and seeds',
      'Eggs',
      'Healthy oils (olive, coconut, avocado)',
      'Sweet potatoes and tubers',
    ],
    foodsToAvoid: [
      'Grains (wheat, oats, barley)',
      'Dairy products',
      'Refined sugar',
      'Legumes (beans, lentils, peanuts)',
      'Processed foods and vegetable oils',
      'Artificial sweeteners',
    ],
    sampleMealPlan: {
      breakfast: ['Sweet potato hash with eggs', 'Fresh berries', 'Black coffee'],
      lunch: ['Grilled chicken salad with avocado', 'Mixed greens and walnuts', 'Balsamic vinaigrette'],
      dinner: ['Wild-caught salmon with roasted vegetables', 'Cauliflower mash', 'Steamed asparagus'],
      snacks: ['Apple slices with almond butter', 'Beef jerky', 'Mixed nuts'],
    },
  },
  vegan: {
    displayName: 'Vegan Diet',
    overview: 'A vegan diet excludes all animal products and by-products, focusing entirely on plant-based foods. It can provide all necessary nutrients when well-planned and offers significant environmental benefits.',
    benefits: [
      'Lower risk of heart disease',
      'Reduced environmental impact',
      'Lower cholesterol levels',
      'Better weight management',
      'Improved digestive health from high fiber',
    ],
    foodsToEat: [
      'Legumes (lentils, chickpeas, black beans)',
      'Whole grains (quinoa, brown rice, oats)',
      'Nuts and nut butters',
      'Tofu, tempeh, and seitan',
      'Fresh fruits and vegetables',
      'Seeds (flax, hemp, chia)',
      'Plant-based milks',
    ],
    foodsToAvoid: [
      'All meats and poultry',
      'Fish and seafood',
      'Dairy products',
      'Eggs',
      'Honey',
      'Gelatin and animal-derived additives',
    ],
    sampleMealPlan: {
      breakfast: ['Overnight oats with chia and berries', 'Smoothie with spinach and banana', 'Whole grain toast with avocado'],
      lunch: ['Lentil soup with crusty bread', 'Quinoa buddha bowl', 'Roasted chickpea salad'],
      dinner: ['Tofu stir-fry with vegetables', 'Brown rice and edamame', 'Coconut curry with chickpeas'],
      snacks: ['Hummus with veggie sticks', 'Trail mix', 'Dark chocolate squares'],
    },
  },
  vegetarian: {
    displayName: 'Vegetarian Diet',
    overview: 'A vegetarian diet eliminates meat and fish but may include dairy products and eggs. It offers flexibility while still providing the health benefits of a plant-focused eating pattern.',
    benefits: [
      'Lower blood pressure and cholesterol',
      'Reduced risk of type 2 diabetes',
      'Easier weight management',
      'High in fiber and antioxidants',
      'Flexible and easy to follow',
    ],
    foodsToEat: [
      'Eggs and dairy products',
      'Legumes and beans',
      'Whole grains and cereals',
      'Fresh fruits and vegetables',
      'Nuts, seeds, and healthy fats',
      'Tofu and plant-based proteins',
    ],
    foodsToAvoid: [
      'Red meat and poultry',
      'Fish and seafood',
      'Animal-derived broths',
      'Gelatin-based products',
    ],
    sampleMealPlan: {
      breakfast: ['Greek yogurt with granola and honey', 'Veggie omelette with cheese', 'Fresh fruit bowl'],
      lunch: ['Caprese sandwich with mozzarella', 'Black bean and corn salad', 'Vegetable soup with crusty bread'],
      dinner: ['Eggplant parmesan', 'Pasta primavera with cream sauce', 'Stuffed bell peppers with rice and beans'],
      snacks: ['Cheese and crackers', 'Apple with peanut butter', 'Yogurt parfait'],
    },
  },
  mediterranean: {
    displayName: 'Mediterranean Diet',
    overview: 'Inspired by the traditional eating patterns of countries bordering the Mediterranean Sea, this diet emphasizes healthy fats, whole grains, and abundant fresh produce. It is one of the most studied and recommended diets worldwide.',
    benefits: [
      'Heart disease prevention',
      'Improved brain health and memory',
      'Reduced risk of certain cancers',
      'Better blood sugar control',
      'Longevity and healthy aging',
    ],
    foodsToEat: [
      'Extra virgin olive oil',
      'Fresh fish and seafood',
      'Whole grains and legumes',
      'Fresh fruits and vegetables',
      'Nuts and seeds',
      'Herbs and spices',
      'Moderate red wine',
    ],
    foodsToAvoid: [
      'Processed meats',
      'Refined grains and sugars',
      'Trans fats and hydrogenated oils',
      'Heavily processed foods',
      'Sugary beverages',
    ],
    sampleMealPlan: {
      breakfast: ['Whole grain toast with olive oil and tomatoes', 'Greek yogurt with figs and honey', 'Herbal tea'],
      lunch: ['Grilled fish with lemon and capers', 'Tabbouleh salad', 'Hummus with whole wheat pita'],
      dinner: ['Baked salmon with herbs', 'Roasted vegetables with olive oil', 'Mixed green salad with feta'],
      snacks: ['Olives and almonds', 'Fresh fruit', 'Whole grain crackers with tzatziki'],
    },
  },
  'low-carb': {
    displayName: 'Low Carb Diet',
    overview: 'A low-carb diet reduces carbohydrate intake in favor of protein and healthy fats. By limiting carbs, your body shifts to burning fat for fuel, leading to steady energy and effective weight management.',
    benefits: [
      'Effective weight loss',
      'Reduced appetite and cravings',
      'Lower triglyceride levels',
      'Improved HDL cholesterol',
      'Better blood sugar control',
    ],
    foodsToEat: [
      'Meat, fish, and eggs',
      'Non-starchy vegetables',
      'Cheese and full-fat dairy',
      'Nuts and seeds',
      'Healthy oils and butter',
      'Berries in moderation',
    ],
    foodsToAvoid: [
      'Bread, pasta, and rice',
      'Sugary foods and drinks',
      'Starchy vegetables',
      'Most fruits',
      'Beer and sugary cocktails',
    ],
    sampleMealPlan: {
      breakfast: ['Bacon and cheese omelette', 'Sausage links', 'Coffee with heavy cream'],
      lunch: ['Lettuce wrap burgers', 'Coleslaw with mayo dressing', 'Dill pickle spears'],
      dinner: ['Grilled chicken thighs', 'Roasted Brussels sprouts with bacon', 'Cauliflower rice'],
      snacks: ['String cheese', 'Hard-boiled eggs', 'Cucumber with cream cheese'],
    },
  },
  'gluten-free': {
    displayName: 'Gluten Free Diet',
    overview: 'A gluten-free diet eliminates the protein gluten, found in wheat, barley, and rye. Essential for those with celiac disease or gluten sensitivity, it can also improve digestive comfort for many people.',
    benefits: [
      'Relief from celiac disease symptoms',
      'Reduced digestive discomfort',
      'Less bloating and gas',
      'Improved nutrient absorption',
      'Increased energy levels',
    ],
    foodsToEat: [
      'Rice, quinoa, and corn',
      'Fruits and vegetables',
      'Meat, fish, and eggs',
      'Dairy products',
      'Beans and legumes',
      'Nuts and seeds',
      'Gluten-free oats',
    ],
    foodsToAvoid: [
      'Wheat (bread, pasta, cereals)',
      'Barley and rye',
      'Many processed sauces and dressings',
      'Beer and malt beverages',
      'Some processed meats',
    ],
    sampleMealPlan: {
      breakfast: ['Gluten-free oatmeal with berries', 'Scrambled eggs with vegetables', 'Orange juice'],
      lunch: ['Rice noodle stir-fry with chicken', 'Corn tortilla tacos', 'Mixed green salad'],
      dinner: ['Grilled steak with baked potato', 'Roasted root vegetables', 'Quinoa pilaf'],
      snacks: ['Rice cakes with peanut butter', 'Fresh fruit', 'Yogurt with honey'],
    },
  },
  dash: {
    displayName: 'DASH Diet',
    overview: 'DASH (Dietary Approaches to Stop Hypertension) is specifically designed to help lower blood pressure. It focuses on fruits, vegetables, whole grains, and lean proteins while reducing sodium intake.',
    benefits: [
      'Proven to lower blood pressure',
      'Reduced risk of heart disease and stroke',
      'Lower cholesterol levels',
      'Better kidney health',
      'Sustainable long-term eating pattern',
    ],
    foodsToEat: [
      'Fruits and vegetables (8-10 servings/day)',
      'Whole grains',
      'Lean poultry and fish',
      'Low-fat dairy',
      'Beans, nuts, and seeds',
      'Healthy oils in moderation',
    ],
    foodsToAvoid: [
      'High-sodium processed foods',
      'Red and processed meats',
      'Sugary beverages and sweets',
      'Full-fat dairy',
      'Alcohol in excess',
    ],
    sampleMealPlan: {
      breakfast: ['Oatmeal with banana and walnuts', 'Low-fat yogurt', 'Whole wheat toast with jam'],
      lunch: ['Turkey and avocado wrap', 'Side of mixed vegetables', 'Fresh fruit salad'],
      dinner: ['Baked chicken breast with herbs', 'Steamed broccoli and carrots', 'Brown rice'],
      snacks: ['Unsalted almonds', 'Baby carrots with hummus', 'Apple slices'],
    },
  },
  'high-protein': {
    displayName: 'High Protein Diet',
    overview: 'A high-protein diet prioritizes protein-rich foods to support muscle growth, recovery, and satiety. Ideal for athletes and those looking to build lean muscle mass while managing body composition.',
    benefits: [
      'Muscle growth and maintenance',
      'Increased metabolism and fat burning',
      'Reduced hunger and cravings',
      'Better bone health',
      'Faster recovery after exercise',
    ],
    foodsToEat: [
      'Chicken breast and turkey',
      'Fish and seafood',
      'Eggs and egg whites',
      'Greek yogurt and cottage cheese',
      'Lean beef and pork',
      'Protein-rich legumes',
      'Whey or plant protein supplements',
    ],
    foodsToAvoid: [
      'Sugary snacks and desserts',
      'Refined carbohydrates',
      'Fried foods',
      'Excessive alcohol',
      'Processed meats high in sodium',
    ],
    sampleMealPlan: {
      breakfast: ['Protein pancakes with berries', 'Egg white omelette with turkey', 'Greek yogurt shake'],
      lunch: ['Grilled chicken breast salad', 'Tuna wrap with whole wheat tortilla', 'Cottage cheese with fruit'],
      dinner: ['Salmon fillet with quinoa', 'Lean ground turkey stir-fry', 'Grilled shrimp with sweet potato'],
      snacks: ['Protein shake', 'Hard-boiled eggs', 'Beef jerky with almonds'],
    },
  },
  diabetic: {
    displayName: 'Diabetic Diet',
    overview: 'A diabetic-friendly diet helps manage blood sugar levels through balanced nutrition. It focuses on consistent carb intake, fiber-rich foods, and meals with a low glycemic index.',
    benefits: [
      'Better blood sugar control',
      'Reduced HbA1c levels',
      'Lower risk of diabetes complications',
      'Improved cardiovascular health',
      'Stable energy throughout the day',
    ],
    foodsToEat: [
      'Non-starchy vegetables',
      'Lean proteins (fish, chicken, tofu)',
      'Whole grains in portions',
      'Berries and low-GI fruits',
      'Legumes and beans',
      'Nuts and seeds',
      'Healthy fats (olive oil, avocado)',
    ],
    foodsToAvoid: [
      'Sugary drinks and juices',
      'White bread, rice, and pasta',
      'Candy and sweets',
      'Fried foods',
      'High-sugar cereals',
      'Dried fruit in large amounts',
    ],
    sampleMealPlan: {
      breakfast: ['Veggie omelette with whole grain toast', 'Steel-cut oatmeal with cinnamon', 'Berries and nuts'],
      lunch: ['Grilled chicken with roasted vegetables', 'Lentil and spinach soup', 'Turkey lettuce wraps'],
      dinner: ['Baked cod with green beans', 'Chicken stir-fry with brown rice', 'Lean pork tenderloin with sweet potato'],
      snacks: ['Almonds and walnuts', 'Celery with peanut butter', 'Low-sugar protein bar'],
    },
  },
  'low-fodmap': {
    displayName: 'Low FODMAP Diet',
    overview: 'The Low FODMAP diet reduces fermentable carbohydrates that can cause digestive distress. Developed by Monash University, it is clinically proven to help manage IBS and other digestive conditions.',
    benefits: [
      'Significant IBS symptom relief',
      'Reduced bloating and gas',
      'Less abdominal pain',
      'Improved bowel regularity',
      'Better quality of life',
    ],
    foodsToEat: [
      'Rice, oats, and quinoa',
      'Firm tofu and tempeh',
      'Low-FODMAP fruits (strawberries, oranges)',
      'Carrots, zucchini, and bell peppers',
      'Lactose-free dairy',
      'Eggs, meat, and fish',
      'Maple syrup (in moderation)',
    ],
    foodsToAvoid: [
      'Garlic and onion',
      'Wheat-based products',
      'Apples, pears, and watermelon',
      'Milk and soft cheeses',
      'Honey and high-fructose corn syrup',
      'Cauliflower and mushrooms',
    ],
    sampleMealPlan: {
      breakfast: ['Gluten-free oatmeal with blueberries', 'Scrambled eggs with chives', 'Lactose-free yogurt'],
      lunch: ['Grilled chicken with rice and carrots', 'Firm tofu salad with bell peppers', 'Rice paper rolls'],
      dinner: ['Baked salmon with zucchini and potatoes', 'Chicken stir-fry with bok choy', 'Spaghetti with low-FODMAP marinara'],
      snacks: ['Rice cakes with peanut butter', 'Strawberries', 'Small handful of walnuts'],
    },
  },
};

export function DietDetailContent({ slug }: { slug: string }) {
  const { handleApiError } = useApiHealthRedirect();
  const [diet, setDiet] = useState<DietType | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const guide = DIET_GUIDES[slug];

  useEffect(() => {
    async function fetchData() {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const [dietRes, recipesRes] = await Promise.allSettled([
          fetch(`${API_URL}/api/diets/${slug}`, { signal: controller.signal }),
          fetch(`${API_URL}/api/recipes?pageSize=100`, { signal: controller.signal }),
        ]);

        clearTimeout(timeout);

        if (dietRes.status === 'rejected' && recipesRes.status === 'rejected') {
          throw dietRes.reason;
        }

        if (dietRes.status === 'fulfilled' && dietRes.value.ok) {
          setDiet(await dietRes.value.json());
        } else {
          const fallbackName = guide?.displayName || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          setDiet({ id: slug, name: fallbackName, slug, recipeCount: 0 });
        }

        if (recipesRes.status === 'fulfilled' && recipesRes.value.ok) {
          const data = await recipesRes.value.json();
          const all = Array.isArray(data) ? data : data.items || [];
          setRecipes(all.filter((r: Recipe) => r.dietSlug === slug || r.diet?.toLowerCase() === slug));
        }
      } catch (err) {
        if (handleApiError(err)) return;
        const fallbackName = guide?.displayName || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        setDiet({ id: slug, name: fallbackName, slug, recipeCount: 0 });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, guide]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.stickyHeader}>
          <Link href="/diets" style={styles.backArrow}>←</Link>
          <div style={styles.skeletonTitle} />
        </div>
        <div style={styles.content}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={styles.skeletonSection} />
          ))}
        </div>
      </div>
    );
  }

  if (!diet) {
    return (
      <div style={styles.page}>
        <div style={styles.content}>
          <p style={{ color: '#9ca3af' }}>Diet not found.</p>
          <Link href="/diets" style={styles.linkGreen}>Back to Diets</Link>
        </div>
      </div>
    );
  }

  const displayName = guide?.displayName || diet.name;

  return (
    <div style={styles.page}>
      {/* Sticky header */}
      <div style={styles.stickyHeader}>
        <Link href="/diets" style={styles.backArrow}>←</Link>
        <h1 style={styles.headerTitle}>{displayName}</h1>
      </div>

      <div style={styles.content}>
        {/* Hero */}
        <div style={styles.hero}>
          <span style={styles.heroIcon}>{diet.icon || '🍽️'}</span>
          <div>
            <h2 style={styles.heroName}>{displayName}</h2>
            <p style={styles.heroSub}>Complete guide & recipes</p>
          </div>
        </div>

        {/* Overview */}
        {guide && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Overview</h3>
            <p style={styles.sectionText}>{guide.overview}</p>
          </div>
        )}

        {/* Key Benefits */}
        {guide && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Key Benefits</h3>
            <ul style={styles.benefitList}>
              {guide.benefits.map((b) => (
                <li key={b} style={styles.benefitItem}>
                  <span style={styles.checkmark}>✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Foods to Eat */}
        {guide && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Foods to Eat</h3>
            <div style={styles.tagWrap}>
              {guide.foodsToEat.map((f) => (
                <span key={f} style={styles.foodTagGreen}>{f}</span>
              ))}
            </div>
          </div>
        )}

        {/* Foods to Avoid */}
        {guide && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Foods to Avoid</h3>
            <div style={styles.tagWrap}>
              {guide.foodsToAvoid.map((f) => (
                <span key={f} style={styles.foodTagRed}>{f}</span>
              ))}
            </div>
          </div>
        )}

        {/* Sample Meal Plan */}
        {guide && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Sample Meal Plan</h3>
            <div style={styles.mealPlanGrid}>
              {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((meal) => (
                <div key={meal} style={styles.mealCard}>
                  <h4 style={styles.mealCardTitle}>
                    {meal.charAt(0).toUpperCase() + meal.slice(1)}
                  </h4>
                  <ul style={styles.mealList}>
                    {guide.sampleMealPlan[meal].map((item) => (
                      <li key={item} style={styles.mealItem}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Recipes Carousel */}
        {recipes.length > 0 && (
          <div style={styles.section}>
            <div style={styles.recipesHeader}>
              <h3 style={styles.sectionTitle}>Related Recipes</h3>
              <Link href={`/recipes?diet=${slug}`} style={styles.seeAll}>
                See All <span style={styles.seeAllChevron}>›</span>
              </Link>
            </div>
            <div style={styles.carousel}>
              {recipes.map((recipe) => (
                <Link key={recipe.id} href={`/recipes/${recipe.id}`} style={styles.carouselCard}>
                  <div style={styles.carouselImageWrap}>
                    {recipe.image ? (
                      <img src={recipe.image} alt={recipe.title} style={styles.carouselImage} />
                    ) : (
                      <div style={styles.carouselImagePlaceholder}>
                        <span style={{ fontSize: 40 }}>🍽️</span>
                      </div>
                    )}
                  </div>
                  <div style={styles.carouselCardBody}>
                    <h4 style={styles.carouselRecipeName}>{recipe.title}</h4>
                    <div style={styles.carouselMeta}>
                      {recipe.prepTime && (
                        <span style={styles.carouselMetaItem}>
                          <span style={styles.metaIcon}>⏱</span> {recipe.prepTime} min
                        </span>
                      )}
                      {recipe.calories && (
                        <span style={styles.carouselMetaItem}>
                          <span style={styles.metaIconFire}>🔥</span> {recipe.calories} cal
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No guide fallback */}
        {!guide && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>About</h3>
            <p style={styles.sectionText}>
              {diet.description || `Explore ${diet.name} diet recipes and guidelines.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#111827',
  },
  stickyHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
    backgroundColor: '#1f2937',
    borderBottom: '1px solid #374151',
  },
  backArrow: {
    color: 'white',
    textDecoration: 'none',
    fontSize: 20,
    lineHeight: 1,
    padding: '4px 8px',
  },
  headerTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: 'white',
  },
  content: {
    padding: '0 0 100px',
  },
  hero: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '24px 16px',
  },
  heroIcon: {
    fontSize: 56,
    lineHeight: 1,
    flexShrink: 0,
  },
  heroName: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: 'white',
  },
  heroSub: {
    margin: '4px 0 0',
    fontSize: 14,
    color: '#9ca3af',
  },
  section: {
    padding: '24px 16px',
    borderTop: '1px solid #1f2937',
  },
  sectionTitle: {
    margin: '0 0 14px',
    fontSize: 20,
    fontWeight: 700,
    color: 'white',
  },
  sectionText: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.7,
    color: '#d1d5db',
  },
  benefitList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  benefitItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 1.4,
  },
  checkmark: {
    color: '#6ee7b7',
    fontWeight: 700,
    fontSize: 16,
    flexShrink: 0,
    marginTop: 1,
  },
  tagWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  foodTagGreen: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: 'rgba(110, 231, 183, 0.08)',
    color: '#d1d5db',
    borderRadius: 20,
    fontSize: 14,
    lineHeight: 1.3,
  },
  foodTagRed: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    color: '#d1d5db',
    borderRadius: 20,
    fontSize: 14,
    lineHeight: 1.3,
  },
  recipesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  seeAll: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    color: '#9ca3af',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
  },
  seeAllChevron: {
    fontSize: 18,
    lineHeight: 1,
  },
  carousel: {
    display: 'flex',
    gap: 14,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    paddingBottom: 8,
    WebkitOverflowScrolling: 'touch',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  },
  carouselCard: {
    flex: '0 0 280px',
    scrollSnapAlign: 'start',
    textDecoration: 'none',
    backgroundColor: '#1f2937',
    borderRadius: 16,
    border: '1px solid #374151',
    overflow: 'hidden',
  },
  carouselImageWrap: {
    width: '100%',
    height: 180,
    overflow: 'hidden',
    backgroundColor: '#374151',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  carouselImagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
  },
  carouselCardBody: {
    padding: 14,
  },
  carouselRecipeName: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: 'white',
    lineHeight: 1.3,
  },
  carouselMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginTop: 10,
  },
  carouselMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
    color: '#9ca3af',
  },
  metaIcon: {
    fontSize: 14,
    opacity: 0.7,
  },
  metaIconFire: {
    fontSize: 14,
    color: '#f97316',
  },
  mealPlanGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  mealCard: {
    backgroundColor: '#1f2937',
    borderRadius: 14,
    border: '1px solid #374151',
    padding: 16,
  },
  mealCardTitle: {
    margin: '0 0 10px',
    fontSize: 17,
    fontWeight: 700,
    color: 'white',
  },
  mealList: {
    listStyle: 'disc',
    margin: 0,
    paddingLeft: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  mealItem: {
    fontSize: 14,
    lineHeight: 1.5,
    color: '#d1d5db',
  },
  linkGreen: {
    color: '#6ee7b7',
    textDecoration: 'none',
  },
  skeletonTitle: {
    width: 160,
    height: 20,
    backgroundColor: '#374151',
    borderRadius: 6,
  },
  skeletonSection: {
    height: 120,
    margin: '16px 16px 0',
    backgroundColor: '#1f2937',
    borderRadius: 12,
  },
};
