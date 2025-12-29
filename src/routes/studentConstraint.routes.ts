/**
 * Student Constraint Routes
 * API routes for student pairwise constraints (SEPARATE/GROUP)
 */

import { Router } from 'express';
import { studentConstraintController } from '../controllers/studentConstraint.controller';

const router = Router();

router.get('/', (req, res) => studentConstraintController.getAll(req, res));
router.get('/student/:studentId', (req, res) => studentConstraintController.getByStudentId(req, res));
router.get('/stats/:schoolYearId', (req, res) => studentConstraintController.getStats(req, res));
router.get('/:id', (req, res) => studentConstraintController.getById(req, res));
router.post('/', (req, res) => studentConstraintController.create(req, res));
router.put('/:id', (req, res) => studentConstraintController.update(req, res));
router.delete('/:id', (req, res) => studentConstraintController.delete(req, res));

export default router;
