'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatPrice, ORDER_STATUS_MAP } from '@/lib/utils';

export default function OrdersContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'buy';
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      if (!userData.user) {
        router.push('/auth/login');
        return;
      }
      setUser(userData.user);

      const res = await fetch(`/api/orders?type=${type}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setLoading(false);
    }
    load();
  }, [router, type]);

  async function handleAction(orderId: number, action: string) {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
    } else {
      const res2 = await fetch(`/api/orders?type=${type}`);
      const data2 = await res2.json();
      setOrders(data2.orders || []);
    }
  }

  if (loading) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">我的订单</h1>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => router.push('/dashboard/orders?type=buy')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            type === 'buy' ? 'bg-white shadow-sm' : 'text-gray-500'
          }`}
        >
          我买到的
        </button>
        <button
          onClick={() => router.push('/dashboard/orders?type=sell')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            type === 'sell' ? 'bg-white shadow-sm' : 'text-gray-500'
          }`}
        >
          我卖出的
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">📋</div>
          <p>暂无订单</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{order.order_no}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                  order.status === 'paid' ? 'bg-blue-100 text-blue-600' :
                  order.status === 'shipped' ? 'bg-purple-100 text-purple-600' :
                  order.status === 'completed' ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {ORDER_STATUS_MAP[order.status] || order.status}
                </span>
              </div>

              <div className="flex gap-3">
                <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                  {order.cover_image ? (
                    <img src={order.cover_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl text-gray-300">📦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{order.product_title}</p>
                  <p className="text-xs text-gray-400">
                    {type === 'buy' ? `卖家: ${order.seller_name}` : `买家: ${order.buyer_name}`}
                  </p>
                  <div className="flex items-end justify-between mt-1">
                    <div>
                      <span className="text-sm font-bold text-red-500">¥{formatPrice(order.total)}</span>
                      <span className="text-xs text-gray-400 ml-1">(含手续费 ¥{formatPrice(order.fee)})</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t">
                {order.status === 'pending' && order.buyer_id === user.id && (
                  <>
                    <Link
                      href={`/payment/${order.id}`}
                      className="px-4 py-1.5 bg-emerald-500 text-white text-xs rounded-full hover:bg-emerald-600"
                    >
                      去支付
                    </Link>
                    <button
                      onClick={() => handleAction(order.id, 'cancel')}
                      className="px-4 py-1.5 border text-xs rounded-full text-gray-500 hover:text-red-500"
                    >
                      取消订单
                    </button>
                  </>
                )}
                {order.status === 'paid' && order.seller_id === user.id && (
                  <button
                    onClick={() => handleAction(order.id, 'ship')}
                    className="px-4 py-1.5 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600"
                  >
                    确认发货
                  </button>
                )}
                {order.status === 'shipped' && order.buyer_id === user.id && (
                  <button
                    onClick={() => handleAction(order.id, 'confirm')}
                    className="px-4 py-1.5 bg-emerald-500 text-white text-xs rounded-full hover:bg-emerald-600"
                  >
                    确认收货
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
