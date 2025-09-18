# Waiting List - Web3 Enabled Registration System

> 🌐 **Language**: [中文版 (Chinese)](README-zh.md) | **English**

A modern, Web3-enabled waiting list application built with React, TypeScript, and Cloudflare Workers. Features wallet integration, email verification, and an admin dashboard.

## ✨ Features

- **📧 Email Registration** - Secure email-based waiting list registration
- **🔐 Web3 Wallet Integration** - Connect with MetaMask and other EVM-compatible wallets  
- **📝 Digital Signature Verification** - Off-chain signature verification for authenticity
- **🌐 Multi-Network Support** - Support for Sepolia, Goerli, Mumbai, and Optimism Mainnet
- **✅ Email Verification** - Automated email verification with beautiful HTML templates
- **📊 Admin Dashboard** - Password-protected admin interface with statistics and user management
- **🎨 Modern UI** - Beautiful, responsive interface with animated forest background
- **⚡ Global Deployment** - Deployed on Cloudflare Workers for worldwide performance
- **🔒 Privacy Focused** - Minimal data collection with secure storage

## 🛠 Tech Stack

### Main Application
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Cloudflare Workers + Hono Framework
- **Database**: Cloudflare KV (Key-Value Store)
- **Email**: Resend API
- **Web3**: Native window.ethereum API (lightweight implementation)
- **Deployment**: Cloudflare Workers (unified deployment)
- **Architecture**: Single Worker handling both frontend assets and API endpoints

### Microservices Ecosystem
- **Wallet Scoring Service**: Independent Cloudflare Worker for wallet reputation scoring
- **Multi-chain Support**: Ethereum, Polygon, BSC, Arbitrum, Optimism
- **Caching Strategy**: Multi-tier caching with KV and D1 database
- **API Integration**: RESTful APIs with SDK support
- **Development**: Git submodules for independent development and deployment

## 📋 Prerequisites

- Node.js 18+ and pnpm
- Cloudflare account
- MetaMask or other EVM-compatible wallet
- Resend API key (for email functionality)

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/jhfnetboy/waiting-list.git
cd waiting-list

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:8787` to see the application.

### Development

#### Single Service Development
```bash
# Start main application only
pnpm dev

# Build for production
pnpm build

# Deploy to Cloudflare Workers
pnpm deploy
```

#### Parallel Development (with Submodules)
```bash
# Clone with submodules
git clone --recursive https://github.com/jhfnetboy/waiting-list.git

# Or initialize submodules after cloning
git submodule update --init --recursive

# Start all services in parallel
pnpm dev:all          # Main app (8787) + Wallet scorer (8788)

# Build all services
pnpm build:all

# Deploy all services
pnpm deploy:all
```

#### Manual Parallel Development
```bash
# Terminal 1: Main application
pnpm dev

# Terminal 2: Wallet scoring service
cd services/wallet-scorer
pnpm dev --port 8788
```

## 🏗 Project Structure

```
waiting-list/                    # Main project repository
├── src/
│   ├── components/        # Reusable UI components
│   ├── config/           # Configuration files
│   │   └── email-templates.ts  # Email template configurations
│   ├── lib/              # Utility libraries
│   │   └── web3.ts       # Web3 wallet integration
│   ├── pages/            # Application pages
│   │   ├── Index.tsx     # Main waiting list page
│   │   ├── Admin.tsx     # Admin dashboard
│   │   └── VerifySuccess.tsx  # Email verification success page
│   ├── worker.ts         # Cloudflare Worker (API endpoints)
│   └── App.tsx           # Main application component
├── services/
│   └── wallet-scorer/    # 🔗 Git submodule: Wallet scoring microservice
├── scripts/
│   ├── start.sh          # Quick start script
│   └── dev-all.sh        # Parallel development script
├── docs/
│   ├── Services-Integration.md  # Microservices integration guide
│   └── CustomDomain-Setup.md   # Custom domain configuration
├── wrangler.jsonc        # Cloudflare Worker configuration
└── README.md             # This file
```

### 🔗 Microservices Architecture

This project uses a **main project + submodules** architecture:

- **Main Project**: Waiting list application with Web3 wallet integration
- **Submodule**: [`wallet-scoring-ecosystem`](https://github.com/jhfnetboy/wallet-scoring-ecosystem) - Independent wallet scoring microservice

**Benefits:**
- ✅ **Independent Development**: Each service can be developed and deployed separately
- ✅ **Code Reusability**: Wallet scoring system can be used by other projects
- ✅ **Team Collaboration**: Different teams can work on different services
- ✅ **Version Control**: Clear dependency relationships and versioning

## 🔧 Configuration

### Environment Variables

Configure these in `wrangler.jsonc`:

```jsonc
{
  "vars": {
    "FROM_EMAIL": "Waiting List <noreply@aastar.io>",
    "ADMIN_PASSWORD": "your_secure_admin_password"
  }
}
```

### Secrets (set via Wrangler CLI)

```bash
# Set Resend API key for email functionality
npx wrangler secret put RESEND_API_KEY
```

### Cloudflare KV Setup

```bash
# Create KV namespaces
npx wrangler kv namespace create WAITING_LIST
npx wrangler kv namespace create WAITING_LIST --preview

# Update wrangler.jsonc with the generated namespace IDs
```

## 📡 API Endpoints

### Public Endpoints

- `POST /api/waitlist` - Register for waiting list
- `GET /api/verify` - Verify email address
- `GET /api/waitlist/:email` - Get user position and status

### Admin Endpoints (Password Protected)

- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/users` - Get paginated user list
- `GET /api/admin/stats` - Get user statistics

## 📱 User Guide

### Registration Process

1. **Connect Wallet** - Click "Connect Wallet" and approve the connection
2. **Select Network** - Choose your preferred network (Sepolia, Goerli, Mumbai, or Optimism)
3. **Sign Message** - Sign the verification message "Waiting for you!" (off-chain, no fees)
4. **Enter Email** - Provide your email address for notifications
5. **Join List** - Complete registration and receive your position

### Email Verification

After registration, you'll receive a verification email with:
- Beautiful HTML template with emojis
- One-click verification link
- Your position in the waiting list
- Welcome message after verification

## 🔐 Security Features

- **Off-chain Signatures**: No transaction fees, wallet remains secure
- **Email Verification**: Prevents spam and ensures valid email addresses
- **Admin Authentication**: Password-protected admin access
- **Input Validation**: Comprehensive validation for all user inputs
- **Privacy Protection**: Minimal data collection, secure KV storage

## 🌍 Supported Networks

- **Sepolia** (Ethereum Testnet)
- **Goerli** (Ethereum Testnet)  
- **Mumbai** (Polygon Testnet)
- **Optimism Mainnet** (Layer 2)

## 📊 Email Templates

The application includes beautiful, customizable email templates:

- **Verification Email**: Welcome message with verification link
- **Welcome Email**: Confirmation with position and next steps
- **HTML + Text**: Both HTML and plain text versions
- **Emoji Support**: Rich emoji integration for better engagement

Templates are configurable in `src/config/email-templates.ts`.

## 🔗 Submodule Integration

### Wallet Scoring Ecosystem

The project integrates a sophisticated wallet scoring system as a Git submodule:

**Repository**: [wallet-scoring-ecosystem](https://github.com/jhfnetboy/wallet-scoring-ecosystem)

**Features:**
- 🔍 **Multi-chain Analysis**: Scans transaction history across 5+ blockchains
- 📊 **Credit Scoring**: 3-tier scoring system (Basic/DeFi/Risk evaluation)
- ⚡ **Real-time Processing**: Edge computing with Cloudflare Workers
- 🔌 **SDK Integration**: Easy integration via REST API or TypeScript SDK
- 💰 **Commercial Ready**: Freemium model with advanced features

**Integration Example:**
```typescript
// In waiting-list application
const walletScore = await fetch('https://wallet-scorer.aastar.io/api/v1/score/wallet', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${API_KEY}` },
  body: JSON.stringify({ address: walletAddress })
})

if (score < 30) {
  // Suggest adding more wallet addresses
  setShowAddMoreWallets(true)
}
```

### Submodule Management

```bash
# Add new submodule
git submodule add <repository-url> <local-path>

# Update submodule to latest
git submodule update --remote

# Remove submodule
git submodule deinit <path>
git rm <path>
```

For detailed integration instructions, see [`docs/Services-Integration.md`](docs/Services-Integration.md).

## 🛡 Admin Dashboard

Access the admin dashboard at `/admin` with features:

- **User Management**: View all registered users with pagination
- **Statistics**: Total users, verification status, network distribution
- **Real-time Data**: Live updates from Cloudflare KV
- **Secure Access**: Password-protected authentication

## 🚀 Production Deployment

### Build & Deploy

```bash
# Build the application
pnpm build

# Deploy to Cloudflare Workers
pnpm deploy
```

### Domain Setup

1. Configure custom domain in Cloudflare Dashboard
2. Update `workers.dev` subdomain if needed
3. Set up SSL/TLS encryption

### Monitoring

- View logs in Cloudflare Dashboard
- Monitor performance and usage
- Set up alerts for errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/jhfnetboy/waiting-list/issues)
- **Documentation**: This README and inline code comments
- **Community**: Join our waiting list to stay updated!

---

**Built with ❤️ using modern web technologies and Web3 integration**
