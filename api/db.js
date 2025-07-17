// Re-export database functions from lib/db.js
export { initDb, addToWaitlist, getWaitlistStats, createEmailCampaign, trackEmailEvent, getReferralLeaderboard } from '../lib/db.js';
export { default as client } from '../lib/db.js'; 