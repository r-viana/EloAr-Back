/**
 * Configuration Model
 * Weight configurations for genetic algorithm optimization
 */

export interface WeightConfig {
  critical_constraints: number;
  high_constraints: number;
  behavioral_separation: number;
  sibling_rules: number;
  student_preferences: number;
  academic_balance: number;
  class_size_balance: number;
}

export interface Configuration {
  id: number;
  name: string;
  description?: string;
  isDefault: boolean;
  weights: WeightConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConfigurationDTO {
  name: string;
  description?: string;
  isDefault?: boolean;
  weights: WeightConfig;
}

export interface UpdateConfigurationDTO {
  name?: string;
  description?: string;
  isDefault?: boolean;
  weights?: WeightConfig;
}

export const DEFAULT_WEIGHTS: WeightConfig = {
  critical_constraints: 1000,
  high_constraints: 500,
  behavioral_separation: 300,
  sibling_rules: 200,
  student_preferences: 100,
  academic_balance: 50,
  class_size_balance: 50,
};
