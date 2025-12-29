/**
 * Sibling Rule Repository
 * Data access layer for sibling allocation rules
 */

import { pool } from '../config/database';
import {
  SiblingRule,
  CreateSiblingRuleDTO,
  UpdateSiblingRuleDTO,
  SiblingRuleWithDetails,
  SiblingRuleFilters,
} from '../models/SiblingRule.model';
import { PoolClient } from 'pg';

export class SiblingRuleRepository {
  /**
   * Find all sibling rules with optional filters and details
   */
  async findAll(filters?: SiblingRuleFilters): Promise<SiblingRuleWithDetails[]> {
    let query = `
      SELECT
        sr.id, sr.school_year_id as "schoolYearId", sr.student_a_id as "studentAId",
        sr.student_b_id as "studentBId", sr.rule_type as "ruleType",
        sr.reason, sr.created_at as "createdAt",
        s1.full_name as "studentAName",
        s2.full_name as "studentBName",
        s1.grade_level_id as "gradeLevelId"
      FROM sibling_rules sr
      LEFT JOIN students s1 ON sr.student_a_id = s1.id
      LEFT JOIN students s2 ON sr.student_b_id = s2.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.schoolYearId) {
      query += ` AND sr.school_year_id = $${paramIndex}`;
      params.push(filters.schoolYearId);
      paramIndex++;
    }

    if (filters?.studentAId) {
      query += ` AND sr.student_a_id = $${paramIndex}`;
      params.push(filters.studentAId);
      paramIndex++;
    }

    if (filters?.studentBId) {
      query += ` AND sr.student_b_id = $${paramIndex}`;
      params.push(filters.studentBId);
      paramIndex++;
    }

    if (filters?.ruleType) {
      query += ` AND sr.rule_type = $${paramIndex}`;
      params.push(filters.ruleType);
      paramIndex++;
    }

    if (filters?.gradeLevelId) {
      query += ` AND s1.grade_level_id = $${paramIndex}`;
      params.push(filters.gradeLevelId);
      paramIndex++;
    }

    query += ' ORDER BY sr.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Find sibling rule by ID
   */
  async findById(id: number): Promise<SiblingRuleWithDetails | null> {
    const query = `
      SELECT
        sr.id, sr.school_year_id as "schoolYearId", sr.student_a_id as "studentAId",
        sr.student_b_id as "studentBId", sr.rule_type as "ruleType",
        sr.reason, sr.created_at as "createdAt",
        s1.full_name as "studentAName",
        s2.full_name as "studentBName",
        s1.grade_level_id as "gradeLevelId"
      FROM sibling_rules sr
      LEFT JOIN students s1 ON sr.student_a_id = s1.id
      LEFT JOIN students s2 ON sr.student_b_id = s2.id
      WHERE sr.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find all sibling rules involving a specific student
   */
  async findByStudentId(studentId: number, schoolYearId?: number): Promise<SiblingRuleWithDetails[]> {
    let query = `
      SELECT
        sr.id, sr.school_year_id as "schoolYearId", sr.student_a_id as "studentAId",
        sr.student_b_id as "studentBId", sr.rule_type as "ruleType",
        sr.reason, sr.created_at as "createdAt",
        s1.full_name as "studentAName",
        s2.full_name as "studentBName",
        s1.grade_level_id as "gradeLevelId"
      FROM sibling_rules sr
      LEFT JOIN students s1 ON sr.student_a_id = s1.id
      LEFT JOIN students s2 ON sr.student_b_id = s2.id
      WHERE (sr.student_a_id = $1 OR sr.student_b_id = $1)
    `;

    const params: any[] = [studentId];
    let paramIndex = 2;

    if (schoolYearId) {
      query += ` AND sr.school_year_id = $${paramIndex}`;
      params.push(schoolYearId);
    }

    query += ' ORDER BY sr.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Create new sibling rule
   */
  async create(data: CreateSiblingRuleDTO, client?: PoolClient): Promise<SiblingRule> {
    const useClient = client || pool;

    const query = `
      INSERT INTO sibling_rules
        (school_year_id, student_a_id, student_b_id, rule_type, reason)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, school_year_id as "schoolYearId", student_a_id as "studentAId",
                student_b_id as "studentBId", rule_type as "ruleType",
                reason, created_at as "createdAt"
    `;

    const result = await useClient.query(query, [
      data.schoolYearId,
      data.studentAId,
      data.studentBId,
      data.ruleType,
      data.reason || null,
    ]);

    return result.rows[0];
  }

  /**
   * Update sibling rule
   */
  async update(
    id: number,
    data: UpdateSiblingRuleDTO,
    client?: PoolClient
  ): Promise<SiblingRule | null> {
    const useClient = client || pool;

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.ruleType !== undefined) {
      updates.push(`rule_type = $${paramIndex}`);
      params.push(data.ruleType);
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
        ruleType: found.ruleType,
        reason: found.reason,
        createdAt: found.createdAt,
      } : null;
    }

    params.push(id);
    const query = `
      UPDATE sibling_rules
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, school_year_id as "schoolYearId", student_a_id as "studentAId",
                student_b_id as "studentBId", rule_type as "ruleType",
                reason, created_at as "createdAt"
    `;

    const result = await useClient.query(query, params);
    return result.rows[0] || null;
  }

  /**
   * Delete sibling rule by ID
   */
  async delete(id: number, client?: PoolClient): Promise<boolean> {
    const useClient = client || pool;

    const query = 'DELETE FROM sibling_rules WHERE id = $1';
    const result = await useClient.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Delete all sibling rules for a school year
   */
  async deleteBySchoolYear(schoolYearId: number, client?: PoolClient): Promise<number> {
    const useClient = client || pool;

    const query = 'DELETE FROM sibling_rules WHERE school_year_id = $1';
    const result = await useClient.query(query, [schoolYearId]);
    return result.rowCount ?? 0;
  }

  /**
   * Check if sibling rule exists between two students
   */
  async exists(schoolYearId: number, studentAId: number, studentBId: number): Promise<boolean> {
    const query = `
      SELECT 1 FROM sibling_rules
      WHERE school_year_id = $1
        AND student_a_id = $2
        AND student_b_id = $3
    `;

    const result = await pool.query(query, [schoolYearId, studentAId, studentBId]);
    return result.rows.length > 0;
  }

  /**
   * Count sibling rules by type
   */
  async countByType(schoolYearId: number, ruleType: 'SAME_CLASS' | 'DIFFERENT_CLASS' | 'NO_PREFERENCE'): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM sibling_rules
      WHERE school_year_id = $1 AND rule_type = $2
    `;

    const result = await pool.query(query, [schoolYearId, ruleType]);
    return parseInt(result.rows[0]?.count || '0');
  }

  /**
   * Find siblings (students with sibling relationship)
   */
  async findSiblings(studentId: number, schoolYearId?: number): Promise<SiblingRuleWithDetails[]> {
    return this.findByStudentId(studentId, schoolYearId);
  }
}

export const siblingRuleRepository = new SiblingRuleRepository();
