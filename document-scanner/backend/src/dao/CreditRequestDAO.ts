import { Database } from 'sqlite';
import DBConnection from '../db/connection';
import { CreditRequest, CreditRequestCreationParams, CreditRequestUpdateParams } from '../models/CreditRequest';
import { BaseDAO } from './BaseDAO';

class CreditRequestDAO implements BaseDAO<CreditRequest, CreditRequestCreationParams, CreditRequestUpdateParams> {
  /**
   * Find a credit request by ID
   * @param id Credit request ID
   * @returns Credit request or null if not found
   */
  async findById(id: number): Promise<CreditRequest | null> {
    try {
      const db = await DBConnection.getConnection();
      const request = await db.get<CreditRequest>('SELECT * FROM credit_requests WHERE id = ?', id);
      return request || null;
    } catch (error) {
      console.error('Error finding credit request by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new credit request
   * @param params Credit request creation parameters
   * @returns Created credit request
   */
  async create(params: CreditRequestCreationParams): Promise<CreditRequest> {
    try {
      const db = await DBConnection.getConnection();
      const result = await db.run(
        `INSERT INTO credit_requests 
         (user_id, requested_amount, reason, status) 
         VALUES (?, ?, ?, ?)`,
        params.user_id,
        params.requested_amount,
        params.reason || null,
        params.status
      );

      const request = await this.findById(result.lastID!);
      if (!request) {
        throw new Error('Failed to create credit request');
      }
      
      return request;
    } catch (error) {
      console.error('Error creating credit request:', error);
      throw error;
    }
  }

  /**
   * Update an existing credit request
   * @param id Credit request ID
   * @param params Credit request update parameters
   * @returns Updated credit request or null if not found
   */
  async update(id: number, params: CreditRequestUpdateParams): Promise<CreditRequest | null> {
    try {
      const db = await DBConnection.getConnection();
      const request = await this.findById(id);
      
      if (!request) {
        return null;
      }

      // Build the update query dynamically based on provided parameters
      const updatePairs: string[] = [];
      const values: any[] = [];

      if (params.requested_amount !== undefined) {
        updatePairs.push('requested_amount = ?');
        values.push(params.requested_amount);
      }
      
      if (params.reason !== undefined) {
        updatePairs.push('reason = ?');
        values.push(params.reason);
      }
      
      if (params.status !== undefined) {
        updatePairs.push('status = ?');
        values.push(params.status);
      }

      if (updatePairs.length === 0) {
        return request; // Nothing to update
      }

      // Add the request ID to the values array
      values.push(id);

      await db.run(
        `UPDATE credit_requests SET ${updatePairs.join(', ')} WHERE id = ?`,
        ...values
      );

      return await this.findById(id);
    } catch (error) {
      console.error('Error updating credit request:', error);
      throw error;
    }
  }

  /**
   * Delete a credit request by ID
   * @param id Credit request ID
   * @returns True if deleted, false if not found
   */
  async delete(id: number): Promise<boolean> {
    try {
      const db = await DBConnection.getConnection();
      const result = await db.run('DELETE FROM credit_requests WHERE id = ?', id);
      return result?.changes ? result.changes > 0 : false;
    } catch (error) {
      console.error('Error deleting credit request:', error);
      throw error;
    }
  }

  /**
   * Get all credit requests
   * @returns Array of credit requests
   */
  async findAll(): Promise<CreditRequest[]> {
    try {
      const db = await DBConnection.getConnection();
      return await db.all<CreditRequest[]>('SELECT * FROM credit_requests ORDER BY timestamp DESC');
    } catch (error) {
      console.error('Error finding all credit requests:', error);
      throw error;
    }
  }

  /**
   * Find credit requests by user ID
   * @param userId User ID
   * @returns Array of credit requests
   */
  async findByUserId(userId: number): Promise<CreditRequest[]> {
    try {
      const db = await DBConnection.getConnection();
      return await db.all<CreditRequest[]>(
        'SELECT * FROM credit_requests WHERE user_id = ? ORDER BY timestamp DESC',
        userId
      );
    } catch (error) {
      console.error('Error finding credit requests by user ID:', error);
      throw error;
    }
  }

  /**
   * Find pending credit requests
   * @returns Array of pending credit requests
   */
  async findPending(): Promise<CreditRequest[]> {
    try {
      const db = await DBConnection.getConnection();
      return await db.all<CreditRequest[]>(
        "SELECT * FROM credit_requests WHERE status = 'pending' ORDER BY timestamp ASC"
      );
    } catch (error) {
      console.error('Error finding pending credit requests:', error);
      throw error;
    }
  }

  /**
   * Find approved credit requests of a user for the current day
   * @returns Array of approved credit requests
   */
  async findApprovedForUser(userId: number): Promise<CreditRequest[] | null> {
    try {
      const db = await DBConnection.getConnection();
      const requests = await db.all<CreditRequest[]>(
        'SELECT * FROM credit_requests WHERE user_id = ? AND status = "approved" AND date(timestamp) = date("now")',
        userId
      );
      if (requests.length > 1) {
        throw new Error('Multiple approved requests found for the same user');
      }
      return requests || null;
    } catch (error) {
      console.error('Error finding approved credit request for user:', error);
      throw error;
    }
  }
    
  /**
   * Count today's credit requests for a user
   * @param userId User ID
   * @returns Number of credit requests made today
   */
  async countTodayRequestsByUser(userId: number): Promise<number> {
    try {
      const db = await DBConnection.getConnection();
      const result = await db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM credit_requests WHERE user_id = ? AND date(timestamp) = date("now")',
        userId
      );
      return result?.count || 0;
    } catch (error) {
      console.error('Error counting today\'s credit requests:', error);
      throw error;
    }
  }
}

export default new CreditRequestDAO();
