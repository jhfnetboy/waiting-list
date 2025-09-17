#!/bin/bash

# Waiting List - Initial Setup Script
echo "🔧 Setting up Waiting List Application..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Make scripts executable
echo "🔐 Making scripts executable..."
chmod +x scripts/*.sh

# Check Wrangler login
echo "🔑 Checking Cloudflare authentication..."
if ! npx wrangler whoami > /dev/null 2>&1; then
    echo "⚠️  Please login to Cloudflare first:"
    echo "npx wrangler login"
else
    echo "✅ Cloudflare authentication verified"
fi

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run './scripts/start.sh' for local development"
echo "2. Run './scripts/deploy.sh' to deploy to Cloudflare"