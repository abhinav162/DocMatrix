import { FileStorageUtil } from './fileStorage';

/**
 * Initialize the file storage system
 */
async function initFileSystem() {
  try {
    console.log('Initializing file storage system...');
    await FileStorageUtil.initialize();
    console.log('File storage system initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing file storage system:', error);
    process.exit(1);
  }
}

// Run initialization
initFileSystem();
