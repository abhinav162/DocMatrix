export interface Document {
  id?: number;
  user_id: number;
  title: string;
  content: string;
  file_path: string;
  uploaded_at?: string;
  is_private: boolean;
}

export type DocumentCreationParams = Omit<Document, 'id' | 'uploaded_at'>;
export type DocumentUpdateParams = Partial<Omit<Document, 'id' | 'uploaded_at'>>;
