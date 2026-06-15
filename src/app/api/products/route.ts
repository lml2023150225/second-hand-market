import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute, getCount } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const condition = searchParams.get('condition') || '';
  const campus = searchParams.get('campus') || '';
  const sort = searchParams.get('sort') || 'latest';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const pageSize = 12;
  const offset = (page - 1) * pageSize;

  let where = "WHERE p.status = 'active'";
  const params: any[] = [];

  if (search) {
    where += ' AND (p.title LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    where += ' AND p.category = ?';
    params.push(category);
  }
  if (condition) {
    where += ' AND p.condition = ?';
    params.push(condition);
  }
  if (campus) {
    where += ' AND p.campus = ?';
    params.push(campus);
  }

  let orderBy = 'ORDER BY p.created_at DESC';
  if (sort === 'price_asc') orderBy = 'ORDER BY p.price ASC';
  if (sort === 'price_desc') orderBy = 'ORDER BY p.price DESC';
  if (sort === 'popular') orderBy = 'ORDER BY p.view_count DESC';

  const total = getCount(`SELECT COUNT(*) as count FROM products p ${where}`, ...params);

  const products = query(
    `SELECT p.*, u.username as seller_name, u.avatar as seller_avatar,
     (SELECT image_path FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as cover_image
     FROM products p
     JOIN users u ON p.seller_id = u.id
     ${where} ${orderBy} LIMIT ? OFFSET ?`,
    ...params, pageSize, offset
  );

  return NextResponse.json({
    products,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  try {
    const { title, description, price, original_price, category, condition, campus } = await request.json();

    if (!title || !price) {
      return NextResponse.json({ error: '标题和价格不能为空' }, { status: 400 });
    }

    const result = execute(
      `INSERT INTO products (seller_id, title, description, price, original_price, category, condition, campus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      user.id, title, description || '', price, original_price || 0, category || 'other', condition || 'good', campus || ''
    );

    return NextResponse.json({
      success: true,
      product: { id: Number(result.lastInsertRowid), title, price },
    });
  } catch (error) {
    return NextResponse.json({ error: '发布失败' }, { status: 500 });
  }
}
