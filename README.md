# Waiting List - 等候名单应用

一个基于 Cloudflare Workers 的现代等候名单应用，采用统一架构同时处理前端界面和后端API。

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## Features

- ✅ **邮箱注册等候名单** - 用户可以通过邮箱注册加入等候名单
- ✅ **查看排队位置** - 实时查询当前排队位置
- ✅ **重复邮箱检测** - 防止重复注册
- ✅ **响应式界面** - 支持各种设备的现代化UI
- ✅ **实时状态查询** - 获取等候名单统计信息
- ⚡️ **统一架构** - 单一Cloudflare Worker处理前后端
- 🌍 **全球部署** - 基于Cloudflare全球CDN
- 📧 **邮件通知** - 自动发送欢迎邮件(可选)

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
  "email": "user@example.com"
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