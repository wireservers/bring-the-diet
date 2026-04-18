import type { Metadata } from 'next';
import { BlogListContent } from './BlogListContent';
import { absoluteUrl } from '../../../lib/seo';

export const metadata: Metadata = {
  title: 'Blog - Nutrition Tips, Recipes & Wellness',
  description:
    'Expert articles on nutrition, healthy recipes, wellness tips, and fitness guidance to help you achieve your dietary goals.',
  alternates: { canonical: absoluteUrl('/blog') },
};

export default function BlogPage() {
  return <BlogListContent />;
}
