import { Request, Response } from 'express';
import { UserService } from '../services/userService';

/**
 * Controller for authentication-related endpoints
 */
export class AuthController {
  /**
   * Register a new user
   * @param req Request
   * @param res Response
   */
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        res.status(400).json({
          message: 'Username and password are required'
        });
        return;
      }

      if (username.length < 3) {
        res.status(400).json({
          message: 'Username must be at least 3 characters long'
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          message: 'Password must be at least 6 characters long'
        });
        return;
      }

      // Create user (default to regular user)
      const user = await UserService.registerUser(username, password);

      // Set user in session
      if (req.session) {
        req.session.userId = user.id;
        req.session.isAdmin = user.role === 'admin';
      }

      res.status(201).json({
        message: 'User registered successfully',
        user
      });
    } catch (error: any) {
      if (error.message === 'Username already exists') {
        res.status(409).json({
          message: 'Username already exists'
        });
      } else {
        console.error('Error in register:', error);
        res.status(500).json({
          message: 'An error occurred during registration'
        });
      }
    }
  }

  /**
   * Log in a user
   * @param req Request
   * @param res Response
   */
  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        res.status(400).json({
          message: 'Username and password are required'
        });
        return;
      }

      // Authenticate user
      const user = await UserService.authenticateUser(username, password);

      // Set user in session
      if (req.session) {
        req.session.userId = user.id;
        req.session.isAdmin = user.role === 'admin';
      }

      res.status(200).json({
        message: 'Login successful',
        user
      });
    } catch (error: any) {
      if (error.message === 'Invalid username or password') {
        res.status(401).json({
          message: 'Invalid username or password'
        });
      } else {
        console.error('Error in login:', error);
        res.status(500).json({
          message: 'An error occurred during login'
        });
      }
    }
  }

  /**
   * Log out a user
   * @param req Request
   * @param res Response
   */
  public static async logout(req: Request, res: Response): Promise<void> {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          res.status(500).json({
            message: 'An error occurred during logout'
          });
        } else {
          res.clearCookie('connect.sid'); // Clear session cookie
          res.status(200).json({
            message: 'Logout successful'
          });
        }
      });
    } else {
      res.status(200).json({
        message: 'No active session'
      });
    }
  }

  /**
   * Get current user profile
   * @param req Request
   * @param res Response
   */
  public static async profile(req: Request, res: Response): Promise<void> {
    try {
      // req.user is set by the auth middleware
      const userId = req.session?.userId;
      
      if (!userId) {
        res.status(401).json({
          message: 'Not authenticated'
        });
        return;
      }
      
      const user = await UserService.getUserById(userId);
      
      if (!user) {
        if (req.session) {
          req.session.destroy(() => {});
        }
        res.status(401).json({
          message: 'User not found'
        });
        return;
      }
      
      res.status(200).json({
        user
      });
    } catch (error) {
      console.error('Error in profile:', error);
      res.status(500).json({
        message: 'An error occurred while fetching profile'
      });
    }
  }
}
