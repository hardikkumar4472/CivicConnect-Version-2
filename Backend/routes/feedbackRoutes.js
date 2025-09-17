import express from 'express';
import { submitFeedback } from '../controllers/feedbackController.js';
import authCitizen from '../middleware/authCitizen.js';
import { protect } from '../middleware/auth.js';
import { getSectorWiseRatings } from '../controllers/feedbackController.js';
const router = express.Router();
router.post('/submit', authCitizen, submitFeedback);
router.get("/sector-ratings",  protect ,getSectorWiseRatings);
export default router;
