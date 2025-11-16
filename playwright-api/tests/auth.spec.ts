import { test, expect, APIRequestContext } from '@playwright/test';
import { createAPIContext } from '../api/client';
import { endpoints } from '../api/endpoints';
import { loginResponseSchema, errorResponseSchema } from '../api/schema';

let apiContext: APIRequestContext;

test.describe('Authentication API Tests', () => {
  test.beforeAll(async () => {
    apiContext = await createAPIContext();
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('POST /auth/login - successful login with valid credentials', async () => {
    const response = await apiContext.post(endpoints.auth.login, {
      data: {
        username: 'emilys',
        password: 'emilyspass',
        expiresInMins: 30,
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    
    // Validate response schema using Zod
    const validatedData = loginResponseSchema.parse(responseBody);
    
    expect(validatedData.accessToken).toBeDefined();
    expect(validatedData.accessToken.length).toBeGreaterThan(0);
    expect(validatedData.refreshToken).toBeDefined();
    expect(validatedData.username).toBe('emilys');
    expect(validatedData.email).toContain('@');
  });

  test('POST /auth/login - login with different user', async () => {
    const response = await apiContext.post(endpoints.auth.login, {
      data: {
        username: 'michaelw',
        password: 'michaelwpass',
      },
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    
    const validatedData = loginResponseSchema.parse(responseBody);
    expect(validatedData.username).toBe('michaelw');
    expect(validatedData.accessToken).toBeDefined();
  });

  test('POST /auth/login - fail with invalid credentials', async () => {
    const response = await apiContext.post(endpoints.auth.login, {
      data: {
        username: 'invaliduser',
        password: 'wrongpassword',
      },
    });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    const validatedError = errorResponseSchema.parse(responseBody);
    expect(validatedError.message).toBeDefined();
  });

  test('POST /auth/login - fail with missing username', async () => {
    const response = await apiContext.post(endpoints.auth.login, {
      data: {
        password: 'somepassword',
      },
    });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);
  });

  test('POST /auth/login - fail with missing password', async () => {
    const response = await apiContext.post(endpoints.auth.login, {
      data: {
        username: 'emilys',
      },
    });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);
  });

  test('POST /auth/login - fail with empty credentials', async () => {
    const response = await apiContext.post(endpoints.auth.login, {
      data: {},
    });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);
  });

  test('POST /auth/login - verify token format', async () => {
    const response = await apiContext.post(endpoints.auth.login, {
      data: {
        username: 'emilys',
        password: 'emilyspass',
      },
    });

    const responseBody = await response.json();
    const validatedData = loginResponseSchema.parse(responseBody);

    // Token should be a JWT-like string
    expect(validatedData.accessToken).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    expect(validatedData.refreshToken).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
  });
});
