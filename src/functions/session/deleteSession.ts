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

    logger.info('Deleting session', { sessionId });

    // Get user from JWT token
    const userFromToken = event.requestContext.authorizer?.['claims'];
    if (!userFromToken) {
      return unauthorized('User not authenticated');
    }

    // Delete session
    const deleted = await sessionService.deleteSession(sessionId);
    
    if (!deleted) {
      return notFound('Session not found');
    }

    logger.info('Session deleted successfully', { sessionId });
    return ok({ message: 'Session deleted successfully' });

  } catch (error) {
    logger.error('Error deleting session', error);
    return internalServerError('Failed to delete session');
  }
}; 