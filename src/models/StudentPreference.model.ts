/**
 * StudentPreference Model
 * Represents student social preferences - up to 3 preferred classmates
 */

export interface StudentPreference {
  id: number;
  studentId: number;
  preferredStudentId: number;
  priority: 1 | 2 | 3;
  createdAt: Date;
}

export interface CreateStudentPreferenceDTO {
  studentId: number;
  preferredStudentId: number;
  priority: 1 | 2 | 3;
}

export interface UpdateStudentPreferenceDTO {
  preferredStudentId?: number;
  priority?: 1 | 2 | 3;
}

export interface BulkCreatePreferencesDTO {
  studentId: number;
  preferences: {
    preferredStudentId: number;
    priority: 1 | 2 | 3;
  }[];
}
