'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Heart,
  Share2,
  Shield,
  Truck,
  RotateCcw,
  Star,
  Check,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/providers/CartProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useWishlist } from '@/providers/WishlistProvider';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { StarRating, RatingBreakdown } from '@/components/ui/StarRating';
import { ProductCard } from '@/components/ui/ProductCard';
import { cn, formatCurrency, getEffectivePrice, isOnSale, calculateDiscount } from '@/lib/utils';
import type { Product, ProductVariant, Review } from '@/types';

interface ProductDetailClientProps {
  product: Product;
  related: Product[];
}

// ============================================================
// BREADCRUMB
// ============================================================
function Breadcrumb({ product }: { product: Product }) {
  return (
    <nav className="flex items-center gap-2 text-xs text-foreground-secondary mb-8">
      <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
      <ChevronRight size={12} />
      <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
      {product.category && (
        <>
          <ChevronRight size={12} />
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground transition-colors">
            {product.category.name}
          </Link>
        </>
      )}
      <ChevronRight size={12} />
      <span className="text-foreground line-clamp-1">{product.title}</span>
    </nav>
  );
}

// ============================================================
// IMAGE GALLERY
// ============================================================
function ImageGallery({ images, title }: { images: Product['images']; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const imgs = images && images.length > 0 ? images.sort((a, b) => a.sort_order - b.sort_order) : [];
  const activeImage = imgs[activeIndex];

  return (
    <div className="flex flex-col gap-4 lg:flex-row-reverse">
      {/* Main image */}
      <div className="flex-1 relative aspect-[4/5] rounded-2xl overflow-hidden bg-background-secondary group">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {activeImage?.image_url ? (
              <Image
                src={activeImage.image_url}
                alt={activeImage.alt_text ?? title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <ShoppingBag size={48} className="text-gray-300" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      {imgs.length > 1 && (
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] no-scrollbar">
          {imgs.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'relative shrink-0 w-16 h-20 lg:w-20 lg:h-24 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer',
                i === activeIndex ? 'border-foreground opacity-100' : 'border-transparent opacity-60 hover:opacity-80'
              )}
            >
              <Image
                src={img.image_url}
                alt={img.alt_text ?? `${title} ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// ACCORDION SECTION
// ============================================================
function AccordionItem({ title, children, defaultOpen = false }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-sm font-medium text-foreground hover:text-accent transition-colors cursor-pointer"
      >
        {title}
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <Plus size={16} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3 text-sm text-foreground-secondary leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// REVIEW CARD
// ============================================================
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="py-5 border-b border-border last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-foreground text-white text-xs font-semibold flex items-center justify-center shrink-0">
          {(review.reviewer?.full_name ?? 'A').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-sm font-medium">{review.reviewer?.full_name ?? 'Anonymous'}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <StarRating rating={review.rating} size="sm" />
                {review.is_verified && (
                  <span className="flex items-center gap-1 text-[10px] text-success font-medium">
                    <Check size={10} />
                    Verified
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-foreground-muted">
              {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          {review.title && <p className="text-sm font-medium mt-2">{review.title}</p>}
          {review.body && <p className="text-sm text-foreground-secondary mt-1 leading-relaxed">{review.body}</p>}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// REVIEW FORM
// ============================================================
function ReviewForm({ productId, onSubmitted }: { productId: string; onSubmitted: (review: Review) => void }) {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  if (!user) {
    return (
      <div className="bg-background rounded-xl p-6 text-center">
        <p className="text-sm text-foreground-secondary mb-3">Sign in to leave a review</p>
        <Link href="/account/login" className="text-sm font-medium text-accent hover:text-accent/80 transition-colors">
          Sign In →
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { error('Please select a rating'); return; }
    setIsLoading(true);

    const { data, error: err } = await supabase
      .from('reviews')
      .insert({ product_id: productId, user_id: user.id, rating, title: title.trim() || null, body: body.trim() || null })
      .select('*, reviewer:profiles(full_name, avatar_url)')
      .single();

    setIsLoading(false);
    if (err) {
      error('Failed to submit', err.message);
    } else {
      success('Review submitted!', 'Thank you for your feedback.');
      onSubmitted(data as unknown as Review);
      setRating(0); setTitle(''); setBody('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-background rounded-xl p-6 space-y-4">
      <h4 className="font-medium text-sm">Write a Review</h4>
      <div>
        <p className="text-xs text-foreground-secondary mb-2">Your Rating</p>
        <StarRating rating={rating} interactive onChange={setRating} size="lg" />
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Review title (optional)"
        className="w-full h-10 px-4 text-sm border border-border-strong rounded-xl focus:outline-none focus:border-accent"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share your experience with this product..."
        rows={4}
        className="w-full px-4 py-3 text-sm border border-border-strong rounded-xl focus:outline-none focus:border-accent resize-none"
      />
      <Button type="submit" isLoading={isLoading} size="sm">
        Submit Review
      </Button>
    </form>
  );
}

// ============================================================
// MAIN CLIENT COMPONENT
// ============================================================
export function ProductDetailClient({ product, related }: ProductDetailClientProps) {
  const { addItem, openDrawer, triggerFlyAnimation } = useCart();
  const { isWishlisted: checkWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = checkWishlist(product.id);
  const imageRef = useRef<HTMLDivElement>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>((product.reviews as Review[]) ?? []);

  const onSale = isOnSale(product.sale_price, product.sale_start, product.sale_end);
  const effectivePrice = getEffectivePrice(product.price, product.sale_price, product.sale_start, product.sale_end);
  const discountPct = onSale && product.sale_price ? calculateDiscount(product.price, product.sale_price) : 0;
  const primaryImage = product.images?.sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url ?? null;
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const isOutOfStock =
    product.track_inventory && product.stock_quantity <= 0 && !product.allow_backorders;

  const getMatchingVariant = useCallback((): ProductVariant | null => {
    if (!product.variants || product.variants.length === 0) return null;
    return (
      product.variants.find((v) =>
        v.option_values.every(
          (ov) => selectedOptions[ov.option_name] === ov.value
        )
      ) ?? null
    );
  }, [product.variants, selectedOptions]);

  const variant = getMatchingVariant();
  const finalPrice = variant?.price ?? effectivePrice;
  const stockAvailable = variant?.stock_quantity ?? product.stock_quantity;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const imageEl = imageRef.current;
    if (imageEl && primaryImage) {
      const rect = imageEl.getBoundingClientRect();
      triggerFlyAnimation(rect.left + rect.width / 2, rect.top + rect.height / 2, primaryImage);
    }
    addItem({
      product_id: product.id,
      variant_id: variant?.id ?? null,
      title: product.title,
      slug: product.slug,
      image_url: primaryImage,
      price: finalPrice,
      quantity,
      variant_info: selectedOptions,
      max_quantity: stockAvailable || 999,
    });
    setTimeout(openDrawer, 700);
  };

  const handleWishlist = () => {
    toggleWishlist(product);
  };

  return (
    <article className="container-site py-8">
      <Breadcrumb product={product} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Images */}
        <div ref={imageRef}>
          <ImageGallery images={product.images ?? []} title={product.title} />
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          {/* Category + Title */}
          <div>
            {product.category && (
              <Link
                href={`/products?category=${product.category.slug}`}
                className="label-text hover:text-accent transition-colors"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="font-serif text-3xl lg:text-4xl font-medium mt-2 leading-tight">
              {product.title}
            </h1>
          </div>

          {/* Rating summary */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={avgRating} size="sm" />
              <span className="text-sm text-foreground-secondary">{avgRating.toFixed(1)}</span>
              <span className="text-foreground-muted text-sm">({reviews.length} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className={cn('text-2xl font-semibold', onSale ? 'text-destructive' : '')}>
              {formatCurrency(finalPrice)}
            </span>
            {onSale && (
              <>
                <span className="text-lg text-foreground-muted line-through">{formatCurrency(product.price)}</span>
                <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-xs font-semibold rounded-full">
                  -{discountPct}% OFF
                </span>
              </>
            )}
          </div>

          {/* SKU */}
          {product.sku && (
            <p className="text-xs text-foreground-muted">SKU: {product.sku}</p>
          )}

          {/* Variant selectors */}
          {product.options && product.options.map((option) => (
            <div key={option.id}>
              <p className="text-sm font-medium mb-3">
                {option.name}
                {selectedOptions[option.name] && (
                  <span className="ml-2 text-foreground-secondary font-normal">
                    : {selectedOptions[option.name]}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {option.values?.sort((a, b) => a.sort_order - b.sort_order).map((val) => {
                  const isColor = option.name.toLowerCase() === 'color';
                  const isSelected = selectedOptions[option.name] === val.value;
                  const isDisabled = false; // Would check stock against variant

                  if (isColor) {
                    return (
                      <button
                        key={val.id}
                        title={val.value}
                        onClick={() => setSelectedOptions((prev) => ({ ...prev, [option.name]: val.value }))}
                        className={cn(
                          'w-9 h-9 rounded-full border-2 transition-all cursor-pointer relative',
                          isSelected ? 'border-foreground scale-110' : 'border-transparent hover:border-foreground/40',
                          isDisabled ? 'opacity-30 cursor-not-allowed' : ''
                        )}
                        style={{ backgroundColor: val.value.toLowerCase() }}
                      >
                        {isSelected && (
                          <Check size={14} className="absolute inset-0 m-auto text-white drop-shadow" />
                        )}
                      </button>
                    );
                  }

                  return (
                    <button
                      key={val.id}
                      onClick={() => !isDisabled && setSelectedOptions((prev) => ({ ...prev, [option.name]: val.value }))}
                      disabled={isDisabled}
                      className={cn(
                        'h-10 px-4 text-sm rounded-xl border-2 transition-all duration-150 cursor-pointer relative',
                        isSelected
                          ? 'border-foreground bg-foreground text-white font-medium'
                          : 'border-border-strong text-foreground hover:border-foreground/60',
                        isDisabled ? 'opacity-40 cursor-not-allowed line-through' : ''
                      )}
                    >
                      {val.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium">Quantity</p>
            <div className="flex items-center border border-border-strong rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center text-foreground-secondary hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              >
                <Minus size={15} />
              </button>
              <span className="w-10 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(stockAvailable || 99, q + 1))}
                disabled={quantity >= (stockAvailable || 99)}
                className="w-10 h-10 flex items-center justify-center text-foreground-secondary hover:text-foreground hover:bg-background transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={15} />
              </button>
            </div>
            {product.track_inventory && stockAvailable <= 5 && stockAvailable > 0 && (
              <p className="text-xs text-warning font-medium">Only {stockAvailable} left!</p>
            )}
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3">
            <Button
              fullWidth
              size="xl"
              shimmer
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              leftIcon={<ShoppingBag size={18} />}
              className="flex-1"
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={handleWishlist}
              className="w-14 h-14 rounded-xl border-2 border-border-strong flex items-center justify-center text-foreground-secondary hover:text-destructive hover:border-destructive/30 transition-colors cursor-pointer shrink-0"
              aria-label="Add to wishlist"
            >
              <Heart size={20} className={isWishlisted ? 'fill-destructive text-destructive' : ''} />
            </motion.button>
            <button
              onClick={() => navigator.share?.({ title: product.title, url: window.location.href })}
              className="w-14 h-14 rounded-xl border-2 border-border-strong flex items-center justify-center text-foreground-secondary hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer shrink-0"
              aria-label="Share product"
            >
              <Share2 size={18} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Truck, label: 'Free shipping', sub: 'Over ₹999' },
              { icon: RotateCcw, label: 'Free returns', sub: 'Within 30 days' },
              { icon: Shield, label: 'Secure payment', sub: 'Razorpay SSL' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center text-center gap-1.5 p-3 bg-background rounded-xl">
                <Icon size={18} className="text-foreground-secondary" />
                <p className="text-xs font-medium">{label}</p>
                <p className="text-[10px] text-foreground-muted">{sub}</p>
              </div>
            ))}
          </div>

          {/* Accordions */}
          <div className="pt-2">
            {product.description && (
              <AccordionItem title="Description" defaultOpen>
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              </AccordionItem>
            )}
            <AccordionItem title="Shipping & Returns">
              <p>We offer free shipping on orders above ₹999. Standard delivery takes 3-5 business days. Express delivery available at checkout.</p>
              <p className="mt-2">Items can be returned within 30 days of delivery for a full refund or exchange. Items must be unused and in original packaging.</p>
            </AccordionItem>
            <AccordionItem title="Size Guide">
              <p>Refer to our detailed size guide to find your perfect fit. All measurements are in centimeters.</p>
            </AccordionItem>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div>
            <h2 className="font-serif text-2xl font-medium mb-6">Customer Reviews</h2>
            {reviews.length > 0 ? (
              <RatingBreakdown reviews={reviews} />
            ) : (
              <p className="text-sm text-foreground-secondary">No reviews yet. Be the first!</p>
            )}
            <div className="mt-8">
              <ReviewForm productId={product.id} onSubmitted={(r) => setReviews((prev) => [r, ...prev])} />
            </div>
          </div>
          <div className="lg:col-span-2">
            {reviews.length > 0 ? (
              <div>
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-foreground-secondary">
                <Star size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No reviews yet for this product.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-serif text-2xl font-medium mb-8">You May Also Like</h2>
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
            {related.map((p) => (
              <div key={p.id} className="w-56 shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
