/**
 * Sibling Rule Controller
 * Handles HTTP requests for sibling allocation rules
 */

import { Request, Response } from 'express';
import { siblingRuleRepository } from '../repositories/siblingRule.repository';
import {
  createSiblingRuleSchema,
  updateSiblingRuleSchema,
  siblingRuleQuerySchema,
  siblingRuleIdSchema,
} from '../validators/siblingRule.validator';

export class SiblingRuleController {
  /**
   * Get all sibling rules with optional filters
   * GET /api/v1/sibling-rules
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = siblingRuleQuerySchema.validate(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const rules = await siblingRuleRepository.findAll(value);

      res.status(200).json({
        success: true,
        message: 'Regras de irmãos recuperadas com sucesso',
        data: rules,
      });
    } catch (error: any) {
      console.error('Error getting sibling rules:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar regras de irmãos',
        error: error.message,
      });
    }
  }

  /**
   * Get sibling rule by ID
   * GET /api/v1/sibling-rules/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = siblingRuleIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const rule = await siblingRuleRepository.findById(value.id);

      if (!rule) {
        res.status(404).json({
          success: false,
          message: 'Regra de irmãos não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: rule,
      });
    } catch (error: any) {
      console.error('Error getting sibling rule:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar regra de irmãos',
        error: error.message,
      });
    }
  }

  /**
   * Get siblings of a student
   * GET /api/v1/sibling-rules/student/:studentId
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

      const rules = await siblingRuleRepository.findByStudentId(studentId, schoolYearId);

      res.status(200).json({
        success: true,
        message: 'Regras de irmãos do aluno recuperadas com sucesso',
        data: rules,
      });
    } catch (error: any) {
      console.error('Error getting student sibling rules:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar regras de irmãos do aluno',
        error: error.message,
      });
    }
  }

  /**
   * Create new sibling rule
   * POST /api/v1/sibling-rules
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createSiblingRuleSchema.validate(req.body);
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
          message: 'Não é possível criar uma regra de irmãos entre o mesmo aluno',
        });
        return;
      }

      // Check if rule already exists
      const exists = await siblingRuleRepository.exists(
        value.schoolYearId,
        value.studentAId,
        value.studentBId
      );

      if (exists) {
        res.status(409).json({
          success: false,
          message: 'Esta regra de irmãos já existe',
        });
        return;
      }

      const rule = await siblingRuleRepository.create(value);

      res.status(201).json({
        success: true,
        message: 'Regra de irmãos criada com sucesso',
        data: rule,
      });
    } catch (error: any) {
      console.error('Error creating sibling rule:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar regra de irmãos',
        error: error.message,
      });
    }
  }

  /**
   * Update sibling rule
   * PUT /api/v1/sibling-rules/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { error: idError, value: idValue } = siblingRuleIdSchema.validate({ id: req.params.id });
      if (idError) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: idError.details.map((d) => d.message),
        });
        return;
      }

      const { error: bodyError, value: bodyValue } = updateSiblingRuleSchema.validate(req.body);
      if (bodyError) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: bodyError.details.map((d) => d.message),
        });
        return;
      }

      const rule = await siblingRuleRepository.update(idValue.id, bodyValue);

      if (!rule) {
        res.status(404).json({
          success: false,
          message: 'Regra de irmãos não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Regra de irmãos atualizada com sucesso',
        data: rule,
      });
    } catch (error: any) {
      console.error('Error updating sibling rule:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar regra de irmãos',
        error: error.message,
      });
    }
  }

  /**
   * Delete sibling rule
   * DELETE /api/v1/sibling-rules/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = siblingRuleIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const deleted = await siblingRuleRepository.delete(value.id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Regra de irmãos não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Regra de irmãos excluída com sucesso',
      });
    } catch (error: any) {
      console.error('Error deleting sibling rule:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir regra de irmãos',
        error: error.message,
      });
    }
  }

  /**
   * Get statistics about sibling rules
   * GET /api/v1/sibling-rules/stats/:schoolYearId
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

      const sameClassCount = await siblingRuleRepository.countByType(schoolYearId, 'SAME_CLASS');
      const differentClassCount = await siblingRuleRepository.countByType(schoolYearId, 'DIFFERENT_CLASS');
      const noPreferenceCount = await siblingRuleRepository.countByType(schoolYearId, 'NO_PREFERENCE');

      res.status(200).json({
        success: true,
        data: {
          sameClass: sameClassCount,
          differentClass: differentClassCount,
          noPreference: noPreferenceCount,
          total: sameClassCount + differentClassCount + noPreferenceCount,
        },
      });
    } catch (error: any) {
      console.error('Error getting sibling rule stats:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas de regras de irmãos',
        error: error.message,
      });
    }
  }
}

export const siblingRuleController = new SiblingRuleController();
