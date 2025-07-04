import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ChallengeService } from '../../services/challenge';
import { created, internalServerError, unauthorized } from '../../utils/response';
import { validateRequest, createChallengeSchema, CreateChallengeRequest } from '../../utils/validation';
import { authenticateRequest } from '../../utils/auth';
import logger from '../../utils/logger';

const challengeService = new ChallengeService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Creating new challenge');

    // Get auth context
    const authContext = await authenticateRequest(event);

    // Validate request body
    const challengeData = validateRequest(createChallengeSchema, JSON.parse(event.body || '{}')) as CreateChallengeRequest;

    // Create challenge
    const newChallenge = await challengeService.createChallenge(
      authContext.userId,
      challengeData.opponentId,
      challengeData.difficulty,
      challengeData.timeLimit
    );

    logger.info('Challenge created successfully', { challengeId: newChallenge.id });
    return created(newChallenge, 'Challenge created successfully');

  } catch (error) {
    logger.error('Error creating challenge', error);
    if (error instanceof Error && error.message.includes('Authentication failed')) {
      return unauthorized('Authentication required');
    }
    return internalServerError('Failed to create challenge');
  }
}; 