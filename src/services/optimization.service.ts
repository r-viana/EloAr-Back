/**
 * Optimization Service
 * Handles communication with Python Service and optimization execution
 */

import axios from 'axios';
import distributionRepository from '../repositories/distribution.repository';
import studentRepository from '../repositories/student.repository';
import classRepository from '../repositories/class.repository';
import { StudentConstraintRepository } from '../repositories/studentConstraint.repository';
import { StudentPreferenceRepository } from '../repositories/studentPreference.repository';
import { SiblingRuleRepository } from '../repositories/siblingRule.repository';
import configurationRepository from '../repositories/configuration.repository';
import { OptimizationRun, CreateDistributionAssignmentDTO } from '../models/Distribution.model';

// Initialize repositories
const studentConstraintRepository = new StudentConstraintRepository();
const studentPreferenceRepository = new StudentPreferenceRepository();
const siblingRuleRepository = new SiblingRuleRepository();

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

interface OptimizationPayload {
  students: any[];
  classes: any[];
  constraints: any[];
  preferences: any[];
  siblingRules: any[];
  weights: any;
  config: {
    totalGenerations: number;
    populationSize: number;
  };
}

interface OptimizationResult {
  success: boolean;
  fitnessScore: number;
  generationCount: number;
  executionTime: number;
  assignments: Array<{
    studentId: number;
    classId: number;
  }>;
  message?: string;
}

class OptimizationService {
  /**
   * Start optimization run asynchronously
   */
  async startOptimization(runId: number): Promise<void> {
    // Run in background - don't await
    this.executeOptimization(runId).catch((error) => {
      console.error(`Optimization run ${runId} failed:`, error);
      // Update run status to FAILED
      distributionRepository.updateOptimizationRun(runId, {
        status: 'FAILED',
        errorMessage: error.message || 'Erro desconhecido',
        completedAt: new Date(),
      });
    });
  }

  /**
   * Execute optimization (async)
   */
  private async executeOptimization(runId: number): Promise<void> {
    console.log(`[Optimization ${runId}] Starting...`);

    // Get run details
    const run = await distributionRepository.findOptimizationRunById(runId);
    if (!run) {
      throw new Error('Optimization run not found');
    }

    try {
      // Update status to RUNNING
      await distributionRepository.updateOptimizationRun(runId, {
        status: 'RUNNING',
        startedAt: new Date(),
      });

      console.log(`[Optimization ${runId}] Fetching data...`);

      // Step 1: Fetch all required data
      const payload = await this.prepareOptimizationPayload(run);

      console.log(`[Optimization ${runId}] Calling Python Service...`);
      console.log(`[Optimization ${runId}] Students: ${payload.students.length}, Classes: ${payload.classes.length}`);

      // Step 2: Call Python Service
      const result = await this.callPythonService(payload);

      console.log(`[Optimization ${runId}] Received result. Fitness: ${result.fitnessScore}`);

      // Step 3: Create distribution and save assignments
      const distribution = await distributionRepository.create({
        schoolYearId: run.schoolYearId,
        gradeLevelId: run.gradeLevelId,
        configurationId: run.configurationId,
        name: `Distribuição Otimizada ${new Date().toLocaleDateString('pt-BR')}`,
        fitnessScore: result.fitnessScore,
        isOptimized: true,
        isFinal: false,
        metadata: {
          generationCount: result.generationCount,
          executionTime: result.executionTime,
          runId,
        },
      });

      console.log(`[Optimization ${runId}] Distribution created: ${distribution.id}`);

      // Save assignments
      const assignments: CreateDistributionAssignmentDTO[] = result.assignments.map((a) => ({
        distributionId: distribution.id,
        studentId: a.studentId,
        classId: a.classId,
      }));

      await distributionRepository.createAssignments(assignments);

      console.log(`[Optimization ${runId}] Saved ${assignments.length} assignments`);

      // Step 4: Update run status to COMPLETED
      await distributionRepository.updateOptimizationRun(runId, {
        status: 'COMPLETED',
        progress: 100,
        currentGeneration: result.generationCount,
        bestFitness: result.fitnessScore,
        executionTimeSeconds: Math.floor(result.executionTime / 1000),
        distributionId: distribution.id,
        completedAt: new Date(),
      });

      console.log(`[Optimization ${runId}] Completed successfully!`);
    } catch (error: any) {
      console.error(`[Optimization ${runId}] Error:`, error.message);

      await distributionRepository.updateOptimizationRun(runId, {
        status: 'FAILED',
        errorMessage: error.message || 'Erro ao executar otimização',
        completedAt: new Date(),
      });

      throw error;
    }
  }

  /**
   * Prepare optimization payload with all required data
   */
  private async prepareOptimizationPayload(run: OptimizationRun): Promise<OptimizationPayload> {
    // Fetch students
    const students = await studentRepository.findAll({
      schoolYearId: run.schoolYearId,
      gradeLevelId: run.gradeLevelId,
    });

    if (students.length === 0) {
      throw new Error('Nenhum aluno encontrado para a série e ano letivo selecionados');
    }

    // Fetch classes
    const classes = await classRepository.findAll({
      schoolYearId: run.schoolYearId,
      gradeLevelId: run.gradeLevelId,
    });

    if (classes.length === 0) {
      throw new Error('Nenhuma turma encontrada para a série e ano letivo selecionados');
    }

    // Check capacity
    const totalCapacity = classes.reduce((sum, c) => sum + c.capacity, 0);
    if (totalCapacity < students.length) {
      throw new Error(
        `Capacidade insuficiente: ${students.length} alunos para ${totalCapacity} vagas`
      );
    }

    // Fetch constraints
    const constraints = await studentConstraintRepository.findAll({
      schoolYearId: run.schoolYearId,
    });

    // Fetch preferences
    const preferences = await studentPreferenceRepository.findAll();

    // Fetch sibling rules
    const siblingRules = await siblingRuleRepository.findAll({
      schoolYearId: run.schoolYearId,
    });

    // Fetch configuration (weights)
    let weights = null;
    if (run.configurationId) {
      const config = await configurationRepository.findById(run.configurationId);
      weights = config?.weights;
    }

    // If no config specified, use active/default
    if (!weights) {
      const activeConfig = await configurationRepository.findActive();
      weights = activeConfig?.weights;
    }

    // Fallback to default weights
    if (!weights) {
      weights = {
        critical_constraints: 1000,
        high_constraints: 500,
        behavioral_separation: 300,
        sibling_rules: 200,
        student_preferences: 100,
        academic_balance: 50,
        class_size_balance: 50,
      };
    }

    return {
      students: students.map((s) => ({
        id: s.id,
        fullName: s.fullName,
        gender: s.gender,
        academicAverage: s.academicAverage || 0,
        behavioralScore: s.behavioralScore || 0,
        hasSpecialNeeds: s.hasSpecialNeeds,
      })),
      classes: classes.map((c: any) => {
        const classPayload = {
          id: c.id,
          name: c.name,
          maxCapacity: c.capacity,
        };
        return classPayload;
      }),
      constraints: constraints.map((c: any) => ({
        studentAId: c.studentAId,
        studentBId: c.studentBId,
        constraintTypeWeight: c.constraintTypeWeight || 500,
        action: c.action,
      })),
      preferences: preferences.map((p: any) => ({
        studentId: p.studentId,
        preferredStudentId: p.preferredStudentId,
        priority: p.priority,
      })),
      siblingRules: siblingRules.map((r: any) => ({
        studentAId: r.studentAId,
        studentBId: r.studentBId,
        ruleType: r.ruleType,
      })),
      weights,
      config: {
        totalGenerations: run.totalGenerations,
        populationSize: run.populationSize,
      },
    };
  }

  /**
   * Call Python Service to execute genetic algorithm
   */
  private async callPythonService(payload: OptimizationPayload): Promise<OptimizationResult> {
    try {
      const response = await axios.post(`${PYTHON_SERVICE_URL}/api/optimize`, payload, {
        timeout: 600000, // 10 minutes
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Otimização falhou');
      }

      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Serviço Python não está disponível. Verifique se está rodando na porta 8000.');
      }

      if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout: A otimização demorou mais de 10 minutos');
      }

      throw new Error(error.message || 'Erro ao comunicar com serviço de otimização');
    }
  }

  /**
   * Get optimization run status (for polling)
   */
  async getOptimizationStatus(runId: number): Promise<OptimizationRun | null> {
    return await distributionRepository.findOptimizationRunById(runId);
  }

  /**
   * Cancel optimization run
   */
  async cancelOptimization(runId: number): Promise<boolean> {
    const run = await distributionRepository.findOptimizationRunById(runId);
    if (!run) {
      return false;
    }

    if (run.status === 'COMPLETED' || run.status === 'FAILED') {
      return false; // Cannot cancel finished runs
    }

    await distributionRepository.updateOptimizationRun(runId, {
      status: 'CANCELLED',
      completedAt: new Date(),
    });

    return true;
  }
}

export default new OptimizationService();
