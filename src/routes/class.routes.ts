/**
 * Class Routes
 * API routes for class management
 */

import { Router } from 'express';
import { classController } from '../controllers';

const router = Router();

/**
 * @route   GET /api/v1/classes
 * @desc    Get all classes with optional filters
 * @query   schoolYearId, gradeLevelId
 * @access  Private
 */
router.get('/', (req, res) => classController.getAll(req, res));

/**
 * @route   GET /api/v1/classes/:id
 * @desc    Get class by ID
 * @access  Private
 */
router.get('/:id', (req, res) => classController.getById(req, res));

/**
 * @route   GET /api/v1/classes/:id/availability
 * @desc    Get class availability (capacity - current_count)
 * @access  Private
 */
router.get('/:id/availability', (req, res) =>
  classController.getAvailability(req, res)
);

/**
 * @route   POST /api/v1/classes
 * @desc    Create new class
 * @access  Private
 */
router.post('/', (req, res) => classController.create(req, res));

/**
 * @route   PUT /api/v1/classes/:id
 * @desc    Update class
 * @access  Private
 */
router.put('/:id', (req, res) => classController.update(req, res));

/**
 * @route   DELETE /api/v1/classes/:id
 * @desc    Delete class
 * @access  Private
 */
router.delete('/:id', (req, res) => classController.delete(req, res));

export default router;
