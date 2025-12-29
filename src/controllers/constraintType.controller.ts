/**
 * Constraint Type Controller
 * Handles HTTP requests for constraint types (read-only)
 */

import { Request, Response } from 'express';
import { constraintTypeRepository } from '../repositories/constraintType.repository';

export class ConstraintTypeController {
  /**
   * Get all constraint types
   * GET /api/v1/constraint-types
   */
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const types = await constraintTypeRepository.findAll();

      res.status(200).json({
        success: true,
        message: 'Tipos de restrição recuperados com sucesso',
        data: types,
      });
    } catch (error: any) {
      console.error('Error getting constraint types:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar tipos de restrição',
        error: error.message,
      });
    }
  }

  /**
   * Get constraint type by ID
   * GET /api/v1/constraint-types/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
        return;
      }

      const type = await constraintTypeRepository.findById(id);

      if (!type) {
        res.status(404).json({
          success: false,
          message: 'Tipo de restrição não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: type,
      });
    } catch (error: any) {
      console.error('Error getting constraint type:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar tipo de restrição',
        error: error.message,
      });
    }
  }
}

export const constraintTypeController = new ConstraintTypeController();
