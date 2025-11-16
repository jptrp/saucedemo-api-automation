import { describe, test, expect, beforeAll } from 'vitest';
import { api } from '../client';
import { endpoints } from '../endpoints';
import { loginResponseSchema, errorResponseSchema } from '../schemas';

describe('Authentication API Tests - Axios', () => {
  test('POST /auth/login - successful login with valid credentials', async () => {
    const response = await api.post(endpoints.auth.login, {
      username: 'emilys',
      password: 'emilyspass',
      expiresInMins: 30,
    });

    expect(response.status).toBe(200);

    // Validate response schema using Zod
    const validatedData = loginResponseSchema.parse(response.data);

    expect(validatedData.accessToken).toBeDefined();
    expect(validatedData.accessToken.length).toBeGreaterThan(0);
    expect(validatedData.refreshToken).toBeDefined();
    expect(validatedData.username).toBe('emilys');
    expect(validatedData.email).toContain('@');
  });

  test('POST /auth/login - login with different user', async () => {
    const response = await api.post(endpoints.auth.login, {
      username: 'michaelw',
      password: 'michaelwpass',
    });

    expect(response.status).toBe(200);

    const validatedData = loginResponseSchema.parse(response.data);
    expect(validatedData.username).toBe('michaelw');
    expect(validatedData.accessToken).toBeDefined();
  });

  test('POST /auth/login - fail with invalid credentials', async () => {
    try {
      await api.post(endpoints.auth.login, {
        username: 'invaliduser',
        password: 'wrongpassword',
      });
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.response.status).toBe(400);
      const validatedError = errorResponseSchema.parse(error.response.data);
      expect(validatedError.message).toBeDefined();
    }
  });

  test('POST /auth/login - fail with missing username', async () => {
    try {
      await api.post(endpoints.auth.login, {
        password: 'somepassword',
      });
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });

  test('POST /auth/login - fail with missing password', async () => {
    try {
      await api.post(endpoints.auth.login, {
        username: 'emilys',
      });
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });

  test('POST /auth/login - fail with empty credentials', async () => {
    try {
      await api.post(endpoints.auth.login, {});
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });

  test('POST /auth/login - verify token format', async () => {
    const response = await api.post(endpoints.auth.login, {
      username: 'emilys',
      password: 'emilyspass',
    });

    const validatedData = loginResponseSchema.parse(response.data);

    // Token should be a JWT-like string
    expect(validatedData.accessToken).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    expect(validatedData.refreshToken).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
  });
});

describe('Authentication API Tests - Supertest', () => {
  const request = require('supertest');
  const baseURL = process.env.API_BASE_URL || 'https://dummyjson.com';

  test('POST /auth/login - supertest successful login', async () => {
    const response = await request(baseURL)
      .post(endpoints.auth.login)
      .send({
        username: 'emilys',
        password: 'emilyspass',
      })
      .expect(200)
      .expect('Content-Type', /json/);

    const validatedData = loginResponseSchema.parse(response.body);
    expect(validatedData.accessToken).toBeDefined();
    expect(validatedData.username).toBe('emilys');
  });

  test('POST /auth/login - supertest invalid credentials', async () => {
    await request(baseURL)
      .post(endpoints.auth.login)
      .send({
        username: 'invaliduser',
        password: 'wrongpassword',
      })
      .expect(400);
  });

  test('POST /auth/login - supertest verify response structure', async () => {
    const response = await request(baseURL)
      .post(endpoints.auth.login)
      .send({
        username: 'emilys',
        password: 'emilyspass',
      })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('username');
    expect(response.body).toHaveProperty('email');
  });
});