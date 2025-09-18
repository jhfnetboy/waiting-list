# Custom Domain Setup - waiting-list.aastar.io

## 🌐 Cloudflare自定义域名配置

由于Cloudflare已经添加了 `waiting-list.aastar.io` 自定义域名，以下是完整的配置说明：

### 1. Cloudflare控制台配置

#### 1.1 Workers & Pages 设置
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages**
3. 选择 `waiting-list` Worker
4. 点击 **Settings** → **Triggers**
5. 在 **Custom Domains** 部分添加：
   - Domain: `waiting-list.aastar.io`
   - 确保状态为 "Active"

#### 1.2 DNS 配置
1. 进入 `aastar.io` 域名的 **DNS** 设置
2. 确保有以下记录：
   ```
   Type: CNAME
   Name: waiting-list
   Content: waiting-list.jhfnetboy.workers.dev
   Proxy status: Proxied (橙色云朵)
   ```

### 2. 验证配置

#### 2.1 测试域名解析
```bash
# 检查DNS解析
nslookup waiting-list.aastar.io

# 测试HTTPS访问
curl -I https://waiting-list.aastar.io
```

#### 2.2 验证Worker绑定
```bash
# 测试API端点
curl https://waiting-list.aastar.io/api/waitlist

# 测试前端页面
curl https://waiting-list.aastar.io/
```

### 3. SSL/TLS 配置

Cloudflare会自动为自定义域名提供SSL证书，确保：
- **SSL/TLS encryption mode**: Full (strict)
- **Always Use HTTPS**: On
- **Minimum TLS Version**: 1.2

### 4. 部署更新

现在可以正常部署Worker：
```bash
cd /Users/jason/Dev/aastar/waiting-list
npx wrangler deploy
```

Worker将同时在以下域名可用：
- https://waiting-list.jhfnetboy.workers.dev (Workers.dev 子域名)
- https://waiting-list.aastar.io (自定义域名)

### 5. 环境变量更新

无需修改代码，因为邮件中的验证链接已经使用 `waiting-list.aastar.io` 域名。

### 6. 监控和日志

可以通过以下方式监控自定义域名的使用：
- Cloudflare Analytics
- Workers Analytics
- Real-time logs: `npx wrangler tail`

## 🔧 故障排除

### 问题1: 域名无法访问
**解决方案**:
1. 检查DNS传播状态
2. 确认Cloudflare代理状态（橙色云朵）
3. 验证Worker部署状态

### 问题2: SSL证书错误
**解决方案**:
1. 等待证书自动生成（通常5-10分钟）
2. 检查SSL/TLS设置
3. 尝试清除浏览器缓存

### 问题3: API路由404错误
**解决方案**:
1. 确认Worker代码已正确部署
2. 检查路由配置
3. 查看Workers日志排查问题

## 📊 性能优化

使用自定义域名的优势：
- **更好的品牌体验**: waiting-list.aastar.io vs waiting-list.jhfnetboy.workers.dev
- **SEO友好**: 自定义域名更利于搜索引擎优化
- **专业形象**: 提升用户信任度
- **统一域名**: 与主站点 aastar.io 保持一致
