/**
 * 数据库相关类型定义
 * 基于 Prisma schema 的类型扩展
 */

export interface Link {
  /** 主键自增 ID */
  id: number;
  /** 原始链接地址 */
  originalUrl: string;
  /** 短链接代码（唯一标识） */
  shortCode: string;
  /** 创建时间 */
  createdAt: Date;
  /** 访问次数 */
  visitCount: number;
}

/**
 * 创建链接时的输入类型
 */
export interface CreateLinkInput {
  /** 原始链接地址 */
  originalUrl: string;
  /** 短链接代码 */
  shortCode: string;
}

/**
 * 更新链接时的输入类型
 */
export interface UpdateLinkInput {
  /** 访问次数增量 */
  visitCount?: number;
}

/**
 * 链接查询条件类型
 */
export interface LinkWhereInput {
  /** 根据 ID 查询 */
  id?: number;
  /** 根据短码查询 */
  shortCode?: string;
  /** 根据原始链接查询 */
  originalUrl?: string;
}
