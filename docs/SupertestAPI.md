# Supertest + Axios + Vitest API Testing Guide

## 📖 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Running Tests](#running-tests)
- [Writing Tests with Axios](#writing-tests-with-axios)
- [Writing Tests with Supertest](#writing-tests-with-supertest)
- [Schema Validation](#schema-validation)
- [Best Practices](#best-practices)

## Overview

The Supertest/Vitest automation suite combines the power of Axios for flexible HTTP requests, Supertest for Express-style API testing, and Vitest for fast, modern test execution. This approach is ideal for teams familiar with Node.js ecosystems and those seeking lightweight API testing solutions.

## Architecture

```
supertest/
├── src/
│   ├── client.ts       # Axios client configuration
│   ├── endpoints.ts    # Centralized endpoint definitions
│   ├── schemas.ts      # Zod schemas for validation
│   └── tests/
│       ├── auth.test.ts        # Authentication tests
│       ├── inventory.test.ts   # Product/inventory tests
│       └── cart.test.ts        # Cart operations tests
├── vitest.config.ts    # Vitest configuration
├── package.json
└── tsconfig.json
```

## Running Tests

### Basic Commands

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Running Specific Tests

```bash
# Run a specific test file
npx vitest run auth.test.ts

# Run tests matching a pattern
npx vitest run --grep="login"

# Watch mode for specific file
npx vitest watch auth.test.ts
```

## Writing Tests with Axios

### Basic Test Structure

```typescript
import { describe, test, expect } from 'vitest';
import { api } from '../client';
import { endpoints } from '../endpoints';
import { productListSchema } from '../schemas';

describe('Product API Tests - Axios', () => {
  test('GET /products - retrieve all products', async () => {
    const response = await api.get(endpoints.products.base);

    expect(response.status).toBe(200);

    // Validate with Zod schema
    const validatedData = productListSchema.parse(response.data);
    expect(validatedData.products.length).toBeGreaterThan(0);
  });
});
```

### Making Requests with Axios

#### GET Request

```typescript
const response = await api.get('/products');
console.log(response.data);
console.log(response.status);
console.log(response.headers);
```

#### POST Request

```typescript
const response = await api.post('/auth/login', {
  username: 'emilys',
  password: 'emilyspass',
});
```

#### PUT Request

```typescript
const response = await api.put('/carts/1', {
  products: [{ id: 1, quantity: 5 }],
});
```

#### DELETE Request

```typescript
const response = await api.delete('/carts/1');
```

### Error Handling with Axios

```typescript
test('Handle 404 error', async () => {
  try {
    await api.get('/products/99999');
    expect(true).toBe(false); // Should not reach here
  } catch (error: any) {
    expect(error.response.status).toBe(404);
    expect(error.response.data.message).toBeDefined();
  }
});
```

### Request Configuration

```typescript
// Custom timeout
const response = await api.get('/products', {
  timeout: 5000,
});

// Custom headers
const response = await api.get('/products', {
  headers: {
    'Custom-Header': 'value',
  },
});

// Query parameters
const response = await api.get('/products/search', {
  params: {
    q: 'phone',
    limit: 10,
  },
});
```

## Writing Tests with Supertest

### Basic Test Structure

```typescript
import { describe, test, expect } from 'vitest';
import { endpoints } from '../endpoints';

const request = require('supertest');
const baseURL = process.env.API_BASE_URL || 'https://dummyjson.com';

describe('Product API Tests - Supertest', () => {
  test('GET /products - retrieve all products', async () => {
    const response = await request(baseURL)
      .get(endpoints.products.base)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.products).toBeDefined();
    expect(response.body.products.length).toBeGreaterThan(0);
  });
});
```

### Supertest Assertions

```typescript
// Status code assertion
await request(baseURL)
  .get('/products')
  .expect(200);

// Header assertion
await request(baseURL)
  .get('/products')
  .expect('Content-Type', /json/);

// Custom assertions
await request(baseURL)
  .get('/products')
  .expect((res) => {
    expect(res.body.products).toBeDefined();
  });
```

### POST Requests with Supertest

```typescript
test('POST /auth/login - successful login', async () => {
  const response = await request(baseURL)
    .post('/auth/login')
    .send({
      username: 'emilys',
      password: 'emilyspass',
    })
    .expect(200)
    .expect('Content-Type', /json/);

  expect(response.body.token).toBeDefined();
});
```

### PUT and DELETE with Supertest

```typescript
// PUT request
await request(baseURL)
  .put('/carts/1')
  .send({ products: [{ id: 1, quantity: 5 }] })
  .expect(200);

// DELETE request
await request(baseURL)
  .delete('/carts/1')
  .expect(200);
```

## Schema Validation

### Using Zod with Axios

```typescript
import { productSchema } from '../schemas';

test('Validate product schema', async () => {
  const response = await api.get('/products/1');
  
  // Validate and get typed data
  const product = productSchema.parse(response.data);
  
  expect(product.id).toBe(1);
  expect(product.title).toBeDefined();
});
```

### Using Zod with Supertest

```typescript
import { productListSchema } from '../schemas';

test('Validate product list schema', async () => {
  const response = await request(baseURL)
    .get('/products')
    .expect(200);
  
  const validatedData = productListSchema.parse(response.body);
  expect(validatedData.products.length).toBeGreaterThan(0);
});
```

### Safe Parsing

```typescript
const result = productSchema.safeParse(response.data);

if (result.success) {
  console.log('Valid product:', result.data);
} else {
  console.error('Validation errors:', result.error.issues);
}
```

## Client Configuration

### Axios Client (src/client.ts)

```typescript
import axios from 'axios';

const BASE_URL = process.env.API_BASE_URL || 'https://dummyjson.com';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add custom logic before request
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);
```

### Authenticated Client

```typescript
export function createAuthenticatedClient(token: string) {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    timeout: 30000,
  });
}
```

## Authentication Flow

### Token Chaining

```typescript
import { beforeAll, describe, test, expect } from 'vitest';

let authToken: string;
let userId: number;

describe('Authenticated Flow', () => {
  beforeAll(async () => {
    // Login and get token
    const response = await api.post('/auth/login', {
      username: 'emilys',
      password: 'emilyspass',
    });
    
    authToken = response.data.token;
    userId = response.data.id;
  });

  test('Use token for authenticated request', async () => {
    const authClient = createAuthenticatedClient(authToken);
    const response = await authClient.get('/auth/me');
    
    expect(response.status).toBe(200);
  });
});
```

## Best Practices

### 1. Use Centralized Endpoints

```typescript
// endpoints.ts
export const endpoints = {
  products: {
    base: '/products',
    single: (id: number) => `/products/${id}`,
  },
};

// In tests
const response = await api.get(endpoints.products.single(1));
```

### 2. Always Validate Schemas

```typescript
// With validation
const validatedData = productSchema.parse(response.data);

// Without validation (avoid)
const data = response.data; // No type safety
```

### 3. Group Related Tests

```typescript
describe('Product Search', () => {
  test('search by keyword', async () => {});
  test('search with no results', async () => {});
});
```

### 4. Test Both Positive and Negative Cases

```typescript
test('Valid product ID returns 200', async () => {
  const response = await api.get('/products/1');
  expect(response.status).toBe(200);
});

test('Invalid product ID returns 404', async () => {
  try {
    await api.get('/products/99999');
  } catch (error: any) {
    expect(error.response.status).toBe(404);
  }
});
```

### 5. Use BeforeAll for Setup

```typescript
describe('Test Suite', () => {
  let testData: any;

  beforeAll(async () => {
    // Setup code runs once before all tests
    const response = await api.post('/setup');
    testData = response.data;
  });

  test('Use setup data', async () => {
    expect(testData).toBeDefined();
  });
});
```

## Vitest Configuration

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    reporters: ['default', 'json'],
    outputFile: {
      json: './test-results.json',
    },
    testTimeout: 30000,
  },
});
```

## Debugging

### Console Logging

```typescript
test('Debug test', async () => {
  const response = await api.get('/products/1');
  console.log('Status:', response.status);
  console.log('Data:', response.data);
  console.log('Headers:', response.headers);
});
```

### Vitest UI

```bash
npm run test:ui
```

### Coverage Reports

```bash
npm run test:coverage
```

## Axios vs Supertest

### When to Use Axios
- Flexible HTTP client needs
- Complex request configuration
- Interceptors for global behavior
- Promise-based async handling

### When to Use Supertest
- Express/API server testing patterns
- Chained assertion style
- Built-in status code validation
- Familiar for Express developers

### Hybrid Approach
Many tests in this suite use **both**:
- Axios for complex requests and flexible configuration
- Supertest for clean, readable assertions

## Next Steps

- Review [PlaywrightAPI.md](./PlaywrightAPI.md) for Playwright approach
- Check [Strategy.md](./Strategy.md) for testing strategies
- Read [Overview.md](./Overview.md) for project context
