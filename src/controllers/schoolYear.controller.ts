/**
 * SchoolYear Controller
 * Handles HTTP requests for school year management
 */

import { Request, Response } from 'express';
import { schoolYearRepository } from '../repositories';
import {
  createSchoolYearSchema,
  updateSchoolYearSchema,
  schoolYearIdSchema,
} from '../validators';

export class SchoolYearController {
  /**
   * Get all school years
   * GET /api/v1/school-years
   */
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const schoolYears = await schoolYearRepository.findAll();

      res.status(200).json({
        success: true,
        data: schoolYears,
      });
    } catch (error: any) {
      console.error('Error getting school years:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar anos letivos',
        error: error.message,
      });
    }
  }

  /**
   * Get active school year
   * GET /api/v1/school-years/active
   */
  async getActive(_req: Request, res: Response): Promise<void> {
    try {
      const schoolYear = await schoolYearRepository.findActive();

      if (!schoolYear) {
        res.status(404).json({
          success: false,
          message: 'Nenhum ano letivo ativo encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: schoolYear,
      });
    } catch (error: any) {
      console.error('Error getting active school year:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar ano letivo ativo',
        error: error.message,
      });
    }
  }

  /**
   * Get school year by ID
   * GET /api/v1/school-years/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      // Validate ID
      const { error, value } = schoolYearIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const schoolYear = await schoolYearRepository.findById(value.id);

      if (!schoolYear) {
        res.status(404).json({
          success: false,
          message: 'Ano letivo não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: schoolYear,
      });
    } catch (error: any) {
      console.error('Error getting school year:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar ano letivo',
        error: error.message,
      });
    }
  }

  /**
   * Create new school year
   * POST /api/v1/school-years
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = createSchoolYearSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      // Check for duplicate year
      const existing = await schoolYearRepository.findByYear(value.year);
      if (existing) {
        res.status(409).json({
          success: false,
          message: 'Já existe um ano letivo cadastrado para este ano',
        });
        return;
      }

      const schoolYear = await schoolYearRepository.create(value);

      res.status(201).json({
        success: true,
        message: 'Ano letivo criado com sucesso',
        data: schoolYear,
      });
    } catch (error: any) {
      console.error('Error creating school year:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar ano letivo',
        error: error.message,
      });
    }
  }

  /**
   * Update school year
   * PUT /api/v1/school-years/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      // Validate ID
      const { error: idError, value: idValue } = schoolYearIdSchema.validate({
        id: req.params.id,
      });
      if (idError) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: idError.details.map((d) => d.message),
        });
        return;
      }

      // Validate request body
      const { error, value } = updateSchoolYearSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      // Check if school year exists
      const existing = await schoolYearRepository.findById(idValue.id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: 'Ano letivo não encontrado',
        });
        return;
      }

      // Check for duplicate year if being updated
      if (value.year && value.year !== existing.year) {
        const duplicate = await schoolYearRepository.findByYear(value.year);
        if (duplicate) {
          res.status(409).json({
            success: false,
            message: 'Já existe um ano letivo cadastrado para este ano',
          });
          return;
        }
      }

      const updated = await schoolYearRepository.update(idValue.id, value);

      res.status(200).json({
        success: true,
        message: 'Ano letivo atualizado com sucesso',
        data: updated,
      });
    } catch (error: any) {
      console.error('Error updating school year:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar ano letivo',
        error: error.message,
      });
    }
  }

  /**
   * Set active school year
   * POST /api/v1/school-years/:id/activate
   */
  async setActive(req: Request, res: Response): Promise<void> {
    try {
      // Validate ID
      const { error, value } = schoolYearIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const schoolYear = await schoolYearRepository.setActive(value.id);

      if (!schoolYear) {
        res.status(404).json({
          success: false,
          message: 'Ano letivo não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Ano letivo ativado com sucesso',
        data: schoolYear,
      });
    } catch (error: any) {
      console.error('Error activating school year:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao ativar ano letivo',
        error: error.message,
      });
    }
  }

  /**
   * Delete school year
   * DELETE /api/v1/school-years/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      // Validate ID
      const { error, value } = schoolYearIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const deleted = await schoolYearRepository.delete(value.id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Ano letivo não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Ano letivo deletado com sucesso',
      });
    } catch (error: any) {
      console.error('Error deleting school year:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao deletar ano letivo',
        error: error.message,
      });
    }
  }
}

export default new SchoolYearController();
