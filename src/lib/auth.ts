// 完整的 Auth 实例（用于 Node.js Runtime：API 路由、Server Components 等）
// 包含数据库访问和 bcrypt，不能在 Edge Runtime 中使用
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import authConfig from './auth.config';

// 扩展配置，添加需要数据库的 authorize 函数
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
  ]
});
