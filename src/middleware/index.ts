import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { verifyToken } from '../utils/auth';
import { validateRequest } from '../utils/validation';
import { unauthorized, badRequest } from '../utils/response';
import { createRequestLogger } from '../utils/logger';

export interface AuthContext {
  userId: string;
  cognitoId: string;
  email: string;
  username: string;
}

export type HandlerFunction = (
  event: APIGatewayProxyEvent,
  context: Context,
  authContext?: AuthContext,
  validatedData?: any
) => Promise<APIGatewayProxyResult>;

export const withAuth = (handler: HandlerFunction) => {
  return async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const logger = createRequestLogger(context.awsRequestId);
    
    try {
      const authHeader = event.headers['Authorization'] || event.headers['authorization'];
      if (!authHeader) {
        logger.warn('No authorization header provided');
        return unauthorized('Authorization header required');
      }

      const token = authHeader.replace('Bearer ', '');
      const authContext = await verifyToken(token);
      
      return await handler(event, context, authContext);
    } catch (error) {
      logger.error('Authentication failed', { error });
      return unauthorized('Invalid or expired token');
    }
  };
};

export const withValidation = (schema: any, handler: HandlerFunction) => {
  return async (
    event: APIGatewayProxyEvent, 
    context: Context, 
    authContext?: AuthContext
  ): Promise<APIGatewayProxyResult> => {
    const logger = createRequestLogger(context.awsRequestId, authContext?.userId);
    
    try {
      const body = event.body ? JSON.parse(event.body) : {};
      const validatedData = validateRequest(schema, body);
      
      return await handler(event, context, authContext, validatedData);
    } catch (error) {
      logger.error('Validation failed', { error });
      return badRequest('Invalid request data');
    }
  };
};

export const withOptionalAuth = (handler: HandlerFunction) => {
  return async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const logger = createRequestLogger(context.awsRequestId);
    
    try {
      const authHeader = event.headers['Authorization'] || event.headers['authorization'];
      if (!authHeader) {
        return await handler(event, context, undefined);
      }

      const token = authHeader.replace('Bearer ', '');
      const authContext = await verifyToken(token);
      
      return await handler(event, context, authContext);
    } catch (error) {
      logger.warn('Optional authentication failed, continuing without auth', { error });
      return await handler(event, context, undefined);
    }
  };
}; 