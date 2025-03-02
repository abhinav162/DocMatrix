import { Database } from 'sqlite';
import DBConnection from './connection';

/**
 * Initialize the database schema
 * Creates all necessary tables if they don't exist
 */
export async function initializeSchema(): Promise<void> {
  try {
    const db = await DBConnection.getConnection();

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');

    // Create Users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
        daily_credits_used INTEGER NOT NULL DEFAULT 0,
        last_reset_date TEXT NOT NULL DEFAULT CURRENT_DATE,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Documents table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        file_path TEXT NOT NULL,
        uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_private BOOLEAN NOT NULL DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create Credit Requests table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS credit_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        requested_amount INTEGER NOT NULL,
        reason TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'denied')),
        timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create Document Scans table for storing scan results
    await db.exec(`
      CREATE TABLE IF NOT EXISTS document_scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_document_id INTEGER NOT NULL,
        matched_document_id INTEGER NOT NULL,
        similarity_score REAL NOT NULL,
        scan_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        algorithm_used TEXT NOT NULL,
        FOREIGN KEY (source_document_id) REFERENCES documents(id) ON DELETE CASCADE,
        FOREIGN KEY (matched_document_id) REFERENCES documents(id) ON DELETE CASCADE
      )
    `);

    console.log('Database schema initialized successfully');

    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Tables created:', tables.map(t => t.name));

    const info = await db.get("PRAGMA database_info");
    console.log('Database info:', info);
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }
}

/**
 * Reset the database (for testing purposes only)
 * Drops all tables and recreates them
 */
export async function resetDatabase(): Promise<void> {
  try {
    const db = await DBConnection.getConnection();

    // Drop tables in reverse order of dependency
    await db.exec('DROP TABLE IF EXISTS document_scans');
    await db.exec('DROP TABLE IF EXISTS credit_requests');
    await db.exec('DROP TABLE IF EXISTS documents');
    await db.exec('DROP TABLE IF EXISTS users');

    // Reinitialize schema
    await initializeSchema();

    console.log('Database reset successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}
