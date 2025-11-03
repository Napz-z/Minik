import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isValidUrl, isValidShortCode } from '@/lib/shortcode';
import type{ User } from "@/types/api";
/**
 * 更新短链接
 * PUT /api/admin/links/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const linkId = parseInt((await params).id);
    if (isNaN(linkId)) {
      return NextResponse.json({ error: '无效的链接ID' }, { status: 400 });
    }

    const body = await request.json();
    const { url, shortCode } = body;

    // 验证输入
    if (url && !isValidUrl(url)) {
      return NextResponse.json(
        { error: 'URL 格式不正确，请确保包含 http:// 或 https://' },
        { status: 400 }
      );
    }

    if (shortCode && !isValidShortCode(shortCode)) {
      return NextResponse.json(
        { error: '自定义短码格式不正确：长度需在3-7字符之间，仅支持字母、数字、连字符和下划线' },
        { status: 400 }
      );
    }

    // 检查链接是否存在
    const existingLink = await prisma.link.findUnique({
      where: { id: linkId }
    });

    if (!existingLink) {
      return NextResponse.json({ error: '链接不存在' }, { status: 404 });
    }

    // 如果更新短码，检查是否已被使用
    if (shortCode && shortCode !== existingLink.shortCode) {
      const duplicateLink = await prisma.link.findUnique({
        where: { shortCode }
      });
      
      if (duplicateLink) {
        return NextResponse.json(
          { error: '自定义短码已经被使用，请使用其他短码' },
          { status: 409 }
        );
      }
    }

    // 更新链接
    const updatedLink = await prisma.link.update({
      where: { id: linkId },
      data: {
        ...(url && { originalUrl: url }),
        ...(shortCode && { shortCode })
      }
    });

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error('更新短链接失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * 删除短链接
 * DELETE /api/admin/links/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const linkId = parseInt((await params).id);
    if (isNaN(linkId)) {
      return NextResponse.json({ error: '无效的链接ID' }, { status: 400 });
    }

    // 检查链接是否存在
    const existingLink = await prisma.link.findUnique({
      where: { id: linkId }
    });

    if (!existingLink) {
      return NextResponse.json({ error: '链接不存在' }, { status: 404 });
    }

    // 删除链接
    await prisma.link.delete({
      where: { id: linkId }
    });

    return NextResponse.json({ message: '链接删除成功' });
  } catch (error) {
    console.error('删除短链接失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
