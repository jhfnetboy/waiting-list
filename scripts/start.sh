#!/bin/bash

# Waiting List - Quick Start Script
echo "🚀 Starting Waiting List Application..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Start development server (unified)
echo "🌟 Starting development server..."
echo "📍 Application: http://localhost:8787"
echo "🔄 Starting Cloudflare Worker..."
pnpm dev