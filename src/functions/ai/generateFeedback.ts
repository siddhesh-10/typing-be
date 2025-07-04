import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AIService } from '../../services/ai';
import { ok, badRequest, unauthorized, internalServerError } from '../../utils/response';
import logger from '../../utils/logger';

const aiService = new AIService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Generating AI feedback');

    // Get user from JWT token
    const userFromToken = event.requestContext.authorizer?.['claims'];
    if (!userFromToken) {
      return unauthorized('User not authenticated');
    }

    // Parse request body
    let sessionData;
    try {
      sessionData = JSON.parse(event.body || '{}');
    } catch (error) {
      return badRequest('Invalid request body');
    }

    // Validate required fields
    if (!sessionData.wpm || !sessionData.accuracy || !sessionData.sessionId) {
      return badRequest('Missing required fields: wpm, accuracy, sessionId');
    }

    // Create a mock session object for feedback generation
    const mockSession = {
      id: sessionData.sessionId,
      userId: userFromToken.sub,
      aiLevel: sessionData.aiLevel || 'intermediate',
      text: sessionData.text || '',
      startTime: new Date().toISOString(),
      aiWpm: 0,
      aiAccuracy: 0,
      userWpm: 0,
      userAccuracy: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Generate feedback
    const feedback = await aiService.generateFeedback(mockSession, sessionData.wpm, sessionData.accuracy);

    logger.info('AI feedback generated successfully');
    return ok(feedback);

  } catch (error) {
    logger.error('Error generating AI feedback', error);
    return internalServerError('Failed to generate feedback');
  }
}; 