interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;  // 是否显示信息文字
}

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  total,
  onPageChange,
  showInfo = true
}: PaginationProps) {
  // 计算显示的范围
  const startIndex = ((currentPage - 1) * pageSize) + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  // 如果只有一页，不显示分页
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-6 flex items-center justify-between">
      {/* 左侧：信息文字 */}
      {showInfo && (
        <div className="text-sm text-gray-700">
          显示第 <span className="font-medium">{startIndex}</span> 到{' '}
          <span className="font-medium">{endIndex}</span> 条，
          共 <span className="font-medium">{total}</span> 条记录
        </div>
      )}

      {/* 右侧：分页按钮 */}
      <div className="flex space-x-2 ml-auto">
        {/* 上一页 */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-2 md:text-sm whitespace-nowrap font-medium text-gray-500 bg-white border border-gray-300 rounded-md enabled:hover:bg-black enabled:hover:text-white enabled:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          上一页
        </button>

        {/* 页码指示 */}
        <div className="flex items-center px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-md">
          <span className="font-medium">{currentPage}</span>
          <span className="mx-1">/</span>
          <span>{totalPages}</span>
        </div>

        {/* 下一页 */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-2 text-sm whitespace-nowrap font-medium text-gray-500 bg-white border border-gray-300 rounded-md enabled:hover:bg-black enabled:hover:text-white enabled:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          下一页
        </button>
      </div>
    </div>
  );
}
