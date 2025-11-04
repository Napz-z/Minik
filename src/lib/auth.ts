import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { User } from '@/types/api'
import { NextResponse } from 'next/server';
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: '用户名', type: 'text' },
        password: { label: '密码', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { username: credentials.username as string }
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            username: user.username,
            role: user.role
          };
        } catch (error) {
          console.error('认证错误:', error);
          return null;
        }
      }
    })
  ],
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
});
