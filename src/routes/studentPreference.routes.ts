/**
 * Student Preference Routes
 * API routes for student social preferences
 */

import { Router } from 'express';
import { studentPreferenceController } from '../controllers/studentPreference.controller';

const router = Router();

/**
 * @route   GET /api/v1/student-preferences
 * @desc    Get all preferences with optional filters
 * @query   studentId, preferredStudentId, priority, schoolYearId, gradeLevelId
 * @access  Private
 */
router.get('/', (req, res) => studentPreferenceController.getAll(req, res));

/**
 * @route   GET /api/v1/student-preferences/student/:studentId
 * @desc    Get preferences by student ID
 * @access  Private
 */
router.get('/student/:studentId', (req, res) => studentPreferenceController.getByStudentId(req, res));

/**
 * @route   PUT /api/v1/student-preferences/student/:studentId/bulk
 * @desc    Bulk update preferences for a student (replaces all)
 * @access  Private
 */
router.put('/student/:studentId/bulk', (req, res) => studentPreferenceController.bulkUpdate(req, res));

/**
 * @route   GET /api/v1/student-preferences/:id
 * @desc    Get preference by ID
 * @access  Private
 */
router.get('/:id', (req, res) => studentPreferenceController.getById(req, res));

/**
 * @route   POST /api/v1/student-preferences
 * @desc    Create new preference
 * @access  Private
 */
router.post('/', (req, res) => studentPreferenceController.create(req, res));

/**
 * @route   PUT /api/v1/student-preferences/:id
 * @desc    Update preference
 * @access  Private
 */
router.put('/:id', (req, res) => studentPreferenceController.update(req, res));

/**
 * @route   DELETE /api/v1/student-preferences/:id
 * @desc    Delete preference
 * @access  Private
 */
router.delete('/:id', (req, res) => studentPreferenceController.delete(req, res));

export default router;
