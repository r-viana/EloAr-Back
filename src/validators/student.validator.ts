/**
 * Student Validators
 * Joi schemas for student data validation
 */

import Joi from 'joi';

export const createStudentSchema = Joi.object({
  schoolYearId: Joi.number().integer().positive().required().messages({
    'number.base': 'ID do ano letivo deve ser um número',
    'number.integer': 'ID do ano letivo deve ser um número inteiro',
    'number.positive': 'ID do ano letivo deve ser positivo',
    'any.required': 'ID do ano letivo é obrigatório',
  }),

  gradeLevelId: Joi.number().integer().positive().required().messages({
    'number.base': 'ID da série deve ser um número',
    'number.integer': 'ID da série deve ser um número inteiro',
    'number.positive': 'ID da série deve ser positivo',
    'any.required': 'ID da série é obrigatório',
  }),

  externalId: Joi.string().trim().max(50).optional().allow(null, '').messages({
    'string.base': 'ID externo deve ser um texto',
    'string.max': 'ID externo deve ter no máximo 50 caracteres',
  }),

  fullName: Joi.string().trim().min(3).max(255).required().messages({
    'string.base': 'Nome completo deve ser um texto',
    'string.min': 'Nome completo deve ter no mínimo 3 caracteres',
    'string.max': 'Nome completo deve ter no máximo 255 caracteres',
    'any.required': 'Nome completo é obrigatório',
  }),

  birthdate: Joi.date().optional().allow(null).messages({
    'date.base': 'Data de nascimento deve ser uma data válida',
  }),

  gender: Joi.string().valid('M', 'F', 'O').optional().allow(null).messages({
    'string.base': 'Gênero deve ser um texto',
    'any.only': 'Gênero deve ser M (Masculino), F (Feminino) ou O (Outro)',
  }),

  academicAverage: Joi.number().min(0).max(10).precision(2).optional().allow(null).messages({
    'number.base': 'Média acadêmica deve ser um número',
    'number.min': 'Média acadêmica deve ser no mínimo 0',
    'number.max': 'Média acadêmica deve ser no máximo 10',
  }),

  behavioralScore: Joi.number().min(0).max(10).precision(1).optional().allow(null).messages({
    'number.base': 'Nota comportamental deve ser um número',
    'number.min': 'Nota comportamental deve ser no mínimo 0',
    'number.max': 'Nota comportamental deve ser no máximo 10',
  }),

  hasSpecialNeeds: Joi.boolean().optional().default(false).messages({
    'boolean.base': 'Necessidades especiais deve ser verdadeiro ou falso',
  }),

  specialNeedsDescription: Joi.string().trim().max(1000).optional().allow(null, '').messages({
    'string.base': 'Descrição de necessidades especiais deve ser um texto',
    'string.max': 'Descrição de necessidades especiais deve ter no máximo 1000 caracteres',
  }),

  parentName: Joi.string().trim().max(255).optional().allow(null, '').messages({
    'string.base': 'Nome do responsável deve ser um texto',
    'string.max': 'Nome do responsável deve ter no máximo 255 caracteres',
  }),

  parentEmail: Joi.string().email().trim().max(255).optional().allow(null, '').messages({
    'string.base': 'Email do responsável deve ser um texto',
    'string.email': 'Email do responsável deve ser um email válido',
    'string.max': 'Email do responsável deve ter no máximo 255 caracteres',
  }),

  parentPhone: Joi.string().trim().max(20).optional().allow(null, '').messages({
    'string.base': 'Telefone do responsável deve ser um texto',
    'string.max': 'Telefone do responsável deve ter no máximo 20 caracteres',
  }),

  notes: Joi.string().trim().max(2000).optional().allow(null, '').messages({
    'string.base': 'Observações devem ser um texto',
    'string.max': 'Observações devem ter no máximo 2000 caracteres',
  }),
});

export const updateStudentSchema = Joi.object({
  externalId: Joi.string().trim().max(50).optional().allow(null, ''),
  fullName: Joi.string().trim().min(3).max(255).optional(),
  birthdate: Joi.date().optional().allow(null),
  gender: Joi.string().valid('M', 'F', 'O').optional().allow(null),
  academicAverage: Joi.number().min(0).max(10).precision(2).optional().allow(null),
  behavioralScore: Joi.number().min(0).max(10).precision(1).optional().allow(null),
  hasSpecialNeeds: Joi.boolean().optional(),
  specialNeedsDescription: Joi.string().trim().max(1000).optional().allow(null, ''),
  parentName: Joi.string().trim().max(255).optional().allow(null, ''),
  parentEmail: Joi.string().email().trim().max(255).optional().allow(null, ''),
  parentPhone: Joi.string().trim().max(20).optional().allow(null, ''),
  notes: Joi.string().trim().max(2000).optional().allow(null, ''),
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização',
});

export const studentQuerySchema = Joi.object({
  schoolYearId: Joi.number().integer().positive().optional(),
  gradeLevelId: Joi.number().integer().positive().optional(),
  search: Joi.string().trim().min(1).max(100).optional(),
  limit: Joi.number().integer().min(1).max(500).optional().default(50),
  offset: Joi.number().integer().min(0).optional().default(0),
});

export const studentIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID deve ser um número',
    'number.integer': 'ID deve ser um número inteiro',
    'number.positive': 'ID deve ser positivo',
    'any.required': 'ID é obrigatório',
  }),
});
