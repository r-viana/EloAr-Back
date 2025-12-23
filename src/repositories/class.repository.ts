/**
 * Class Repository
 * Data access layer for class management
 */

import { pool } from '../config/database';
import { Class, CreateClassDTO, UpdateClassDTO } from '../models';

export class ClassRepository {
  /**
   * Find all classes with optional filters
   */
  async findAll(filters?: {
    schoolYearId?: number;
    gradeLevelId?: number;
  }): Promise<Class[]> {
    let query = `
      SELECT
        id, school_year_id as "schoolYearId", grade_level_id as "gradeLevelId",
        name, section, capacity, current_count as "currentCount",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM classes
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.schoolYearId) {
      query += ` AND school_year_id = $${paramIndex}`;
      params.push(filters.schoolYearId);
      paramIndex++;
    }

    if (filters?.gradeLevelId) {
      query += ` AND grade_level_id = $${paramIndex}`;
      params.push(filters.gradeLevelId);
    }

    query += ' ORDER BY section ASC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Find class by ID
   */
  async findById(id: number): Promise<Class | null> {
    const query = `
      SELECT
        id, school_year_id as "schoolYearId", grade_level_id as "gradeLevelId",
        name, section, capacity, current_count as "currentCount",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM classes
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Create new class
   */
  async create(data: CreateClassDTO): Promise<Class> {
    const query = `
      INSERT INTO classes (
        school_year_id, grade_level_id, name, section, capacity, current_count
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id, school_year_id as "schoolYearId", grade_level_id as "gradeLevelId",
        name, section, capacity, current_count as "currentCount",
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    const params = [
      data.schoolYearId,
      data.gradeLevelId,
      data.name,
      data.section,
      data.capacity || 45,
      data.currentCount || 0,
    ];

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  /**
   * Bulk create classes (for grade level setup)
   */
  async bulkCreate(classes: CreateClassDTO[]): Promise<Class[]> {
    const query = `
      INSERT INTO classes (
        school_year_id, grade_level_id, name, section, capacity, current_count
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id, school_year_id as "schoolYearId", grade_level_id as "gradeLevelId",
        name, section, capacity, current_count as "currentCount",
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    const results: Class[] = [];

    for (const classData of classes) {
      const params = [
        classData.schoolYearId,
        classData.gradeLevelId,
        classData.name,
        classData.section,
        classData.capacity || 45,
        classData.currentCount || 0,
      ];

      const result = await pool.query(query, params);
      results.push(result.rows[0]);
    }

    return results;
  }

  /**
   * Update class
   */
  async update(id: number, data: UpdateClassDTO): Promise<Class | null> {
    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      params.push(data.name);
      paramIndex++;
    }

    if (data.section !== undefined) {
      fields.push(`section = $${paramIndex}`);
      params.push(data.section);
      paramIndex++;
    }

    if (data.capacity !== undefined) {
      fields.push(`capacity = $${paramIndex}`);
      params.push(data.capacity);
      paramIndex++;
    }

    if (data.currentCount !== undefined) {
      fields.push(`current_count = $${paramIndex}`);
      params.push(data.currentCount);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    const query = `
      UPDATE classes
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING
        id, school_year_id as "schoolYearId", grade_level_id as "gradeLevelId",
        name, section, capacity, current_count as "currentCount",
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    params.push(id);

    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }

  /**
   * Increment current count
   */
  async incrementCount(id: number): Promise<Class | null> {
    const query = `
      UPDATE classes
      SET current_count = current_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING
        id, school_year_id as "schoolYearId", grade_level_id as "gradeLevelId",
        name, section, capacity, current_count as "currentCount",
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Decrement current count
   */
  async decrementCount(id: number): Promise<Class | null> {
    const query = `
      UPDATE classes
      SET current_count = GREATEST(current_count - 1, 0), updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING
        id, school_year_id as "schoolYearId", grade_level_id as "gradeLevelId",
        name, section, capacity, current_count as "currentCount",
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Delete class
   */
  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM classes WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Get class availability (capacity - current_count)
   */
  async getAvailability(id: number): Promise<number> {
    const query = `
      SELECT (capacity - current_count) as available
      FROM classes
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0]?.available || 0;
  }
}

export default new ClassRepository();
