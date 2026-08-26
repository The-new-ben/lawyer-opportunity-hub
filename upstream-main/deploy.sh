#!/bin/bash

# Lawyer Opportunity Hub - Production Deployment Script
# This script automates the deployment process for production

set -e  # Exit on any error

echo "🚀 Starting deployment process for Lawyer Opportunity Hub..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local file not found. Creating from .env.example..."
    cp .env.example .env.local
    print_error "Please fill in the actual values in .env.local before continuing!"
    exit 1
fi

print_status "Environment file found"

# Install dependencies
print_status "Installing frontend dependencies..."
npm install

# Run linter
print_status "Running code linter..."
npm run lint

# Build the application
print_status "Building production application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not found"
    exit 1
fi

print_status "Frontend build completed successfully"

# Check if server directory exists and set it up
if [ -d "server" ]; then
    print_status "Setting up backend server..."
    cd server
    
    # Install server dependencies
    npm install
    
    # Check if Prisma schema exists
    if [ -f "prisma/schema.prisma" ]; then
        print_status "Running database migrations..."
        npx prisma migrate deploy
    fi
    
    cd ..
    print_status "Backend setup completed"
else
    print_warning "No server directory found - skipping backend setup"
fi

# Verify required files for deployment
print_status "Verifying deployment files..."

# Check for _redirects file
if [ ! -f "public/_redirects" ]; then
    print_error "_redirects file missing in public directory"
    exit 1
fi

# Check if HashRouter is used
if grep -q "HashRouter" src/App.tsx; then
    print_status "HashRouter found in App.tsx - routing configured correctly"
else
    print_warning "HashRouter not found - using BrowserRouter (ensure _redirects is configured)"
fi

print_status "All deployment files verified"

# Display deployment checklist
echo ""
echo "📋 DEPLOYMENT CHECKLIST:"
echo "========================"
echo ""
echo "✅ Code has been built and linted"
echo "✅ Dependencies are installed"
echo "✅ Required files are present"
echo ""
echo "🔧 ENVIRONMENT VARIABLES REQUIRED IN NETLIFY:"
echo "============================================="
echo ""
echo "🔑 Set these environment variables in Netlify Dashboard:"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_ANON_KEY"  
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - CLIENT_ORIGIN (set to your production domain)"
echo "   - WHATSAPP_PHONE_ID"
echo "   - WHATSAPP_TOKEN"
echo "   - VITE_OPENAI_API_KEY"
echo ""
echo "🔑 Set these repository secrets in GitHub:"
echo "   - NETLIFY_AUTH_TOKEN"
echo "   - NETLIFY_SITE_ID"
echo ""
echo "3. 🗄️  Configure Supabase Secrets:"
echo "   Go to: https://supabase.com/dashboard/project/mlnwpocuvjnelttvscja/settings/functions"
echo "   Add secrets:"
echo "   - WHATSAPP_TOKEN"
echo "   - WHATSAPP_PHONE_ID"
echo "   - OPENAI_API_KEY"
echo ""
echo "4. 🖥️  Deploy backend server (if using Express):"
echo "   - Deploy the 'server' directory to your server platform"
echo "   - Set environment variables on the server"
echo "   - Start with: node app.js"
echo ""
echo "5. ✅ Test deployment:"
echo "   - Visit your production URL"
echo "   - Test key routes: /dashboard, /leads, /clients"
echo "   - Verify API health: /api/health"
echo "   - Test lead creation and WhatsApp integration"
echo ""

# Check git status
if command -v git &> /dev/null; then
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "Uncommitted changes found. Consider committing before deployment:"
        git status --short
    else
        print_status "Git working directory is clean"
    fi
fi

print_status "Deployment preparation completed!"
print_status "Upload the 'dist' folder to your hosting platform to complete deployment."

echo ""
echo "🔗 Useful Links:"
echo "==============="
echo "• Lovable Documentation: https://docs.lovable.dev/"
echo "• Supabase Dashboard: https://supabase.com/dashboard/project/mlnwpocuvjnelttvscja"
echo "• Troubleshooting Guide: https://docs.lovable.dev/tips-tricks/troubleshooting"