import Joi from 'joi';
import { badRequest } from './response';

// Common validation schemas
export const idSchema = Joi.string().required().min(1);
export const emailSchema = Joi.string().email().required();
export const usernameSchema = Joi.string().min(3).max(50).required();
export const passwordSchema = Joi.string().min(8).required();

// User validation schemas
export const createUserSchema = Joi.object({
  username: usernameSchema,
  email: emailSchema,
  country: Joi.string().required().min(2).max(3),
  cognitoId: Joi.string().required()
});

export const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(50).optional(),
  avatar: Joi.string().uri().optional(),
  country: Joi.string().min(2).max(3).optional()
});

// Text validation schemas
export const createTextSchema = Joi.object({
  text: Joi.string().required().min(10),
  category: Joi.string().required(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert').required(),
  language: Joi.string().default('en'),
  source: Joi.string().optional()
});

export const updateTextSchema = Joi.object({
  text: Joi.string().min(10).optional(),
  category: Joi.string().optional(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert').optional(),
  language: Joi.string().optional(),
  source: Joi.string().optional()
});

// Session validation schemas
export const createSessionSchema = Joi.object({
  textId: idSchema,
  mode: Joi.string().valid('practice', 'challenge', 'ai').required(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert').required(),
  category: Joi.string().optional(),
  timeLimit: Joi.number().min(1).max(60).optional()
});

export const updateSessionSchema = Joi.object({
  endTime: Joi.string().isoDate().required(),
  duration: Joi.number().min(0).required(),
  wpm: Joi.number().min(0).required(),
  accuracy: Joi.number().min(0).max(100).required(),
  errors: Joi.number().min(0).required(),
  completedWords: Joi.number().min(0).required(),
  isCompleted: Joi.boolean().required()
});

// Challenge validation schemas
export const createChallengeSchema = Joi.object({
  opponentId: idSchema,
  difficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert').required(),
  timeLimit: Joi.number().min(1).max(60).optional()
});

// AI Session validation schemas
export const createAISessionSchema = Joi.object({
  aiLevel: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').required(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert').required(),
  category: Joi.string().optional()
});

// Query parameter schemas
export const paginationSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

export const textFilterSchema = Joi.object({
  category: Joi.string().optional(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert').optional(),
  language: Joi.string().optional()
});

// Validation helper function
export const validateRequest = <T>(
  schema: Joi.ObjectSchema,
  data: any
): T => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessage = error.details
      .map(detail => detail.message)
      .join(', ');
    throw new Error(`Validation error: ${errorMessage}`);
  }

  return value as T;
};

// Middleware for Lambda validation
export const withValidation = <T>(
  schema: Joi.ObjectSchema,
  handler: (event: any, context: any, validatedData: T) => Promise<any>
) => {
  return async (event: any, context: any) => {
    try {
      const body = event.body ? JSON.parse(event.body) : {};
      const validatedData = validateRequest<T>(schema, body);
      return await handler(event, context, validatedData);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Validation error')) {
        return badRequest(error.message);
      }
      throw error;
    }
  };
};

// Query parameter validation
export const validateQueryParams = <T>(
  schema: Joi.ObjectSchema,
  queryParams: any
): T => {
  return validateRequest<T>(schema, queryParams);
};

// Export types for TypeScript
export type CreateUserRequest = {
  username: string;
  email: string;
  country: string;
  avatar?: string;
};

export type UpdateUserRequest = {
  username?: string;
  avatar?: string;
  country?: string;
};

export type CreateSessionRequest = {
  textId: string;
  mode: 'practice' | 'challenge' | 'ai';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category?: string;
  timeLimit?: number;
};

export type UpdateSessionRequest = {
  endTime: string;
  duration: number;
  wpm: number;
  accuracy: number;
  errors: number;
  completedWords: number;
  isCompleted: boolean;
};

export type CreateChallengeRequest = {
  opponentId: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  timeLimit?: number;
};

export type CreateAISessionRequest = {
  aiLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category?: string;
}; 