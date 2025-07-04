import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import logger from '../utils/logger';

export class DatabaseService {
  private client: DynamoDBDocumentClient;

  constructor() {
    const dynamoClient = new DynamoDBClient({
      region: process.env['AWS_REGION'] || 'us-east-1'
    });
    this.client = DynamoDBDocumentClient.from(dynamoClient);
  }

  generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async get<T>(tableName: string, id: string): Promise<T | null> {
    try {
      const command = new GetCommand({
        TableName: tableName,
        Key: { id }
      });

      const response = await this.client.send(command);
      return response.Item as T || null;
    } catch (error) {
      logger.error('Database get error:', { tableName, id, error });
      throw new Error(`Failed to get item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async put<T extends Record<string, any>>(tableName: string, item: T): Promise<void> {
    try {
      const command = new PutCommand({
        TableName: tableName,
        Item: item
      });

      await this.client.send(command);
    } catch (error) {
      logger.error('Database put error:', { tableName, error });
      throw new Error(`Failed to put item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update<T>(tableName: string, id: string, updates: Partial<T>): Promise<T | null> {
    try {
      const updateExpression: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          const attributeName = `#${key}`;
          const attributeValue = `:${key}`;
          
          updateExpression.push(`${attributeName} = ${attributeValue}`);
          expressionAttributeNames[attributeName] = key;
          expressionAttributeValues[attributeValue] = value;
        }
      });

      if (updateExpression.length === 0) {
        return this.get<T>(tableName, id);
      }

      const command = new UpdateCommand({
        TableName: tableName,
        Key: { id },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      });

      const response = await this.client.send(command);
      return response.Attributes as T || null;
    } catch (error) {
      logger.error('Database update error:', { tableName, id, error });
      throw new Error(`Failed to update item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(tableName: string, id: string): Promise<void> {
    try {
      const command = new DeleteCommand({
        TableName: tableName,
        Key: { id }
      });

      await this.client.send(command);
    } catch (error) {
      logger.error('Database delete error:', { tableName, id, error });
      throw new Error(`Failed to delete item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async query(params: any): Promise<any> {
    try {
      const command = new QueryCommand(params);
      const response = await this.client.send(command);
      return response;
    } catch (error) {
      logger.error('Database query error:', { params, error });
      throw new Error(`Failed to query items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async scan<T>(tableName: string, limit?: number): Promise<T[]> {
    try {
      const command = new ScanCommand({
        TableName: tableName,
        Limit: limit
      });

      const response = await this.client.send(command);
      return response.Items as T[] || [];
    } catch (error) {
      logger.error('Database scan error:', { tableName, error });
      throw new Error(`Failed to scan items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 