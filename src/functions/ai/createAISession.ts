import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AIService } from '../../services/ai';
import { created, badRequest, unauthorized, internalServerError } from '../../utils/response';
import { validateRequest, createAISessionSchema, CreateAISessionRequest } from '../../utils/validation';
import logger from '../../utils/logger';

const aiService = new AIService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Creating new AI session');

    // Get user from JWT token
    const userFromToken = event.requestContext.authorizer?.['claims'];
    if (!userFromToken) {
      return unauthorized('User not authenticated');
    }

    // Validate request body
    let sessionData: CreateAISessionRequest;
    try {
      sessionData = validateRequest(createAISessionSchema, JSON.parse(event.body || '{}'));
    } catch (error) {
      return badRequest('Invalid request body');
    }

    // Create AI session
    const newSession = await aiService.createAISession(
      userFromToken.sub,
      sessionData.aiLevel,
      sessionData.difficulty,
      sessionData.category
    );

    logger.info('AI session created successfully', { sessionId: newSession.id });
    return created(newSession, 'AI session created successfully');

  } catch (error) {
    logger.error('Error creating AI session', error);
    return internalServerError('Failed to create AI session');
  }
}; 