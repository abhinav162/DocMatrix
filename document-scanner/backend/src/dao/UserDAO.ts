import { Database } from 'sqlite';
import DBConnection from '../db/connection';
import { User, UserCreationParams, UserUpdateParams } from '../models/User';
import { BaseDAO } from './BaseDAO';

class UserDAO implements BaseDAO<User, UserCreationParams, UserUpdateParams> {
  /**
   * Find a user by ID
   * @param id User ID
   * @returns User or null if not found
   */
  async findById(id: number): Promise<User | null> {
    try {
      const db = await DBConnection.getConnection();
      const user = await db.get<User>('SELECT * FROM users WHERE id = ?', id);
      return user || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Find a user by username
   * @param username Username
   * @returns User or null if not found
   */
  async findByUsername(username: string): Promise<User | null> {
    try {
      const db = await DBConnection.getConnection();
      const user = await db.get<User>('SELECT * FROM users WHERE username = ?', username);
      return user || null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param params User creation parameters
   * @returns Created user
   */
  async create(params: UserCreationParams): Promise<User> {
    try {
      const db = await DBConnection.getConnection();
      const result = await db.run(
        `INSERT INTO Users 
         (username, password_hash, salt, role, daily_credits_used, last_reset_date) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        params.username,
        params.password_hash,
        params.salt,
        params.role,
        params.daily_credits_used,
        params.last_reset_date
      );

      const user = await this.findById(result.lastID!);
      if (!user) {
        throw new Error('Failed to create user');
      }
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update an existing user
   * @param id User ID
   * @param params User update parameters
   * @returns Updated user or null if not found
   */
  async update(id: number, params: UserUpdateParams): Promise<User | null> {
    try {
      const db = await DBConnection.getConnection();
      const user = await this.findById(id);
      
      if (!user) {
        return null;
      }

      // Build the update query dynamically based on provided parameters
      const updatePairs: string[] = [];
      const values: any[] = [];

      if (params.username !== undefined) {
        updatePairs.push('username = ?');
        values.push(params.username);
      }
      
      if (params.password_hash !== undefined) {
        updatePairs.push('password_hash = ?');
        values.push(params.password_hash);
      }
      
      if (params.salt !== undefined) {
        updatePairs.push('salt = ?');
        values.push(params.salt);
      }
      
      if (params.role !== undefined) {
        updatePairs.push('role = ?');
        values.push(params.role);
      }
      
      if (params.daily_credits_used !== undefined) {
        updatePairs.push('daily_credits_used = ?');
        values.push(params.daily_credits_used);
      }
      
      if (params.last_reset_date !== undefined) {
        updatePairs.push('last_reset_date = ?');
        values.push(params.last_reset_date);
      }

      if (updatePairs.length === 0) {
        return user; // Nothing to update
      }

      // Add the user ID to the values array
      values.push(id);

      await db.run(
        `UPDATE users SET ${updatePairs.join(', ')} WHERE id = ?`,
        ...values
      );

      return await this.findById(id);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete a user by ID
   * @param id User ID
   * @returns True if deleted, false if not found
   */
  async delete(id: number): Promise<boolean> {
    try {
      const db = await DBConnection.getConnection();
      const result = await db.run('DELETE FROM users WHERE id = ?', id);
      return (result.changes ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get all users
   * @returns Array of users
   */
  async findAll(): Promise<User[]> {
    try {
      const db = await DBConnection.getConnection();
      return await db.all<User[]>('SELECT * FROM users');
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }

  /**
   * Reset daily credits for all users
   * @returns Number of users updated
   */
  async resetDailyCreditsForAll(): Promise<number> {
    try {
      const db = await DBConnection.getConnection();
      const result = await db.run(`
        UPDATE users 
        SET daily_credits_used = 0, 
            last_reset_date = CURRENT_DATE 
        WHERE last_reset_date < CURRENT_DATE
      `);
      return result.changes || 0;
    } catch (error) {
      console.error('Error resetting daily credits:', error);
      throw error;
    }
  }
}

export default new UserDAO();
