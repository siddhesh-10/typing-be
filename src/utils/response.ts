import { APIGatewayProxyResult } from 'aws-lambda';
import { ApiResponse } from '../types';

// Helper function to create API response
const createApiResponse = <T>(data: T, message?: string): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };

  if (message) {
    (response as any).message = message;
  }

  return response;
};

// Helper function to create error API response
const createErrorResponse = (error: string): ApiResponse<null> => {
  return {
    success: false,
    error,
    timestamp: new Date().toISOString()
  };
};

// Helper function to convert API response to APIGatewayProxyResult
const toApiGatewayResponse = (apiResponse: ApiResponse<any>, statusCode: number = 200): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(apiResponse)
  };
};

// Success responses
export const ok = <T>(data: T, message?: string): APIGatewayProxyResult => {
  const apiResponse = createApiResponse(data, message);
  return toApiGatewayResponse(apiResponse, 200);
};

export const created = <T>(data: T, message?: string): APIGatewayProxyResult => {
  const apiResponse = createApiResponse(data, message);
  return toApiGatewayResponse(apiResponse, 201);
};

export const noContent = (): APIGatewayProxyResult => {
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: ''
  };
};

// Error responses
export const badRequest = (message: string): APIGatewayProxyResult => {
  const apiResponse = createErrorResponse(message);
  return toApiGatewayResponse(apiResponse, 400);
};

export const unauthorized = (message: string): APIGatewayProxyResult => {
  const apiResponse = createErrorResponse(message);
  return toApiGatewayResponse(apiResponse, 401);
};

export const forbidden = (message: string): APIGatewayProxyResult => {
  const apiResponse = createErrorResponse(message);
  return toApiGatewayResponse(apiResponse, 403);
};

export const notFound = (message: string): APIGatewayProxyResult => {
  const apiResponse = createErrorResponse(message);
  return toApiGatewayResponse(apiResponse, 404);
};

export const conflict = (message: string): APIGatewayProxyResult => {
  const apiResponse = createErrorResponse(message);
  return toApiGatewayResponse(apiResponse, 409);
};

export const internalServerError = (message: string): APIGatewayProxyResult => {
  const apiResponse = createErrorResponse(message);
  return toApiGatewayResponse(apiResponse, 500);
};

export const serviceUnavailable = (message: string): APIGatewayProxyResult => {
  const apiResponse = createErrorResponse(message);
  return toApiGatewayResponse(apiResponse, 503);
}; 