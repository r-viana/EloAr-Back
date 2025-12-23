/**
 * Student Routes
 * API routes for student management
 */

import { Router } from 'express';
import { studentController } from '../controllers';

const router = Router();

/**
 * @route   GET /api/v1/students
 * @desc    Get all students with optional filters
 * @query   schoolYearId, gradeLevelId, search, limit, offset
 * @access  Private
 */
router.get('/', (req, res) => studentController.getAll(req, res));

/**
 * @route   GET /api/v1/students/:id
 * @desc    Get student by ID
 * @access  Private
 */
router.get('/:id', (req, res) => studentController.getById(req, res));

/**
 * @route   POST /api/v1/students
 * @desc    Create new student
 * @access  Private
 */
router.post('/', (req, res) => studentController.create(req, res));

/**
 * @route   PUT /api/v1/students/:id
 * @desc    Update student
 * @access  Private
 */
router.put('/:id', (req, res) => studentController.update(req, res));

/**
 * @route   DELETE /api/v1/students/:id
 * @desc    Delete student
 * @access  Private
 */
router.delete('/:id', (req, res) => studentController.delete(req, res));

export default router;
