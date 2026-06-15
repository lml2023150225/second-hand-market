import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const order = await queryOne(
    `SELECT o.*, p.title as product_title, p.description as product_description,
     su.username as seller_name, bu.username as buyer_name
     FROM orders o
     JOIN products p ON o.product_id = p.id
     JOIN users su ON o.seller_id = su.id
     JOIN users bu ON o.buyer_id = bu.id
     WHERE o.id = ?`,
    params.id
  );

  if (!order || (order.buyer_id !== user.id && order.seller_id !== user.id)) {
    return NextResponse.json({ error: '订单不存在' }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const order = await queryOne<any>(
    'SELECT * FROM orders WHERE id = ?',
    params.id
  );

  if (!order) {
    return NextResponse.json({ error: '订单不存在' }, { status: 404 });
  }

  try {
    const { action } = await request.json();

    switch (action) {
      case 'cancel': {
        if (order.buyer_id !== user.id && order.seller_id !== user.id) {
          return NextResponse.json({ error: '无权操作' }, { status: 403 });
        }
        if (order.status !== 'pending') {
          return NextResponse.json({ error: '当前状态不可取消' }, { status: 400 });
        }
        await execute("UPDATE orders SET status = 'cancelled' WHERE id = ?", params.id);
        await execute("UPDATE products SET status = 'active' WHERE id = ?", order.product_id);
        break;
      }

      case 'ship': {
        if (order.seller_id !== user.id) {
          return NextResponse.json({ error: '只有卖家可以发货' }, { status: 403 });
        }
        if (order.status !== 'paid') {
          return NextResponse.json({ error: '当前状态不可发货' }, { status: 400 });
        }
        await execute("UPDATE orders SET status = 'shipped' WHERE id = ?", params.id);
        break;
      }

      case 'confirm': {
        if (order.buyer_id !== user.id) {
          return NextResponse.json({ error: '只有买家可以确认收货' }, { status: 403 });
        }
        if (order.status !== 'shipped') {
          return NextResponse.json({ error: '当前状态不可确认收货' }, { status: 400 });
        }
        await execute(
          "UPDATE orders SET status = 'completed', completed_at = NOW()::text WHERE id = ?",
          params.id
        );
        // Add money to seller's balance
        await execute('UPDATE users SET balance = balance + ? WHERE id = ?', order.amount, order.seller_id);
        break;
      }

      default:
        return NextResponse.json({ error: '无效操作' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
