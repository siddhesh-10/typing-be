import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SessionService } from '../../services/session';
import { ok, badRequest, unauthorized, internalServerError } from '../../utils/response';
import logger from '../../utils/logger';

const sessionService = new SessionService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.['userId'];
    if (!userId) {
      return badRequest('User ID is required');
    }

    logger.info('Getting user sessions', { userId });

    // Get user from JWT token
    const userFromToken = event.requestContext.authorizer?.['claims'];
    if (!userFromToken) {
      return unauthorized('User not authenticated');
    }

    // Check if user is requesting their own sessions
    if (userFromToken.sub !== userId) {
      return unauthorized('You can only access your own sessions');
    }

    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams['limit'] || '20');

    // Get user sessions
    const sessions = await sessionService.getUserSessions(userId, limit);

    logger.info('User sessions retrieved successfully', { userId, count: sessions.length });
    return ok(sessions);

  } catch (error) {
    logger.error('Error getting user sessions', error);
    return internalServerError('Failed to get user sessions');
  }
}; 