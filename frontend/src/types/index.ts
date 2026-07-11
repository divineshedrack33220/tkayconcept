export interface User {
  _id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "customer" | "content_manager" | "inventory_manager" | "support" | "admin" | "super_admin";
  addresses: Address[];
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id?: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductVariantOption {
  value: string;
  price?: number;
  sku?: string;
  stock: number;
  image?: string;
}

export interface ProductVariant {
  name: string;
  options: ProductVariantOption[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  category: Category;
  tags: string[];
  images: ProductImage[];
  videos: { url: string; title: string }[];
  variants: ProductVariant[];
  sku: string;
  stock: number;
  lowStockThreshold: number;
  weight: number;
  dimensions: { length: number; width: number; height: number };
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  brand: string;
  seoTitle: string;
  seoDescription: string;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parent?: string;
  isActive: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  children?: Category[];
}

export interface OrderItem {
  product: Product;
  name: string;
  price: number;
  quantity: number;
  variant?: { name: string; value: string };
  image: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: User;
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  author: User;
  category: string;
  tags: string[];
  status: "draft" | "published" | "scheduled";
  publishedAt: string;
  readTime: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  product: string;
  user: User;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpful: number;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  minimumOrder: number;
  maximumDiscount: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: { name: string; value: string };
}

export interface CustomOrder {
  _id: string;
  user: string;
  productType: string;
  design: string;
  quantity: number;
  description: string;
  size: string;
  color: string;
  additionalNotes: string;
  status: "pending" | "quoted" | "approved" | "in_production" | "completed" | "delivered" | "rejected";
  quotedPrice: number;
  adminNotes: string;
  proofUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  _id: string;
  customerName: string;
  customerPhoto: string;
  rating: number;
  content: string;
  product?: Product;
  isFeatured: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  type: "general" | "quote" | "support" | "partnership";
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
}

export interface HomepageSection {
  _id: string;
  sectionType: string;
  title: string;
  subtitle: string;
  content: string;
  image: string;
  video: string;
  buttonText: string;
  buttonLink: string;
  products: string[];
  testimonials: string[];
  sortOrder: number;
  isActive: boolean;
  settings: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
