import express from 'express';
import { loginCitizen, forgotPasswordCitizen, resetPasswordCitizen, registerCitizen } from '../controllers/citizenController.js';
import { protect } from '../middleware/auth.js'; 
import authSectorHead from '../middleware/authSectorHead.js';
import { getCitizenProfile } from '../controllers/citizenController.js';
import authCitizen from '../middleware/authCitizen.js';

const router = express.Router();

router.post('/register', authSectorHead, registerCitizen);
router.post('/login', loginCitizen);
router.post('/forgot-password', forgotPasswordCitizen);
router.post('/reset-password/:token', resetPasswordCitizen);
router.get('/me', authCitizen, getCitizenProfile); 

export default router;
