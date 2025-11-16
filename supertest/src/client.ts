import axios, { AxiosInstance } from 'axios';

/**
 * Base API URL
 */
const BASE_URL = process.env.API_BASE_URL || 'https://dummyjson.com';

/**
 * Axios client with default configuration
 */
export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

/**
 * Create an authenticated axios instance with bearer token
 * @param token - Authentication token
 * @returns Configured axios instance with auth header
 */
export function createAuthenticatedClient(token: string): AxiosInstance {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    timeout: 30000,
  });
}

/**
 * Request interceptor for logging
 */
api.interceptors.request.use(
  (config) => {
    // You can add request logging here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Enhanced error handling
    if (error.response) {
      // Server responded with error status
      console.error('Response Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Request Error:', error.message);
    } else {
      // Error in request configuration
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);