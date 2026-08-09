'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DEFAULT_CATEGORIES } from '@/lib/mockData';
import type { Product } from '@/types';

export default function AdminNewProductPage() {
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
  const [stockQuantity, setStockQuantity] = useState('25');
  const [status, setStatus] = useState<'active' | 'draft'>('active');
  const [primaryImage, setPrimaryImage] = useState('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80');
  const [secondaryImage, setSecondaryImage] = useState('https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80');
  const [tagsInput, setTagsInput] = useState('tech, premium, workspace');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; price?: string }>({});

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    if (!sku) {
      setSku(`LUM-${val.toUpperCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`);
    }
  };

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

    const newId = `prod-${Date.now()}`;
    const selectedCategory = DEFAULT_CATEGORIES.find((c) => c.id === categoryId) ?? DEFAULT_CATEGORIES[0];
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    const newProduct: Product = {
      id: newId,
      title: title.trim(),
      slug: slug.trim() || `product-${Date.now()}`,
      description: description.trim() || 'Premium workspace digital accessory crafted for precision and style.',
      category_id: categoryId,
      price: Number(price),
      sale_price: salePrice ? Number(salePrice) : null,
      sku: sku.trim() || `SKU-${Date.now()}`,
      stock_quantity: Number(stockQuantity) || 0,
      track_inventory: true,
      allow_backorders: false,
      status,
      tags,
      avg_rating: 5.0,
      review_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: { id: selectedCategory.id, name: selectedCategory.name, slug: selectedCategory.slug },
      images: [
        { id: `img-${Date.now()}-1`, product_id: newId, image_url: primaryImage, sort_order: 0, alt_text: title },
        ...(secondaryImage ? [{ id: `img-${Date.now()}-2`, product_id: newId, image_url: secondaryImage, sort_order: 1, alt_text: `${title} alternate` }] : []),
      ],
    };

    // 1. Try Supabase insert
    try {
      await supabase.from('products').insert({
        id: newProduct.id,
        title: newProduct.title,
        slug: newProduct.slug,
        description: newProduct.description,
        category_id: newProduct.category_id,
        price: newProduct.price,
        sale_price: newProduct.sale_price,
        sku: newProduct.sku,
        stock_quantity: newProduct.stock_quantity,
        status: newProduct.status,
      });

      if (primaryImage) {
        await supabase.from('product_images').insert({
          product_id: newProduct.id,
          image_url: primaryImage,
          sort_order: 0,
        });
      }
    } catch { /* ignore Supabase errors and fall back to local storage */ }

    // 2. Persist in local storage
    try {
      const saved = localStorage.getItem('lumiere_custom_products');
      const customProducts: Product[] = saved ? JSON.parse(saved) : [];
      localStorage.setItem('lumiere_custom_products', JSON.stringify([newProduct, ...customProducts]));
    } catch (err) {
      console.error('Failed saving to local storage:', err);
    }

    setIsLoading(false);
    success('Product created!', `${title} has been added to your catalog.`);
    router.push('/admin/products');
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="w-9 h-9 rounded-xl border border-border bg-white flex items-center justify-center text-foreground-secondary hover:text-foreground hover:bg-background transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Add New Product</h1>
            <p className="text-xs text-foreground-secondary mt-0.5">Create a new item in your storefront catalog</p>
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
                placeholder="e.g. Acoustic Pro ANC Headphones"
                value={title}
                onChange={handleTitleChange}
                error={errors.title}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="URL Slug"
                  placeholder="acoustic-pro-headphones"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
                <Input
                  label="SKU Code"
                  placeholder="AUDIO-ANC-01"
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
                  placeholder="Detailed description of features, specifications, and design highlights..."
                  className="w-full p-3 text-sm border border-border-strong rounded-xl focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Media */}
            <div className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-medium flex items-center gap-2">
                  <ImageIcon size={18} className="text-foreground-secondary" />
                  Product Images
                </h2>
              </div>

              <Input
                label="Primary Image URL"
                placeholder="https://images.unsplash.com/..."
                value={primaryImage}
                onChange={(e) => setPrimaryImage(e.target.value)}
              />

              <Input
                label="Secondary Image URL (Hover crossfade)"
                placeholder="https://images.unsplash.com/..."
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
                placeholder="audio, headphones, wireless"
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
                placeholder="14999"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                error={errors.price}
              />

              <Input
                label="Sale Price (₹) (Optional)"
                type="number"
                placeholder="12999"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              />

              <Input
                label="Stock Quantity *"
                type="number"
                placeholder="25"
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
                Save Product
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
