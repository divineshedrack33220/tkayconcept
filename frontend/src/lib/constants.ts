export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const SITE_NAME = "TKAYKONCEPTS INT'L";
export const SITE_DESCRIPTION = "Creating products that inspire people to live boldly and purposefully.";
export const SITE_URL = "https://tkaykoncepts.com";

export const PRODUCT_CATEGORIES = [
  "books",
  "games",
  "apparel",
  "merchandise",
  "devotionals",
  "accessories",
] as const;

export const BLOG_CATEGORIES = [
  "faith",
  "purpose",
  "identity",
  "books",
  "culture",
  "games",
  "community",
] as const;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

export const CUSTOM_ORDER_STATUSES = [
  "pending",
  "quoted",
  "approved",
  "in_production",
  "completed",
  "delivered",
  "rejected",
] as const;

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/tkaykoncepts",
  facebook: "https://facebook.com/tkaykoncepts",
  twitter: "https://twitter.com/tkaykoncepts",
  whatsapp: "https://wa.me/1234567890",
  youtube: "https://youtube.com/@tkaykoncepts",
} as const;

export const ITEMS_PER_PAGE = 12;
