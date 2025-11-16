import { z } from 'zod';

/**
 * Login Request Schema
 */
export const loginRequestSchema = z.object({
  username: z.string(),
  password: z.string(),
  expiresInMins: z.number().optional(),
});

/**
 * Login Response Schema
 */
export const loginResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  gender: z.string(),
  image: z.string().url(),
  token: z.string(),
  refreshToken: z.string(),
});

/**
 * Product Schema
 */
export const productSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  discountPercentage: z.number(),
  rating: z.number(),
  stock: z.number(),
  brand: z.string(),
  category: z.string(),
  thumbnail: z.string().url(),
  images: z.array(z.string().url()),
});

/**
 * Product List Response Schema
 */
export const productListSchema = z.object({
  products: z.array(productSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

/**
 * Cart Product Schema
 */
export const cartProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.number(),
  quantity: z.number(),
  total: z.number(),
  discountPercentage: z.number(),
  discountedPrice: z.number(),
  thumbnail: z.string().optional(),
});

/**
 * Cart Schema
 */
export const cartSchema = z.object({
  id: z.number(),
  products: z.array(cartProductSchema),
  total: z.number(),
  discountedTotal: z.number(),
  userId: z.number(),
  totalProducts: z.number(),
  totalQuantity: z.number(),
});

/**
 * Cart List Response Schema
 */
export const cartListSchema = z.object({
  carts: z.array(cartSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

/**
 * Add to Cart Request Schema
 */
export const addToCartRequestSchema = z.object({
  userId: z.number(),
  products: z.array(
    z.object({
      id: z.number(),
      quantity: z.number(),
    })
  ),
});

/**
 * User Schema
 */
export const userSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  maidenName: z.string().optional(),
  age: z.number(),
  gender: z.string(),
  email: z.string().email(),
  phone: z.string(),
  username: z.string(),
  birthDate: z.string(),
  image: z.string().url(),
  bloodGroup: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  eyeColor: z.string().optional(),
  hair: z.object({
    color: z.string(),
    type: z.string(),
  }).optional(),
});

/**
 * Error Response Schema
 */
export const errorResponseSchema = z.object({
  message: z.string(),
});

// Type exports
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type Product = z.infer<typeof productSchema>;
export type ProductList = z.infer<typeof productListSchema>;
export type Cart = z.infer<typeof cartSchema>;
export type CartList = z.infer<typeof cartListSchema>;
export type AddToCartRequest = z.infer<typeof addToCartRequestSchema>;
export type User = z.infer<typeof userSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;