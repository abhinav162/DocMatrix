import { Document } from '../models/Document';
import { DocumentScan, ScanMatchResult, ScanResult } from '../models/DocumentScan';
import DocumentDAO from '../dao/DocumentDAO';
import DocumentScanDAO from '../dao/DocumentScanDAO';
import { TextComparisonUtil } from '../utils/textComparison';
import GeminiApiClient from './geminiApiClient';

/**
 * Service for document scanning operations
 */
export class ScanningService {
  private static readonly DEFAULT_SIMILARITY_THRESHOLD = 70.0;
  private static readonly DEFAULT_ALGORITHM = 'levenshtein';
  private static readonly GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
  private static readonly GEMINI_API_URL = process.env.GEMINI_API_URL || '';
  private static geminiClient = new GeminiApiClient(this.GEMINI_API_KEY, this.GEMINI_API_URL);

  /**
   * Scan a document against all accessible documents
   * @param userId User ID
   * @param documentId Document ID to scan
   * @param minSimilarityThreshold Minimum similarity threshold (%)
   * @returns Scan results
   */
  public static async scanDocument(
    userId: number,
    documentId: number,
    minSimilarityThreshold: number = this.DEFAULT_SIMILARITY_THRESHOLD
  ): Promise<ScanResult> {
    try {
      // Get the source document
      const sourceDocument = await DocumentDAO.findById(documentId);
      if (!sourceDocument) {
        throw new Error('Source document not found');
      }

      // Check if user has access to the document
      if (sourceDocument.user_id !== userId && sourceDocument.is_private) {
        throw new Error('Access denied to source document');
      }

      // Get all documents accessible to the user (their own + public)
      const accessibleDocuments = await DocumentDAO.findAccessibleToUser(userId);

      // Filter out the source document itself
      const documentsToCompare = accessibleDocuments.filter(
        doc => doc.id !== documentId
      );

      if (documentsToCompare.length === 0) {
        return {
          user_id: userId,
          sourceDocumentId: sourceDocument.id!,
          scannedThreshold: minSimilarityThreshold,
          sourceDocumentTitle: sourceDocument.title,
          matches: [],
          scanDate: new Date().toISOString(),
          algorithm: this.DEFAULT_ALGORITHM
        };
      }

      // Optimize source document text for comparison
      const optimizedSourceText = TextComparisonUtil.optimizeForComparison(
        sourceDocument.content
      );

      // Compare source document with all other documents
      const matches: ScanMatchResult[] = [];
      const scanRecords: DocumentScan[] = [];

      for (const doc of documentsToCompare) {
        // Optimize target document text for comparison
        const optimizedTargetText = TextComparisonUtil.optimizeForComparison(
          doc.content
        );

        let similarityScore: number;
        let algorithmUsed: string;

        try {
          // Use Gemini API for similarity calculation
          const sourceEmbedding = await this.geminiClient.getEmbeddings(optimizedSourceText);
          const targetEmbedding = await this.geminiClient.getEmbeddings(optimizedTargetText);
          const geminiSimilarityScore = await this.geminiClient.calculateSimilarity(sourceEmbedding, targetEmbedding);

          similarityScore = geminiSimilarityScore * 100;
          algorithmUsed = 'gemini';
        } catch (error) {
          console.error('Error using Gemini API, falling back to levenshtein algorithm:', error);
          // Fallback to basic algorithm
          similarityScore = TextComparisonUtil.calculateSimilarity(
            optimizedSourceText,
            optimizedTargetText
          );
          algorithmUsed = this.DEFAULT_ALGORITHM;
        }

        // Store scan result if similarity is above threshold
        if (similarityScore >= minSimilarityThreshold) {
          matches.push({
            user_id: userId,
            documentId: doc.id!,
            title: doc.title,
            content: doc.content,
            similarityScore,
            isUserDocument: doc.user_id === userId,
          });

          // Create a scan record for the database
          scanRecords.push({
            user_id: userId,
            source_document_id: sourceDocument.id!,
            matched_document_id: doc.id!,
            similarity_score: similarityScore,
            algorithm_used: algorithmUsed
          });
        }
      }

      // Store scan records in database
      for (const record of scanRecords) {
        await DocumentScanDAO.create(record);
      }

      // Sort matches by similarity score (descending)
      matches.sort((a, b) => b.similarityScore - a.similarityScore);

      return {
        sourceDocumentId: sourceDocument.id!,
        sourceDocumentTitle: sourceDocument.title,
        scannedThreshold: minSimilarityThreshold,
        user_id: userId,
        matches,
        scanDate: new Date().toISOString(),
        algorithm: scanRecords.length > 0 && scanRecords[0].algorithm_used
          ? scanRecords[0].algorithm_used : this.DEFAULT_ALGORITHM
      };
    } catch (error) {
      console.error('Error scanning document:', error);
      throw error;
    }
  }

  /**
   * Get previous scan results for a document
   * @param userId User ID
   * @param documentId Document ID
   * @param minSimilarityThreshold Minimum similarity threshold (%)
   * @returns Scan results
   */
  public static async getPreviousScanResults(
    userId: number,
    documentId: number,
    minSimilarityThreshold: number = this.DEFAULT_SIMILARITY_THRESHOLD
  ): Promise<ScanResult> {
    try {
      // Get the source document
      const sourceDocument = await DocumentDAO.findById(documentId);
      if (!sourceDocument) {
        throw new Error('Source document not found');
      }

      // Check if user has access to the document
      if (sourceDocument.user_id !== userId && sourceDocument.is_private) {
        throw new Error('Access denied to source document');
      }

      // Get previous scan results from database
      const scanRecords = await DocumentScanDAO.findMatchesAboveThreshold(
        documentId,
        minSimilarityThreshold
      );

      if (scanRecords.length === 0) {
        return {
          user_id: userId,
          sourceDocumentId: sourceDocument.id!,
          sourceDocumentTitle: sourceDocument.title,
          scannedThreshold: minSimilarityThreshold,
          matches: [],
          scanDate: new Date().toISOString(),
          algorithm: this.DEFAULT_ALGORITHM
        };
      }

      // Get all matched document details
      const matchedDocumentIds = scanRecords.map(scan => scan.matched_document_id);
      const matchedDocuments = await Promise.all(
        matchedDocumentIds.map(async id => await DocumentDAO.findById(id))
      );

      // Create matches array
      const matches: ScanMatchResult[] = scanRecords
        .map((scan, index) => {
          const matchedDoc = matchedDocuments[index];

          // Skip if document no longer exists or user doesn't have access
          if (!matchedDoc || (matchedDoc.is_private && matchedDoc.user_id !== userId)) {
            return null;
          }

          return {
            documentId: scan.matched_document_id,
            title: matchedDoc.title,
            content: matchedDoc.content,
            similarityScore: scan.similarity_score,
            isUserDocument: matchedDoc.user_id === userId
          };
        })
        .filter((match): match is ScanMatchResult => match !== null);

      // Sort matches by similarity score (descending)
      matches.sort((a, b) => b.similarityScore - a.similarityScore);

      return {
        user_id: userId,
        sourceDocumentId: sourceDocument.id!,
        sourceDocumentTitle: sourceDocument.title,
        scannedThreshold: minSimilarityThreshold,
        matches,
        scanDate: scanRecords[0].scan_date || new Date().toISOString(),
        algorithm: scanRecords[0].algorithm_used
      };
    } catch (error) {
      console.error('Error getting previous scan results:', error);
      throw error;
    }
  }

  /**
   * Export scan results
   * @param userId User ID
   * @param documentId Document ID
   * @returns Exported scan results
   */
  public static async exportScanResults(
    userId: number,
    documentId: number,
    minSimilarityThreshold: number
  ): Promise<ScanResult> {
    return this.getPreviousScanResults(userId, documentId, minSimilarityThreshold);
  }
}
