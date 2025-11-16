import { test, expect, APIRequestContext } from '@playwright/test';
import { createAPIContext } from '../api/client';
import { endpoints } from '../api/endpoints';
import { productSchema, productListSchema } from '../api/schema';

let apiContext: APIRequestContext;

test.describe('Inventory/Products API Tests', () => {
  test.beforeAll(async () => {
    apiContext = await createAPIContext();
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('GET /products - retrieve all products', async () => {
    const response = await apiContext.get(endpoints.products.base);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    
    // Validate response schema
    const validatedData = productListSchema.parse(responseBody);
    
    expect(validatedData.products).toBeDefined();
    expect(validatedData.products.length).toBeGreaterThan(0);
    expect(validatedData.total).toBeGreaterThan(0);
    expect(validatedData.skip).toBe(0);
    expect(validatedData.limit).toBe(30);
  });

  test('GET /products/:id - retrieve single product by ID', async () => {
    const productId = 1;
    const response = await apiContext.get(endpoints.products.single(productId));

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    const validatedProduct = productSchema.parse(responseBody);
    
    expect(validatedProduct.id).toBe(productId);
    expect(validatedProduct.title).toBeDefined();
    expect(validatedProduct.price).toBeGreaterThan(0);
    expect(validatedProduct.stock).toBeGreaterThanOrEqual(0);
    expect(validatedProduct.thumbnail).toContain('http');
  });

  test('GET /products/:id - retrieve different product', async () => {
    const productId = 5;
    const response = await apiContext.get(endpoints.products.single(productId));

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    const validatedProduct = productSchema.parse(responseBody);
    
    expect(validatedProduct.id).toBe(productId);
    expect(validatedProduct.category).toBeDefined();
    expect(validatedProduct.brand).toBeDefined();
  });

  test('GET /products/:id - fail with non-existent product ID', async () => {
    const response = await apiContext.get(endpoints.products.single(99999));

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(404);
  });

  test('GET /products/search - search for products', async () => {
    const searchTerm = 'phone';
    const response = await apiContext.get(`${endpoints.products.search}?q=${searchTerm}`);

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    const validatedData = productListSchema.parse(responseBody);
    
    expect(validatedData.products.length).toBeGreaterThan(0);
    
    // Verify search results contain the search term
    const hasSearchTerm = validatedData.products.some(product =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    expect(hasSearchTerm).toBeTruthy();
  });

  test('GET /products?limit - retrieve limited products', async () => {
    const limit = 5;
    const response = await apiContext.get(endpoints.products.limit(limit));

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    const validatedData = productListSchema.parse(responseBody);
    
    expect(validatedData.products.length).toBeLessThanOrEqual(limit);
    expect(validatedData.limit).toBe(limit);
  });

  test('GET /products?skip&limit - pagination test', async () => {
    const skip = 10;
    const limit = 5;
    const response = await apiContext.get(endpoints.products.skip(skip, limit));

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    const validatedData = productListSchema.parse(responseBody);
    
    expect(validatedData.skip).toBe(skip);
    expect(validatedData.limit).toBe(limit);
    expect(validatedData.products.length).toBeLessThanOrEqual(limit);
  });

  test('GET /products/categories - retrieve all product categories', async () => {
    const response = await apiContext.get(endpoints.products.categories);

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeGreaterThan(0);
    expect(responseBody).toContain('smartphones');
  });

  test('GET /products/category/:category - retrieve products by category', async () => {
    const category = 'smartphones';
    const response = await apiContext.get(endpoints.products.category(category));

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    const validatedData = productListSchema.parse(responseBody);
    
    expect(validatedData.products.length).toBeGreaterThan(0);
    
    // Verify all products belong to the requested category
    validatedData.products.forEach(product => {
      expect(product.category).toBe(category);
    });
  });

  test('Validate product schema fields', async () => {
    const response = await apiContext.get(endpoints.products.single(1));
    const responseBody = await response.json();
    const product = productSchema.parse(responseBody);
    
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
