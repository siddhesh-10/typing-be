import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserService } from '../../services/user';
import { ok, badRequest, unauthorized, internalServerError } from '../../utils/response';
import logger from '../../utils/logger';

const userService = new UserService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.['userId'];
    if (!userId) {
      return badRequest('User ID is required');
    }

    logger.info('Deleting user', { userId });

    // Get user from JWT token
    const userFromToken = event.requestContext.authorizer?.['claims'];
    if (!userFromToken || userFromToken.sub !== userId) {
      return unauthorized('You can only delete your own profile');
    }

    // Delete user
    await userService.deleteUser(userId);

    logger.info('User deleted successfully', { userId });
    return ok({ message: 'User deleted successfully' });

  } catch (error) {
    logger.error('Error deleting user', error);
    return internalServerError('Failed to delete user');
  }
}; 