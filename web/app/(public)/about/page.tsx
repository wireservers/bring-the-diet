import type { Metadata } from 'next';
import { AboutContent } from './AboutContent';
import { absoluteUrl } from '../../../lib/seo';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about BringTheDiet - our mission to make healthy eating accessible, enjoyable, and sustainable for everyone.',
  alternates: { canonical: absoluteUrl('/about') },
};

export default function AboutPage() {
  return <AboutContent />;
}
