import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const order = queryOne<{ id: number; status: string; order_no: string }>(
    'SELECT id, status, order_no FROM orders WHERE id = ?',
    params.orderId
  );

  if (!order) {
    return NextResponse.json({ error: '订单不存在' }, { status: 404 });
  }

  return NextResponse.json({ status: order.status, orderNo: order.order_no });
}
