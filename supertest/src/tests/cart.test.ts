import { describe, test, expect, beforeAll } from 'vitest';
import { api } from '../client';
import { endpoints } from '../endpoints';
import { cartSchema, cartListSchema, loginResponseSchema } from '../schemas';

let authToken: string;
let userId: number;

describe('Cart API Tests - Axios', () => {
  beforeAll(async () => {
    // Login to get a token for authenticated requests
    const loginResponse = await api.post(endpoints.auth.login, {
      username: 'emilys',
      password: 'emilyspass',
    });

    const loginData = loginResponseSchema.parse(loginResponse.data);
    authToken = loginData.accessToken;
    userId = loginData.id;
  });

  test('GET /carts - retrieve all carts', async () => {
    const response = await api.get(endpoints.carts.base);

    expect(response.status).toBe(200);

    // Validate response schema
    const validatedData = cartListSchema.parse(response.data);

    expect(validatedData.carts).toBeDefined();
    expect(validatedData.carts.length).toBeGreaterThan(0);
    expect(validatedData.total).toBeGreaterThan(0);
  });

  test('GET /carts/:id - retrieve single cart by ID', async () => {
    const cartId = 1;
    const response = await api.get(endpoints.carts.single(cartId));

    expect(response.status).toBe(200);

    const validatedCart = cartSchema.parse(response.data);

    expect(validatedCart.id).toBe(cartId);
    expect(validatedCart.products).toBeDefined();
    expect(validatedCart.products.length).toBeGreaterThan(0);
    expect(validatedCart.total).toBeGreaterThan(0);
    expect(validatedCart.userId).toBeDefined();
  });

  test('GET /carts/:id - fail with non-existent cart ID', async () => {
    try {
      await api.get(endpoints.carts.single(99999));
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });

  test('GET /carts/user/:userId - retrieve carts by user ID', async () => {
    const userId = 5;
    const response = await api.get(endpoints.carts.user(userId));

    expect(response.status).toBe(200);

    const validatedData = cartListSchema.parse(response.data);

    expect(validatedData.carts).toBeDefined();

    // Verify all carts belong to the requested user
    validatedData.carts.forEach((cart) => {
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

    const response = await api.post(endpoints.carts.add, newCart);

    expect(response.status).toBe(201);

    const validatedCart = cartSchema.parse(response.data);

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

    const response = await api.post(endpoints.carts.add, newCart);

    expect(response.status).toBe(201);

    const validatedCart = cartSchema.parse(response.data);

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

    const response = await api.put(endpoints.carts.update(cartId), updateData);

    expect(response.status).toBe(200);

    const validatedCart = cartSchema.parse(response.data);

    expect(validatedCart.id).toBe(cartId);
    expect(validatedCart.products).toBeDefined();
  });

  test('DELETE /carts/:id - delete a cart', async () => {
    const cartId = 1;
    const response = await api.delete(endpoints.carts.delete(cartId));

    expect(response.status).toBe(200);

    // DummyJSON returns the deleted cart with isDeleted flag
    expect(response.data.id).toBe(cartId);
    expect(response.data.isDeleted).toBe(true);
  });

  test('Validate cart schema fields', async () => {
    const response = await api.get(endpoints.carts.single(1));
    const cart = cartSchema.parse(response.data);

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
    const loginResponse = await api.post(endpoints.auth.login, {
      username: 'emilys',
      password: 'emilyspass',
    });

    expect(loginResponse.status).toBe(200);
    const loginData = loginResponse.data;
    const token = loginData.token;

    // Step 2: Add to cart
    const addCartResponse = await api.post(endpoints.carts.add, {
      userId: loginData.id,
      products: [{ id: 1, quantity: 1 }],
    });

    expect(addCartResponse.status).toBe(201);
    const cartData = addCartResponse.data;

    // Step 3: Retrieve the cart
    const getCartResponse = await api.get(endpoints.carts.single(cartData.id));

    expect(getCartResponse.status).toBe(200);
    const retrievedCart = cartSchema.parse(getCartResponse.data);
    expect(retrievedCart.id).toBe(cartData.id);
  });
});

describe('Cart API Tests - Supertest', () => {
  const request = require('supertest');
  const baseURL = process.env.API_BASE_URL || 'https://dummyjson.com';

  test('GET /carts - supertest retrieve all carts', async () => {
    const response = await request(baseURL)
      .get(endpoints.carts.base)
      .expect(200)
      .expect('Content-Type', /json/);

    const validatedData = cartListSchema.parse(response.body);
    expect(validatedData.carts.length).toBeGreaterThan(0);
  });

  test('GET /carts/:id - supertest retrieve single cart', async () => {
    const cartId = 1;
    const response = await request(baseURL)
      .get(endpoints.carts.single(cartId))
      .expect(200);

    const cart = cartSchema.parse(response.body);
    expect(cart.id).toBe(cartId);
  });

  test('POST /carts/add - supertest add new cart', async () => {
    const response = await request(baseURL)
      .post(endpoints.carts.add)
      .send({
        userId: 1,
        products: [{ id: 1, quantity: 1 }],
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.userId).toBe(1);
  });

  test('DELETE /carts/:id - supertest delete cart', async () => {
    const cartId = 1;
    const response = await request(baseURL)
      .delete(endpoints.carts.delete(cartId))
      .expect(200);

    expect(response.body.id).toBe(cartId);
    expect(response.body.isDeleted).toBe(true);
  });
});
