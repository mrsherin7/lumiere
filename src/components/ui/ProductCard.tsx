'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { cn, formatCurrency, getEffectivePrice, isOnSale, calculateDiscount } from '@/lib/utils';
import { useCart } from '@/providers/CartProvider';
import { useWishlist } from '@/providers/WishlistProvider';
import { StarRating } from '@/components/ui/StarRating';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  isWishlisted?: boolean;
  onWishlistToggle?: (productId: string) => void;
  priority?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  onQuickView,
  onWishlistToggle,
  priority = false,
  className,
}: ProductCardProps) {
  const { addItem, openDrawer, triggerFlyAnimation } = useCart();
  const { isWishlisted: checkWishlist, toggleWishlist } = useWishlist();
  const wishlisted = checkWishlist(product.id);
  const imageRef = useRef<HTMLDivElement>(null);

  const primaryImage = product.images?.[0]?.image_url ?? null;
  const secondaryImage = product.images?.[1]?.image_url ?? null;
  const isOutOfStock = product.track_inventory && product.stock_quantity <= 0 && !product.allow_backorders;
  const onSale = isOnSale(product.sale_price, product.sale_start, product.sale_end);
  const effectivePrice = getEffectivePrice(product.price, product.sale_price, product.sale_start, product.sale_end);
  const discountPct = onSale && product.sale_price ? calculateDiscount(product.price, product.sale_price) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      triggerFlyAnimation(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        primaryImage ?? ''
      );
    }

    addItem({
      product_id: product.id,
      variant_id: null,
      title: product.title,
      slug: product.slug,
      image_url: primaryImage,
      price: effectivePrice,
      quantity: 1,
      variant_info: {},
      max_quantity: product.stock_quantity || 999,
    });

    setTimeout(openDrawer, 600);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    onWishlistToggle?.(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn('group relative', className)}
    >
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image container */}
        <div
          ref={imageRef}
          className="relative aspect-product rounded-xl overflow-hidden bg-background-secondary"
        >
          {/* Primary image */}
          {primaryImage ? (
            <motion.div
              className="absolute inset-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <Image
                src={primaryImage}
                alt={product.images?.[0]?.alt_text ?? product.title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className={cn(
                  'object-cover transition-opacity duration-500',
                  secondaryImage ? 'group-hover:opacity-0' : ''
                )}
                priority={priority}
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <ShoppingBag size={40} className="text-gray-300" />
            </div>
          )}

          {/* Secondary image crossfade */}
          {secondaryImage && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <Image
                src={secondaryImage}
                alt={`${product.title} alternate`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {onSale && discountPct > 0 && (
              <span className="bg-destructive text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
                -{discountPct}%
              </span>
            )}
            {!onSale &&
              new Date().getTime() - new Date(product.created_at).getTime() < 14 * 24 * 60 * 60 * 1000 && (
                <motion.span
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="bg-foreground text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
                >
                  New
                </motion.span>
              )}
            {isOutOfStock && (
              <span className="bg-white/90 text-foreground-secondary text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide border border-border">
                Sold out
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={cn(
              'absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95',
              wishlisted ? 'opacity-100' : 'opacity-90 sm:opacity-0 sm:group-hover:opacity-100'
            )}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <motion.div
              animate={wishlisted ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Heart
                size={15}
                className={cn(
                  'transition-colors duration-200',
                  wishlisted ? 'fill-destructive text-destructive' : 'text-foreground-secondary'
                )}
              />
            </motion.div>
          </button>

          {/* Quick view & Add to cart — slide up from bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
            {onQuickView && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
                className="flex-1 h-9 bg-white/95 backdrop-blur-sm text-foreground text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 hover:bg-white transition-colors cursor-pointer shadow-sm"
              >
                <Eye size={13} />
                Quick View
              </button>
            )}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={cn(
                'flex-1 h-9 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm',
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-foreground text-white hover:bg-foreground/90'
              )}
            >
              <ShoppingBag size={13} />
              {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Product info */}
        <div className="pt-3 space-y-1">
          {product.category && (
            <p className="label-text">{product.category.name}</p>
          )}
          <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-accent transition-colors duration-200">
            {product.title}
          </h3>

          {/* Rating */}
          {product.avg_rating !== undefined && product.review_count !== undefined && product.review_count > 0 && (
            <div className="flex items-center gap-1.5">
              <StarRating rating={product.avg_rating} size="sm" />
              <span className="text-xs text-foreground-secondary">({product.review_count})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 pt-0.5">
            <span className={cn('text-sm font-semibold', onSale ? 'text-destructive' : 'text-foreground')}>
              {formatCurrency(effectivePrice)}
            </span>
            {onSale && (
              <span className="text-xs text-foreground-muted line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
