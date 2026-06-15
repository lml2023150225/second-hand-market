import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// Simulate payment - in production this would be the Alipay callback
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  try {
    const { order_id } = await request.json();

    const order = queryOne<any>(
      "SELECT * FROM orders WHERE id = ? AND buyer_id = ? AND status = 'pending'",
      order_id, user.id
    );

    if (!order) {
      return NextResponse.json({ error: '订单不存在或已支付' }, { status: 400 });
    }

    // Simulate successful payment
    execute(
      "UPDATE orders SET status = 'paid', paid_at = datetime('now', 'localtime') WHERE id = ?",
      order_id
    );

    return NextResponse.json({ success: true, message: '支付成功' });
  } catch (error) {
    return NextResponse.json({ error: '支付失败' }, { status: 500 });
  }
}
