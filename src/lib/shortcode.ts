import { customAlphabet } from 'nanoid';
import { prisma } from '@/lib/prisma'; 
/**
 * 自定义字母表，排除易混淆字符（如 0、O、I、l 等）
 */
const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/**
 * 生成指定长度的短码
 */
const nanoid = customAlphabet(alphabet, 7);

/**
 * 生成唯一短链接代码
 * @returns 7位短码字符串
 */
export function generateShortCode(): string {
  return nanoid();
}

/**
 * 验证 URL 格式是否有效
 * @param url - 待验证的 URL 字符串
 * @returns 是否为有效 URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * 验证短代码是否有效
 * @param shortCode - 短链接代码
 * @returns 是否为有效短码
 */
export function isValidShortCode(shortCode: string): boolean {
  if (!shortCode || typeof shortCode !== 'string') return false;
  const trimmedCode = shortCode.trim();
  if (trimmedCode.length > 7 || trimmedCode.length < 3) return false;
  // 检查字符类型：仅允许字母和数字
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(trimmedCode)) return false;
  return true;
}

/**
 * 短码唯一性检查
 * @param shortCode - 短链接代码
 * @returns 唯一短码
 */
export async function ensureUniqueShortCode(shortCode: string): Promise<string> {
  let finalCode = shortCode;
  let existingLink = await prisma.link.findUnique({
    where: { shortCode: finalCode },
  });

  while (existingLink) {
    finalCode = generateShortCode();
    existingLink = await prisma.link.findUnique({
      where: { shortCode: finalCode },
    });
  }
  return finalCode;
}

/**
 * 从 URL 中获取短链接代码
 * @param url - 包含短链接代码的 URL 字符串
 * @returns 短链接代码
 */
export function getShortCodeFromUrl(url: string): string {
  const urlObj = new URL(url);
  return urlObj.pathname.split('/').pop() || '';
}