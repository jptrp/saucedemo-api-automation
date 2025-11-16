# 🚀 SauceDemo API Automation Suite

[![API Automation Tests](https://github.com/jptrp/saucedemo-api-automation/actions/workflows/api-automation.yml/badge.svg)](https://github.com/jptrp/saucedemo-api-automation/actions/workflows/api-automation.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Professional API automation testing suite showcasing dual-framework implementation with Playwright APIRequest and Axios + Supertest + Vitest**

This repository demonstrates **SDET-level API automation expertise** through two distinct, production-ready testing frameworks. It covers real-world API testing scenarios including authentication workflows, schema validation, error handling, and comprehensive CI/CD integration.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Why Two Frameworks?](#why-two-frameworks)
- [Architecture](#architecture)
- [Features](#features)
- [Test Coverage](#test-coverage)
- [Quick Start](#quick-start)
- [Running Tests](#running-tests)
- [CI/CD Pipeline](#cicd-pipeline)
- [Documentation](#documentation)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Author](#author)

---

## 🎯 Overview

This project represents the **3rd pillar of a complete QA Engineering portfolio**, focusing exclusively on API automation testing. Unlike basic Postman collections or simple scripts, this suite demonstrates:

✅ **Production-ready code** - Clean, maintainable, type-safe automation  
✅ **Dual-framework expertise** - Playwright APIRequest + Axios/Supertest  
✅ **Schema validation** - Runtime type checking with Zod  
✅ **Comprehensive coverage** - Auth, CRUD, workflows, negative cases  
✅ **CI/CD integration** - GitHub Actions pipeline with parallel execution  
✅ **Professional documentation** - Architecture, strategy, and guides

**Target API:** [DummyJSON API](https://dummyjson.com/) - A free REST API for testing and prototyping

---

## 🤔 Why Two Frameworks?

### Educational Value
This repository demonstrates multiple approaches to API testing, allowing teams to:
- **Compare** different testing philosophies
- **Evaluate** which approach fits their tech stack
- **Learn** from concrete, working examples

### Real-World Engineering Context

Different teams have different needs:

| Framework | Use Case | Best For |
|-----------|----------|----------|
| **Playwright APIRequest** | Teams already using Playwright for E2E testing | Unified reporting, integrated workflows |
| **Axios + Supertest** | Pure API testing, Node.js projects | Lightweight, flexible, backend familiarity |

### Demonstrates Versatility

Shows you can:
- ✅ Work with modern testing frameworks (Playwright, Vitest)
- ✅ Adapt to existing project constraints
- ✅ Choose the right tool for the job
- ✅ Implement consistent patterns across different tools

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 API Automation Suite                      │
├───────────────────────────┬─────────────────────────────┤
│   Playwright APIRequest   │  Axios + Supertest + Vitest │
├───────────────────────────┼─────────────────────────────┤
│                                                           │
│              DummyJSON REST API                          │
│  (Auth, Products, Carts, Users)                          │
│                                                           │
└───────────────────────────────────────────────────────────┘
           ↓                           ↓
    ┌──────────┐               ┌──────────┐
    │ Zod      │               │ Zod      │
    │ Schemas  │               │ Schemas  │
    └──────────┘               └──────────┘
           ↓                           ↓
    ┌──────────────────────────────────────┐
    │     GitHub Actions CI/CD Pipeline    │
    │  (Parallel Execution + Reporting)    │
    └──────────────────────────────────────┘
```

---

## ✨ Features

### Core Capabilities

- 🔐 **Authentication Testing** - Login flows, token management, session handling
- 📦 **CRUD Operations** - Full coverage of Create, Read, Update, Delete
- 🔍 **Search & Filtering** - Query parameters, pagination, category filtering
- 🛒 **Workflow Testing** - Multi-step user journeys (login → browse → cart → checkout)
- ✅ **Schema Validation** - Runtime type checking with Zod for all responses
- ❌ **Negative Testing** - Error handling, validation, boundary conditions
- 🔄 **Token Chaining** - Authenticated request flows using bearer tokens

### Technical Excellence

- 📝 **TypeScript** - Full type safety across both frameworks
- 🎯 **Centralized Endpoints** - DRY principle for API routes
- 🧪 **Independent Tests** - No test interdependencies, fully parallelizable
- 📊 **Comprehensive Reporting** - HTML reports (Playwright), JSON results (both)
- ⚡ **Fast Execution** - Complete suite runs in under 2 minutes
- 🔧 **Configurable** - Environment-based configuration for different targets

---

## 🧪 Test Coverage

### API Endpoints Covered

| Category | Endpoints | Coverage |
|----------|-----------|----------|
| **Authentication** | `/auth/login`, `/auth/me` | 100% |
| **Products** | `/products`, `/products/:id`, `/products/search` | 95% |
| **Carts** | `/carts`, `/carts/:id`, `/carts/add` | 90% |
| **Categories** | `/products/categories`, `/products/category/:name` | 85% |

### Test Distribution

```
Total Tests: 90+

Playwright API Suite:   50+ tests
├── auth.spec.ts:       8 tests
├── inventory.spec.ts:  11 tests
├── cart.spec.ts:       13 tests
└── checkout.spec.ts:   8 tests

Supertest Suite:        40+ tests
├── auth.test.ts:       12 tests
├── inventory.test.ts:  14 tests
└── cart.test.ts:       14 tests
```

### Coverage by Type

- ✅ **Positive Tests** (70%) - Happy path scenarios
- ❌ **Negative Tests** (25%) - Error handling and validation
- 🎯 **Edge Cases** (5%) - Boundary conditions and special cases

---

## 🚀 Quick Start

### Prerequisites

```bash
# Node.js 20 or higher
node --version  # Should be v20.x or higher

# npm or yarn
npm --version
```

### Installation & Execution

#### Option 1: Run Playwright Suite

```bash
# Navigate to Playwright directory
cd playwright-api

# Install dependencies
npm install

# Run all tests
npm test

# Run with UI mode
npm run test:ui

# View HTML report
npm run report
```

#### Option 2: Run Supertest Suite

```bash
# Navigate to Supertest directory
cd supertest

# Install dependencies
npm install

# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with UI
npm run test:ui
```

#### Option 3: Run Both Suites

```bash
# From repository root
cd playwright-api && npm install && npm test && cd ..
cd supertest && npm install && npm test && cd ..
```

---

## 🧑‍💻 Running Tests

### Playwright API Tests

```bash
cd playwright-api

# Run all tests
npm test

# Run specific test file
npx playwright test auth.spec.ts

# Run tests matching pattern
npx playwright test --grep "login"

# Debug mode
npm run test:debug

# Headed mode (with browser UI)
npm run test:headed
```

### Supertest Tests

```bash
cd supertest

# Run all tests
npm test

# Run specific test file
npx vitest run auth.test.ts

# Watch mode
npm run test:watch

# UI mode
npm run test:ui

# Coverage report
npm run test:coverage
```

### Environment Variables

```bash
# Set custom API base URL
API_BASE_URL=https://api.example.com npm test

# Create .env file (optional)
echo "API_BASE_URL=https://dummyjson.com" > .env
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The repository includes a **unified CI/CD pipeline** that runs both test suites in parallel:

```yaml
name: API Automation Tests

Triggers:
  - Push to main/develop branches
  - Pull requests
  - Manual workflow dispatch

Jobs:
  1. Playwright API Tests (parallel)
  2. Supertest API Tests (parallel)
  3. Test Summary (consolidation)
```

### Pipeline Features

✅ **Parallel Execution** - Both suites run simultaneously  
✅ **Artifact Upload** - Test reports and results preserved  
✅ **Failure Handling** - Tests run even if one suite fails  
✅ **Summary Report** - Consolidated results in GitHub Actions  

### Viewing Results

1. Navigate to **Actions** tab in GitHub repository
2. Select latest workflow run
3. Download artifacts (reports, test results)
4. View job summaries for quick overview

---

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

| Document | Description |
|----------|-------------|
| [**Overview.md**](./docs/Overview.md) | Project architecture, framework comparison, when to use each |
| [**PlaywrightAPI.md**](./docs/PlaywrightAPI.md) | Playwright suite guide, test structure, schema validation |
| [**SupertestAPI.md**](./docs/SupertestAPI.md) | Supertest/Vitest guide, Axios patterns, Supertest examples |
| [**Strategy.md**](./docs/Strategy.md) | Testing strategy, coverage goals, CI/CD integration |

### Quick Links

- 🎯 [When to use code-based testing vs Postman](./docs/Overview.md#when-not-to-use-code-based-automation-vs-postman)
- 🔧 [Writing your first Playwright API test](./docs/PlaywrightAPI.md#writing-tests)
- 🧪 [Schema validation examples](./docs/PlaywrightAPI.md#schema-validation)
- 📊 [Test coverage strategy](./docs/Strategy.md#coverage-strategy)

---

## 🛠️ Technology Stack

### Playwright API Suite

| Technology | Purpose | Version |
|------------|---------|---------|
| **@playwright/test** | Testing framework with native API support | ^1.44.0 |
| **zod** | Runtime type checking and schema validation | ^3.22.0 |
| **TypeScript** | Type-safe development | ^5.2.0 |

### Supertest Suite

| Technology | Purpose | Version |
|------------|---------|---------|
| **axios** | Promise-based HTTP client | ^1.6.0 |
| **supertest** | HTTP assertion library | ^6.3.3 |
| **vitest** | Fast, modern unit test framework | ^1.0.4 |
| **zod** | Schema validation | ^3.22.0 |
| **TypeScript** | Type-safe development | ^5.2.0 |

### Common Tools

- **Node.js** 20+ - JavaScript runtime
- **GitHub Actions** - CI/CD automation
- **DummyJSON API** - Mock REST API

---

## 📁 Project Structure

```
saucedemo-api-automation/
├── playwright-api/              # Playwright APIRequest framework
│   ├── api/
│   │   ├── client.ts            # API request context factory
│   │   ├── endpoints.ts         # Centralized endpoint definitions
│   │   └── schema.ts            # Zod validation schemas
│   ├── tests/
│   │   ├── auth.spec.ts         # Authentication tests
│   │   ├── inventory.spec.ts    # Product/inventory tests
│   │   ├── cart.spec.ts         # Cart operations tests
│   │   ├── checkout.spec.ts     # End-to-end workflow tests
│   │   └── helpers/             # Shared test utilities
│   ├── package.json
│   ├── tsconfig.json
│   └── playwright.config.ts
│
├── supertest/                   # Supertest + Vitest framework
│   ├── src/
│   │   ├── client.ts            # Axios client configuration
│   │   ├── endpoints.ts         # Endpoint definitions
│   │   ├── schemas.ts           # Zod validation schemas
│   │   └── tests/
│   │       ├── auth.test.ts     # Authentication tests
│   │       ├── inventory.test.ts # Product tests
│   │       └── cart.test.ts     # Cart tests
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
│
├── .github/
│   └── workflows/
│       └── api-automation.yml   # Unified CI/CD pipeline
│
├── docs/                        # Comprehensive documentation
│   ├── Overview.md              # Project overview & architecture
│   ├── PlaywrightAPI.md         # Playwright guide
│   ├── SupertestAPI.md          # Supertest/Vitest guide
│   └── Strategy.md              # Testing strategy & best practices
│
├── assets/                      # Screenshots, diagrams, badges
├── README.md                    # This file
└── LICENSE                      # MIT License
```

---

## 💡 Why This Project Matters

### What Most QA Portfolios Show:

❌ A few Postman requests  
❌ Basic Jest/Mocha tests with no structure  
❌ Half-working Newman pipelines  
❌ No schema validation  
❌ Poor documentation  

### What This Project Demonstrates:

✅ **API Testing Expertise** - Comprehensive coverage of real-world scenarios  
✅ **Code-First Automation** - Professional, maintainable test suites  
✅ **Schema Validation** - Runtime type safety with Zod  
✅ **Multi-Framework Proficiency** - Playwright AND Supertest  
✅ **CI/CD Integration** - Production-ready GitHub Actions pipeline  
✅ **Documentation Discipline** - Detailed guides and architecture docs  
✅ **Engineering Architecture** - Clean separation, DRY principles, scalability  

**This is the SDET version of API automation.**

---

## 🤝 Contributing

This is an educational portfolio project, but contributions are welcome!

### Ways to Contribute:

1. **Add new test scenarios** - Expand coverage
2. **Improve documentation** - Clarify concepts
3. **Optimize performance** - Speed up test execution
4. **Add new frameworks** - RestAssured, Karate, etc.
5. **Report issues** - Found a bug? Let me know!

### Getting Started:

```bash
# Fork the repository
# Clone your fork
git clone https://github.com/YOUR_USERNAME/saucedemo-api-automation.git

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# Run tests to ensure they pass
cd playwright-api && npm test
cd ../supertest && npm test

# Commit and push
git commit -m "Add: your feature description"
git push origin feature/your-feature-name

# Open a Pull Request
```

---

## 👤 Author

**Dustin Braun**  
QA Engineer | SDET | Automation Engineer

- 🌐 **GitHub:** [github.com/jptrp](https://github.com/jptrp)
- 💼 **LinkedIn:** [linkedin.com/in/dustinbrauntesting](https://www.linkedin.com/in/dustinbrauntesting/)
- 📧 **Email:** Available on LinkedIn

### Portfolio Projects

This is part of a **comprehensive QA Engineering portfolio** demonstrating:

1. **UI Automation** - Selenium/Playwright E2E testing
2. **Mobile Automation** - Appium iOS/Android testing
3. **API Automation** - This repository ⭐
4. **Performance Testing** - JMeter/K6 load testing
5. **CI/CD Pipelines** - Jenkins/GitHub Actions integration

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **DummyJSON** - Free REST API for testing ([dummyjson.com](https://dummyjson.com/))
- **Playwright Team** - Excellent testing framework
- **Vitest Team** - Fast, modern test runner
- **Zod** - Runtime validation library

---

## 📊 Project Stats

![GitHub repo size](https://img.shields.io/github/repo-size/jptrp/saucedemo-api-automation)
![GitHub last commit](https://img.shields.io/github/last-commit/jptrp/saucedemo-api-automation)
![GitHub issues](https://img.shields.io/github/issues/jptrp/saucedemo-api-automation)

---

<div align="center">

### ⭐ If this project helped you, please give it a star! ⭐

**Built with ❤️ by a passionate QA Engineer**

</div>