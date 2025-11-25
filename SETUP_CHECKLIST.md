# Science Fair Registration - Setup Verification Checklist

Use this checklist to verify your setup is complete and working correctly.

## ✅ Prerequisites

- [ ] Node.js 24+ installed
- [ ] npm 10+ installed  
- [ ] Google Cloud account created
- [ ] Git installed (optional, for version control)

## ✅ Google Sheets Setup

- [ ] Google Cloud project created
- [ ] Google Sheets API enabled in project
- [ ] Service account created
- [ ] Service account JSON key downloaded
- [ ] Google Sheet created with proper column headers
- [ ] Service account email shared with sheet (Editor permission)
- [ ] Spreadsheet ID copied from URL
- [ ] (Optional) "Teachers" sheet created with teacher names

## ✅ Environment Configuration

- [ ] .env file created (copied from .env.example)
- [ ] GOOGLE_SHEETS_ID set in .env
- [ ] Service account key encoded to base64
- [ ] GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 set in .env
  OR
- [ ] GOOGLE_SERVICE_ACCOUNT_KEY_PATH set in .env
- [ ] PORT configured (default: 4000)
- [ ] FRONTEND_ORIGIN configured (default: http://localhost:5173)
- [ ] RATE_LIMIT settings configured

## ✅ Dependencies Installation

- [ ] All dependencies installed (`npm run install:all`)
  OR
- [ ] Root dependencies installed (`npm install`)
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)

## ✅ Development Server


- [ ] Both start together (`npm run dev`)
  OR
- [ ] Backend starts without errors (`npm run dev:backend`)
- [ ] Frontend starts without errors (`npm run dev:frontend`)
- [ ] Backend accessible at http://localhost:4000
- [ ] Frontend accessible at http://localhost:5173
- [ ] Health check endpoint works: http://localhost:4000/health

## ✅ Application Functionality

- [ ] Welcome page loads correctly
- [ ] "Register Your Project" button works
- [ ] Registration form displays
- [ ] Teacher dropdown populated
- [ ] All form fields are editable
- [ ] "Add Group Member" button works
- [ ] Can add up to 3 additional students
- [ ] Can remove additional students
- [ ] Form validation shows errors for invalid input
- [ ] Email validation works
- [ ] Consent checkbox is required
- [ ] Form submits successfully
- [ ] Confirmation page displays with:
  - [ ] Project ID
  - [ ] Timestamp
- [ ] Data appears in Google Sheet
- [ ] Primary record has "TRUE" in Primary Project Record column
- [ ] Additional student records have "FALSE"

## ✅ API Testing (Optional but Recommended)

- [ ] Postman collection imported
- [ ] GET /health returns 200
- [ ] GET /api/teachers returns teacher list
- [ ] POST /api/register with valid data returns 201
- [ ] POST /api/register with invalid data returns 400
- [ ] Rate limiting kicks in after multiple requests

## ✅ Testing

- [ ] Backend tests pass (`cd backend && npm test`)
- [ ] Frontend tests pass (`cd frontend && npm test`)
  OR
- [ ] All tests pass (`npm test`)
- [ ] Backend linting passes (`cd backend && npm run lint`)
- [ ] Frontend linting passes (`cd frontend && npm run lint`)
  OR
- [ ] No linting errors (`npm run lint`)

## ✅ Docker (Optional)

- [ ] Docker installed
- [ ] docker-compose.yml reviewed
- [ ] `docker-compose up` builds successfully
- [ ] Both containers start
- [ ] Application works in Docker environment

## ✅ Production Readiness (When Deploying)

- [ ] Environment variables configured for production
- [ ] FRONTEND_ORIGIN set to production domain
- [ ] NODE_ENV set to "production"
- [ ] HTTPS enabled
- [ ] Rate limiting configured appropriately
- [ ] Service account key secured
- [ ] Google Sheet permissions reviewed
- [ ] Backup strategy for Google Sheet in place
- [ ] Error monitoring configured (Sentry, etc.)
- [ ] Domain/hosting configured
- [ ] SSL certificate installed

## 🔍 Troubleshooting

If any items fail, consult:
1. **README.md** - Troubleshooting section
2. **QUICKSTART.md** - Common issues
3. **Backend logs** - Check terminal output
4. **Browser console** - Check for frontend errors
5. **Google Sheets permissions** - Verify service account access

## 📋 Common Issues & Solutions

**"Cannot find module" errors**
- Delete `node_modules` and `package-lock.json`
- Run `npm run install:all` again

**Google Sheets API errors**
- Verify service account has Editor access
- Check Sheet ID is correct
- Ensure JSON key is properly encoded

**CORS errors**
- Verify FRONTEND_ORIGIN matches frontend URL
- Check backend is running

**Port already in use**
- Change PORT in .env
- Or stop the process using the port

**Rate limiting blocking development**
- Increase RATE_LIMIT_MAX in .env
- Or clear browser cookies/use incognito mode

## ✨ Success!

Once all items are checked, your Science Fair Registration application is ready to use!

🎉 **Congratulations on setting up your science fair registration system!**

For deployment to production, see the **Deployment** section in README.md.
