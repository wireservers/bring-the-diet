import type { Metadata } from 'next';
import { RecipesListContent } from './RecipesListContent';
import { absoluteUrl } from '../../../lib/seo';

export const metadata: Metadata = {
  title: 'Recipes - Healthy Meals for Every Diet',
  description:
    'Discover healthy recipes for every diet type. Filter by keto, paleo, vegan, and more. Complete with nutrition info, prep times, and ingredients.',
  alternates: { canonical: absoluteUrl('/recipes') },
};

export default function RecipesPage() {
  return <RecipesListContent />;
}
