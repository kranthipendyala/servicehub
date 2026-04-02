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
  services_by_category?: ServiceCategory[];
  service_areas?: { city_id: number; city_name: string; city_slug: string }[];
  categories?: { id: number; name: string; slug: string; icon?: string; is_primary?: number }[];
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

export interface ServiceCategory {
  category_id: number;
  category_name: string;
  category_slug: string;
  category_icon?: string;
  services: Service[];
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

// ---- Marketplace Types ----

export interface Service {
  id: number;
  business_id: number;
  category_id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  base_price: number;
  discounted_price?: number;
  price_unit: 'fixed' | 'per_hour' | 'per_sqft' | 'per_unit';
  duration_minutes: number;
  image?: string;
  is_active: boolean;
  sort_order: number;
  category_name?: string;
  category_slug?: string;
  business_name?: string;
  business_slug?: string;
  variants?: ServiceVariant[];
}

export interface ServiceVariant {
  id: number;
  service_id: number;
  name: string;
  price: number;
  duration_minutes?: number;
  is_active: boolean;
}

export interface Address {
  id: number;
  user_id: number;
  label: string;
  full_name?: string;
  phone?: string;
  address_line1: string;
  address_line2?: string;
  city_id?: number;
  city_name?: string;
  locality_id?: number;
  locality_name?: string;
  state_id?: number;
  state_name?: string;
  pin_code: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
}

export interface BookingItem {
  id?: number;
  service_id: number;
  variant_id?: number;
  service_name: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export type BookingStatus = 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'partially_refunded' | 'refunded' | 'failed';

export interface Booking {
  id: number;
  booking_number: string;
  customer_id: number;
  vendor_id: number;
  business_id: number;
  address_id?: number;
  service_address?: string;
  scheduled_date: string;
  scheduled_time: string;
  status: BookingStatus;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  commission_rate: number;
  commission_amount: number;
  vendor_payout_amount: number;
  payment_status: PaymentStatus;
  payment_method?: string;
  cancellation_reason?: string;
  cancelled_by?: 'customer' | 'vendor' | 'admin';
  customer_notes?: string;
  vendor_notes?: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  vendor_name?: string;
  vendor_phone?: string;
  business_name?: string;
  business_slug?: string;
  items?: BookingItem[];
  address?: Address;
}

export interface PaymentOrder {
  razorpay_order_id: string;
  amount: number;
  currency: string;
  booking_number: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface CommissionRule {
  id: number;
  category_id?: number;
  category_name?: string;
  commission_percentage: number;
  min_commission: number;
  is_active: boolean;
}

export interface CreateBookingRequest {
  business_id: number;
  items: { service_id: number; variant_id?: number; quantity?: number }[];
  scheduled_date: string;
  scheduled_time: string;
  address_id?: number;
  service_address?: string;
  customer_notes?: string;
  discount_amount?: number;
}

export interface VendorStats {
  total_bookings: number;
  pending: number;
  completed: number;
  today: number;
  total_earnings: number;
}
