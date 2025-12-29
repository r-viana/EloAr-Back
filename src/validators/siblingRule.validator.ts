/**
 * Sibling Rule Validators
 * Joi schemas for sibling rule data validation
 */

import Joi from 'joi';

export const createSiblingRuleSchema = Joi.object({
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

  ruleType: Joi.string().valid('SAME_CLASS', 'DIFFERENT_CLASS', 'NO_PREFERENCE').required().messages({
    'string.base': 'Tipo de regra deve ser um texto',
    'any.only': 'Tipo de regra deve ser SAME_CLASS (mesma turma), DIFFERENT_CLASS (turmas diferentes) ou NO_PREFERENCE (sem preferência)',
    'any.required': 'Tipo de regra é obrigatório',
  }),

  reason: Joi.string().trim().max(500).optional().allow('').messages({
    'string.base': 'Motivo deve ser um texto',
    'string.max': 'Motivo deve ter no máximo 500 caracteres',
  }),
});

export const updateSiblingRuleSchema = Joi.object({
  ruleType: Joi.string().valid('SAME_CLASS', 'DIFFERENT_CLASS', 'NO_PREFERENCE').optional().messages({
    'string.base': 'Tipo de regra deve ser um texto',
    'any.only': 'Tipo de regra deve ser SAME_CLASS, DIFFERENT_CLASS ou NO_PREFERENCE',
  }),

  reason: Joi.string().trim().max(500).optional().allow('').messages({
    'string.base': 'Motivo deve ser um texto',
    'string.max': 'Motivo deve ter no máximo 500 caracteres',
  }),
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização',
});

export const siblingRuleQuerySchema = Joi.object({
  schoolYearId: Joi.number().integer().positive().optional(),
  studentAId: Joi.number().integer().positive().optional(),
  studentBId: Joi.number().integer().positive().optional(),
  ruleType: Joi.string().valid('SAME_CLASS', 'DIFFERENT_CLASS', 'NO_PREFERENCE').optional(),
  gradeLevelId: Joi.number().integer().positive().optional(),
});

export const siblingRuleIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID deve ser um número',
    'number.integer': 'ID deve ser um número inteiro',
    'number.positive': 'ID deve ser positivo',
    'any.required': 'ID é obrigatório',
  }),
});
