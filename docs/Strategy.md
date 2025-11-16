# API Testing Strategy

## 📖 Table of Contents

- [Overview](#overview)
- [Testing Pyramid](#testing-pyramid)
- [Test Types](#test-types)
- [Coverage Strategy](#coverage-strategy)
- [Positive vs Negative Testing](#positive-vs-negative-testing)
- [Performance Considerations](#performance-considerations)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

## Overview

This document outlines the comprehensive testing strategy employed in this API automation suite. It covers test organization, coverage approaches, performance considerations, and CI/CD integration patterns.

## Testing Pyramid

Our API testing follows the testing pyramid principle:

```
          /\
         /  \
        /    \     ← E2E Flows (10-20%)
       /------\
      /        \
     /  API     \  ← API Tests (60-70%)
    /   Tests    \
   /--------------\
  /                \
 /  Unit Tests      \ ← Unit Tests (Not in this repo)
/____________________\
```

### Our Focus: API Layer

This repository focuses on the **API testing layer**, which provides:
- **Fast feedback** - Faster than E2E UI tests
- **Better coverage** - Tests business logic without UI
- **Reliability** - Less flaky than UI tests
- **Independence** - No UI rendering required

## Test Types

### 1. Contract Tests

Verify API contracts using schema validation:

```typescript
test('Verify product API contract', async () => {
  const response = await api.get('/products/1');
  const product = productSchema.parse(response.data);
  
  // Schema ensures correct structure
  expect(product).toHaveProperty('id');
  expect(product).toHaveProperty('title');
  expect(product).toHaveProperty('price');
});
```

**Purpose:**
- Ensure API responses match expected schema
- Catch breaking changes early
- Validate data types and structures

### 2. Functional Tests

Test business logic and workflows:

```typescript
test('Add product to cart workflow', async () => {
  // 1. Login
  const loginResponse = await api.post('/auth/login', credentials);
  const { token, id } = loginResponse.data;
  
  // 2. Get product
  const productResponse = await api.get('/products/1');
  
  // 3. Add to cart
  const cartResponse = await api.post('/carts/add', {
    userId: id,
    products: [{ id: 1, quantity: 2 }],
  });
  
  expect(cartResponse.status).toBe(201);
});
```

**Purpose:**
- Verify business workflows
- Test feature functionality
- Ensure proper state transitions

### 3. Integration Tests

Test interactions between API endpoints:

```typescript
test('Complete checkout flow', async () => {
  // Login → Browse → Add to Cart → Checkout
  const user = await login();
  const products = await getProducts();
  const cart = await addToCart(user.id, products[0].id);
  const order = await checkout(cart.id);
  
  expect(order.status).toBe('completed');
});
```

**Purpose:**
- Test endpoint dependencies
- Verify data flow between services
- Ensure system integration works

### 4. Negative Tests

Test error handling and edge cases:

```typescript
test('Invalid credentials return 400', async () => {
  try {
    await api.post('/auth/login', {
      username: 'invalid',
      password: 'wrong',
    });
  } catch (error: any) {
    expect(error.response.status).toBe(400);
    expect(error.response.data.message).toBeDefined();
  }
});
```

**Purpose:**
- Verify proper error handling
- Test boundary conditions
- Ensure security validations work

## Coverage Strategy

### API Endpoint Coverage

#### Authentication Endpoints (100% Coverage)
- ✅ POST /auth/login - Valid credentials
- ✅ POST /auth/login - Invalid credentials
- ✅ POST /auth/login - Missing username
- ✅ POST /auth/login - Missing password
- ✅ POST /auth/login - Empty body

#### Product Endpoints (95% Coverage)
- ✅ GET /products - List all
- ✅ GET /products/:id - Valid ID
- ✅ GET /products/:id - Invalid ID
- ✅ GET /products/search - With results
- ✅ GET /products/search - No results
- ✅ GET /products?limit - Pagination
- ✅ GET /products/categories - List categories
- ✅ GET /products/category/:name - Valid category

#### Cart Endpoints (90% Coverage)
- ✅ GET /carts - List all
- ✅ GET /carts/:id - Valid ID
- ✅ GET /carts/:id - Invalid ID
- ✅ POST /carts/add - Create cart
- ✅ PUT /carts/:id - Update cart
- ✅ DELETE /carts/:id - Delete cart

### HTTP Method Coverage

| Method | Coverage | Examples |
|--------|----------|----------|
| GET    | 100%     | /products, /carts, /users |
| POST   | 100%     | /auth/login, /carts/add |
| PUT    | 85%      | /carts/:id, /users/:id |
| DELETE | 75%      | /carts/:id |

### Status Code Coverage

| Code | Coverage | Use Cases |
|------|----------|-----------|
| 200  | ✅ Yes   | Successful GET, PUT, DELETE |
| 201  | ✅ Yes   | Successful POST (create) |
| 400  | ✅ Yes   | Bad request, validation errors |
| 401  | ⚠️ Partial | Authentication failures |
| 404  | ✅ Yes   | Resource not found |
| 500  | ❌ No    | Server errors (hard to test) |

## Positive vs Negative Testing

### Positive Tests (Happy Path)

Test expected behavior with valid inputs:

```typescript
describe('Positive Tests', () => {
  test('Login with valid credentials', async () => {
    const response = await api.post('/auth/login', {
      username: 'emilys',
      password: 'emilyspass',
    });
    expect(response.status).toBe(200);
  });
  
  test('Get product by valid ID', async () => {
    const response = await api.get('/products/1');
    expect(response.status).toBe(200);
  });
});
```

**Coverage Target:** 70% of total tests

### Negative Tests (Unhappy Path)

Test error handling and edge cases:

```typescript
describe('Negative Tests', () => {
  test('Login with invalid credentials', async () => {
    try {
      await api.post('/auth/login', {
        username: 'invalid',
        password: 'wrong',
      });
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });
  
  test('Get product with non-existent ID', async () => {
    try {
      await api.get('/products/99999');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });
});
```

**Coverage Target:** 30% of total tests

### Balanced Approach

| Test Type | Percentage | Purpose |
|-----------|------------|---------|
| Positive  | 70%        | Verify features work |
| Negative  | 25%        | Verify error handling |
| Edge Cases| 5%         | Boundary conditions |

## Performance Considerations

### Test Execution Speed

**Current Performance:**
- Playwright API Suite: ~15-30 seconds (50+ tests)
- Supertest Suite: ~10-20 seconds (40+ tests)
- Total CI Run: ~1-2 minutes

### Optimization Strategies

#### 1. Parallel Execution

```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
});
```

#### 2. Test Independence

Each test is independent and can run in any order:

```typescript
test('Independent test', async () => {
  // Setup
  const context = await createAPIContext();
  
  // Test
  const response = await context.get('/products');
  
  // Cleanup
  await context.dispose();
});
```

#### 3. Efficient Test Data

Use minimal test data:

```typescript
// ❌ Avoid
const products = await getAllProducts(); // Fetches 1000+ products

// ✅ Better
const products = await getProducts({ limit: 5 }); // Fetches 5 products
```

#### 4. Smart Retries

```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0, // Retry only in CI
});
```

### Load Testing (Out of Scope)

This suite focuses on **functional testing**, not load/performance testing.

For load testing, consider:
- Apache JMeter
- K6
- Artillery
- Gatling

## CI/CD Integration

### GitHub Actions Workflow

```yaml
jobs:
  playwright-api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test

  supertest-api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
```

### CI Execution Strategy

#### Trigger Events
- ✅ Push to main/develop branches
- ✅ Pull requests
- ✅ Manual workflow dispatch
- ❌ Scheduled runs (optional)

#### Parallel Jobs
Both test suites run **in parallel** for faster feedback:

```
   Start CI
      |
      ├─→ Playwright Tests (Job 1)
      |        ↓
      |    15-30 sec
      |
      └─→ Supertest Tests (Job 2)
               ↓
           10-20 sec
               
   Total Time: ~30 sec (parallel)
   vs
   Sequential: ~45 sec
```

### Artifact Management

```yaml
- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: test-results
    path: test-results/
    retention-days: 30
```

### Reporting

- HTML reports (Playwright)
- JSON test results (both)
- GitHub Actions summary
- Artifacts for debugging

## Best Practices

### 1. Test Organization

```
tests/
├── auth.spec.ts        # Authentication
├── inventory.spec.ts   # Products
├── cart.spec.ts        # Cart operations
└── checkout.spec.ts    # E2E flows
```

### 2. Naming Conventions

```typescript
// ✅ Good: Descriptive test names
test('POST /auth/login - successful login with valid credentials', async () => {});

// ❌ Bad: Vague test names
test('login test', async () => {});
```

### 3. AAA Pattern

Arrange, Act, Assert:

```typescript
test('Add product to cart', async () => {
  // Arrange
  const userId = 1;
  const productId = 5;
  
  // Act
  const response = await api.post('/carts/add', {
    userId,
    products: [{ id: productId, quantity: 1 }],
  });
  
  // Assert
  expect(response.status).toBe(201);
  expect(response.data.userId).toBe(userId);
});
```

### 4. DRY Principle

```typescript
// ✅ Reusable helper
async function loginUser(username: string, password: string) {
  const response = await api.post('/auth/login', { username, password });
  return response.data.token;
}

// Use in tests
test('Authenticated request', async () => {
  const token = await loginUser('emilys', 'emilyspass');
  // Use token...
});
```

### 5. Clear Assertions

```typescript
// ✅ Specific assertions
expect(response.status).toBe(200);
expect(response.data.token).toBeDefined();
expect(response.data.username).toBe('emilys');

// ❌ Vague assertions
expect(response).toBeTruthy();
```

### 6. Test Data Management

```typescript
// ✅ Isolated test data
const testUser = {
  username: `test_${Date.now()}`,
  password: 'testpass123',
};

// ❌ Shared mutable data
const globalUser = { username: 'shared', password: 'pass' };
```

### 7. Error Messages

```typescript
// ✅ Descriptive error messages
expect(response.status).toBe(200, 
  `Expected 200 but got ${response.status}`);

// ✅ Use try-catch for negative tests
try {
  await api.get('/invalid');
  fail('Should have thrown an error');
} catch (error: any) {
  expect(error.response.status).toBe(404);
}
```

## Continuous Improvement

### Metrics to Track

1. **Test Coverage** - Percentage of endpoints covered
2. **Test Execution Time** - Keep under 2 minutes
3. **Flakiness Rate** - < 1% test flakiness
4. **Pass Rate** - > 98% on main branch

### Regular Reviews

- **Weekly** - Review failed tests
- **Monthly** - Update test coverage report
- **Quarterly** - Refactor and optimize

### Documentation

- Keep docs in sync with tests
- Document complex test scenarios
- Update README for new features

## Next Steps

- Review [PlaywrightAPI.md](./PlaywrightAPI.md) for implementation details
- Check [SupertestAPI.md](./SupertestAPI.md) for Supertest patterns
- Read [Overview.md](./Overview.md) for project context
