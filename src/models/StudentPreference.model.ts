/**
 * Student Preference Model
 * Represents social preferences - students can choose up to 3 preferred classmates
 */

export interface StudentPreference {
  id: number;
  studentId: number;
  preferredStudentId: number;
  priority: 1 | 2 | 3; // 1 = First choice, 2 = Second choice, 3 = Third choice
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

export interface StudentPreferenceWithDetails extends StudentPreference {
  studentName?: string;
  preferredStudentName?: string;
  gradeLevelId?: number;
}

export interface StudentPreferenceFilters {
  studentId?: number;
  preferredStudentId?: number;
  priority?: 1 | 2 | 3;
  schoolYearId?: number;
  gradeLevelId?: number;
}
