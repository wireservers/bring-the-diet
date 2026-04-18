import type { Metadata } from 'next';
import { RecipeDetailContent } from './RecipeDetailContent';
import { JsonLd } from '../../../../components/JsonLd';
import {
  SITE_NAME,
  SITE_URL,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
} from '../../../../lib/seo';

interface Recipe {
  id: string;
  title: string;
  description?: string;
  image?: string;
  diet?: string;
  prepTime?: number;
  calories?: number;
  ingredients?: { name: string; quantity?: number; unit?: string }[];
  instructions?: string[];
}

async function getRecipe(id: string): Promise<Recipe | null> {
  const { recipes } = await import('../../../data/mock');
  const found = recipes.find(r => r.id === id);
  return found ?? null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    return { title: 'Recipe Not Found' };
  }

  const url = absoluteUrl(`/recipes/${recipe.id}`);
  const ogImage = recipe.image ? absoluteUrl(recipe.image) : DEFAULT_OG_IMAGE;
  const description =
    recipe.description ||
    `${recipe.title} recipe on ${SITE_NAME}${recipe.diet ? ` - ${recipe.diet} diet` : ''}`;

  return {
    title: recipe.title,
    description,
    openGraph: {
      type: 'article',
      title: recipe.title,
      description,
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: recipe.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: recipe.title,
      description,
      images: [ogImage],
    },
    alternates: { canonical: url },
  };
}

export default async function RecipePage({ params }: PageProps) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  const jsonLd = recipe
    ? {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: recipe.title,
        description: recipe.description,
        image: recipe.image ? absoluteUrl(recipe.image) : DEFAULT_OG_IMAGE,
        prepTime: recipe.prepTime ? `PT${recipe.prepTime}M` : undefined,
        nutrition: recipe.calories
          ? {
              '@type': 'NutritionInformation',
              calories: `${recipe.calories} calories`,
            }
          : undefined,
        recipeIngredient: recipe.ingredients?.map(
          (i) => `${i.quantity || ''} ${i.unit || ''} ${i.name}`.trim()
        ),
        recipeInstructions: recipe.instructions
          ?.filter((s) => s.trim())
          .map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            text: step,
          })),
        recipeCategory: recipe.diet,
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
        },
        mainEntityOfPage: absoluteUrl(`/recipes/${recipe.id}`),
      }
    : null;

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <RecipeDetailContent id={id} />
    </>
  );
}
