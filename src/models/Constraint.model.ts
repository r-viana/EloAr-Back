/**
 * Constraint Models
 * Represents pairwise constraints between students and constraint types
 */

export interface ConstraintType {
  id: number;
  code: string;
  name: string;
  weight: number;
  description?: string;
  createdAt: Date;
}

export interface StudentConstraint {
  id: number;
  schoolYearId: number;
  studentAId: number;
  studentBId: number;
  constraintTypeId: number;
  action: 'SEPARATE' | 'GROUP';
  reason?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStudentConstraintDTO {
  schoolYearId: number;
  studentAId: number;
  studentBId: number;
  constraintTypeId: number;
  action: 'SEPARATE' | 'GROUP';
  reason?: string;
  createdBy?: string;
}

export interface UpdateStudentConstraintDTO {
  constraintTypeId?: number;
  action?: 'SEPARATE' | 'GROUP';
  reason?: string;
}

export interface SiblingRule {
  id: number;
  schoolYearId: number;
  studentAId: number;
  studentBId: number;
  ruleType: 'SAME_CLASS' | 'DIFFERENT_CLASS' | 'NO_PREFERENCE';
  reason?: string;
  createdAt: Date;
}

export interface CreateSiblingRuleDTO {
  schoolYearId: number;
  studentAId: number;
  studentBId: number;
  ruleType: 'SAME_CLASS' | 'DIFFERENT_CLASS' | 'NO_PREFERENCE';
  reason?: string;
}
