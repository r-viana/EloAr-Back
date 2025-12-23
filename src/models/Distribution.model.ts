/**
 * Distribution Models
 * Saved distribution solutions and assignments
 */

export interface Distribution {
  id: number;
  schoolYearId: number;
  gradeLevelId: number;
  configurationId?: number;
  name: string;
  fitnessScore?: number;
  isFinal: boolean;
  isOptimized: boolean;
  metadata?: Record<string, any>;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DistributionAssignment {
  id: number;
  distributionId: number;
  studentId: number;
  classId: number;
  assignedAt: Date;
}

export interface OptimizationRun {
  id: number;
  runUuid: string;
  distributionId?: number;
  schoolYearId: number;
  gradeLevelId: number;
  configurationId?: number;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  currentGeneration: number;
  totalGenerations: number;
  bestFitness?: number;
  populationSize: number;
  executionTimeSeconds?: number;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface CreateDistributionDTO {
  schoolYearId: number;
  gradeLevelId: number;
  configurationId?: number;
  name: string;
  fitnessScore?: number;
  isFinal?: boolean;
  isOptimized?: boolean;
  metadata?: Record<string, any>;
  createdBy?: string;
}

export interface CreateDistributionAssignmentDTO {
  distributionId: number;
  studentId: number;
  classId: number;
}

export interface UpdateDistributionAssignmentDTO {
  classId: number;
}

export interface CreateOptimizationRunDTO {
  schoolYearId: number;
  gradeLevelId: number;
  configurationId?: number;
  totalGenerations?: number;
  populationSize?: number;
}

export interface UpdateOptimizationRunDTO {
  status?: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress?: number;
  currentGeneration?: number;
  bestFitness?: number;
  executionTimeSeconds?: number;
  errorMessage?: string;
  distributionId?: number;
  startedAt?: Date;
  completedAt?: Date;
}
