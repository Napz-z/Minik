'use client';

import { useState, useEffect } from 'react';
import type { Link, CreateLinkRequest, UpdateLinkRequest } from '@/types/api';
import { createLink, updateLink } from '@/services/admin';

interface LinkFormProps {
  link?: Link | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  submitText?: string;
}

export default function LinkForm({
  link,
  isOpen,
  onClose,
  onSuccess,
  title,
  submitText
}: LinkFormProps) {
  const [formData, setFormData] = useState({
    url: '',
    shortCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  // 保存当前的标题和按钮文字
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentSubmitText, setCurrentSubmitText] = useState('');
  
  //处理弹窗开关动画
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
      setCurrentTitle(title || '弹窗');
      setCurrentSubmitText(submitText || '提交');
    } else if (shouldRender) {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, title, submitText]);

  // 处理滚动条（在组件渲染/卸载时执行）
  useEffect(() => {
    if (shouldRender) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [shouldRender]);

  // 处理表单数据
  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen, link]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (link) {
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

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      onClick={onClose}
    >
      <div
        className={`p-5 w-96 shadow-lg rounded-md bg-white transition-all duration-300 ${isAnimating ? 'scale-100 opacity-100' : 'scale-50 opacity-100'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {currentTitle}
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
                {loading ? '处理中...' : (currentSubmitText)}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
