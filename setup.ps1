# Science Fair Registration - Setup Script for Windows
# Run this script with: .\setup.ps1

Write-Host "=== Science Fair Registration Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
    
    # Check if version is 18 or higher (updated to 24 recommended)
    $version = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($version -lt 18) {
        Write-Host "✗ Node.js version 18 or higher is required (24 recommended)" -ForegroundColor Red
        Write-Host "Please install from https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    } elseif ($version -lt 24) {
        Write-Host "⚠ Using Node.js $nodeVersion (Node 24 recommended but not required)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Node.js not found" -ForegroundColor Red
    Write-Host "Please install Node.js 24+ from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✓ .env file found" -ForegroundColor Green
} else {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file - please edit it with your configuration" -ForegroundColor Green
    Write-Host "  Required: GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_KEY_BASE64" -ForegroundColor Yellow
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
Set-Location backend
npm install
Set-Location ..

# Frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Gray
Set-Location frontend
npm install
Set-Location ..

Write-Host "✓ All dependencies installed" -ForegroundColor Green
Write-Host ""

# Check for Google service account
Write-Host "=== Google Sheets Setup ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "To complete setup, you need:" -ForegroundColor Yellow
Write-Host "  1. A Google Cloud project with Sheets API enabled" -ForegroundColor White
Write-Host "  2. A service account JSON key file" -ForegroundColor White
Write-Host "  3. A Google Sheet with the service account as Editor" -ForegroundColor White
Write-Host ""
Write-Host "See QUICKSTART.md for detailed instructions" -ForegroundColor Gray
Write-Host ""

$hasKey = Read-Host "Do you have a service account JSON key file? (y/n)"
if ($hasKey -eq "y") {
    $keyPath = Read-Host "Enter the path to your service account key file"
    
    if (Test-Path $keyPath) {
        Write-Host "Encoding service account key to base64..." -ForegroundColor Yellow
        $base64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($keyPath))
        
        Write-Host ""
        Write-Host "Add this to your .env file as GOOGLE_SERVICE_ACCOUNT_KEY_BASE64:" -ForegroundColor Green
        Write-Host ""
        Write-Host $base64 -ForegroundColor Cyan
        Write-Host ""
        
        # Offer to copy to clipboard
        $copy = Read-Host "Copy to clipboard? (y/n)"
        if ($copy -eq "y") {
            $base64 | Set-Clipboard
            Write-Host "✓ Copied to clipboard!" -ForegroundColor Green
        }
    } else {
        Write-Host "✗ File not found: $keyPath" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Edit .env file with your Google Sheets configuration" -ForegroundColor White
Write-Host "  2. Run: npm run dev" -ForegroundColor White
Write-Host "  3. Visit: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see:" -ForegroundColor Gray
Write-Host "  - QUICKSTART.md (quick 5-min guide)" -ForegroundColor Gray
Write-Host "  - README.md (complete documentation)" -ForegroundColor Gray
Write-Host ""
