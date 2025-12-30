/**
 * Configuration Controller
 * HTTP request handlers for configuration management
 */

import { Request, Response } from 'express';
import configurationRepository from '../repositories/configuration.repository';
import {
  createConfigurationSchema,
  updateConfigurationSchema,
  configurationIdSchema,
} from '../validators/configuration.validator';

export class ConfigurationController {
  /**
   * Get all configurations
   * GET /api/v1/configurations
   */
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const configurations = await configurationRepository.findAll();

      res.status(200).json({
        success: true,
        message: 'Configurações recuperadas com sucesso',
        data: configurations,
      });
    } catch (error) {
      console.error('Error fetching configurations:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar configurações',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Get configuration by ID
   * GET /api/v1/configurations/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      // Validate ID
      const { error } = configurationIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const configuration = await configurationRepository.findById(parseInt(req.params.id));

      if (!configuration) {
        res.status(404).json({
          success: false,
          message: 'Configuração não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Configuração recuperada com sucesso',
        data: configuration,
      });
    } catch (error) {
      console.error('Error fetching configuration:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar configuração',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Get active (default) configuration
   * GET /api/v1/configurations/active
   */
  async getActive(_req: Request, res: Response): Promise<void> {
    try {
      const configuration = await configurationRepository.findActive();

      if (!configuration) {
        res.status(404).json({
          success: false,
          message: 'Nenhuma configuração ativa encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Configuração ativa recuperada com sucesso',
        data: configuration,
      });
    } catch (error) {
      console.error('Error fetching active configuration:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar configuração ativa',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Create new configuration
   * POST /api/v1/configurations
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = createConfigurationSchema.validate(req.body, {
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

      const configuration = await configurationRepository.create(value);

      res.status(201).json({
        success: true,
        message: 'Configuração criada com sucesso',
        data: configuration,
      });
    } catch (error) {
      console.error('Error creating configuration:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar configuração',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Update configuration
   * PUT /api/v1/configurations/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      // Validate ID
      const idValidation = configurationIdSchema.validate({ id: req.params.id });
      if (idValidation.error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: idValidation.error.details.map((d) => d.message),
        });
        return;
      }

      // Validate request body
      const { error, value } = updateConfigurationSchema.validate(req.body, {
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

      const configuration = await configurationRepository.update(parseInt(req.params.id), value);

      if (!configuration) {
        res.status(404).json({
          success: false,
          message: 'Configuração não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Configuração atualizada com sucesso',
        data: configuration,
      });
    } catch (error) {
      console.error('Error updating configuration:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar configuração',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Delete configuration
   * DELETE /api/v1/configurations/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      // Validate ID
      const { error } = configurationIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const deleted = await configurationRepository.delete(parseInt(req.params.id));

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Configuração não encontrada ou é a configuração padrão (não pode ser excluída)',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Configuração excluída com sucesso',
      });
    } catch (error) {
      console.error('Error deleting configuration:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir configuração',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Set configuration as default
   * POST /api/v1/configurations/:id/set-default
   */
  async setAsDefault(req: Request, res: Response): Promise<void> {
    try {
      // Validate ID
      const { error } = configurationIdSchema.validate({ id: req.params.id });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const configuration = await configurationRepository.setAsDefault(parseInt(req.params.id));

      if (!configuration) {
        res.status(404).json({
          success: false,
          message: 'Configuração não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Configuração definida como padrão com sucesso',
        data: configuration,
      });
    } catch (error) {
      console.error('Error setting configuration as default:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao definir configuração como padrão',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Get configuration statistics
   * GET /api/v1/configurations/stats
   */
  async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await configurationRepository.getStats();

      res.status(200).json({
        success: true,
        message: 'Estatísticas recuperadas com sucesso',
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching configuration stats:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
}

export default new ConfigurationController();
