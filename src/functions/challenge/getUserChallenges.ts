import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ChallengeService } from '../../services/challenge';
import { ok, badRequest, unauthorized, internalServerError } from '../../utils/response';
import logger from '../../utils/logger';

const challengeService = new ChallengeService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.['userId'];
    if (!userId) {
      return badRequest('User ID is required');
    }

    logger.info('Getting user challenges', { userId });

    // Get user from JWT token
    const userFromToken = event.requestContext.authorizer?.['claims'];
    if (!userFromToken) {
      return unauthorized('User not authenticated');
    }

    // Check if user is requesting their own challenges
    if (userFromToken.sub !== userId) {
      return unauthorized('You can only access your own challenges');
    }

    // Get user challenges
    const challenges = await challengeService.getUserChallenges(userId);

    logger.info('User challenges retrieved successfully', { userId, count: challenges.length });
    return ok(challenges);

  } catch (error) {
    logger.error('Error getting user challenges', error);
    return internalServerError('Failed to get user challenges');
  }
}; 