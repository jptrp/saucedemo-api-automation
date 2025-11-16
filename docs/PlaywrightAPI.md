# Playwright API Testing Guide

## 📖 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Schema Validation](#schema-validation)
- [Authentication & Token Chaining](#authentication--token-chaining)
- [Best Practices](#best-practices)

## Overview

The Playwright API automation suite leverages Playwright's native `APIRequestContext` for making HTTP requests and validating responses. It provides a robust, type-safe approach to API testing with built-in retry mechanisms and comprehensive reporting.

## Architecture

```
playwright-api/
├── api/
│   ├── client.ts       # APIRequestContext factory functions
│   ├── endpoints.ts    # Centralized endpoint definitions
│   └── schema.ts       # Zod schemas for response validation
├── tests/
│   ├── auth.spec.ts    # Authentication test cases
│   ├── inventory.spec.ts   # Product/inventory test cases
│   ├── cart.spec.ts    # Cart operations test cases
│   ├── checkout.spec.ts    # End-to-end checkout flows
│   └── helpers/        # Shared test utilities
├── playwright.config.ts    # Playwright configuration
├── package.json
└── tsconfig.json
```

## Folder Structure Explained

### `api/` Directory

**client.ts** - Creates and configures APIRequestContext instances
```typescript
// Standard context
const apiContext = await createAPIContext();

// Authenticated context
const authContext = await createAuthenticatedContext(token);
```

**endpoints.ts** - Centralized endpoint management
```typescript
export const endpoints = {
  auth: {
    login: '/auth/login',
  },
  products: {
    base: '/products',
    single: (id: number) => `/products/${id}`,
  },
};
```

**schema.ts** - Zod schemas for runtime validation
```typescript
export const loginResponseSchema = z.object({
  token: z.string(),
  username: z.string(),
  email: z.string().email(),
});
```

### `tests/` Directory

Test files are organized by feature/domain:
- **auth.spec.ts** - Login, logout, token validation
- **inventory.spec.ts** - Product listing, search, filtering
- **cart.spec.ts** - Add to cart, update, delete operations
- **checkout.spec.ts** - Complete end-to-end user flows

## Running Tests

### Basic Commands

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in headed mode (with browser UI)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run tests in UI mode
npm run test:ui

# Show HTML report
npm run report
```

### Running Specific Tests

```bash
# Run a specific test file
npx playwright test auth.spec.ts

# Run tests matching a pattern
npx playwright test --grep "login"

# Run a specific test by title
npx playwright test -g "successful login"
```

### Environment Variables

```bash
# Set custom API base URL
API_BASE_URL=https://api.example.com npm test

# Set in .env file (create .env in playwright-api/)
API_BASE_URL=https://api.example.com
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect, APIRequestContext } from '@playwright/test';
import { createAPIContext } from '../api/client';
import { endpoints } from '../api/endpoints';
import { productSchema } from '../api/schema';

let apiContext: APIRequestContext;

test.describe('Product API Tests', () => {
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
    
    const data = await response.json();
    expect(data.products).toBeDefined();
  });
});
```

### Making Requests

#### GET Request
```typescript
const response = await apiContext.get('/products');
const data = await response.json();
```

#### POST Request
```typescript
const response = await apiContext.post('/auth/login', {
  data: {
    username: 'emilys',
    password: 'emilyspass',
  },
});
```

#### PUT Request
```typescript
const response = await apiContext.put('/carts/1', {
  data: {
    products: [{ id: 1, quantity: 5 }],
  },
});
```

#### DELETE Request
```typescript
const response = await apiContext.delete('/carts/1');
```

### Assertions

```typescript
// Status code assertions
expect(response.status()).toBe(200);
expect(response.ok()).toBeTruthy();

// Header assertions
expect(response.headers()['content-type']).toContain('application/json');

// Response body assertions
const data = await response.json();
expect(data.id).toBeDefined();
expect(data.title).toBe('iPhone');
```

## Schema Validation

### Using Zod for Validation

```typescript
import { productSchema } from '../api/schema';

test('Validate product response schema', async () => {
  const response = await apiContext.get('/products/1');
  const data = await response.json();
  
  // This will throw if validation fails
  const validatedProduct = productSchema.parse(data);
  
  // Now you have type-safe access
  expect(validatedProduct.id).toBe(1);
  expect(validatedProduct.title).toBeDefined();
});
```

### Safe Validation

```typescript
const result = productSchema.safeParse(data);

if (result.success) {
  console.log('Valid product:', result.data);
} else {
  console.error('Validation errors:', result.error);
}
```

### Custom Schema Example

```typescript
import { z } from 'zod';

const customProductSchema = z.object({
  id: z.number(),
  title: z.string().min(3),
  price: z.number().positive(),
  stock: z.number().nonnegative(),
  category: z.enum(['smartphones', 'laptops', 'fragrances']),
});
```

## Authentication & Token Chaining

### Basic Token Flow

```typescript
test.describe('Authenticated API Tests', () => {
  let authToken: string;

  test('Step 1: Login and get token', async () => {
    const response = await apiContext.post(endpoints.auth.login, {
      data: {
        username: 'emilys',
        password: 'emilyspass',
      },
    });

    const loginData = loginResponseSchema.parse(await response.json());
    authToken = loginData.token;
  });

  test('Step 2: Use token for authenticated request', async () => {
    const authContext = await createAuthenticatedContext(authToken);
    
    const response = await authContext.get('/auth/me');
    expect(response.status()).toBe(200);
    
    await authContext.dispose();
  });
});
```

### Using Fixtures for Auth

Create `tests/fixtures/auth.ts`:

```typescript
import { test as base } from '@playwright/test';
import { createAPIContext, createAuthenticatedContext } from '../api/client';

export const test = base.extend({
  authenticatedContext: async ({}, use) => {
    const context = await createAPIContext();
    const loginResponse = await context.post('/auth/login', {
      data: { username: 'emilys', password: 'emilyspass' },
    });
    const { token } = await loginResponse.json();
    const authContext = await createAuthenticatedContext(token);
    
    await use(authContext);
    
    await authContext.dispose();
    await context.dispose();
  },
});
```

Use in tests:

```typescript
import { test } from './fixtures/auth';

test('Access protected resource', async ({ authenticatedContext }) => {
  const response = await authenticatedContext.get('/auth/me');
  expect(response.status()).toBe(200);
});
```

## Best Practices

### 1. **Use Centralized Endpoints**

❌ Bad:
```typescript
const response = await apiContext.get('/products/1');
```

✅ Good:
```typescript
const response = await apiContext.get(endpoints.products.single(1));
```

### 2. **Always Validate Schemas**

❌ Bad:
```typescript
const data = await response.json();
expect(data.id).toBe(1); // No type safety
```

✅ Good:
```typescript
const data = await response.json();
const validatedProduct = productSchema.parse(data);
expect(validatedProduct.id).toBe(1); // Type-safe
```

### 3. **Clean Up Resources**

✅ Always dispose of APIRequestContext:
```typescript
test.afterAll(async () => {
  await apiContext.dispose();
});
```

### 4. **Use Descriptive Test Names**

✅ Good:
```typescript
test('POST /auth/login - successful login with valid credentials', async () => {
  // test code
});
```

### 5. **Group Related Tests**

```typescript
test.describe('Product Search', () => {
  test('search by keyword', async () => {});
  test('search with no results', async () => {});
  test('search with special characters', async () => {});
});
```

### 6. **Test Both Positive and Negative Cases**

```typescript
test('GET /products/1 - valid product ID', async () => {
  // positive case
});

test('GET /products/99999 - non-existent product ID', async () => {
  // negative case
  expect(response.status()).toBe(404);
});
```

## Configuration

### playwright.config.ts

```typescript
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    baseURL: process.env.API_BASE_URL || 'https://dummyjson.com',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
  },
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list']
  ],
});
```

## Debugging

### Debug Mode

```bash
npm run test:debug
```

### Trace Files

Playwright automatically captures traces on failure. View them:

```bash
npx playwright show-trace trace.zip
```

### Console Logs

```typescript
test('Debug test', async () => {
  const response = await apiContext.get('/products/1');
  console.log('Status:', response.status());
  console.log('Headers:', response.headers());
  console.log('Body:', await response.text());
});
```

## Next Steps

- Explore [SupertestAPI.md](./SupertestAPI.md) for alternative approach
- Review [Strategy.md](./Strategy.md) for testing strategies
- Check [Overview.md](./Overview.md) for project overview
