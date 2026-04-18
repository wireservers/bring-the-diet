import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/seo';
import { blogPosts, diets, recipes } from './data/mock';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/diets`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/recipes`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/foods`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/meal-plans`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ];

  const blogEntries: MetadataRoute.Sitemap = blogPosts
    .filter(p => p.published)
    .map(p => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.updatedAt || p.createdAt || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  const dietEntries: MetadataRoute.Sitemap = diets.map(d => ({
    url: `${SITE_URL}/diets/${d.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const recipeEntries: MetadataRoute.Sitemap = recipes.map(r => ({
    url: `${SITE_URL}/recipes/${r.id}`,
    lastModified: new Date(r.updatedAt || r.createdAt || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogEntries, ...dietEntries, ...recipeEntries];
}
