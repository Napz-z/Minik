'use client';

import { ReactNode, useState } from 'react';

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
  isLoading?: (record: T) => boolean;
  isDisabled?: (record: T) => boolean;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  rowKey: keyof T | ((record: T) => string | number);
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (record: T) => void;
  selectable?: boolean;
  onSelectionChange?: (selectedKeys: (string | number)[]) => void;
}

export default function Table<T extends Record<string, any>>({
  data,
  columns,
  actions,
  rowKey,
  loading = false,
  emptyText = '暂无数据',
  onRowClick,
  selectable = false,
  onSelectionChange,
}: TableProps<T>) {
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([]);

  const getRowKey = (record: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey];
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelectedKeys = checked ? data.map((record, index) => getRowKey(record, index)) : [];
    setSelectedKeys(newSelectedKeys);
    onSelectionChange?.(newSelectedKeys);
  };

  const handleSelectRow = (key: string | number, checked: boolean) => {
    const newSelectedKeys = checked 
      ? [...selectedKeys, key]
      : selectedKeys.filter(k => k !== key);
    setSelectedKeys(newSelectedKeys);
    onSelectionChange?.(newSelectedKeys);
  };

  const isAllSelected = data.length > 0 && selectedKeys.length === data.length;
  const isIndeterminate = selectedKeys.length > 0 && selectedKeys.length < data.length;

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
                {selectable && (
                  <th className="px-6 py-3 text-left" style={{ width: '50px' }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = isIndeterminate;
                        }
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                    />
                  </th>
                )}
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
            <tbody className="bg-white divide-y divide-gray-200 ">
              {data.map((record, index) => {
                const key = getRowKey(record, index);
                const isSelected = selectedKeys.includes(key);
                
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(record)}
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                    className='hover:bg-gray-50'
                  >
                    {selectable && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectRow(key, e.target.checked);
                          }}
                          className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                        />
                      </td>
                    )}
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
              );
            })}
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
