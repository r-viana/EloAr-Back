/**
 * Import Controller
 * Handles CSV/Excel file import requests
 */

import { Request, Response } from 'express';
import importService from '../services/import.service';
import { importFileSchema, validateFileSchema } from '../validators';

export class ImportController {
  /**
   * Validate import file (preview mode)
   * POST /api/v1/import/validate
   */
  async validate(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Nenhum arquivo foi enviado',
        });
        return;
      }

      // Validate request body
      const { error, value } = validateFileSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const { fileType } = value;

      // Validate file
      let result;
      if (fileType === 'csv') {
        result = await importService.validateImport(
          req.file.buffer.toString('utf-8'),
          'csv'
        );
      } else {
        result = await importService.validateImport(req.file.buffer, 'excel');
      }

      res.status(200).json({
        success: true,
        message: result.valid ? 'Arquivo válido' : 'Arquivo contém erros',
        data: result,
      });
    } catch (error: any) {
      console.error('Error validating import file:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao validar arquivo',
        error: error.message,
      });
    }
  }

  /**
   * Import students from CSV
   * POST /api/v1/import/csv
   */
  async importCSV(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Nenhum arquivo CSV foi enviado',
        });
        return;
      }

      // Validate request body
      const { error, value } = importFileSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const { schoolYearId, gradeLevelId, replaceExisting } = value;

      // Import CSV
      const result = await importService.importCSV(
        req.file.buffer.toString('utf-8'),
        schoolYearId,
        gradeLevelId,
        { replaceExisting }
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Erro ao importar alunos',
          data: result,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `${result.successCount} aluno(s) importado(s) com sucesso`,
        data: result,
      });
    } catch (error: any) {
      console.error('Error importing CSV:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao importar arquivo CSV',
        error: error.message,
      });
    }
  }

  /**
   * Import students from Excel
   * POST /api/v1/import/excel
   */
  async importExcel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Nenhum arquivo Excel foi enviado',
        });
        return;
      }

      // Validate request body
      const { error, value } = importFileSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const { schoolYearId, gradeLevelId, replaceExisting } = value;

      // Import Excel
      const result = await importService.importExcel(
        req.file.buffer,
        schoolYearId,
        gradeLevelId,
        { replaceExisting }
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Erro ao importar alunos',
          data: result,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `${result.successCount} aluno(s) importado(s) com sucesso`,
        data: result,
      });
    } catch (error: any) {
      console.error('Error importing Excel:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao importar arquivo Excel',
        error: error.message,
      });
    }
  }
}

export default new ImportController();
