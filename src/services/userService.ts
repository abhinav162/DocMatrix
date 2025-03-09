import { User, UserCreationParams } from '../models/User';
import { PasswordUtil } from '../utils/password';
import UserDAO from '../dao/UserDAO';
import DocumentDAO from '../dao/DocumentDAO';
import DocumentScanDAO from '../dao/DocumentScanDAO';

/**
 * Service for user-related operations
 */
export class UserService {
  /**
   * Register a new user
   * @param username Username
   * @param password Plain text password
   * @param isAdmin Whether the user should be an admin (default: false)
   * @returns The created user (without sensitive fields)
   * @throws Error if username already exists
   */
  public static async registerUser(
    username: string,
    password: string,
    isAdmin: boolean = false
  ): Promise<Omit<User, 'password_hash' | 'salt'>> {
    try {
      // Check if username already exists
      const existingUser = await UserDAO.findByUsername(username);
      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Generate salt and hash password
      const salt = PasswordUtil.generateSalt();
      const passwordHash = PasswordUtil.hashPassword(password, salt);

      // Create user
      const newUser = await UserDAO.create({
        username,
        password_hash: passwordHash,
        salt,
        role: isAdmin ? 'admin' : 'user',
        daily_credits_used: 0,
        last_reset_date: new Date().toISOString().split('T')[0]
      });

      // Return user without sensitive fields
      const { password_hash, salt: userSalt, ...userWithoutSensitiveFields } = newUser;
      return userWithoutSensitiveFields;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Authenticate a user
   * @param username Username
   * @param password Plain text password
   * @returns The authenticated user (without sensitive fields)
   * @throws Error if authentication fails
   */
  public static async authenticateUser(
    username: string,
    password: string
  ): Promise<Omit<User, 'password_hash' | 'salt'>> {
    try {
      // Find user by username
      const user = await UserDAO.findByUsername(username);
      if (!user) {
        throw new Error('Invalid username or password');
      }

      // Verify password
      const isPasswordValid = PasswordUtil.verifyPassword(
        password,
        user.password_hash,
        user.salt
      );

      if (!isPasswordValid) {
        throw new Error('Invalid username or password');
      }

      // Return user without sensitive fields
      const { password_hash, salt, ...userWithoutSensitiveFields } = user;
      return userWithoutSensitiveFields;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param userId User ID
   * @returns The user (without sensitive fields) or null if not found
   */
  public static async getUserById(
    userId: number
  ): Promise<Omit<User, 'password_hash' | 'salt'> | null> {
    try {
      const user = await UserDAO.findById(userId);
      if (!user) {
        return null;
      }

      // Return user without sensitive fields
      const { password_hash, salt, ...userWithoutSensitiveFields } = user;
      return userWithoutSensitiveFields;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Reset daily credits for all users
   * @returns Number of users updated
   */
  public static async resetDailyCredits(): Promise<number> {
    try {
      return await UserDAO.resetDailyCreditsForAll();
    } catch (error) {
      console.error('Error resetting daily credits:', error);
      throw error;
    }
  }

  /**
   * List all users
   * @returns Array of users (without sensitive fields)
   */
  public static async listAllUsers(): Promise<Omit<User, 'password_hash' | 'salt'>[]> {
    try {
      const users = await UserDAO.findAll();
      return users.map(({ password_hash, salt, ...userWithoutSensitiveFields }) => userWithoutSensitiveFields);
    } catch (error) {
      console.error('Error listing all users:', error);
      throw error;
    }
  }

  /**
   * Update user role
   * @param userId User ID
   * @param role New role
   * @returns Updated user (without sensitive fields)
   */
  public static async updateUserRole(userId: number, role: 'user' | 'admin'): Promise<Omit<User, 'password_hash' | 'salt'>> {
    try {
      const updatedUser = await UserDAO.update(userId, { role });
      if (!updatedUser) {
        throw new Error('User not found');
      }

      const { password_hash, salt, ...userWithoutSensitiveFields } = updatedUser;
      return userWithoutSensitiveFields;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  /**
   * Get activity summary for a user
   * @param userId User ID
   * @returns Activity summary
   */
  public static async getActivitySummary(userId: number): Promise<Object> {
    try {
      const documentsUploaded = await DocumentDAO.findByUserId(userId);
      const scansPerformed = await DocumentScanDAO.findByUserId(userId);

      return {
        totalDocumentsUploaded: documentsUploaded?.length || 0,
        totalScansPerformed: scansPerformed?.length || 0
      }
    } catch (error) {
      console.error('Error getting activity summary:', error);
      throw error;
    }
  }
}
