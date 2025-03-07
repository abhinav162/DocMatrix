import { Database } from 'sqlite';
import DBConnection from '../db/connection';
import { Document, DocumentCreationParams, DocumentUpdateParams } from '../models/Document';
import { BaseDAO } from './BaseDAO';

class DocumentDAO implements BaseDAO<Document, DocumentCreationParams, DocumentUpdateParams> {
  /**
   * Find a document by ID
   * @param id Document ID
   * @returns Document or null if not found
   */
  async findById(id: number): Promise<Document | null> {
    try {
      const db = await DBConnection.getConnection();
      const document = await db.get<Document>('SELECT * FROM documents WHERE id = ?', id);
      return document || null;
    } catch (error) {
      console.error('Error finding document by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new document
   * @param params Document creation parameters
   * @returns Created document
   */
  async create(params: DocumentCreationParams): Promise<Document> {
    try {
      const db = await DBConnection.getConnection();
      const result = await db.run(
        `INSERT INTO documents 
         (user_id, title, content, file_path, is_private) 
         VALUES (?, ?, ?, ?, ?)`,
        params.user_id,
        params.title,
        params.content,
        params.file_path,
        params.is_private ? 1 : 0
      );

      const document = await this.findById(result.lastID!);
      if (!document) {
        throw new Error('Failed to create document');
      }
      
      return document;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  /**
   * Update an existing document
   * @param id Document ID
   * @param params Document update parameters
   * @returns Updated document or null if not found
   */
  async update(id: number, params: DocumentUpdateParams): Promise<Document | null> {
    try {
      const db = await DBConnection.getConnection();
      const document = await this.findById(id);
      
      if (!document) {
        return null;
      }

      // Build the update query dynamically based on provided parameters
      const updatePairs: string[] = [];
      const values: any[] = [];

      if (params.title !== undefined) {
        updatePairs.push('title = ?');
        values.push(params.title);
      }
      
      if (params.content !== undefined) {
        updatePairs.push('content = ?');
        values.push(params.content);
      }
      
      if (params.file_path !== undefined) {
        updatePairs.push('file_path = ?');
        values.push(params.file_path);
      }
      
      if (params.is_private !== undefined) {
        updatePairs.push('is_private = ?');
        values.push(params.is_private ? 1 : 0);
      }

      if (updatePairs.length === 0) {
        return document; // Nothing to update
      }

      // Add the document ID to the values array
      values.push(id);

      await db.run(
        `UPDATE documents SET ${updatePairs.join(', ')} WHERE id = ?`,
        ...values
      );

      return await this.findById(id);
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  /**
   * Delete a document by ID
   * @param id Document ID
   * @returns True if deleted, false if not found
   */
  async delete(id: number): Promise<boolean> {
    try {
      const db = await DBConnection.getConnection();
      const result = await db.run('DELETE FROM documents WHERE id = ?', id);
      return result.changes !== undefined && result.changes > 0;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Get all documents
   * @returns Array of documents
   */
  async findAll(): Promise<Document[]> {
    try {
      const db = await DBConnection.getConnection();
      return await db.all<Document[]>('SELECT * FROM documents');
    } catch (error) {
      console.error('Error finding all documents:', error);
      throw error;
    }
  }

  /**
   * Find documents by user ID
   * @param userId User ID
   * @returns Array of documents
   */
  async findByUserId(userId: number): Promise<Document[]> {
    try {
      const db = await DBConnection.getConnection();
      return await db.all<Document[]>('SELECT * FROM documents WHERE user_id = ?', userId);
    } catch (error) {
      console.error('Error finding documents by user ID:', error);
      throw error;
    }
  }

  /**
   * Find all public documents
   * @returns Array of public documents
   */
  async findPublic(): Promise<Document[]> {
    try {
      const db = await DBConnection.getConnection();
      return await db.all<Document[]>('SELECT * FROM documents WHERE is_private = 0');
    } catch (error) {
      console.error('Error finding public documents:', error);
      throw error;
    }
  }

  /**
   * Find documents accessible to a user (their own + public)
   * @param userId User ID
   * @returns Array of accessible documents
   */
  async findAccessibleToUser(userId: number): Promise<Document[]> {
    try {
      const db = await DBConnection.getConnection();
      return await db.all<Document[]>(
        'SELECT * FROM documents WHERE user_id = ? OR is_private = 0',
        userId
      );
    } catch (error) {
      console.error('Error finding accessible documents:', error);
      throw error;
    }
  }
}

export default new DocumentDAO();
