'use client';
import { useState, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import type { ShortenResponse } from '@/types/api';
import { createShortLink } from '@/services/shortlink';
/**
 * 短链接生成器组件
 */
export default function ShortLinkGenerator() {
  const [url, setUrl] = useState('');
  const [withQr, setWithQr] = useState(false);
  const [shortCode, setShortCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShortenResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  /**
   * 处理表单提交
   * @param e - 表单事件
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!url.trim()) {
      setResult({ error: '请输入有效的链接' });
      return;
    }

    setLoading(true);
    setResult(null);
    setCopied(false);

    try {
      const data = await createShortLink({
        url: url.trim(),
        withQr,
        shortCode: shortCode.trim() || undefined
      });
      setResult(data);
    } catch (error: unknown) {
      setResult({ error: (error as Error)?.message || '网络错误，请稍后重试' });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setCurrentUrl(window.location.origin);
    return () => {
      document.documentElement.style.overflowY = '';
    };
  }, []);
  /**
   * 复制短链接到剪贴板
   */
  const copyToClipboard = async () => {
    if (result?.shortUrl) {
      try {
        await navigator.clipboard.writeText(result.shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('复制失败:', error);
      }
    }
  };

  /**
   * 下载二维码图片
   */
  const downloadQrCode = () => {
    if (result?.qrCode) {
      const link = document.createElement('a');
      link.href = result.qrCode;
      link.download = 'qrcode.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* 输入表单卡片 */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL 输入框 */}
          <div>
            <label
              htmlFor="url-input"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              输入原始链接
            </label>
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/your/long/url"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-gray-900"
              disabled={loading}
            />
          </div>

          {/* 自定义短码输入框 */}
          <div className='text-sm font-medium text-gray-700'>
            <div className='flex gap-3 items-end'>
              <div className='flex-1'>
                <span>
                  网址
                </span>
                <input
                  id="shortcode-input"
                  type="text"
                  value={currentUrl ? `${currentUrl}` : ''}
                  className="w-full px-4 py-3 border bg-gray-50 border-gray-300 rounded-lg outline-none text-gray-900 cursor-not-allowed"
                  readOnly
                  disabled
                />
              </div>
              <div className='text-2xl flex items-center justify-center  h-12'>
                /
              </div>
              <div className='flex-1'>
                <span>
                  自定义短链接
                </span>
                <input
                  id="shortcode-input"
                  type="text"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value)}
                  placeholder="如：my-link（留空则自动生成）"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-gray-900"
                  disabled={loading}
                />
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-1">
              3-7个字符，仅支持字母、数字、连字符和下划线
            </p>
          </div>

          {/* 二维码开关 */}
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="qr-toggle"
                className="text-sm font-medium text-gray-700"
              >
                生成二维码
              </label>
              <p className="text-xs text-gray-500 mt-1">
                同时生成短链接的二维码图片
              </p>
            </div>
            <button
              type="button"
              id="qr-toggle"
              role="switch"
              aria-checked={withQr}
              onClick={() => setWithQr(!withQr)}
              className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${withQr ? 'bg-black' : 'bg-gray-300'
                }`}
              disabled={loading}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${withQr ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black cursor-pointer text-white py-3 px-6 rounded-lg font-medium 
            hover:bg-gray-950 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                生成中...
              </span>
            ) : (
              '生成短链接'
            )}
          </button>
        </form>
      </div>

      {/* 结果展示区域 */}
      {result && (
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
          {result.error ? (
            // 错误提示
            <div className="flex items-center space-x-3 text-red-600">
              <svg
                className="w-6 h-6 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">{result.error}</span>
            </div>
          ) : (
            // 成功结果
            <div className="space-y-6">
              {/* 短链接展示 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  短链接
                </label>
                <div className="flex items-center space-x-2">
                  <a
                    href={result.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-black font-medium hover:bg-gray-100 transition-colors cursor-pointer block"
                  >
                    {result.shortUrl}
                  </a>
                  <button
                    onClick={copyToClipboard}
                    className="px-6 py-3 cursor-pointer bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium whitespace-nowrap"
                  >
                    {copied ? '已复制 ✓' : '复制'}
                  </button>
                </div>
              </div>

              {/* 二维码展示 */}
              {result.qrCode && (
                <div className="text-center flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    二维码
                  </label>
                  <div className="inline-block bg-white p-4 rounded-xl border-2 border-gray-200">
                    <Image
                      src={result.qrCode}
                      alt="短链接二维码"
                      width={300}
                      height={300}
                      className="mx-auto"
                    />
                  </div>
                  <div className="text-center">
                    <button
                      onClick={downloadQrCode}
                      className="cursor-pointer mt-6 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
                    >
                      下载二维码
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

