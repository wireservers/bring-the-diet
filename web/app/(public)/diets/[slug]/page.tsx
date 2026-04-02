import type { Metadata } from 'next';
import { DietDetailContent } from './DietDetailContent';
import { JsonLd } from '../../../../components/JsonLd';
import {
  SITE_NAME,
  SITE_URL,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
} from '../../../../lib/seo';

const DIET_META: Record<string, { title: string; description: string }> = {
  keto: {
    title: 'Ketogenic Diet',
    description:
      'Complete guide to the ketogenic diet - high-fat, low-carb eating plan for weight loss and energy.',
  },
  paleo: {
    title: 'Paleo Diet',
    description:
      'Discover the Paleolithic diet - whole, unprocessed foods for improved gut health and natural weight management.',
  },
  vegan: {
    title: 'Vegan Diet',
    description:
      'Explore the vegan diet - plant-based nutrition for better health and environmental sustainability.',
  },
  vegetarian: {
    title: 'Vegetarian Diet',
    description:
      'Guide to the vegetarian diet - plant-focused eating with dairy and eggs for balanced nutrition.',
  },
  mediterranean: {
    title: 'Mediterranean Diet',
    description:
      'The Mediterranean diet - heart-healthy eating with olive oil, fish, and fresh produce.',
  },
  'low-carb': {
    title: 'Low Carb Diet',
    description:
      'Low carb diet guide - reduce carbohydrates for effective weight management and stable energy.',
  },
  'gluten-free': {
    title: 'Gluten Free Diet',
    description:
      'Gluten-free diet guide - eliminate gluten for celiac disease relief and improved digestion.',
  },
  dash: {
    title: 'DASH Diet',
    description:
      'DASH diet guide - dietary approach to stop hypertension with proven blood pressure benefits.',
  },
  'high-protein': {
    title: 'High Protein Diet',
    description:
      'High protein diet guide - protein-rich eating for muscle growth and faster recovery.',
  },
  diabetic: {
    title: 'Diabetic Diet',
    description:
      'Diabetic diet guide - blood sugar-friendly meals for effective diabetes management.',
  },
  'low-fodmap': {
    title: 'Low FODMAP Diet',
    description:
      'Low FODMAP diet guide - clinically proven to reduce IBS symptoms and digestive distress.',
  },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = DIET_META[slug];
  const title =
    meta?.title ||
    slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') + ' Diet';
  const description =
    meta?.description ||
    `Explore the ${title} - recipes, meal plans, and nutrition guidance on ${SITE_NAME}.`;
  const url = absoluteUrl(`/diets/${slug}`);

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      title: `${title} Guide`,
      description,
      url,
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} Guide`,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    alternates: { canonical: url },
  };
}

export default async function DietPage({ params }: PageProps) {
  const { slug } = await params;
  const meta = DIET_META[slug];
  const title =
    meta?.title ||
    slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') + ' Diet';
  const description = meta?.description || `Explore the ${title}.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${title} - Complete Guide`,
    description,
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: absoluteUrl(`/diets/${slug}`),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <DietDetailContent slug={slug} />
    </>
  );
}
