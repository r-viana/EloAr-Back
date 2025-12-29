/**
 * Student Constraint Validators
 * Joi schemas for student constraint data validation
 */

import Joi from 'joi';

export const createStudentConstraintSchema = Joi.object({
  schoolYearId: Joi.number().integer().positive().required().messages({
    'number.base': 'ID do ano letivo deve ser um número',
    'number.integer': 'ID do ano letivo deve ser um número inteiro',
    'number.positive': 'ID do ano letivo deve ser positivo',
    'any.required': 'ID do ano letivo é obrigatório',
  }),

  studentAId: Joi.number().integer().positive().required().messages({
    'number.base': 'ID do primeiro aluno deve ser um número',
    'number.integer': 'ID do primeiro aluno deve ser um número inteiro',
    'number.positive': 'ID do primeiro aluno deve ser positivo',
    'any.required': 'ID do primeiro aluno é obrigatório',
  }),

  studentBId: Joi.number().integer().positive().required().messages({
    'number.base': 'ID do segundo aluno deve ser um número',
    'number.integer': 'ID do segundo aluno deve ser um número inteiro',
    'number.positive': 'ID do segundo aluno deve ser positivo',
    'any.required': 'ID do segundo aluno é obrigatório',
  }),

  constraintTypeId: Joi.number().integer().positive().required().messages({
    'number.base': 'ID do tipo de restrição deve ser um número',
    'number.integer': 'ID do tipo de restrição deve ser um número inteiro',
    'number.positive': 'ID do tipo de restrição deve ser positivo',
    'any.required': 'ID do tipo de restrição é obrigatório',
  }),

  action: Joi.string().valid('SEPARATE', 'GROUP').required().messages({
    'string.base': 'Ação deve ser um texto',
    'any.only': 'Ação deve ser SEPARATE (separar) ou GROUP (agrupar)',
    'any.required': 'Ação é obrigatória',
  }),

  reason: Joi.string().trim().max(500).optional().allow('').messages({
    'string.base': 'Motivo deve ser um texto',
    'string.max': 'Motivo deve ter no máximo 500 caracteres',
  }),

  createdBy: Joi.string().trim().max(100).optional().allow('').messages({
    'string.base': 'Criado por deve ser um texto',
    'string.max': 'Criado por deve ter no máximo 100 caracteres',
  }),
});

export const updateStudentConstraintSchema = Joi.object({
  constraintTypeId: Joi.number().integer().positive().optional().messages({
    'number.base': 'ID do tipo de restrição deve ser um número',
    'number.integer': 'ID do tipo de restrição deve ser um número inteiro',
    'number.positive': 'ID do tipo de restrição deve ser positivo',
  }),

  action: Joi.string().valid('SEPARATE', 'GROUP').optional().messages({
    'string.base': 'Ação deve ser um texto',
    'any.only': 'Ação deve ser SEPARATE ou GROUP',
  }),

  reason: Joi.string().trim().max(500).optional().allow('').messages({
    'string.base': 'Motivo deve ser um texto',
    'string.max': 'Motivo deve ter no máximo 500 caracteres',
  }),
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização',
});

export const studentConstraintQuerySchema = Joi.object({
  schoolYearId: Joi.number().integer().positive().optional(),
  studentAId: Joi.number().integer().positive().optional(),
  studentBId: Joi.number().integer().positive().optional(),
  constraintTypeId: Joi.number().integer().positive().optional(),
  action: Joi.string().valid('SEPARATE', 'GROUP').optional(),
});

export const studentConstraintIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID deve ser um número',
    'number.integer': 'ID deve ser um número inteiro',
    'number.positive': 'ID deve ser positivo',
    'any.required': 'ID é obrigatório',
  }),
});
