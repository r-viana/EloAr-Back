import { Router } from 'express';
import { GradeLevelController } from '../controllers/gradeLevel.controller';

const router = Router();
const gradeLevelController = new GradeLevelController();

// GET /api/v1/grade-levels - Get all grade levels
router.get('/', (_req, res) => gradeLevelController.getAll(_req, res));

// GET /api/v1/grade-levels/:id - Get a single grade level by ID
router.get('/:id', (req, res) => gradeLevelController.getById(req, res));

export default router;
