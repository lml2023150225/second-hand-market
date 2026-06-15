import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = queryOne<any>(
    `SELECT p.*, u.username as seller_name, u.avatar as seller_avatar
     FROM products p
     JOIN users u ON p.seller_id = u.id
     WHERE p.id = ? AND p.status != 'removed'`,
    params.id
  );

  if (!product) {
    return NextResponse.json({ error: '商品不存在' }, { status: 404 });
  }

  // Increment view count
  execute('UPDATE products SET view_count = view_count + 1 WHERE id = ?', params.id);

  const images = queryOne<any[]>(
    'SELECT id, image_path FROM product_images WHERE product_id = ? ORDER BY sort_order',
    params.id
  );

  return NextResponse.json({ product: { ...product, images: images || [] } });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const product = queryOne<{ seller_id: number }>('SELECT seller_id FROM products WHERE id = ?', params.id);
  if (!product || product.seller_id !== user.id) {
    return NextResponse.json({ error: '无权操作' }, { status: 403 });
  }

  try {
    const { title, description, price, original_price, category, condition, campus, status } = await request.json();
    execute(
      `UPDATE products SET title=?, description=?, price=?, original_price=?, category=?, condition=?, campus=?, status=?
       WHERE id=?`,
      title, description, price, original_price, category, condition, campus, status || 'active', params.id
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const product = queryOne<{ seller_id: number }>('SELECT seller_id FROM products WHERE id = ?', params.id);
  if (!product || product.seller_id !== user.id) {
    return NextResponse.json({ error: '无权操作' }, { status: 403 });
  }

  // Delete images from disk
  const images = queryOne<any[]>('SELECT image_path FROM product_images WHERE product_id = ?', params.id);
  if (images) {
    for (const img of images) {
      const imgPath = path.join(process.cwd(), 'public', img.image_path);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }
  }

  execute('DELETE FROM products WHERE id = ?', params.id);
  return NextResponse.json({ success: true });
}
