import { initializeSchema } from './schema';

/**
 * Initialize the database
 * This script is used to initialize the database schema
 */
async function initDatabase() {
  try {
    console.log('Initializing database schema...');
    await initializeSchema();
    console.log('Database schema initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run initialization
initDatabase();
