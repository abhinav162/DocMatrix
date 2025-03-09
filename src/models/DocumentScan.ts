export interface DocumentScan {
  id?: number;
  user_id: number;
  source_document_id: number;
  matched_document_id: number;
  similarity_score: number;
  scan_date?: string;
  algorithm_used: string;
}

export type DocumentScanCreationParams = Omit<DocumentScan, 'id' | 'scan_date'>;
export type DocumentScanUpdateParams = Partial<Omit<DocumentScan, 'id' | 'scan_date'>>;

export interface ScanMatchResult {
  user_id: number;
  documentId: number;
  title: string;
  similarityScore: number;
  isUserDocument: boolean;
}

export interface ScanRequest {
  documentId: number;
  minSimilarityThreshold?: number;
}

export interface ScanResult {
  user_id: number;
  sourceDocumentId: number;
  sourceDocumentTitle: string;
  matches: ScanMatchResult[];
  scanDate: string;
  algorithm: string;
}
