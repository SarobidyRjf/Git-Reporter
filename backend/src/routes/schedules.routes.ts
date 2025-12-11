/**
 * Routes pour les rapports planifiés
 */

import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import * as schedulesController from '../controllers/schedules.controller';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes CRUD
router.get('/', schedulesController.getSchedules);
router.get('/status', schedulesController.getSchedulerStatus);
router.get('/:id', schedulesController.getSchedule);
router.post('/', schedulesController.createSchedule);
router.put('/:id', schedulesController.updateSchedule);
router.delete('/:id', schedulesController.deleteSchedule);

// Routes d'actions
router.patch('/:id/toggle', schedulesController.toggleSchedule);
router.post('/:id/run', schedulesController.runSchedule);

export default router;
