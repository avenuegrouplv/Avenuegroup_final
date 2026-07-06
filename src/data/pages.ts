import pagesData from './pages.json';

export interface CustomPageImage {
  image: string;
  caption?: string;
}

export interface CustomPage {
  slug: string;
  title: string;
  content: string;
  images?: CustomPageImage[];
}

export const customPages: CustomPage[] = pagesData.pages as CustomPage[];
