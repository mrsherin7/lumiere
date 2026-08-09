import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Install clsx + tailwind-merge if not present: npm install clsx tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, symbol = '₹'): string {
  return `${symbol}${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateSKU(prefix = 'LUM'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }
): string {
  return new Date(dateString).toLocaleDateString('en-IN', options);
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function getEffectivePrice(
  price: number,
  salePrice: number | null | undefined,
  saleStart?: string | null,
  saleEnd?: string | null
): number {
  if (!salePrice) return price;
  const now = new Date();
  const start = saleStart ? new Date(saleStart) : null;
  const end = saleEnd ? new Date(saleEnd) : null;
  if (start && now < start) return price;
  if (end && now > end) return price;
  return salePrice;
}

export function isOnSale(
  salePrice: number | null | undefined,
  saleStart?: string | null,
  saleEnd?: string | null
): boolean {
  if (!salePrice) return false;
  const now = new Date();
  if (saleStart && now < new Date(saleStart)) return false;
  if (saleEnd && now > new Date(saleEnd)) return false;
  return true;
}

export function calculateDiscount(price: number, salePrice: number): number {
  return Math.round(((price - salePrice) / price) * 100);
}

export function calculateTax(amount: number, rate = 0.18): number {
  return Math.round(amount * rate * 100) / 100;
}

export function calculateShipping(subtotal: number): number {
  if (subtotal >= 999) return 0;
  return 99;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    processing: 'text-blue-600 bg-blue-50 border-blue-200',
    shipped: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    delivered: 'text-green-600 bg-green-50 border-green-200',
    cancelled: 'text-red-600 bg-red-50 border-red-200',
    paid: 'text-green-600 bg-green-50 border-green-200',
    failed: 'text-red-600 bg-red-50 border-red-200',
    refunded: 'text-purple-600 bg-purple-50 border-purple-200',
    draft: 'text-gray-600 bg-gray-50 border-gray-200',
    active: 'text-green-600 bg-green-50 border-green-200',
  };
  return colors[status] ?? 'text-gray-600 bg-gray-50 border-gray-200';
}

export function generateOrderNumber(): string {
  return `ORD-${(10000 + Math.floor(Math.random() * 90000)).toString()}`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const groupKey = String(item[key]);
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}
