const modules = import.meta.glob('./content/blog/*.json', { eager: true });

export interface Article {
  id: number;
  slug: string;
  image: string;
  featuredImage?: string;
  date?: string;
  author?: string;
  category?: string;
  title: string;
  excerpt: string;
  content: string[];
}

export const articles: Article[] = Object.values(modules).map((module: any) => {
  const data = module.default || module;
  
  // Normalize content blocks into strings for backward compatibility
  const normalizedContent = (data.content || []).map((p: any) => {
    if (p && typeof p === 'object' && p.paragraph !== undefined) {
      return p.paragraph;
    }
    return typeof p === 'string' ? p : '';
  });

  return {
    id: Number(data.id),
    slug: data.slug || '',
    image: data.featuredImage || data.image || '',
    featuredImage: data.featuredImage || data.image || '',
    date: data.date || '2026-07-21',
    author: data.author || 'Avenue Group',
    category: data.category || 'Apsaimniekošana',
    title: data.title || '',
    excerpt: data.excerpt || '',
    content: normalizedContent
  };
}).sort((a, b) => b.id - a.id);
