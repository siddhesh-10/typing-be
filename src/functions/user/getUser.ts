import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { withAuth } from '../../middleware';
import { UserService } from '../../services/user';
import { ok, notFound, internalServerError } from '../../utils/response';
import { createRequestLogger } from '../../utils/logger';

const userService = new UserService();

const getUserHandler = async (
  event: APIGatewayProxyEvent,
  context: Context,
  authContext: any
): Promise<APIGatewayProxyResult> => {
  const logger = createRequestLogger(context.awsRequestId, authContext?.userId);
  
  try {
    const userId = event.pathParameters?.['userId'] || authContext.userId;
    
    logger.info('Getting user', { userId });

    const user = await userService.getUserById(userId);
    if (!user) {
      logger.warn('User not found', { userId });
      return notFound('User not found');
    }

    logger.info('User retrieved successfully', { userId });
    return ok(user);
  } catch (error) {
    logger.error('Failed to get user', { error });
    return internalServerError('Failed to get user');
  }
};

export const handler = withAuth(getUserHandler); 