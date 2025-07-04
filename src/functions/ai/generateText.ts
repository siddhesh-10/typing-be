import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AIService } from '../../services/ai';
import { ok, unauthorized, internalServerError } from '../../utils/response';
import logger from '../../utils/logger';

const aiService = new AIService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Generating AI text');

    // Get user from JWT token
    const userFromToken = event.requestContext.authorizer?.['claims'];
    if (!userFromToken) {
      return unauthorized('User not authenticated');
    }

    const queryParams = event.queryStringParameters || {};
    const difficulty = (queryParams['difficulty'] || 'medium') as 'easy' | 'medium' | 'hard' | 'expert';
    const category = queryParams['category'] || 'general';
    const wordCount = parseInt(queryParams['wordCount'] || '50');

    // Generate text
    const generatedText = await aiService.generateText(difficulty, category, wordCount);

    logger.info('AI text generated successfully');
    return ok(generatedText);

  } catch (error) {
    logger.error('Error generating AI text', error);
    return internalServerError('Failed to generate text');
  }
}; 