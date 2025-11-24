# Science Fair Registration Application

A modern, full-stack TypeScript application for managing science fair project registrations.

## What's Built

✅ **Complete Application Structure**
- Monorepo with frontend and backend
- Production-ready configuration
- Docker support
- CI/CD pipeline

✅ **Backend (Node.js + TypeScript + Express)**
- REST API with validation
- Google Sheets integration
- Rate limiting & security
- Comprehensive tests
- Health check endpoint

✅ **Frontend (React + TypeScript + Vite + MUI)**
- Welcome/info page
- Registration form with validation
- Confirmation page
- Mobile-responsive design
- Accessibility compliant

✅ **Features**
- Individual and group registrations (up to 4 students)
- Dynamic teacher dropdown
- Parent/guardian contact info
- Consent checkbox
- Email validation
- Real-time error handling

✅ **DevOps**
- Docker & Docker Compose
- GitHub Actions CI/CD
- ESLint & Prettier
- Jest testing
- Postman collection

## Next Steps

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up Google Sheets:**
   - Follow instructions in QUICKSTART.md
   - Get your service account key
   - Configure .env file

3. **Start development:**
   ```bash
   npm run dev
   ```

4. **Visit the app:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:4000

## File Structure

```
science-fair/
├── frontend/          # React app
├── backend/           # Node.js API
├── .github/          # CI/CD
├── README.md         # Full documentation
├── QUICKSTART.md     # Quick setup guide
├── OVERVIEW.md       # Project overview
└── package.json      # Root scripts
```

## Key Commands

```bash
npm run dev           # Start both apps
npm test              # Run all tests
npm run build         # Build both apps
npm run lint          # Lint all code
docker-compose up     # Run with Docker
```

## Documentation

- **README.md** - Complete setup, deployment, and API docs
- **QUICKSTART.md** - 5-minute setup guide
- **OVERVIEW.md** - Project overview and architecture
- **postman_collection.json** - API testing

## Requirements Met

All requirements from the Science Fair Prompt have been implemented:

✅ Tech stack (React, TypeScript, MUI, Node.js, Express, Vite)
✅ Google Sheets API integration
✅ Registration form with all required fields
✅ Support for up to 3 additional students
✅ Teacher dropdown
✅ Email validation
✅ Consent checkbox
✅ Confirmation page with printable confirmation
✅ No public admin interface
✅ Mobile-friendly UI
✅ Rate limiting & security (Helmet, CORS)
✅ Input validation (client & server)
✅ Environment configuration
✅ Hot reload (Vite + ts-node-dev)
✅ Testing (Jest)
✅ Docker & docker-compose
✅ GitHub Actions CI/CD
✅ ESLint & Prettier
✅ Accessibility (WCAG)
✅ Comprehensive README
✅ .env.example
✅ Postman collection

## Support

Check the README.md for troubleshooting and detailed documentation.
