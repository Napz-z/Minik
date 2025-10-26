'use client';

import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  title: string;
  render?: (value: any, record: T, index: number) => ReactNode;
  width?: string;
  className?: string;
}

export interface Action<T> {
  label: string;
  onClick: (record: T) => void;
  className?: string;
  type?: 'primary' | 'danger' | 'default';  // 预设样式类型
  isLoading?: (record: T) => boolean;  // 简化：只判断是否加载中
  isDisabled?: (record: T) => boolean;  // 简化：只判断是否禁用
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  rowKey: keyof T | ((record: T) => string | number);
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (record: T) => void;
  rowClassName?: string | ((record: T, index: number) => string);
}

export default function Table<T extends Record<string, any>>({
  data,
  columns,
  actions,
  rowKey,
  loading = false,
  emptyText = '暂无数据',
  onRowClick,
  rowClassName = 'hover:bg-gray-50'
}: TableProps<T>) {
  const getRowKey = (record: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey];
  };

  const getRowClassName = (record: T, index: number): string => {
    if (typeof rowClassName === 'function') {
      return rowClassName(record, index);
    }
    return rowClassName;
  };

  const renderCell = (column: Column<T>, record: T, index: number) => {
    if (column.render) {
      return column.render(record[column.key], record, index);
    }
    return record[column.key];
  };

  // 获取按钮样式
  const getActionClassName = (action: Action<T>) => {
    if (action.className) {
      return action.className;
    }
    
    // 预设样式
    const baseClass = 'cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
    switch (action.type) {
      case 'primary':
        return `text-black hover:text-indigo-900 ${baseClass}`;
      case 'danger':
        return `text-red-600 hover:text-red-500 ${baseClass}`;
      default:
        return `text-gray-600 hover:text-gray-900 ${baseClass}`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {column.title}
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((record, index) => (
                <tr
                  key={getRowKey(record, index)}
                  className={getRowClassName(record, index)}
                  onClick={() => onRowClick?.(record)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}
                    >
                      {renderCell(column, record, index)}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {actions.map((action, actionIndex) => {
                          const isLoading = action.isLoading?.(record) || false;
                          const isDisabled = action.isDisabled?.(record) || false;

                          return (
                            <button
                              key={actionIndex}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(record);
                              }}
                              disabled={isDisabled || isLoading}
                              className={getActionClassName(action)}
                            >
                              {isLoading ? '处理中...' : action.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {emptyText}
          </div>
        )}
      </div>
    </div>
  );
}
