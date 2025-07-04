import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ok, badRequest, internalServerError } from '../../utils/response';
import logger from '../../utils/logger';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const connectionId = event.requestContext.connectionId;
    const body = event.body ? JSON.parse(event.body) : {};
    
    logger.info('WebSocket default message', { connectionId, body });

    // Handle different message types
    const { action, data } = body;

    switch (action) {
      case 'ping':
        return ok({ action: 'pong', timestamp: new Date().toISOString() });
      
      case 'challenge':
        // Handle challenge request
        logger.info('Challenge request received', { connectionId, data });
        return ok({ action: 'challenge_received', data });
      
      case 'typing_progress':
        // Handle typing progress update
        logger.info('Typing progress received', { connectionId, data });
        return ok({ action: 'progress_received', data });
      
      default:
        logger.warn('Unknown WebSocket action', { connectionId, action });
        return badRequest('Unknown action');
    }

  } catch (error) {
    logger.error('Error in WebSocket default handler', error);
    return internalServerError('Failed to process message');
  }
}; 