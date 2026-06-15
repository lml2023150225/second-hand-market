import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const items = await query(
    `SELECT c.id as cart_id, p.*, u.username as seller_name,
     (SELECT image_path FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as cover_image
     FROM cart_items c
     JOIN products p ON c.product_id = p.id
     JOIN users u ON p.seller_id = u.id
     WHERE c.user_id = ? AND p.status = 'active'
     ORDER BY c.created_at DESC`,
    user.id
  );

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  try {
    const { product_id } = await request.json();

    const product = await queryOne('SELECT id, status FROM products WHERE id = ?', product_id);
    if (!product || product.status !== 'active') {
      return NextResponse.json({ error: '商品已下架' }, { status: 400 });
    }

    await execute(
      'INSERT INTO cart_items (user_id, product_id) VALUES (?, ?) ON CONFLICT (user_id, product_id) DO NOTHING',
      user.id, product_id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '添加失败' }, { status: 500 });
  }
}
