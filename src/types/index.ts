export interface State {
  id: number;
  name: string;
  slug: string;
}

export interface City {
  id: number;
  name: string;
  slug: string;
  state_id: number;
  state_name?: string;
  state_slug?: string;
  latitude?: number;
  longitude?: number;
  business_count?: number;
  locality_count?: number;
  meta_title?: string;
  meta_description?: string;
  description?: string;
  is_popular?: boolean;
}

export interface Locality {
  id: number;
  name: string;
  slug: string;
  city_id: number;
  city_name?: string;
  city_slug?: string;
  latitude?: number;
  longitude?: number;
  pincode?: string;
  business_count?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  description?: string;
  icon?: string;
  image_url?: string;
  business_count?: number;
  meta_title?: string;
  meta_description?: string;
  children?: Category[];
}

export interface BusinessImage {
  id: number;
  business_id: number;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Review {
  id: number;
  business_id: number;
  user_name: string;
  rating: number;
  title?: string;
  comment: string;
  created_at: string;
  is_verified: boolean;
}

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  is_closed?: boolean;
}

export interface Business {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  categories?: Category[];
  city_id: number;
  city_name?: string;
  city_slug?: string;
  locality_id?: number;
  locality_name?: string;
  locality_slug?: string;
  state_name?: string;
  address?: string;
  pincode?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  logo_url?: string;
  cover_image_url?: string;
  images?: BusinessImage[];
  rating?: number;
  review_count?: number;
  reviews?: Review[];
  rating_distribution?: Record<number, number>;
  opening_hours?: string;
  business_hours?: BusinessHours[];
  established_year?: number;
  services?: string[];
  is_verified: boolean;
  is_featured: boolean;
  is_premium?: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at?: string;
  updated_at?: string;
  faqs?: FAQ[];
  related_businesses?: Business[];
  related_categories?: Category[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface SeoMeta {
  title: string;
  description: string;
  keywords?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: string;
  robots?: string;
  h1?: string;
  seo_content?: string;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface SearchParams {
  q?: string;
  city?: string;
  category?: string;
  locality?: string;
  rating?: string;
  sort?: string;
  page?: string;
  verified?: string;
}

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

export interface EnquiryForm {
  name: string;
  phone: string;
  email?: string;
  message: string;
  business_id: number;
}
