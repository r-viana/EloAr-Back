/**
 * Import Validators
 * Joi schemas for import data validation
 */

import Joi from 'joi';

export const importFileSchema = Joi.object({
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

  replaceExisting: Joi.boolean().optional().default(false).messages({
    'boolean.base': 'Substituir existentes deve ser verdadeiro ou falso',
  }),
});

export const validateFileSchema = Joi.object({
  fileType: Joi.string().valid('csv', 'excel').required().messages({
    'string.base': 'Tipo de arquivo deve ser um texto',
    'any.only': 'Tipo de arquivo deve ser "csv" ou "excel"',
    'any.required': 'Tipo de arquivo é obrigatório',
  }),
});
