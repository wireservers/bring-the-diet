export interface MockDiet {
  id: string;
  _id: string;
  name: string;
  slug: string;
  icon: string;
  recipeCount: number;
  color: string;
  category: 'lifestyle' | 'medical';
  description?: string;
}

export interface MockRecipe {
  id: string;
  title: string;
  image: string;
  diet: string;
  dietSlug: string;
  prepTime: number;
  calories: number;
  isFavorite: boolean;
  featured: boolean;
  description: string;
  ingredients: { name: string; quantity?: number; unit?: string; notes?: string }[];
  instructions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MockBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  readTime: number;
  tags: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export const diets: MockDiet[] = [
  { id: '1', _id: '1', name: 'Keto', slug: 'keto', icon: '🔥', recipeCount: 124, color: '#78350f', category: 'lifestyle', description: 'High-fat, low-carb diet for weight loss and energy' },
  { id: '2', _id: '2', name: 'Vegan', slug: 'vegan', icon: '🌿', recipeCount: 98, color: '#065f46', category: 'lifestyle', description: 'Plant-based diet with no animal products' },
  { id: '3', _id: '3', name: 'Paleo', slug: 'paleo', icon: '🍎', recipeCount: 76, color: '#7f1d1d', category: 'lifestyle', description: 'Whole foods, no processed items - eat like our ancestors' },
  { id: '4', _id: '4', name: 'Mediterranean', slug: 'mediterranean', icon: '🫒', recipeCount: 89, color: '#1e40af', category: 'lifestyle', description: 'Heart-healthy diet rich in olive oil, fish, and whole grains' },
  { id: '5', _id: '5', name: 'Low Carb', slug: 'low-carb', icon: '🥗', recipeCount: 112, color: '#166534', category: 'lifestyle', description: 'Reduced carbohydrate intake for weight management' },
  { id: '6', _id: '6', name: 'Gluten Free', slug: 'gluten-free', icon: '🌾', recipeCount: 67, color: '#a16207', category: 'lifestyle', description: 'Eliminates gluten-containing grains and products' },
  { id: '7', _id: '7', name: 'Vegetarian', slug: 'vegetarian', icon: '🍅', recipeCount: 85, color: '#dc2626', category: 'lifestyle', description: 'Plant-focused diet that may include dairy and eggs' },
  { id: '8', _id: '8', name: 'High Protein', slug: 'high-protein', icon: '💪', recipeCount: 93, color: '#7c3aed', category: 'lifestyle', description: 'Protein-rich diet for muscle building and recovery' },
  { id: '9', _id: '9', name: 'DASH', slug: 'dash', icon: '❤️', recipeCount: 45, color: '#be123c', category: 'medical', description: 'Dietary approach to stop hypertension' },
  { id: '10', _id: '10', name: 'Diabetic', slug: 'diabetic', icon: '🩺', recipeCount: 52, color: '#0369a1', category: 'medical', description: 'Blood sugar-friendly meals for diabetes management' },
  { id: '11', _id: '11', name: 'Low FODMAP', slug: 'low-fodmap', icon: '🧘', recipeCount: 38, color: '#4f46e5', category: 'medical', description: 'Reduces fermentable carbs for digestive comfort' },
  { id: '12', _id: '12', name: 'Renal', slug: 'renal', icon: '🫘', recipeCount: 29, color: '#854d0e', category: 'medical', description: 'Kidney-friendly meals with controlled sodium and potassium' },
];

export const recipes: MockRecipe[] = [
  {
    id: '1',
    title: 'Crispy Chicken Burger',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
    diet: 'Mediterranean',
    dietSlug: 'mediterranean',
    prepTime: 25,
    calories: 450,
    isFavorite: true,
    featured: true,
    description: 'A juicy crispy chicken burger with fresh veggies and a tangy sauce.',
    ingredients: [
      { name: 'Chicken breast', quantity: 2, unit: 'pieces' },
      { name: 'Burger buns', quantity: 2, unit: 'pieces' },
      { name: 'Lettuce', quantity: 4, unit: 'leaves' },
      { name: 'Tomato', quantity: 1, unit: 'medium', notes: 'sliced' },
      { name: 'Olive oil', quantity: 2, unit: 'tbsp' },
    ],
    instructions: [
      'Pound chicken breasts to even thickness and season with salt and pepper.',
      'Heat olive oil in a skillet over medium-high heat.',
      'Cook chicken 5-6 minutes per side until golden and cooked through.',
      'Toast burger buns lightly in the same pan.',
      'Assemble burgers with lettuce, tomato, and your favorite sauce.',
    ],
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2025-12-15T14:30:00Z',
  },
  {
    id: '2',
    title: 'Avocado Toast with Eggs',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&h=600&fit=crop',
    diet: 'Keto',
    dietSlug: 'keto',
    prepTime: 15,
    calories: 320,
    isFavorite: false,
    featured: true,
    description: 'Creamy avocado on toasted sourdough topped with perfectly poached eggs.',
    ingredients: [
      { name: 'Avocado', quantity: 1, unit: 'large', notes: 'ripe' },
      { name: 'Sourdough bread', quantity: 2, unit: 'slices' },
      { name: 'Eggs', quantity: 2, unit: 'large' },
      { name: 'Lemon juice', quantity: 1, unit: 'tsp' },
      { name: 'Red pepper flakes', quantity: 0.5, unit: 'tsp' },
    ],
    instructions: [
      'Toast sourdough slices until golden and crispy.',
      'Mash avocado with lemon juice, salt, and pepper.',
      'Poach eggs in simmering water with a splash of vinegar for 3 minutes.',
      'Spread avocado on toast and top with poached eggs.',
      'Sprinkle with red pepper flakes and serve immediately.',
    ],
    createdAt: '2025-11-20T08:00:00Z',
    updatedAt: '2025-12-10T09:15:00Z',
  },
  {
    id: '3',
    title: 'Grilled Salmon Bowl',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
    diet: 'Paleo',
    dietSlug: 'paleo',
    prepTime: 30,
    calories: 380,
    isFavorite: true,
    featured: true,
    description: 'Fresh grilled salmon over a bed of quinoa with roasted vegetables.',
    ingredients: [
      { name: 'Salmon fillet', quantity: 200, unit: 'g' },
      { name: 'Quinoa', quantity: 0.5, unit: 'cup' },
      { name: 'Broccoli', quantity: 1, unit: 'cup', notes: 'florets' },
      { name: 'Sweet potato', quantity: 1, unit: 'medium', notes: 'cubed' },
      { name: 'Soy sauce', quantity: 2, unit: 'tbsp' },
    ],
    instructions: [
      'Cook quinoa according to package directions and set aside.',
      'Season salmon with soy sauce, garlic, and ginger.',
      'Roast sweet potato and broccoli at 400°F for 20 minutes.',
      'Grill salmon skin-side down for 4-5 minutes per side.',
      'Assemble bowls with quinoa, vegetables, and flaked salmon.',
    ],
    createdAt: '2025-11-15T12:00:00Z',
    updatedAt: '2025-12-20T16:45:00Z',
  },
  {
    id: '4',
    title: 'Veggie Buddha Bowl',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
    diet: 'Vegan',
    dietSlug: 'vegan',
    prepTime: 20,
    calories: 290,
    isFavorite: false,
    featured: true,
    description: 'A colorful bowl packed with roasted vegetables, chickpeas, and tahini dressing.',
    ingredients: [
      { name: 'Chickpeas', quantity: 1, unit: 'can', notes: 'drained' },
      { name: 'Kale', quantity: 2, unit: 'cups', notes: 'chopped' },
      { name: 'Sweet potato', quantity: 1, unit: 'medium' },
      { name: 'Tahini', quantity: 2, unit: 'tbsp' },
      { name: 'Brown rice', quantity: 1, unit: 'cup', notes: 'cooked' },
    ],
    instructions: [
      'Roast cubed sweet potato and chickpeas with olive oil at 425°F for 25 minutes.',
      'Massage kale with a drizzle of olive oil and lemon juice.',
      'Whisk tahini with lemon juice, garlic, and water for the dressing.',
      'Arrange rice, kale, roasted vegetables, and chickpeas in a bowl.',
      'Drizzle with tahini dressing and sprinkle with sesame seeds.',
    ],
    createdAt: '2025-10-05T11:00:00Z',
    updatedAt: '2025-11-30T13:20:00Z',
  },
  {
    id: '5',
    title: 'Turkey Meatball Soup',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
    diet: 'High Protein',
    dietSlug: 'high-protein',
    prepTime: 35,
    calories: 310,
    isFavorite: false,
    featured: false,
    description: 'Hearty turkey meatball soup with vegetables in a savory broth.',
    ingredients: [
      { name: 'Ground turkey', quantity: 500, unit: 'g' },
      { name: 'Carrots', quantity: 2, unit: 'medium', notes: 'diced' },
      { name: 'Celery', quantity: 2, unit: 'stalks', notes: 'diced' },
      { name: 'Chicken broth', quantity: 4, unit: 'cups' },
      { name: 'Spinach', quantity: 2, unit: 'cups' },
    ],
    instructions: [
      'Mix ground turkey with breadcrumbs, egg, garlic, and Italian seasoning. Form into meatballs.',
      'Brown meatballs in a large pot with olive oil.',
      'Add diced carrots, celery, and onion. Sauté for 5 minutes.',
      'Pour in chicken broth and bring to a boil. Simmer 15 minutes.',
      'Stir in spinach and cook until wilted. Season to taste.',
    ],
    createdAt: '2025-09-20T09:00:00Z',
    updatedAt: '2025-10-15T11:00:00Z',
  },
  {
    id: '6',
    title: 'Cauliflower Fried Rice',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop',
    diet: 'Low Carb',
    dietSlug: 'low-carb',
    prepTime: 20,
    calories: 210,
    isFavorite: true,
    featured: false,
    description: 'A low-carb twist on classic fried rice using riced cauliflower.',
    ingredients: [
      { name: 'Cauliflower', quantity: 1, unit: 'head', notes: 'riced' },
      { name: 'Eggs', quantity: 2, unit: 'large' },
      { name: 'Soy sauce', quantity: 2, unit: 'tbsp' },
      { name: 'Sesame oil', quantity: 1, unit: 'tsp' },
      { name: 'Green onions', quantity: 3, unit: 'stalks', notes: 'sliced' },
    ],
    instructions: [
      'Rice the cauliflower using a food processor or grater.',
      'Scramble eggs in a hot wok and set aside.',
      'Stir-fry cauliflower rice in sesame oil for 5-6 minutes.',
      'Add soy sauce, scrambled eggs, and green onions.',
      'Toss everything together and serve hot.',
    ],
    createdAt: '2025-10-10T14:00:00Z',
    updatedAt: '2025-11-05T10:30:00Z',
  },
];

export const blogPosts: MockBlogPost[] = [
  {
    id: '1',
    title: 'Understanding Macronutrients: A Complete Guide',
    slug: 'understanding-macronutrients',
    excerpt: 'Learn the fundamentals of proteins, carbohydrates, and fats and how they fuel your body.',
    content: '<p>Macronutrients are the nutrients your body needs in large amounts to function properly. They include proteins, carbohydrates, and fats. Each plays a unique and essential role in your overall health.</p><h2>Protein</h2><p>Protein is essential for building and repairing tissues. Good sources include lean meats, fish, eggs, and legumes.</p><h2>Carbohydrates</h2><p>Carbs are your body\'s primary energy source. Choose complex carbs like whole grains, fruits, and vegetables.</p><h2>Fats</h2><p>Healthy fats support brain function and hormone production. Focus on unsaturated fats from nuts, seeds, and olive oil.</p>',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop',
    category: 'Nutrition',
    author: 'Dr. Sarah Chen',
    readTime: 8,
    tags: ['nutrition', 'macros', 'health'],
    published: true,
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-11-15T14:30:00Z',
  },
  {
    id: '2',
    title: '10 Quick Meal Prep Ideas for Busy Weekdays',
    slug: 'quick-meal-prep-ideas',
    excerpt: 'Save time and eat healthy with these simple meal prep strategies that anyone can follow.',
    content: '<p>Meal prepping doesn\'t have to be complicated. With a few simple strategies, you can prepare a week\'s worth of healthy meals in just a couple of hours.</p><h2>1. Batch Cook Grains</h2><p>Cook a large pot of rice, quinoa, or pasta at the start of the week.</p><h2>2. Prep Your Proteins</h2><p>Grill chicken, bake tofu, or cook ground turkey in bulk.</p>',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=400&fit=crop',
    category: 'Recipes',
    author: 'Chef Mike Torres',
    readTime: 5,
    tags: ['meal-prep', 'cooking', 'tips'],
    published: true,
    createdAt: '2025-10-20T08:00:00Z',
    updatedAt: '2025-11-01T09:15:00Z',
  },
  {
    id: '3',
    title: 'The Science Behind the Keto Diet',
    slug: 'science-behind-keto',
    excerpt: 'Explore the metabolic science that makes the ketogenic diet effective for weight loss.',
    content: '<p>The ketogenic diet works by shifting your body\'s primary fuel source from glucose to ketone bodies produced from fat. This metabolic state, known as ketosis, can lead to significant fat loss.</p>',
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&h=400&fit=crop',
    category: 'Wellness',
    author: 'Dr. Sarah Chen',
    readTime: 10,
    tags: ['keto', 'science', 'weight-loss'],
    published: true,
    createdAt: '2025-10-05T12:00:00Z',
    updatedAt: '2025-10-20T16:45:00Z',
  },
  {
    id: '4',
    title: 'Building Strength: Nutrition for Athletes',
    slug: 'nutrition-for-athletes',
    excerpt: 'Optimize your performance with the right nutrition strategies for strength training.',
    content: '<p>Whether you\'re a competitive athlete or a weekend warrior, proper nutrition is key to building strength and recovering from workouts.</p>',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=400&fit=crop',
    category: 'Fitness',
    author: 'Coach Alex Rivera',
    readTime: 7,
    tags: ['fitness', 'protein', 'strength'],
    published: true,
    createdAt: '2025-09-15T11:00:00Z',
    updatedAt: '2025-10-01T13:20:00Z',
  },
];

export const mealPlans = {
  items: [] as Array<{
    id: string;
    userId: string;
    weekStart: string;
    entries: Array<{ day: string; mealType: string; recipeId: string; servings: number }>;
    createdAt: string;
    updatedAt: string;
  }>,
};
