import { Suspense } from 'react';
import ProductList from './ProductList';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">校园二手交易平台</h1>
        <p className="text-emerald-50 text-lg">买卖二手书、电子产品、生活用品，让闲置物品找到新主人</p>
        <div className="flex gap-4 mt-4">
          <div className="bg-white/20 rounded-lg px-4 py-2 text-sm">
            <div className="font-bold text-xl">5%</div>
            <div className="text-emerald-100">平台手续费</div>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2 text-sm">
            <div className="font-bold text-xl">安全</div>
            <div className="text-emerald-100">交易有保障</div>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2 text-sm">
            <div className="font-bold text-xl">便捷</div>
            <div className="text-emerald-100">一站式交易</div>
          </div>
        </div>
      </div>

      <Suspense fallback={<div>加载中...</div>}>
        <ProductList />
      </Suspense>
    </div>
  );
}
