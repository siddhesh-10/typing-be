import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TextService } from '../../services/text';
import { ok, badRequest, notFound, internalServerError } from '../../utils/response';
import { validateRequest, updateTextSchema } from '../../utils/validation';
import logger from '../../utils/logger';

const textService = new TextService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const textId = event.pathParameters?.['textId'];
    if (!textId) {
      return badRequest('Text ID is required');
    }

    logger.info('Updating text', { textId });

    // Validate request body
    let updateData: any;
    try {
      updateData = validateRequest(updateTextSchema, JSON.parse(event.body || '{}'));
    } catch (error) {
      return badRequest('Invalid request body');
    }

    // Update text with proper typing
    const updatedText = await textService.updateText(textId, {
      text: updateData.text,
      category: updateData.category,
      difficulty: updateData.difficulty,
      language: updateData.language,
      source: updateData.source
    });
    
    if (!updatedText) {
      return notFound('Text not found');
    }

    logger.info('Text updated successfully', { textId });
    return ok(updatedText, 'Text updated successfully');

  } catch (error) {
    logger.error('Error updating text', error);
    return internalServerError('Failed to update text');
  }
}; 