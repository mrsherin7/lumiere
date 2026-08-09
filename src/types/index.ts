export type UserRole = 'customer' | 'admin';
export type ProductStatus = 'draft' | 'active';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type FulfillmentStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type CouponType = 'percentage' | 'fixed';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  store_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  currency: string;
  currency_symbol: string;
  announcement_bar_text: string | null;
  announcement_bar_link: string | null;
  announcement_bar_color: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_twitter: string | null;
  social_tiktok: string | null;
  social_youtube: string | null;
  updated_at: string;
}

export interface SeoSettings {
  id: string;
  meta_title_template: string;
  default_meta_description: string | null;
  og_default_image_url: string | null;
  ga_tracking_id: string | null;
  fb_pixel_id: string | null;
  search_console_meta: string | null;
  robots_txt: string | null;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
  parent?: Category;
  children?: Category[];
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  price: number;
  sale_price: number | null;
  sale_start?: string | null;
  sale_end?: string | null;
  sku: string | null;
  stock_quantity: number;
  track_inventory: boolean;
  allow_backorders: boolean;
  status: ProductStatus;
  meta_title?: string | null;
  meta_description?: string | null;
  og_image_url?: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  // Relations
  category?: Partial<Category>;
  images?: ProductImage[];
  options?: ProductOption[];
  variants?: ProductVariant[];
  reviews?: Review[];
  avg_rating?: number;
  review_count?: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  alt_text: string | null;
}

export interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  sort_order: number;
  values?: ProductOptionValue[];
}

export interface ProductOptionValue {
  id: string;
  option_id: string;
  value: string;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string | null;
  price: number | null;
  stock_quantity: number;
  option_values: { option_name: string; value: string }[];
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: string | null;
  email: string;
  shipping_address: AddressSnapshot;
  billing_address: AddressSnapshot;
  shipping_method: string | null;
  shipping_cost: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  coupon_code: string | null;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  tracking_number: string | null;
  tracking_carrier: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  items?: OrderItem[];
  timeline?: OrderTimeline[];
  customer?: Profile;
}

export interface AddressSnapshot {
  full_name: string;
  phone?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrderItem {
  id: string;
  order_id: number;
  product_id: string | null;
  variant_id: string | null;
  title: string;
  variant_info: Record<string, string>;
  quantity: number;
  unit_price: number;
  line_total: number;
  product?: Product;
}

export interface OrderTimeline {
  id: string;
  order_id: number;
  status: string;
  note: string | null;
  created_by: string | null;
  created_at: string;
  creator?: Profile;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified: boolean;
  created_at: string;
  reviewer?: Partial<Profile>;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  min_order_amount: number | null;
  usage_limit: number | null;
  per_customer_limit: number | null;
  times_used: number;
  valid_from: string | null;
  valid_to: string | null;
  applicable_products: string[];
  applicable_categories: string[];
  is_active: boolean;
  created_at: string;
}

export interface HeroSlide {
  id: string;
  image_url: string;
  heading: string | null;
  subheading: string | null;
  cta_text: string | null;
  cta_link: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

// Cart
export interface CartItem {
  id: string; // cartItemId (UUID generated locally)
  product_id: string;
  variant_id: string | null;
  title: string;
  slug: string;
  image_url: string | null;
  price: number;
  quantity: number;
  variant_info: Record<string, string>;
  max_quantity: number;
}

export interface CartState {
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number;
  subtotal: number;
  total: number;
  itemCount: number;
}

// Razorpay
export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  created_at: number;
}

export interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Filters
export interface ProductFilters {
  category?: string;
  tag?: string;
  sale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  rating?: number;
  inStock?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'best_selling' | 'rating';
  search?: string;
  page?: number;
}

// Admin dashboard stats
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  avgOrderChange: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  product_id: string;
  title: string;
  units_sold: number;
  revenue: number;
}
