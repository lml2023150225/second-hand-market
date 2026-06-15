import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  try {
    const { order_id } = await request.json();

    const order = await queryOne<any>(
      "SELECT * FROM orders WHERE id = ? AND buyer_id = ? AND status = 'pending'",
      order_id, user.id
    );

    if (!order) {
      return NextResponse.json({ error: '订单不存在或状态异常' }, { status: 400 });
    }

    // In production: call Alipay SDK to create a payment order
    // For now, we simulate the payment with a direct payment flow
    // The real Alipay integration would:
    // 1. Call alipay.trade.create or alipay.trade.page.pay
    // 2. Return the payment URL for redirect

    const paymentUrl = `/payment/${order.id}?amount=${order.total}&orderNo=${order.order_no}`;

    return NextResponse.json({
      success: true,
      paymentUrl,
      orderNo: order.order_no,
      amount: order.total,
    });
  } catch (error) {
    return NextResponse.json({ error: '创建支付失败' }, { status: 500 });
  }
}
