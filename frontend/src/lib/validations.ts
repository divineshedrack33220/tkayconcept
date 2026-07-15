import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().default(""),
  subject: z.string().min(1, "Subject is required"),
  type: z.enum(["general", "quote", "support", "partnership"]).default("general"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const addressSchema = z.object({
  label: z.string().default("Home"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required").default("US"),
  isDefault: z.boolean().default(false),
});

export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  shippingMethod: z.enum(["standard", "express"]),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  shortDescription: z.string().default(""),
  price: z.number().min(0.01, "Price must be greater than 0"),
  compareAtPrice: z.number().optional(),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).default([]),
  sku: z.string().default(""),
  stock: z.number().min(0).default(0),
  brand: z.enum(["TK Concepts", "Rooted Identity"]).default("TK Concepts"),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5),
  title: z.string().default(""),
  comment: z.string().min(10, "Review must be at least 10 characters"),
});

export const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().default(""),
  excerpt: z.string().min(1, "Excerpt is required"),
  category: z.enum(["faith", "purpose", "identity", "books", "culture", "games", "community"]),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published", "scheduled"]).default("draft"),
});

export const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
  description: z.string().default(""),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().min(0.01, "Value must be greater than 0"),
  minimumOrder: z.number().min(0).default(0),
  maximumDiscount: z.number().min(0).default(0),
  usageLimit: z.number().min(0).default(0),
  expiresAt: z.string().default(""),
  isActive: z.boolean().default(true),
});

export const customOrderSchema = z.object({
  productType: z.string().min(1, "Product type is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  size: z.string().default(""),
  color: z.string().default(""),
  additionalNotes: z.string().default(""),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type BlogInput = z.infer<typeof blogSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type CustomOrderInput = z.infer<typeof customOrderSchema>;
