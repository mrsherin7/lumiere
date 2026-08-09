'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Mail, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { Product, Category, HeroSlide } from '@/types';

// ============================================================
// HERO SECTION
// ============================================================
const defaultSlides: HeroSlide[] = [
  {
    id: '1',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&q=80',
    heading: 'High-Fidelity Studio Sound',
    subheading: 'Active noise-canceling headphones & wireless earpods engineered for acoustic purity.',
    cta_text: 'Shop Audio Tech',
    cta_link: '/products?category=audio',
    sort_order: 0,
    is_active: true,
  },
  {
    id: '2',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1920&q=80',
    heading: 'Precision Smart Wearables',
    subheading: 'OLED smartwatches & fitness trackers built for performance and minimalist elegance.',
    cta_text: 'Explore Smartwatches',
    cta_link: '/products?category=wearables',
    sort_order: 1,
    is_active: true,
  },
  {
    id: '3',
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1920&q=80',
    heading: 'Elevate Your Desk Setup',
    subheading: 'Custom mechanical keyboards, high-precision mice, and wireless charging docks.',
    cta_text: 'Shop Keyboards & Mice',
    cta_link: '/products?category=keyboards-mice',
    sort_order: 2,
    is_active: true,
  },
];

const heroWords = (heading: string) => heading.split(' ');

function HeroSection({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const goNext = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
  const goPrev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(goNext, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goNext]);

  const slide = slides[current];
  const words = heroWords(slide.heading ?? '');

  return (
    <section className="relative w-full h-[90vh] min-h-[600px] overflow-hidden">
      {/* Background images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image_url}
            alt={slide.heading ?? 'Hero'}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative h-full container-site flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${current}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl"
          >
            {/* Word-by-word headline */}
            <div className="overflow-hidden mb-6">
              <h1 className="font-serif text-hero-sm lg:text-hero text-white leading-tight">
                {words.map((word, i) => (
                  <motion.span
                    key={`${current}-${i}`}
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: i * 0.08 + 0.1,
                      duration: 0.55,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="inline-block mr-[0.25em]"
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>
            </div>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="text-lg text-white/80 mb-8 leading-relaxed"
            >
              {slide.subheading}
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.4 }}
            >
              <Link href={slide.cta_link ?? '/products'}>
                <Button
                  size="lg"
                  shimmer
                  rightIcon={<ArrowRight size={18} />}
                  className="bg-white text-foreground hover:bg-white/90 border-transparent"
                >
                  {slide.cta_text ?? 'Shop Now'}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => { goPrev(); setIsAutoPlaying(false); }}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => { goNext(); setIsAutoPlaying(false); }}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Progress indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setIsAutoPlaying(false); }}
            className="cursor-pointer"
            aria-label={`Go to slide ${i + 1}`}
          >
            <motion.div
              animate={{ width: i === current ? 32 : 8 }}
              transition={{ duration: 0.3 }}
              className={`h-1.5 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-white/40'}`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// ANNOUNCEMENT BAR
// ============================================================
function AnnouncementBar() {
  return (
    <div className="bg-foreground text-white text-center py-2.5 text-xs tracking-wide">
      ✦ Free shipping on orders above ₹999 &nbsp;·&nbsp; Free returns within 30 days &nbsp;·&nbsp; New collection live now ✦
    </div>
  );
}

// ============================================================
// FEATURED CATEGORIES
// ============================================================
function FeaturedCategories({ categories }: { categories: Category[] }) {
  const displayCategories = categories.length > 0
    ? categories
    : [
        { id: '1', name: 'Audio & Headphones', slug: 'audio', image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80', description: null, parent_id: null, sort_order: 1, created_at: '' },
        { id: '2', name: 'Smartwatches', slug: 'wearables', image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80', description: null, parent_id: null, sort_order: 2, created_at: '' },
        { id: '3', name: 'Keyboards & Mice', slug: 'keyboards-mice', image_url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80', description: null, parent_id: null, sort_order: 3, created_at: '' },
        { id: '4', name: 'Desk Setup', slug: 'desk-essentials', image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80', description: null, parent_id: null, sort_order: 4, created_at: '' },
      ] as Category[];

  return (
    <section className="py-20 container-site">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between mb-10"
      >
        <div>
          <p className="label-text mb-2">Explore</p>
          <h2 className="font-serif text-section-sm lg:text-section">Shop by Category</h2>
        </div>
        <Link
          href="/products"
          className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors"
        >
          View all <ArrowRight size={16} />
        </Link>
      </motion.div>

      <div className="flex gap-5 overflow-x-auto no-scrollbar pb-2">
        {displayCategories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="shrink-0 w-52 sm:w-64"
          >
            <Link href={`/products?category=${cat.slug}`} className="group block">
              <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-background-secondary">
                {cat.image_url && (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    sizes="256px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-serif text-xl text-white font-medium">{cat.name}</h3>
                  <p className="text-white/70 text-sm mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Shop now <ArrowRight size={13} />
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// PRODUCT GRID SECTION
// ============================================================
function ProductSection({
  title,
  subtitle,
  products,
  isLoading,
  viewAllHref,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  isLoading: boolean;
  viewAllHref: string;
}) {
  return (
    <section className="py-20 container-site">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between mb-10"
      >
        <div>
          {subtitle && <p className="label-text mb-2">{subtitle}</p>}
          <h2 className="font-serif text-section-sm lg:text-section">{title}</h2>
        </div>
        <Link
          href={viewAllHref}
          className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors"
        >
          View all <ArrowRight size={16} />
        </Link>
      </motion.div>

      {isLoading ? (
        <ProductGridSkeleton count={4} />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <ProductCard product={product} priority={i < 4} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-foreground-secondary">
          <p>Products coming soon.</p>
        </div>
      )}

      <div className="sm:hidden mt-8 text-center">
        <Link href={viewAllHref}>
          <Button variant="secondary" rightIcon={<ArrowRight size={16} />}>View All</Button>
        </Link>
      </div>
    </section>
  );
}

// ============================================================
// PROMOTIONAL BANNER WITH COUNTDOWN
// ============================================================
function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
      return {
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      };
    };
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

function PromoBanner() {
  const saleEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
  const { d, h, m, s } = useCountdown(saleEnd);

  return (
    <section className="bg-gradient-to-r from-foreground via-gray-800 to-foreground py-16 my-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="container-site text-center"
      >
        <p className="label-text text-white/50 mb-4">Limited Time Offer</p>
        <h2 className="font-serif text-4xl lg:text-5xl text-white mb-3">End of Season Sale</h2>
        <p className="text-white/60 mb-8 text-lg">Up to 40% off selected styles</p>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {[
            { val: d, label: 'Days' },
            { val: h, label: 'Hours' },
            { val: m, label: 'Min' },
            { val: s, label: 'Sec' },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
                <span className="font-serif text-2xl font-medium text-white">
                  {String(val).padStart(2, '0')}
                </span>
              </div>
              <p className="text-[11px] text-white/40 uppercase tracking-wider mt-1.5">{label}</p>
            </div>
          ))}
        </div>

        <Link href="/products?sale=true">
          <Button
            size="xl"
            shimmer
            className="bg-white text-foreground hover:bg-white/90 border-transparent"
            rightIcon={<ArrowRight size={20} />}
          >
            Shop the Sale
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}

// ============================================================
// TRUST BADGES / MARQUEE
// ============================================================
const trustItems = [
  '✦ Free Returns Within 30 Days',
  '✦ Premium Quality Guaranteed',
  '✦ Ethical & Sustainable',
  '✦ Secure Payments via Razorpay',
  '✦ Curated Collections',
  '✦ Worldwide Shipping',
];

function TrustMarquee() {
  return (
    <div className="bg-background-secondary border-y border-border py-4 overflow-hidden">
      <div className="marquee-track gap-8">
        {[...trustItems, ...trustItems].map((item, i) => (
          <span
            key={i}
            className="inline-block text-sm text-foreground-secondary font-medium whitespace-nowrap px-6"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// NEWSLETTER SECTION
// ============================================================
function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { success, error } = useToast();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    const { error: err } = await supabase.from('subscribers').insert({ email: email.toLowerCase() });
    setIsLoading(false);
    if (err && err.code !== '23505') {
      error('Something went wrong', 'Please try again later.');
    } else {
      setSubmitted(true);
      success('You\'re subscribed!', 'Thank you for joining the Lumière community.');
    }
  };

  return (
    <section className="py-20 container-site">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-background-secondary rounded-3xl p-12 lg:p-20 text-center max-w-2xl mx-auto"
      >
        <p className="label-text mb-3">Stay Connected</p>
        <h2 className="font-serif text-section-sm lg:text-4xl mb-4">
          Join the Lumière Circle
        </h2>
        <p className="text-foreground-secondary mb-8 leading-relaxed">
          Be the first to discover new arrivals, exclusive offers, and curated style inspiration.
        </p>

        {submitted ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-14 h-14 bg-success rounded-full flex items-center justify-center">
              <Check size={28} className="text-white" />
            </div>
            <p className="font-medium text-foreground">You&apos;re subscribed!</p>
            <p className="text-sm text-foreground-secondary">Thank you for joining us.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <div className="flex-1 relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="w-full h-12 pl-10 pr-4 bg-white border border-border-strong rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <Button type="submit" size="md" isLoading={isLoading} shimmer className="h-12 px-6">
              Subscribe
            </Button>
          </form>
        )}
        <p className="text-xs text-foreground-muted mt-4">
          No spam, ever. Unsubscribe anytime.
        </p>
      </motion.div>
    </section>
  );
}

// ============================================================
// TESTIMONIALS
// ============================================================
const testimonials = [
  { name: 'Priya M.', city: 'Mumbai', rating: 5, text: 'The quality is absolutely stunning. Every piece feels considered and intentional. This is what luxury should feel like.', initials: 'PM' },
  { name: 'Arjun S.', city: 'Bangalore', rating: 5, text: 'Finally a brand that understands minimalism. Clean lines, perfect fit, and exceptional material. Highly recommend.', initials: 'AS' },
  { name: 'Kavya R.', city: 'Delhi', rating: 5, text: 'I&apos;ve been shopping here for a year. The curation is impeccable. Every new collection is better than the last.', initials: 'KR' },
  { name: 'Rohan T.', city: 'Chennai', rating: 5, text: 'Received my order within 2 days. The packaging was beautiful and the pieces were even better in person.', initials: 'RT' },
];

function TestimonialsSection() {
  return (
    <section className="py-20 container-site">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <p className="label-text mb-2">What our customers say</p>
        <h2 className="font-serif text-section-sm lg:text-section">Trusted by Thousands</h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="card card-hover p-6 space-y-4"
          >
            <div className="flex">
              {Array.from({ length: t.rating }).map((_, j) => (
                <span key={j} className="text-amber-400 text-sm">★</span>
              ))}
            </div>
            <p className="text-sm text-foreground-secondary leading-relaxed">&ldquo;{t.text}&rdquo;</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-foreground text-white text-xs font-semibold flex items-center justify-center">
                {t.initials}
              </div>
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-foreground-muted">{t.city}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function HomePage() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultSlides);
  const [isLoadingNew, setIsLoadingNew] = useState(true);
  const [isLoadingBest, setIsLoadingBest] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Categories
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
        .order('sort_order');
      if (cats) setCategories(cats as Category[]);

      // Hero slides
      const { data: slides } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .limit(4);
      if (slides && slides.length > 0) setHeroSlides(slides as HeroSlide[]);

      // New arrivals
      const { data: newProds } = await supabase
        .from('products')
        .select('*, images:product_images(id, image_url, sort_order, alt_text), category:categories(id, name, slug)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(8);
      setNewArrivals((newProds as unknown as Product[]) ?? []);
      setIsLoadingNew(false);

      // Best sellers (simplified: order by stock sold, fallback to newest)
      const { data: bestProds } = await supabase
        .from('products')
        .select('*, images:product_images(id, image_url, sort_order, alt_text), category:categories(id, name, slug)')
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(8);
      setBestSellers((bestProds as unknown as Product[]) ?? []);
      setIsLoadingBest(false);
    };

    fetchData();
  }, [supabase]);

  return (
    <div>
      <AnnouncementBar />
      <HeroSection slides={heroSlides} />
      <TrustMarquee />
      <FeaturedCategories categories={categories} />
      <ProductSection
        title="New Arrivals"
        subtitle="Just In"
        products={newArrivals}
        isLoading={isLoadingNew}
        viewAllHref="/products?sort=newest"
      />
      <PromoBanner />
      <ProductSection
        title="Best Sellers"
        subtitle="Most Loved"
        products={bestSellers}
        isLoading={isLoadingBest}
        viewAllHref="/products?sort=best_selling"
      />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  );
}
