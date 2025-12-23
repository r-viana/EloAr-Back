/**
 * Class Model
 * Represents a class definition (e.g., "1º A", "2º B")
 */

export interface Class {
  id: number;
  schoolYearId: number;
  gradeLevelId: number;
  name: string;
  section: string;
  capacity: number;
  currentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClassDTO {
  schoolYearId: number;
  gradeLevelId: number;
  name: string;
  section: string;
  capacity?: number;
  currentCount?: number;
}

export interface UpdateClassDTO {
  name?: string;
  section?: string;
  capacity?: number;
  currentCount?: number;
}
