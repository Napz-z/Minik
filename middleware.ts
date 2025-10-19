import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './src/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 保护 /admin 路由（除了登录页面）
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
