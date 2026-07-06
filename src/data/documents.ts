import documentsData from './documents.json';

export interface DocumentItem {
  id: string;
  title: {
    lv: string;
    en: string;
    ru: string;
  };
  price: number;
  isService?: boolean;
}

export const documents: DocumentItem[] = documentsData.documents as DocumentItem[];
