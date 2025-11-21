import { Router } from 'express';
import { updateSettings } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

router.put('/settings', updateSettings);

export default router;
