'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/admin/Header';
import SearchBar from '@/components/admin/SearchBar';
import StatsCards from '@/components/admin/StatsCards';
import Table, { Column, Action } from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import LinkForm from '@/components/admin/LinkForm';
import { request } from '@/lib/http';
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
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const isAdmin = (session?.user as User)?.role === 'admin';

  useEffect(() => {
    loadLinks();
  }, [pagination.page, pagination.pageSize, search]);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const response = await fetchLinksData(pagination, search);
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


  const fetchLinksData = async (pagination: { page: number; pageSize: number }, search: string) => {
    const searchParams = new URLSearchParams();
  
    searchParams.set('page', pagination.page.toString());
    searchParams.set('pageSize', pagination.pageSize.toString());
    if (search) searchParams.set('search', search);
    searchParams.set('sortBy', 'createdAt');
    searchParams.set('sortOrder', 'desc');
  
    return await request<LinksResponse>(`/api/admin/links?${searchParams.toString()}`);
    
  }
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
      await request<{ message: string }>(`/api/admin/links/${link.id}`, {
        method: 'DELETE'
      });
      loadLinks();
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请稍后重试');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedKeys.length === 0) {
      alert('请先选择要删除的项');
      return;
    }

    if (!confirm(`确定要删除选中的 ${selectedKeys.length} 个短链接吗？`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const ids = selectedKeys.map(key => Number(key));
      await request<{ message: string; count: number }>('/api/admin/links', {
        method: 'DELETE',
        body: { ids }
      });
      setSelectedKeys([]);
      loadLinks();
      alert('批量删除成功');
    } catch (error) {
      console.error('批量删除失败:', error);
      alert(error instanceof Error ? error.message : '批量删除失败，请稍后重试');
    } finally {
      setIsDeleting(false);
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
          <SearchBar
            value={search}
            onChange={setSearch}
            onSubmit={handleSearch}
            placeholder="搜索链接或短码..."
          />

          {/* 统计信息 */}
          <StatsCards
            total={pagination.total}
            links={links}
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
          />

          {/* 批量操作栏*/}
          <div
            className={`mb-4 transition-all duration-300 ease-in-out overflow-hidden ${isAdmin && selectedKeys.length > 0 ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
              }`}
          >
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
              <div className="text-sm text-gray-700">
                已选择 <span className="font-semibold text-gray-600">{selectedKeys.length}</span> 项
              </div>
              <button
                onClick={handleBatchDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isDeleting ? '删除中...' : '批量删除'}
              </button>
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
                selectable={isAdmin}
                onSelectionChange={setSelectedKeys}
              />

              {/* 分页 */}
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onPageChange={handlePageChange}
              />
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
