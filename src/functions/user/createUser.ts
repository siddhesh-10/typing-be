import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserService } from '../../services/user';
import { created, badRequest, internalServerError } from '../../utils/response';
import { validateRequest, createUserSchema, CreateUserRequest } from '../../utils/validation';
import logger from '../../utils/logger';

const userService = new UserService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Creating new user');

    // Validate request body
    let userData: CreateUserRequest;
    try {
      userData = validateRequest(createUserSchema, JSON.parse(event.body || '{}'));
    } catch (error) {
      return badRequest('Invalid request body');
    }

    // Create user with cognitoId (for now, using a mock ID)
    const newUser = await userService.createUser({
      ...userData,
      cognitoId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    logger.info('User created successfully', { userId: newUser.id });
    return created(newUser, 'User created successfully');

  } catch (error) {
    logger.error('Error creating user', error);
    return internalServerError('Failed to create user');
  }
}; 