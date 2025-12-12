// Brand types
export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  is_active: number;
  product_count?: number;
}

// Product types (reusing from ProductDetail.tsx)
export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  alt_text: string;
  position: number;
  is_primary: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  value: string;
  price_adjustment: number;
  stock_quantity: number;
  sku: string;
}

export interface Product {
  id: number;
  category_id: number;
  brand_id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  sku: string;
  barcode: string;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: number;
  is_featured: number;
  weight: number | null;
  dimensions: string | null;
  created_at: string;
  updated_at: string;
  primary_image: string;
  images: ProductImage[];
  variants: ProductVariant[];
  category_name: string;
  category_slug: string;
  brand_name: string;
  brand_slug: string;
  avg_rating: number | null;
  review_count: number;
}