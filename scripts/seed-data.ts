import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import * as fs from 'fs';
import * as path from 'path';

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

interface TypingText {
  id: string;
  text: string;
  words: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  language: string;
  source?: string;
  wordCount: number;
  estimatedTime: number;
  createdAt: string;
}

async function seedTypingTexts() {
  try {
    console.log('Seeding typing texts...');
    
    const textsPath = path.join(__dirname, '../data/initial-data/typing-texts.json');
    const textsData = JSON.parse(fs.readFileSync(textsPath, 'utf8'));
    
    const tableName = process.env.TYPING_TEXTS_TABLE_NAME;
    if (!tableName) {
      throw new Error('TYPING_TEXTS_TABLE_NAME environment variable is required');
    }

    const texts: TypingText[] = textsData.typingTexts.map((text: any) => ({
      ...text,
      createdAt: new Date().toISOString()
    }));

    // Split into batches of 25 (DynamoDB batch write limit)
    const batches = [];
    for (let i = 0; i < texts.length; i += 25) {
      batches.push(texts.slice(i, i + 25));
    }

    for (const batch of batches) {
      const writeRequests = batch.map(text => ({
        PutRequest: {
          Item: text
        }
      }));

      const command = new BatchWriteCommand({
        RequestItems: {
          [tableName]: writeRequests
        }
      });

      await docClient.send(command);
      console.log(`Inserted batch of ${batch.length} texts`);
    }

    console.log(`Successfully seeded ${texts.length} typing texts`);
  } catch (error) {
    console.error('Error seeding typing texts:', error);
    throw error;
  }
}

async function main() {
  const stage = process.argv[2] || 'dev';
  
  console.log(`Seeding data for stage: ${stage}`);
  
  // Load environment variables based on stage
  const envPath = path.join(__dirname, `../env.${stage}`);
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }

  try {
    await seedTypingTexts();
    console.log('Data seeding completed successfully!');
  } catch (error) {
    console.error('Data seeding failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 