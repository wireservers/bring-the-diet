import type { Metadata } from 'next';
import { DietsListContent } from './DietsListContent';
import { absoluteUrl } from '../../../lib/seo';

export const metadata: Metadata = {
  title: 'Special Diets - Keto, Paleo, Vegan & More',
  description:
    'Browse popular diet types including Keto, Paleo, Vegan, Mediterranean, DASH, and more. Find recipes and guides for every dietary need.',
  alternates: { canonical: absoluteUrl('/diets') },
};

export default function DietsPage() {
  return <DietsListContent />;
}
