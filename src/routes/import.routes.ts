/**
 * Import Routes
 * API routes for CSV/Excel import
 */

import { Router } from 'express';
import multer from 'multer';
import { importController } from '../controllers';

const router = Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Tipo de arquivo inválido. Apenas CSV e Excel (.xlsx, .xls) são permitidos.'
        )
      );
    }
  },
});

/**
 * @route   POST /api/v1/import/validate
 * @desc    Validate import file (preview mode)
 * @body    fileType (csv | excel)
 * @file    file (CSV or Excel)
 * @access  Private
 */
router.post('/validate', upload.single('file'), (req, res) =>
  importController.validate(req, res)
);

/**
 * @route   POST /api/v1/import/csv
 * @desc    Import students from CSV
 * @body    schoolYearId, gradeLevelId, replaceExisting
 * @file    file (CSV)
 * @access  Private
 */
router.post('/csv', upload.single('file'), (req, res) =>
  importController.importCSV(req, res)
);

/**
 * @route   POST /api/v1/import/excel
 * @desc    Import students from Excel
 * @body    schoolYearId, gradeLevelId, replaceExisting
 * @file    file (Excel)
 * @access  Private
 */
router.post('/excel', upload.single('file'), (req, res) =>
  importController.importExcel(req, res)
);

export default router;
