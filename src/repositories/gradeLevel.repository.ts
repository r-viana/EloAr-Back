/**
 * GradeLevel Repository
 * Data access layer for grade levels
 */

import { pool } from '../config/database';
import { GradeLevel, CreateGradeLevelDTO, UpdateGradeLevelDTO } from '../models';

export class GradeLevelRepository {
  /**
   * Find all grade levels
   */
  async findAll(): Promise<GradeLevel[]> {
    const query = `
      SELECT
        id, name, order_index as "orderIndex",
        total_students as "totalStudents", classes_per_grade as "classesPerGrade",
        students_per_class as "studentsPerClass",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM grade_levels
      ORDER BY order_index ASC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Find grade level by ID
   */
  async findById(id: number): Promise<GradeLevel | null> {
    const query = `
      SELECT
        id, name, order_index as "orderIndex",
        total_students as "totalStudents", classes_per_grade as "classesPerGrade",
        students_per_class as "studentsPerClass",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM grade_levels
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find by order index
   */
  async findByOrderIndex(orderIndex: number): Promise<GradeLevel | null> {
    const query = `
      SELECT
        id, name, order_index as "orderIndex",
        total_students as "totalStudents", classes_per_grade as "classesPerGrade",
        students_per_class as "studentsPerClass",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM grade_levels
      WHERE order_index = $1
    `;

    const result = await pool.query(query, [orderIndex]);
    return result.rows[0] || null;
  }

  /**
   * Create new grade level
   */
  async create(data: CreateGradeLevelDTO): Promise<GradeLevel> {
    const query = `
      INSERT INTO grade_levels (
        name, order_index, total_students, classes_per_grade, students_per_class
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id, name, order_index as "orderIndex",
        total_students as "totalStudents", classes_per_grade as "classesPerGrade",
        students_per_class as "studentsPerClass",
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    const params = [
      data.name,
      data.orderIndex,
      data.totalStudents || 0,
      data.classesPerGrade || 6,
      data.studentsPerClass || 45,
    ];

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  /**
   * Update grade level
   */
  async update(id: number, data: UpdateGradeLevelDTO): Promise<GradeLevel | null> {
    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      params.push(data.name);
      paramIndex++;
    }

    if (data.orderIndex !== undefined) {
      fields.push(`order_index = $${paramIndex}`);
      params.push(data.orderIndex);
      paramIndex++;
    }

    if (data.totalStudents !== undefined) {
      fields.push(`total_students = $${paramIndex}`);
      params.push(data.totalStudents);
      paramIndex++;
    }

    if (data.classesPerGrade !== undefined) {
      fields.push(`classes_per_grade = $${paramIndex}`);
      params.push(data.classesPerGrade);
      paramIndex++;
    }

    if (data.studentsPerClass !== undefined) {
      fields.push(`students_per_class = $${paramIndex}`);
      params.push(data.studentsPerClass);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    const query = `
      UPDATE grade_levels
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING
        id, name, order_index as "orderIndex",
        total_students as "totalStudents", classes_per_grade as "classesPerGrade",
        students_per_class as "studentsPerClass",
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    params.push(id);

    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }

  /**
   * Delete grade level
   */
  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM grade_levels WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export default new GradeLevelRepository();
