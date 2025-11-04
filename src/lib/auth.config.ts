// Edge Runtime 兼容的配置（不包含数据库适配器和 bcrypt）
// 这个配置对象只包含 callbacks，不包含需要 Node.js 特性的部分
import type { NextAuthConfig } from 'next-auth';
import { User } from '@/types/api';

export default {
  // 注意：providers 在 middleware 中不会被使用（因为 middleware 只检查 session，不处理登录）
  // 实际的 providers 在 auth.ts 中定义
  providers: [],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as User).role;
        token.username = (user as User).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        (session.user as any).role = token.role as string;
        (session.user as any).username = token.username as string;
      }
      return session;
    },
    // 中间件的授权回调
    authorized: async ({ auth, request }) => {
      const { NextResponse } = await import('next/server');
      const { pathname } = request.nextUrl;
      const method = request.method;
      
      // 检查用户是否登录
      const isLoggedIn = !!auth?.user;
      
      // Admin API 需要登录和权限验证
      if (pathname.startsWith('/api/admin')) {
        // 未登录
        if (!isLoggedIn) {
          return NextResponse.json(
            { error: '未登录' },
            { status: 401 }
          );
        }
        
        // 非安全方法需要 admin 角色
        const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
        if (!SAFE_METHODS.includes(method)) {
          const role = (auth.user as any)?.role;
          if (role !== 'admin') {
            // 权限不足
            return NextResponse.json(
              { error: '权限不足' },
              { status: 403 }
            );
          }
        }
        return true;
      }
      
      // Admin 页面需要登录（除了登录页）
      // 返回 false 会自动重定向到登录页（由 pages.signIn 配置）
      if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        return isLoggedIn;
      }
      
      // 其他路径允许访问
      return true;
    }
  },
  pages: {
    signIn: '/admin/login'
  }
} satisfies NextAuthConfig;

