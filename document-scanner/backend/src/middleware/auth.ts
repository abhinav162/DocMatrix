import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';

/**
 * Authentication middleware
 */
export class AuthMiddleware {
  /**
   * Ensure the user is authenticated
   * @param req Request
   * @param res Response
   * @param next Next function
   */
  public static async isAuthenticated(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.session?.userId;

      if (!userId) {
        res.status(401).json({
          message: 'Authentication required'
        });
        return;
      }

      // Verify user exists
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

      // Add user to request for use in controllers
      req.user = user;
      next();
    } catch (error) {
      console.error('Error in isAuthenticated middleware:', error);
      res.status(500).json({
        message: 'An error occurred during authentication'
      });
    }
  }

  /**
   * Ensure the user is an admin
   * @param req Request
   * @param res Response
   * @param next Next function
   */
  public static async isAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // First check if user is authenticated
      const userId = req.session?.userId;
      const isAdmin = req.session?.isAdmin;

      if (!userId || !isAdmin) {
        res.status(403).json({
          message: 'Admin privileges required'
        });
        return;
      }

      // Verify user exists and is an admin
      const user = await UserService.getUserById(userId);
      if (!user || user.role !== 'admin') {
        res.status(403).json({
          message: 'Admin privileges required'
        });
        return;
      }

      // Add user to request for use in controllers
      req.user = user;
      next();
    } catch (error) {
      console.error('Error in isAdmin middleware:', error);
      res.status(500).json({
        message: 'An error occurred during authentication'
      });
    }
  }
}
