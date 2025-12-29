/**
 * Sibling Rule Model
 * Represents rules for sibling allocation in classes
 */

export type SiblingRuleType = 'SAME_CLASS' | 'DIFFERENT_CLASS' | 'NO_PREFERENCE';

export interface SiblingRule {
  id: number;
  schoolYearId: number;
  studentAId: number;
  studentBId: number;
  ruleType: SiblingRuleType;
  reason?: string;
  createdAt: Date;
}

export interface CreateSiblingRuleDTO {
  schoolYearId: number;
  studentAId: number;
  studentBId: number;
  ruleType: SiblingRuleType;
  reason?: string;
}

export interface UpdateSiblingRuleDTO {
  ruleType?: SiblingRuleType;
  reason?: string;
}

export interface SiblingRuleWithDetails extends SiblingRule {
  studentAName?: string;
  studentBName?: string;
  gradeLevelId?: number;
}

export interface SiblingRuleFilters {
  schoolYearId?: number;
  studentAId?: number;
  studentBId?: number;
  ruleType?: SiblingRuleType;
  gradeLevelId?: number;
}
