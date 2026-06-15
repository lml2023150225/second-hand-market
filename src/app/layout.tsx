import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: '校园二手 - 大学生二手交易平台',
  description: '为大学生提供二手书籍和物品交易服务',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
