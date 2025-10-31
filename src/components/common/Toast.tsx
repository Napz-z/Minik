'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';
type ToastPosition = 'center' | 'left' | 'right';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  position?: ToastPosition;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (
    message: string,
    type: ToastType,
    position?: ToastPosition,
    duration?: number
  ) => void;
  removeToast: (id: string) => void;
  success: (
    message: string,
    position?: ToastPosition,
    duration?: number
  ) => void;
  error: (
    message: string,
    position?: ToastPosition,
    duration?: number
  ) => void;
  info: (
    message: string,
    position?: ToastPosition,
    duration?: number
  ) => void;
  warning: (
    message: string,
    position?: ToastPosition,
    duration?: number
  ) => void;
}

// 全局 Toast 上下文
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// 使用 Toast 的 Hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast必须在ToastProvider使用');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);


  const showToast = useCallback(
    (
      message: string,
      type: ToastType,
      position: ToastPosition = 'center',
      duration = 3000
    ) => {
      const id = crypto.randomUUID();
      const newToast: Toast = { id, message, type, duration, position };
      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (
      message: string,
      position: ToastPosition = 'center',
      duration = 3000
    ) => {
      showToast(message, 'success', position, duration);
    },
    [showToast]
  );

  const error = useCallback(
    (
      message: string,
      position: ToastPosition = 'center',
      duration = 3000
    ) => {
      showToast(message, 'error', position, duration);
    },
    [showToast]
  );

  const info = useCallback(
    (
      message: string,
      position: ToastPosition = 'center',
      duration = 3000
    ) => {
      showToast(message, 'info', position, duration);
    },
    [showToast]
  );

  const warning = useCallback(
    (
      message: string,
      position: ToastPosition = 'center',
      duration = 3000
    ) => {
      showToast(message, 'warning', position, duration);
    },
    [showToast]
  );

  const value: ToastContextType = {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Toast 容器
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  const positions: ToastPosition[] = ['center', 'left', 'right'];

  return (
    <>
      {positions.map((pos) => (
        <div
          key={pos}
          className={`
            fixed top-4 inset-x-0 z-50 pointer-events-none flex flex-col
            ${pos === 'center' ? 'items-center' : ''}
            ${pos === 'left' ? 'items-start pl-4' : ''}
            ${pos === 'right' ? 'items-end pr-4' : ''}
          `}
        >
          {toasts.filter((t) => t.position === pos || (!t.position && pos === 'center'))
            .map((toast) => (
              <ToastItem
                key={toast.id}
                toast={toast}
                onClose={() => removeToast(toast.id)}
              />
            ))}
        </div>
      ))}
    </>
  );
};

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

// Toast 项
const ToastItem = ({ toast, onClose }: ToastItemProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const onCloseRef = React.useRef(onClose);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);

  const EXIT_MS = 300;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    let raf1: number;
    let raf2: number;
    let hideTimer: NodeJS.Timeout;
    let exitTimer: NodeJS.Timeout;

    // 进场：只做 translateY/opacity
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setIsVisible(true));
    });

    // 到时间后开始退场
    hideTimer = setTimeout(() => {
      setIsExiting(true);
      setIsVisible(false);

      const el = wrapRef.current;
      if (el) {
        // 只有下面还有兄弟节点时才做高度收缩带动补位
        const shouldCollapse = !!el.nextElementSibling;

        if (shouldCollapse) {
          el.style.maxHeight = el.scrollHeight + 'px';
          void el.offsetHeight; // 强制 reflow
          el.style.maxHeight = '0px'; // 收缩触发补位动画
        } else {
          // 最后一个：保持原 translateY+opacity 退场
          el.style.maxHeight = '';
        }
      }

      exitTimer = setTimeout(() => {
        onCloseRef.current();
        if (wrapRef.current) {
          wrapRef.current.style.maxHeight = '';
        }
      }, EXIT_MS);
    }, toast.duration);

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      clearTimeout(hideTimer);
      clearTimeout(exitTimer);
    };
  }, [toast.duration, toast.id]);

  const typeStyles =
  {
    success: { bg: 'bg-green-500/30', text: 'text-green-600', border: 'border-green-600' },
    error: { bg: 'bg-red-500/30', text: 'text-red-600', border: 'border-red-500' },
    info: { bg: 'bg-blue-500/30', text: 'text-blue-600', border: 'border-blue-500' },
    warning: { bg: 'bg-yellow-500/30', text: 'text-yellow-600', border: 'border-yellow-500' },
  };

  const typeIcons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };

  return (
    <div
      ref={wrapRef}
      className={`
        pointer-events-auto
        transform-gpu will-change-transform
        overflow-hidden
        transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-y-0 opacity-100 mb-3' : '-translate-y-3 opacity-0 mb-0'}
      `}
      role="status"
      aria-live="polite"
    >
      <div
        className={`
          ${typeStyles[toast.type].bg} ${typeStyles[toast.type].text} ${typeStyles[toast.type].border}
          border px-6 py-1 rounded-md shadow-lg
          flex justify-between items-center gap-2 min-w-[100px]
        `}
      >
        <span className="text-xl font-bold">{typeIcons[toast.type]}</span>
        <span>{toast.message}</span>
      </div>
    </div>
  );
};
