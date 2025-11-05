import type { Metadata } from "next";

// 后台页面的 title
export const metadata: Metadata = {
  title: "Minik短链接管理系统",
  description: "短链接管理系统",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}