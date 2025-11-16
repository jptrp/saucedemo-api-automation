import { test, expect, APIRequestContext } from '@playwright/test';
import { createAPIContext } from '../api/client';
import { endpoints } from '../api/endpoints';
import { loginResponseSchema, productSchema, cartSchema } from '../api/schema';

let apiContext: APIRequestContext;

test.describe('Checkout/End-to-End Flow Tests', () => {
  test.beforeAll(async () => {
    apiContext = await createAPIContext();
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('Complete E2E Checkout Flow - Login > Browse > Add to Cart', async () => {
    // Step 1: User Authentication
    const loginResponse = await apiContext.post(endpoints.auth.login, {
      data: {
        username: 'emilys',
        password: 'emilyspass',
      },
    });

    expect(loginResponse.status()).toBe(200);
    const loginData = loginResponseSchema.parse(await loginResponse.json());
    
    expect(loginData.token).toBeDefined();
    const authToken = loginData.token;
    const userId = loginData.id;

    // Step 2: Browse Products
    const productsResponse = await apiContext.get(endpoints.products.base);
    expect(productsResponse.status()).toBe(200);
    
    const productsData = await productsResponse.json();
    expect(productsData.products.length).toBeGreaterThan(0);

    // Step 3: Get Product Details
    const productId = productsData.products[0].id;
    const productResponse = await apiContext.get(endpoints.products.single(productId));
    expect(productResponse.status()).toBe(200);
    
    const product = productSchema.parse(await productResponse.json());
    expect(product.id).toBe(productId);

    // Step 4: Add to Cart
    const cartResponse = await apiContext.post(endpoints.carts.add, {
      data: {
        userId: userId,
        products: [
          {
            id: productId,
            quantity: 2,
          },
        ],
      },
    });

    expect(cartResponse.status()).toBe(201);
    const cartData = cartSchema.parse(await cartResponse.json());
    
    expect(cartData.userId).toBe(userId);
    expect(cartData.products.length).toBeGreaterThan(0);
    expect(cartData.total).toBeGreaterThan(0);
  });

  test('Multi-Product Checkout Flow', async () => {
    // Step 1: Login
    const loginResponse = await apiContext.post(endpoints.auth.login, {
      data: {
        username: 'michaelw',
        password: 'michaelwpass',
      },
    });

    const loginData = await loginResponse.json();
    const userId = loginData.id;

    // Step 2: Browse and select multiple products
    const productsResponse = await apiContext.get(endpoints.products.limit(10));
    const productsData = await productsResponse.json();

    const selectedProducts = productsData.products.slice(0, 3).map((p: any) => ({
      id: p.id,
      quantity: Math.floor(Math.random() * 3) + 1,
    }));

    // Step 3: Add multiple items to cart
    const cartResponse = await apiContext.post(endpoints.carts.add, {
      data: {
        userId: userId,
        products: selectedProducts,
      },
    });

    expect(cartResponse.status()).toBe(201);
    const cartData = cartSchema.parse(await cartResponse.json());
    
    expect(cartData.products.length).toBe(3);
    expect(cartData.totalProducts).toBe(3);
    expect(cartData.total).toBeGreaterThan(0);
    expect(cartData.discountedTotal).toBeLessThanOrEqual(cartData.total);
  });

  test('Search > Select > Add to Cart Flow', async () => {
    // Step 1: Login
    const loginResponse = await apiContext.post(endpoints.auth.login, {
      data: {
        username: 'emilys',
        password: 'emilyspass',
      },
    });

    const loginData = await loginResponse.json();

    // Step 2: Search for specific product
    const searchTerm = 'phone';
    const searchResponse = await apiContext.get(
      `${endpoints.products.search}?q=${searchTerm}`
    );
    
    expect(searchResponse.status()).toBe(200);
    const searchData = await searchResponse.json();
    expect(searchData.products.length).toBeGreaterThan(0);

    // Step 3: Select first search result
    const selectedProduct = searchData.products[0];
    const productResponse = await apiContext.get(
      endpoints.products.single(selectedProduct.id)
    );
    
    const product = productSchema.parse(await productResponse.json());

    // Step 4: Add to cart
    const cartResponse = await apiContext.post(endpoints.carts.add, {
      data: {
        userId: loginData.id,
        products: [
          {
            id: product.id,
            quantity: 1,
          },
        ],
      },
    });

    expect(cartResponse.status()).toBe(201);
    const cartData = await cartResponse.json();
    expect(cartData.products[0].id).toBe(product.id);
  });

  test('Category Browse > Add to Cart Flow', async () => {
    // Step 1: Login
    const loginResponse = await apiContext.post(endpoints.auth.login, {
      data: {
        username: 'emilys',
        password: 'emilyspass',
      },
    });

    const loginData = await loginResponse.json();

    // Step 2: Get categories
    const categoriesResponse = await apiContext.get(endpoints.products.categories);
    expect(categoriesResponse.status()).toBe(200);
    
    const categories = await categoriesResponse.json();
    expect(categories.length).toBeGreaterThan(0);

    // Step 3: Browse products in first category
    const category = categories[0];
    const categoryProductsResponse = await apiContext.get(
      endpoints.products.category(category)
    );
    
    expect(categoryProductsResponse.status()).toBe(200);
    const categoryProducts = await categoryProductsResponse.json();

    // Step 4: Add product from category to cart
    const productToAdd = categoryProducts.products[0];
    const cartResponse = await apiContext.post(endpoints.carts.add, {
      data: {
        userId: loginData.id,
        products: [
          {
            id: productToAdd.id,
            quantity: 1,
          },
        ],
      },
    });

    expect(cartResponse.status()).toBe(201);
  });

  test('Update Cart Quantity Flow', async () => {
    // Step 1: Login and create cart
    const loginResponse = await apiContext.post(endpoints.auth.login, {
      data: {
        username: 'emilys',
        password: 'emilyspass',
      },
    });

    const loginData = await loginResponse.json();

    // Step 2: Add to cart
    const cartResponse = await apiContext.post(endpoints.carts.add, {
      data: {
        userId: loginData.id,
        products: [
          { id: 1, quantity: 1 },
        ],
      },
    });

    const cartData = await cartResponse.json();
    const cartId = cartData.id;
    const originalTotal = cartData.total;

    // Step 3: Update cart quantity
    const updateResponse = await apiContext.put(endpoints.carts.update(cartId), {
      data: {
        merge: false,
        products: [
          { id: 1, quantity: 5 },
        ],
      },
    });

    expect(updateResponse.status()).toBe(200);
    const updatedCart = await updateResponse.json();
    
    // Verify quantity was updated
    expect(updatedCart.id).toBe(cartId);
  });

  test('Complete Flow with Error Handling', async () => {
    // Step 1: Attempt login with invalid credentials
    const invalidLoginResponse = await apiContext.post(endpoints.auth.login, {
      data: {
        username: 'invalid',
        password: 'invalid',
      },
    });

    expect(invalidLoginResponse.status()).toBe(400);

    // Step 2: Successful login
    const validLoginResponse = await apiContext.post(endpoints.auth.login, {
      data: {
        username: 'emilys',
        password: 'emilyspass',
      },
    });

    expect(validLoginResponse.status()).toBe(200);
    const loginData = await validLoginResponse.json();

    // Step 3: Attempt to get non-existent product
    const invalidProductResponse = await apiContext.get(
      endpoints.products.single(99999)
    );
    
    expect(invalidProductResponse.status()).toBe(404);

    // Step 4: Get valid product and add to cart
    const validProductResponse = await apiContext.get(endpoints.products.single(1));
    expect(validProductResponse.status()).toBe(200);

    const product = await validProductResponse.json();

    const cartResponse = await apiContext.post(endpoints.carts.add, {
      data: {
        userId: loginData.id,
        products: [
          { id: product.id, quantity: 1 },
        ],
      },
    });

    expect(cartResponse.status()).toBe(201);
  });

  test('Verify Cart Total Calculation', async () => {
    // Step 1: Get product price
    const productResponse = await apiContext.get(endpoints.products.single(1));
    const product = productSchema.parse(await productResponse.json());
    const productPrice = product.price;

    // Step 2: Login
    const loginResponse = await apiContext.post(endpoints.auth.login, {
      data: {
        username: 'emilys',
        password: 'emilyspass',
      },
    });

    const loginData = await loginResponse.json();

    // Step 3: Add multiple quantities to cart
    const quantity = 3;
    const cartResponse = await apiContext.post(endpoints.carts.add, {
      data: {
        userId: loginData.id,
        products: [
          { id: product.id, quantity: quantity },
        ],
      },
    });

    const cartData = cartSchema.parse(await cartResponse.json());
    
    // Verify total calculations
    expect(cartData.total).toBeGreaterThan(0);
    expect(cartData.discountedTotal).toBeLessThanOrEqual(cartData.total);
    expect(cartData.totalQuantity).toBe(quantity);
  });
});
