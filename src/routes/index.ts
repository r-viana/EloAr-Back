/**
 * Routes Index
 * Central router configuration
 */

import { Router } from 'express';
import studentRoutes from './student.routes';
import classRoutes from './class.routes';
import schoolYearRoutes from './schoolYear.routes';
import gradeLevelRoutes from './gradeLevel.routes';
import importRoutes from './import.routes';

const router = Router();

// Mount routes
router.use('/students', studentRoutes);
router.use('/classes', classRoutes);
router.use('/school-years', schoolYearRoutes);
router.use('/grade-levels', gradeLevelRoutes);
router.use('/import', importRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;
