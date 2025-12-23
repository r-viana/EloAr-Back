/**
 * Student Repository
 * Data access layer for students with parameterized SQL queries
 */

import { pool } from '../config/database';
import { Student, CreateStudentDTO, UpdateStudentDTO } from '../models';
import { PoolClient } from 'pg';

export class StudentRepository {
  /**
   * Find all students with optional filters
   */
  async findAll(filters?: {
    schoolYearId?: number;
    gradeLevelId?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Student[]> {
    let query = `
      SELECT
        id, school_year_id as "schoolYearId", grade_level_id as "gradeLevelId",
        external_id as "externalId", full_name as "fullName", birthdate, gender,
        academic_average as "academicAverage", behavioral_score as "behavioralScore",
        has_special_needs as "hasSpecialNeeds", special_needs_description as "specialNeedsDescription",
        parent_name as "parentName", parent_email as "parentEmail", parent_phone as "parentPhone",
        notes, created_at as "createdAt", updated_at as "updatedAt"
      FROM students
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
      paramIndex++;
    }

    if (filters?.search) {
      query += ` AND (
        full_name ILIKE $${paramIndex} OR
        external_id ILIKE $${paramIndex} OR
        parent_name ILIKE $${paramIndex}
      )`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    query += ' ORDER BY full_name ASC';

    if (filters?.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      query += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Find student by ID
   */
  async findById(id: number): Promise<Student | null> {
    const query = `
      SELECT
        id, school_year_id as "schoolYearId", grade_level_id as "gradeLevelId",
        external_id as "externalId", full_name as "fullName", birthdate, gender,
        academic_average as "academicAverage", behavioral_score as "behavioralScore",
        has_special_needs as "hasSpecialNeeds", special_needs_description as "specialNeedsDescription",
        parent_name as "parentName", parent_email as "parentEmail", parent_phone as "parentPhone",
        notes, created_at as "createdAt", updated_at as "updatedAt"
      FROM students
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find student by external ID
   */
  async findByExternalId(externalId: string): Promise<Student | null> {
    const query = `
      SELECT
        id, school_year_id as "schoolYearId", grade_level_id as "gradeLevelId",
        external_id as "externalId", full_name as "fullName", birthdate, gender,
        academic_average as "academicAverage", behavioral_score as "behavioralScore",
        has_special_needs as "hasSpecialNeeds", special_needs_description as "specialNeedsDescription",
        parent_name as "parentName", parent_email as "parentEmail", parent_phone as "parentPhone",
        notes, created_at as "createdAt", updated_at as "updatedAt"
      FROM students
      WHERE external_id = $1
    `;

    const result = await pool.query(query, [externalId]);
    return result.rows[0] || null;
  }

  /**
   * Count students with optional filters
   */
  async count(filters?: {
    schoolYearId?: number;
    gradeLevelId?: number;
    search?: string;
  }): Promise<number> {
    let query = 'SELECT COUNT(*) as total FROM students WHERE 1=1';
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
      paramIndex++;
    }

    if (filters?.search) {
      query += ` AND (
        full_name ILIKE $${paramIndex} OR
        external_id ILIKE $${paramIndex} OR
        parent_name ILIKE $${paramIndex}
      )`;
      params.push(`%${filters.search}%`);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].total);
  }

  /**
   * Create new student
   */
  async create(data: CreateStudentDTO): Promise<Student> {
    const query = `
      INSERT INTO students (
        school_year_id, grade_level_id, external_id, full_name, birthdate, gender,
        academic_average, behavioral_score, has_special_needs, special_needs_description,
        parent_name, parent_email, parent_phone, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING
        id, school_year_id as "schoolYearId", grade_level_id as "gradeLevelId",
        external_id as "externalId", full_name as "fullName", birthdate, gender,
        academic_average as "academicAverage", behavioral_score as "behavioralScore",
        has_special_needs as "hasSpecialNeeds", special_needs_description as "specialNeedsDescription",
        parent_name as "parentName", parent_email as "parentEmail", parent_phone as "parentPhone",
        notes, created_at as "createdAt", updated_at as "updatedAt"
    `;

    const params = [
      data.schoolYearId,
      data.gradeLevelId,
      data.externalId || null,
      data.fullName,
      data.birthdate || null,
      data.gender || null,
      data.academicAverage || null,
      data.behavioralScore || null,
      data.hasSpecialNeeds || false,
      data.specialNeedsDescription || null,
      data.parentName || null,
      data.parentEmail || null,
      data.parentPhone || null,
      data.notes || null,
    ];

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  /**
   * Bulk create students (for import)
   */
  async bulkCreate(students: CreateStudentDTO[], client?: PoolClient): Promise<Student[]> {
    const useClient = client || pool;

    const query = `
      INSERT INTO students (
        school_year_id, grade_level_id, external_id, full_name, birthdate, gender,
        academic_average, behavioral_score, has_special_needs, special_needs_description,
        parent_name, parent_email, parent_phone, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING
        id, school_year_id as "schoolYearId", grade_level_id as "gradeLevelId",
        external_id as "externalId", full_name as "fullName", birthdate, gender,
        academic_average as "academicAverage", behavioral_score as "behavioralScore",
        has_special_needs as "hasSpecialNeeds", special_needs_description as "specialNeedsDescription",
        parent_name as "parentName", parent_email as "parentEmail", parent_phone as "parentPhone",
        notes, created_at as "createdAt", updated_at as "updatedAt"
    `;

    const results: Student[] = [];

    for (const student of students) {
      const params = [
        student.schoolYearId,
        student.gradeLevelId,
        student.externalId || null,
        student.fullName,
        student.birthdate || null,
        student.gender || null,
        student.academicAverage || null,
        student.behavioralScore || null,
        student.hasSpecialNeeds || false,
        student.specialNeedsDescription || null,
        student.parentName || null,
        student.parentEmail || null,
        student.parentPhone || null,
        student.notes || null,
      ];

      const result = await useClient.query(query, params);
      results.push(result.rows[0]);
    }

    return results;
  }

  /**
   * Update student
   */
  async update(id: number, data: UpdateStudentDTO): Promise<Student | null> {
    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.externalId !== undefined) {
      fields.push(`external_id = $${paramIndex}`);
      params.push(data.externalId);
      paramIndex++;
    }

    if (data.fullName !== undefined) {
      fields.push(`full_name = $${paramIndex}`);
      params.push(data.fullName);
      paramIndex++;
    }

    if (data.birthdate !== undefined) {
      fields.push(`birthdate = $${paramIndex}`);
      params.push(data.birthdate);
      paramIndex++;
    }

    if (data.gender !== undefined) {
      fields.push(`gender = $${paramIndex}`);
      params.push(data.gender);
      paramIndex++;
    }

    if (data.academicAverage !== undefined) {
      fields.push(`academic_average = $${paramIndex}`);
      params.push(data.academicAverage);
      paramIndex++;
    }

    if (data.behavioralScore !== undefined) {
      fields.push(`behavioral_score = $${paramIndex}`);
      params.push(data.behavioralScore);
      paramIndex++;
    }

    if (data.hasSpecialNeeds !== undefined) {
      fields.push(`has_special_needs = $${paramIndex}`);
      params.push(data.hasSpecialNeeds);
      paramIndex++;
    }

    if (data.specialNeedsDescription !== undefined) {
      fields.push(`special_needs_description = $${paramIndex}`);
      params.push(data.specialNeedsDescription);
      paramIndex++;
    }

    if (data.parentName !== undefined) {
      fields.push(`parent_name = $${paramIndex}`);
      params.push(data.parentName);
      paramIndex++;
    }

    if (data.parentEmail !== undefined) {
      fields.push(`parent_email = $${paramIndex}`);
      params.push(data.parentEmail);
      paramIndex++;
    }

    if (data.parentPhone !== undefined) {
      fields.push(`parent_phone = $${paramIndex}`);
      params.push(data.parentPhone);
      paramIndex++;
    }

    if (data.notes !== undefined) {
      fields.push(`notes = $${paramIndex}`);
      params.push(data.notes);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    const query = `
      UPDATE students
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING
        id, school_year_id as "schoolYearId", grade_level_id as "gradeLevelId",
        external_id as "externalId", full_name as "fullName", birthdate, gender,
        academic_average as "academicAverage", behavioral_score as "behavioralScore",
        has_special_needs as "hasSpecialNeeds", special_needs_description as "specialNeedsDescription",
        parent_name as "parentName", parent_email as "parentEmail", parent_phone as "parentPhone",
        notes, created_at as "createdAt", updated_at as "updatedAt"
    `;

    params.push(id);

    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }

  /**
   * Delete student
   */
  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM students WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Delete all students for a specific school year and grade level
   */
  async deleteBySchoolYearAndGrade(
    schoolYearId: number,
    gradeLevelId: number
  ): Promise<number> {
    const query = `
      DELETE FROM students
      WHERE school_year_id = $1 AND grade_level_id = $2
    `;
    const result = await pool.query(query, [schoolYearId, gradeLevelId]);
    return result.rowCount || 0;
  }
}

export default new StudentRepository();
