/**
 * Student Preference Repository
 * Data access layer for student social preferences
 */

import { pool } from '../config/database';
import {
  StudentPreference,
  CreateStudentPreferenceDTO,
  UpdateStudentPreferenceDTO,
  StudentPreferenceWithDetails,
  StudentPreferenceFilters,
} from '../models/StudentPreference.model';
import { PoolClient } from 'pg';

export class StudentPreferenceRepository {
  /**
   * Find all preferences with optional filters and details
   */
  async findAll(filters?: StudentPreferenceFilters): Promise<StudentPreferenceWithDetails[]> {
    let query = `
      SELECT
        sp.id, sp.student_id as "studentId", sp.preferred_student_id as "preferredStudentId",
        sp.priority, sp.created_at as "createdAt",
        s1.full_name as "studentName",
        s2.full_name as "preferredStudentName",
        s1.grade_level_id as "gradeLevelId"
      FROM student_preferences sp
      LEFT JOIN students s1 ON sp.student_id = s1.id
      LEFT JOIN students s2 ON sp.preferred_student_id = s2.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.studentId) {
      query += ` AND sp.student_id = $${paramIndex}`;
      params.push(filters.studentId);
      paramIndex++;
    }

    if (filters?.preferredStudentId) {
      query += ` AND sp.preferred_student_id = $${paramIndex}`;
      params.push(filters.preferredStudentId);
      paramIndex++;
    }

    if (filters?.priority) {
      query += ` AND sp.priority = $${paramIndex}`;
      params.push(filters.priority);
      paramIndex++;
    }

    if (filters?.schoolYearId) {
      query += ` AND s1.school_year_id = $${paramIndex}`;
      params.push(filters.schoolYearId);
      paramIndex++;
    }

    if (filters?.gradeLevelId) {
      query += ` AND s1.grade_level_id = $${paramIndex}`;
      params.push(filters.gradeLevelId);
      paramIndex++;
    }

    query += ' ORDER BY sp.student_id, sp.priority';

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Find preference by ID
   */
  async findById(id: number): Promise<StudentPreferenceWithDetails | null> {
    const query = `
      SELECT
        sp.id, sp.student_id as "studentId", sp.preferred_student_id as "preferredStudentId",
        sp.priority, sp.created_at as "createdAt",
        s1.full_name as "studentName",
        s2.full_name as "preferredStudentName",
        s1.grade_level_id as "gradeLevelId"
      FROM student_preferences sp
      LEFT JOIN students s1 ON sp.student_id = s1.id
      LEFT JOIN students s2 ON sp.preferred_student_id = s2.id
      WHERE sp.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find preferences by student ID (returns all 3 preferences)
   */
  async findByStudentId(studentId: number): Promise<StudentPreferenceWithDetails[]> {
    const query = `
      SELECT
        sp.id, sp.student_id as "studentId", sp.preferred_student_id as "preferredStudentId",
        sp.priority, sp.created_at as "createdAt",
        s1.full_name as "studentName",
        s2.full_name as "preferredStudentName",
        s1.grade_level_id as "gradeLevelId"
      FROM student_preferences sp
      LEFT JOIN students s1 ON sp.student_id = s1.id
      LEFT JOIN students s2 ON sp.preferred_student_id = s2.id
      WHERE sp.student_id = $1
      ORDER BY sp.priority
    `;

    const result = await pool.query(query, [studentId]);
    return result.rows;
  }

  /**
   * Create new preference
   */
  async create(data: CreateStudentPreferenceDTO, client?: PoolClient): Promise<StudentPreference> {
    const useClient = client || pool;

    const query = `
      INSERT INTO student_preferences (student_id, preferred_student_id, priority)
      VALUES ($1, $2, $3)
      RETURNING id, student_id as "studentId", preferred_student_id as "preferredStudentId",
                priority, created_at as "createdAt"
    `;

    const result = await useClient.query(query, [
      data.studentId,
      data.preferredStudentId,
      data.priority,
    ]);

    return result.rows[0];
  }

  /**
   * Update preference
   */
  async update(
    id: number,
    data: UpdateStudentPreferenceDTO,
    client?: PoolClient
  ): Promise<StudentPreference | null> {
    const useClient = client || pool;

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.preferredStudentId !== undefined) {
      updates.push(`preferred_student_id = $${paramIndex}`);
      params.push(data.preferredStudentId);
      paramIndex++;
    }

    if (data.priority !== undefined) {
      updates.push(`priority = $${paramIndex}`);
      params.push(data.priority);
      paramIndex++;
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    const query = `
      UPDATE student_preferences
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, student_id as "studentId", preferred_student_id as "preferredStudentId",
                priority, created_at as "createdAt"
    `;

    const result = await useClient.query(query, params);
    return result.rows[0] || null;
  }

  /**
   * Delete preference by ID
   */
  async delete(id: number, client?: PoolClient): Promise<boolean> {
    const useClient = client || pool;

    const query = 'DELETE FROM student_preferences WHERE id = $1';
    const result = await useClient.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Delete all preferences for a student
   */
  async deleteByStudentId(studentId: number, client?: PoolClient): Promise<number> {
    const useClient = client || pool;

    const query = 'DELETE FROM student_preferences WHERE student_id = $1';
    const result = await useClient.query(query, [studentId]);
    return result.rowCount ?? 0;
  }

  /**
   * Check if preference exists (to avoid duplicates)
   */
  async exists(studentId: number, preferredStudentId: number): Promise<boolean> {
    const query = `
      SELECT 1 FROM student_preferences
      WHERE student_id = $1 AND preferred_student_id = $2
    `;

    const result = await pool.query(query, [studentId, preferredStudentId]);
    return result.rows.length > 0;
  }

  /**
   * Count preferences for a student
   */
  async countByStudentId(studentId: number): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM student_preferences WHERE student_id = $1';
    const result = await pool.query(query, [studentId]);
    return parseInt(result.rows[0]?.count || '0');
  }

  /**
   * Bulk create preferences for a student (replaces all existing)
   */
  async bulkCreateForStudent(
    studentId: number,
    preferences: Array<{ preferredStudentId: number; priority: 1 | 2 | 3 }>,
    client?: PoolClient
  ): Promise<StudentPreference[]> {
    const useClient = client || pool;

    // Delete existing preferences
    await useClient.query('DELETE FROM student_preferences WHERE student_id = $1', [studentId]);

    // Insert new preferences
    const results: StudentPreference[] = [];
    for (const pref of preferences) {
      const query = `
        INSERT INTO student_preferences (student_id, preferred_student_id, priority)
        VALUES ($1, $2, $3)
        RETURNING id, student_id as "studentId", preferred_student_id as "preferredStudentId",
                  priority, created_at as "createdAt"
      `;

      const result = await useClient.query(query, [studentId, pref.preferredStudentId, pref.priority]);
      results.push(result.rows[0]);
    }

    return results;
  }

  /**
   * Get all students for a school year and grade level (for import matching)
   */
  async getAllStudentsForYearAndGrade(schoolYearId: number, gradeLevelId: number): Promise<any[]> {
    const query = `
      SELECT id, external_id as "externalId", full_name as "fullName"
      FROM students
      WHERE school_year_id = $1 AND grade_level_id = $2
    `;

    const result = await pool.query(query, [schoolYearId, gradeLevelId]);
    return result.rows;
  }

  /**
   * Delete all preferences for a school year and grade level
   */
  async deleteBySchoolYearAndGrade(schoolYearId: number, gradeLevelId: number): Promise<void> {
    const query = `
      DELETE FROM student_preferences
      WHERE student_id IN (
        SELECT id FROM students
        WHERE school_year_id = $1 AND grade_level_id = $2
      )
    `;

    await pool.query(query, [schoolYearId, gradeLevelId]);
  }
}

export const studentPreferenceRepository = new StudentPreferenceRepository();
