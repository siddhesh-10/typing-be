import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TextService } from '../../services/text';
import { ok, badRequest, notFound, internalServerError } from '../../utils/response';
import logger from '../../utils/logger';

const textService = new TextService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const textId = event.pathParameters?.['textId'];
    if (!textId) {
      return badRequest('Text ID is required');
    }

    logger.info('Getting text by ID', { textId });

    // Get text by ID
    const text = await textService.getTextById(textId);
    
    if (!text) {
      return notFound('Text not found');
    }

    logger.info('Text retrieved successfully', { textId });
    return ok(text);

  } catch (error) {
    logger.error('Error getting text by ID', error);
    return internalServerError('Failed to get text');
  }
}; 