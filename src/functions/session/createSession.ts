import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SessionService } from '../../services/session';
import { TextService } from '../../services/text';
import { created, badRequest, internalServerError } from '../../utils/response';
import { validateRequest, createSessionSchema, CreateSessionRequest } from '../../utils/validation';
import logger from '../../utils/logger';

const sessionService = new SessionService();
const textService = new TextService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Creating new session');

    // Get user from JWT token
    const userFromToken = event.requestContext.authorizer?.['claims'];
    if (!userFromToken) {
      return badRequest('User not authenticated');
    }

    // Validate request body
    let sessionData: CreateSessionRequest;
    try {
      sessionData = validateRequest(createSessionSchema, JSON.parse(event.body || '{}'));
    } catch (error) {
      return badRequest('Invalid request body');
    }

    // Get text for the session
    const text = await textService.getTextById(sessionData.textId);
    if (!text) {
      return badRequest('Text not found');
    }

    // Create session
    const newSession = await sessionService.createSession({
      ...sessionData,
      userId: userFromToken.sub,
      text: text.text
    });

    logger.info('Session created successfully', { sessionId: newSession.id });
    return created(newSession, 'Session created successfully');

  } catch (error) {
    logger.error('Error creating session', error);
    return internalServerError('Failed to create session');
  }
}; 