import { CreditService } from '../services/creditService';

/**
 * Resets daily credits for all users
 * This script is meant to be run daily at midnight
 */
async function resetDailyCredits() {
  try {
    console.log('Starting daily credit reset...');
    const updatedCount = await CreditService.resetAllDailyCredits();
    console.log(`Daily credits reset for ${updatedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Error resetting daily credits:', error);
    process.exit(1);
  }
}

// Run reset
resetDailyCredits();
