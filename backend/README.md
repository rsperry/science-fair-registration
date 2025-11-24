# Backend - Science Fair Registration API

This is the Node.js + TypeScript + Express backend for the Science Fair Registration application.

## Features

- TypeScript with strict mode
- Express.js REST API
- Google Sheets API integration
- Input validation with Zod
- Rate limiting and security with Helmet
- CORS configuration
- Structured logging
- Unit and integration tests

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (see `.env.example` in root directory)

3. Run in development mode:
```bash
npm run dev
```

## API Endpoints

### POST /api/register
Register a new science fair project.

**Request Body:**
```json
{
  "studentName": "John Doe",
  "teacher": "Mrs. Smith",
  "projectName": "Volcano Experiment",
  "parentGuardianName": "Jane Doe",
  "parentGuardianEmail": "jane@example.com",
  "consentGiven": true,
  "additionalStudents": []
}
```

**Response:**
```json
{
  "success": true,
  "registrationId": "uuid-here",
  "projectId": 100,
  "timestamp": "2025-11-24T12:00:00.000Z"
}
```

### GET /health
Health check endpoint.

## Testing

```bash
npm test
npm run test:watch
```

## Building

```bash
npm run build
npm start
```
