import { sql } from '@vercel/postgres';

function convertPlaceholders(sqlStr: string, params: any[]): { text: string; values: any[] } {
  let index = 0;
  const text = sqlStr.replace(/\?/g, () => {
    index++;
    return `$${index}`;
  });
  return { text, values: params };
}

export async function query<T = any>(sqlStr: string, ...params: any[]): Promise<T[]> {
  const { text, values } = convertPlaceholders(sqlStr, params);
  const result = await sql.query(text, values);
  return result.rows as T[];
}

export async function queryOne<T = any>(sqlStr: string, ...params: any[]): Promise<T | undefined> {
  const rows = await query<T>(sqlStr, ...params);
  return rows[0];
}

export async function execute(sqlStr: string, ...params: any[]): Promise<{ changes: number }> {
  const { text, values } = convertPlaceholders(sqlStr, params);
  const result = await sql.query(text, values);
  return { changes: result.rowCount ?? 0 };
}

export async function insertOne(sqlStr: string, ...params: any[]): Promise<number> {
  const insertSql = sqlStr.trim();
  const hasReturning = /RETURNING\s+/i.test(insertSql);
  const finalSql = hasReturning ? insertSql : `${insertSql} RETURNING id`;
  const rows = await query<{ id: number }>(finalSql, ...params);
  return rows[0]?.id ?? 0;
}

export async function getCount(sqlStr: string, ...params: any[]): Promise<number> {
  const row = await queryOne<{ count: number }>(sqlStr, ...params);
  return row?.count ?? 0;
}
