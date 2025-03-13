import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import crypto from 'crypto';

// Promisify file system operations
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

/**
 * Utility for file storage operations
 */
export class FileStorageUtil {
  private static readonly baseDirectory = path.join(__dirname, '../../documents');
  private static readonly maxFileSize = 10 * 1024 * 1024; // 10MB in bytes

  /**
   * Initialize the file storage system
   * Creates the base directory if it doesn't exist
   */
  public static async initialize(): Promise<void> {
    try {
      if (!fs.existsSync(this.baseDirectory)) {
        await mkdir(this.baseDirectory, { recursive: true });
        console.log(`Base directory created: ${this.baseDirectory}`);
      }
    } catch (error) {
      console.error('Error initializing file storage:', error);
      throw new Error('Failed to initialize file storage system');
    }
  }

  /**
   * Get the user directory path
   * @param userId User ID
   * @returns User directory path
   */
  public static getUserDirectoryPath(userId: number): string {
    return path.join(this.baseDirectory, userId.toString());
  }

  /**
   * Ensure the user directory exists
   * @param userId User ID
   * @returns User directory path
   */
  public static async ensureUserDirectory(userId: number): Promise<string> {
    const userDir = this.getUserDirectoryPath(userId);
    
    try {
      if (!fs.existsSync(userDir)) {
        await mkdir(userDir, { recursive: true });
      }
      return userDir;
    } catch (error) {
      console.error(`Error creating directory for user ${userId}:`, error);
      throw new Error('Failed to create user directory');
    }
  }

  /**
   * Generate a unique filename with timestamp
   * @param originalName Original filename
   * @returns Unique filename with timestamp
   */
  public static generateFilename(originalName: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = path.extname(originalName);
    const basename = path.basename(originalName, extension);
    
    // Add a random suffix to prevent collisions
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    
    return `${basename}_${timestamp}_${randomSuffix}${extension}`;
  }

  /**
   * Validate file type and size
   * @param file File to validate
   * @returns Object with validation result and error message
   */
  public static validateFile(
    fileBuffer: Buffer,
    originalName: string
  ): { valid: boolean; message?: string } {
    // Check file size
    if (fileBuffer.length > this.maxFileSize) {
      return {
        valid: false,
        message: `File size exceeds the maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`,
      };
    }

    // Check file extension (only .txt for now)
    const extension = path.extname(originalName).toLowerCase();
    if (extension !== '.txt') {
      return {
        valid: false,
        message: 'Only .txt files are allowed',
      };
    }

    // Additional content validation for text files could be added here

    return { valid: true };
  }

  /**
   * Store a file in the user's directory
   * @param userId User ID
   * @param fileBuffer File buffer
   * @param originalName Original filename
   * @returns Stored file information
   * @throws Error if file is invalid or storage fails
   */
  public static async storeFile(
    userId: number,
    fileBuffer: Buffer,
    originalName: string
  ): Promise<{ filePath: string; fileName: string; content: string; sizeInBytes: number }> {
    try {
      // Validate file
      const validation = this.validateFile(fileBuffer, originalName);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // Ensure user directory exists
      const userDir = await this.ensureUserDirectory(userId);

      // Generate unique filename
      const fileName = this.generateFilename(originalName);
      const filePath = path.join(userDir, fileName);

      // Write file to disk
      await writeFile(filePath, fileBuffer);

      // Get file size
      const fileStats = await stat(filePath);
      
      // Extract content as string (for text files)
      const content = fileBuffer.toString('utf-8');

      return {
        filePath,
        fileName,
        content,
        sizeInBytes: fileStats.size,
      };
    } catch (error) {
      console.error(`Error storing file for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Read file content
   * @param filePath Path to the file
   * @returns File content as string
   */
  public static async readFileContent(filePath: string): Promise<string> {
    try {
      const content = await readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      throw new Error('Failed to read file content');
    }
  }

  /**
   * Get all files in a user's directory
   * @param userId User ID
   * @returns Array of file information
   */
  public static async getUserFiles(userId: number): Promise<{ fileName: string; filePath: string; sizeInBytes: number }[]> {
    try {
      const userDir = this.getUserDirectoryPath(userId);

      // Check if directory exists
      if (!fs.existsSync(userDir)) {
        return [];
      }

      // Get all files in the directory
      const files = await readdir(userDir);

      // Get file stats for each file
      const fileInfoPromises = files.map(async (fileName) => {
        const filePath = path.join(userDir, fileName);
        const fileStats = await stat(filePath);

        return {
          fileName,
          filePath,
          sizeInBytes: fileStats.size,
        };
      });

      return await Promise.all(fileInfoPromises);
    } catch (error) {
      console.error(`Error getting files for user ${userId}:`, error);
      throw new Error('Failed to get user files');
    }
  }

  /**
   * Delete a file
   * @param filePath Path to the file to delete
   * @returns True if deleted successfully
   */
  public static async deleteFile(filePath: string): Promise<boolean> {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found for deletion: ${filePath}`);
        return false;
      }

      // Delete the file
      await unlink(filePath);
      return true;
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
      throw new Error('Failed to delete file');
    }
  }
}

// Initialize file storage system
FileStorageUtil.initialize()
  .then(() => console.log('File storage system initialized'))
  .catch(error => console.error('Failed to initialize file storage system:', error));
