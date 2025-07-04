import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { WebSocketService } from '../../services/websocket';
import { ok, internalServerError } from '../../utils/response';
import logger from '../../utils/logger';

const websocketService = new WebSocketService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const connectionId = event.requestContext.connectionId;
    
    if (!connectionId) {
      logger.error('No connection ID found in event');
      return internalServerError('Connection ID not found');
    }

    logger.info('Disconnecting WebSocket connection', { connectionId });
    await websocketService.disconnectConnection(connectionId);

    return ok({ message: 'Disconnected successfully' });

  } catch (error) {
    logger.error('Error disconnecting WebSocket', error);
    return internalServerError('Failed to disconnect');
  }
}; 