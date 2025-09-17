# Waiting List - 等候名单应用

一个基于 Cloudflare Workers 的现代等候名单应用，采用统一架构同时处理前端界面和后端API。

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## Features

- ✅ **Web3钱包连接** - 支持MetaMask等EVM钱包连接
- ✅ **数字签名验证** - 用户必须签名"Waiting for you!"消息
- ✅ **多测试网支持** - 支持Sepolia、Goerli、Mumbai等测试网
- ✅ **防重复注册** - 邮箱和钱包地址双重防重复
- ✅ **响应式界面** - 支持各种设备的现代化UI
- ✅ **实时状态查询** - 获取等候名单统计信息
- ⚡️ **统一架构** - 单一Cloudflare Worker处理前后端
- 🌍 **全球部署** - 基于Cloudflare全球CDN
- 📧 **邮件通知** - 自动发送欢迎邮件(可选)
- 🔐 **轻量级实现** - 使用原生window.ethereum API，无重型依赖

## Tech Stack

- **前端**: React + TypeScript + Tailwind CSS + shadcn/ui
- **后端**: Hono + Cloudflare Workers
- **存储**: Cloudflare KV
- **部署**: Cloudflare Workers (统一部署)
- **邮件**: Resend API (可选)
- **架构**: 单一Worker同时处理前端资源和API接口

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (推荐) 或 npm/yarn
- Cloudflare 账户 (部署时需要)
- MetaMask 或其他EVM兼容钱包 (用户使用时需要)

### Installation

```bash
# 克隆仓库
git clone https://github.com/yourusername/waiting-list.git
cd waiting-list

# 安装依赖
pnpm install

# 或使用快速设置脚本
./scripts/setup.sh
```

### Development

```bash
# 启动开发服务器
pnpm dev

# 或使用快速启动脚本
./scripts/start.sh
```

应用将在 `http://localhost:8787` 运行。

### Production Build & Deploy

```bash
# 构建项目
pnpm build

# 部署到 Cloudflare Workers
pnpm deploy

# 或使用部署脚本
./scripts/deploy.sh
```

## Project Structure

```
waiting-list/
├── src/
│   ├── components/
│   │   └── ui/           # Shadcn UI组件
│   ├── hooks/            # 自定义React hooks
│   ├── lib/              # 工具函数
│   ├── pages/            # 页面组件
│   ├── worker.ts         # Cloudflare Worker后端
│   ├── App.tsx           # 主应用组件
│   └── main.tsx          # 应用入口
├── scripts/              # 部署和启动脚本
├── dist/                 # 构建输出目录
├── wrangler.jsonc        # Cloudflare Worker配置
├── vite.config.ts        # Vite构建配置
└── package.json          # 项目依赖
```

## API 接口

### POST /api/waitlist
注册加入等候名单
```json
{
  "email": "user@example.com",
  "walletAddress": "0x742d35Cc6635C0532925a3b8D400100329af1e88",
  "signature": "0x...",
  "network": "sepolia"
}
```

### GET /api/waitlist/:email
查询用户状态和排队位置

### GET /api/waitlist
获取等候名单总人数统计

## Environment Variables

### 必需配置
- KV存储空间通过 `wrangler.jsonc` 配置，部署时自动创建

### 可选配置 (邮件服务)
在Cloudflare Worker中配置以下环境变量：
```
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
```

## 用户使用指南

### 准备工作
- 安装 MetaMask 或其他 EVM 兼容钱包
- 确保钱包中有少量代币（用于网络切换，签名本身免费）

### 注册流程

#### 步骤 1: 连接钱包
- 点击 "Connect Wallet" 按钮
- 在弹出的钱包界面中确认连接
- 连接成功后显示钱包地址

#### 步骤 2: 选择网络
- 从下拉菜单选择网络：
  - **Sepolia Test Network** (推荐测试网)
  - **Goerli Test Network** (以太坊测试网)
  - **Mumbai Testnet** (Polygon测试网)
  - **Optimism Mainnet** (Optimism主网)
- 点击 "Switch" 按钮切换网络
- 钱包会提示添加/切换网络

#### 步骤 3: 签名验证
- 点击 "Sign Message" 按钮
- 钱包弹出签名请求，显示消息: **"Waiting for you!"**
- 确认签名（**免费，不消耗gas**）
- 签名成功后显示签名哈希

#### 步骤 4: 输入邮箱
- 在邮箱输入框填入有效邮箱地址
- 用于接收确认邮件和后续通知

#### 步骤 5: 提交注册
- 确保所有步骤完成后，"Join Waiting List" 按钮变为可用
- 点击提交注册
- 成功后显示排队位置

## 技术特点

### 🔐 安全验证
- **钱包地址验证**: 确保用户拥有真实的Web3钱包
- **数字签名验证**: 防止恶意提交和机器人注册
- **双重防重复**: 邮箱和钱包地址都不能重复注册

### ⚡ 轻量级实现
- **零外部依赖**: 使用原生 `window.ethereum` API
- **无需代币**: 签名过程完全免费
- **快速响应**: 直接与浏览器钱包交互

### 🌐 多网络支持
- **Sepolia**: 以太坊官方测试网
- **Goerli**: 以太坊传统测试网  
- **Mumbai**: Polygon 测试网
- **Optimism**: Optimism 主网

## 常见问题

### Q: 为什么需要连接钱包？
A: 钱包连接确保每个用户都有真实的Web3身份，防止虚假注册和批量注册。

### Q: 签名会花费gas费吗？
A: 不会！签名是链下操作，完全免费。

### Q: 支持哪些钱包？
A: 支持所有 EVM 兼容钱包，包括 MetaMask、Trust Wallet、Coinbase Wallet 等。

### Q: 可以换个钱包地址重新注册吗？
A: 不可以。每个钱包地址只能注册一次，每个邮箱也只能注册一次。

### Q: 网络选择有什么区别？
A: 测试网络用于测试，Optimism主网用于正式使用。推荐测试时使用Sepolia。

## Contributing

Contributions are welcome! Feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ by [Libra](https://libra.dev)