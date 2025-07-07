const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

class TextService {
  constructor() {
    this.tableName = process.env['TYPING_TEXTS_TABLE'] || 'typing-texts-dev';
    this.client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env['AWS_REGION'] || 'us-east-1' }));
  }

  async getRandomText(category, difficulty) {
    let params = { TableName: this.tableName };
    let indexName = null;
    let keyCondition = null;
    let exprAttrValues = {};

    if (category && difficulty) {
      indexName = 'CategoryDifficultyIndex';
      keyCondition = 'category = :category AND difficulty = :difficulty';
      exprAttrValues = { ':category': category, ':difficulty': difficulty };
    } else if (category) {
      indexName = 'CategoryIndex';
      keyCondition = 'category = :category';
      exprAttrValues = { ':category': category };
    } else if (difficulty) {
      indexName = 'DifficultyIndex';
      keyCondition = 'difficulty = :difficulty';
      exprAttrValues = { ':difficulty': difficulty };
    }

    let items = [];
    try {
      if (indexName) {
        params.IndexName = indexName;
        params.KeyConditionExpression = keyCondition;
        params.ExpressionAttributeValues = exprAttrValues;
        params.Limit = 50; // limit for performance
        const result = await this.client.send(new QueryCommand(params));
        items = result.Items || [];
      } else {
        // fallback: scan a few items
        params.Limit = 50;
        const result = await this.client.send(new ScanCommand(params));
        items = result.Items || [];
      }
    } catch (err) {
      console.error('DynamoDB error:', err);
      return null;
    }
    if (!items.length) return null;
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
  }
}

module.exports = { TextService }; 