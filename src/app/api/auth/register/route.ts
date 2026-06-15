import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { execute, queryOne, insertOne } from '@/lib/db';
import { signToken, setTokenCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: '请填写所有字段' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少6位' }, { status: 400 });
    }

    const existing = await queryOne('SELECT id FROM users WHERE email = ? OR username = ?', email, username);
    if (existing) {
      return NextResponse.json({ error: '用户名或邮箱已被注册' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await insertOne(
      'INSERT INTO users (username, email, password_hash, balance) VALUES (?, ?, ?, ?)',
      username, email, passwordHash, 0
    );

    const token = signToken({ userId, username });

    const response = NextResponse.json({ success: true, message: '注册成功' });
    response.cookies.set(setTokenCookie(token));
    return response;
  } catch (error) {
    return NextResponse.json({ error: '注册失败' }, { status: 500 });
  }
}
