import ShortLinkGenerator from '@/components/ShortLinkGenerator';

/**
 * 首页组件
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 头部标题 */}
      <header className="pt-10 pb-8 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          ⚡ 短链接生成器
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto px-4">
          将长链接转换为简短易分享的短链接，支持二维码生成
        </p>
      </header>

      {/* 主要内容区域 */}
      <main className="container mx-auto px-4 pb-16">
        <ShortLinkGenerator />
      </main>

     
    </div>
  );
}
