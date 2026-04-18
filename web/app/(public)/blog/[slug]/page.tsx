import type { Metadata } from 'next';
import { BlogPostContent } from './BlogPostContent';
import { JsonLd } from '../../../../components/JsonLd';
import {
  SITE_NAME,
  SITE_URL,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
} from '../../../../lib/seo';

interface BlogPost {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image?: string;
  category: string;
  author: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const { blogPosts } = await import('../../../data/mock');
  const found = blogPosts.find(p => p.slug === slug);
  return found ?? null;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return { title: 'Article Not Found' };
  }

  const url = absoluteUrl(`/blog/${post.slug}`);
  const ogImage = post.image ? absoluteUrl(post.image) : DEFAULT_OG_IMAGE;

  return {
    title: post.title,
    description: post.excerpt || `Read ${post.title} on ${SITE_NAME}`,
    keywords: post.tags,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt || `Read ${post.title} on ${SITE_NAME}`,
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      section: post.category,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || `Read ${post.title} on ${SITE_NAME}`,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  const jsonLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        image: post.image ? absoluteUrl(post.image) : DEFAULT_OG_IMAGE,
        author: { '@type': 'Person', name: post.author },
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        datePublished: post.createdAt,
        dateModified: post.updatedAt,
        mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
        articleSection: post.category,
        keywords: post.tags?.join(', '),
      }
    : null;

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <BlogPostContent slug={slug} />
    </>
  );
}
