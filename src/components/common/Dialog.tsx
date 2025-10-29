'use client';

import { useEffect, useState, ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Dialog({ 
  open, 
  onClose, 
  children, 
  title,
  footer,
  size = 'md' 
}: DialogProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // 处理弹窗开关动画
  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else if (shouldRender) {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, shouldRender]);

  // 处理滚动条（在组件渲染/卸载时执行）
  useEffect(() => {
    if (shouldRender) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [shouldRender]);

  if (!shouldRender) return null;

  const sizeClasses = {
    sm: 'w-80',
    md: 'w-96',
    lg: 'w-[600px]'
  };

  return (
    <div
      className={`fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className={`${sizeClasses[size]} shadow-lg rounded-md bg-white transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-50 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        {title && (
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          </div>
        )}

        {/* 内容 */}
        <div className="px-5 py-3">
          {children}
        </div>

        {/* 底部按钮 */}
        {footer && (
          <div className="px-5 pb-5 pt-3 flex justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

