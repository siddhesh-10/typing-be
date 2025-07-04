import { DatabaseService } from './database';
import { TypingText } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class TextService {
  private db: DatabaseService;
  private tableName: string;

  constructor() {
    this.db = new DatabaseService();
    this.tableName = process.env['TYPING_TEXTS_TABLE'] || 'typing-texts-dev';
  }

  async createText(textData: Omit<TypingText, 'id' | 'createdAt'>): Promise<TypingText> {
    const text: TypingText = {
      id: uuidv4(),
      ...textData,
      createdAt: new Date().toISOString()
    };

    await this.db.put(this.tableName, text);
    return text;
  }

  async getTextById(textId: string): Promise<TypingText | null> {
    return await this.db.get<TypingText>(this.tableName, textId);
  }

  async getTextsByCategory(category: string, limit: number = 10): Promise<TypingText[]> {
    const params = {
      TableName: this.tableName,
      IndexName: 'CategoryIndex',
      KeyConditionExpression: 'category = :category',
      ExpressionAttributeValues: { ':category': category },
      Limit: limit
    };

    const result = await this.db.query(params);
    return result.Items || [];
  }

  async getTextsByDifficulty(difficulty: string, limit: number = 10): Promise<TypingText[]> {
    const params = {
      TableName: this.tableName,
      IndexName: 'DifficultyIndex',
      KeyConditionExpression: 'difficulty = :difficulty',
      ExpressionAttributeValues: { ':difficulty': difficulty },
      Limit: limit
    };

    const result = await this.db.query(params);
    return result.Items || [];
  }

  async getRandomText(category?: string, difficulty?: string): Promise<TypingText | null> {
    let params: any = {
      TableName: this.tableName
    };

    if (category && difficulty) {
      params.IndexName = 'CategoryDifficultyIndex';
      params.KeyConditionExpression = 'category = :category AND difficulty = :difficulty';
      params.ExpressionAttributeValues = { ':category': category, ':difficulty': difficulty };
    } else if (category) {
      params.IndexName = 'CategoryIndex';
      params.KeyConditionExpression = 'category = :category';
      params.ExpressionAttributeValues = { ':category': category };
    } else if (difficulty) {
      params.IndexName = 'DifficultyIndex';
      params.KeyConditionExpression = 'difficulty = :difficulty';
      params.ExpressionAttributeValues = { ':difficulty': difficulty };
    }

    const result = await this.db.query(params);
    const texts = result.Items || [];
    
    if (texts.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * texts.length);
    return texts[randomIndex] as TypingText;
  }

  async updateText(textId: string, updates: Partial<TypingText>): Promise<TypingText | null> {
    return await this.db.update<TypingText>(this.tableName, textId, updates);
  }

  async deleteText(textId: string): Promise<boolean> {
    const text = await this.getTextById(textId);
    if (!text) return false;

    await this.db.delete(this.tableName, textId);
    return true;
  }

  async getAllTexts(limit: number = 100): Promise<TypingText[]> {
    return await this.db.scan<TypingText>(this.tableName, limit);
  }
} 