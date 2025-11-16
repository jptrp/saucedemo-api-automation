import { describe, test, expect } from 'vitest';
import { api } from '../client';
import { endpoints } from '../endpoints';
import { productSchema, productListSchema } from '../schemas';

describe('Inventory/Products API Tests - Axios', () => {
  test('GET /products - retrieve all products', async () => {
    const response = await api.get(endpoints.products.base);

    expect(response.status).toBe(200);

    // Validate response schema
    const validatedData = productListSchema.parse(response.data);

    expect(validatedData.products).toBeDefined();
    expect(validatedData.products.length).toBeGreaterThan(0);
    expect(validatedData.total).toBeGreaterThan(0);
    expect(validatedData.skip).toBe(0);
    expect(validatedData.limit).toBe(30);
  });

  test('GET /products/:id - retrieve single product by ID', async () => {
    const productId = 1;
    const response = await api.get(endpoints.products.single(productId));

    expect(response.status).toBe(200);

    const validatedProduct = productSchema.parse(response.data);

    expect(validatedProduct.id).toBe(productId);
    expect(validatedProduct.title).toBeDefined();
    expect(validatedProduct.price).toBeGreaterThan(0);
    expect(validatedProduct.stock).toBeGreaterThanOrEqual(0);
    expect(validatedProduct.thumbnail).toContain('http');
  });

  test('GET /products/:id - retrieve different product', async () => {
    const productId = 5;
    const response = await api.get(endpoints.products.single(productId));

    expect(response.status).toBe(200);

    const validatedProduct = productSchema.parse(response.data);

    expect(validatedProduct.id).toBe(productId);
    expect(validatedProduct.category).toBeDefined();
    expect(validatedProduct.brand).toBeDefined();
  });

  test('GET /products/:id - fail with non-existent product ID', async () => {
    try {
      await api.get(endpoints.products.single(99999));
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });

  test('GET /products/search - search for products', async () => {
    const searchTerm = 'phone';
    const response = await api.get(`${endpoints.products.search}?q=${searchTerm}`);

    expect(response.status).toBe(200);

    const validatedData = productListSchema.parse(response.data);

    expect(validatedData.products.length).toBeGreaterThan(0);

    // Verify search results contain the search term
    const hasSearchTerm = validatedData.products.some(
      (product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    expect(hasSearchTerm).toBeTruthy();
  });

  test('GET /products?limit - retrieve limited products', async () => {
    const limit = 5;
    const response = await api.get(endpoints.products.limit(limit));

    expect(response.status).toBe(200);

    const validatedData = productListSchema.parse(response.data);

    expect(validatedData.products.length).toBeLessThanOrEqual(limit);
    expect(validatedData.limit).toBe(limit);
  });

  test('GET /products?skip&limit - pagination test', async () => {
    const skip = 10;
    const limit = 5;
    const response = await api.get(endpoints.products.skip(skip, limit));

    expect(response.status).toBe(200);

    const validatedData = productListSchema.parse(response.data);

    expect(validatedData.skip).toBe(skip);
    expect(validatedData.limit).toBe(limit);
    expect(validatedData.products.length).toBeLessThanOrEqual(limit);
  });

  test('GET /products/categories - retrieve all product categories', async () => {
    const response = await api.get(endpoints.products.categories);

    expect(response.status).toBe(200);

    expect(Array.isArray(response.data)).toBeTruthy();
    expect(response.data.length).toBeGreaterThan(0);
    // Categories are now objects with slug, name, url properties
    const hasSmartphones = response.data.some((cat: any) => cat.slug === 'smartphones');
    expect(hasSmartphones).toBeTruthy();
  });

  test('GET /products/category/:category - retrieve products by category', async () => {
    const category = 'smartphones';
    const response = await api.get(endpoints.products.category(category));

    expect(response.status).toBe(200);

    const validatedData = productListSchema.parse(response.data);

    expect(validatedData.products.length).toBeGreaterThan(0);

    // Verify all products belong to the requested category
    validatedData.products.forEach((product) => {
      expect(product.category).toBe(category);
    });
  });

  test('Validate product schema fields', async () => {
    const response = await api.get(endpoints.products.single(1));
    const product = productSchema.parse(response.data);

    // Verify all required fields are present
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('title');
    expect(product).toHaveProperty('description');
    expect(product).toHaveProperty('price');
    expect(product).toHaveProperty('discountPercentage');
    expect(product).toHaveProperty('rating');
    expect(product).toHaveProperty('stock');
    expect(product).toHaveProperty('brand');
    expect(product).toHaveProperty('category');
    expect(product).toHaveProperty('thumbnail');
    expect(product).toHaveProperty('images');

    // Verify data types
    expect(typeof product.id).toBe('number');
    expect(typeof product.title).toBe('string');
    expect(typeof product.price).toBe('number');
    expect(Array.isArray(product.images)).toBeTruthy();
  });
});

describe('Inventory/Products API Tests - Supertest', () => {
  const request = require('supertest');
  const baseURL = process.env.API_BASE_URL || 'https://dummyjson.com';

  test('GET /products - supertest retrieve all products', async () => {
    const response = await request(baseURL)
      .get(endpoints.products.base)
      .expect(200)
      .expect('Content-Type', /json/);

    const validatedData = productListSchema.parse(response.body);
    expect(validatedData.products.length).toBeGreaterThan(0);
  });

  test('GET /products/:id - supertest retrieve single product', async () => {
    const productId = 1;
    const response = await request(baseURL)
      .get(endpoints.products.single(productId))
      .expect(200);

    const product = productSchema.parse(response.body);
    expect(product.id).toBe(productId);
  });

  test('GET /products/search - supertest search products', async () => {
    const response = await request(baseURL)
      .get(`${endpoints.products.search}?q=phone`)
      .expect(200);

    expect(response.body.products).toBeDefined();
    expect(response.body.products.length).toBeGreaterThan(0);
  });

  test('GET /products/:id - supertest non-existent product', async () => {
    await request(baseURL)
      .get(endpoints.products.single(99999))
      .expect(404);
  });
});
