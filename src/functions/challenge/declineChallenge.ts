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

    logger.info('Declining challenge', { challengeId });

    // Get user from JWT token
    const userFromToken = event.requestContext.authorizer?.['claims'];
    if (!userFromToken) {
      return unauthorized('User not authenticated');
    }

    // Decline challenge
    const challenge = await challengeService.declineChallenge(challengeId);
    
    if (!challenge) {
      return notFound('Challenge not found or cannot be declined');
    }

    logger.info('Challenge declined successfully', { challengeId });
    return ok(challenge, 'Challenge declined successfully');

  } catch (error) {
    logger.error('Error declining challenge', error);
    return internalServerError('Failed to decline challenge');
  }
}; 