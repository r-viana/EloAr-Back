/**
 * Student Preference Controller
 * Handles HTTP requests for student social preferences
 */

import { Request, Response } from 'express';
import { studentPreferenceRepository } from '../repositories/studentPreference.repository';
import {
  createStudentPreferenceSchema,
  updateStudentPreferenceSchema,
  studentPreferenceQuerySchema,
  studentPreferenceIdSchema,
  bulkPreferencesSchema,
} from '../validators/studentPreference.validator';

export class StudentPreferenceController {
  /**
   * Get all preferences with optional filters
   * GET /api/v1/student-preferences
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = studentPreferenceQuerySchema.validate(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const preferences = await studentPreferenceRepository.findAll(value);

      res.status(200).json({
        success: true,
        message: 'Preferências recuperadas com sucesso',
        data: preferences,
      });
    } catch (error: any) {
      console.error('Error getting preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar preferências',
        error: error.message,
      });
    }
  }

  /**
   * Get preference by ID
   * GET /api/v1/student-preferences/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = studentPreferenceIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const preference = await studentPreferenceRepository.findById(value.id);

      if (!preference) {
        res.status(404).json({
          success: false,
          message: 'Preferência não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: preference,
      });
    } catch (error: any) {
      console.error('Error getting preference:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar preferência',
        error: error.message,
      });
    }
  }

  /**
   * Get preferences by student ID
   * GET /api/v1/student-preferences/student/:studentId
   */
  async getByStudentId(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);
      if (isNaN(studentId)) {
        res.status(400).json({
          success: false,
          message: 'ID do aluno inválido',
        });
        return;
      }

      const preferences = await studentPreferenceRepository.findByStudentId(studentId);

      res.status(200).json({
        success: true,
        message: 'Preferências do aluno recuperadas com sucesso',
        data: preferences,
      });
    } catch (error: any) {
      console.error('Error getting student preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar preferências do aluno',
        error: error.message,
      });
    }
  }

  /**
   * Create new preference
   * POST /api/v1/student-preferences
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createStudentPreferenceSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      // Check if student is trying to prefer themselves
      if (value.studentId === value.preferredStudentId) {
        res.status(400).json({
          success: false,
          message: 'Um aluno não pode escolher a si mesmo como preferência',
        });
        return;
      }

      // Check if preference already exists
      const exists = await studentPreferenceRepository.exists(value.studentId, value.preferredStudentId);
      if (exists) {
        res.status(409).json({
          success: false,
          message: 'Esta preferência já existe',
        });
        return;
      }

      // Check if student already has 3 preferences
      const count = await studentPreferenceRepository.countByStudentId(value.studentId);
      if (count >= 3) {
        res.status(400).json({
          success: false,
          message: 'O aluno já possui 3 preferências. Remova uma antes de adicionar outra.',
        });
        return;
      }

      const preference = await studentPreferenceRepository.create(value);

      res.status(201).json({
        success: true,
        message: 'Preferência criada com sucesso',
        data: preference,
      });
    } catch (error: any) {
      console.error('Error creating preference:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar preferência',
        error: error.message,
      });
    }
  }

  /**
   * Update preference
   * PUT /api/v1/student-preferences/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { error: idError, value: idValue } = studentPreferenceIdSchema.validate({ id: req.params.id });
      if (idError) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: idError.details.map((d) => d.message),
        });
        return;
      }

      const { error: bodyError, value: bodyValue } = updateStudentPreferenceSchema.validate(req.body);
      if (bodyError) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: bodyError.details.map((d) => d.message),
        });
        return;
      }

      const preference = await studentPreferenceRepository.update(idValue.id, bodyValue);

      if (!preference) {
        res.status(404).json({
          success: false,
          message: 'Preferência não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Preferência atualizada com sucesso',
        data: preference,
      });
    } catch (error: any) {
      console.error('Error updating preference:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar preferência',
        error: error.message,
      });
    }
  }

  /**
   * Delete preference
   * DELETE /api/v1/student-preferences/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = studentPreferenceIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const deleted = await studentPreferenceRepository.delete(value.id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Preferência não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Preferência excluída com sucesso',
      });
    } catch (error: any) {
      console.error('Error deleting preference:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir preferência',
        error: error.message,
      });
    }
  }

  /**
   * Bulk update preferences for a student (replaces all)
   * PUT /api/v1/student-preferences/student/:studentId/bulk
   */
  async bulkUpdate(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId);
      if (isNaN(studentId)) {
        res.status(400).json({
          success: false,
          message: 'ID do aluno inválido',
        });
        return;
      }

      const { error, value } = bulkPreferencesSchema.validate({
        ...req.body,
        studentId,
      });

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      // Check if student is trying to prefer themselves
      const selfPreference = value.preferences.some(
        (p: any) => p.preferredStudentId === studentId
      );

      if (selfPreference) {
        res.status(400).json({
          success: false,
          message: 'Um aluno não pode escolher a si mesmo como preferência',
        });
        return;
      }

      const preferences = await studentPreferenceRepository.bulkCreateForStudent(
        studentId,
        value.preferences
      );

      res.status(200).json({
        success: true,
        message: 'Preferências atualizadas com sucesso',
        data: preferences,
      });
    } catch (error: any) {
      console.error('Error bulk updating preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar preferências',
        error: error.message,
      });
    }
  }
}

export const studentPreferenceController = new StudentPreferenceController();
