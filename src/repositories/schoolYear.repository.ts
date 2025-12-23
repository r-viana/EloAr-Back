/**
 * SchoolYear Repository
 * Data access layer for school years
 */

import { pool } from '../config/database';
import { SchoolYear, CreateSchoolYearDTO, UpdateSchoolYearDTO } from '../models';

export class SchoolYearRepository {
  /**
   * Find all school years
   */
  async findAll(): Promise<SchoolYear[]> {
    const query = `
      SELECT
        id, year, name, is_active as "isActive",
        start_date as "startDate", end_date as "endDate",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM school_years
      ORDER BY year DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Find school year by ID
   */
  async findById(id: number): Promise<SchoolYear | null> {
    const query = `
      SELECT
        id, year, name, is_active as "isActive",
        start_date as "startDate", end_date as "endDate",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM school_years
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find active school year
   */
  async findActive(): Promise<SchoolYear | null> {
    const query = `
      SELECT
        id, year, name, is_active as "isActive",
        start_date as "startDate", end_date as "endDate",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM school_years
      WHERE is_active = true
      LIMIT 1
    `;

    const result = await pool.query(query);
    return result.rows[0] || null;
  }

  /**
   * Find by year
   */
  async findByYear(year: number): Promise<SchoolYear | null> {
    const query = `
      SELECT
        id, year, name, is_active as "isActive",
        start_date as "startDate", end_date as "endDate",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM school_years
      WHERE year = $1
    `;

    const result = await pool.query(query, [year]);
    return result.rows[0] || null;
  }

  /**
   * Create new school year
   */
  async create(data: CreateSchoolYearDTO): Promise<SchoolYear> {
    // If setting as active, deactivate all others first
    if (data.isActive) {
      await pool.query('UPDATE school_years SET is_active = false');
    }

    const query = `
      INSERT INTO school_years (year, name, is_active, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id, year, name, is_active as "isActive",
        start_date as "startDate", end_date as "endDate",
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    const params = [
      data.year,
      data.name,
      data.isActive || false,
      data.startDate || null,
      data.endDate || null,
    ];

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  /**
   * Update school year
   */
  async update(id: number, data: UpdateSchoolYearDTO): Promise<SchoolYear | null> {
    // If setting as active, deactivate all others first
    if (data.isActive === true) {
      await pool.query('UPDATE school_years SET is_active = false WHERE id != $1', [id]);
    }

    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.year !== undefined) {
      fields.push(`year = $${paramIndex}`);
      params.push(data.year);
      paramIndex++;
    }

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      params.push(data.name);
      paramIndex++;
    }

    if (data.isActive !== undefined) {
      fields.push(`is_active = $${paramIndex}`);
      params.push(data.isActive);
      paramIndex++;
    }

    if (data.startDate !== undefined) {
      fields.push(`start_date = $${paramIndex}`);
      params.push(data.startDate);
      paramIndex++;
    }

    if (data.endDate !== undefined) {
      fields.push(`end_date = $${paramIndex}`);
      params.push(data.endDate);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    const query = `
      UPDATE school_years
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING
        id, year, name, is_active as "isActive",
        start_date as "startDate", end_date as "endDate",
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    params.push(id);

    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }

  /**
   * Set active school year (deactivates all others)
   */
  async setActive(id: number): Promise<SchoolYear | null> {
    await pool.query('UPDATE school_years SET is_active = false');

    const query = `
      UPDATE school_years
      SET is_active = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING
        id, year, name, is_active as "isActive",
        start_date as "startDate", end_date as "endDate",
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Delete school year
   */
  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM school_years WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export default new SchoolYearRepository();
