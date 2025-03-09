import { CreditService } from '../services/creditService';
const cron = require('node-cron');


/**
 * Resets daily credits for all users
 * This script is meant to be run daily at midnight
 */
async function resetDailyCredits() {
  try {
    console.log('Starting daily credit reset...');
    const updatedCount = await CreditService.resetAllDailyCredits();
    console.log(`Daily credits reset for ${updatedCount} users.`);
  } catch (error) {
    console.error('Error resetting daily credits:', error);
  }
}

// Schedule a job to run every day at midnight
cron.schedule('0 0 * * *', () => {
    console.log('Resetting daily credits:', new Date().toLocaleString());
    resetDailyCredits();
});

