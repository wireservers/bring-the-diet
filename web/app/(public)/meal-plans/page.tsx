import type { Metadata } from 'next';
import { MealPlansContent } from './MealPlansContent';
import { absoluteUrl } from '../../../lib/seo';

export const metadata: Metadata = {
  title: 'Meal Plans - Weekly Meal Planning',
  description:
    'Plan your weekly meals with personalized meal plans. Track calories and organize breakfast, lunch, dinner, and snacks.',
  alternates: { canonical: absoluteUrl('/meal-plans') },
};

export default function MealPlansPage() {
  return <MealPlansContent />;
}
