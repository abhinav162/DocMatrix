import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { CreditService } from '../services/creditService';
import { AnalyticsService } from '../services/analyticsService';

/**
 * Controller for admin-related endpoints
 */
export class AdminController {
  /**
   * List all users
   * @param req Request
   * @param res Response
   */
  public static async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserService.listAllUsers();
      res.status(200).json({ users });
    } catch (error) {
      console.error('Error in listUsers:', error);
      res.status(500).json({
        message: 'An error occurred while listing users'
      });
    }
  }

  /**
   * Update user role
   * @param req Request
   * @param res Response
   */
  public static async updateUserRole(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!userId || !role) {
        res.status(400).json({
          message: 'User ID and role are required'
        });
        return;
      }

      const updatedUser = await UserService.updateUserRole(parseInt(userId), role);
      res.status(200).json({
        message: 'User role updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Error in updateUserRole:', error);
      res.status(500).json({
        message: 'An error occurred while updating user role'
      });
    }
  }

  /**
   * Get system usage analytics
   * @param req Request
   * @param res Response
   */
  public static async getSystemAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await AnalyticsService.getSystemAnalytics();
      res.status(200).json({ analytics });
    } catch (error) {
      console.error('Error in getSystemAnalytics:', error);
      res.status(500).json({
        message: 'An error occurred while retrieving system analytics'
      });
    }
  }

  /**
   * List pending credit requests
   * @param req Request
   * @param res Response
   */
  public static async listPendingCreditRequests(req: Request, res: Response): Promise<void> {
    try {
      const pendingRequests = await CreditService.getPendingRequests();
      res.status(200).json({ requests: pendingRequests });
    } catch (error) {
      console.error('Error in listPendingCreditRequests:', error);
      res.status(500).json({
        message: 'An error occurred while retrieving pending credit requests'
      });
    }
  }

  /**
   * Adjust user credits
   * @param req Request
   * @param res Response
   */
  public static async adjustUserCredits(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { credits } = req.body;

      if (!userId || !credits) {
        res.status(400).json({
          message: 'User ID and credits are required'
        });
        return;
      }

      const updatedUser = await CreditService.adjustUserCredits(parseInt(userId), credits);
      res.status(200).json({
        message: 'User credits adjusted successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Error in adjustUserCredits:', error);
      res.status(500).json({
        message: 'An error occurred while adjusting user credits'
      });
    }
  } 
}
