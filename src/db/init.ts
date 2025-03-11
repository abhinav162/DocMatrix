import { initializeSchema } from './schema';

/**
 * Initialize the database
 * This script is used to initialize the database schema
 */
export async function initDatabase() {
  try {
    const dbType = process.env.DB_TYPE;
    if (dbType !== 'LOCAL') {
      console.error('DB_TYPE is not set to LOCAL, Using CLOUD DB');
      process.exit(1);
    }

    console.log('Initializing database schema...');
    await initializeSchema();
    console.log('Database schema initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}
