'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DEFAULT_CATEGORIES, MOCK_PRODUCTS } from '@/lib/mockData';
import type { Product } from '@/types';

interface EditProductPageProps {
  params: { id: string };
}

export default function AdminEditProductPage({ params }: EditProductPageProps) {
  const { id } = params;
  const router = useRouter();
  const { success } = useToast();
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('cat-audio');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [sku, setSku] = useState('');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [status, setStatus] = useState<'active' | 'draft'>('active');
  const [primaryImage, setPrimaryImage] = useState('');
  const [secondaryImage, setSecondaryImage] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<{ title?: string; price?: string }>({});

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      setIsFetching(true);
      let targetProduct: Product | null = null;

      // 1. Try local storage custom products
      try {
        const saved = localStorage.getItem('lumiere_custom_products');
        if (saved) {
          const custom: Product[] = JSON.parse(saved);
          targetProduct = custom.find((p) => p.id === id) ?? null;
        }
      } catch { /* ignore */ }

      // 2. Try MOCK_PRODUCTS fallback
      if (!targetProduct) {
        targetProduct = MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
      }

      // 3. Try Supabase fetch
      try {
        const { data } = await supabase
          .from('products')
          .select('*, images:product_images(image_url, sort_order), category:categories(id, name, slug)')
          .eq('id', id)
          .single();

        if (data) {
          targetProduct = data as unknown as Product;
        }
      } catch { /* ignore */ }

      if (active && targetProduct) {
        setTitle(targetProduct.title);
        setSlug(targetProduct.slug);
        setDescription(targetProduct.description ?? '');
        setCategoryId(targetProduct.category_id ?? 'cat-audio');
        setPrice(String(targetProduct.price));
        setSalePrice(targetProduct.sale_price ? String(targetProduct.sale_price) : '');
        setSku(targetProduct.sku ?? '');
        setStockQuantity(String(targetProduct.stock_quantity ?? 0));
        setStatus(targetProduct.status);
        const images = targetProduct.images?.sort((a, b) => a.sort_order - b.sort_order) ?? [];
        setPrimaryImage(images[0]?.image_url ?? '');
        setSecondaryImage(images[1]?.image_url ?? '');
        setTagsInput(targetProduct.tags?.join(', ') ?? '');
      }

      if (active) setIsFetching(false);
    };

    loadProduct();
    return () => { active = false; };
  }, [id, supabase]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!title.trim()) errs.title = 'Product title is required';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) errs.price = 'Valid price is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    const selectedCategory = DEFAULT_CATEGORIES.find((c) => c.id === categoryId) ?? DEFAULT_CATEGORIES[0];
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    const updatedProduct: Product = {
      id,
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      category_id: categoryId,
      price: Number(price),
      sale_price: salePrice ? Number(salePrice) : null,
      sku: sku.trim(),
      stock_quantity: Number(stockQuantity) || 0,
      track_inventory: true,
      allow_backorders: false,
      status,
      tags,
      avg_rating: 4.8,
      review_count: 12,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: { id: selectedCategory.id, name: selectedCategory.name, slug: selectedCategory.slug },
      images: [
        ...(primaryImage ? [{ id: `img-${id}-1`, product_id: id, image_url: primaryImage, sort_order: 0, alt_text: title }] : []),
        ...(secondaryImage ? [{ id: `img-${id}-2`, product_id: id, image_url: secondaryImage, sort_order: 1, alt_text: `${title} alternate` }] : []),
      ],
    };

    // 1. Try Supabase update
    try {
      await supabase.from('products').update({
        title: updatedProduct.title,
        slug: updatedProduct.slug,
        description: updatedProduct.description,
        category_id: updatedProduct.category_id,
        price: updatedProduct.price,
        sale_price: updatedProduct.sale_price,
        sku: updatedProduct.sku,
        stock_quantity: updatedProduct.stock_quantity,
        status: updatedProduct.status,
      }).eq('id', id);
    } catch { /* ignore */ }

    // 2. Persist in local storage
    try {
      const saved = localStorage.getItem('lumiere_custom_products');
      const custom: Product[] = saved ? JSON.parse(saved) : [];
      const index = custom.findIndex((p) => p.id === id);
      if (index >= 0) {
        custom[index] = updatedProduct;
      } else {
        custom.unshift(updatedProduct);
      }
      localStorage.setItem('lumiere_custom_products', JSON.stringify(custom));
    } catch (err) {
      console.error('Failed saving to local storage:', err);
    }

    setIsLoading(false);
    success('Product updated!', `${title} details have been saved.`);
    router.push('/admin/products');
  };

  if (isFetching) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <span className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-foreground-secondary">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="w-9 h-9 rounded-xl border border-border bg-white flex items-center justify-center text-foreground-secondary hover:text-foreground hover:bg-background transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Edit Product</h1>
            <p className="text-xs text-foreground-secondary mt-0.5">ID: {id}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-4">
              <h2 className="text-base font-medium">General Information</h2>

              <Input
                label="Product Title *"
                placeholder="Product title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={errors.title}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="URL Slug"
                  placeholder="product-url-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
                <Input
                  label="SKU Code"
                  placeholder="AUDIO-01"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground-secondary mb-1.5">
                  Product Description
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 text-sm border border-border-strong rounded-xl focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Media */}
            <div className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-4">
              <h2 className="text-base font-medium flex items-center gap-2">
                <ImageIcon size={18} className="text-foreground-secondary" />
                Product Images
              </h2>

              <Input
                label="Primary Image URL"
                value={primaryImage}
                onChange={(e) => setPrimaryImage(e.target.value)}
              />

              <Input
                label="Secondary Image URL"
                value={secondaryImage}
                onChange={(e) => setSecondaryImage(e.target.value)}
              />

              {primaryImage && (
                <div className="flex gap-3 pt-2">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-background border border-border relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={primaryImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  {secondaryImage && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-background border border-border relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={secondaryImage} alt="Secondary preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar controls */}
          <div className="space-y-6">
            {/* Status & Category */}
            <div className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-4">
              <h2 className="text-base font-medium">Organization</h2>

              <div>
                <label className="block text-xs font-medium text-foreground-secondary mb-1.5">
                  Publish Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'draft')}
                  className="w-full h-10 px-3 text-sm border border-border-strong rounded-xl focus:outline-none focus:border-accent bg-white"
                >
                  <option value="active">Active (Visible in store)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground-secondary mb-1.5">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-border-strong rounded-xl focus:outline-none focus:border-accent bg-white"
                >
                  {DEFAULT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Tags (comma separated)"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>

            {/* Pricing & Stock */}
            <div className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-4">
              <h2 className="text-base font-medium">Pricing & Inventory</h2>

              <Input
                label="Regular Price (₹) *"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                error={errors.price}
              />

              <Input
                label="Sale Price (₹)"
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              />

              <Input
                label="Stock Quantity *"
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
              />
            </div>

            {/* Action CTAs */}
            <div className="flex gap-3">
              <Link href="/admin/products" className="flex-1">
                <Button variant="secondary" fullWidth type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" fullWidth isLoading={isLoading} leftIcon={<Save size={16} />} className="flex-1">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
