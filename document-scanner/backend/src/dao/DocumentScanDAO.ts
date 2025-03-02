import { Database } from 'sqlite';
import DBConnection from '../db/connection';
import { DocumentScan, DocumentScanCreationParams, DocumentScanUpdateParams } from '../models/DocumentScan';
import { BaseDAO } from './BaseDAO';

class DocumentScanDAO implements BaseDAO<DocumentScan, DocumentScanCreationParams, DocumentScanUpdateParams> {
  /**
   * Find a document scan by ID
   * @param id Scan ID
   * @returns DocumentScan or null if not found
   */
  async findById(id: number): Promise<DocumentScan | null> {
    try {
      const db = await DBConnection.getConnection();
      const scan = await db.get<DocumentScan>('SELECT * FROM document_scans WHERE id = ?', id);
      return scan || null;
    } catch (error) {
      console.error('Error finding document scan by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new document scan
   * @param params DocumentScan creation parameters
   * @returns Created document scan
   */
  async create(params: DocumentScanCreationParams): Promise<DocumentScan> {
    try {
      const db = await DBConnection.getConnection();
      const result = await db.run(
        `INSERT INTO document_scans 
         (source_document_id, matched_document_id, similarity_score, algorithm_used) 
         VALUES (?, ?, ?, ?)`,
        params.source_document_id,
        params.matched_document_id,
        params.similarity_score,
        params.algorithm_used
      );

      const scan = await this.findById(result.lastID!);
      if (!scan) {
        throw new Error('Failed to create document scan');
      }
      
      return scan;
    } catch (error) {
      console.error('Error creating document scan:', error);
      throw error;
    }
  }

  /**
   * Update an existing document scan
   * @param id Scan ID
   * @param params DocumentScan update parameters
   * @returns Updated document scan or null if not found
   */
  async update(id: number, params: DocumentScanUpdateParams): Promise<DocumentScan | null> {
    try {
      const db = await DBConnection.getConnection();
      const scan = await this.findById(id);
      
      if (!scan) {
        return null;
      }

      // Build the update query dynamically based on provided parameters
      const updatePairs: string[] = [];
      const values: any[] = [];

      if (params.similarity_score !== undefined) {
        updatePairs.push('similarity_score = ?');
        values.push(params.similarity_score);
      }
      
      if (params.algorithm_used !== undefined) {
        updatePairs.push('algorithm_used = ?');
        values.push(params.algorithm_used);
      }

      if (updatePairs.length === 0) {
        return scan; // Nothing to update
      }

      // Add the scan ID to the values array
      values.push(id);

      await db.run(
        `UPDATE document_scans SET ${updatePairs.join(', ')} WHERE id = ?`,
        ...values
      );

      return await this.findById(id);
    } catch (error) {
      console.error('Error updating document scan:', error);
      throw error;
    }
  }

  /**
   * Delete a document scan by ID
   * @param id Scan ID
   * @returns True if deleted, false if not found
   */
  async delete(id: number): Promise<boolean> {
    try {
      const db = await DBConnection.getConnection();
      const result = await db.run('DELETE FROM document_scans WHERE id = ?', id);
      return result.changes !== undefined && result.changes > 0;
    } catch (error) {
      console.error('Error deleting document scan:', error);
      throw error;
    }
  }

  /**
   * Get all document scans
   * @returns Array of document scans
   */
  async findAll(): Promise<DocumentScan[]> {
    try {
      const db = await DBConnection.getConnection();
      return await db.all<DocumentScan[]>('SELECT * FROM document_scans ORDER BY scan_date DESC');
    } catch (error) {
      console.error('Error finding all document scans:', error);
      throw error;
    }
  }

  /**
   * Find scans by source document ID
   * @param documentId Source document ID
   * @returns Array of document scans
   */
  async findBySourceDocumentId(documentId: number): Promise<DocumentScan[]> {
    try {
      const db = await DBConnection.getConnection();
      return await db.all<DocumentScan[]>(
        'SELECT * FROM document_scans WHERE source_document_id = ? ORDER BY similarity_score DESC',
        documentId
      );
    } catch (error) {
      console.error('Error finding scans by source document ID:', error);
      throw error;
    }
  }

  /**
   * Find scans with similarity score above a threshold
   * @param documentId Source document ID
   * @param threshold Minimum similarity score
   * @returns Array of document scans
   */
  async findMatchesAboveThreshold(documentId: number, threshold: number): Promise<DocumentScan[]> {
    try {
      const db = await DBConnection.getConnection();
      return await db.all<DocumentScan[]>(
        'SELECT * FROM document_scans WHERE source_document_id = ? AND similarity_score >= ? ORDER BY similarity_score DESC',
        documentId,
        threshold
      );
    } catch (error) {
      console.error('Error finding matches above threshold:', error);
      throw error;
    }
  }
}

export default new DocumentScanDAO();
