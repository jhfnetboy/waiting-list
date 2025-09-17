#!/bin/bash

# Waiting List - Cloudflare Deployment Script
echo "☁️  Deploying Waiting List to Cloudflare..."

# Build the project
echo "🔨 Building project..."
pnpm build

# Check if KV namespace exists, create if not
echo "🗄️  Setting up KV namespace..."
KV_ID=$(npx wrangler kv:namespace create "WAITING_LIST" --preview false | grep -o 'id = "[^"]*"' | cut -d '"' -f 2)
KV_PREVIEW_ID=$(npx wrangler kv:namespace create "WAITING_LIST" --preview | grep -o 'id = "[^"]*"' | cut -d '"' -f 2)

# Update wrangler.jsonc with actual KV IDs
if [ ! -z "$KV_ID" ] && [ ! -z "$KV_PREVIEW_ID" ]; then
    echo "📝 Updating wrangler.jsonc with KV namespace IDs..."
    sed -i.bak "s/YOUR_KV_NAMESPACE_ID/$KV_ID/g" wrangler.jsonc
    sed -i.bak "s/YOUR_KV_PREVIEW_ID/$KV_PREVIEW_ID/g" wrangler.jsonc
    rm wrangler.jsonc.bak
else
    echo "⚠️  Warning: Could not create KV namespace automatically."
    echo "Please manually create KV namespace and update wrangler.jsonc"
fi

# Deploy to Cloudflare Workers
echo "🚀 Deploying to Cloudflare Workers..."
npx wrangler deploy

echo "✅ Deployment complete!"
echo "🌐 Your waiting list is now live!"