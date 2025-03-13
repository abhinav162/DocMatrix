import { Document, DocumentCreationParams } from '../models/Document';
import DocumentDAO from '../dao/DocumentDAO';
import { FileStorageUtil } from '../utils/fileStorage';

/**
 * Service for document-related operations
 */
export class DocumentService {
  /**
   * Upload a new document
   * @param userId User ID
   * @param file File buffer and metadata
   * @param isPrivate Whether the document is private (default: true)
   * @returns The created document
   */
  public static async uploadDocument(
    userId: number,
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
    },
    title: string,
    isPrivate: boolean = true
  ): Promise<Document> {
    try {
      // Store file in user's directory
      const storedFile = await FileStorageUtil.storeFile(
        userId,
        file.buffer,
        file.originalname
      );

      // Create document record in database
      const documentParams: DocumentCreationParams = {
        user_id: userId,
        title: title || storedFile.fileName,
        content: storedFile.content,
        file_path: storedFile.filePath,
        is_private: isPrivate
      };

      const document = await DocumentDAO.create(documentParams);
      return document;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  /**
   * Get document by ID
   * @param documentId Document ID
   * @returns The document or null if not found
   */
  public static async getDocumentById(documentId: number): Promise<Document | null> {
    try {
      return await DocumentDAO.findById(documentId);
    } catch (error) {
      console.error('Error getting document by ID:', error);
      throw error;
    }
  }

  /**
   * Get all documents for a user
   * @param userId User ID
   * @returns Array of documents
   */
  public static async getUserDocuments(userId: number): Promise<Document[]> {
    try {
      return await DocumentDAO.findByUserId(userId);
    } catch (error) {
      console.error('Error getting user documents:', error);
      throw error;
    }
  }

  /**
   * Get documents accessible to a user (their own + public)
   * @param userId User ID
   * @returns Array of documents
   */
  public static async getAccessibleDocuments(userId: number): Promise<Document[]> {
    try {
      return await DocumentDAO.findAccessibleToUser(userId);
    } catch (error) {
      console.error('Error getting accessible documents:', error);
      throw error;
    }
  }

  /**
   * Toggle document privacy
   * @param documentId Document ID
   * @param isPrivate New privacy status
   * @returns Updated document or null if not found
   */
  public static async togglePrivacy(
    documentId: number,
    isPrivate: boolean
  ): Promise<Document | null> {
    try {
      return await DocumentDAO.update(documentId, { is_private: isPrivate });
    } catch (error) {
      console.error('Error toggling document privacy:', error);
      throw error;
    }
  }

  /**
   * Check if a user has access to a document
   * @param userId User ID
   * @param documentId Document ID
   * @returns True if the user has access, false otherwise
   */
  public static async hasAccessToDocument(
    userId: number,
    documentId: number
  ): Promise<boolean> {
    try {
      const document = await DocumentDAO.findById(documentId);

      if (!document) {
        return false;
      }

      return document.user_id === userId || !document.is_private;
    } catch (error) {
      console.error('Error checking document access:', error);
      throw error;
    }
  }

  /**
   * Delete a document
   * @param documentId Document ID
   * @returns True if deleted successfully, false otherwise
   */
  public static async deleteDocument(documentId: number): Promise<boolean> {
    try {
      // Get the document to get the file path
      const document = await DocumentDAO.findById(documentId);

      if (!document) {
        return false;
      }

      // Delete the document from the database
      const deleted = await DocumentDAO.delete(documentId);

      if (deleted && document.file_path) {
        // Delete the file from storage
        try {
          await FileStorageUtil.deleteFile(document.file_path);
        } catch (fileError) {
          console.error('Error deleting document file:', fileError);
          // Continue even if file deletion fails
        }
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
}
