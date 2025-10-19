import { request } from '@/lib/http';
import type { Link, LinksResponse, CreateLinkRequest, UpdateLinkRequest } from '@/types/api';

/**
 * 获取链接列表
 * @param params - 查询参数
 */
export function fetchLinks(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}) {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  return request<LinksResponse>(`/api/admin/links?${searchParams.toString()}`);
}

/**
 * 创建链接
 * @param data - 创建链接数据
 */
export function createLink(data: CreateLinkRequest) {
  return request<Link>('/api/admin/links', {
    method: 'POST',
    body: data,
  });
}

/**
 * 更新链接
 * @param id - 链接ID
 * @param data - 更新数据
 */
export function updateLink(id: number, data: UpdateLinkRequest) {
  return request<Link>(`/api/admin/links/${id}`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 删除链接
 * @param id - 链接ID
 */
export function deleteLink(id: number) {
  return request<{ message: string }>(`/api/admin/links/${id}`, {
    method: 'DELETE',
  });
}
