import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'document_scanner.sqlite');

// SQLite database connection singleton
class DBConnection {
  private static instance: Promise<Database> | null = null;

  /**
   * Get the database connection instance
   * @returns Promise<Database>
   */
  public static async getConnection(): Promise<Database> {
    if (!this.instance) {
      this.instance = open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      // Initialize the database schema if needed
      const db = await this.instance;
      db.on('error', (err: Error) => {
        console.error('SQLite error:', err);
      });
    }

    return this.instance;
  }

  /**
   * Close the database connection
   */
  public static async closeConnection(): Promise<void> {
    if (this.instance) {
      const db = await this.instance;
      await db.close();
      this.instance = null;
    }
  }
}

export default DBConnection;
