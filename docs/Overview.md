# API Automation Overview

## 📋 Table of Contents
- [Introduction](#introduction)
- [Repository Structure](#repository-structure)
- [Why Two Frameworks?](#why-two-frameworks)
- [When to Use Each Framework](#when-to-use-each-framework)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)

## Introduction

This repository contains a comprehensive API automation testing suite for the DummyJSON API, showcasing two distinct approaches to API testing:

1. **Playwright APIRequest** - Native Playwright API testing capabilities
2. **Axios + Supertest + Vitest** - Traditional Node.js API testing stack

Both frameworks are fully functional, independently executable, and integrated into a unified CI/CD pipeline using GitHub Actions.

## Repository Structure

```
saucedemo-api-automation/
├── playwright-api/          # Playwright-based API automation
│   ├── api/
│   │   ├── client.ts       # API request context creation
│   │   ├── endpoints.ts    # API endpoint definitions
│   │   └── schema.ts       # Zod schema validations
│   ├── tests/
│   │   ├── auth.spec.ts    # Authentication tests
│   │   ├── inventory.spec.ts   # Product/inventory tests
│   │   ├── cart.spec.ts    # Cart management tests
│   │   └── checkout.spec.ts    # End-to-end checkout flows
│   ├── package.json
│   ├── tsconfig.json
│   └── playwright.config.ts
├── supertest/              # Supertest + Vitest automation
│   ├── src/
│   │   ├── client.ts       # Axios client configuration
│   │   ├── endpoints.ts    # API endpoint definitions
│   │   ├── schemas.ts      # Zod schema validations
│   │   └── tests/
│   │       ├── auth.test.ts
│   │       ├── inventory.test.ts
│   │       └── cart.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
├── .github/workflows/
│   └── api-automation.yml  # Unified CI/CD pipeline
├── docs/                   # Comprehensive documentation
│   ├── Overview.md
│   ├── PlaywrightAPI.md
│   ├── SupertestAPI.md
│   └── Strategy.md
└── README.md
```

## Why Two Frameworks?

### Educational Value
This repository demonstrates multiple approaches to solving the same problem, allowing teams to:
- Compare different testing philosophies
- Evaluate which approach fits their tech stack
- Learn from concrete, working examples

### Different Use Cases
Each framework excels in different scenarios:

**Playwright APIRequest:**
- Integrated with existing Playwright E2E tests
- Unified reporting across UI and API tests
- Built-in retry mechanisms and parallel execution
- Native TypeScript support

**Axios + Supertest + Vitest:**
- Lightweight and flexible
- Familiar to Node.js developers
- Easy integration with existing Node.js projects
- Fine-grained control over HTTP requests

### Team Preferences
Different teams have different preferences:
- **Frontend teams** may prefer Playwright for consistency with UI tests
- **Backend teams** may prefer Supertest for familiarity with Express testing patterns
- **Full-stack teams** benefit from seeing both approaches

## When to Use Each Framework

### Use Playwright APIRequest When:
- You already use Playwright for E2E UI testing
- You want unified reporting across UI and API tests
- You need built-in retry and parallel execution
- You prefer Playwright's fixture system
- You want trace files for debugging API calls

### Use Supertest + Vitest When:
- You have a pure API testing requirement
- Your team is familiar with Node.js testing patterns
- You need lightweight, fast-running tests
- You want fine-grained control over HTTP configuration
- You prefer Vitest's testing experience

### When NOT to Use Code-Based Automation vs Postman

**Choose Code-Based Automation (Playwright/Supertest) When:**
- You need version control for tests
- You want CI/CD integration
- You require complex test logic and data manipulation
- You need programmatic test generation
- You want to integrate with other testing frameworks

**Choose Postman When:**
- You need quick, ad-hoc API exploration
- Non-developers need to create tests
- You want visual test creation
- You need to share collections with non-technical stakeholders
- You're doing manual API debugging

## Technology Stack

### Playwright API Suite
- **@playwright/test** - Testing framework with native API support
- **zod** - Runtime type checking and validation
- **TypeScript** - Type-safe development

### Supertest Suite
- **axios** - Promise-based HTTP client
- **supertest** - HTTP assertion library
- **vitest** - Fast unit test framework
- **zod** - Schema validation
- **TypeScript** - Type-safe development

### Common Tools
- **Node.js 20+** - JavaScript runtime
- **GitHub Actions** - CI/CD automation
- **DummyJSON API** - Mock REST API for testing

## Getting Started

### Prerequisites
```bash
# Node.js 20 or higher
node --version

# npm or yarn
npm --version
```

### Quick Start - Playwright
```bash
cd playwright-api
npm install
npm test
```

### Quick Start - Supertest
```bash
cd supertest
npm install
npm test
```

### Run Both Suites
```bash
# From repository root
cd playwright-api && npm install && npm test && cd ..
cd supertest && npm install && npm test && cd ..
```

### View Reports
```bash
# Playwright HTML Report
cd playwright-api
npx playwright show-report

# Vitest UI
cd supertest
npm run test:ui
```

## Next Steps

- Read [PlaywrightAPI.md](./PlaywrightAPI.md) for Playwright-specific details
- Read [SupertestAPI.md](./SupertestAPI.md) for Supertest-specific details
- Read [Strategy.md](./Strategy.md) for testing strategy and best practices

## Contributing

This is an educational repository. Feel free to:
- Fork and experiment
- Add new test scenarios
- Improve documentation
- Share feedback

## License

MIT License - See LICENSE file for details
