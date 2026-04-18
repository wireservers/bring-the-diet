import type { Metadata } from 'next';
import { FoodsContent } from './FoodsContent';
import { absoluteUrl } from '../../../lib/seo';

export const metadata: Metadata = {
  title: 'Food Database - Nutrition Facts & Calorie Info',
  description:
    'Browse our comprehensive food database with detailed nutrition facts, calorie counts, protein, carbs, and fat information per serving.',
  alternates: { canonical: absoluteUrl('/foods') },
};

export default function FoodsPage() {
  return <FoodsContent />;
}
