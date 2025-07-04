import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserService } from '../../services/user';
import { ok, badRequest, unauthorized, internalServerError } from '../../utils/response';
import { validateRequest, updateUserSchema, UpdateUserRequest } from '../../utils/validation';
import logger from '../../utils/logger';

const userService = new UserService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.['userId'];
    if (!userId) {
      return badRequest('User ID is required');
    }

    logger.info('Updating user', { userId });

    // Validate request body
    let updateData: UpdateUserRequest;
    try {
      updateData = validateRequest(updateUserSchema, JSON.parse(event.body || '{}'));
    } catch (error) {
      return badRequest('Invalid request body');
    }

    // Get user from JWT token
    const userFromToken = event.requestContext.authorizer?.['claims'];
    if (!userFromToken || userFromToken.sub !== userId) {
      return unauthorized('You can only update your own profile');
    }

    // Update user
    const updatedUser = await userService.updateUser(userId, updateData);

    logger.info('User updated successfully', { userId });
    return ok(updatedUser, 'User updated successfully');

  } catch (error) {
    logger.error('Error updating user', error);
    return internalServerError('Failed to update user');
  }
}; 