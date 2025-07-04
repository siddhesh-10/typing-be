import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SessionService } from '../../services/session';
import { ok, badRequest, notFound, unauthorized, internalServerError } from '../../utils/response';
import { validateRequest, updateSessionSchema, UpdateSessionRequest } from '../../utils/validation';
import logger from '../../utils/logger';

const sessionService = new SessionService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const sessionId = event.pathParameters?.['sessionId'];
    if (!sessionId) {
      return badRequest('Session ID is required');
    }

    logger.info('Updating session', { sessionId });

    // Get user from JWT token
    const userFromToken = event.requestContext.authorizer?.['claims'];
    if (!userFromToken) {
      return unauthorized('User not authenticated');
    }

    // Validate request body
    let updateData: UpdateSessionRequest;
    try {
      updateData = validateRequest(updateSessionSchema, JSON.parse(event.body || '{}'));
    } catch (error) {
      return badRequest('Invalid request body');
    }

    // Update session
    const updatedSession = await sessionService.updateSession(sessionId, updateData);
    
    if (!updatedSession) {
      return notFound('Session not found');
    }

    logger.info('Session updated successfully', { sessionId });
    return ok(updatedSession, 'Session updated successfully');

  } catch (error) {
    logger.error('Error updating session', error);
    return internalServerError('Failed to update session');
  }
}; 