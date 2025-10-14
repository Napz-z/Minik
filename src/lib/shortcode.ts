import { customAlphabet } from 'nanoid';

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

