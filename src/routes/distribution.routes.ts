/**
 * Distribution Routes
 * API endpoints for distribution management and optimization
 */

import { Router } from 'express';
import distributionController from '../controllers/distribution.controller';

const router = Router();

// Distribution CRUD
router.get('/', distributionController.getAll.bind(distributionController));
router.get('/:id', distributionController.getById.bind(distributionController));
router.post('/', distributionController.create.bind(distributionController));
router.put('/:id', distributionController.update.bind(distributionController));
router.delete('/:id', distributionController.delete.bind(distributionController));

// Optimization endpoints
router.post('/optimize', distributionController.optimize.bind(distributionController));
router.get('/optimize/:runId/status', distributionController.getOptimizationStatus.bind(distributionController));
router.post('/optimize/:runId/cancel', distributionController.cancelOptimization.bind(distributionController));

export default router;
