import { DatabaseService } from './database';
import { User, CreateUserRequest, UpdateUserRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class UserService {
  private db: DatabaseService;
  private tableName: string;

  constructor() {
    this.db = new DatabaseService();
    this.tableName = process.env['USERS_TABLE'] || 'users-dev';
  }

  async createUser(userData: CreateUserRequest & { cognitoId: string }): Promise<User> {
    const now = new Date().toISOString();
    const user: User = {
      id: uuidv4(),
      cognitoId: userData.cognitoId,
      email: userData.email,
      username: userData.username,
      avatar: userData.avatar || '',
      country: userData.country,
      joinDate: now,
      totalTests: 0,
      averageWpm: 0,
      bestWpm: 0,
      totalAccuracy: 0,
      isOnline: false,
      lastActive: now
    };

    await this.db.put(this.tableName, user);
    return user;
  }

  async getUserById(userId: string): Promise<User | null> {
    return await this.db.get<User>(this.tableName, userId);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const params = {
      TableName: this.tableName,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email }
    };

    const result = await this.db.query(params);
    return result.Items && result.Items.length > 0 ? result.Items[0] as User : null;
  }

  async getUserByCognitoId(cognitoId: string): Promise<User | null> {
    const params = {
      TableName: this.tableName,
      IndexName: 'CognitoIdIndex',
      KeyConditionExpression: 'cognitoId = :cognitoId',
      ExpressionAttributeValues: { ':cognitoId': cognitoId }
    };

    const result = await this.db.query(params);
    return result.Items && result.Items.length > 0 ? result.Items[0] as User : null;
  }

  async updateUser(userId: string, updateData: UpdateUserRequest): Promise<User | null> {
    const user = await this.getUserById(userId);
    if (!user) return null;

    const updatedUser: User = {
      ...user,
      ...updateData
    };

    await this.db.put(this.tableName, updatedUser);
    return updatedUser;
  }

  async updateUserStats(userId: string, testResult: {
    wpm: number;
    accuracy: number;
    timeSpent: number;
    wordsTyped: number;
  }): Promise<User | null> {
    const user = await this.getUserById(userId);
    if (!user) return null;

    const newTotalTests = user.totalTests + 1;
    const newAverageWpm = ((user.averageWpm * user.totalTests) + testResult.wpm) / newTotalTests;
    const newAverageAccuracy = ((user.totalAccuracy * user.totalTests) + testResult.accuracy) / newTotalTests;
    const newBestWpm = Math.max(user.bestWpm, testResult.wpm);

    const updatedUser: User = {
      ...user,
      totalTests: newTotalTests,
      averageWpm: Math.round(newAverageWpm * 100) / 100,
      totalAccuracy: Math.round(newAverageAccuracy * 100) / 100,
      bestWpm: newBestWpm
    };

    await this.db.put(this.tableName, updatedUser);
    return updatedUser;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;

    await this.db.delete(this.tableName, userId);
    return true;
  }

  async getLeaderboard(): Promise<User[]> {
    const params = {
      TableName: this.tableName,
      IndexName: 'BestWpmIndex',
      KeyConditionExpression: 'bestWpm > :minWpm',
      ExpressionAttributeValues: { ':minWpm': 0 },
      Limit: 50
    };

    const result = await this.db.query(params);
    const users = result.Items || [];
    
    return users.map((user: any) => ({
      ...user,
      averageWpm: Math.round(user.averageWpm * 100) / 100,
      totalAccuracy: Math.round(user.totalAccuracy * 100) / 100
    }));
  }
} 