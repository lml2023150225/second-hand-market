'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { CATEGORIES, CONDITIONS } from '@/lib/utils';

export default function ProductList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const condition = searchParams.get('condition') || '';
  const sort = searchParams.get('sort') || 'latest';
  const page = parseInt(searchParams.get('page') || '1');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (condition) params.set('condition', condition);
    params.set('sort', sort);
    params.set('page', String(page));

    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products || []);
    setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    setLoading(false);
  }, [search, category, condition, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== 'page') params.delete('page');
    router.push(`/?${params.toString()}`);
  }

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <input
            type="text"
            defaultValue={search}
            placeholder="搜索商品..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateParams('search', (e.target as HTMLInputElement).value);
            }}
            className="px-4 py-2 border border-gray-200 rounded-full text-sm w-48 focus:outline-none focus:border-emerald-400"
          />

          {/* Category filter */}
          <select
            value={category}
            onChange={(e) => updateParams('category', e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
          >
            <option value="">全部分类</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          {/* Condition filter */}
          <select
            value={condition}
            onChange={(e) => updateParams('condition', e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
          >
            <option value="">全部成色</option>
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => updateParams('sort', e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
          >
            <option value="latest">最新发布</option>
            <option value="price_asc">价格从低到高</option>
            <option value="price_desc">价格从高到低</option>
            <option value="popular">最多浏览</option>
          </select>

          {/* Clear filters */}
          {(search || category || condition) && (
            <button
              onClick={() => router.push('/')}
              className="text-sm text-emerald-600 hover:underline"
            >
              清除筛选
            </button>
          )}

          <span className="text-sm text-gray-400 ml-auto">
            共 {pagination.total} 件商品
          </span>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-100" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-100 rounded" />
                <div className="h-5 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🔍</div>
          <p>暂无商品，快去发布第一个吧！</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => updateParams('page', String(page - 1))}
                disabled={page <= 1}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-30 hover:bg-gray-50"
              >
                上一页
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => updateParams('page', String(i + 1))}
                  className={`w-9 h-9 rounded-lg text-sm ${
                    page === i + 1
                      ? 'bg-emerald-500 text-white'
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => updateParams('page', String(page + 1))}
                disabled={page >= pagination.totalPages}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-30 hover:bg-gray-50"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
