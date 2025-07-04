import { DatabaseService } from './database';
import { TypingChallenge } from '../types';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

export class ChallengeService {
  private db: DatabaseService;
  private tableName: string;

  constructor() {
    this.db = new DatabaseService();
    this.tableName = process.env['CHALLENGES_TABLE'] || 'challenges';
  }

  async createChallenge(
    challengerId: string,
    opponentId: string,
    difficulty: 'easy' | 'medium' | 'hard' | 'expert',
    timeLimit?: number
  ): Promise<TypingChallenge> {
    const challenge: TypingChallenge = {
      id: uuidv4(),
      challengerId,
      opponentId,
      status: 'pending',
      difficulty,
      ...(timeLimit !== undefined && { timeLimit }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.db.put(this.tableName, challenge);
    logger.info('Challenge created', { challengeId: challenge.id });
    return challenge;
  }

  async getChallengeById(challengeId: string): Promise<TypingChallenge | null> {
    return await this.db.get<TypingChallenge>(this.tableName, challengeId);
  }

  async getUserChallenges(userId: string, status?: string): Promise<TypingChallenge[]> {
    const params: any = {
      TableName: this.tableName,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId }
    };

    if (status) {
      params.FilterExpression = 'status = :status';
      params.ExpressionAttributeValues[':status'] = status;
    }

    const result = await this.db.query(params);
    return result.Items || [];
  }

  async acceptChallenge(challengeId: string): Promise<TypingChallenge | null> {
    const updates: Partial<TypingChallenge> = {
      status: 'accepted',
      updatedAt: new Date().toISOString()
    };

    return await this.db.update<TypingChallenge>(this.tableName, challengeId, updates);
  }

  async declineChallenge(challengeId: string): Promise<TypingChallenge | null> {
    const updates: Partial<TypingChallenge> = {
      status: 'declined',
      updatedAt: new Date().toISOString()
    };

    return await this.db.update<TypingChallenge>(this.tableName, challengeId, updates);
  }

  async startChallenge(challengeId: string): Promise<TypingChallenge | null> {
    const updates: Partial<TypingChallenge> = {
      status: 'in-progress',
      updatedAt: new Date().toISOString()
    };

    return await this.db.update<TypingChallenge>(this.tableName, challengeId, updates);
  }

  async completeChallenge(
    challengeId: string,
    _winner: string
  ): Promise<TypingChallenge | null> {
    try {
      const challenge = await this.getChallengeById(challengeId);
      if (!challenge) {
        return null;
      }

      challenge.status = 'completed';
      challenge.updatedAt = new Date().toISOString();

      await this.db.put(this.tableName, challenge);
      logger.info('Challenge completed', { challengeId });
      return challenge;
    } catch (error) {
      logger.error('Error completing challenge', { challengeId, error });
      throw error;
    }
  }

  async getPendingChallenges(userId: string): Promise<TypingChallenge[]> {
    const params = {
      TableName: this.tableName,
      IndexName: 'OpponentIdStatusIndex',
      KeyConditionExpression: 'opponentId = :opponentId AND status = :status',
      ExpressionAttributeValues: { ':opponentId': userId, ':status': 'pending' }
    };

    const result = await this.db.query(params);
    return result.Items || [];
  }

  async getActiveChallenges(userId: string): Promise<TypingChallenge[]> {
    const params = {
      TableName: this.tableName,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId }
    };

    const result = await this.db.query(params);
    const challenges = result.Items || [];
    
    return challenges.filter((challenge: any) => 
      challenge.status === 'in-progress' || challenge.status === 'accepted'
    );
  }
} 