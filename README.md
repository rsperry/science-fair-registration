[![CI/CD Pipeline](https://github.com/rsperry/science-fair-registration/actions/workflows/ci.yml/badge.svg)](https://github.com/rsperry/science-fair-registration/actions/workflows/ci.yml)

# Science Fair Registration Application

A full-stack web application for managing science fair project registrations. Built with React, TypeScript, Material-UI on the frontend and Node.js, Express, TypeScript on the backend, with Google Sheets as the data storage backend.

## Features

- 📝 Student and project registration with support for group projects (up to 4 students)
- 🎨 Modern, responsive UI built with Material-UI
- 🔒 Security features including CORS, Helmet, rate limiting
- 📊 Google Sheets integration for data storage
- ✅ Client and server-side validation
- 🧪 Comprehensive test coverage
- 🐳 Docker support for easy deployment
- 🚀 CI/CD pipeline with GitHub Actions
- ♿ Accessibility-focused design (WCAG compliant)

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for fast development and building
- Material-UI (MUI) v5 for components
- React Router v7 for navigation
- Axios for API calls
- Zod v4 for validation

### Backend
- Node.js with TypeScript
- Express.js framework
- Google Sheets API v4
- Zod for schema validation
- Helmet for security headers
- express-rate-limit for API protection
- CORS for cross-origin requests

### DevOps & Testing
- Jest for unit and integration testing
- Docker
- GitHub Actions for CI/CD
- ESLint & Prettier for code quality

## Project Structure

```
science-fair-registration/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── styles/       # MUI theme
│   │   ├── types/        # TypeScript types
│   │   └── config/       # Configuration
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── backend/              # Node.js backend
│   ├── src/
│   │   ├── config/       # Environment config
│   │   ├── routes/       # Express routes
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript types
│   │   ├── validation/   # Zod schemas
│   │   ├── app.ts        # Express app
│   │   └── server.ts     # Server entry point
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml        # GitHub Actions
├── .env.example
└── README.md
```

## Prerequisites

- Node.js >= 24.0.0
- npm >= 10.0.0
- Google Cloud Platform account (for Google Sheets API)
- Docker (optional, for containerized deployment)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd science-fair-registration
```

### 2. Google Sheets Setup

#### Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

#### Create a Service Account

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details and click "Create"
4. Skip granting user access (click "Continue" then "Done")
5. Click on the created service account
6. Go to the "Keys" tab
7. Click "Add Key" > "Create New Key"
8. Choose "JSON" format and click "Create"
9. Save the downloaded JSON file securely

#### Prepare Google Sheets

1. Create a new Google Sheet
2. Add a header row with the following columns:
   - Project ID
   - Project Name
   - Primary Project Record
   - Student 1 Name
   - Student 1 Teacher
   - Student 1 Grade
   - Student 1 Parent Name
   - Student 1 Parent Email
   - Student 2 Name
   - Student 2 Teacher
   - Student 2 Grade
   - Student 2 Parent Name
   - Student 2 Parent Email
   - Student 3 Name
   - Student 3 Teacher
   - Student 3 Grade
   - Student 3 Parent Name
   - Student 3 Parent Email
   - Student 4 Name
   - Student 4 Teacher
   - Student 4 Grade
   - Student 4 Parent Name
   - Student 4 Parent Email
   - Timestamp

3. Create a second sheet named "Teachers" with following headers:
   - Teacher
   - Grade
4. Populate Teachers sheet with all teacher names/grades
5. Create a third sheet named Info with following in column A and and data in column B:
   - School
   - Contact
   - Registration Deadline
   - Science Fair Date
6. Share the spreadsheet with the service account email address (found in the JSON key file)
   - Give it "Editor" permissions
7. Copy the Spreadsheet ID from the URL (the long string between `/d/` and `/edit`)

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and fill in the values:

```env
NODE_ENV=development
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173

# Google Sheets Configuration
GOOGLE_SHEETS_ID=your_spreadsheet_id_here

# Option 1: Base64-encode your service account JSON
# Run: cat service-account-key.json | base64
GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=your_base64_encoded_json_here

# Option 2: Or provide a file path (alternative to base64)
# GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account-key.json

# Security & Rate Limiting
RATE_LIMIT_WINDOW=3600000
RATE_LIMIT_MAX=10

# Optional features
RECAPTCHA_SECRET=
SENTRY_DSN=
```

**To base64-encode your service account key (Option 1):**

```bash
# On Linux/Mac:
cat service-account-key.json | base64 -w 0

# On Windows PowerShell:
[Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account-key.json"))
```

### 4. Install Dependencies

Install all dependencies for both frontend and backend:

```bash
npm run install:all
```

Or install individually:

```bash
# Root
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Development

### Run in Development Mode

Start both frontend and backend concurrently:

```bash
npm run dev
```

This will start:
- Backend API on http://localhost:4000
- Frontend on http://localhost:5173

### Run Individually

Backend only:
```bash
npm run dev:backend
```

Frontend only:
```bash
npm run dev:frontend
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests Individually

Backend tests:
```bash
cd backend
npm test
npm run test:watch  # Watch mode
```

Frontend tests:
```bash
cd frontend
npm test
npm run test:watch  # Watch mode
```

## Building for Production

### Build Both Applications

```bash
npm run build
```

### Build Individually

```bash
# Backend
npm run build:backend

# Frontend
npm run build:frontend
```

### Run Production Build

```bash
# Backend
cd backend
npm start

# Frontend - serve the dist folder with a web server
cd frontend
npx serve -s dist
```

## Deployment

### Docker Deployment

1. Build Docker images:

```bash
npm run docker:build
```

2. Run containers:

```bash
npm run docker:run
```

### Deploy to Cloud Platforms

#### Heroku (Backend)

```bash
cd backend
heroku create science-fair-api
heroku config:set NODE_ENV=production
heroku config:set GOOGLE_SHEETS_ID=your_spreadsheet_id
heroku config:set GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=your_base64_key
heroku config:set FRONTEND_ORIGIN=https://your-frontend-url.com
git push heroku main
```

#### Vercel (Frontend)

```bash
cd frontend
vercel --prod
```

#### Google Cloud Run

```bash
gcloud run deploy science-fair \
  --source ./ \
  --region us-central1 \
  --allow-unauthenticated
```

## API Documentation

### Endpoints

#### POST /api/register
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
  "additionalStudents": [
    {
      "studentName": "Alice Smith",
      "teacher": "Mr. Johnson",
      "parentGuardianName": "Bob Smith",
      "parentGuardianEmail": "bob@example.com"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "registrationId": "uuid-v4",
  "projectId": 100,
  "timestamp": "2025-11-24T12:00:00.000Z"
}
```

#### GET /api/teachers
Get list of available teachers.

**Response:**
```json
{
  "success": true,
  "teachers": ["Mrs. Smith", "Mr. Johnson", "Ms. Williams"]
}
```

#### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-24T12:00:00.000Z",
  "environment": "production"
}
```

### Postman Collection

Import `postman_collection.json` into Postman to test the API endpoints.

## Security Features

- **CORS**: Restricted to configured origin(s)
- **Helmet**: Security headers for HTTP responses
- **Rate Limiting**: IP-based rate limiting (10 requests per hour by default)
- **Input Validation**: Server-side validation with Zod
- **HTTPS**: Required in production
- **No Public Data Exposure**: No endpoint returns all registrations

## Accessibility

The application follows WCAG 2.1 guidelines:
- Semantic HTML structure
- ARIA labels and attributes
- Keyboard navigation support
- Focus indicators
- Color contrast compliance
- Screen reader compatibility

## Troubleshooting

### Common Issues

**Google Sheets API Error: "Permission denied"**
- Ensure the service account has "Editor" access to the spreadsheet
- Verify the spreadsheet ID is correct

**CORS Error**
- Check that `FRONTEND_ORIGIN` in `.env` matches your frontend URL
- In development, it should be `http://localhost:5173`

**Rate Limiting Issues**
- Adjust `RATE_LIMIT_WINDOW` and `RATE_LIMIT_MAX` in `.env`
- Default: 10 requests per hour per IP

**Port Already in Use**
- Change `PORT` in `.env` to an available port

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues:
- Create an issue in the GitHub repository
