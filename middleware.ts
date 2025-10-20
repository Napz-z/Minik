import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './src/lib/auth';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;
  const method = request.method.toUpperCase();

  const isAdminApi = pathname.startsWith('/api/admin');
  const isAdminPage = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';
  const isAdminPageProtected = isAdminPage && !isLoginPage;

  // 请求不是 Admin API，也不是需要保护的 Admin 页面，就直接放行
  if (!isAdminApi && !isAdminPageProtected) {
    return NextResponse.next();
  }

  // 需要鉴权的路径，获取会话
  const session = await auth();

  // 未登录：API 返回 401；页面重定向到登录，并带 callbackUrl
  if (!session?.user) {
    if (isAdminApi) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    const loginUrl = url.clone();
    loginUrl.pathname = '/admin/login';
    loginUrl.searchParams.set('callbackUrl', url.pathname + url.search);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminApi && !SAFE_METHODS.has(method)) {
    const role = (session.user as { role?: string })?.role; 
    //不是管理员权限无法访问
    if (role !== 'admin') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }
  }
  // 其他情况放行
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
