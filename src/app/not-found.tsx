import Link from 'next/link';

/**
 * 404 页面组件
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center px-6 py-12">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-indigo-600 mb-4">404</h1>
          <div className="w-24 h-1 bg-indigo-600 mx-auto mb-8"></div>
        </div>

        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          链接不存在或已失效
        </h2>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          抱歉，您访问的短链接不存在或已被删除。
          请检查链接是否正确，或返回首页创建新的短链接。
        </p>

        <Link
          href="/"
          className="inline-block px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}

