/**
 * Configuration Validators
 * Joi schemas for configuration data validation
 */

import Joi from 'joi';

// Weight configuration schema
const weightConfigSchema = Joi.object({
  critical_constraints: Joi.number().integer().min(0).max(10000).required().messages({
    'number.base': 'Peso de restrições críticas deve ser um número',
    'number.integer': 'Peso de restrições críticas deve ser um inteiro',
    'number.min': 'Peso de restrições críticas deve ser pelo menos 0',
    'number.max': 'Peso de restrições críticas não pode exceder 10000',
    'any.required': 'Peso de restrições críticas é obrigatório',
  }),

  high_constraints: Joi.number().integer().min(0).max(10000).required().messages({
    'number.base': 'Peso de restrições altas deve ser um número',
    'number.integer': 'Peso de restrições altas deve ser um inteiro',
    'number.min': 'Peso de restrições altas deve ser pelo menos 0',
    'number.max': 'Peso de restrições altas não pode exceder 10000',
    'any.required': 'Peso de restrições altas é obrigatório',
  }),

  behavioral_separation: Joi.number().integer().min(0).max(10000).required().messages({
    'number.base': 'Peso de separação comportamental deve ser um número',
    'number.integer': 'Peso de separação comportamental deve ser um inteiro',
    'number.min': 'Peso de separação comportamental deve ser pelo menos 0',
    'number.max': 'Peso de separação comportamental não pode exceder 10000',
    'any.required': 'Peso de separação comportamental é obrigatório',
  }),

  sibling_rules: Joi.number().integer().min(0).max(10000).required().messages({
    'number.base': 'Peso de regras de irmãos deve ser um número',
    'number.integer': 'Peso de regras de irmãos deve ser um inteiro',
    'number.min': 'Peso de regras de irmãos deve ser pelo menos 0',
    'number.max': 'Peso de regras de irmãos não pode exceder 10000',
    'any.required': 'Peso de regras de irmãos é obrigatório',
  }),

  student_preferences: Joi.number().integer().min(0).max(10000).required().messages({
    'number.base': 'Peso de preferências dos alunos deve ser um número',
    'number.integer': 'Peso de preferências dos alunos deve ser um inteiro',
    'number.min': 'Peso de preferências dos alunos deve ser pelo menos 0',
    'number.max': 'Peso de preferências dos alunos não pode exceder 10000',
    'any.required': 'Peso de preferências dos alunos é obrigatório',
  }),

  academic_balance: Joi.number().integer().min(0).max(10000).required().messages({
    'number.base': 'Peso de balanceamento acadêmico deve ser um número',
    'number.integer': 'Peso de balanceamento acadêmico deve ser um inteiro',
    'number.min': 'Peso de balanceamento acadêmico deve ser pelo menos 0',
    'number.max': 'Peso de balanceamento acadêmico não pode exceder 10000',
    'any.required': 'Peso de balanceamento acadêmico é obrigatório',
  }),

  class_size_balance: Joi.number().integer().min(0).max(10000).required().messages({
    'number.base': 'Peso de balanceamento de tamanho de turma deve ser um número',
    'number.integer': 'Peso de balanceamento de tamanho de turma deve ser um inteiro',
    'number.min': 'Peso de balanceamento de tamanho de turma deve ser pelo menos 0',
    'number.max': 'Peso de balanceamento de tamanho de turma não pode exceder 10000',
    'any.required': 'Peso de balanceamento de tamanho de turma é obrigatório',
  }),
});

export const createConfigurationSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    'string.base': 'Nome deve ser um texto',
    'string.empty': 'Nome não pode estar vazio',
    'string.min': 'Nome deve ter pelo menos 1 caractere',
    'string.max': 'Nome deve ter no máximo 100 caracteres',
    'any.required': 'Nome é obrigatório',
  }),

  description: Joi.string().trim().max(500).optional().allow('').messages({
    'string.base': 'Descrição deve ser um texto',
    'string.max': 'Descrição deve ter no máximo 500 caracteres',
  }),

  isDefault: Joi.boolean().optional().messages({
    'boolean.base': 'IsDefault deve ser um booleano',
  }),

  weights: weightConfigSchema.required().messages({
    'any.required': 'Pesos são obrigatórios',
  }),
});

export const updateConfigurationSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional().messages({
    'string.base': 'Nome deve ser um texto',
    'string.empty': 'Nome não pode estar vazio',
    'string.min': 'Nome deve ter pelo menos 1 caractere',
    'string.max': 'Nome deve ter no máximo 100 caracteres',
  }),

  description: Joi.string().trim().max(500).optional().allow('').messages({
    'string.base': 'Descrição deve ser um texto',
    'string.max': 'Descrição deve ter no máximo 500 caracteres',
  }),

  isDefault: Joi.boolean().optional().messages({
    'boolean.base': 'IsDefault deve ser um booleano',
  }),

  weights: weightConfigSchema.optional(),
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização',
});

export const configurationIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID deve ser um número',
    'number.integer': 'ID deve ser um número inteiro',
    'number.positive': 'ID deve ser positivo',
    'any.required': 'ID é obrigatório',
  }),
});
