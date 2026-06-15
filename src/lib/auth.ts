import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { queryOne } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'second-hand-market-secret-key-2024';
const TOKEN_NAME = 'token';

export interface JwtPayload {
  userId: number;
  username: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await queryOne<{ id: number; username: string; email: string; avatar: string; balance: number; role: string }>(
    'SELECT id, username, email, avatar, balance, role FROM users WHERE id = ?',
    payload.userId
  );
  return user || null;
}

export function setTokenCookie(token: string) {
  return {
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    secure: false,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  };
}

export function clearTokenCookie() {
  return {
    name: TOKEN_NAME,
    value: '',
    httpOnly: true,
    secure: false,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };
}
