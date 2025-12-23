/**
 * Student Controller
 * Handles HTTP requests for student management
 */

import { Request, Response } from 'express';
import { studentRepository } from '../repositories';
import {
  createStudentSchema,
  updateStudentSchema,
  studentQuerySchema,
  studentIdSchema,
} from '../validators';

export class StudentController {
  /**
   * Get all students with optional filters
   * GET /api/v1/students
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const { error, value } = studentQuerySchema.validate(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const { schoolYearId, gradeLevelId, search, limit, offset } = value;

      // Get students
      const students = await studentRepository.findAll({
        schoolYearId,
        gradeLevelId,
        search,
        limit,
        offset,
      });

      // Get total count
      const total = await studentRepository.count({
        schoolYearId,
        gradeLevelId,
        search,
      });

      res.status(200).json({
        success: true,
        data: students,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + students.length < total,
        },
      });
    } catch (error: any) {
      console.error('Error getting students:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar alunos',
        error: error.message,
      });
    }
  }

  /**
   * Get student by ID
   * GET /api/v1/students/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      // Validate ID
      const { error, value } = studentIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const student = await studentRepository.findById(value.id);

      if (!student) {
        res.status(404).json({
          success: false,
          message: 'Aluno não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: student,
      });
    } catch (error: any) {
      console.error('Error getting student:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar aluno',
        error: error.message,
      });
    }
  }

  /**
   * Create new student
   * POST /api/v1/students
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = createStudentSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      // Check for duplicate external ID if provided
      if (value.externalId) {
        const existing = await studentRepository.findByExternalId(value.externalId);
        if (existing) {
          res.status(409).json({
            success: false,
            message: 'Já existe um aluno com este ID externo',
          });
          return;
        }
      }

      const student = await studentRepository.create(value);

      res.status(201).json({
        success: true,
        message: 'Aluno criado com sucesso',
        data: student,
      });
    } catch (error: any) {
      console.error('Error creating student:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar aluno',
        error: error.message,
      });
    }
  }

  /**
   * Update student
   * PUT /api/v1/students/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      // Validate ID
      const { error: idError, value: idValue } = studentIdSchema.validate({
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
      const { error, value } = updateStudentSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      // Check if student exists
      const existing = await studentRepository.findById(idValue.id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: 'Aluno não encontrado',
        });
        return;
      }

      // Check for duplicate external ID if being updated
      if (value.externalId && value.externalId !== existing.externalId) {
        const duplicate = await studentRepository.findByExternalId(value.externalId);
        if (duplicate && duplicate.id !== idValue.id) {
          res.status(409).json({
            success: false,
            message: 'Já existe um aluno com este ID externo',
          });
          return;
        }
      }

      const updated = await studentRepository.update(idValue.id, value);

      res.status(200).json({
        success: true,
        message: 'Aluno atualizado com sucesso',
        data: updated,
      });
    } catch (error: any) {
      console.error('Error updating student:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar aluno',
        error: error.message,
      });
    }
  }

  /**
   * Delete student
   * DELETE /api/v1/students/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      // Validate ID
      const { error, value } = studentIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const deleted = await studentRepository.delete(value.id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Aluno não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Aluno deletado com sucesso',
      });
    } catch (error: any) {
      console.error('Error deleting student:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao deletar aluno',
        error: error.message,
      });
    }
  }
}

export default new StudentController();
