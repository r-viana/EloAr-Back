/**
 * SchoolYear Validators
 * Joi schemas for school year data validation
 */

import Joi from 'joi';

export const createSchoolYearSchema = Joi.object({
  year: Joi.number().integer().min(2000).max(2100).required().messages({
    'number.base': 'Ano deve ser um número',
    'number.integer': 'Ano deve ser um número inteiro',
    'number.min': 'Ano deve ser no mínimo 2000',
    'number.max': 'Ano deve ser no máximo 2100',
    'any.required': 'Ano é obrigatório',
  }),

  name: Joi.string().trim().min(4).max(100).required().messages({
    'string.base': 'Nome deve ser um texto',
    'string.min': 'Nome deve ter no mínimo 4 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres',
    'any.required': 'Nome é obrigatório',
  }),

  isActive: Joi.boolean().optional().default(false).messages({
    'boolean.base': 'Ativo deve ser verdadeiro ou falso',
  }),

  startDate: Joi.date().optional().allow(null).messages({
    'date.base': 'Data de início deve ser uma data válida',
  }),

  endDate: Joi.date().optional().allow(null).min(Joi.ref('startDate')).messages({
    'date.base': 'Data de término deve ser uma data válida',
    'date.min': 'Data de término deve ser posterior à data de início',
  }),
});

export const updateSchoolYearSchema = Joi.object({
  year: Joi.number().integer().min(2000).max(2100).optional(),
  name: Joi.string().trim().min(4).max(100).optional(),
  isActive: Joi.boolean().optional(),
  startDate: Joi.date().optional().allow(null),
  endDate: Joi.date().optional().allow(null).min(Joi.ref('startDate')),
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização',
});

export const schoolYearIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID deve ser um número',
    'number.integer': 'ID deve ser um número inteiro',
    'number.positive': 'ID deve ser positivo',
    'any.required': 'ID é obrigatório',
  }),
});
