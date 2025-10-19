'use client';

import { useState, useEffect } from 'react';
import type { Link, CreateLinkRequest, UpdateLinkRequest } from '@/types/api';
import { createLink, updateLink } from '@/services/admin';

interface LinkFormProps {
  link?: Link | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LinkForm({ link, isOpen, onClose, onSuccess }: LinkFormProps) {
  const [formData, setFormData] = useState({
    url: '',
    shortCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!link;

  useEffect(() => {
    if (link) {
      setFormData({
        url: link.originalUrl,
        shortCode: link.shortCode
      });
    } else {
      setFormData({
        url: '',
        shortCode: ''
      });
    }
    setError('');
    if (isOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
    // 页面卸载时还原
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [link, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        const updateData: UpdateLinkRequest = {};
        if (formData.url !== link.originalUrl) {
          updateData.url = formData.url;
        }
        if (formData.shortCode !== link.shortCode) {
          updateData.shortCode = formData.shortCode;
        }

        if (Object.keys(updateData).length > 0) {
          await updateLink(link.id, updateData);
        }
      } else {
        const createData: CreateLinkRequest = {
          url: formData.url,
          shortCode: formData.shortCode || undefined
        };
        await createLink(createData);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      setError(error.message || '操作失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50 ">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {isEdit ? '编辑短链接' : '创建短链接'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                原始链接
              </label>
              <input
                type="url"
                id="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="https://example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="shortCode" className="block text-sm font-medium text-gray-700">
                自定义短码（可选）
              </label>
              <input
                type="text"
                id="shortCode"
                value={formData.shortCode}
                onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="留空则自动生成"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                3-7个字符，仅支持字母、数字、连字符和下划线
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm cursor-pointer font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm cursor-pointer font-medium text-white bg-black border border-transparent rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
              >
                {loading ? '处理中...' : (isEdit ? '更新' : '创建')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
