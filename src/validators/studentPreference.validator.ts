/**
 * Student Preference Validators
 * Joi schemas for student preference data validation
 */

import Joi from 'joi';

export const createStudentPreferenceSchema = Joi.object({
  studentId: Joi.number().integer().positive().required().messages({
    'number.base': 'ID do aluno deve ser um número',
    'number.integer': 'ID do aluno deve ser um número inteiro',
    'number.positive': 'ID do aluno deve ser positivo',
    'any.required': 'ID do aluno é obrigatório',
  }),

  preferredStudentId: Joi.number().integer().positive().required().messages({
    'number.base': 'ID do aluno preferido deve ser um número',
    'number.integer': 'ID do aluno preferido deve ser um número inteiro',
    'number.positive': 'ID do aluno preferido deve ser positivo',
    'any.required': 'ID do aluno preferido é obrigatório',
  }),

  priority: Joi.number().integer().valid(1, 2, 3).required().messages({
    'number.base': 'Prioridade deve ser um número',
    'number.integer': 'Prioridade deve ser um número inteiro',
    'any.only': 'Prioridade deve ser 1 (primeira escolha), 2 (segunda escolha) ou 3 (terceira escolha)',
    'any.required': 'Prioridade é obrigatória',
  }),
});

export const updateStudentPreferenceSchema = Joi.object({
  preferredStudentId: Joi.number().integer().positive().optional().messages({
    'number.base': 'ID do aluno preferido deve ser um número',
    'number.integer': 'ID do aluno preferido deve ser um número inteiro',
    'number.positive': 'ID do aluno preferido deve ser positivo',
  }),

  priority: Joi.number().integer().valid(1, 2, 3).optional().messages({
    'number.base': 'Prioridade deve ser um número',
    'number.integer': 'Prioridade deve ser um número inteiro',
    'any.only': 'Prioridade deve ser 1, 2 ou 3',
  }),
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização',
});

export const studentPreferenceQuerySchema = Joi.object({
  studentId: Joi.number().integer().positive().optional(),
  preferredStudentId: Joi.number().integer().positive().optional(),
  priority: Joi.number().integer().valid(1, 2, 3).optional(),
  schoolYearId: Joi.number().integer().positive().optional(),
  gradeLevelId: Joi.number().integer().positive().optional(),
});

export const studentPreferenceIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID deve ser um número',
    'number.integer': 'ID deve ser um número inteiro',
    'number.positive': 'ID deve ser positivo',
    'any.required': 'ID é obrigatório',
  }),
});

export const bulkPreferencesSchema = Joi.object({
  studentId: Joi.number().integer().positive().required().messages({
    'any.required': 'ID do aluno é obrigatório',
  }),

  preferences: Joi.array().items(
    Joi.object({
      preferredStudentId: Joi.number().integer().positive().required().messages({
        'any.required': 'ID do aluno preferido é obrigatório',
      }),
      priority: Joi.number().integer().valid(1, 2, 3).required().messages({
        'any.required': 'Prioridade é obrigatória',
      }),
    })
  ).min(1).max(3).required().messages({
    'array.min': 'Pelo menos uma preferência deve ser fornecida',
    'array.max': 'Máximo de 3 preferências permitidas',
    'any.required': 'Lista de preferências é obrigatória',
  }),
});
