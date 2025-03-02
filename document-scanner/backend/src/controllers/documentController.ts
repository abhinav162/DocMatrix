import { Request, Response } from 'express';
import { DocumentService } from '../services/documentService';
import { FileStorageUtil } from '../utils/fileStorage';

/**
 * Controller for document-related endpoints
 */
export class DocumentController {
  /**
   * Upload a new document
   * @param req Request
   * @param res Response
   */
  public static async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        res.status(401).json({
          message: 'Authentication required'
        });
        return;
      }

      // Check if file exists in request
      if (!req.file) {
        res.status(400).json({
          message: 'No file provided'
        });
        return;
      }

      // Get file metadata from request
      const { title, isPrivate } = req.body;
      const isDocPrivate = isPrivate === 'true' || isPrivate === true;

      // Upload document
      const document = await DocumentService.uploadDocument(
        req.user.id,
        {
          buffer: req.file.buffer,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype
        },
        title || req.file.originalname,
        isDocPrivate
      );

      res.status(201).json({
        message: 'Document uploaded successfully',
        document: {
          id: document.id,
          title: document.title,
          is_private: document.is_private,
          uploaded_at: document.uploaded_at
        }
      });
    } catch (error: any) {
      console.error('Error in uploadDocument:', error);
      
      if (error.message === 'Only .txt files are allowed' || 
          error.message?.includes('exceeds the maximum limit')) {
        res.status(400).json({
          message: error.message
        });
      } else {
        res.status(500).json({
          message: 'An error occurred during document upload'
        });
      }
    }
  }

  /**
   * List user's documents
   * @param req Request
   * @param res Response
   */
  public static async listDocuments(req: Request, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        res.status(401).json({
          message: 'Authentication required'
        });
        return;
      }

      // Get documents for the user
      const documents = await DocumentService.getUserDocuments(req.user.id);

      // Map to response format
      const documentList = documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        is_private: doc.is_private,
        uploaded_at: doc.uploaded_at
      }));

      res.status(200).json({
        documents: documentList
      });
    } catch (error) {
      console.error('Error in listDocuments:', error);
      res.status(500).json({
        message: 'An error occurred while retrieving documents'
      });
    }
  }

  /**
   * Get document details
   * @param req Request
   * @param res Response
   */
  public static async getDocument(req: Request, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        res.status(401).json({
          message: 'Authentication required'
        });
        return;
      }

      const documentId = parseInt(req.params.id);
      
      if (isNaN(documentId)) {
        res.status(400).json({
          message: 'Invalid document ID'
        });
        return;
      }

      // Check if the user has access to the document
      const hasAccess = await DocumentService.hasAccessToDocument(
        req.user.id,
        documentId
      );

      if (!hasAccess) {
        res.status(403).json({
          message: 'Access denied to this document'
        });
        return;
      }

      // Get document details
      const document = await DocumentService.getDocumentById(documentId);

      if (!document) {
        res.status(404).json({
          message: 'Document not found'
        });
        return;
      }

      res.status(200).json({
        document: {
          id: document.id,
          title: document.title,
          content: document.content,
          is_private: document.is_private,
          uploaded_at: document.uploaded_at
        }
      });
    } catch (error) {
      console.error('Error in getDocument:', error);
      res.status(500).json({
        message: 'An error occurred while retrieving the document'
      });
    }
  }

  /**
   * Toggle document privacy
   * @param req Request
   * @param res Response
   */
  public static async togglePrivacy(req: Request, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        res.status(401).json({
          message: 'Authentication required'
        });
        return;
      }

      const documentId = parseInt(req.params.id);
      
      if (isNaN(documentId)) {
        res.status(400).json({
          message: 'Invalid document ID'
        });
        return;
      }

      // Get the document to check ownership
      const document = await DocumentService.getDocumentById(documentId);

      if (!document) {
        res.status(404).json({
          message: 'Document not found'
        });
        return;
      }

      // Check if the user owns the document
      if (document.user_id !== req.user.id) {
        res.status(403).json({
          message: 'Access denied - you can only modify your own documents'
        });
        return;
      }

      // Toggle privacy
      const isPrivate = !document.is_private;
      const updatedDocument = await DocumentService.togglePrivacy(
        documentId,
        isPrivate
      );

      res.status(200).json({
        message: `Document is now ${isPrivate ? 'private' : 'public'}`,
        document: {
          id: updatedDocument!.id,
          title: updatedDocument!.title,
          is_private: updatedDocument!.is_private,
          uploaded_at: updatedDocument!.uploaded_at
        }
      });
    } catch (error) {
      console.error('Error in togglePrivacy:', error);
      res.status(500).json({
        message: 'An error occurred while updating document privacy'
      });
    }
  }
}
