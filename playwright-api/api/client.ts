import { request, APIRequestContext } from '@playwright/test';

/**
 * Creates an API request context with default configuration
 * @param baseURL - Base URL for the API (defaults to env or config)
 * @returns Configured APIRequestContext
 */
export async function createAPIContext(baseURL?: string): Promise<APIRequestContext> {
  return await request.newContext({
    baseURL: baseURL || process.env.API_BASE_URL || 'https://dummyjson.com',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
}

/**
 * Creates an authenticated API request context with bearer token
 * @param token - Authentication token
 * @param baseURL - Base URL for the API
 * @returns Configured APIRequestContext with auth header
 */
export async function createAuthenticatedContext(
  token: string,
  baseURL?: string
): Promise<APIRequestContext> {
  return await request.newContext({
    baseURL: baseURL || process.env.API_BASE_URL || 'https://dummyjson.com',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
}

// Backward compatibility
export const createAPIClient = createAPIContext;