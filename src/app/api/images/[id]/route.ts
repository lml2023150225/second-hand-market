import { NextRequest, NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const img = await queryOne<{ id: number; image_path: string; product_id: number }>(
    'SELECT pi.*, p.seller_id FROM product_images pi JOIN products p ON pi.product_id = p.id WHERE pi.id = ?',
    params.id
  );

  if (!img) {
    return NextResponse.json({ error: '图片不存在' }, { status: 404 });
  }

  if ((img as any).seller_id !== user.id) {
    return NextResponse.json({ error: '无权操作' }, { status: 403 });
  }

  const imgPath = path.join(process.cwd(), 'public', img.image_path);
  if (fs.existsSync(imgPath)) {
    fs.unlinkSync(imgPath);
  }

  await execute('DELETE FROM product_images WHERE id = ?', params.id);
  return NextResponse.json({ success: true });
}
