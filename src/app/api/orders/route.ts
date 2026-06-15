import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute, insertOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { generateOrderNo, calcFee } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'buy'; // buy | sell

  const whereField = type === 'sell' ? 'seller_id' : 'buyer_id';

  const orders = await query(
    `SELECT o.*, p.title as product_title,
     (SELECT image_path FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as cover_image,
     bu.username as buyer_name, su.username as seller_name
     FROM orders o
     JOIN products p ON o.product_id = p.id
     JOIN users bu ON o.buyer_id = bu.id
     JOIN users su ON o.seller_id = su.id
     WHERE o.${whereField} = ?
     ORDER BY o.created_at DESC`,
    user.id
  );

  return NextResponse.json({ orders });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  try {
    const { product_id } = await request.json();

    const product = await queryOne<{
      id: number; seller_id: number; title: string; price: number; status: string;
    }>('SELECT * FROM products WHERE id = ?', product_id);

    if (!product || product.status !== 'active') {
      return NextResponse.json({ error: '商品已下架' }, { status: 400 });
    }

    if (product.seller_id === user.id) {
      return NextResponse.json({ error: '不能购买自己的商品' }, { status: 400 });
    }

    // Check pending order
    const pending = await queryOne(
      "SELECT id FROM orders WHERE buyer_id = ? AND product_id = ? AND status = 'pending'",
      user.id, product_id
    );
    if (pending) {
      return NextResponse.json({ error: '已有待支付的订单' }, { status: 400 });
    }

    const orderNo = generateOrderNo();
    const fee = calcFee(product.price);
    const total = Math.round((product.price + fee) * 100) / 100;

    const orderId = await insertOne(
      `INSERT INTO orders (order_no, buyer_id, seller_id, product_id, amount, fee_rate, fee, total, status)
       VALUES (?, ?, ?, ?, ?, 0.05, ?, ?, 'pending')`,
      orderNo, user.id, product.seller_id, product.id, product.price, fee, total
    );

    // Update product status
    await execute("UPDATE products SET status = 'sold' WHERE id = ?", product.id);

    // Remove from cart
    await execute('DELETE FROM cart_items WHERE product_id = ? AND user_id = ?', product.id, user.id);

    const order = await queryOne('SELECT * FROM orders WHERE id = ?', orderId);

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ error: '下单失败' }, { status: 500 });
  }
}
