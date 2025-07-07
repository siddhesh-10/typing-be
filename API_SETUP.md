# Typing Texts API Setup Guide

This guide explains how to set up and test the typing texts API for the typing practice application.

## Overview

The API provides random typing texts based on difficulty and category parameters. It's designed to work with the frontend practice component.

## API Endpoint

- **URL**: `/texts/random`
- **Method**: `GET`
- **Parameters**:
  - `difficulty` (optional): `easy`, `medium`, `hard`, `expert`
  - `category` (optional): `general`, `technology`, `literature`, `news`, `quotes`, `code`, `nature`, `education`, `animals`, `science`, `environment`, `philosophy`

## Setup Steps

### 1. Deploy Infrastructure

First, deploy the DynamoDB tables and other infrastructure:

```bash
npm run deploy:infrastructure:dev
```

This creates the `typing-texts-dev` table with the necessary indexes:
- `CategoryIndex` - for querying by category
- `DifficultyIndex` - for querying by difficulty  
- `CategoryDifficultyIndex` - for querying by both category and difficulty

### 2. Deploy Functions

Deploy the Lambda functions:

```bash
npm run deploy:functions:dev
```

### 3. Seed Data

Generate and seed typing texts into DynamoDB:

```bash
npm run seed:texts
```

This script will:
- Generate 20 texts for each (category, difficulty) combination
- Save them to `data/initial-data/typing-texts.json`
- Insert them into DynamoDB (skipping duplicates)

### 4. Test the API

Test that the API is working correctly:

```bash
npm run test:api
```

This will test various combinations of parameters and verify randomness.

## API Response Format

The API returns a `TypingText` object:

```json
{
  "id": "uuid",
  "text": "The complete text to type...",
  "words": ["The", "complete", "text", "to", "type"],
  "category": "general",
  "difficulty": "easy",
  "language": "en",
  "source": "randomly generated",
  "wordCount": 5,
  "estimatedTime": 1,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Frontend Integration

The frontend calls this API through the `ApiService.getRandomText()` method:

```typescript
// Example frontend usage
const text = await this.apiService.getRandomText('medium', 'technology');
```

## Adding More Texts

To add more texts or regenerate the dataset:

1. **Add more texts to existing combinations**:
   ```bash
   npm run seed:texts
   ```
   This will add more texts if needed.

2. **Increase the target number**:
   Edit `scripts/seed-texts.ts` and change `TARGET_PER_PAIR` (default: 20).

3. **Add new categories or difficulties**:
   Edit the `categories` and `difficulties` arrays in `scripts/seed-texts.ts`.

## Troubleshooting

### Common Issues

1. **"No text found" errors**:
   - Ensure data has been seeded: `npm run seed:texts`
   - Check that the DynamoDB table exists and has data
   - Verify the table name in environment variables

2. **DynamoDB query errors**:
   - Ensure all required indexes exist
   - Check IAM permissions for DynamoDB access
   - Verify the table schema matches the expected structure

3. **Randomness issues**:
   - If the same text is returned repeatedly, add more texts: `npm run seed:texts`
   - Check that the `getRandomText` method is using proper randomization

### Debugging

1. **Check DynamoDB directly**:
   ```bash
   aws dynamodb scan --table-name typing-texts-dev --limit 10
   ```

2. **Test individual queries**:
   ```bash
   aws dynamodb query \
     --table-name typing-texts-dev \
     --index-name CategoryDifficultyIndex \
     --key-condition-expression "category = :cat AND difficulty = :diff" \
     --expression-attribute-values '{":cat":{"S":"general"},":diff":{"S":"easy"}}'
   ```

3. **Check Lambda logs**:
   ```bash
   aws logs tail /aws/lambda/typing-practice-be-dev-getRandomText --follow
   ```

## Performance Considerations

- The API uses DynamoDB queries with GSI for efficient filtering
- Random selection is done in application code (not database)
- Consider caching frequently requested combinations
- Monitor DynamoDB read capacity for high-traffic scenarios

## Security

- The API uses optional authentication (can work without auth)
- DynamoDB access is restricted via IAM roles
- Input validation is performed on parameters
- CORS is enabled for frontend integration 