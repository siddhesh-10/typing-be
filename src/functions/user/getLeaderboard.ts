import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserService } from '../../services/user';
import { ok, internalServerError } from '../../utils/response';
import logger from '../../utils/logger';

const userService = new UserService();

export const handler = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Getting leaderboard');

    // Get leaderboard
    const leaderboard = await userService.getLeaderboard();

    logger.info('Leaderboard retrieved successfully', { count: leaderboard.length });
    return ok(leaderboard);

  } catch (error) {
    logger.error('Error getting leaderboard', error);
    return internalServerError('Failed to get leaderboard');
  }
}; 