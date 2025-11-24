# Science Fair Registration - Setup Script for Windows
# Run this script with: .\setup.ps1

Write-Host "=== Science Fair Registration Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Check Node.js version: $nodeVersion" -ForegroundColor Green
    
    # Check if version is 24 or higher
    $version = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($version -lt 24) {
        Write-Host "Error: Node.js version 24 or higher is required" -ForegroundColor Red
        Write-Host "Please install from https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "Error: Node.js not found" -ForegroundColor Red
    Write-Host "Please install Node.js 24+ from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "Found .env file" -ForegroundColor Green
} else {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Created .env file - please edit it with your configuration" -ForegroundColor Green
        Write-Host "  Required: GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_KEY_BASE64" -ForegroundColor Yellow
    } else {
        Write-Host "Warning: .env.example not found, skipping..." -ForegroundColor Yellow
    }
}

Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray

# Root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Gray
npm install

# Backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Gray
Push-Location backend
npm install
Pop-Location

# Frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Gray
Push-Location frontend
npm install
Pop-Location

Write-Host "All dependencies installed" -ForegroundColor Green
Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Edit .env file with your Google Sheets configuration" -ForegroundColor White
Write-Host "  2. Run: npm run dev" -ForegroundColor White
Write-Host "  3. Visit: http://localhost:5173" -ForegroundColor White
Write-Host ""
