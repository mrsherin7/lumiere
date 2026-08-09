import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ProductDetailClient } from './ProductDetailClient';
import { getMockProductBySlug, getMockRelatedProducts } from '@/lib/mockData';
import type { Product } from '@/types';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  let product: Partial<Product> | null = null;

  try {
    const { data } = await supabase
      .from('products')
      .select('title, meta_title, meta_description, og_image_url, images:product_images(image_url)')
      .eq('slug', params.slug)
      .eq('status', 'active')
      .single();
    product = data as unknown as Partial<Product>;
  } catch {
    product = null;
  }

  if (!product) {
    product = getMockProductBySlug(params.slug);
  }

  if (!product) return {};

  const title = product.meta_title ?? product.title;
  const description = product.meta_description ?? '';
  const image = product.og_image_url ?? (product.images as { image_url: string }[])?.[0]?.image_url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : [],
    },
  };
}

export const revalidate = 60;

export default async function ProductPage({ params }: Props) {
  const supabase = createClient();
  let product: Product | null = null;
  let related: Product[] = [];

  try {
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(id, image_url, sort_order, alt_text),
        category:categories(id, name, slug),
        options:product_options(id, name, sort_order, values:product_option_values(id, value, sort_order)),
        variants:product_variants(*),
        reviews(id, rating, title, body, is_verified, created_at, reviewer:profiles(full_name, avatar_url))
      `)
      .eq('slug', params.slug)
      .eq('status', 'active')
      .single();

    if (data) product = data as unknown as Product;
  } catch {
    product = null;
  }

  if (!product) {
    product = getMockProductBySlug(params.slug);
  }

  if (!product) notFound();

  try {
    const { data: relatedData } = await supabase
      .from('products')
      .select('*, images:product_images(id, image_url, sort_order, alt_text), category:categories(id, name, slug)')
      .eq('category_id', product.category_id)
      .neq('id', product.id)
      .eq('status', 'active')
      .limit(4);
    if (relatedData && relatedData.length > 0) {
      related = relatedData as unknown as Product[];
    } else {
      related = getMockRelatedProducts(product.category_id, product.slug);
    }
  } catch {
    related = getMockRelatedProducts(product.category_id, product.slug);
  }

  return <ProductDetailClient product={product} related={related} />;
}
