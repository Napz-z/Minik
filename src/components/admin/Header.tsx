'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { User } from "@/types/api";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = () => {
    signOut({ redirect: false });
    router.push('/admin/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              短链接管理系统
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              欢迎，{(session?.user as User)?.username}
              <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                {(session?.user as User)?.role === 'admin' ? '管理员' : '访客'}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
