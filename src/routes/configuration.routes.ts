/**
 * Configuration Routes
 * API endpoints for configuration management
 */

import { Router } from 'express';
import configurationController from '../controllers/configuration.controller';

const router = Router();

/**
 * GET /api/v1/configurations
 * Get all configurations
 */
router.get('/', configurationController.getAll.bind(configurationController));

/**
 * GET /api/v1/configurations/active
 * Get active (default) configuration
 * IMPORTANT: This must come before /:id route
 */
router.get('/active', configurationController.getActive.bind(configurationController));

/**
 * GET /api/v1/configurations/stats
 * Get configuration statistics
 * IMPORTANT: This must come before /:id route
 */
router.get('/stats', configurationController.getStats.bind(configurationController));

/**
 * GET /api/v1/configurations/:id
 * Get configuration by ID
 */
router.get('/:id', configurationController.getById.bind(configurationController));

/**
 * POST /api/v1/configurations
 * Create new configuration
 */
router.post('/', configurationController.create.bind(configurationController));

/**
 * PUT /api/v1/configurations/:id
 * Update configuration
 */
router.put('/:id', configurationController.update.bind(configurationController));

/**
 * POST /api/v1/configurations/:id/set-default
 * Set configuration as default
 */
router.post('/:id/set-default', configurationController.setAsDefault.bind(configurationController));

/**
 * DELETE /api/v1/configurations/:id
 * Delete configuration (cannot delete default configuration)
 */
router.delete('/:id', configurationController.delete.bind(configurationController));

export default router;
