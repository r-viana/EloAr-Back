import { Request, Response } from 'express';
import { gradeLevelRepository } from '../repositories';

export class GradeLevelController {
  /**
   * Get all grade levels
   */
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const gradeLevels = await gradeLevelRepository.findAll();

      res.status(200).json({
        success: true,
        message: 'Séries recuperadas com sucesso',
        data: gradeLevels,
      });
    } catch (error: Error | any) {
      console.error('Error fetching grade levels:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar séries',
        error: error.message,
      });
    }
  }

  /**
   * Get a single grade level by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
        return;
      }

      const gradeLevel = await gradeLevelRepository.findById(id);

      if (!gradeLevel) {
        res.status(404).json({
          success: false,
          message: 'Série não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Série recuperada com sucesso',
        data: gradeLevel,
      });
    } catch (error: Error | any) {
      console.error('Error fetching grade level:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar série',
        error: error.message,
      });
    }
  }
}
