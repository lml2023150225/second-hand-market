import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        avatar TEXT DEFAULT '',
        balance DOUBLE PRECISION DEFAULT 0,
        role TEXT DEFAULT 'user',
        created_at TEXT DEFAULT NOW()::text
      )
    `);

    await sql.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        seller_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        price DOUBLE PRECISION NOT NULL,
        original_price DOUBLE PRECISION DEFAULT 0,
        category TEXT DEFAULT 'other',
        condition TEXT DEFAULT 'good',
        campus TEXT DEFAULT '',
        status TEXT DEFAULT 'active',
        view_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT NOW()::text
      )
    `);

    await sql.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        image_path TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
      )
    `);

    await sql.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        product_id INTEGER NOT NULL REFERENCES products(id),
        created_at TEXT DEFAULT NOW()::text,
        UNIQUE(user_id, product_id)
      )
    `);

    await sql.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_no TEXT UNIQUE NOT NULL,
        buyer_id INTEGER NOT NULL REFERENCES users(id),
        seller_id INTEGER NOT NULL REFERENCES users(id),
        product_id INTEGER NOT NULL REFERENCES products(id),
        amount DOUBLE PRECISION NOT NULL,
        fee_rate DOUBLE PRECISION DEFAULT 0.05,
        fee DOUBLE PRECISION NOT NULL,
        total DOUBLE PRECISION NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT NOW()::text,
        paid_at TEXT,
        completed_at TEXT
      )
    `);

    return NextResponse.json({ success: true, message: '数据库初始化完成' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
