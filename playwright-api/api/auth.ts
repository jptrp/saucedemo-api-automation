import { test, expect } from '@playwright/test';
import { createAPIClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { loginResponseSchema } from '../api/schemas';

test('Login with valid credentials', async () => {
  const api = await createAPIClient();
  
  const response = await api.post(endpoints.login, {
    data: {
      username: 'kminchelle',
      password: '0lelplR'
    }
  });

  expect(response.status()).toBe(200);

  const json = await response.json();
  const validated = loginResponseSchema.safeParse(json);
  expect(validated.success).toBe(true);

  process.env.TOKEN = json.token;
});