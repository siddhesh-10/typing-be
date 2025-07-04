import { DatabaseService } from './database';
import { TypingSession, CreateSessionRequest, UpdateSessionRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class SessionService {
  private db: DatabaseService;
  private tableName: string;

  constructor() {
    this.db = new DatabaseService();
    this.tableName = process.env['SESSIONS_TABLE'] || 'sessions-dev';
  }

  async createSession(sessionData: CreateSessionRequest & { userId: string; text: string }): Promise<TypingSession> {
    const now = new Date().toISOString();
    const session: TypingSession = {
      id: uuidv4(),
      userId: sessionData.userId,
      text: sessionData.text,
      words: sessionData.text.split(' '),
      startTime: now,
      duration: 0,
      wpm: 0,
      accuracy: 0,
      errors: 0,
      totalWords: sessionData.text.split(' ').length,
      completedWords: 0,
      isCompleted: false,
      mode: sessionData.mode,
      difficulty: sessionData.difficulty,
      category: sessionData.category || 'general',
      createdAt: now,
      updatedAt: now
    };

    await this.db.put(this.tableName, session);
    return session;
  }

  async getSessionById(sessionId: string): Promise<TypingSession | null> {
    return await this.db.get<TypingSession>(this.tableName, sessionId);
  }

  async getUserSessions(userId: string, limit: number = 20): Promise<TypingSession[]> {
    const params = {
      TableName: this.tableName,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      Limit: limit,
      ScanIndexForward: false
    };

    const result = await this.db.query(params);
    return result.Items || [];
  }

  async getBestSessions(userId: string, limit: number = 10): Promise<TypingSession[]> {
    const params = {
      TableName: this.tableName,
      IndexName: 'UserIdWpmIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      Limit: limit,
      ScanIndexForward: false
    };

    const result = await this.db.query(params);
    return result.Items || [];
  }

  async getRecentSessions(userId: string, limit: number = 10): Promise<TypingSession[]> {
    const params = {
      TableName: this.tableName,
      IndexName: 'UserIdCreatedAtIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      Limit: limit,
      ScanIndexForward: false
    };

    const result = await this.db.query(params);
    return result.Items || [];
  }

  async updateSession(sessionId: string, updateData: UpdateSessionRequest): Promise<TypingSession | null> {
    const updates = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return await this.db.update<TypingSession>(this.tableName, sessionId, updates);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const session = await this.getSessionById(sessionId);
    if (!session) return false;

    await this.db.delete(this.tableName, sessionId);
    return true;
  }

  async getSessionsByMode(userId: string, mode: string, limit: number = 20): Promise<TypingSession[]> {
    const params = {
      TableName: this.tableName,
      IndexName: 'UserIdModeIndex',
      KeyConditionExpression: 'userId = :userId AND mode = :mode',
      ExpressionAttributeValues: { ':userId': userId, ':mode': mode },
      Limit: limit,
      ScanIndexForward: false
    };

    const result = await this.db.query(params);
    return result.Items || [];
  }

  async getSessionsByDifficulty(userId: string, difficulty: string, limit: number = 20): Promise<TypingSession[]> {
    const params = {
      TableName: this.tableName,
      IndexName: 'UserIdDifficultyIndex',
      KeyConditionExpression: 'userId = :userId AND difficulty = :difficulty',
      ExpressionAttributeValues: { ':userId': userId, ':difficulty': difficulty },
      Limit: limit,
      ScanIndexForward: false
    };

    const result = await this.db.query(params);
    return result.Items || [];
  }
} 