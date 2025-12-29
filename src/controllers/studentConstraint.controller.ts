/**
 * Student Constraint Controller
 * Handles HTTP requests for student pairwise constraints (SEPARATE/GROUP)
 */

import { Request, Response } from 'express';
import { studentConstraintRepository } from '../repositories/studentConstraint.repository';
import {
  createStudentConstraintSchema,
  updateStudentConstraintSchema,
  studentConstraintQuerySchema,
  studentConstraintIdSchema,
} from '../validators/studentConstraint.validator';

export class StudentConstraintController {
  /**
   * Get all constraints with optional filters
   * GET /api/v1/student-constraints
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = studentConstraintQuerySchema.validate(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const constraints = await studentConstraintRepository.findAll(value);

      res.status(200).json({
        success: true,
        message: 'Restrições recuperadas com sucesso',
        data: constraints,
      });
    } catch (error: any) {
      console.error('Error getting constraints:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar restrições',
        error: error.message,
      });
    }
  }

  /**
   * Get constraint by ID
   * GET /api/v1/student-constraints/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = studentConstraintIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const constraint = await studentConstraintRepository.findById(value.id);

      if (!constraint) {
        res.status(404).json({
          success: false,
          message: 'Restrição não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: constraint,
      });
    } catch (error: any) {
      console.error('Error getting constraint:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar restrição',
        error: error.message,
      });
    }
  }

  /**
   * Get constraints by student ID
   * GET /api/v1/student-constraints/student/:studentId
   */
  async getByStudentId(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);
      const schoolYearId = req.query.schoolYearId ? parseInt(req.query.schoolYearId as string) : undefined;

      if (isNaN(studentId)) {
        res.status(400).json({
          success: false,
          message: 'ID do aluno inválido',
        });
        return;
      }

      const constraints = await studentConstraintRepository.findByStudentId(studentId, schoolYearId);

      res.status(200).json({
        success: true,
        message: 'Restrições do aluno recuperadas com sucesso',
        data: constraints,
      });
    } catch (error: any) {
      console.error('Error getting student constraints:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar restrições do aluno',
        error: error.message,
      });
    }
  }

  /**
   * Create new constraint
   * POST /api/v1/student-constraints
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createStudentConstraintSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      // Check if students are the same
      if (value.studentAId === value.studentBId) {
        res.status(400).json({
          success: false,
          message: 'Não é possível criar uma restrição entre o mesmo aluno',
        });
        return;
      }

      // Check if constraint already exists
      const exists = await studentConstraintRepository.exists(
        value.schoolYearId,
        value.studentAId,
        value.studentBId
      );

      if (exists) {
        res.status(409).json({
          success: false,
          message: 'Esta restrição já existe',
        });
        return;
      }

      const constraint = await studentConstraintRepository.create(value);

      res.status(201).json({
        success: true,
        message: 'Restrição criada com sucesso',
        data: constraint,
      });
    } catch (error: any) {
      console.error('Error creating constraint:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar restrição',
        error: error.message,
      });
    }
  }

  /**
   * Update constraint
   * PUT /api/v1/student-constraints/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { error: idError, value: idValue } = studentConstraintIdSchema.validate({ id: req.params.id });
      if (idError) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: idError.details.map((d) => d.message),
        });
        return;
      }

      const { error: bodyError, value: bodyValue } = updateStudentConstraintSchema.validate(req.body);
      if (bodyError) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: bodyError.details.map((d) => d.message),
        });
        return;
      }

      const constraint = await studentConstraintRepository.update(idValue.id, bodyValue);

      if (!constraint) {
        res.status(404).json({
          success: false,
          message: 'Restrição não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Restrição atualizada com sucesso',
        data: constraint,
      });
    } catch (error: any) {
      console.error('Error updating constraint:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar restrição',
        error: error.message,
      });
    }
  }

  /**
   * Delete constraint
   * DELETE /api/v1/student-constraints/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = studentConstraintIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const deleted = await studentConstraintRepository.delete(value.id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Restrição não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Restrição excluída com sucesso',
      });
    } catch (error: any) {
      console.error('Error deleting constraint:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir restrição',
        error: error.message,
      });
    }
  }

  /**
   * Get statistics about constraints
   * GET /api/v1/student-constraints/stats/:schoolYearId
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const schoolYearId = parseInt(req.params.schoolYearId);
      if (isNaN(schoolYearId)) {
        res.status(400).json({
          success: false,
          message: 'ID do ano letivo inválido',
        });
        return;
      }

      const separateCount = await studentConstraintRepository.countByType(schoolYearId, 'SEPARATE');
      const groupCount = await studentConstraintRepository.countByType(schoolYearId, 'GROUP');

      res.status(200).json({
        success: true,
        data: {
          separate: separateCount,
          group: groupCount,
          total: separateCount + groupCount,
        },
      });
    } catch (error: any) {
      console.error('Error getting constraint stats:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas de restrições',
        error: error.message,
      });
    }
  }
}

export const studentConstraintController = new StudentConstraintController();
