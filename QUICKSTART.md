# Science Fair Registration - Quick Start Guide

## Quick Setup (5 minutes)

### 1. Install Node.js
Make sure you have Node.js 18+ installed:
```bash
node --version  # Should be 18.0.0 or higher
```

### 2. Install Dependencies
From the project root:
```bash
npm run install:all
```

### 3. Set Up Google Sheets

**Quick Steps:**
1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable "Google Sheets API"
4. Create a Service Account and download the JSON key
5. Create a Google Sheet and share it with the service account email
6. Copy the Sheet ID from the URL

### 4. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and add:
- Your Google Sheets ID
- Base64-encoded service account key (or file path)

**To encode the JSON key:**
```bash
# Linux/Mac
cat service-account-key.json | base64 -w 0

# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account-key.json"))
```

### 5. Start Development Server
```bash
npm run dev
```

Visit:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

## Testing the Application

1. Open http://localhost:5173
2. Click "Register Your Project"
3. Fill out the form
4. Submit and check your Google Sheet for the new entry

## Next Steps

- Review the full README.md for deployment options
- Check the API with Postman (import postman_collection.json)
- Run tests: `npm test`
- Deploy to production using Docker or cloud platforms

## Common Issues

**Can't install dependencies?**
- Delete `node_modules` folders and `package-lock.json` files
- Run `npm run install:all` again

**Google Sheets errors?**
- Verify service account has Editor access to the sheet
- Check that the Sheet ID is correct
- Ensure the JSON key is properly encoded

**CORS errors?**
- Make sure FRONTEND_ORIGIN in .env matches http://localhost:5173

## Support

Need help? Check the main README.md or contact sciencefair@school.edu
