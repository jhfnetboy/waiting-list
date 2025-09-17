# Waiting List - 部署指南

## 快速开始

### 1. 本地开发

```bash
# 初始化项目
./scripts/setup.sh

# 启动开发服务器
./scripts/start.sh
```

访问 http://localhost:8787

### 2. 部署到 Cloudflare Workers

#### 前置要求
- Cloudflare 账户
- Wrangler CLI 已登录

#### 部署步骤

1. **登录 Cloudflare**
```bash
npx wrangler login
```

2. **自动部署**
```bash
./scripts/deploy.sh
```

#### 手动部署步骤

如果自动部署失败，可以手动执行：

1. **创建 KV 存储空间**
```bash
# 生产环境
npx wrangler kv:namespace create "WAITING_LIST" --preview false

# 预览环境
npx wrangler kv:namespace create "WAITING_LIST" --preview
```

2. **更新 wrangler.jsonc**
将返回的 namespace ID 填入配置文件：
```json
{
  "kv_namespaces": [
    {
      "binding": "WAITING_LIST",
      "id": "你的生产环境ID",
      "preview_id": "你的预览环境ID"
    }
  ]
}
```

3. **构建和部署**
```bash
pnpm build
npx wrangler deploy
```

## 功能特性

- ✅ 邮箱注册等候名单
- ✅ 查看排队位置
- ✅ 重复邮箱检测
- ✅ 响应式界面
- ✅ 实时状态查询

## API 接口

### POST /api/waitlist
注册加入等候名单
```json
{
  "email": "user@example.com"
}
```

### GET /api/waitlist/:email
查询用户状态

### GET /api/waitlist
获取总人数统计

## 技术栈

- **前端**: React + TypeScript + Tailwind CSS + shadcn/ui
- **后端**: Hono + Cloudflare Workers
- **存储**: Cloudflare KV
- **部署**: Cloudflare Workers (统一部署)
- **架构**: 单一Worker同时处理前端资源和API接口

## 环境变量配置

### 必需配置

1. **KV 存储空间**
   - 通过 `wrangler.jsonc` 中的 `kv_namespaces` 配置
   - 部署时会自动创建

2. **邮件发送服务 (可选)**
   - 使用 Resend 服务发送确认邮件
   - 如不配置，系统仍正常运行，只是不发送邮件

### 邮件服务配置 (Resend)

#### 步骤 1: 注册 Resend 账户
1. 访问 [resend.com](https://resend.com)
2. 注册免费账户 (每月3000封邮件免费额度)
3. 验证你的域名或使用 Resend 提供的测试域名

#### 步骤 2: 获取 API Key
1. 在 Resend 控制台创建 API Key
2. 记录下这个 API Key

#### 步骤 3: 设置 Cloudflare 环境变量
```bash
# 设置 Resend API Key (必需)
npx wrangler secret put RESEND_API_KEY

# 可选：自定义发件人邮箱 (默认使用 wrangler.jsonc 中的配置)
# 修改 wrangler.jsonc 中的 FROM_EMAIL
```

### 部署前配置清单

- [ ] 登录 Cloudflare: `npx wrangler login`
- [ ] (可选) 注册 Resend 账户并获取 API Key
- [ ] (可选) 设置邮件发送密钥: `npx wrangler secret put RESEND_API_KEY`
- [ ] 修改 `wrangler.jsonc` 中的 `FROM_EMAIL` 为你的域名邮箱
