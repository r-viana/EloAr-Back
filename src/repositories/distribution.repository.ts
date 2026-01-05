/**
 * Distribution Repository
 * Data access layer for distributions and optimization runs
 */

import { Pool } from 'pg';
import { pool } from '../config/database';
import {
  Distribution,
  CreateDistributionDTO,
  DistributionAssignment,
  CreateDistributionAssignmentDTO,
  OptimizationRun,
  CreateOptimizationRunDTO,
  UpdateOptimizationRunDTO,
} from '../models/Distribution.model';

class DistributionRepository {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  /**
   * Map database row to Distribution model
   */
  private mapRowToDistribution(row: any): Distribution {
    return {
      id: row.id,
      schoolYearId: row.school_year_id,
      gradeLevelId: row.grade_level_id,
      configurationId: row.configuration_id,
      name: row.name,
      fitnessScore: row.fitness_score,
      isFinal: row.is_final,
      isOptimized: row.is_optimized,
      metadata: row.metadata,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Map database row to OptimizationRun model
   */
  private mapRowToOptimizationRun(row: any): OptimizationRun {
    return {
      id: row.id,
      runUuid: row.run_uuid,
      distributionId: row.distribution_id,
      schoolYearId: row.school_year_id,
      gradeLevelId: row.grade_level_id,
      configurationId: row.configuration_id,
      status: row.status,
      progress: row.progress,
      currentGeneration: row.current_generation,
      totalGenerations: row.total_generations,
      bestFitness: row.best_fitness,
      populationSize: row.population_size,
      executionTimeSeconds: row.execution_time_seconds,
      errorMessage: row.error_message,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      createdAt: row.created_at,
    };
  }

  /**
   * Get all distributions with optional filters
   */
  async findAll(schoolYearId?: number, gradeLevelId?: number): Promise<Distribution[]> {
    let query = 'SELECT * FROM distributions WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (schoolYearId) {
      query += ` AND school_year_id = $${paramIndex}`;
      params.push(schoolYearId);
      paramIndex++;
    }

    if (gradeLevelId) {
      query += ` AND grade_level_id = $${paramIndex}`;
      params.push(gradeLevelId);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await this.pool.query(query, params);
    return result.rows.map(this.mapRowToDistribution);
  }

  /**
   * Get distribution by ID
   */
  async findById(id: number): Promise<Distribution | null> {
    const query = 'SELECT * FROM distributions WHERE id = $1';
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToDistribution(result.rows[0]);
  }

  /**
   * Create new distribution
   */
  async create(dto: CreateDistributionDTO): Promise<Distribution> {
    const query = `
      INSERT INTO distributions (
        school_year_id, grade_level_id, configuration_id, name,
        fitness_score, is_final, is_optimized, metadata, created_by,
        created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      dto.schoolYearId,
      dto.gradeLevelId,
      dto.configurationId || null,
      dto.name,
      dto.fitnessScore || null,
      dto.isFinal || false,
      dto.isOptimized || false,
      dto.metadata ? JSON.stringify(dto.metadata) : null,
      dto.createdBy || null,
    ]);

    return this.mapRowToDistribution(result.rows[0]);
  }

  /**
   * Update distribution
   */
  async update(id: number, updates: Partial<CreateDistributionDTO>): Promise<Distribution | null> {
    const distribution = await this.findById(id);
    if (!distribution) {
      return null;
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }

    if (updates.configurationId !== undefined) {
      fields.push(`configuration_id = $${paramIndex++}`);
      values.push(updates.configurationId);
    }

    if (updates.fitnessScore !== undefined) {
      fields.push(`fitness_score = $${paramIndex++}`);
      values.push(updates.fitnessScore);
    }

    if (updates.isFinal !== undefined) {
      fields.push(`is_final = $${paramIndex++}`);
      values.push(updates.isFinal);
    }

    if (updates.isOptimized !== undefined) {
      fields.push(`is_optimized = $${paramIndex++}`);
      values.push(updates.isOptimized);
    }

    if (updates.metadata !== undefined) {
      fields.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(updates.metadata));
    }

    if (fields.length === 0) {
      return distribution;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE distributions
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return this.mapRowToDistribution(result.rows[0]);
  }

  /**
   * Delete distribution
   */
  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM distributions WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Get assignments for a distribution
   */
  async getAssignments(distributionId: number): Promise<DistributionAssignment[]> {
    const query = 'SELECT * FROM distribution_assignments WHERE distribution_id = $1 ORDER BY id';
    const result = await this.pool.query(query, [distributionId]);

    return result.rows.map((row) => ({
      id: row.id,
      distributionId: row.distribution_id,
      studentId: row.student_id,
      classId: row.class_id,
      assignedAt: row.assigned_at,
    }));
  }

  /**
   * Create assignments in bulk
   */
  async createAssignments(assignments: CreateDistributionAssignmentDTO[]): Promise<void> {
    if (assignments.length === 0) return;

    const values: any[] = [];
    const valuePlaceholders: string[] = [];
    let paramIndex = 1;

    assignments.forEach((assignment) => {
      valuePlaceholders.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, NOW())`);
      values.push(assignment.distributionId, assignment.studentId, assignment.classId);
      paramIndex += 3;
    });

    const query = `
      INSERT INTO distribution_assignments (distribution_id, student_id, class_id, assigned_at)
      VALUES ${valuePlaceholders.join(', ')}
    `;

    await this.pool.query(query, values);
  }

  /**
   * Delete all assignments for a distribution
   */
  async deleteAssignments(distributionId: number): Promise<void> {
    const query = 'DELETE FROM distribution_assignments WHERE distribution_id = $1';
    await this.pool.query(query, [distributionId]);
  }

  // ============================================================================
  // Optimization Runs
  // ============================================================================

  /**
   * Create optimization run
   */
  async createOptimizationRun(dto: CreateOptimizationRunDTO): Promise<OptimizationRun> {
    const runUuid = `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const query = `
      INSERT INTO optimization_runs (
        run_uuid, school_year_id, grade_level_id, configuration_id,
        status, progress, current_generation, total_generations,
        population_size, created_at
      )
      VALUES ($1, $2, $3, $4, 'PENDING', 0, 0, $5, $6, NOW())
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      runUuid,
      dto.schoolYearId,
      dto.gradeLevelId,
      dto.configurationId || null,
      dto.totalGenerations || 150,
      dto.populationSize || 100,
    ]);

    return this.mapRowToOptimizationRun(result.rows[0]);
  }

  /**
   * Get optimization run by ID
   */
  async findOptimizationRunById(id: number): Promise<OptimizationRun | null> {
    const query = 'SELECT * FROM optimization_runs WHERE id = $1';
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToOptimizationRun(result.rows[0]);
  }

  /**
   * Get optimization run by UUID
   */
  async findOptimizationRunByUuid(runUuid: string): Promise<OptimizationRun | null> {
    const query = 'SELECT * FROM optimization_runs WHERE run_uuid = $1';
    const result = await this.pool.query(query, [runUuid]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToOptimizationRun(result.rows[0]);
  }

  /**
   * Update optimization run
   */
  async updateOptimizationRun(
    id: number,
    updates: UpdateOptimizationRunDTO
  ): Promise<OptimizationRun | null> {
    const run = await this.findOptimizationRunById(id);
    if (!run) {
      return null;
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }

    if (updates.progress !== undefined) {
      fields.push(`progress = $${paramIndex++}`);
      values.push(updates.progress);
    }

    if (updates.currentGeneration !== undefined) {
      fields.push(`current_generation = $${paramIndex++}`);
      values.push(updates.currentGeneration);
    }

    if (updates.bestFitness !== undefined) {
      fields.push(`best_fitness = $${paramIndex++}`);
      values.push(updates.bestFitness);
    }

    if (updates.executionTimeSeconds !== undefined) {
      fields.push(`execution_time_seconds = $${paramIndex++}`);
      values.push(updates.executionTimeSeconds);
    }

    if (updates.errorMessage !== undefined) {
      fields.push(`error_message = $${paramIndex++}`);
      values.push(updates.errorMessage);
    }

    if (updates.distributionId !== undefined) {
      fields.push(`distribution_id = $${paramIndex++}`);
      values.push(updates.distributionId);
    }

    if (updates.startedAt !== undefined) {
      fields.push(`started_at = $${paramIndex++}`);
      values.push(updates.startedAt);
    }

    if (updates.completedAt !== undefined) {
      fields.push(`completed_at = $${paramIndex++}`);
      values.push(updates.completedAt);
    }

    if (fields.length === 0) {
      return run;
    }

    values.push(id);

    const query = `
      UPDATE optimization_runs
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return this.mapRowToOptimizationRun(result.rows[0]);
  }

  /**
   * Get all optimization runs for a distribution
   */
  async getOptimizationRunsForDistribution(distributionId: number): Promise<OptimizationRun[]> {
    const query = 'SELECT * FROM optimization_runs WHERE distribution_id = $1 ORDER BY created_at DESC';
    const result = await this.pool.query(query, [distributionId]);
    return result.rows.map(this.mapRowToOptimizationRun);
  }
}

export default new DistributionRepository();
