/**
 * Class Validators
 * Joi schemas for class data validation
 */

import Joi from 'joi';

export const createClassSchema = Joi.object({
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

  name: Joi.string().trim().min(2).max(10).required().messages({
    'string.base': 'Nome da turma deve ser um texto',
    'string.min': 'Nome da turma deve ter no mínimo 2 caracteres',
    'string.max': 'Nome da turma deve ter no máximo 10 caracteres',
    'any.required': 'Nome da turma é obrigatório',
  }),

  section: Joi.string().trim().length(1).uppercase().required().messages({
    'string.base': 'Seção deve ser um texto',
    'string.length': 'Seção deve ter exatamente 1 caractere',
    'any.required': 'Seção é obrigatória',
  }),

  capacity: Joi.number().integer().min(1).max(100).optional().default(45).messages({
    'number.base': 'Capacidade deve ser um número',
    'number.integer': 'Capacidade deve ser um número inteiro',
    'number.min': 'Capacidade deve ser no mínimo 1',
    'number.max': 'Capacidade deve ser no máximo 100',
  }),

  currentCount: Joi.number().integer().min(0).optional().default(0).messages({
    'number.base': 'Contagem atual deve ser um número',
    'number.integer': 'Contagem atual deve ser um número inteiro',
    'number.min': 'Contagem atual deve ser no mínimo 0',
  }),
});

export const updateClassSchema = Joi.object({
  name: Joi.string().trim().min(2).max(10).optional(),
  section: Joi.string().trim().length(1).uppercase().optional(),
  capacity: Joi.number().integer().min(1).max(100).optional(),
  currentCount: Joi.number().integer().min(0).optional(),
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização',
});

export const classQuerySchema = Joi.object({
  schoolYearId: Joi.number().integer().positive().optional(),
  gradeLevelId: Joi.number().integer().positive().optional(),
});

export const classIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID deve ser um número',
    'number.integer': 'ID deve ser um número inteiro',
    'number.positive': 'ID deve ser positivo',
    'any.required': 'ID é obrigatório',
  }),
});
