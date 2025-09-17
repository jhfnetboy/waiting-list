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

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Cloudflare Workers + Hono Framework
- **Database**: Cloudflare KV (Key-Value Store)
- **Email**: Resend API
- **Web3**: Native window.ethereum API (lightweight implementation)
- **Deployment**: Cloudflare Workers (unified deployment)
- **Architecture**: Single Worker handling both frontend assets and API endpoints

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

```bash
# Start development server with hot reload
pnpm dev

# Build for production
pnpm build

# Deploy to Cloudflare Workers
pnpm deploy
```

## 🏗 Project Structure

```
waiting-list/
├── src/
│   ├── components/        # Reusable UI components
│   ├── config/           # Configuration files
│   │   └── email-templates.ts  # Email template configurations
│   ├── lib/              # Utility libraries
│   │   └── web3.ts       # Web3 wallet integration
│   ├── pages/            # Application pages
│   │   ├── Index.tsx     # Main waiting list page
│   │   └── Admin.tsx     # Admin dashboard
│   ├── worker.ts         # Cloudflare Worker (API endpoints)
│   └── App.tsx           # Main application component
├── scripts/
│   └── start.sh          # Quick start script
├── wrangler.jsonc        # Cloudflare Worker configuration
└── README.md             # This file
```

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
