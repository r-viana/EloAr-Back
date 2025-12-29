/**
 * Sibling Rule Routes
 * API routes for sibling allocation rules
 */

import { Router } from 'express';
import { siblingRuleController } from '../controllers/siblingRule.controller';

const router = Router();

router.get('/', (req, res) => siblingRuleController.getAll(req, res));
router.get('/student/:studentId', (req, res) => siblingRuleController.getByStudentId(req, res));
router.get('/stats/:schoolYearId', (req, res) => siblingRuleController.getStats(req, res));
router.get('/:id', (req, res) => siblingRuleController.getById(req, res));
router.post('/', (req, res) => siblingRuleController.create(req, res));
router.put('/:id', (req, res) => siblingRuleController.update(req, res));
router.delete('/:id', (req, res) => siblingRuleController.delete(req, res));

export default router;
