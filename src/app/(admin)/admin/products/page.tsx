'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/Modal';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/Skeleton';
import type { Product } from '@/types';
import { MOCK_PRODUCTS } from '@/lib/mockData';

const PAGE_SIZE = 20;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'created_at', dir: 'desc' });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success } = useToast();
  const supabase = createClient();

  const fetchProducts = async () => {
    setIsLoading(true);

    let allProducts: Product[] = [];
    try {
      const customSaved = localStorage.getItem('lumiere_custom_products');
      const custom: Product[] = customSaved ? JSON.parse(customSaved) : [];
      const deletedSaved = localStorage.getItem('lumiere_deleted_product_ids');
      const deletedIds: string[] = deletedSaved ? JSON.parse(deletedSaved) : [];

      const baseMocks = MOCK_PRODUCTS.filter((p) => !deletedIds.includes(p.id));
      allProducts = [...custom, ...baseMocks];
    } catch {
      allProducts = [...MOCK_PRODUCTS];
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, images:product_images(image_url, sort_order), category:categories(name)', { count: 'exact' });

      if (!error && data && data.length > 0) {
        allProducts = data as unknown as Product[];
      }
    } catch { /* use local fallback */ }

    let filtered = [...allProducts];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) => p.title.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => {
      let aVal: unknown = a[sortBy.col as keyof Product];
      let bVal: unknown = b[sortBy.col as keyof Product];
      if (sortBy.col === 'price') {
        aVal = Number(aVal || 0);
        bVal = Number(bVal || 0);
      }
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      if (aVal < bVal) return sortBy.dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortBy.dir === 'asc' ? 1 : -1;
      return 0;
    });

    const start = (page - 1) * PAGE_SIZE;
    const paginated = filtered.slice(start, start + PAGE_SIZE);

    setProducts(paginated);
    setTotal(filtered.length);
    setIsLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page, sortBy]);

  const handleSort = (col: string) => {
    setSortBy((prev) => prev.col === col ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    try {
      await supabase.from('products').delete().eq('id', deleteId);
    } catch { /* ignore */ }

    try {
      const customSaved = localStorage.getItem('lumiere_custom_products');
      const custom: Product[] = customSaved ? JSON.parse(customSaved) : [];
      const updatedCustom = custom.filter((p) => p.id !== deleteId);
      localStorage.setItem('lumiere_custom_products', JSON.stringify(updatedCustom));

      const deletedSaved = localStorage.getItem('lumiere_deleted_product_ids');
      const deletedIds: string[] = deletedSaved ? JSON.parse(deletedSaved) : [];
      if (!deletedIds.includes(deleteId)) {
        localStorage.setItem('lumiere_deleted_product_ids', JSON.stringify([...deletedIds, deleteId]));
      }
    } catch { /* ignore */ }

    setIsDeleting(false);
    setDeleteId(null);
    success('Product deleted');
    fetchProducts();
  };

  const SortIcon = ({ col }: { col: string }) => (
    sortBy.col === col
      ? sortBy.dir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
      : <ChevronDown size={13} className="opacity-30" />
  );

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-foreground-secondary mt-0.5">{total} product{total !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/products/new"
          className="h-10 px-4 bg-foreground text-white text-sm font-medium rounded-xl flex items-center gap-2 hover:bg-foreground/90 transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-2xl border border-border shadow-card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or SKU..."
            className="w-full h-10 pl-9 pr-4 text-sm border border-border-strong rounded-xl focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={10} cols={6} />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  {[
                    { label: 'Product', col: 'title' },
                    { label: 'Status', col: 'status' },
                    { label: 'Price', col: 'price' },
                    { label: 'Stock', col: 'stock_quantity' },
                    { label: 'Category', col: '' },
                    { label: 'Created', col: 'created_at' },
                    { label: '', col: '' },
                  ].map(({ label, col }) => (
                    <th
                      key={label}
                      onClick={() => col && handleSort(col)}
                      className={cn(
                        'text-left px-5 py-3 text-xs font-semibold text-foreground-secondary uppercase tracking-wider',
                        col ? 'cursor-pointer hover:text-foreground select-none' : ''
                      )}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {col && <SortIcon col={col} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-foreground-secondary">
                      {search ? 'No products match your search.' : 'No products yet. Add your first product!'}
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const thumb = (product.images as { image_url: string; sort_order: number }[])
                      ?.sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url;
                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-background/50 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-background-secondary overflow-hidden shrink-0">
                              {thumb && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={thumb} alt={product.title} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium line-clamp-1">{product.title}</p>
                              {product.sku && <p className="text-xs text-foreground-muted">SKU: {product.sku}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={cn('status-badge', getStatusColor(product.status))}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-medium">{formatCurrency(product.price)}</td>
                        <td className="px-5 py-3.5">
                          <span className={product.stock_quantity <= 5 ? 'text-destructive font-medium' : ''}>
                            {product.stock_quantity}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-foreground-secondary">
                          {(product.category as { name: string } | undefined)?.name ?? '—'}
                        </td>
                        <td className="px-5 py-3.5 text-foreground-secondary text-xs">
                          {formatDate(product.created_at)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <a
                              href={`/products/${product.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-foreground-secondary hover:text-foreground rounded-lg hover:bg-background transition-colors cursor-pointer"
                              title="View on storefront"
                            >
                              <Eye size={15} />
                            </a>
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="p-1.5 text-foreground-secondary hover:text-accent rounded-lg hover:bg-background transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit size={15} />
                            </Link>
                            <button
                              onClick={() => setDeleteId(product.id)}
                              className="p-1.5 text-foreground-secondary hover:text-destructive rounded-lg hover:bg-background transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-border">
            <p className="text-xs text-foreground-secondary">
              Page {page} of {totalPages} ({total} products)
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-foreground-secondary hover:bg-background disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-foreground-secondary hover:bg-background disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        description="Are you sure? This action cannot be undone. The product will be permanently removed."
        confirmLabel="Delete Product"
        isDestructive
        isLoading={isDeleting}
      />
    </div>
  );
}
