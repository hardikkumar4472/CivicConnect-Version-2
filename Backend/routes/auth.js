import express from 'express';
import { registerAdmin, loginAdmin } from '../controllers/authController.js';

import { registerSectorHead, loginSectorHead} from '../controllers/sectorHeadController.js';
const router = express.Router();
router.post('/admin', registerAdmin);
router.post('/login', loginAdmin);
export default router;
