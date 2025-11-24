# Science Fair Registration Application

## Overview

This application provides a web-based registration system for science fair projects. Students (individually or in groups of up to 4) can register their projects through an intuitive web interface. All registration data is saved to a Google Sheet for easy management by administrators.

## Key Features

✅ **User-Friendly Registration**
- Clean, modern interface built with Material-UI
- Mobile-responsive design
- Step-by-step form guidance
- Real-time validation

✅ **Group Project Support**
- Support for up to 4 students per project
- Individual parent/guardian information for each student
- Easy add/remove group members interface

✅ **Robust Backend**
- TypeScript-based Node.js API
- Google Sheets integration for data storage
- Rate limiting to prevent abuse
- Comprehensive error handling

✅ **Security & Privacy**
- HTTPS in production
- CORS protection
- Input sanitization
- No public data exposure endpoints
- Privacy-focused data handling

✅ **Production-Ready**
- Docker support
- CI/CD with GitHub Actions
- Comprehensive testing
- Easy deployment to cloud platforms

## Use Cases

This application is perfect for:
- School science fairs
- Science competitions
- Research project registration
- Student project management
- Academic event registration

## Architecture

```
┌─────────────┐      HTTP/HTTPS      ┌─────────────┐
│   Browser   │ ───────────────────> │   Frontend  │
│  (React UI) │ <─────────────────── │   (Vite)    │
└─────────────┘                       └─────────────┘
                                            │
                                            │ API Calls
                                            ▼
                                      ┌─────────────┐
                                      │   Backend   │
                                      │  (Express)  │
                                      └─────────────┘
                                            │
                                            │ Google Sheets API
                                            ▼
                                      ┌─────────────┐
                                      │   Google    │
                                      │   Sheets    │
                                      └─────────────┘
```

## Technology Highlights

- **Frontend**: React 18, TypeScript, Material-UI, Vite
- **Backend**: Node.js, Express, TypeScript, Zod validation
- **Storage**: Google Sheets API v4
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Jest, React Testing Library, Supertest
- **DevOps**: Docker, GitHub Actions, ESLint, Prettier

## Getting Started

See [QUICKSTART.md](./QUICKSTART.md) for a 5-minute setup guide.

See [README.md](./README.md) for comprehensive documentation.

## Project Structure

- `/frontend` - React application
- `/backend` - Node.js API server
- `/tests` - Test files
- `/.github/workflows` - CI/CD pipelines
- `docker-compose.yml` - Local development with Docker
- `postman_collection.json` - API testing collection

## License

MIT License - Free to use and modify for your institution's needs.
