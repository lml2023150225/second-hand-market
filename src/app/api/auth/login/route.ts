import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { queryOne } from '@/lib/db';
import { signToken, setTokenCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: '请填写所有字段' }, { status: 400 });
    }

    const user = await queryOne<{ id: number; username: string; password_hash: string }>(
      'SELECT id, username, password_hash FROM users WHERE email = ? OR username = ?',
      email, email
    );

    if (!user) {
      return NextResponse.json({ error: '账号不存在' }, { status: 400 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: '密码错误' }, { status: 400 });
    }

    const token = signToken({ userId: user.id, username: user.username });

    const response = NextResponse.json({ success: true, message: '登录成功' });
    response.cookies.set(setTokenCookie(token));
    return response;
  } catch (error) {
    return NextResponse.json({ error: '登录失败' }, { status: 500 });
  }
}
