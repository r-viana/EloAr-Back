/**
 * Distribution Validator
 * Validation schemas for distribution endpoints
 */

import Joi from 'joi';

// Validate distribution ID parameter
export const distributionIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID deve ser um número',
    'number.integer': 'ID deve ser um número inteiro',
    'number.positive': 'ID deve ser positivo',
    'any.required': 'ID é obrigatório',
  }),
});

// Validate create distribution request
export const createDistributionSchema = Joi.object({
  schoolYearId: Joi.number().integer().positive().required().messages({
    'number.base': 'ID do ano letivo deve ser um número',
    'number.integer': 'ID do ano letivo deve ser um número inteiro',
    'number.positive': 'ID do ano letivo deve ser positivo',
    'any.required': 'Ano letivo é obrigatório',
  }),
  gradeLevelId: Joi.number().integer().positive().required().messages({
    'number.base': 'ID da série deve ser um número',
    'number.integer': 'ID da série deve ser um número inteiro',
    'number.positive': 'ID da série deve ser positivo',
    'any.required': 'Série é obrigatória',
  }),
  configurationId: Joi.number().integer().positive().optional().messages({
    'number.base': 'ID da configuração deve ser um número',
    'number.integer': 'ID da configuração deve ser um número inteiro',
    'number.positive': 'ID da configuração deve ser positivo',
  }),
  name: Joi.string().trim().min(1).max(200).required().messages({
    'string.base': 'Nome deve ser um texto',
    'string.empty': 'Nome não pode estar vazio',
    'string.min': 'Nome deve ter pelo menos 1 caractere',
    'string.max': 'Nome não pode exceder 200 caracteres',
    'any.required': 'Nome é obrigatório',
  }),
});

// Validate update distribution request
export const updateDistributionSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).optional().messages({
    'string.base': 'Nome deve ser um texto',
    'string.empty': 'Nome não pode estar vazio',
    'string.min': 'Nome deve ter pelo menos 1 caractere',
    'string.max': 'Nome não pode exceder 200 caracteres',
  }),
  configurationId: Joi.number().integer().positive().optional().messages({
    'number.base': 'ID da configuração deve ser um número',
    'number.integer': 'ID da configuração deve ser um número inteiro',
    'number.positive': 'ID da configuração deve ser positivo',
  }),
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização',
});
