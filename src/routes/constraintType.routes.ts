/**
 * Constraint Type Routes
 * API routes for constraint types (read-only)
 */

import { Router } from 'express';
import { constraintTypeController } from '../controllers/constraintType.controller';

const router = Router();

router.get('/', (req, res) => constraintTypeController.getAll(req, res));
router.get('/:id', (req, res) => constraintTypeController.getById(req, res));

export default router;
