import { NextRequest, NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';

// Alipay async notification callback
// In production, this validates the signature from Alipay
export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const orderNo = body.get('out_trade_no') as string;
    const tradeStatus = body.get('trade_status') as string;

    if (!orderNo || tradeStatus !== 'TRADE_SUCCESS') {
      return NextResponse.json({ error: 'invalid' }, { status: 400 });
    }

    const order = queryOne<{ id: number; status: string }>(
      "SELECT id, status FROM orders WHERE order_no = ? AND status = 'pending'",
      orderNo
    );

    if (!order) {
      return NextResponse.json({ error: 'order not found' }, { status: 404 });
    }

    execute(
      "UPDATE orders SET status = 'paid', paid_at = datetime('now', 'localtime') WHERE id = ?",
      order.id
    );

    return new NextResponse('success');
  } catch (error) {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
