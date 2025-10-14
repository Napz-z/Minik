/**
 * 短链接生成 API
 * POST /api/shorten
 * 接收原始链接，返回生成的短链接和可选的二维码
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateShortCode, isValidUrl } from '@/lib/shortcode';
import type { ShortenRequest, ShortenResponse } from '@/types/api';
import QRCode from 'qrcode';

/**
 * POST 请求处理器
 * @param request - Next.js 请求对象
 * @returns JSON 响应
 */
export async function POST(request: NextRequest) {
  try {
    const body: ShortenRequest = await request.json();
    const { url, withQr = false } = body;

    // 验证输入
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: '请提供有效的 URL' },
        { status: 400 }
      );
    }

    // 验证 URL 格式
    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: 'URL 格式不正确，请确保包含 http:// 或 https://' },
        { status: 400 }
      );
    }

    // 检查是否已存在相同的原始链接
    let link = await prisma.link.findFirst({
      where: { originalUrl: url },
    });

    // 如果不存在，生成新的短码
    if (!link) {
      let shortCode = generateShortCode();
      
      // 确保短码唯一性（虽然概率极低，但仍需检查）
      let existingLink = await prisma.link.findUnique({
        where: { shortCode },
      });

      // 如果冲突，重新生成
      while (existingLink) {
        shortCode = generateShortCode();
        existingLink = await prisma.link.findUnique({
          where: { shortCode },
        });
      }

      // 创建新的短链接记录
      link = await prisma.link.create({
        data: {
          originalUrl: url,
          shortCode,
        },
      });
    }

    // 构建短链接 URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shortUrl = `${baseUrl}/${link.shortCode}`;

    // 准备响应数据
    const response: ShortenResponse = {
      shortUrl,
    };

    // 如果需要生成二维码
    if (withQr) {
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(shortUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        response.qrCode = qrCodeDataUrl;
      } catch (qrError) {
        console.error('二维码生成失败:', qrError);
        // 二维码生成失败不影响短链接返回
      }
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('生成短链接时出错:', error);
    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    );
  }
}

