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

    logger.info('Deleting text', { textId });

    // Delete text
    const deleted = await textService.deleteText(textId);
    
    if (!deleted) {
      return notFound('Text not found');
    }

    logger.info('Text deleted successfully', { textId });
    return ok({ message: 'Text deleted successfully' });

  } catch (error) {
    logger.error('Error deleting text', error);
    return internalServerError('Failed to delete text');
  }
}; 