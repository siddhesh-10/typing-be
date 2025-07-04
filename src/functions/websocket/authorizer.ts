import { APIGatewayRequestAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { verifyToken } from '../../utils/auth';

export const handler = async (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  try {
    // Extract token from Sec-WebSocket-Protocol header (case-insensitive)
    const protocolHeader =
      event.headers?.['Sec-WebSocket-Protocol'] ||
      event.headers?.['sec-websocket-protocol'];
    const token = Array.isArray(protocolHeader)
      ? protocolHeader[0]
      : protocolHeader;
    if (!token) {
      throw new Error('Missing Sec-WebSocket-Protocol header (expected JWT as subprotocol)');
    }
    const jwt = token.startsWith('Bearer ') ? token.slice(7) : token;
    const user = await verifyToken(jwt);
    return {
      principalId: user.userId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn || '*',
          },
        ],
      },
      context: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        cognitoId: user.cognitoId,
      },
    };
  } catch (err) {
    return {
      principalId: 'unauthorized',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: event.methodArn || '*',
          },
        ],
      },
      context: {
        error: err instanceof Error ? err.message : 'Unauthorized',
      },
    };
  }
}; 