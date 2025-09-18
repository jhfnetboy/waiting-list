# Services Integration - 服务集成架构

## 🏗️ 项目架构概览

本项目采用主项目 + 子模块的架构，将钱包评分系统作为独立服务集成：

```
waiting-list/                    # 主项目 (等待列表应用)
├── src/                        # 前端和Worker代码
├── docs/                       # 主项目文档
├── services/                   # 微服务集成目录
│   └── wallet-scorer/          # 钱包评分系统 (git submodule)
└── scripts/                    # 部署和开发脚本
```

## 🔗 Git Submodule 管理

### 1. 子模块信息
- **仓库地址**: `git@github.com:jhfnetboy/wallet-scoring-ecosystem.git`
- **本地路径**: `services/wallet-scorer`
- **用途**: 钱包地址信用评分服务

### 2. 开发工作流

#### 2.1 初次克隆项目
```bash
# 克隆主项目
git clone git@github.com:jhfnetboy/waiting-list.git
cd waiting-list

# 初始化并更新子模块
git submodule init
git submodule update
```

#### 2.2 日常开发
```bash
# 在主项目中工作
cd /Users/jason/Dev/aastar/waiting-list
# ... 主项目开发

# 在子模块中工作
cd services/wallet-scorer
# ... 钱包评分系统开发

# 提交子模块更改
git add .
git commit -m "feat: add scoring algorithm"
git push origin main

# 回到主项目，更新子模块引用
cd ../..
git add services/wallet-scorer
git commit -m "chore: update wallet-scorer submodule"
git push origin main
```

#### 2.3 更新子模块到最新版本
```bash
# 方法1: 自动更新
git submodule update --remote services/wallet-scorer

# 方法2: 手动更新
cd services/wallet-scorer
git pull origin main
cd ../..
git add services/wallet-scorer
git commit -m "chore: update wallet-scorer to latest"
```

## 🔌 服务集成方式

### 1. 开发环境集成

#### 1.1 并行开发
```bash
# Terminal 1: 主项目开发服务器
cd /Users/jason/Dev/aastar/waiting-list
pnpm dev

# Terminal 2: 钱包评分服务开发
cd services/wallet-scorer
pnpm dev --port 8788
```

#### 1.2 本地服务通信
```typescript
// 在主项目中调用本地钱包评分服务
const WALLET_SCORER_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8788'
  : 'https://wallet-scorer.aastar.io'

const getWalletScore = async (address: string) => {
  const response = await fetch(`${WALLET_SCORER_URL}/api/v1/score/wallet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  })
  return response.json()
}
```

### 2. 生产环境集成

#### 2.1 独立部署
- **主项目**: `https://waiting-list.aastar.io`
- **钱包评分服务**: `https://wallet-scorer.aastar.io`

#### 2.2 服务间通信
```typescript
// 生产环境API调用
const walletScore = await fetch('https://wallet-scorer.aastar.io/api/v1/score/wallet', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${process.env.WALLET_SCORER_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ address: walletAddress })
})
```

## 🚀 部署策略

### 1. 独立部署流程

#### 1.1 主项目部署
```bash
cd /Users/jason/Dev/aastar/waiting-list
pnpm build
npx wrangler deploy
```

#### 1.2 钱包评分服务部署
```bash
cd services/wallet-scorer
pnpm build
npx wrangler deploy
```

### 2. CI/CD 集成

#### 2.1 GitHub Actions 工作流
```yaml
# .github/workflows/deploy.yml
name: Deploy Services
on:
  push:
    branches: [main]

jobs:
  deploy-main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: recursive
      - name: Deploy Main App
        run: |
          pnpm install
          pnpm build
          npx wrangler deploy
          
  deploy-wallet-scorer:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: recursive
      - name: Deploy Wallet Scorer
        working-directory: services/wallet-scorer
        run: |
          pnpm install
          pnpm build
          npx wrangler deploy
```

## 🔧 开发工具配置

### 1. VS Code 工作区配置
```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "eslint.workingDirectories": [
    ".",
    "services/wallet-scorer"
  ],
  "search.exclude": {
    "**/node_modules": true,
    "services/wallet-scorer/node_modules": true
  }
}
```

### 2. 统一的包管理
```json
// package.json - 添加脚本
{
  "scripts": {
    "dev": "wrangler dev src/worker.ts --port 8787 --local",
    "dev:scorer": "cd services/wallet-scorer && pnpm dev --port 8788",
    "dev:all": "concurrently \"pnpm dev\" \"pnpm dev:scorer\"",
    "build": "vite build",
    "build:all": "pnpm build && cd services/wallet-scorer && pnpm build",
    "deploy": "npm run build && wrangler deploy",
    "deploy:all": "pnpm deploy && cd services/wallet-scorer && pnpm deploy"
  }
}
```

## 📊 监控和日志

### 1. 统一日志收集
```typescript
// 共享日志工具
export const logger = {
  info: (service: string, message: string, data?: any) => {
    console.log(`[${service}] ${message}`, data)
  },
  error: (service: string, error: Error, context?: any) => {
    console.error(`[${service}] ${error.message}`, { error, context })
  }
}
```

### 2. 性能监控
```typescript
// 服务间调用监控
const callWalletScorer = async (address: string) => {
  const startTime = Date.now()
  try {
    const result = await getWalletScore(address)
    logger.info('wallet-scorer', 'API call success', {
      duration: Date.now() - startTime,
      address: address.slice(0, 6) + '...'
    })
    return result
  } catch (error) {
    logger.error('wallet-scorer', error as Error, { address })
    throw error
  }
}
```

## 🔄 版本管理策略

### 1. 语义化版本控制
- **主项目**: `v1.2.3`
- **钱包评分服务**: `v0.5.1`

### 2. 兼容性管理
```typescript
// API版本兼容性检查
const API_VERSION = 'v1'
const SCORER_MIN_VERSION = '0.5.0'

const checkServiceCompatibility = async () => {
  const response = await fetch(`${WALLET_SCORER_URL}/api/version`)
  const { version } = await response.json()
  
  if (!semver.gte(version, SCORER_MIN_VERSION)) {
    throw new Error(`Wallet scorer version ${version} is not compatible`)
  }
}
```

## 📚 文档结构

```
docs/
├── Services-Integration.md     # 本文档 - 服务集成
├── CustomDomain-Setup.md      # 自定义域名配置
├── WalletScoring-Architecture.md  # 钱包评分架构设计
└── API-Integration.md          # API集成指南
```

这种架构的优势：
- ✅ **独立开发**: 两个项目可以独立开发和部署
- ✅ **代码复用**: 钱包评分系统可以被其他项目使用
- ✅ **版本控制**: 清晰的版本依赖关系
- ✅ **团队协作**: 不同团队可以负责不同的服务
- ✅ **灵活部署**: 可以独立扩展和优化每个服务
