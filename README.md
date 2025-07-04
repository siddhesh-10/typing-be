# TypeMaster Backend

A production-ready AWS serverless backend for the TypeMaster typing practice application, built with Node.js 18, TypeScript, and AWS Lambda.

## 🏗️ Architecture

- **Runtime**: Node.js 18.x
- **Framework**: Serverless Framework
- **Database**: Amazon DynamoDB
- **Authentication**: Amazon Cognito
- **API Gateway**: REST API + WebSocket API
- **AI Integration**: Google Gemini 1.5 Flash
- **Real-time**: WebSocket Lambda functions

## 📁 Project Structure

```
typing-practice-be/
├── src/
│   ├── functions/          # Lambda function handlers
│   │   ├── user/          # User management
│   │   ├── text/          # Typing texts
│   │   ├── session/       # Typing sessions
│   │   ├── challenge/     # 1v1 challenges
│   │   ├── ai/           # AI practice features
│   │   └── websocket/    # Real-time communication
│   ├── services/         # Business logic layer
│   ├── utils/           # Utilities and helpers
│   └── types/           # TypeScript type definitions
├── data/                # Initial data and seeding
├── scripts/            # Database seeding scripts
├── .github/workflows/  # CI/CD pipelines
└── serverless.yml     # Serverless configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- AWS CLI configured
- Serverless Framework CLI
- Google Gemini API key

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd typing-practice-be
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.dev .env.dev
   cp env.prod .env.prod
   ```

3. **Configure your environment files:**
   ```bash
   # .env.dev
   GEMINI_API_KEY=your_gemini_api_key_here
   AWS_REGION=us-east-1
   ```

### Local Development

```bash
# Start local development server
npm run dev

# This will start:
# - HTTP API on http://localhost:3000
# - WebSocket API on ws://localhost:3001
# - Lambda functions on http://localhost:3002
```

### Database Seeding

```bash
# Seed development database
npm run seed:dev

# Seed production database
npm run seed:prod
```

## 🚀 Deployment

### Development Deployment

```bash
npm run deploy:dev
```

### Production Deployment

```bash
npm run deploy:prod
```

### CI/CD Pipeline

The project includes GitHub Actions workflows that automatically:

1. **Test**: Run linting, tests, and build
2. **Deploy Dev**: Deploy to development on `develop` branch
3. **Deploy Prod**: Deploy to production on `main` branch
4. **Security Scan**: Run security audits and vulnerability scans

## 📚 API Documentation

### Authentication

All protected endpoints require a valid JWT token from Cognito in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

### User Management

#### Create User
```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "country": "US"
}
```

#### Get User
```http
GET /users/{userId}
Authorization: Bearer <token>
```

#### Update User
```http
PUT /users/{userId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "john_doe_updated",
  "country": "CA"
}
```

#### Delete User
```http
DELETE /users/{userId}
Authorization: Bearer <token>
```

### Typing Texts

#### Get All Texts
```http
GET /texts
```

#### Get Text by ID
```http
GET /texts/{textId}
```

#### Create Text (Admin)
```http
POST /texts
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "The quick brown fox jumps over the lazy dog.",
  "category": "proverbs",
  "difficulty": "easy",
  "language": "en"
}
```

### Typing Sessions

#### Create Session
```http
POST /sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "textId": "text_123",
  "mode": "practice"
}
```

#### Get Session
```http
GET /sessions/{sessionId}
Authorization: Bearer <token>
```

#### Update Session (Submit Results)
```http
PUT /sessions/{sessionId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "wpm": 65.5,
  "accuracy": 98.2,
  "errors": 2,
  "duration": 120,
  "completed": true
}
```

#### Get User Sessions
```http
GET /users/{userId}/sessions
Authorization: Bearer <token>
```

#### Get Best Sessions
```http
GET /users/{userId}/sessions/best
Authorization: Bearer <token>
```

#### Get Recent Sessions
```http
GET /users/{userId}/sessions/recent
Authorization: Bearer <token>
```

### Challenges

#### Create Challenge
```http
POST /challenges
Authorization: Bearer <token>
Content-Type: application/json

{
  "opponentId": "user_456",
  "textId": "text_123",
  "timeLimit": 300
}
```

#### Get Challenge
```http
GET /challenges/{challengeId}
Authorization: Bearer <token>
```

#### Accept Challenge
```http
PUT /challenges/{challengeId}/accept
Authorization: Bearer <token>
```

#### Decline Challenge
```http
PUT /challenges/{challengeId}/decline
Authorization: Bearer <token>
```

#### Get User Challenges
```http
GET /users/{userId}/challenges
Authorization: Bearer <token>
```

### AI Practice

#### Create AI Session
```http
POST /ai-sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "difficulty": "medium",
  "category": "fiction",
  "length": "short"
}
```

#### Generate Text
```http
GET /ai/generate-text?difficulty=medium&category=fiction&length=short
Authorization: Bearer <token>
```

#### Generate Feedback
```http
POST /ai/generate-feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionData": {
    "wpm": 65.5,
    "accuracy": 98.2,
    "errors": 2,
    "text": "The quick brown fox jumps over the lazy dog."
  }
}
```

### Leaderboard

#### Get Global Leaderboard
```http
GET /leaderboard
```

### WebSocket API

Connect to the WebSocket endpoint for real-time features:

```javascript
const ws = new WebSocket('wss://your-api-gateway-url/ws');

// Send challenge request
ws.send(JSON.stringify({
  action: 'challenge',
  data: {
    opponentId: 'user_456',
    textId: 'text_123'
  }
}));

// Listen for real-time updates
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `AWS_REGION` | AWS region | Yes |
| `STAGE` | Deployment stage | Auto |
| `USER_POOL_ID` | Cognito User Pool ID | Auto |
| `USER_POOL_CLIENT_ID` | Cognito Client ID | Auto |

### DynamoDB Tables

The following tables are automatically created:

- `typing-texts-{stage}` - Typing practice texts
- `users-{stage}` - User profiles and stats
- `sessions-{stage}` - Typing sessions
- `leaderboard-{stage}` - Global and country leaderboards
- `challenges-{stage}` - 1v1 challenges
- `ai-sessions-{stage}` - AI practice sessions
- `websocket-connections-{stage}` - WebSocket connections

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🔒 Security

- **Authentication**: JWT tokens via Cognito
- **Authorization**: Role-based access control
- **Input Validation**: Joi schema validation
- **Rate Limiting**: API Gateway throttling
- **CORS**: Configured for frontend domains
- **Security Headers**: Helmet.js integration

## 📊 Monitoring

- **CloudWatch Logs**: All Lambda function logs
- **CloudWatch Metrics**: Performance and error metrics
- **X-Ray Tracing**: Distributed tracing (optional)
- **Custom Metrics**: Business metrics via CloudWatch

## 🚨 Troubleshooting

### Common Issues

1. **Deployment Fails**
   - Check AWS credentials
   - Verify IAM permissions
   - Check CloudFormation stack status

2. **WebSocket Connection Issues**
   - Verify WebSocket API endpoint
   - Check connection permissions
   - Validate message format

3. **Database Errors**
   - Check DynamoDB table permissions
   - Verify table indexes
   - Check data format

### Debug Commands

```bash
# View CloudWatch logs
serverless logs -f functionName -t

# Check deployment status
serverless info

# Remove deployment
serverless remove

# Validate serverless.yml
serverless print
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review CloudWatch logs for errors 