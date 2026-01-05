/**
 * Distribution Controller
 * HTTP request handlers for distribution management and optimization
 */

import { Request, Response } from 'express';
import distributionRepository from '../repositories/distribution.repository';
import optimizationService from '../services/optimization.service';
import {
  createDistributionSchema,
  updateDistributionSchema,
  distributionIdSchema,
} from '../validators/distribution.validator';

export class DistributionController {
  /**
   * Get all distributions
   * GET /api/v1/distributions?schoolYearId=1&gradeLevelId=2
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const schoolYearId = req.query.schoolYearId ? parseInt(req.query.schoolYearId as string) : undefined;
      const gradeLevelId = req.query.gradeLevelId ? parseInt(req.query.gradeLevelId as string) : undefined;

      const distributions = await distributionRepository.findAll(schoolYearId, gradeLevelId);

      res.status(200).json({
        success: true,
        message: 'Distribuições recuperadas com sucesso',
        data: distributions,
      });
    } catch (error) {
      console.error('Error fetching distributions:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar distribuições',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Get distribution by ID with assignments
   * GET /api/v1/distributions/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { error } = distributionIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const id = parseInt(req.params.id);
      const distribution = await distributionRepository.findById(id);

      if (!distribution) {
        res.status(404).json({
          success: false,
          message: 'Distribuição não encontrada',
        });
        return;
      }

      // Get assignments
      const assignments = await distributionRepository.getAssignments(id);

      res.status(200).json({
        success: true,
        message: 'Distribuição recuperada com sucesso',
        data: {
          ...distribution,
          assignments,
        },
      });
    } catch (error) {
      console.error('Error fetching distribution:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar distribuição',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Create new distribution (in DRAFT state)
   * POST /api/v1/distributions
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createDistributionSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const distribution = await distributionRepository.create({
        ...value,
        isFinal: false,
        isOptimized: false,
      });

      res.status(201).json({
        success: true,
        message: 'Distribuição criada com sucesso',
        data: distribution,
      });
    } catch (error) {
      console.error('Error creating distribution:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar distribuição',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Update distribution
   * PUT /api/v1/distributions/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const idValidation = distributionIdSchema.validate({ id: req.params.id });
      if (idValidation.error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: idValidation.error.details.map((d) => d.message),
        });
        return;
      }

      const { error, value } = updateDistributionSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const id = parseInt(req.params.id);
      const distribution = await distributionRepository.update(id, value);

      if (!distribution) {
        res.status(404).json({
          success: false,
          message: 'Distribuição não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Distribuição atualizada com sucesso',
        data: distribution,
      });
    } catch (error) {
      console.error('Error updating distribution:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar distribuição',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Delete distribution
   * DELETE /api/v1/distributions/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { error } = distributionIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const id = parseInt(req.params.id);

      // Delete assignments first
      await distributionRepository.deleteAssignments(id);

      // Then delete distribution
      const deleted = await distributionRepository.delete(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Distribuição não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Distribuição excluída com sucesso',
      });
    } catch (error) {
      console.error('Error deleting distribution:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir distribuição',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Start optimization for a distribution
   * POST /api/v1/distributions/optimize
   */
  async optimize(req: Request, res: Response): Promise<void> {
    try {
      const { schoolYearId, gradeLevelId, configurationId } = req.body;

      if (!schoolYearId || !gradeLevelId) {
        res.status(400).json({
          success: false,
          message: 'Ano letivo e série são obrigatórios',
        });
        return;
      }

      // Create optimization run
      const run = await distributionRepository.createOptimizationRun({
        schoolYearId,
        gradeLevelId,
        configurationId,
        totalGenerations: 150,
        populationSize: 100,
      });

      // Start optimization asynchronously
      optimizationService.startOptimization(run.id);

      res.status(202).json({
        success: true,
        message: 'Otimização iniciada',
        data: {
          runId: run.id,
          status: run.status,
        },
      });
    } catch (error) {
      console.error('Error starting optimization:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao iniciar otimização',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Get optimization status (for polling)
   * GET /api/v1/distributions/optimize/:runId/status
   */
  async getOptimizationStatus(req: Request, res: Response): Promise<void> {
    try {
      const runId = parseInt(req.params.runId);

      if (isNaN(runId)) {
        res.status(400).json({
          success: false,
          message: 'ID de execução inválido',
        });
        return;
      }

      const run = await optimizationService.getOptimizationStatus(runId);

      if (!run) {
        res.status(404).json({
          success: false,
          message: 'Execução não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          runId: run.id,
          status: run.status,
          progress: run.progress,
          currentGeneration: run.currentGeneration,
          totalGenerations: run.totalGenerations,
          bestFitness: run.bestFitness,
          distributionId: run.distributionId,
          errorMessage: run.errorMessage,
        },
      });
    } catch (error) {
      console.error('Error fetching optimization status:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar status da otimização',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Cancel optimization
   * POST /api/v1/distributions/optimize/:runId/cancel
   */
  async cancelOptimization(req: Request, res: Response): Promise<void> {
    try {
      const runId = parseInt(req.params.runId);

      if (isNaN(runId)) {
        res.status(400).json({
          success: false,
          message: 'ID de execução inválido',
        });
        return;
      }

      const cancelled = await optimizationService.cancelOptimization(runId);

      if (!cancelled) {
        res.status(400).json({
          success: false,
          message: 'Não foi possível cancelar a otimização (pode já ter sido concluída)',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Otimização cancelada com sucesso',
      });
    } catch (error) {
      console.error('Error cancelling optimization:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao cancelar otimização',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
}

export default new DistributionController();
