/**
 * Student Constraint Model
 * Represents pairwise constraints between students (SEPARATE or GROUP)
 */

export type ConstraintAction = 'SEPARATE' | 'GROUP';

export interface StudentConstraint {
  id: number;
  schoolYearId: number;
  studentAId: number;
  studentBId: number;
  constraintTypeId: number;
  action: ConstraintAction;
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
  action: ConstraintAction;
  reason?: string;
  createdBy?: string;
}

export interface UpdateStudentConstraintDTO {
  constraintTypeId?: number;
  action?: ConstraintAction;
  reason?: string;
}

export interface StudentConstraintWithDetails extends StudentConstraint {
  studentAName?: string;
  studentBName?: string;
  constraintTypeName?: string;
  constraintTypeWeight?: number;
}

export interface StudentConstraintFilters {
  schoolYearId?: number;
  studentAId?: number;
  studentBId?: number;
  constraintTypeId?: number;
  action?: ConstraintAction;
}
