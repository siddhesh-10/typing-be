import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { withOptionalAuth } from '@/middleware';
import { TextService } from '@/services/text';
import { ok, internalServerError } from '@/utils/response';
import { createRequestLogger } from '@/utils/logger';

const textService = new TextService();

const getRandomTextHandler = async (
  event: APIGatewayProxyEvent,
  context: Context,
  authContext?: any
): Promise<APIGatewayProxyResult> => {
  const logger = createRequestLogger(context.awsRequestId, authContext?.userId);
  
  try {
    const { category, difficulty } = event.queryStringParameters || {};

    logger.info('Getting random typing text', { category, difficulty });

    const text = await textService.getRandomText(category, difficulty);
    
    if (!text) {
      logger.warn('No text found for criteria', { category, difficulty });
      return ok(null, 'No text found for the specified criteria');
    }

    logger.info('Random text retrieved successfully', { textId: text.id });
    return ok(text);
  } catch (error) {
    logger.error('Failed to get random text', { error });
    return internalServerError('Failed to get random text');
  }
};

export const handler = withOptionalAuth(getRandomTextHandler); 