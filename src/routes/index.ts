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
import studentPreferenceRoutes from './studentPreference.routes';
import studentConstraintRoutes from './studentConstraint.routes';
import siblingRuleRoutes from './siblingRule.routes';
import constraintTypeRoutes from './constraintType.routes';
import configurationRoutes from './configuration.routes';
import distributionRoutes from './distribution.routes';

const router = Router();

// Mount routes
router.use('/students', studentRoutes);
router.use('/classes', classRoutes);
router.use('/school-years', schoolYearRoutes);
router.use('/grade-levels', gradeLevelRoutes);
router.use('/import', importRoutes);
router.use('/student-preferences', studentPreferenceRoutes);
router.use('/student-constraints', studentConstraintRoutes);
router.use('/sibling-rules', siblingRuleRoutes);
router.use('/constraint-types', constraintTypeRoutes);
router.use('/configurations', configurationRoutes);
router.use('/distributions', distributionRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;
