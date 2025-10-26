'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/admin/Header';
import Table, { Column, Action } from '@/components/common/Table';
import LinkForm from '@/components/admin/LinkForm';
import { fetchLinks, deleteLink } from '@/services/admin';
import type { Link, LinksResponse, User } from '@/types/api';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const isAdmin = (session?.user as User)?.role === 'admin';

  useEffect(() => {
    loadLinks();
  }, [pagination.page, pagination.pageSize, search]);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const response: LinksResponse = await fetchLinks({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: search || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      setLinks(response.links);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages
      }));
    } catch (error) {
      console.error('加载链接失败:', error);
      setError('加载数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadLinks();
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleEdit = (link: Link) => {
    setEditingLink(link);
    setIsFormOpen(true);
  };

  const handleDelete = async (link: Link) => {
    if (!confirm('确定要删除这个短链接吗？')) {
      return;
    }

    setDeletingId(link.id);
    try {
      await deleteLink(link.id);
      loadLinks();
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请稍后重试');
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const columns: Column<Link>[] = [
    {
      key: 'shortCode',
      title: '短码',
      render: (value, record) => (
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-900">
            {value}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(`${window.location.origin}/${value}`);
            }}
            className="ml-2 text-gray-400 hover:text-gray-600"
            title="复制短链接"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      ),
      className: 'whitespace-nowrap'
    },
    {
      key: 'originalUrl',
      title: '原始链接',
      render: (value) => (
        <div className="text-sm text-gray-900 max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'visitCount',
      title: '访问次数',
      render: (value) => (
        <span className="text-sm text-gray-900">{value}</span>
      ),
      className: 'whitespace-nowrap'
    },
    {
      key: 'createdAt',
      title: '创建时间',
      render: (value) => (
        <span className="text-sm text-gray-500">{formatDate(value)}</span>
      ),
      className: 'whitespace-nowrap'
    }
  ];

  const actions: Action<Link>[] = [];

    if (isAdmin) {
    actions.push({
      label: '编辑',
      onClick: handleEdit,
      type: 'primary'  // 使用预设类型
    });

    actions.push({
      label: '删除',
      onClick: handleDelete,
      type: 'danger',  // 使用预设类型
      isLoading: (record) => deletingId === record.id,  // 简化
      isDisabled: (record) => deletingId === record.id  // 简化
    });
  }

  const handleCreate = () => {
    setEditingLink(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingLink(null);
  };

  const handleFormSuccess = () => {
    loadLinks();
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }
  if (status === 'unauthenticated') {
    router.push('/admin/login');
    return null;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">短链接管理</h1>
              {isAdmin && (
                <button
                  onClick={handleCreate}
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  创建短链接
                </button>
              )}
            </div>
          </div>

          {/* 搜索栏 */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索链接或短码..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                搜索
              </button>
            </form>
          </div>

          {/* 统计信息 */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">总链接数</dt>
                      <dd className="text-lg font-medium text-gray-900">{pagination.total}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">总访问量</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {links.reduce((sum, link) => sum + link.visitCount, 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">当前页</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {pagination.page} / {pagination.totalPages}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 链接列表 */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          ) : (
            <>
              <Table
                data={links}
                columns={columns}
                actions={actions.length > 0 ? actions : undefined}
                rowKey="id"
                emptyText="暂无数据"
              />

              {/* 分页 */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    显示第 {((pagination.page - 1) * pagination.pageSize) + 1} 到{' '}
                    {Math.min(pagination.page * pagination.pageSize, pagination.total)} 条，
                    共 {pagination.total} 条记录
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 表单模态框 */}
      <LinkForm
        link={editingLink}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        title={editingLink ? '编辑短链接' : '创建短链接'}
        submitText={editingLink ? '更新' : '创建'}
      />
    </div>
  );
}
