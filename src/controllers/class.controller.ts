/**
 * Class Controller
 * Handles HTTP requests for class management
 */

import { Request, Response } from 'express';
import { classRepository } from '../repositories';
import {
  createClassSchema,
  updateClassSchema,
  classQuerySchema,
  classIdSchema,
} from '../validators';

export class ClassController {
  /**
   * Get all classes with optional filters
   * GET /api/v1/classes
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const { error, value } = classQuerySchema.validate(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const { schoolYearId, gradeLevelId } = value;

      const classes = await classRepository.findAll({
        schoolYearId,
        gradeLevelId,
      });

      res.status(200).json({
        success: true,
        data: classes,
      });
    } catch (error: any) {
      console.error('Error getting classes:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar turmas',
        error: error.message,
      });
    }
  }

  /**
   * Get class by ID
   * GET /api/v1/classes/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      // Validate ID
      const { error, value } = classIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const classData = await classRepository.findById(value.id);

      if (!classData) {
        res.status(404).json({
          success: false,
          message: 'Turma não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: classData,
      });
    } catch (error: any) {
      console.error('Error getting class:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar turma',
        error: error.message,
      });
    }
  }

  /**
   * Create new class
   * POST /api/v1/classes
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = createClassSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const classData = await classRepository.create(value);

      res.status(201).json({
        success: true,
        message: 'Turma criada com sucesso',
        data: classData,
      });
    } catch (error: any) {
      console.error('Error creating class:', error);

      // Check for unique constraint violation
      if (error.code === '23505') {
        res.status(409).json({
          success: false,
          message: 'Já existe uma turma com esta seção para este ano letivo e série',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao criar turma',
        error: error.message,
      });
    }
  }

  /**
   * Update class
   * PUT /api/v1/classes/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      // Validate ID
      const { error: idError, value: idValue } = classIdSchema.validate({
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
      const { error, value } = updateClassSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      // Check if class exists
      const existing = await classRepository.findById(idValue.id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: 'Turma não encontrada',
        });
        return;
      }

      const updated = await classRepository.update(idValue.id, value);

      res.status(200).json({
        success: true,
        message: 'Turma atualizada com sucesso',
        data: updated,
      });
    } catch (error: any) {
      console.error('Error updating class:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar turma',
        error: error.message,
      });
    }
  }

  /**
   * Delete class
   * DELETE /api/v1/classes/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      // Validate ID
      const { error, value } = classIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const deleted = await classRepository.delete(value.id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Turma não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Turma deletada com sucesso',
      });
    } catch (error: any) {
      console.error('Error deleting class:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao deletar turma',
        error: error.message,
      });
    }
  }

  /**
   * Get class availability
   * GET /api/v1/classes/:id/availability
   */
  async getAvailability(req: Request, res: Response): Promise<void> {
    try {
      // Validate ID
      const { error, value } = classIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const availability = await classRepository.getAvailability(value.id);

      res.status(200).json({
        success: true,
        data: { available: availability },
      });
    } catch (error: any) {
      console.error('Error getting class availability:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar disponibilidade da turma',
        error: error.message,
      });
    }
  }
}

export default new ClassController();
