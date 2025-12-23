/**
 * Student Model
 * Represents student data with academic and personal information
 */

export interface Student {
  id: number;
  schoolYearId: number;
  gradeLevelId: number;
  externalId?: string;
  fullName: string;
  birthdate?: Date;
  gender?: 'M' | 'F' | 'O';
  academicAverage?: number;
  behavioralScore?: number;
  hasSpecialNeeds: boolean;
  specialNeedsDescription?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStudentDTO {
  schoolYearId: number;
  gradeLevelId: number;
  externalId?: string;
  fullName: string;
  birthdate?: Date;
  gender?: 'M' | 'F' | 'O';
  academicAverage?: number;
  behavioralScore?: number;
  hasSpecialNeeds?: boolean;
  specialNeedsDescription?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  notes?: string;
}

export interface UpdateStudentDTO {
  externalId?: string;
  fullName?: string;
  birthdate?: Date;
  gender?: 'M' | 'F' | 'O';
  academicAverage?: number;
  behavioralScore?: number;
  hasSpecialNeeds?: boolean;
  specialNeedsDescription?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  notes?: string;
}

export interface BulkImportStudentDTO {
  schoolYearId: number;
  gradeLevelId: number;
  students: CreateStudentDTO[];
}
