#!/bin/bash

echo "🚀 Starting all services for development..."

# 检查是否安装了必要的工具
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is required but not installed"
    exit 1
fi

if ! command -v concurrently &> /dev/null; then
    echo "📦 Installing concurrently for parallel execution..."
    npm install -g concurrently
fi

# 确保依赖已安装
echo "📦 Installing dependencies for main project..."
pnpm install

# 检查子模块是否存在且有内容
if [ -d "services/wallet-scorer" ] && [ "$(ls -A services/wallet-scorer)" ]; then
    echo "📦 Installing dependencies for wallet-scorer..."
    cd services/wallet-scorer
    if [ -f "package.json" ]; then
        pnpm install
    else
        echo "⚠️  wallet-scorer package.json not found, skipping dependency installation"
    fi
    cd ../..
else
    echo "⚠️  wallet-scorer submodule not found or empty"
    echo "💡 Run: git submodule update --init --recursive"
fi

echo ""
echo "🌟 Starting development servers:"
echo "  - Main app: http://localhost:8787"
echo "  - Wallet scorer: http://localhost:8788 (if available)"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# 启动并行开发服务器
if [ -f "services/wallet-scorer/package.json" ]; then
    # 如果钱包评分服务有package.json，并行启动两个服务
    concurrently \
        --names "MAIN,SCORER" \
        --prefix-colors "cyan,magenta" \
        "pnpm dev" \
        "cd services/wallet-scorer && pnpm dev --port 8788"
else
    # 否则只启动主服务
    echo "⚠️  Starting main service only (wallet-scorer not ready)"
    pnpm dev
fi
