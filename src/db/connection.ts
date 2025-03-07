import { Database, open } from 'sqlite';
import { Database as SQLiteCloudDatabase } from '@sqlitecloud/drivers';
import dotenv from 'dotenv';
dotenv.config();


const DB_CONNECTION_STRING: string = process.env.SQLITE_CLOUD_URI!;

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
        filename: DB_CONNECTION_STRING,
        driver: SQLiteCloudDatabase
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
