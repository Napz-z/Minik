import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isValidUrl, isValidShortCode, ensureUniqueShortCode, generateShortCode } from '@/lib/shortcode';
import type{ User } from "@/types/api";
/**
 * 获取所有短链接
 * GET /api/admin/links
 */
export async function GET(request: NextRequest) {
  try {
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where = search ? {
      OR: [
        { originalUrl: { contains: search } },
        { shortCode: { contains: search } }
      ]
    } : {};

    // 获取总数
    const total = await prisma.link.count({ where });

    // 获取链接列表
    const links = await prisma.link.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        [sortBy]: sortOrder
      }
    });

    return NextResponse.json({
      links,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('获取链接列表失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * 创建新短链接
 * POST /api/admin/links
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, shortCode } = body;

    // 验证输入
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: '请提供有效的 URL' },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
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

    let finalShortCode: string;

    if (shortCode) {
      // 检查自定义短码是否被使用
      const existingLink = await prisma.link.findUnique({
        where: { shortCode }
      });
      
      if (existingLink) {
        return NextResponse.json(
          { error: '自定义短码已经被使用，请使用其他短码' },
          { status: 409 }
        );
      }
      finalShortCode = shortCode;
    } else {
      // 自动生成随机短码
      finalShortCode = await ensureUniqueShortCode(generateShortCode());
    }

    // 创建新的短链接记录
    const link = await prisma.link.create({
      data: {
        originalUrl: url,
        shortCode: finalShortCode,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('创建短链接失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * 批量删除短链接
 * DELETE /api/admin/links
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    // 验证输入
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: '请提供有效的ID列表' },
        { status: 400 }
      );
    }

    // 验证所有ID都是数字
    if (!ids.every(id => typeof id === 'number' && id > 0)) {
      return NextResponse.json(
        { error: 'ID必须是正整数' },
        { status: 400 }
      );
    }

    // 批量删除
    const result = await prisma.link.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    return NextResponse.json({
      message: `成功删除 ${result.count} 项`,
      count: result.count
    });
  } catch (error) {
    console.error('批量删除失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}