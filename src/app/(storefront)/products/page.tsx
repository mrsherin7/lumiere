'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { ProductCard } from '@/components/ui/ProductCard';
import { Modal } from '@/components/ui/Modal';
import type { Product, Category, ProductFilters } from '@/types';
import { cn } from '@/lib/utils';
import { useCart } from '@/providers/CartProvider';

import { DEFAULT_CATEGORIES, MOCK_PRODUCTS } from '@/lib/mockData';

// ============================================================
// FILTER SIDEBAR
// ============================================================
interface FilterSidebarProps {
  filters: ProductFilters;
  categories: Category[];
  onFilterChange: (filters: Partial<ProductFilters>) => void;
  onClear: () => void;
}

function FilterSidebar({ filters, categories, onFilterChange, onClear }: FilterSidebarProps) {
  const [openSections, setOpenSections] = useState<string[]>(['category', 'price', 'availability']);

  const toggle = (section: string) =>
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );

  const isOpen = (section: string) => openSections.includes(section);

  return (
    <aside className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-medium text-foreground">Filters</h2>
        <button
          onClick={onClear}
          className="text-xs text-foreground-secondary hover:text-foreground transition-colors cursor-pointer"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-1">
        {/* Category */}
        <FilterSection title="Category" isOpen={isOpen('category')} onToggle={() => toggle('category')}>
          <div className="space-y-2">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.category === cat.slug}
                  onChange={(e) => onFilterChange({ category: e.target.checked ? cat.slug : undefined })}
                  className="w-4 h-4 rounded border-border-strong accent-foreground cursor-pointer"
                />
                <span className="text-sm text-foreground-secondary group-hover:text-foreground transition-colors">
                  {cat.name}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Price Range" isOpen={isOpen('price')} onToggle={() => toggle('price')}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary text-sm">₹</span>
                <input
                  type="number"
                  value={filters.minPrice ?? ''}
                  onChange={(e) => onFilterChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Min"
                  className="w-full h-9 pl-7 pr-3 text-sm border border-border-strong rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
              <span className="text-foreground-muted text-sm">—</span>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary text-sm">₹</span>
                <input
                  type="number"
                  value={filters.maxPrice ?? ''}
                  onChange={(e) => onFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Max"
                  className="w-full h-9 pl-7 pr-3 text-sm border border-border-strong rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            {/* Quick presets */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Under ₹500', min: 0, max: 500 },
                { label: '₹500–2000', min: 500, max: 2000 },
                { label: '₹2000+', min: 2000, max: undefined },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => onFilterChange({ minPrice: preset.min, maxPrice: preset.max })}
                  className={cn(
                    'px-3 py-1 text-xs rounded-full border transition-colors cursor-pointer',
                    filters.minPrice === preset.min && filters.maxPrice === preset.max
                      ? 'border-foreground bg-foreground text-white'
                      : 'border-border-strong text-foreground-secondary hover:border-foreground hover:text-foreground'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </FilterSection>

        {/* Availability */}
        <FilterSection title="Availability" isOpen={isOpen('availability')} onToggle={() => toggle('availability')}>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.inStock === true}
              onChange={(e) => onFilterChange({ inStock: e.target.checked ? true : undefined })}
              className="w-4 h-4 rounded border-border-strong accent-foreground cursor-pointer"
            />
            <span className="text-sm text-foreground-secondary group-hover:text-foreground transition-colors">
              In stock only
            </span>
          </label>
        </FilterSection>

        {/* Rating */}
        <FilterSection title="Rating" isOpen={isOpen('rating')} onToggle={() => toggle('rating')}>
          <div className="space-y-2">
            {[4, 3, 2].map((rating) => (
              <label key={rating} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.rating === rating}
                  onChange={() => onFilterChange({ rating })}
                  className="w-4 h-4 accent-foreground cursor-pointer"
                />
                <span className="text-sm text-foreground-secondary flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < rating ? 'text-amber-400' : 'text-gray-200'}>★</span>
                  ))}
                  <span className="ml-1">& up</span>
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </aside>
  );
}

function FilterSection({ title, isOpen, onToggle, children }: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border py-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-sm font-medium text-foreground hover:text-accent transition-colors cursor-pointer"
      >
        {title}
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// SORT DROPDOWN
// ============================================================
const sortOptions: { value: ProductFilters['sortBy']; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'best_selling', label: 'Best Selling' },
  { value: 'rating', label: 'Top Rated' },
];

// ============================================================
// ACTIVE FILTER CHIPS
// ============================================================
function ActiveFilterChips({ filters, categories, onRemove }: {
  filters: ProductFilters;
  categories: Category[];
  onRemove: (key: keyof ProductFilters) => void;
}) {
  const chips = [];

  if (filters.category) {
    const cat = categories.find((c) => c.slug === filters.category);
    chips.push({ key: 'category' as keyof ProductFilters, label: cat?.name ?? filters.category });
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const label = `₹${filters.minPrice ?? 0}${filters.maxPrice ? ` – ₹${filters.maxPrice}` : '+'}`;
    chips.push({ key: 'minPrice' as keyof ProductFilters, label });
  }
  if (filters.inStock) chips.push({ key: 'inStock' as keyof ProductFilters, label: 'In Stock' });
  if (filters.rating) chips.push({ key: 'rating' as keyof ProductFilters, label: `${filters.rating}★ & up` });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {chips.map(({ key, label }) => (
        <motion.button
          key={key}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={() => onRemove(key)}
          className="flex items-center gap-1.5 px-3 py-1 text-xs bg-foreground text-white rounded-full cursor-pointer hover:bg-foreground/80 transition-colors"
        >
          {label}
          <X size={11} />
        </motion.button>
      ))}
    </div>
  );
}

// ============================================================
// MAIN PLP PAGE
// ============================================================
function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse filters from URL
  const filters: ProductFilters = {
    category: searchParams.get('category') ?? undefined,
    tag: searchParams.get('tag') ?? undefined,
    sale: searchParams.get('sale') === 'true' ? true : undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    inStock: searchParams.get('inStock') === 'true' ? true : undefined,
    rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
    sortBy: (searchParams.get('sort') as ProductFilters['sortBy']) ?? 'newest',
    search: searchParams.get('search') ?? undefined,
  };

  // Synchronous initial product filtering for instant rendering
  const initialProducts = useMemo(() => {
    let filtered = [...MOCK_PRODUCTS];
    if (filters.category) {
      filtered = filtered.filter((p) => p.category?.slug === filters.category || p.tags?.includes(filters.category!));
    }
    if (filters.tag) {
      filtered = filtered.filter((p) => p.tags?.includes(filters.tag!));
    }
    if (filters.sale) {
      filtered = filtered.filter((p) => p.sale_price !== null && p.sale_price !== undefined && p.sale_price < p.price);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)) ||
          Boolean(p.category?.name?.toLowerCase().includes(q)) ||
          Boolean(p.category?.slug?.toLowerCase().includes(q))
      );
    }
    if (filters.sortBy === 'price_asc') filtered.sort((a, b) => a.price - b.price);
    if (filters.sortBy === 'price_desc') filtered.sort((a, b) => b.price - a.price);
    return filtered;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.tag, filters.sale, filters.search, filters.sortBy]);

  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        params.delete(key === 'sortBy' ? 'sort' : key);
      } else {
        params.set(key === 'sortBy' ? 'sort' : key, String(value));
      }
    });
    router.push(`${pathname}?${params.toString()}`);
    setPage(1);
  }, [searchParams, router, pathname]);

  const removeFilter = (key: keyof ProductFilters) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === 'minPrice' || key === 'maxPrice') {
      params.delete('minPrice');
      params.delete('maxPrice');
    } else {
      params.delete(key === 'sortBy' ? 'sort' : key);
    }
    router.push(`${pathname}?${params.toString()}`);
    setPage(1);
  };

  const clearFilters = () => {
    router.push(pathname);
    setPage(1);
  };

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [total, setTotal] = useState(initialProducts.length);
  const [filterOpen, setFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const supabase = createClient();

  // Update products when initial filters change synchronously
  useEffect(() => {
    setProducts(initialProducts);
    setTotal(initialProducts.length);
  }, [initialProducts]);

  // Fetch categories background
  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => {
      if (data && data.length > 0) {
        setCategories(data as Category[]);
      }
    });
  }, [supabase]);

  // Fetch live products from Supabase with fast 1s timeout
  useEffect(() => {
    let isCancelled = false;

    const fetchProducts = async () => {
      const activeCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

      try {
        let query = supabase
          .from('products')
          .select('*, images:product_images(id, image_url, sort_order, alt_text), category:categories(id, name, slug)', { count: 'exact' })
          .eq('status', 'active');

        if (filters.category) {
          const cat = activeCategories.find((c) => c.slug === filters.category);
          if (cat) query = query.eq('category_id', cat.id);
        }
        if (filters.minPrice !== undefined) query = query.gte('price', filters.minPrice);
        if (filters.maxPrice !== undefined) query = query.lte('price', filters.maxPrice);
        if (filters.inStock) query = query.gt('stock_quantity', 0);
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        switch (filters.sortBy) {
          case 'price_asc': query = query.order('price', { ascending: true }); break;
          case 'price_desc': query = query.order('price', { ascending: false }); break;
          case 'newest': query = query.order('created_at', { ascending: false }); break;
          default: query = query.order('created_at', { ascending: false });
        }

        query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

        const { data, count, error } = await query;

        if (!isCancelled && !error && Array.isArray(data) && data.length > 0) {
          setProducts(page === 1 ? (data as unknown as Product[]) : (prev) => [...prev, ...(data as unknown as Product[])]);
          setTotal(count ?? data.length);
        }
      } catch {
        // Keep initial mock products if network fails
      }
    };

    fetchProducts();

    return () => {
      isCancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.tag, filters.sale, filters.sortBy, filters.search, filters.minPrice, filters.maxPrice, filters.inStock, page]);

  const hasMore = products.length < total;

  return (
    <div className="container-site py-12">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          {filters.search ? (
            <h1 className="font-serif text-section-sm">Search: &ldquo;{filters.search}&rdquo;</h1>
          ) : (
            <h1 className="font-serif text-section-sm">
              {filters.tag
                ? `${filters.tag.charAt(0).toUpperCase() + filters.tag.slice(1)} Collection`
                : filters.sale
                ? 'On Sale Tech & Accessories'
                : filters.category
                ? (categories.find((c) => c.slug === filters.category)?.name ?? 'Digital Accessories')
                : 'All Products'}
            </h1>
          )}
          <p className="text-sm text-foreground-secondary mt-1">
            {total} product{total !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative">
            <select
              value={filters.sortBy ?? 'newest'}
              onChange={(e) => updateFilters({ sortBy: e.target.value as ProductFilters['sortBy'] })}
              className="h-10 pl-3 pr-8 text-sm border border-border-strong rounded-xl focus:outline-none focus:border-accent bg-white appearance-none cursor-pointer"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground-secondary" />
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setFilterOpen(true)}
            className="lg:hidden h-10 px-4 text-sm border border-border-strong rounded-xl flex items-center gap-2 hover:bg-background transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      <AnimatePresence>
        <ActiveFilterChips filters={filters} categories={categories} onRemove={removeFilter} />
      </AnimatePresence>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-56 shrink-0">
          <FilterSidebar
            filters={filters}
            categories={categories}
            onFilterChange={updateFilters}
            onClear={clearFilters}
          />
        </div>

        {/* Product grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-serif text-2xl mb-3">No products found</p>
              <p className="text-foreground-secondary text-sm mb-6">Try adjusting your filters</p>
              <button
                onClick={clearFilters}
                className="text-sm text-accent hover:text-accent/80 transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={setQuickViewProduct}
                    priority={i < 6}
                  />
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="mt-12 text-center">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="h-12 px-8 border border-border-strong rounded-xl text-sm font-medium text-foreground hover:bg-background transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    Load More ({total - products.length} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter modal */}
      <Modal
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filters"
        size="sm"
      >
        <FilterSidebar
          filters={filters}
          categories={categories}
          onFilterChange={(f) => { updateFilters(f); setFilterOpen(false); }}
          onClear={() => { clearFilters(); setFilterOpen(false); }}
        />
      </Modal>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}

// ============================================================
// QUICK VIEW MODAL
// ============================================================
function QuickViewModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addItem, openDrawer, triggerFlyAnimation } = useCart();
  const imageRef = useRef<HTMLDivElement>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const primaryImage = product.images?.[0]?.image_url ?? null;
  const sizeOption = product.options?.find((o) => o.name.toLowerCase() === 'size');
  const sizes = sizeOption?.values ?? [];
  const isOutOfStock = product.track_inventory && product.stock_quantity <= 0;

  const handleAddToCart = () => {
    if (imageRef.current && primaryImage) {
      const rect = imageRef.current.getBoundingClientRect();
      triggerFlyAnimation(rect.left + rect.width / 2, rect.top + rect.height / 2, primaryImage);
    }
    addItem({
      product_id: product.id,
      variant_id: null,
      title: product.title,
      slug: product.slug,
      image_url: primaryImage,
      price: product.sale_price ?? product.price,
      quantity: qty,
      variant_info: selectedSize ? { Size: selectedSize } : {},
      max_quantity: product.stock_quantity || 999,
    });
    setTimeout(() => { openDrawer(); onClose(); }, 600);
  };

  return (
    <Modal isOpen onClose={onClose} size="lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 pt-2">
        {/* Image */}
        <div ref={imageRef} className="relative aspect-product rounded-xl overflow-hidden bg-background-secondary">
          {primaryImage ? (
            <Image src={primaryImage} alt={product.title} fill sizes="400px" className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <p className="label-text mb-1">{product.category?.name}</p>
            <h3 className="font-serif text-2xl font-medium">{product.title}</h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-lg font-semibold">
                {product.sale_price ? (
                  <>
                    <span className="text-destructive">₹{product.sale_price.toLocaleString()}</span>
                    <span className="ml-2 text-sm text-foreground-muted line-through">₹{product.price.toLocaleString()}</span>
                  </>
                ) : (
                  `₹${product.price.toLocaleString()}`
                )}
              </span>
            </div>
          </div>

          {sizes.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSize(s.value)}
                    className={cn(
                      'h-9 px-3 text-sm rounded-lg border transition-colors cursor-pointer',
                      selectedSize === s.value
                        ? 'border-foreground bg-foreground text-white'
                        : 'border-border-strong text-foreground hover:border-foreground'
                    )}
                  >
                    {s.value}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border-strong rounded-xl overflow-hidden">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-background transition-colors cursor-pointer text-foreground-secondary">−</button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock_quantity, q + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-background transition-colors cursor-pointer text-foreground-secondary">+</button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={cn(
              'w-full h-12 rounded-xl text-sm font-medium transition-colors cursor-pointer',
              isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-foreground text-white hover:bg-foreground/90'
            )}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>

          <a
            href={`/products/${product.slug}`}
            className="block text-center text-sm text-foreground-secondary hover:text-foreground transition-colors"
            onClick={onClose}
          >
            View full details →
          </a>
        </div>
      </div>
    </Modal>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-site py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-product rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
