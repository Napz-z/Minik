# 📄 短链接生成网站

基于 **Next.js** 的现代化短链接生成服务，支持二维码生成和链接管理。

## ✨ 功能特性

- 🔗 **短链接生成** - 将长链接转换为简短易分享的短链接
- 📱 **二维码生成** - 可选生成短链接的二维码图片
- 🚀 **快速跳转** - 自动重定向到原始链接
- 📊 **访问统计** - 记录链接访问次数
- 💎 **现代化 UI** - 简洁美观的用户界面
- 📱 **响应式设计** - 完美适配 PC 和移动端

## 🛠️ 技术栈

- **前端框架**: Next.js
- **开发语言**: TypeScript
- **样式方案**: Tailwind CSS 4
- **数据库**: MySQL
- **ORM 工具**: Prisma
- **二维码生成**: qrcode
- **短码生成**: nanoid

## 📦 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

## ⚙️ 环境配置

1. 复制环境变量示例文件：

```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，配置数据库连接：

```env
# 数据库连接字符串
DATABASE_URL="mysql://用户名:密码@主机:端口/数据库名"

# 网站基础 URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

3. 初始化数据库：

```bash
# 生成 Prisma 客户端
pnpm prisma:generate

# 同步数据库结构
pnpm prisma:push
```

## 🚀 运行项目

### 开发模式

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 生产构建

```bash
# 构建项目
pnpm build

# 启动生产服务器
pnpm start
```

## 📚 Prisma 命令

```bash
# 生成 Prisma 客户端
pnpm prisma:generate

# 同步数据库结构（开发环境）
pnpm prisma:push

# 打开 Prisma Studio（数据库管理界面）
pnpm prisma:studio
```

## 📁 项目结构

```
Minik/
├── src/                   # 源代码目录
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API 路由
│   │   │   └── shorten/   # 短链接生成 API
│   │   ├── [code]/        # 动态路由（短链接跳转）
│   │   ├── globals.css    # 全局样式
│   │   ├── layout.tsx     # 根布局
│   │   ├── page.tsx       # 首页
│   │   └── not-found.tsx  # 404 页面
│   ├── components/        # React 组件
│   │   └── ShortLinkGenerator.tsx  # 短链接生成器组件
│   └── lib/               # 工具库
│       ├── prisma.ts      # Prisma 客户端
│       └── shortcode.ts   # 短码生成工具
├── prisma/                # Prisma 配置
│   └── schema.prisma      # 数据库 Schema
├── public/                # 静态资源

```


## 🎨 使用说明

1. **生成短链接**
   - 在首页输入框中输入原始链接
   - 可选择是否生成二维码
   - 点击"生成短链接"按钮

2. **使用短链接**
   - 复制生成的短链接
   - 访问短链接会自动跳转到原始链接

3. **下载二维码**
   - 点击"下载二维码"按钮保存图片

## 🚧 开发路线图

### 🧩 核心功能
- [x] 🔗 短链接生成
- [x] 🧾 二维码生成与下载
- [ ] ✏️ 自定义短码设置
- [ ] ⏳ 链接过期时间设置

### 🧠 后台功能
- [ ] 👤 登录与鉴权
- [ ] 📋 链接管理面板
- [ ] 📊 访问数据统计与图表展示

> 💡 本项目仍在持续开发中，欢迎提交Issue或PR

## 📄 License

MIT License - 详见 [LICENSE](LICENSE) 文件

---

⚡ 快速、安全、高效的短链接服务
