'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice, CATEGORIES, CONDITIONS } from '@/lib/utils';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [currentImage, setCurrentImage] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const [productRes, userRes] = await Promise.all([
        fetch(`/api/products/${id}`),
        fetch('/api/auth/me'),
      ]);
      const productData = await productRes.json();
      const userData = await userRes.json();
      setProduct(productData.product);
      setUser(userData.user);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleBuy() {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: product.id }),
    });

    const data = await res.json();
    if (data.error) {
      setMessage(data.error);
    } else {
      router.push(`/payment/${data.order.id}`);
    }
  }

  async function handleAddToCart() {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: product.id }),
    });

    const data = await res.json();
    if (data.error) {
      setMessage(data.error);
    } else {
      setMessage('已加入购物车');
      setTimeout(() => setMessage(''), 2000);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-gray-100 rounded-xl" />
          <div className="h-8 bg-gray-100 rounded w-2/3" />
          <div className="h-6 bg-gray-100 rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-6xl mb-4">😕</div>
        <p>商品不存在或已下架</p>
        <Link href="/" className="text-emerald-600 hover:underline mt-2 inline-block">返回首页</Link>
      </div>
    );
  }

  const categoryLabel = CATEGORIES.find((c) => c.value === product.category)?.label || product.category;
  const conditionLabel = CONDITIONS.find((c) => c.value === product.condition)?.label || product.condition;
  const isOwner = user?.id === product.seller_id;
  const fee = Math.round(product.price * 0.05 * 100) / 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {/* Images */}
        <div className="relative aspect-video bg-gray-50">
          {product.images?.length > 0 ? (
            <>
              <img
                src={product.images[currentImage]?.image_path}
                alt={product.title}
                className="w-full h-full object-contain"
              />
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {product.images.map((_: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`w-2.5 h-2.5 rounded-full transition ${
                        i === currentImage ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">
              📦
            </div>
          )}
        </div>

        {/* Thumbnail row */}
        {product.images?.length > 1 && (
          <div className="flex gap-2 p-4 border-b">
            {product.images.map((img: any, i: number) => (
              <button
                key={img.id}
                onClick={() => setCurrentImage(i)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                  i === currentImage ? 'border-emerald-500' : 'border-transparent'
                }`}
              >
                <img src={img.image_path} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Details */}
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">{product.title}</h1>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-red-500">¥{formatPrice(product.price)}</span>
            {product.original_price > 0 && (
              <span className="text-gray-400 line-through">¥{formatPrice(product.original_price)}</span>
            )}
            <span className="text-sm text-gray-400">
              手续费 ¥{formatPrice(fee)} (5%)
            </span>
          </div>

          <div className="flex gap-2 mb-6">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-sm rounded-full">{categoryLabel}</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded-full">{conditionLabel}</span>
            {product.campus && (
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">{product.campus}</span>
            )}
          </div>

          {product.description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">商品描述</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Seller info */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
              {product.seller_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-sm">{product.seller_name}</div>
              <div className="text-xs text-gray-400">{product.created_at} 发布</div>
            </div>
            <div className="ml-auto text-xs text-gray-400">
              {product.view_count} 次浏览
            </div>
          </div>

          {/* Action buttons */}
          {message && (
            <div className="bg-emerald-50 text-emerald-600 text-sm px-4 py-2 rounded-lg mb-4">{message}</div>
          )}

          {!isOwner && product.status === 'active' && (
            <div className="flex gap-3">
              <button
                onClick={handleBuy}
                className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition"
              >
                立即购买
              </button>
              <button
                onClick={handleAddToCart}
                className="px-6 py-3 border-2 border-emerald-200 text-emerald-600 rounded-xl font-medium hover:bg-emerald-50 transition"
              >
                加入购物车
              </button>
            </div>
          )}

          {isOwner && (
            <p className="text-center text-gray-400 text-sm">这是您发布的商品</p>
          )}

          {product.status === 'sold' && (
            <p className="text-center text-gray-400">该商品已售出</p>
          )}
        </div>
      </div>
    </div>
  );
}
