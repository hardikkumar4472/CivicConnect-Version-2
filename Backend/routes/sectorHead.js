import express from 'express';
import Admin from '../models/Admin.js';
import { registerSectorHead, loginSectorHead, forgotPasswordSectorHead, resetPasswordSectorHead, getAllIssuesInSector } from '../controllers/sectorHeadController.js';
import { protect } from '../middleware/auth.js';  
import authSectorHead from '../middleware/authSectorHead.js';
import { getSectorDashboardSummary } from '../controllers/sectorHeadController.js';
import { getSectorAnalytics } from '../controllers/analyticsController.js';
import { getSectorHeadDetails } from '../controllers/sectorHeadController.js';
import { sendBroadcastEmailSectorHead } from '../controllers/sectorHeadController.js';
import { getCitizensWithIssuesBySector } from '../controllers/sectorHeadController.js';
// import { getSectorAverageRating } from '../controllers/sectorHeadController.js';
// import { getCitizenDetails } from '../controllers/sectorHeadController.js';
import { getSectorWiseRatings } from '../controllers/sectorHeadController.js';
const router = express.Router();
const isAdmin = async (req, res, next) => {
  const user = await Admin.findById(req.user.id);
  if (user) {
    return next();
  } else {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
};
// router.get('/citizen/:id', authSectorHead, getCitizenDetails);
router.get('/dashboard-summary', authSectorHead, getSectorDashboardSummary);
router.post('/register', protect, isAdmin, registerSectorHead);
router.post('/login', loginSectorHead);
router.post('/forgot-password', forgotPasswordSectorHead);
router.post('/reset-password/:token', resetPasswordSectorHead);
router.get('/issues', protect, authSectorHead, getAllIssuesInSector);
router.get('/analytics', protect, authSectorHead, getSectorAnalytics);
router.get("/me", authSectorHead, getSectorHeadDetails);
router.post('/broadcast', authSectorHead, sendBroadcastEmailSectorHead);
router.get('/sector-citizens', authSectorHead, getCitizensWithIssuesBySector);
router.get('/average-rating', authSectorHead, getSectorWiseRatings);

export default router;
