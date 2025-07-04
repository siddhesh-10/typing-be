import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { WebSocketService } from '../../services/websocket';
import { ok, unauthorized, internalServerError } from '../../utils/response';
import logger from '../../utils/logger';

const websocketService = new WebSocketService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const connectionId = event.requestContext.connectionId;
    const userId = event.queryStringParameters?.['userId'];
    
    logger.info('WebSocket connect', { connectionId, userId });

    if (!connectionId) {
      return internalServerError('Connection ID is missing');
    }

    if (!userId) {
      return unauthorized('User ID is required for connection');
    }

    // Store connection in database
    await websocketService.connect(connectionId, userId);

    logger.info('WebSocket connected successfully', { connectionId, userId });
    return ok({ message: 'Connected successfully' });

  } catch (error) {
    logger.error('Error in WebSocket connect', error);
    return internalServerError('Failed to connect');
  }
}; 