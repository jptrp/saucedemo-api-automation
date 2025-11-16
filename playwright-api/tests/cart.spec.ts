import { test, expect, APIRequestContext } from '@playwright/test';
import { createAPIContext, createAuthenticatedContext } from '../api/client';
import { endpoints } from '../api/endpoints';
import { cartSchema, cartListSchema, loginResponseSchema } from '../api/schema';

let apiContext: APIRequestContext;
let authToken: string;

test.describe('Cart API Tests', () => {
  test.beforeAll(async () => {
    // Create context and get auth token
    apiContext = await createAPIContext();
    
    // Login to get a token for authenticated requests
    const loginResponse = await apiContext.post(endpoints.auth.login, {
      data: {
        username: 'emilys',
        password: 'emilyspass',
      },
    });
    
    const loginData = loginResponseSchema.parse(await loginResponse.json());
    authToken = loginData.accessToken;
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('GET /carts - retrieve all carts', async () => {
    const response = await apiContext.get(endpoints.carts.base);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    
    // Validate response schema
    const validatedData = cartListSchema.parse(responseBody);
    
    expect(validatedData.carts).toBeDefined();
    expect(validatedData.carts.length).toBeGreaterThan(0);
    expect(validatedData.total).toBeGreaterThan(0);
  });

  test('GET /carts/:id - retrieve single cart by ID', async () => {
    const cartId = 1;
    const response = await apiContext.get(endpoints.carts.single(cartId));

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    const validatedCart = cartSchema.parse(responseBody);
    
    expect(validatedCart.id).toBe(cartId);
    expect(validatedCart.products).toBeDefined();
    expect(validatedCart.products.length).toBeGreaterThan(0);
    expect(validatedCart.total).toBeGreaterThan(0);
    expect(validatedCart.userId).toBeDefined();
  });

  test('GET /carts/:id - fail with non-existent cart ID', async () => {
    const response = await apiContext.get(endpoints.carts.single(99999));

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(404);
  });

  test('GET /carts/user/:userId - retrieve carts by user ID', async () => {
    const userId = 5;
    const response = await apiContext.get(endpoints.carts.user(userId));

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    const validatedData = cartListSchema.parse(responseBody);
    
    expect(validatedData.carts).toBeDefined();
    
    // Verify all carts belong to the requested user
    validatedData.carts.forEach(cart => {
      expect(cart.userId).toBe(userId);
    });
  });

  test('POST /carts/add - add a new cart', async () => {
    const newCart = {
      userId: 1,
      products: [
        {
          id: 1,
          quantity: 2,
        },
        {
          id: 5,
          quantity: 1,
        },
      ],
    };

    const response = await apiContext.post(endpoints.carts.add, {
      data: newCart,
    });

    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    const validatedCart = cartSchema.parse(responseBody);
    
    expect(validatedCart.products).toBeDefined();
    expect(validatedCart.userId).toBe(newCart.userId);
    expect(validatedCart.totalProducts).toBe(2);
  });

  test('POST /carts/add - add cart with single product', async () => {
    const newCart = {
      userId: 2,
      products: [
        {
          id: 10,
          quantity: 3,
        },
      ],
    };

    const response = await apiContext.post(endpoints.carts.add, {
      data: newCart,
    });

    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    const validatedCart = cartSchema.parse(responseBody);
    
    expect(validatedCart.totalProducts).toBe(1);
  });

  test('PUT /carts/:id - update an existing cart', async () => {
    const cartId = 1;
    const updateData = {
      merge: false,
      products: [
        {
          id: 1,
          quantity: 5,
        },
      ],
    };

    const response = await apiContext.put(endpoints.carts.update(cartId), {
      data: updateData,
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    const validatedCart = cartSchema.parse(responseBody);
    
    expect(validatedCart.id).toBe(cartId);
    expect(validatedCart.products).toBeDefined();
  });

  test('DELETE /carts/:id - delete a cart', async () => {
    const cartId = 1;
    const response = await apiContext.delete(endpoints.carts.delete(cartId));

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    
    // DummyJSON returns the deleted cart with isDeleted flag
    expect(responseBody.id).toBe(cartId);
    expect(responseBody.isDeleted).toBe(true);
  });

  test('Validate cart schema fields', async () => {
    const response = await apiContext.get(endpoints.carts.single(1));
    const responseBody = await response.json();
    const cart = cartSchema.parse(responseBody);
    
    // Verify all required fields are present
    expect(cart).toHaveProperty('id');
    expect(cart).toHaveProperty('products');
    expect(cart).toHaveProperty('total');
    expect(cart).toHaveProperty('discountedTotal');
    expect(cart).toHaveProperty('userId');
    expect(cart).toHaveProperty('totalProducts');
    expect(cart).toHaveProperty('totalQuantity');
    
    // Verify product structure
    expect(cart.products[0]).toHaveProperty('id');
    expect(cart.products[0]).toHaveProperty('title');
    expect(cart.products[0]).toHaveProperty('price');
    expect(cart.products[0]).toHaveProperty('quantity');
    expect(cart.products[0]).toHaveProperty('total');
  });

  test('Cart workflow - login, add to cart, retrieve', async () => {
    // Step 1: Login
    const loginResponse = await apiContext.post(endpoints.auth.login, {
      data: {
        username: 'emilys',
        password: 'emilyspass',
      },
    });
    
    expect(loginResponse.status()).toBe(200);
    const loginData = await loginResponse.json();
    const token = loginData.accessToken;

    // Step 2: Add to cart
    const addCartResponse = await apiContext.post(endpoints.carts.add, {
      data: {
        userId: loginData.id,
        products: [
          { id: 1, quantity: 1 },
        ],
      },
    });
    
    expect(addCartResponse.status()).toBe(201);
    const cartData = await addCartResponse.json();

    // Step 3: Retrieve a pre-existing cart (DummyJSON only allows retrieval of carts 1-30)
    const getCartResponse = await apiContext.get(endpoints.carts.single(1));
    
    expect(getCartResponse.status()).toBe(200);
    const retrievedCart = cartSchema.parse(await getCartResponse.json());
    expect(retrievedCart.id).toBe(1);
  });
});
