/**
 * Constraint Type Repository
 * Data access layer for constraint types (read-only)
 */

import { pool } from '../config/database';

export interface ConstraintType {
  id: number;
  code: string;
  name: string;
  weight: number;
  description?: string;
  createdAt: Date;
}

export class ConstraintTypeRepository {
  /**
   * Find all constraint types
   */
  async findAll(): Promise<ConstraintType[]> {
    const query = `
      SELECT
        id, code, name, weight, description,
        created_at as "createdAt"
      FROM constraint_types
      ORDER BY weight DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Find constraint type by ID
   */
  async findById(id: number): Promise<ConstraintType | null> {
    const query = `
      SELECT
        id, code, name, weight, description,
        created_at as "createdAt"
      FROM constraint_types
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find constraint type by code
   */
  async findByCode(code: string): Promise<ConstraintType | null> {
    const query = `
      SELECT
        id, code, name, weight, description,
        created_at as "createdAt"
      FROM constraint_types
      WHERE code = $1
    `;

    const result = await pool.query(query, [code]);
    return result.rows[0] || null;
  }
}

export const constraintTypeRepository = new ConstraintTypeRepository();
