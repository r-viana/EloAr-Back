/**
 * SchoolYear Model
 * Represents an academic year for student distribution
 */

export interface SchoolYear {
  id: number;
  year: number;
  name: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSchoolYearDTO {
  year: number;
  name: string;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateSchoolYearDTO {
  year?: number;
  name?: string;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}
