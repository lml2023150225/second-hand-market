'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export default function PaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [status, setStatus] = useState('pending');
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.error || !data.order) {
        router.push('/');
        return;
      }
      setOrder(data.order);
      setStatus(data.order.status);
      setLoading(false);
    }
    load();
  }, [orderId, router]);

  async function handlePay() {
    setPaying(true);
    const res = await fetch('/api/payment/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: parseInt(orderId) }),
    });
    const data = await res.json();

    if (data.error) {
      alert(data.error);
    } else {
      setStatus('paid');
    }
    setPaying(false);
  }

  // Poll for status changes
  useEffect(() => {
    if (status === 'pending') return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/payment/status/${orderId}`);
      const data = await res.json();
      if (data.status !== status) {
        setStatus(data.status);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [status, orderId]);

  if (loading) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border shadow-sm p-8 text-center">
        {status === 'pending' && (
          <>
            <div className="text-6xl mb-4">💳</div>
            <h1 className="text-xl font-bold mb-2">订单支付</h1>
            <p className="text-gray-500 text-sm mb-6">订单号: {order.order_no}</p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">商品: {order.product_title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">商品金额</span>
                <span>¥{formatPrice(order.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">平台手续费 (5%)</span>
                <span>¥{formatPrice(order.fee)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>应付总额</span>
                <span className="text-red-500">¥{formatPrice(order.total)}</span>
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition disabled:opacity-50"
            >
              {paying ? '处理中...' : '确认支付'}
            </button>

            <p className="text-xs text-gray-400 mt-4">
              当前为模拟支付环境，点击确认支付即完成付款
            </p>
          </>
        )}

        {status === 'paid' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-xl font-bold mb-2 text-emerald-600">支付成功!</h1>
            <p className="text-gray-500 text-sm mb-4">订单号: {order.order_no}</p>
            <p className="text-gray-500 text-sm mb-6">请等待卖家发货</p>
            <Link
              href="/dashboard/orders"
              className="inline-block px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition"
            >
              查看订单
            </Link>
          </>
        )}

        {status === 'shipped' && (
          <>
            <div className="text-6xl mb-4">📦</div>
            <h1 className="text-xl font-bold mb-2 text-blue-600">卖家已发货</h1>
            <p className="text-gray-500 text-sm mb-6">请注意查收，确认收到后请点击确认收货</p>
            <Link
              href="/dashboard/orders"
              className="inline-block px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition"
            >
              查看订单
            </Link>
          </>
        )}

        {status === 'completed' && (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-xl font-bold mb-2 text-emerald-600">交易完成</h1>
            <p className="text-gray-500 text-sm mb-6">感谢您的购买!</p>
            <Link
              href="/"
              className="inline-block px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition"
            >
              继续逛逛
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
