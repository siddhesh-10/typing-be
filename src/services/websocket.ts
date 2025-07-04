import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { DatabaseService } from './database';
import { WebSocketConnection, WebSocketMessage } from '../types';
import logger from '../utils/logger';

export class WebSocketService {
  private db: DatabaseService;
  private tableName: string;
  private endpoint: string;

  constructor() {
    this.db = new DatabaseService();
    this.tableName = process.env['WEBSOCKET_CONNECTIONS_TABLE'] || 'websocket-connections-dev';
    this.endpoint = process.env['WEBSOCKET_ENDPOINT'] || '';
  }

  async connect(connectionId: string, userId: string): Promise<void> {
    const connection: WebSocketConnection = {
      connectionId,
      userId,
      connectedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };

    await this.db.put(this.tableName, connection);
  }

  async getConnection(connectionId: string): Promise<WebSocketConnection | null> {
    try {
      return await this.db.get<WebSocketConnection>(this.tableName, connectionId);
    } catch (error) {
      logger.error('Error getting WebSocket connection', { connectionId, error });
      return null;
    }
  }

  async disconnectConnection(connectionId: string): Promise<void> {
    try {
      const connection = await this.getConnection(connectionId);
      if (connection) {
        await this.db.delete(this.tableName, connection.connectionId);
        logger.info('WebSocket connection disconnected', { connectionId });
      }
    } catch (error) {
      logger.error('Error disconnecting WebSocket connection', { connectionId, error });
      throw error;
    }
  }

  async sendMessage(connectionId: string, message: WebSocketMessage): Promise<boolean> {
    try {
      const client = new ApiGatewayManagementApiClient({
        endpoint: this.endpoint
      });

      const command = new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: JSON.stringify(message)
      });

      await client.send(command);
      return true;
    } catch (error) {
      logger.error('Failed to send WebSocket message:', { connectionId, error });
      return false;
    }
  }

  async broadcastToUser(userId: string, message: WebSocketMessage): Promise<void> {
    const params = {
      TableName: this.tableName,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId }
    };

    const result = await this.db.query(params);
    const connections = result.Items || [];

    for (const connection of connections) {
      await this.sendMessage(connection.connectionId, message);
    }
  }

  async getConnectionsByUserId(userId: string): Promise<WebSocketConnection[]> {
    const params = {
      TableName: this.tableName,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId }
    };

    const result = await this.db.query(params);
    return result.Items || [];
  }

  async updateLastSeen(connectionId: string): Promise<void> {
    const updates = {
      lastSeen: new Date().toISOString()
    };

    await this.db.update(this.tableName, connectionId, updates);
  }

  async cleanupStaleConnections(maxAgeHours: number = 24): Promise<void> {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();
    
    const result = await this.db.scan(this.tableName);
    const staleConnections = result.filter((conn: unknown) => {
      const connection = conn as WebSocketConnection;
      return connection.lastSeen < cutoffTime;
    });

    for (const conn of staleConnections) {
      const connection = conn as WebSocketConnection;
      await this.db.delete(this.tableName, connection.connectionId);
    }
  }
} 