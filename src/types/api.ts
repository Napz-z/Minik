/**
 * API 相关类型定义
 * 包含所有 API 请求和响应的类型
 */
export interface ShortenRequest {
  /** 原始链接地址 */
  url: string;
  /** 是否生成二维码，默认为 false */
  withQr?: boolean;
}

/**
 * 短链接生成响应体类型
 */
export interface ShortenResponse {
  /** 生成的短链接 URL（成功时必需） */
  shortUrl?: string;
  /** 二维码图片的 base64 数据（可选） */
  qrCode?: string;
  /** 错误信息（可选） */
  error?: string;
}

/**
 * API 错误响应类型
 */
export interface ApiErrorResponse {
  /** 错误信息 */
  error: string;
  /** 错误代码（可选） */
  code?: string;
  /** 详细错误信息（可选） */
  details?: string;
}
