// Edge Runtime 兼容的中间件（使用轻量级配置，不包含数据库和 bcrypt）
import NextAuth from 'next-auth';
import authConfig from '@/lib/auth.config';

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
