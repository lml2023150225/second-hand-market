import { Suspense } from 'react';
import OrdersContent from './OrdersContent';

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-6">加载中...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
