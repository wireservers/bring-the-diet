export const SITE_NAME = 'BringTheDiet';
export const SITE_DESCRIPTION =
  'Discover healthy recipes, personalized meal plans, and expert nutrition guidance for every diet type.';
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://bringthediet.com';
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.png`;

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
