import Link from 'next/link';
import { formatPrice, CATEGORIES, CONDITIONS } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: number;
    title: string;
    price: number;
    original_price?: number;
    category: string;
    condition: string;
    campus: string;
    view_count: number;
    cover_image?: string;
    seller_name: string;
    created_at: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const categoryLabel = CATEGORIES.find((c) => c.value === product.category)?.label || product.category;
  const conditionLabel = CONDITIONS.find((c) => c.value === product.condition)?.label || product.condition;

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all duration-200">
        {/* Image */}
        <div className="aspect-square bg-gray-50 relative overflow-hidden">
          {product.cover_image ? (
            <img
              src={product.cover_image}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
              📦
            </div>
          )}
          {(product.original_price ?? 0) > 0 && (product.original_price ?? 0) > product.price && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {Math.round((1 - product.price / (product.original_price ?? product.price)) * 100)}% OFF
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug mb-2">
            {product.title}
          </h3>

          <div className="flex items-end gap-2 mb-2">
            <span className="text-lg font-bold text-red-500">¥{formatPrice(product.price)}</span>
            {(product.original_price ?? 0) > 0 && (
              <span className="text-xs text-gray-400 line-through">¥{formatPrice(product.original_price ?? 0)}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">{categoryLabel}</span>
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{conditionLabel}</span>
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
            <span>{product.seller_name}</span>
            <span>{product.campus}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
