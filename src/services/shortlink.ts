import type { ShortenRequest, ShortenResponse } from '@/types/api';
import { request } from '@/lib/http';

/**
 * 创建短链接
 * @param data - 请求体（url、withQr）
 */
export function createShortLink(data: ShortenRequest, timeout = 8000) {
  return request<ShortenResponse, ShortenRequest>('/api/shorten', {
    method: 'POST',
    body: data,
    timeout,
  });
}