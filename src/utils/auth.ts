import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { AuthContext, CognitoUser } from '../types';
import { unauthorized } from './response';
import { AuthContext as MiddlewareAuthContext } from '../middleware';

// Initialize JWT verifier for Cognito
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env['USER_POOL_ID']!,
  tokenUse: 'access',
  clientId: process.env['USER_POOL_CLIENT_ID']!,
});

export const extractTokenFromHeader = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader) return null;
  
  const parts = authorizationHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1] || null;
};

export const verifyToken = async (token: string): Promise<MiddlewareAuthContext> => {
  try {
    // Verify the JWT token using Cognito's built-in verification
    const payload = await verifier.verify(token);
    
    return {
      userId: payload.sub,
      username: payload.username || payload['cognito:username'] || '',
      email: payload.email || '',
      cognitoId: payload.sub
    };
  } catch (error) {
    throw new Error(`Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getCognitoUser = async (cognitoId: string): Promise<CognitoUser> => {
  try {
    // For now, we'll extract user info from the JWT token
    // In a real implementation, you might want to call Cognito Admin API
    // But for most cases, JWT payload contains sufficient user information
    
    return {
      sub: cognitoId,
      email: '', // Will be filled from JWT payload
      username: '', // Will be filled from JWT payload
      attributes: {
        sub: cognitoId,
        email: '',
        username: '',
        created_at: new Date().toISOString()
      }
    };
  } catch (error) {
    throw new Error(`Failed to get Cognito user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const createAuthContext = (cognitoUser: CognitoUser): AuthContext => {
  return {
    userId: cognitoUser.sub,
    username: cognitoUser.username,
    email: cognitoUser.email,
    cognitoId: cognitoUser.sub
  };
};

export const authenticateRequest = async (event: any): Promise<AuthContext> => {
  try {
    const authorizationHeader = event.headers?.['Authorization'] || event.headers?.['authorization'];
    const token = extractTokenFromHeader(authorizationHeader);
    
    if (!token) {
      throw new Error('No authorization token provided');
    }

    // Verify the JWT token using Cognito's built-in verification
    const payload = await verifier.verify(token);
    
    return {
      userId: payload.sub,
      username: payload.username || payload['cognito:username'] || '',
      email: payload.email || '',
      cognitoId: payload.sub
    };
  } catch (error) {
    throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Middleware for Lambda authentication
export const withAuth = (
  handler: (event: any, context: any, authContext: AuthContext) => Promise<any>
) => {
  return async (event: any, context: any) => {
    try {
      const authContext = await authenticateRequest(event);
      return await handler(event, context, authContext);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Authentication failed')) {
        return unauthorized(error.message);
      }
      throw error;
    }
  };
};

// Optional authentication middleware
export const withOptionalAuth = (
  handler: (event: any, context: any, authContext?: AuthContext) => Promise<any>
) => {
  return async (event: any, context: any) => {
    try {
      const authContext = await authenticateRequest(event);
      return await handler(event, context, authContext);
    } catch (error) {
      // If authentication fails, continue without auth context
      return await handler(event, context, undefined);
    }
  };
}; 