import { Request, Response } from 'express';
import { CreditService } from '../services/creditService';

/**
 * Controller for credit-related endpoints
 */
export class CreditController {
  /**
   * Get current credit balance
   * @param req Request
   * @param res Response
   */
  public static async getCreditBalance(req: Request, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        res.status(401).json({
          message: 'Authentication required'
        });
        return;
      }

      const balance = await CreditService.getCreditBalance(req.user.id);

      res.status(200).json({
        credits: balance
      });
    } catch (error: any) {
      console.error('Error in getCreditBalance:', error);
      res.status(500).json({
        message: 'An error occurred while retrieving credit balance'
      });
    }
  }

  /**
   * Request additional credits
   * @param req Request
   * @param res Response
   */
  public static async requestCredits(req: Request, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        res.status(401).json({
          message: 'Authentication required'
        });
        return;
      }

      const { amount, reason } = req.body;

      // Validate amount
      const creditAmount = parseInt(amount);
      if (isNaN(creditAmount) || creditAmount <= 0 || creditAmount > CreditService.MAX_CREDITS_PER_REQUEST) {
        res.status(400).json({
          message: `Credit request amount must be between 1 and ${CreditService.MAX_CREDITS_PER_REQUEST}`
        });
        return;
      }

      const creditRequest = await CreditService.requestCredits(
        req.user.id,
        creditAmount,
        reason
      );

      res.status(201).json({
        message: 'Credit request submitted successfully',
        request: {
          id: creditRequest.id,
          amount: creditRequest.requested_amount,
          status: creditRequest.status,
          timestamp: creditRequest.timestamp
        }
      });
    } catch (error: any) {
      console.error('Error in requestCredits:', error);
      
      if (error.message.includes('Maximum') && error.message.includes('credit requests per day allowed')) {
        res.status(400).json({
          message: error.message
        });
      } else {
        res.status(500).json({
          message: 'An error occurred while processing credit request'
        });
      }
    }
  }

  /**
   * Get all pending credit requests (admin only)
   * @param req Request
   * @param res Response
   */
  public static async getPendingRequests(req: Request, res: Response): Promise<void> {
    try {
      const pendingRequests = await CreditService.getPendingRequests();

      res.status(200).json({
        requests: pendingRequests
      });
    } catch (error) {
      console.error('Error in getPendingRequests:', error);
      res.status(500).json({
        message: 'An error occurred while retrieving pending requests'
      });
    }
  }

  /**
   * Approve a credit request (admin only)
   * @param req Request
   * @param res Response
   */
  public static async approveRequest(req: Request, res: Response): Promise<void> {
    try {
      const requestId = parseInt(req.params.id);
      
      if (isNaN(requestId)) {
        res.status(400).json({
          message: 'Invalid request ID'
        });
        return;
      }

      const updatedRequest = await CreditService.approveRequest(requestId);

      res.status(200).json({
        message: 'Credit request approved successfully',
        request: updatedRequest
      });
    } catch (error: any) {
      console.error('Error in approveRequest:', error);
      
      if (error.message === 'Credit request not found') {
        res.status(404).json({
          message: 'Credit request not found'
        });
      } else if (error.message === 'Credit request is not pending') {
        res.status(400).json({
          message: 'Credit request is not pending'
        });
      } else {
        res.status(500).json({
          message: 'An error occurred while approving credit request'
        });
      }
    }
  }

  /**
   * Deny a credit request (admin only)
   * @param req Request
   * @param res Response
   */
  public static async denyRequest(req: Request, res: Response): Promise<void> {
    try {
      const requestId = parseInt(req.params.id);
      
      if (isNaN(requestId)) {
        res.status(400).json({
          message: 'Invalid request ID'
        });
        return;
      }

      const updatedRequest = await CreditService.denyRequest(requestId);

      res.status(200).json({
        message: 'Credit request denied',
        request: updatedRequest
      });
    } catch (error: any) {
      console.error('Error in denyRequest:', error);
      
      if (error.message === 'Credit request not found') {
        res.status(404).json({
          message: 'Credit request not found'
        });
      } else if (error.message === 'Credit request is not pending') {
        res.status(400).json({
          message: 'Credit request is not pending'
        });
      } else {
        res.status(500).json({
          message: 'An error occurred while denying credit request'
        });
      }
    }
  }
}
