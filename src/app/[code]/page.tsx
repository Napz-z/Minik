import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

/**
 * 页面参数类型
 */
interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

/**
 * 短链接跳转页面组件
 * @param params - 包含短码的参数
 */
export default async function ShortLinkPage({ params }: PageProps) {
  const { code } = await params;

  // 查找短链接记录
  const link = await prisma.link.findUnique({
    where: { shortCode: code },
  });

  // 如果未找到，显示 404 页面
  if (!link) {
    notFound();
  }

  // 更新访问次数（异步执行，不阻塞重定向）
  prisma.link
    .update({
      where: { shortCode: code },
      data: { visitCount: { increment: 1 } },
    })
    .catch((error: unknown) => {
      console.error('更新访问次数失败:', error);
    });

  // 302 临时重定向到原始链接
  redirect(link.originalUrl);
}

