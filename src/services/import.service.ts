/**
 * Import Service
 * Handles CSV/Excel import with validation and bulk insertion
 */

import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { pool } from '../config/database';
import { studentRepository } from '../repositories';
import { CreateStudentDTO } from '../models';

export interface ImportRow {
  [key: string]: string | number | undefined;
}

export interface ImportValidationError {
  row: number;
  field?: string;
  message: string;
  data?: any;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportValidationError[];
  createdStudents?: any[];
}

export class ImportService {
  /**
   * Parse CSV file
   */
  parseCSV(fileContent: string): Promise<ImportRow[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => {
          // Transform headers to expected format
          const headerMap: Record<string, string> = {
            'nome completo': 'fullName',
            'nome': 'fullName',
            'id externo': 'externalId',
            'id': 'externalId',
            'data nascimento': 'birthdate',
            'nascimento': 'birthdate',
            'sexo': 'gender',
            'genero': 'gender',
            'média acadêmica': 'academicAverage',
            'media': 'academicAverage',
            'nota comportamental': 'behavioralScore',
            'comportamento': 'behavioralScore',
            'necessidades especiais': 'hasSpecialNeeds',
            'descrição necessidades': 'specialNeedsDescription',
            'nome responsável': 'parentName',
            'responsavel': 'parentName',
            'email responsável': 'parentEmail',
            'email': 'parentEmail',
            'telefone responsável': 'parentPhone',
            'telefone': 'parentPhone',
            'observações': 'notes',
            'obs': 'notes',
          };

          const normalized = header.toLowerCase().trim();
          return headerMap[normalized] || header;
        },
        complete: (results) => {
          resolve(results.data as ImportRow[]);
        },
        error: (error: Error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        },
      });
    });
  }

  /**
   * Parse Excel file
   */
  parseExcel(buffer: Buffer): ImportRow[] {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });

      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error('No sheets found in Excel file');
      }

      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON with header
      const data = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: undefined,
      });

      // Transform headers
      return data.map((row: any) => {
        const transformed: ImportRow = {};

        const headerMap: Record<string, string> = {
          'nome completo': 'fullName',
          'nome': 'fullName',
          'id externo': 'externalId',
          'id': 'externalId',
          'data nascimento': 'birthdate',
          'nascimento': 'birthdate',
          'sexo': 'gender',
          'genero': 'gender',
          'média acadêmica': 'academicAverage',
          'media': 'academicAverage',
          'nota comportamental': 'behavioralScore',
          'comportamento': 'behavioralScore',
          'necessidades especiais': 'hasSpecialNeeds',
          'descrição necessidades': 'specialNeedsDescription',
          'nome responsável': 'parentName',
          'responsavel': 'parentName',
          'email responsável': 'parentEmail',
          'email': 'parentEmail',
          'telefone responsável': 'parentPhone',
          'telefone': 'parentPhone',
          'observações': 'notes',
          'obs': 'notes',
        };

        Object.keys(row).forEach((key) => {
          const normalized = key.toLowerCase().trim();
          const mappedKey = headerMap[normalized] || key;
          transformed[mappedKey] = row[key];
        });

        return transformed;
      });
    } catch (error: any) {
      throw new Error(`Excel parsing error: ${error.message}`);
    }
  }

  /**
   * Validate import row
   */
  validateRow(row: ImportRow, rowIndex: number): ImportValidationError | null {
    // Required field: fullName
    if (!row.fullName || typeof row.fullName !== 'string' || row.fullName.trim() === '') {
      return {
        row: rowIndex,
        field: 'fullName',
        message: 'Nome completo é obrigatório',
        data: row,
      };
    }

    // Validate gender if provided
    if (row.gender) {
      const gender = String(row.gender).toUpperCase();
      if (!['M', 'F', 'O'].includes(gender)) {
        return {
          row: rowIndex,
          field: 'gender',
          message: 'Gênero deve ser M, F ou O',
          data: row,
        };
      }
    }

    // Validate academicAverage if provided
    if (row.academicAverage !== undefined && row.academicAverage !== null && row.academicAverage !== '') {
      const avg = Number(row.academicAverage);
      if (isNaN(avg) || avg < 0 || avg > 10) {
        return {
          row: rowIndex,
          field: 'academicAverage',
          message: 'Média acadêmica deve estar entre 0 e 10',
          data: row,
        };
      }
    }

    // Validate behavioralScore if provided
    if (row.behavioralScore !== undefined && row.behavioralScore !== null && row.behavioralScore !== '') {
      const score = Number(row.behavioralScore);
      if (isNaN(score) || score < 0 || score > 10) {
        return {
          row: rowIndex,
          field: 'behavioralScore',
          message: 'Nota comportamental deve estar entre 0 e 10',
          data: row,
        };
      }
    }

    // Validate email if provided
    if (row.parentEmail && typeof row.parentEmail === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.parentEmail)) {
        return {
          row: rowIndex,
          field: 'parentEmail',
          message: 'Email inválido',
          data: row,
        };
      }
    }

    return null;
  }

  /**
   * Transform row to CreateStudentDTO
   */
  transformRowToStudent(
    row: ImportRow,
    schoolYearId: number,
    gradeLevelId: number
  ): CreateStudentDTO {
    const student: CreateStudentDTO = {
      schoolYearId,
      gradeLevelId,
      fullName: String(row.fullName).trim(),
    };

    if (row.externalId) {
      student.externalId = String(row.externalId).trim();
    }

    if (row.birthdate) {
      const date = new Date(String(row.birthdate));
      if (!isNaN(date.getTime())) {
        student.birthdate = date;
      }
    }

    if (row.gender) {
      student.gender = String(row.gender).toUpperCase() as 'M' | 'F' | 'O';
    }

    if (row.academicAverage !== undefined && row.academicAverage !== null && row.academicAverage !== '') {
      student.academicAverage = Number(row.academicAverage);
    }

    if (row.behavioralScore !== undefined && row.behavioralScore !== null && row.behavioralScore !== '') {
      student.behavioralScore = Number(row.behavioralScore);
    }

    if (row.hasSpecialNeeds) {
      const value = String(row.hasSpecialNeeds).toLowerCase();
      student.hasSpecialNeeds = ['sim', 'yes', 'true', '1', 's', 'y'].includes(value);
    }

    if (row.specialNeedsDescription) {
      student.specialNeedsDescription = String(row.specialNeedsDescription).trim();
    }

    if (row.parentName) {
      student.parentName = String(row.parentName).trim();
    }

    if (row.parentEmail) {
      student.parentEmail = String(row.parentEmail).trim();
    }

    if (row.parentPhone) {
      student.parentPhone = String(row.parentPhone).trim();
    }

    if (row.notes) {
      student.notes = String(row.notes).trim();
    }

    return student;
  }

  /**
   * Import students from CSV
   */
  async importCSV(
    fileContent: string,
    schoolYearId: number,
    gradeLevelId: number,
    options?: {
      replaceExisting?: boolean;
    }
  ): Promise<ImportResult> {
    try {
      // Parse CSV
      const rows = await this.parseCSV(fileContent);

      return this.processImport(rows, schoolYearId, gradeLevelId, options);
    } catch (error: any) {
      return {
        success: false,
        totalRows: 0,
        successCount: 0,
        errorCount: 1,
        errors: [
          {
            row: 0,
            message: error.message || 'Erro ao processar arquivo CSV',
          },
        ],
      };
    }
  }

  /**
   * Import students from Excel
   */
  async importExcel(
    buffer: Buffer,
    schoolYearId: number,
    gradeLevelId: number,
    options?: {
      replaceExisting?: boolean;
    }
  ): Promise<ImportResult> {
    try {
      // Parse Excel
      const rows = this.parseExcel(buffer);

      return this.processImport(rows, schoolYearId, gradeLevelId, options);
    } catch (error: any) {
      return {
        success: false,
        totalRows: 0,
        successCount: 0,
        errorCount: 1,
        errors: [
          {
            row: 0,
            message: error.message || 'Erro ao processar arquivo Excel',
          },
        ],
      };
    }
  }

  /**
   * Process import (common logic for CSV and Excel)
   */
  private async processImport(
    rows: ImportRow[],
    schoolYearId: number,
    gradeLevelId: number,
    options?: {
      replaceExisting?: boolean;
    }
  ): Promise<ImportResult> {
    const errors: ImportValidationError[] = [];
    const validStudents: CreateStudentDTO[] = [];

    // Validate all rows
    rows.forEach((row, index) => {
      const validationError = this.validateRow(row, index + 1);
      if (validationError) {
        errors.push(validationError);
      } else {
        const student = this.transformRowToStudent(row, schoolYearId, gradeLevelId);
        validStudents.push(student);
      }
    });

    // If there are validation errors, return them
    if (errors.length > 0) {
      return {
        success: false,
        totalRows: rows.length,
        successCount: 0,
        errorCount: errors.length,
        errors,
      };
    }

    // Use transaction for bulk insert
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Replace existing if option is set
      if (options?.replaceExisting) {
        await studentRepository.deleteBySchoolYearAndGrade(schoolYearId, gradeLevelId);
      }

      // Bulk insert
      const createdStudents = await studentRepository.bulkCreate(validStudents, client);

      await client.query('COMMIT');

      return {
        success: true,
        totalRows: rows.length,
        successCount: createdStudents.length,
        errorCount: 0,
        errors: [],
        createdStudents,
      };
    } catch (error: any) {
      await client.query('ROLLBACK');

      return {
        success: false,
        totalRows: rows.length,
        successCount: 0,
        errorCount: 1,
        errors: [
          {
            row: 0,
            message: `Erro ao inserir no banco de dados: ${error.message}`,
          },
        ],
      };
    } finally {
      client.release();
    }
  }

  /**
   * Validate import file before processing (preview mode)
   */
  async validateImport(
    fileContent: string | Buffer,
    fileType: 'csv' | 'excel'
  ): Promise<{
    valid: boolean;
    totalRows: number;
    errors: ImportValidationError[];
    preview: ImportRow[];
  }> {
    try {
      let rows: ImportRow[];

      if (fileType === 'csv') {
        rows = await this.parseCSV(fileContent as string);
      } else {
        rows = this.parseExcel(fileContent as Buffer);
      }

      const errors: ImportValidationError[] = [];

      // Validate first 100 rows for preview
      const previewLimit = Math.min(rows.length, 100);
      for (let i = 0; i < rows.length; i++) {
        const validationError = this.validateRow(rows[i], i + 1);
        if (validationError) {
          errors.push(validationError);
        }
      }

      return {
        valid: errors.length === 0,
        totalRows: rows.length,
        errors,
        preview: rows.slice(0, previewLimit),
      };
    } catch (error: any) {
      return {
        valid: false,
        totalRows: 0,
        errors: [
          {
            row: 0,
            message: error.message || 'Erro ao validar arquivo',
          },
        ],
        preview: [],
      };
    }
  }
}

export default new ImportService();
