import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (!process.env.ADMIN_PASSWORD) {
    console.warn('警告: 未设置 ADMIN_PASSWORD 环境变量，使用默认密码 "admin123"');
  }

  try {
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      console.log(`用户 "${username}" 已存在`);
      return;
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建管理员用户
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'admin'
      }
    });

    console.log(`管理员用户创建成功:`);
    console.log(`用户名: ${username}`);
    console.log(`用户ID: ${user.id}`);
    console.log(`角色: ${user.role}`);
    
  } catch (error) {
    console.error('创建管理员用户失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
