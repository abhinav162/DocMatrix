import { Request, Response } from 'express';
import { ScanningService } from '../services/scanningService';

/**
 * Controller for document scanning endpoints
 */
export class ScanController {
  /**
   * Scan a document against all accessible documents
   * @param req Request
   * @param res Response
   */
  public static async scanDocument(req: Request, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        res.status(401).json({
          message: 'Authentication required'
        });
        return;
      }

      const { documentId, minSimilarityThreshold } = req.body;

      // Validate document ID
      if (!documentId || isNaN(parseInt(documentId))) {
        res.status(400).json({
          message: 'Valid document ID is required'
        });
        return;
      }

      // Validate threshold if provided
      let threshold: number | undefined = undefined;
      if (minSimilarityThreshold !== undefined) {
        threshold = parseFloat(minSimilarityThreshold);
        if (isNaN(threshold) || threshold < 0 || threshold > 100) {
          res.status(400).json({
            message: 'Similarity threshold must be a number between 0 and 100'
          });
          return;
        }
      }

      // Scan document
      const scanResults = await ScanningService.scanDocument(
        req.user.id,
        parseInt(documentId),
        threshold
      );

      res.status(200).json({
        message: 'Document scanned successfully',
        scan: scanResults
      });
    } catch (error: any) {
      console.error('Error in scanDocument:', error);
      
      if (error.message === 'Source document not found') {
        res.status(404).json({
          message: 'Document not found'
        });
      } else if (error.message === 'Access denied to source document') {
        res.status(403).json({
          message: 'Access denied to this document'
        });
      } else {
        res.status(500).json({
          message: 'An error occurred during document scanning'
        });
      }
    }
  }

  /**
   * Get previous scan results for a document
   * @param req Request
   * @param res Response
   */
  public static async getPreviousScanResults(req: Request, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        res.status(401).json({
          message: 'Authentication required'
        });
        return;
      }

      const documentId = parseInt(req.params.docId);
      
      if (isNaN(documentId)) {
        res.status(400).json({
          message: 'Invalid document ID'
        });
        return;
      }

      // Get threshold parameter if provided
      let threshold: number | undefined = undefined;
      if (req.query.threshold) {
        threshold = parseFloat(req.query.threshold as string);
        if (isNaN(threshold) || threshold < 0 || threshold > 100) {
          res.status(400).json({
            message: 'Similarity threshold must be a number between 0 and 100'
          });
          return;
        }
      }

      // Get previous scan results
      const scanResults = await ScanningService.getPreviousScanResults(
        req.user.id,
        documentId,
        threshold
      );

      res.status(200).json({
        scan: scanResults
      });
    } catch (error: any) {
      console.error('Error in getPreviousScanResults:', error);
      
      if (error.message === 'Source document not found') {
        res.status(404).json({
          message: 'Document not found'
        });
      } else if (error.message === 'Access denied to source document') {
        res.status(403).json({
          message: 'Access denied to this document'
        });
      } else {
        res.status(500).json({
          message: 'An error occurred while retrieving scan results'
        });
      }
    }
  }
}
