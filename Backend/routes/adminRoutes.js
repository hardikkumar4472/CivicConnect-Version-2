import express from 'express';
import { protect } from '../middleware/auth.js';
import { sendBroadcastEmail } from '../controllers/adminController.js';
import { getDashboardSummary } from '../controllers/adminController.js';
import { exportAllIssues } from '../controllers/adminController.js';
import { getAdminProfile } from '../controllers/adminController.js';
const router = express.Router();
router.post('/broadcast', protect, sendBroadcastEmail);
router.get('/dashboard-summary', protect, getDashboardSummary);
router.get('/export-issues', protect, exportAllIssues);
router.get("/profile", protect, getAdminProfile);
export default router;







