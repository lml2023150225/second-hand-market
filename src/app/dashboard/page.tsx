'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ selling: 0, sold: 0, buying: 0 });
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!data.user) {
        router.push('/auth/login');
        return;
      }
      setUser(data.user);

      // Load stats
      const [sellingRes, soldRes, buyingRes] = await Promise.all([
        fetch('/api/orders?type=sell'),
        fetch('/api/orders?type=buy'),
        fetch('/api/products'),
      ]);
      const selling = await sellingRes.json();
      const sold = await soldRes.json();

      setStats({
        selling: selling.orders?.filter((o: any) => o.status === 'paid' || o.status === 'shipped').length || 0,
        sold: selling.orders?.filter((o: any) => o.status === 'completed').length || 0,
        buying: sold.orders?.length || 0,
      });
    }
    load();
  }, [router]);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">个人中心</h1>

      {/* User info card */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-600">
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold">{user.username}</h2>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-sm text-gray-400">账户余额</div>
            <div className="text-2xl font-bold text-emerald-600">¥{formatPrice(user.balance)}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Link href="/dashboard/products" className="bg-white rounded-xl border p-4 text-center hover:border-emerald-200 transition">
          <div className="text-2xl font-bold text-emerald-600">{stats.selling}</div>
          <div className="text-sm text-gray-500">在售商品</div>
        </Link>
        <Link href="/dashboard/orders?type=sell" className="bg-white rounded-xl border p-4 text-center hover:border-emerald-200 transition">
          <div className="text-2xl font-bold text-blue-600">{stats.sold}</div>
          <div className="text-sm text-gray-500">已售出</div>
        </Link>
        <Link href="/dashboard/orders?type=buy" className="bg-white rounded-xl border p-4 text-center hover:border-emerald-200 transition">
          <div className="text-2xl font-bold text-purple-600">{stats.buying}</div>
          <div className="text-sm text-gray-500">已购买</div>
        </Link>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/publish" className="bg-emerald-500 text-white rounded-xl p-4 text-center font-medium hover:bg-emerald-600 transition">
          ＋ 发布商品
        </Link>
        <Link href="/dashboard/orders" className="bg-white border rounded-xl p-4 text-center font-medium hover:border-emerald-200 transition">
          全部订单
        </Link>
        <Link href="/dashboard/products" className="bg-white border rounded-xl p-4 text-center font-medium hover:border-emerald-200 transition">
          我的商品
        </Link>
        <Link href="/cart" className="bg-white border rounded-xl p-4 text-center font-medium hover:border-emerald-200 transition">
          购物车
        </Link>
      </div>
    </div>
  );
}
