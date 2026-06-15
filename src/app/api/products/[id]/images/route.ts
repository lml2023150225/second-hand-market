import { NextRequest, NextResponse } from 'next/server';
import { execute, insertOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll('images') as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ error: '请选择图片' }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
  await mkdir(uploadDir, { recursive: true });

  const imageIds: number[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const relativePath = `/uploads/products/${filename}`;
    const fullPath = path.join(uploadDir, filename);

    await writeFile(fullPath, buffer);

    const imageId = await insertOne(
      'INSERT INTO product_images (product_id, image_path, sort_order) VALUES (?, ?, ?)',
      params.id, relativePath, i
    );
    imageIds.push(imageId);
  }

  return NextResponse.json({ success: true, imageIds });
}
