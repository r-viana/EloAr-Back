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

  /**
   * Validate CSV import of preferences
   * POST /api/v1/student-preferences/import/validate
   */
  async validateImport(req: Request, res: Response): Promise<void> {
    try {
      const { csvData, schoolYearId, gradeLevelId } = req.body;

      if (!csvData || !schoolYearId || !gradeLevelId) {
        res.status(400).json({
          success: false,
          message: 'CSV data, schoolYearId e gradeLevelId são obrigatórios',
        });
        return;
      }

      const rows = csvData.trim().split('\n');
      const errors: Array<{ row: number; field: string; message: string }> = [];
      const validPreferences: any[] = [];

      // Skip header
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        const columns = row.split(',').map((col: string) => col.trim());

        if (columns.length < 3) {
          errors.push({
            row: i + 1,
            field: 'general',
            message: 'Linha incompleta. Esperado: aluno, alunoPreferido, prioridade',
          });
          continue;
        }

        const [studentIdentifier, preferredStudentIdentifier, priorityStr] = columns;

        // Validate priority
        const priority = parseInt(priorityStr);
        if (isNaN(priority) || priority < 1 || priority > 3) {
          errors.push({
            row: i + 1,
            field: 'prioridade',
            message: 'Prioridade deve ser 1, 2 ou 3',
          });
          continue;
        }

        validPreferences.push({
          studentIdentifier,
          preferredStudentIdentifier,
          priority,
          row: i + 1,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Validação concluída',
        data: {
          valid: errors.length === 0,
          totalRows: rows.length - 1,
          validRows: validPreferences.length,
          errors,
          preview: validPreferences.slice(0, 5),
        },
      });
    } catch (error: any) {
      console.error('Error validating import:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao validar importação',
        error: error.message,
      });
    }
  }

  /**
   * Import preferences from CSV
   * POST /api/v1/student-preferences/import
   */
  async import(req: Request, res: Response): Promise<void> {
    try {
      const { csvData, schoolYearId, gradeLevelId, replaceExisting } = req.body;

      if (!csvData || !schoolYearId || !gradeLevelId) {
        res.status(400).json({
          success: false,
          message: 'CSV data, schoolYearId e gradeLevelId são obrigatórios',
        });
        return;
      }

      const rows = csvData.trim().split('\n');
      const errors: Array<{ row: number; field: string; message: string }> = [];
      let successCount = 0;
      let skippedCount = 0;

      // Get all students for this school year and grade level
      const students = await studentPreferenceRepository.getAllStudentsForYearAndGrade(
        schoolYearId,
        gradeLevelId
      );

      // Create lookup maps
      const studentsByExternalId = new Map(
        students.map((s: any) => [s.externalId?.toLowerCase(), s])
      );
      const studentsByName = new Map(
        students.map((s: any) => [s.fullName?.toLowerCase(), s])
      );

      // If replacing existing, delete all preferences for this grade/year
      if (replaceExisting) {
        await studentPreferenceRepository.deleteBySchoolYearAndGrade(schoolYearId, gradeLevelId);
      }

      // Skip header
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        const columns = row.split(',').map((col: string) => col.trim());

        if (columns.length < 3) {
          errors.push({
            row: i + 1,
            field: 'general',
            message: 'Linha incompleta',
          });
          continue;
        }

        const [studentIdentifier, preferredStudentIdentifier, priorityStr] = columns;
        const priority = parseInt(priorityStr);

        // Find student by external ID or name
        let student = studentsByExternalId.get(studentIdentifier.toLowerCase());
        if (!student) {
          student = studentsByName.get(studentIdentifier.toLowerCase());
        }

        if (!student) {
          errors.push({
            row: i + 1,
            field: 'aluno',
            message: `Aluno não encontrado: ${studentIdentifier}`,
          });
          continue;
        }

        // Find preferred student
        let preferredStudent = studentsByExternalId.get(preferredStudentIdentifier.toLowerCase());
        if (!preferredStudent) {
          preferredStudent = studentsByName.get(preferredStudentIdentifier.toLowerCase());
        }

        if (!preferredStudent) {
          errors.push({
            row: i + 1,
            field: 'alunoPreferido',
            message: `Aluno preferido não encontrado: ${preferredStudentIdentifier}`,
          });
          continue;
        }

        // Check self-preference
        if (student.id === preferredStudent.id) {
          errors.push({
            row: i + 1,
            field: 'alunoPreferido',
            message: 'Um aluno não pode escolher a si mesmo',
          });
          continue;
        }

        try {
          // Check if preference already exists
          const exists = await studentPreferenceRepository.exists(
            student.id,
            preferredStudent.id
          );

          if (exists && !replaceExisting) {
            skippedCount++;
            continue;
          }

          // Create preference
          await studentPreferenceRepository.create({
            studentId: student.id,
            preferredStudentId: preferredStudent.id,
            priority: priority as 1 | 2 | 3,
          });

          successCount++;
        } catch (error: any) {
          errors.push({
            row: i + 1,
            field: 'general',
            message: error.message,
          });
        }
      }

      res.status(200).json({
        success: true,
        message: `Importação concluída: ${successCount} preferências criadas`,
        data: {
          successCount,
          errorCount: errors.length,
          skippedCount,
          errors: errors.slice(0, 50), // Limit to first 50 errors
        },
      });
    } catch (error: any) {
      console.error('Error importing preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao importar preferências',
        error: error.message,
      });
    }
  }
}

export const studentPreferenceController = new StudentPreferenceController();
