import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { withOptionalAuth } from '@/middleware';
import { TextService } from '@/services/text';
import { ok, internalServerError } from '@/utils/response';
import { createRequestLogger } from '@/utils/logger';

const textService = new TextService();

const getTextsHandler = async (
  event: APIGatewayProxyEvent,
  context: Context,
  authContext?: any
): Promise<APIGatewayProxyResult> => {
  const logger = createRequestLogger(context.awsRequestId, authContext?.userId);
  
  try {
    const { category, difficulty, limit = '20' } = event.queryStringParameters || {};
    const limitNum = parseInt(limit, 10);

    logger.info('Getting typing texts', { category, difficulty, limit: limitNum });

    let texts;
    if (category && difficulty) {
      texts = await textService.getTextsByCategory(category, limitNum);
      texts = texts.filter(text => text.difficulty === difficulty);
    } else if (category) {
      texts = await textService.getTextsByCategory(category, limitNum);
    } else if (difficulty) {
      texts = await textService.getTextsByDifficulty(difficulty, limitNum);
    } else {
      texts = await textService.getAllTexts(limitNum);
    }

    logger.info('Texts retrieved successfully', { count: texts.length });
    return ok(texts);
  } catch (error) {
    logger.error('Failed to get texts', { error });
    return internalServerError('Failed to get texts');
  }
};

export const handler = withOptionalAuth(getTextsHandler); 