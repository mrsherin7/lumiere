-- ============================================================
-- LUMIÈRE E-COMMERCE PLATFORM — COMPLETE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE product_status AS ENUM ('draft', 'active');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE fulfillment_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed');

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. SITE SETTINGS (single row)
-- ============================================================
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name TEXT NOT NULL DEFAULT 'Lumière',
  logo_url TEXT,
  favicon_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  currency TEXT NOT NULL DEFAULT 'INR',
  currency_symbol TEXT NOT NULL DEFAULT '₹',
  announcement_bar_text TEXT,
  announcement_bar_link TEXT,
  announcement_bar_color TEXT DEFAULT '#1A1A1A',
  social_instagram TEXT,
  social_facebook TEXT,
  social_twitter TEXT,
  social_tiktok TEXT,
  social_youtube TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO site_settings (id) VALUES (uuid_generate_v4());

-- ============================================================
-- 3. SEO SETTINGS
-- ============================================================
CREATE TABLE seo_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meta_title_template TEXT NOT NULL DEFAULT '{page_title} | Lumière',
  default_meta_description TEXT,
  og_default_image_url TEXT,
  ga_tracking_id TEXT,
  fb_pixel_id TEXT,
  search_console_meta TEXT,
  robots_txt TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO seo_settings (id) VALUES (uuid_generate_v4());

-- ============================================================
-- 4. PAGE SEO
-- ============================================================
CREATE TABLE page_seo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_slug TEXT UNIQUE NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  og_image_url TEXT
);

-- ============================================================
-- 5. CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. PRODUCTS
-- ============================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(10,2),
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  sku TEXT UNIQUE,
  stock_quantity INT NOT NULL DEFAULT 0,
  track_inventory BOOLEAN NOT NULL DEFAULT TRUE,
  allow_backorders BOOLEAN NOT NULL DEFAULT FALSE,
  status product_status NOT NULL DEFAULT 'draft',
  meta_title TEXT,
  meta_description TEXT,
  og_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. PRODUCT IMAGES
-- ============================================================
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  alt_text TEXT
);

-- ============================================================
-- 8. PRODUCT OPTIONS (e.g., "Size", "Color")
-- ============================================================
CREATE TABLE product_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

-- ============================================================
-- 9. PRODUCT OPTION VALUES (e.g., "XL", "Red")
-- ============================================================
CREATE TABLE product_option_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_id UUID NOT NULL REFERENCES product_options(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

-- ============================================================
-- 10. PRODUCT VARIANTS
-- ============================================================
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT,
  price NUMERIC(10,2),
  stock_quantity INT NOT NULL DEFAULT 0,
  option_values JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 11. ADDRESSES
-- ============================================================
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 12. ORDERS
-- ============================================================
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  order_number TEXT UNIQUE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  shipping_address JSONB NOT NULL DEFAULT '{}',
  billing_address JSONB NOT NULL DEFAULT '{}',
  shipping_method TEXT,
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  coupon_code TEXT,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  fulfillment_status fulfillment_status NOT NULL DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  tracking_number TEXT,
  tracking_carrier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 13. ORDER ITEMS
-- ============================================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  variant_info JSONB NOT NULL DEFAULT '{}',
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  line_total NUMERIC(10,2) NOT NULL
);

-- ============================================================
-- 14. ORDER TIMELINE
-- ============================================================
CREATE TABLE order_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 15. REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 16. COUPONS
-- ============================================================
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  type coupon_type NOT NULL DEFAULT 'percentage',
  value NUMERIC(10,2) NOT NULL,
  min_order_amount NUMERIC(10,2),
  usage_limit INT,
  per_customer_limit INT,
  times_used INT NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  applicable_products UUID[] DEFAULT '{}',
  applicable_categories UUID[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 17. SUBSCRIBERS
-- ============================================================
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 18. HERO SLIDES
-- ============================================================
CREATE TABLE hero_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  heading TEXT,
  subheading TEXT,
  cta_text TEXT,
  cta_link TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 19. WISHLIST
-- ============================================================
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- ============================================================
-- 20. MEDIA
-- ============================================================
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  size BIGINT,
  mime_type TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-generate order_number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || (10000 + NEW.id)::TEXT;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Decrement stock on order creation
CREATE OR REPLACE FUNCTION decrement_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrement variant stock if variant exists
  IF NEW.variant_id IS NOT NULL THEN
    UPDATE product_variants
    SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity)
    WHERE id = NEW.variant_id;
  -- Otherwise decrement product stock
  ELSIF NEW.product_id IS NOT NULL THEN
    UPDATE products
    SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity)
    WHERE id = NEW.product_id AND track_inventory = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_stock
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION decrement_stock_on_order();

-- Increment coupon times_used
CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.coupon_code IS NOT NULL THEN
    UPDATE coupons SET times_used = times_used + 1 WHERE code = NEW.coupon_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_coupon_usage
  AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION increment_coupon_usage();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT USING (is_admin());

-- SITE SETTINGS (public read, admin write)
CREATE POLICY "Public can read site settings" ON site_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admins can update site settings" ON site_settings FOR UPDATE USING (is_admin());

-- SEO SETTINGS (public read, admin write)
CREATE POLICY "Public can read seo settings" ON seo_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage seo settings" ON seo_settings FOR ALL USING (is_admin());

-- PAGE SEO
CREATE POLICY "Public can read page seo" ON page_seo FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage page seo" ON page_seo FOR ALL USING (is_admin());

-- CATEGORIES (public read, admin write)
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (is_admin());

-- PRODUCTS (public read active, admin all)
CREATE POLICY "Public can read active products" ON products FOR SELECT USING (status = 'active' OR is_admin());
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (is_admin());

-- PRODUCT IMAGES
CREATE POLICY "Public can read product images" ON product_images FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage product images" ON product_images FOR ALL USING (is_admin());

-- PRODUCT OPTIONS
CREATE POLICY "Public can read product options" ON product_options FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage product options" ON product_options FOR ALL USING (is_admin());

-- PRODUCT OPTION VALUES
CREATE POLICY "Public can read option values" ON product_option_values FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage option values" ON product_option_values FOR ALL USING (is_admin());

-- PRODUCT VARIANTS
CREATE POLICY "Public can read variants" ON product_variants FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage variants" ON product_variants FOR ALL USING (is_admin());

-- ADDRESSES
CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all addresses" ON addresses FOR SELECT USING (is_admin());

-- ORDERS
CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage all orders" ON orders FOR ALL USING (is_admin());

-- ORDER ITEMS
CREATE POLICY "Users can read own order items" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR is_admin())));
CREATE POLICY "Authenticated can insert order items" ON order_items FOR INSERT WITH CHECK (TRUE);

-- ORDER TIMELINE
CREATE POLICY "Users can read own order timeline" ON order_timeline FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_timeline.order_id AND (orders.user_id = auth.uid() OR is_admin())));
CREATE POLICY "Admins can manage timeline" ON order_timeline FOR ALL USING (is_admin());

-- REVIEWS (public read, customers create, admins delete)
CREATE POLICY "Public can read reviews" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete reviews" ON reviews FOR DELETE USING (is_admin());

-- COUPONS (public read active, admin all)
CREATE POLICY "Public can read active coupons" ON coupons FOR SELECT USING (is_active = TRUE OR is_admin());
CREATE POLICY "Admins can manage coupons" ON coupons FOR ALL USING (is_admin());

-- SUBSCRIBERS (admin only)
CREATE POLICY "Authenticated can subscribe" ON subscribers FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins can read subscribers" ON subscribers FOR SELECT USING (is_admin());

-- HERO SLIDES (public read, admin write)
CREATE POLICY "Public can read hero slides" ON hero_slides FOR SELECT USING (is_active = TRUE OR is_admin());
CREATE POLICY "Admins can manage hero slides" ON hero_slides FOR ALL USING (is_admin());

-- WISHLIST
CREATE POLICY "Users can manage own wishlist" ON wishlist FOR ALL USING (auth.uid() = user_id);

-- MEDIA
CREATE POLICY "Public can read media" ON media FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage media" ON media FOR ALL USING (is_admin());

-- ============================================================
-- STORAGE BUCKETS (run separately in Supabase dashboard or use API)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', TRUE);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('brand-assets', 'brand-assets', TRUE);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('media-library', 'media-library', TRUE);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', FALSE);

-- ============================================================
-- SEED DATA — Demo categories, products & admin account
-- ============================================================
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Audio & Headphones', 'audio', 'High-fidelity studio headphones, wireless earpods, and speakers', 1),
  ('Smartwatches & Wearables', 'wearables', 'OLED smartwatches, fitness trackers, and premium bands', 2),
  ('Keyboards & Mice', 'keyboards-mice', 'Custom mechanical keyboards, precision ergonomic mice, and desk mats', 3),
  ('Desk Setup & Docks', 'desk-essentials', 'Wireless charging stands, USB-C hubs, and desk organization', 4);

-- SEED ADMIN CREDENTIALS (admin@lumiere.com / Lumiere@2026)
DO $$
DECLARE
  admin_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@lumiere.com') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@lumiere.com',
      crypt('Lumiere@2026', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Lumière Admin"}',
      'authenticated',
      'authenticated',
      NOW(),
      NOW()
    );
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (
    admin_user_id,
    'admin@lumiere.com',
    'Lumière Admin',
    'admin',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    full_name = 'Lumière Admin',
    updated_at = NOW();
END $$;
