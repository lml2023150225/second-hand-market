import { v4 as uuidv4 } from 'uuid';

export function generateOrderNo(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const time = now.toTimeString().slice(0, 8).replace(/:/g, '');
  const rand = uuidv4().slice(0, 8).toUpperCase();
  return `SH${date}${time}${rand}`;
}

export function formatPrice(price: number): string {
  return price.toFixed(2);
}

export function calcFee(amount: number, rate: number = 0.05): number {
  return Math.round(amount * rate * 100) / 100;
}

export const CATEGORIES = [
  { value: 'book', label: '教材/书籍' },
  { value: 'electronics', label: '电子产品' },
  { value: 'clothing', label: '衣物鞋包' },
  { value: 'sports', label: '运动器材' },
  { value: 'daily', label: '生活用品' },
  { value: 'other', label: '其他' },
];

export const CONDITIONS = [
  { value: 'new', label: '全新' },
  { value: 'like_new', label: '几乎全新' },
  { value: 'good', label: '良好' },
  { value: 'fair', label: '一般' },
  { value: 'poor', label: '较旧' },
];

export const ORDER_STATUS_MAP: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  shipped: '已发货',
  received: '已收货',
  completed: '已完成',
  cancelled: '已取消',
};
