import { User } from '../models/User';
import { CreditRequest } from '../models/CreditRequest';
import UserDAO from '../dao/UserDAO';
import CreditRequestDAO from '../dao/CreditRequestDAO';

/**
 * Service for credit-related operations
 */
export class CreditService {
  /**
   * Default daily free credits
   */
  public static readonly DEFAULT_DAILY_CREDITS = 20;

  /**
   * Maximum credits that can be requested at once
   */
  public static readonly MAX_CREDITS_PER_REQUEST = 100;

  /**
   * Maximum credit requests per day
   */
  public static readonly MAX_REQUESTS_PER_DAY = 2;

  /**
   * Get extra approved gredits
   * @param userId User ID
   * @returns Extra approved credits
   */
  public static async getExtraApprovedCredits(userId: number): Promise<number> {
    // Extra approved credits
    const approvedRequests: CreditRequest[] | null = await CreditRequestDAO.findApprovedForUser(userId);

    let extraApprovedCredits = 0;
    if (approvedRequests) {
      // Calculate total credits approved for the day, based on this remainingCredits will be calculated
      extraApprovedCredits = approvedRequests.reduce((acc, req) => acc + req.requested_amount, 0);
    }

    return extraApprovedCredits;
  }


  /**
   * Get a user's current credit balance
   * @param userId User ID
   * @returns Credit balance information
   */
  public static async getCreditBalance(userId: number): Promise<{
    dailyCreditsUsed: number;
    remainingCredits: number;
    lastResetDate: string;
  }> {
    try {
      const user = await UserDAO.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if credits need to be reset
      await this.checkAndResetDailyCredits(user);

      // Extra approved credits
      const extraApprovedCredits = await this.getExtraApprovedCredits(userId);

      // Calculate remaining credits
      const remainingCredits = (this.DEFAULT_DAILY_CREDITS + extraApprovedCredits) - user.daily_credits_used;

      return {
        dailyCreditsUsed: user.daily_credits_used,
        remainingCredits: remainingCredits > 0 ? remainingCredits : 0,
        lastResetDate: user.last_reset_date
      };
    } catch (error) {
      console.error('Error getting credit balance:', error);
      throw error;
    }
  }

  /**
   * Check if daily credits need to be reset and do so if necessary
   * @param user User object
   * @returns Updated user if reset occurred, or original user if not
   */
  public static async checkAndResetDailyCredits(user: User): Promise<User> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      if (user.last_reset_date < today) {
        // Reset credits
        const updatedUser = await UserDAO.update(user.id!, {
          daily_credits_used: 0,
          last_reset_date: today
        });

        return updatedUser!;
      }

      return user;
    } catch (error) {
      console.error('Error checking/resetting daily credits:', error);
      throw error;
    }
  }

  /**
   * Deduct credits for a scan operation
   * @param userId User ID
   * @returns Updated credit balance
   * @throws Error if not enough credits
   */
  public static async deductCreditsForScan(userId: number): Promise<{
    dailyCreditsUsed: number;
    remainingCredits: number;
  }> {
    try {
      // Get current balance
      const balance = await this.getCreditBalance(userId);

      if (balance.remainingCredits <= 0) {
        throw new Error('Not enough credits');
      }

      // Deduct one credit
      const user = await UserDAO.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const updatedUser = await UserDAO.update(userId, {
        daily_credits_used: user.daily_credits_used + 1
      });

      // Extra approved credits
      const extraApprovedCredits = await this.getExtraApprovedCredits(userId);

      return {
        dailyCreditsUsed: updatedUser!.daily_credits_used,
        remainingCredits: (this.DEFAULT_DAILY_CREDITS + extraApprovedCredits) - updatedUser!.daily_credits_used
      };
    } catch (error) {
      console.error('Error deducting credits for scan:', error);
      throw error;
    }
  }

  /**
   * Request additional credits
   * @param userId User ID
   * @param amount Number of credits requested
   * @param reason Reason for the request
   * @returns Created credit request
   */
  public static async requestCredits(
    userId: number,
    amount: number,
    reason?: string
  ): Promise<CreditRequest> {
    try {
      // Validate amount
      if (amount <= 0 || amount > this.MAX_CREDITS_PER_REQUEST) {
        throw new Error(`Credit request amount must be between 1 and ${this.MAX_CREDITS_PER_REQUEST}`);
      }

      // Check if user has reached the daily request limit
      const todayRequests = await CreditRequestDAO.countTodayRequestsByUser(userId);
      if (todayRequests >= this.MAX_REQUESTS_PER_DAY) {
        throw new Error(`Maximum ${this.MAX_REQUESTS_PER_DAY} credit requests per day allowed`);
      }

      // Create credit request
      const creditRequest = await CreditRequestDAO.create({
        user_id: userId,
        requested_amount: amount,
        reason,
        status: 'pending'
      });

      return creditRequest;
    } catch (error) {
      console.error('Error requesting credits:', error);
      throw error;
    }
  }

  /**
   * Get all pending credit requests (admin function)
   * @returns Array of pending credit requests
   */
  public static async getPendingRequests(): Promise<CreditRequest[]> {
    try {
      return await CreditRequestDAO.findPending();
    } catch (error) {
      console.error('Error getting pending requests:', error);
      throw error;
    }
  }

  /**
   * Approve a credit request (admin function)
   * @param requestId Request ID
   * @returns Updated credit request
   */
  public static async approveRequest(requestId: number): Promise<CreditRequest> {
    try {
      // Get the request
      const request = await CreditRequestDAO.findById(requestId);
      if (!request) {
        throw new Error('Credit request not found');
      }

      if (request.status !== 'pending') {
        throw new Error('Credit request is not pending');
      }

      // Get the user
      const user = await UserDAO.findById(request.user_id);
      if (!user) {
        throw new Error('User not found');
      }

      // Update request status
      const updatedRequest = await CreditRequestDAO.update(requestId, {
        status: 'approved'
      });

      // Credit the user's account by adjusting daily_credits_used
      // We decrease the daily_credits_used to effectively add more credits
      const newCreditsUsed = Math.max(0, user.daily_credits_used - request.requested_amount);

      await UserDAO.update(user.id!, {
        daily_credits_used: newCreditsUsed
      });

      return updatedRequest!;
    } catch (error) {
      console.error('Error approving credit request:', error);
      throw error;
    }
  }

  /**
   * Deny a credit request (admin function)
   * @param requestId Request ID
   * @returns Updated credit request
   */
  public static async denyRequest(requestId: number): Promise<CreditRequest> {
    try {
      // Get the request
      const request = await CreditRequestDAO.findById(requestId);
      if (!request) {
        throw new Error('Credit request not found');
      }

      if (request.status !== 'pending') {
        throw new Error('Credit request is not pending');
      }

      // Update request status
      const updatedRequest = await CreditRequestDAO.update(requestId, {
        status: 'denied'
      });

      return updatedRequest!;
    } catch (error) {
      console.error('Error denying credit request:', error);
      throw error;
    }
  }

  /**
   * Reset daily credits for all users
   * Meant to be called by a scheduled job at midnight
   * @returns Number of users updated
   */
  public static async resetAllDailyCredits(): Promise<number> {
    try {
      return await UserDAO.resetDailyCreditsForAll();
    } catch (error) {
      console.error('Error resetting daily credits for all users:', error);
      throw error;
    }
  }
}
