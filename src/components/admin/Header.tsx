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
        <div className="flex justify-between items-center h-16 space-x-7 ">
          <div className="flex items-center">
            <h1 className="text-xl whitespace-nowrap font-semibold text-gray-900">
              短链接管理系统
            </h1>
          </div>

          <div className="flex items-center ">
            <div className="text-sm text-gray-700 ">
              欢迎，{(session?.user as User)?.username}
              <span className="ml-2 whitespace-nowrap px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                {(session?.user as User)?.role === 'admin' ? '管理员' : '访客'}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="text-sm text-white bg-black hover:text-white hover:bg-gray-900 px-3 py-2 whitespace-nowrap rounded-md  transition-all cursor-pointer"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
