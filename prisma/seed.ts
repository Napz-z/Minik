// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedUsers() {

  const defaultUsers = [
    {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || '123456',
      role: 'admin'
    }
  ];

  for (const userData of defaultUsers) {
    try {
      // 检查用户是否已存在
      const existingUser = await prisma.user.findUnique({
        where: { username: userData.username }
      });

      if (existingUser) {
        console.log(`用户 "${userData.username}" 已存在，跳过创建`);
        continue;
      }

      // 哈希密码
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // 创建用户
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          password: hashedPassword,
          role: userData.role
        }
      });

      console.log(`成功创建用户: ${user.username} (ID: ${user.id})`);
    } catch (error) {
      console.error(`创建用户 "${userData.username}" 失败:`, error);
    }
  }
}

async function main() {
  await seedUsers();
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});