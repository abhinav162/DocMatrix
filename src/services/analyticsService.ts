import { Database } from 'sqlite';
import DBConnection from '../db/connection';

/**
 * Service for system usage analytics
 */
export class AnalyticsService {
  /**
   * Get system usage analytics
   * @returns System usage analytics data
   */
  public static async getSystemAnalytics(): Promise<any> {
    try {
      const db = await DBConnection.getConnection();

      // Get total number of users
      const totalUsers = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM users');
      
      // Get total number of documents
      const totalDocuments = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM documents');
      
      // Get total number of credit requests
      const totalCreditRequests = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM credit_requests');
      
      // Get total number of document scans
      const totalDocumentScans = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM document_scans');

      return {
        totalUsers: totalUsers.count,
        totalDocuments: totalDocuments.count,
        totalCreditRequests: totalCreditRequests.count,
        totalDocumentScans: totalDocumentScans.count
      };
    } catch (error) {
      console.error('Error getting system analytics:', error);
      throw error;
    }
  }
}
