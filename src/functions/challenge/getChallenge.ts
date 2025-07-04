import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ChallengeService } from '../../services/challenge';
import { ok, badRequest, notFound, unauthorized, internalServerError } from '../../utils/response';
import logger from '../../utils/logger';

const challengeService = new ChallengeService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const challengeId = event.pathParameters?.['challengeId'];
    if (!challengeId) {
      return badRequest('Challenge ID is required');
    }

    logger.info('Getting challenge by ID', { challengeId });

    // Get user from JWT token
    const userFromToken = event.requestContext.authorizer?.['claims'];
    if (!userFromToken) {
      return unauthorized('User not authenticated');
    }

    // Get challenge
    const challenge = await challengeService.getChallengeById(challengeId);
    
    if (!challenge) {
      return notFound('Challenge not found');
    }

    // Check if user is part of this challenge
    if (challenge.challengerId !== userFromToken.sub && challenge.opponentId !== userFromToken.sub) {
      return unauthorized('You can only access challenges you are part of');
    }

    logger.info('Challenge retrieved successfully', { challengeId });
    return ok(challenge);

  } catch (error) {
    logger.error('Error getting challenge by ID', error);
    return internalServerError('Failed to get challenge');
  }
}; 