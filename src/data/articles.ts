import articlesData from './content/blog-posts.json';

export interface Article {
  id: number;
  slug: string;
  image: string;
  title: string;
  excerpt: string;
  content: string[];
}

export const articles: Article[] = articlesData.articles as Article[];
