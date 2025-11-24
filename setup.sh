#!/bin/bash
# Science Fair Registration - Setup Script for Linux/Mac
# Run this script with: ./setup.sh

echo "=== Science Fair Registration Setup ==="
echo ""

# Check Node.js version
echo "Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js version: $NODE_VERSION"
    
    # Extract major version
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | tr -d 'v')
    if [ "$MAJOR_VERSION" -lt 18 ]; then
        echo "✗ Node.js version 18 or higher is required"
        echo "Please install from https://nodejs.org/"
        exit 1
    fi
else
    echo "✗ Node.js not found"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✓ .env file found"
else
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✓ Created .env file - please edit it with your configuration"
    echo "  Required: GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_KEY_BASE64"
fi

echo ""

# Install dependencies
echo "Installing dependencies..."
echo "This may take a few minutes..."

# Root dependencies
echo "Installing root dependencies..."
npm install

# Backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✓ All dependencies installed"
echo ""

# Check for Google service account
echo "=== Google Sheets Setup ==="
echo ""
echo "To complete setup, you need:"
echo "  1. A Google Cloud project with Sheets API enabled"
echo "  2. A service account JSON key file"
echo "  3. A Google Sheet with the service account as Editor"
echo ""
echo "See QUICKSTART.md for detailed instructions"
echo ""

read -p "Do you have a service account JSON key file? (y/n) " HAS_KEY
if [ "$HAS_KEY" = "y" ]; then
    read -p "Enter the path to your service account key file: " KEY_PATH
    
    if [ -f "$KEY_PATH" ]; then
        echo "Encoding service account key to base64..."
        BASE64_KEY=$(cat "$KEY_PATH" | base64 -w 0)
        
        echo ""
        echo "Add this to your .env file as GOOGLE_SERVICE_ACCOUNT_KEY_BASE64:"
        echo ""
        echo "$BASE64_KEY"
        echo ""
    else
        echo "✗ File not found: $KEY_PATH"
    fi
fi

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo "  1. Edit .env file with your Google Sheets configuration"
echo "  2. Run: npm run dev"
echo "  3. Visit: http://localhost:5173"
echo ""
echo "For detailed instructions, see:"
echo "  - QUICKSTART.md (quick 5-min guide)"
echo "  - README.md (complete documentation)"
echo ""
