'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { MOCK_PRODUCTS } from '@/lib/mockData';
import type { Product } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_SEARCHES_KEY = 'lumiere-recent-searches';
const MAX_RECENT = 5;

const popularSearches = ['Headphones', 'Earpods', 'Smartwatch', 'Mechanical Keyboard', 'Ergonomic Mouse', 'Wireless Charger'];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const router = useRouter();
  const supabase = createClient();

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch { /* ignore */ }
    }
  }, []);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
      setActiveIndex(-1);
    }
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  const filterLocalProducts = useCallback((term: string) => {
    const q = term.toLowerCase().trim();
    return MOCK_PRODUCTS.filter((p) => {
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q) ?? false;
      const matchTags = p.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;
      const matchCategory = Boolean(p.category?.name?.toLowerCase().includes(q)) || Boolean(p.category?.slug?.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchTags || matchCategory;
    }).slice(0, 6);
  }, []);

  const performSearch = useCallback(async (term: string) => {
    if (!term.trim() || term.length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);

    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, slug, price, sale_price, sale_start, sale_end, images:product_images(image_url, sort_order)')
        .eq('status', 'active')
        .or(`title.ilike.%${term}%,description.ilike.%${term}%`)
        .limit(6);

      if (!error && data && data.length > 0) {
        setResults(data as unknown as Product[]);
      } else {
        setResults(filterLocalProducts(term));
      }
    } catch {
      setResults(filterLocalProducts(term));
    } finally {
      setIsSearching(false);
    }
  }, [supabase, filterLocalProducts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIndex(-1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(val), 250);
  };

  const executeSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    saveRecentSearch(searchTerm);
    onClose();
    router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        saveRecentSearch(results[activeIndex].title);
        onClose();
        router.push(`/products/${results[activeIndex].slug}`);
      } else if (query.trim()) {
        executeSearch(query);
      }
    }
  };

  const handleResultClick = (product: Product) => {
    saveRecentSearch(product.title);
    onClose();
    router.push(`/products/${product.slug}`);
  };

  const handleSuggestionClick = (term: string) => {
    setQuery(term);
    executeSearch(term);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Search panel */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative bg-white w-full shadow-modal"
          >
            {/* Input row */}
            <div className="container-site flex items-center gap-4 py-5">
              <Search size={20} className="text-foreground-secondary shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Search for headphones, smartwatches, keyboards, mice..."
                className="flex-1 text-lg text-foreground bg-transparent focus:outline-none placeholder:text-foreground-muted"
                aria-label="Search products"
              />
              {isSearching && (
                <span className="w-5 h-5 border-2 border-foreground-secondary border-t-transparent rounded-full animate-spin" />
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Results / suggestions */}
            <div className="container-site pb-6 max-h-[70vh] overflow-y-auto">
              {query.length >= 2 ? (
                results.length > 0 ? (
                  <div>
                    <p className="text-label mb-4">Results ({results.length})</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {results.map((product, i) => {
                        const img = product.images?.[0]?.image_url;
                        const onSale = product.sale_price !== null && product.sale_price !== undefined;
                        const price = onSale ? product.sale_price! : product.price;
                        return (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            onClick={() => handleResultClick(product)}
                            className={`flex items-center gap-3 p-3 rounded-xl hover:bg-background transition-colors cursor-pointer ${
                              i === activeIndex ? 'bg-background' : ''
                            }`}
                          >
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-background-secondary shrink-0">
                              {img ? (
                                <Image src={img} alt={product.title} fill sizes="56px" className="object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-100" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground line-clamp-1">{product.title}</p>
                              <p className="text-sm text-foreground-secondary mt-0.5">{formatCurrency(price)}</p>
                            </div>
                            <ArrowRight size={14} className="text-foreground-muted ml-auto shrink-0" />
                          </Link>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => executeSearch(query)}
                      className="mt-4 flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors font-medium cursor-pointer"
                    >
                      See all results for &quot;{query}&quot;
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ) : !isSearching ? (
                  <div className="py-6 text-center space-y-2">
                    <p className="text-sm text-foreground-secondary">
                      No results found for &quot;{query}&quot;
                    </p>
                    <button
                      onClick={() => executeSearch(query)}
                      className="text-sm text-accent font-medium hover:underline cursor-pointer"
                    >
                      Search all catalog for &quot;{query}&quot;
                    </button>
                  </div>
                ) : null
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {/* Recent */}
                  {recentSearches.length > 0 && (
                    <div>
                      <p className="text-label mb-4 flex items-center gap-2">
                        <Clock size={12} />
                        Recent
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            onClick={() => handleSuggestionClick(term)}
                            className="px-3 py-1.5 text-sm bg-background rounded-full text-foreground-secondary hover:text-foreground hover:bg-border transition-colors cursor-pointer border border-border"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular */}
                  <div>
                    <p className="text-label mb-4 flex items-center gap-2">
                      <TrendingUp size={12} />
                      Popular Tech Searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSuggestionClick(term)}
                          className="px-3 py-1.5 text-sm bg-background rounded-full text-foreground-secondary hover:text-foreground transition-colors cursor-pointer border border-border"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
