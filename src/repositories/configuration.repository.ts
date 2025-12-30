/**
 * Configuration Repository
 * Data access layer for weight configurations
 */

import { Pool } from 'pg';
import { pool } from '../config/database';
import { Configuration, CreateConfigurationDTO, UpdateConfigurationDTO } from '../models/Configuration.model';

class ConfigurationRepository {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  /**
   * Get all configurations
   */
  async findAll(): Promise<Configuration[]> {
    const query = `
      SELECT * FROM configurations
      ORDER BY is_default DESC, created_at DESC
    `;

    const result = await this.pool.query(query);
    return result.rows.map(this.mapRowToConfiguration);
  }

  /**
   * Get configuration by ID
   */
  async findById(id: number): Promise<Configuration | null> {
    const query = `
      SELECT * FROM configurations
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToConfiguration(result.rows[0]);
  }

  /**
   * Get active (default) configuration
   */
  async findActive(): Promise<Configuration | null> {
    const query = `
      SELECT * FROM configurations
      WHERE is_default = true
      LIMIT 1
    `;

    const result = await this.pool.query(query);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToConfiguration(result.rows[0]);
  }

  /**
   * Create new configuration
   */
  async create(dto: CreateConfigurationDTO): Promise<Configuration> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // If setting this as default, unset all other defaults first
      if (dto.isDefault) {
        await client.query('UPDATE configurations SET is_default = false');
      }

      const query = `
        INSERT INTO configurations (
          name, description, is_default, weights, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `;

      const values = [
        dto.name,
        dto.description || null,
        dto.isDefault || false,
        JSON.stringify(dto.weights),
      ];

      const result = await client.query(query, values);

      await client.query('COMMIT');

      return this.mapRowToConfiguration(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update configuration
   */
  async update(id: number, dto: UpdateConfigurationDTO): Promise<Configuration | null> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Check if configuration exists
      const checkResult = await client.query('SELECT id FROM configurations WHERE id = $1', [id]);
      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      // If setting this as default, unset all other defaults first
      if (dto.isDefault) {
        await client.query('UPDATE configurations SET is_default = false WHERE id != $1', [id]);
      }

      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (dto.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(dto.name);
      }

      if (dto.description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(dto.description);
      }

      if (dto.isDefault !== undefined) {
        updates.push(`is_default = $${paramIndex++}`);
        values.push(dto.isDefault);
      }

      if (dto.weights !== undefined) {
        updates.push(`weights = $${paramIndex++}`);
        values.push(JSON.stringify(dto.weights));
      }

      if (updates.length === 0) {
        await client.query('ROLLBACK');
        return this.findById(id);
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE configurations
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await client.query(query, values);

      await client.query('COMMIT');

      return this.mapRowToConfiguration(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete configuration
   */
  async delete(id: number): Promise<boolean> {
    const query = `
      DELETE FROM configurations
      WHERE id = $1 AND is_default = false
      RETURNING id
    `;

    const result = await this.pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Set configuration as default
   */
  async setAsDefault(id: number): Promise<Configuration | null> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Check if configuration exists
      const checkResult = await client.query('SELECT id FROM configurations WHERE id = $1', [id]);
      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      // Unset all defaults
      await client.query('UPDATE configurations SET is_default = false');

      // Set new default
      const query = `
        UPDATE configurations
        SET is_default = true, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await client.query(query, [id]);

      await client.query('COMMIT');

      return this.mapRowToConfiguration(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<{
    total: number;
    defaultConfig: Configuration | null;
  }> {
    const countQuery = 'SELECT COUNT(*) as count FROM configurations';
    const countResult = await this.pool.query(countQuery);

    const defaultConfig = await this.findActive();

    return {
      total: parseInt(countResult.rows[0].count),
      defaultConfig,
    };
  }

  /**
   * Map database row to Configuration model
   */
  private mapRowToConfiguration(row: any): Configuration {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      isDefault: row.is_default,
      weights: typeof row.weights === 'string' ? JSON.parse(row.weights) : row.weights,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default new ConfigurationRepository();
