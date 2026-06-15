'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const [userRes, cartRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/cart'),
      ]);
      const userData = await userRes.json();
      const cartData = await cartRes.json();

      if (!userData.user) {
        router.push('/auth/login');
        return;
      }

      setUser(userData.user);
      setItems(cartData.items || []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function removeItem(cartId: number) {
    await fetch(`/api/cart/${cartId}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((item) => item.cart_id !== cartId));
  }

  async function buyNow(productId: number) {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
    } else {
      router.push(`/payment/${data.order.id}`);
    }
  }

  if (loading) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">购物车</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🛒</div>
          <p>购物车是空的</p>
          <Link href="/" className="text-emerald-600 hover:underline mt-2 inline-block">去逛逛</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.cart_id} className="bg-white rounded-xl border p-4 flex gap-4">
              <Link href={`/products/${item.id}`} className="shrink-0">
                <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden">
                  {item.cover_image ? (
                    <img src={item.cover_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">📦</div>
                  )}
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.id}`} className="font-medium text-sm line-clamp-2 hover:text-emerald-600">
                  {item.title}
                </Link>
                <p className="text-xs text-gray-400 mt-1">卖家: {item.seller_name}</p>
                <div className="flex items-end justify-between mt-3">
                  <span className="text-lg font-bold text-red-500">¥{formatPrice(item.price)}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => removeItem(item.cart_id)}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      删除
                    </button>
                    <button
                      onClick={() => buyNow(item.id)}
                      className="px-4 py-1.5 bg-emerald-500 text-white text-xs rounded-full hover:bg-emerald-600"
                    >
                      立即购买
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="text-sm text-gray-400 text-center pt-4">
            提示：购买时需额外支付 5% 平台手续费
          </div>
        </div>
      )}
    </div>
  );
}
