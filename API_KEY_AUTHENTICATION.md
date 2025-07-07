# API Key Authentication

This document explains how to use API key authentication for public endpoints in the typing practice backend.

## Overview

All public endpoints require an API key to be included in the request headers. The API key is managed through AWS API Gateway and provides centralized authentication for all public endpoints.

## Public Endpoints

The following endpoints require API key authentication:

- `GET /leaderboard` - Get leaderboard data
- `GET /texts` - Get all typing texts
- `GET /texts/random` - Get a random typing text
- `GET /texts/{id}` - Get a specific typing text by ID
- `POST /texts/seed` - Seed the database with default texts
- `GET /sessions/best` - Get best typing sessions
- `GET /sessions/recent` - Get recent typing sessions

## How to Use

### 1. Get Your API Key

After deployment, you can retrieve your API key from the AWS Console:

1. Go to AWS API Gateway Console
2. Navigate to your API (typing-practice-backend-{stage})
3. Go to "API Keys" section
4. Find the key named `typing-practice-api-key-{stage}`
5. Copy the API key value

### 2. Include API Key in Requests

Add the API key to your request headers:

```bash
curl -H "x-api-key: YOUR_API_KEY_HERE" \
     https://your-api-gateway-url/leaderboard
```

### 3. JavaScript/TypeScript Example

```javascript
const response = await fetch('https://your-api-gateway-url/leaderboard', {
  headers: {
    'x-api-key': 'YOUR_API_KEY_HERE',
    'Content-Type': 'application/json'
  }
});
```

## Rate Limiting

The API key is associated with a usage plan that includes:

- **Monthly Quota**: 10,000 requests per month
- **Rate Limit**: 100 requests per second
- **Burst Limit**: 200 requests

## Security Notes

- Keep your API key secure and don't expose it in client-side code
- Rotate API keys regularly for production environments
- Monitor API usage through AWS CloudWatch
- Consider using different API keys for different environments (dev, staging, prod)

## Deployment

The API key and usage plan are automatically created during deployment. The configuration is defined in the `serverless.yml` file under the `provider.apiGateway` section.

## Troubleshooting

### 403 Forbidden Error
- Ensure the API key is included in the request headers
- Verify the API key is valid and not expired
- Check if you've exceeded the rate limits

### 429 Too Many Requests
- You've exceeded the rate limit (100 req/sec) or burst limit (200 requests)
- Wait a moment before making additional requests

### API Key Not Found
- Verify the API key exists in AWS API Gateway Console
- Ensure you're using the correct API key for your environment 