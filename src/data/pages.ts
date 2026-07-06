import pagesData from './pages.json';

export interface CustomPageImage {
  image: string;
  caption?: string;
}

export interface TextBlock {
  type: 'text_block';
  title?: string;
  content: string;
}

export interface GalleryBlock {
  type: 'gallery_block';
  title?: string;
  images: CustomPageImage[];
}

export interface TestimonialsBlockItem {
  author: string;
  company?: string;
  rating?: number;
  text: string;
}

export interface TestimonialsBlock {
  type: 'testimonials_block';
  title?: string;
  testimonials: TestimonialsBlockItem[];
}

export interface SocialBlockItem {
  platform: string;
  url: string;
  embed_code?: string;
}

export interface SocialBlock {
  type: 'social_block';
  title?: string;
  posts: SocialBlockItem[];
}

export interface BlogPostsBlock {
  type: 'blog_posts_block';
  title?: string;
  count?: number;
}

export interface ContactFormBlock {
  type: 'contact_form_block';
  title?: string;
  description?: string;
}

export type PageBlock = 
  | TextBlock 
  | GalleryBlock 
  | TestimonialsBlock 
  | SocialBlock 
  | BlogPostsBlock
  | ContactFormBlock;

export interface CustomPage {
  slug: string;
  title: string;
  content?: string;
  images?: CustomPageImage[];
  blocks?: PageBlock[];
  showInHeader?: boolean;
  headerOrder?: number;
}

export const customPages: CustomPage[] = pagesData.pages as CustomPage[];
