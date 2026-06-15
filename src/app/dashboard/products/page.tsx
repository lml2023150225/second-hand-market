'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice, CATEGORIES, CONDITIONS } from '@/lib/utils';

export default function MyProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
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

      // Fetch all products and filter by seller
      const res = await fetch('/api/products?pageSize=1000');
      const data = await res.json();
      setProducts((data.products || []).filter((p: any) => p.seller_name === userData.user.username));
      setLoading(false);
    }
    load();
  }, [router]);

  async function removeProduct(id: number) {
    if (!confirm('确定要下架该商品吗？')) return;
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: products.find((p) => p.id === id)?.title,
        description: products.find((p) => p.id === id)?.description,
        price: products.find((p) => p.id === id)?.price,
        original_price: products.find((p) => p.id === id)?.original_price,
        category: products.find((p) => p.id === id)?.category,
        condition: products.find((p) => p.id === id)?.condition,
        campus: products.find((p) => p.id === id)?.campus,
        status: 'removed',
      }),
    });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">我的商品</h1>
        <Link href="/publish" className="px-4 py-2 bg-emerald-500 text-white text-sm rounded-full hover:bg-emerald-600">
          发布新商品
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">📦</div>
          <p>还没有发布任何商品</p>
          <Link href="/publish" className="text-emerald-600 hover:underline mt-2 inline-block">去发布</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border p-4 flex gap-4">
              <Link href={`/products/${product.id}`} className="shrink-0">
                <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden">
                  {product.cover_image ? (
                    <img src={product.cover_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">📦</div>
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${product.id}`} className="font-medium text-sm line-clamp-2 hover:text-emerald-600">
                  {product.title}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    product.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {product.status === 'active' ? '在售' : product.status === 'sold' ? '已售' : '已下架'}
                  </span>
                  <span className="text-xs text-gray-400">{product.view_count} 浏览</span>
                </div>
                <div className="flex items-end justify-between mt-2">
                  <span className="text-lg font-bold text-red-500">¥{formatPrice(product.price)}</span>
                  <div className="flex gap-1">
                    <Link
                      href={`/publish?edit=${product.id}`}
                      className="px-3 py-1 text-xs border rounded-full text-gray-500 hover:text-emerald-600"
                    >
                      编辑
                    </Link>
                    {product.status === 'active' && (
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="px-3 py-1 text-xs border rounded-full text-gray-500 hover:text-red-500"
                      >
                        下架
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
