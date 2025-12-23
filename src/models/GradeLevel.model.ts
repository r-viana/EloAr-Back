/**
 * GradeLevel Model
 * Represents grade levels from 1st to 12th grade
 */

export interface GradeLevel {
  id: number;
  name: string;
  orderIndex: number;
  totalStudents: number;
  classesPerGrade: number;
  studentsPerClass: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGradeLevelDTO {
  name: string;
  orderIndex: number;
  totalStudents?: number;
  classesPerGrade?: number;
  studentsPerClass?: number;
}

export interface UpdateGradeLevelDTO {
  name?: string;
  orderIndex?: number;
  totalStudents?: number;
  classesPerGrade?: number;
  studentsPerClass?: number;
}
