import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SessionService } from '../../services/session';
import { ok, badRequest, notFound, unauthorized, internalServerError } from '../../utils/response';
import logger from '../../utils/logger';

const sessionService = new SessionService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const sessionId = event.pathParameters?.['sessionId'];
    if (!sessionId) {
      return badRequest('Session ID is required');
    }

    logger.info('Getting session by ID', { sessionId });

    // Get user from JWT token
    const userFromToken = event.requestContext.authorizer?.['claims'];
    if (!userFromToken) {
      return unauthorized('User not authenticated');
    }

    // Get session
    const session = await sessionService.getSessionById(sessionId);
    
    if (!session) {
      return notFound('Session not found');
    }

    // Check if user owns this session
    if (session.userId !== userFromToken.sub) {
      return unauthorized('You can only access your own sessions');
    }

    logger.info('Session retrieved successfully', { sessionId });
    return ok(session);

  } catch (error) {
    logger.error('Error getting session by ID', error);
    return internalServerError('Failed to get session');
  }
}; 