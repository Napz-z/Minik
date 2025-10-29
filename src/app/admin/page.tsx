'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/admin/Header';
import SearchBar from '@/components/admin/SearchBar';
import StatsCards from '@/components/admin/StatsCards';
import Form, { FormField } from '@/components/common/Form';
import Table, { Column, Action } from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import Dialog from '@/components/common/Dialog';
import { request } from '@/lib/http';
import type { Link, LinksResponse, User, CreateLinkRequest, UpdateLinkRequest } from '@/types/api';

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

  // 表单弹窗状态
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({ url: '', shortCode: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // 表单字段配置
  const linkFormFields: FormField[] = [
    {
      name: 'url',
      label: '原始链接',
      type: 'url',
      placeholder: 'https://example.com',
      required: true
    },
    {
      name: 'shortCode',
      label: '自定义短码',
      type: 'text',
      placeholder: '留空则自动生成',
      required: false,
      hint: '3-7个字符，仅支持字母、数字、连字符和下划线'
    }
  ];

  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const isAdmin = (session?.user as User)?.role === 'admin';

  useEffect(() => {
    loadLinks();
  }, [pagination.page, pagination.pageSize, search]);

  // 表单数据初始化
  useEffect(() => {
    if (isFormOpen) {
      if (editingLink) {
        setFormData({
          url: editingLink.originalUrl,
          shortCode: editingLink.shortCode
        });
      } else {
        setFormData({ url: '', shortCode: '' });
      }
      setFormError('');
    }
  }, [isFormOpen, editingLink]);

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

  const handleCreate = () => {
    setEditingLink(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    // 延迟清空 editingLink，等 Dialog 关闭动画完成（300ms）
    setTimeout(() => {
      setEditingLink(null);
    }, 300);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (editingLink) {
        const updateData: UpdateLinkRequest = {};
        if (formData.url !== editingLink.originalUrl) {
          updateData.url = formData.url;
        }
        if (formData.shortCode !== editingLink.shortCode) {
          updateData.shortCode = formData.shortCode;
        }

        if (Object.keys(updateData).length > 0) {
          await request<Link>(`/api/admin/links/${editingLink.id}`, {
            method: 'PUT',
            body: updateData
          });
        }
      } else {
        const createData: CreateLinkRequest = {
          url: formData.url,
          shortCode: formData.shortCode || undefined
        };
        await request<Link>('/api/admin/links', {
          method: 'POST',
          body: createData
        });
      }

      loadLinks();
      handleFormClose();
    } catch (error: any) {
      setFormError(error.message || '操作失败，请稍后重试');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (link: Link) => {
    setConfirmDialog({
      open: true,
      title: '确认删除',
      message: '确定要删除这个短链接吗？此操作无法撤销。',
      confirmText: '删除',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        setDeletingId(link.id);
        try {
          await request<{ message: string }>(`/api/admin/links/${link.id}`, {
            method: 'DELETE'
          });
          loadLinks();
          alert('删除成功');
        } catch (error) {
          alert('删除失败');
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const handleBatchDelete = async () => {
    if (selectedKeys.length === 0) {
      alert('请先选择要删除的项');
      return;
    }

    setConfirmDialog({
      open: true,
      title: '确认批量删除',
      message: `确定要删除选中的 ${selectedKeys.length} 个短链接吗？此操作无法撤销。`,
      confirmText: '删除',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
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
          alert('批量删除失败');
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('复制成功');
    } catch (error) {
      alert('复制失败');
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
      type: 'primary'
    });

    actions.push({
      label: '删除',
      onClick: handleDelete,
      type: 'danger',
      isLoading: (record) => deletingId === record.id,
      isDisabled: (record) => deletingId === record.id
    });
  }

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

          <SearchBar
            value={search}
            onChange={setSearch}
            onSubmit={handleSearch}
            placeholder="搜索链接或短码..."
          />

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

      {/* 表单弹窗 */}
      <Dialog
        open={isFormOpen}
        onClose={handleFormClose}
        title={editingLink ? '编辑短链接' : '创建短链接'}
        footer={
          <>
            <button
              type="button"
              onClick={handleFormClose}
              disabled={formLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              form="link-form"
              disabled={formLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
            >
              {formLoading ? '处理中...' : (editingLink ? '更新' : '创建')}
            </button>
          </>
        }
      >
        <Form
          formId="link-form"
          fields={linkFormFields}
          values={formData}
          onChange={setFormData}
          onSubmit={handleFormSubmit}
          error={formError}
          loading={formLoading}
        />
      </Dialog>

      {/* 确认对话框 */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        title={confirmDialog.title}
        size="sm"
        footer={
         (
            <>
              <button
                onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                取消
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 bg-black`}
              >
                {confirmDialog.confirmText || '确定'}
              </button>
            </>
          )
        }
      >
        <p className="text-sm text-gray-600">{confirmDialog.message}</p>
      </Dialog>
    </div>
  );
}
