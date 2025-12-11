/**
 * Routes pour les templates de rapports
 */

import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import * as templatesController from '../controllers/templates.controller';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes CRUD
router.get('/', templatesController.getTemplates);
router.get('/:id', templatesController.getTemplate);
router.post('/', templatesController.createTemplate);
router.put('/:id', templatesController.updateTemplate);
router.delete('/:id', templatesController.deleteTemplate);

// Routes spéciales
router.post('/:id/preview', templatesController.previewTemplate);
router.post('/init-defaults', templatesController.initDefaultTemplates);

export default router;
