'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import { CATEGORIES, CONDITIONS } from '@/lib/utils';

export default function PublishPage() {
  const [user, setUser] = useState<any>(null);
  const [productId, setProductId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('book');
  const [condition, setCondition] = useState('good');
  const [campus, setCampus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) router.push('/auth/login');
        else setUser(data.user);
      });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!title || !price) {
      setError('标题和价格不能为空');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        price: parseFloat(price),
        original_price: originalPrice ? parseFloat(originalPrice) : 0,
        category,
        condition,
        campus,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setError(data.error);
    } else {
      setProductId(data.product.id);
      setMessage('商品发布成功！请上传商品图片');
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">发布商品</h1>

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        {error && (
          <div className="bg-red-50 text-red-500 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>
        )}
        {message && (
          <div className="bg-emerald-50 text-emerald-600 text-sm px-4 py-2 rounded-lg mb-4">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">商品标题 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400"
              placeholder="例如：高等数学第七版 9成新"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">售价 (元) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
              <p className="text-xs text-gray-400 mt-1">买家实际支付: {price ? (parseFloat(price) * 1.05).toFixed(2) : '0.00'} (含5%手续费)</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">原价 (元)</label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400 bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">成色</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400 bg-white"
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">所在校区</label>
            <input
              type="text"
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400"
              placeholder="例如：仙林校区"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">商品描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400 min-h-[120px]"
              placeholder="描述商品的使用情况、购买时间、有无瑕疵等..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition disabled:opacity-50"
          >
            {loading ? '发布中...' : '发布商品'}
          </button>
        </form>

        {/* Image upload - shown after product is created */}
        {productId && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium mb-3">上传商品图片</h3>
            <ImageUpload
              productId={productId}
              onUploaded={(paths) => {
                setMessage('图片上传成功！');
                setTimeout(() => router.push(`/products/${productId}`), 1000);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
