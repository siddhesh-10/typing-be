import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TextService } from '../../services/text';
import { created, badRequest, internalServerError } from '../../utils/response';
import { validateRequest, createTextSchema } from '../../utils/validation';
import logger from '../../utils/logger';

const textService = new TextService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Creating new text');

    // Validate request body
    let textData: any;
    try {
      textData = validateRequest(createTextSchema, JSON.parse(event.body || '{}'));
    } catch (error) {
      return badRequest('Invalid request body');
    }

    // Create text with proper typing and required fields
    const newText = await textService.createText({
      text: textData.text,
      category: textData.category,
      difficulty: textData.difficulty,
      language: textData.language || 'en',
      source: textData.source,
      words: textData.text.split(' '),
      wordCount: textData.text.split(' ').length,
      estimatedTime: Math.ceil(textData.text.split(' ').length / 40) // Assume 40 WPM average
    });

    logger.info('Text created successfully', { textId: newText.id });
    return created(newText, 'Text created successfully');

  } catch (error) {
    logger.error('Error creating text', error);
    return internalServerError('Failed to create text');
  }
}; 