/**
 * SchoolYear Routes
 * API routes for school year management
 */

import { Router } from 'express';
import { schoolYearController } from '../controllers';

const router = Router();

/**
 * @route   GET /api/v1/school-years
 * @desc    Get all school years
 * @access  Private
 */
router.get('/', (req, res) => schoolYearController.getAll(req, res));

/**
 * @route   GET /api/v1/school-years/active
 * @desc    Get active school year
 * @access  Private
 */
router.get('/active', (req, res) => schoolYearController.getActive(req, res));

/**
 * @route   GET /api/v1/school-years/:id
 * @desc    Get school year by ID
 * @access  Private
 */
router.get('/:id', (req, res) => schoolYearController.getById(req, res));

/**
 * @route   POST /api/v1/school-years
 * @desc    Create new school year
 * @access  Private
 */
router.post('/', (req, res) => schoolYearController.create(req, res));

/**
 * @route   POST /api/v1/school-years/:id/activate
 * @desc    Set active school year
 * @access  Private
 */
router.post('/:id/activate', (req, res) => schoolYearController.setActive(req, res));

/**
 * @route   PUT /api/v1/school-years/:id
 * @desc    Update school year
 * @access  Private
 */
router.put('/:id', (req, res) => schoolYearController.update(req, res));

/**
 * @route   DELETE /api/v1/school-years/:id
 * @desc    Delete school year
 * @access  Private
 */
router.delete('/:id', (req, res) => schoolYearController.delete(req, res));

export default router;
