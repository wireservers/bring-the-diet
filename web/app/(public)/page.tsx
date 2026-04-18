import type { Metadata } from 'next';
import { HomeContent } from './HomeContent';
import { JsonLd } from '../../components/JsonLd';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '../../lib/seo';

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
};

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/recipes?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <HomeContent />
    </>
  );
}
