#  Minik ⚡短链接生成服务

> 一款基于 **Next.js** 构建的现代化短链接生成平台，支持二维码生成、访问统计与后台管理。  
> 简洁、快速、安全、可扩展。

---

## ✨ 功能特性

- 🔗 **短链接生成**：将长链接转换为简短易分享的短网址  
- 🎨 **自定义短码**：支持个性化短码设置  
- 📱 **二维码生成**：一键生成并下载短链接二维码  
- 🚀 **快速跳转**：访问短链接自动重定向至原始地址  
- 📊 **访问统计**：记录每个链接的访问次数与趋势  
- 🧩 **后台管理系统**：可视化管理短链接与用户权限  
- 💎 **现代化 UI**：简洁美观、体验流畅  
- 📲 **响应式设计**：完美适配 PC 与移动端  
- ⚙️ **组件封裝**：手动封装Toast、Dialog、Form 等组件，交互丝滑流畅
---
## 📷 界面预览
<img width="1099" height="673" alt="image" src="https://github.com/user-attachments/assets/eb42138e-3652-4e31-9e40-9ade56eef9f5" />


## 轻量级管理面板：
<img width="1458" height="940" alt="image" src="https://github.com/user-attachments/assets/1c330cb7-8b69-4780-99ec-6b87e6f25222" />


## 🛠️ 技术栈

| 模块 | 技术 |
|------|------|
| 框架 | [Next.js](https://nextjs.org/) |
| 鉴权 | [NextAuth.js](https://next-auth.js.org/) |
| 样式方案 | [Tailwind CSS](https://tailwindcss.com/) |
| 数据库 | [Postgresql](https://www.postgresql.org/) |
| ORM | [Prisma](https://www.prisma.io/) |

---

## 📦 安装与运行

### 1️⃣ 安装依赖

```bash
# 使用 npm / pnpm（推荐使用）
npm install / pnpm install
# 或
yarn install
```
2️⃣ 环境配置

复制环境变量示例文件：

```bash
cp .env.example .env
```
修改 .env 文件内容：

```bash
# 数据库连接字符串
DATABASE_URL="postgresql://用戶名:密碼@localhost:5432/minik"

# 管理员账号配置
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-secure-password"

# NextAuth.js 配置
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# 网站基础 URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```


🚀 启动项目
```bash
# 生成 Prisma 客户端
pnpm prisma:generate

# 同步数据库结构
prisma:push

# 初始化默认数据
pnpm prisma:seed

开发模式
pnpm dev
```
> 访问 http://localhost:3000

生产部署
```bash
# 构建项目
pnpm build

# 启动生产环境
pnpm start
```

🧩 Prisma 命令
```bash
# 生成 Prisma 客户端
pnpm prisma:generate

# 同步数据库结构（开发环境）
pnpm prisma:push

# 初始化默认数据
pnpm prisma:seed

# 启动可视化数据库管理界面
pnpm prisma:studio
```
## 🎨 使用说明

### 生成短链接

1. 在首页输入框中粘贴原始链接  
2. 可选择是否生成二维码  
3. 点击「生成短链接」按钮  

### 使用短链接

1. 复制生成的短链接  
2. 打开链接即可自动跳转至原始网址  

### 下载二维码

1. 点击「下载二维码」按钮保存至本地  

---

## 🧭 开发路线图

### ✅ 核心功能
- 短链接生成  
- 二维码生成与下载  
- 自定义短码  

### 🔐 后台功能
- 登录与鉴权  
- 链接管理面板  
- 访问数据统计与图表展示  

---

## 💬 贡献指南

欢迎提交 Issue 或 Pull Request

> 💡 快速而强大。
> 用更优雅的方式分享链接，让你的内容传播更高效

## 📜 声明

> 本在线网站只用于项目展示，随时可能关闭，并不保证绝对的可用性，切勿用于商业用途或非法传播，因此产生的任何纠纷与本人无关。
