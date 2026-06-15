import { getDb } from '../../database/init';

export function query<T = any>(sql: string, ...params: any[]): T[] {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.all(...params) as T[];
}

export function queryOne<T = any>(sql: string, ...params: any[]): T | undefined {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.get(...params) as T | undefined;
}

export function execute(sql: string, ...params: any[]): { changes: number; lastInsertRowid: number | bigint } {
  const db = getDb();
  const stmt = db.prepare(sql);
  const result = stmt.run(...params);
  return { changes: result.changes, lastInsertRowid: result.lastInsertRowid };
}

export function getCount(sql: string, ...params: any[]): number {
  const row = queryOne<{ count: number }>(sql, ...params);
  return row?.count ?? 0;
}
