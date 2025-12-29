/**
 * Student Constraint Repository
 * Data access layer for student pairwise constraints (SEPARATE/GROUP)
 */

import { pool } from '../config/database';
import {
  StudentConstraint,
  CreateStudentConstraintDTO,
  UpdateStudentConstraintDTO,
  StudentConstraintWithDetails,
  StudentConstraintFilters,
} from '../models/StudentConstraint.model';
import { PoolClient } from 'pg';

export class StudentConstraintRepository {
  /**
   * Find all constraints with optional filters and details
   */
  async findAll(filters?: StudentConstraintFilters): Promise<StudentConstraintWithDetails[]> {
    let query = `
      SELECT
        sc.id, sc.school_year_id as "schoolYearId", sc.student_a_id as "studentAId",
        sc.student_b_id as "studentBId", sc.constraint_type_id as "constraintTypeId",
        sc.action, sc.reason, sc.created_by as "createdBy",
        sc.created_at as "createdAt", sc.updated_at as "updatedAt",
        s1.full_name as "studentAName",
        s2.full_name as "studentBName",
        ct.name as "constraintTypeName",
        ct.weight as "constraintTypeWeight"
      FROM student_constraints sc
      LEFT JOIN students s1 ON sc.student_a_id = s1.id
      LEFT JOIN students s2 ON sc.student_b_id = s2.id
      LEFT JOIN constraint_types ct ON sc.constraint_type_id = ct.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.schoolYearId) {
      query += ` AND sc.school_year_id = $${paramIndex}`;
      params.push(filters.schoolYearId);
      paramIndex++;
    }

    if (filters?.studentAId) {
      query += ` AND sc.student_a_id = $${paramIndex}`;
      params.push(filters.studentAId);
      paramIndex++;
    }

    if (filters?.studentBId) {
      query += ` AND sc.student_b_id = $${paramIndex}`;
      params.push(filters.studentBId);
      paramIndex++;
    }

    if (filters?.constraintTypeId) {
      query += ` AND sc.constraint_type_id = $${paramIndex}`;
      params.push(filters.constraintTypeId);
      paramIndex++;
    }

    if (filters?.action) {
      query += ` AND sc.action = $${paramIndex}`;
      params.push(filters.action);
      paramIndex++;
    }

    query += ' ORDER BY ct.weight DESC, sc.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Find constraint by ID
   */
  async findById(id: number): Promise<StudentConstraintWithDetails | null> {
    const query = `
      SELECT
        sc.id, sc.school_year_id as "schoolYearId", sc.student_a_id as "studentAId",
        sc.student_b_id as "studentBId", sc.constraint_type_id as "constraintTypeId",
        sc.action, sc.reason, sc.created_by as "createdBy",
        sc.created_at as "createdAt", sc.updated_at as "updatedAt",
        s1.full_name as "studentAName",
        s2.full_name as "studentBName",
        ct.name as "constraintTypeName",
        ct.weight as "constraintTypeWeight"
      FROM student_constraints sc
      LEFT JOIN students s1 ON sc.student_a_id = s1.id
      LEFT JOIN students s2 ON sc.student_b_id = s2.id
      LEFT JOIN constraint_types ct ON sc.constraint_type_id = ct.id
      WHERE sc.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find all constraints involving a specific student
   */
  async findByStudentId(studentId: number, schoolYearId?: number): Promise<StudentConstraintWithDetails[]> {
    let query = `
      SELECT
        sc.id, sc.school_year_id as "schoolYearId", sc.student_a_id as "studentAId",
        sc.student_b_id as "studentBId", sc.constraint_type_id as "constraintTypeId",
        sc.action, sc.reason, sc.created_by as "createdBy",
        sc.created_at as "createdAt", sc.updated_at as "updatedAt",
        s1.full_name as "studentAName",
        s2.full_name as "studentBName",
        ct.name as "constraintTypeName",
        ct.weight as "constraintTypeWeight"
      FROM student_constraints sc
      LEFT JOIN students s1 ON sc.student_a_id = s1.id
      LEFT JOIN students s2 ON sc.student_b_id = s2.id
      LEFT JOIN constraint_types ct ON sc.constraint_type_id = ct.id
      WHERE (sc.student_a_id = $1 OR sc.student_b_id = $1)
    `;

    const params: any[] = [studentId];
    let paramIndex = 2;

    if (schoolYearId) {
      query += ` AND sc.school_year_id = $${paramIndex}`;
      params.push(schoolYearId);
    }

    query += ' ORDER BY ct.weight DESC, sc.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Create new constraint
   */
  async create(data: CreateStudentConstraintDTO, client?: PoolClient): Promise<StudentConstraint> {
    const useClient = client || pool;

    const query = `
      INSERT INTO student_constraints
        (school_year_id, student_a_id, student_b_id, constraint_type_id, action, reason, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, school_year_id as "schoolYearId", student_a_id as "studentAId",
                student_b_id as "studentBId", constraint_type_id as "constraintTypeId",
                action, reason, created_by as "createdBy",
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await useClient.query(query, [
      data.schoolYearId,
      data.studentAId,
      data.studentBId,
      data.constraintTypeId,
      data.action,
      data.reason || null,
      data.createdBy || null,
    ]);

    return result.rows[0];
  }

  /**
   * Update constraint
   */
  async update(
    id: number,
    data: UpdateStudentConstraintDTO,
    client?: PoolClient
  ): Promise<StudentConstraint | null> {
    const useClient = client || pool;

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.constraintTypeId !== undefined) {
      updates.push(`constraint_type_id = $${paramIndex}`);
      params.push(data.constraintTypeId);
      paramIndex++;
    }

    if (data.action !== undefined) {
      updates.push(`action = $${paramIndex}`);
      params.push(data.action);
      paramIndex++;
    }

    if (data.reason !== undefined) {
      updates.push(`reason = $${paramIndex}`);
      params.push(data.reason);
      paramIndex++;
    }

    if (updates.length === 0) {
      const found = await this.findById(id);
      return found ? {
        id: found.id,
        schoolYearId: found.schoolYearId,
        studentAId: found.studentAId,
        studentBId: found.studentBId,
        constraintTypeId: found.constraintTypeId,
        action: found.action,
        reason: found.reason,
        createdBy: found.createdBy,
        createdAt: found.createdAt,
        updatedAt: found.updatedAt,
      } : null;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const query = `
      UPDATE student_constraints
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, school_year_id as "schoolYearId", student_a_id as "studentAId",
                student_b_id as "studentBId", constraint_type_id as "constraintTypeId",
                action, reason, created_by as "createdBy",
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await useClient.query(query, params);
    return result.rows[0] || null;
  }

  /**
   * Delete constraint by ID
   */
  async delete(id: number, client?: PoolClient): Promise<boolean> {
    const useClient = client || pool;

    const query = 'DELETE FROM student_constraints WHERE id = $1';
    const result = await useClient.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Delete all constraints for a school year
   */
  async deleteBySchoolYear(schoolYearId: number, client?: PoolClient): Promise<number> {
    const useClient = client || pool;

    const query = 'DELETE FROM student_constraints WHERE school_year_id = $1';
    const result = await useClient.query(query, [schoolYearId]);
    return result.rowCount ?? 0;
  }

  /**
   * Check if constraint exists between two students
   */
  async exists(schoolYearId: number, studentAId: number, studentBId: number): Promise<boolean> {
    const query = `
      SELECT 1 FROM student_constraints
      WHERE school_year_id = $1
        AND student_a_id = $2
        AND student_b_id = $3
    `;

    const result = await pool.query(query, [schoolYearId, studentAId, studentBId]);
    return result.rows.length > 0;
  }

  /**
   * Count constraints by type
   */
  async countByType(schoolYearId: number, action: 'SEPARATE' | 'GROUP'): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM student_constraints
      WHERE school_year_id = $1 AND action = $2
    `;

    const result = await pool.query(query, [schoolYearId, action]);
    return parseInt(result.rows[0]?.count || '0');
  }
}

export const studentConstraintRepository = new StudentConstraintRepository();
