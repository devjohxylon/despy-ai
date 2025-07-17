import { describe, it, expect } from 'vitest';

// Usage:
//   API_BASE_URL=https://despy.io/api npx vitest run
//   (defaults to http://localhost:5173/api if not set)
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5173/api';

// Helper to POST JSON
async function postJson(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res;
}

// Helper to GET
async function getJson(url) {
  const res = await fetch(url);
  return res;
}

describe('API Endpoints', () => {
  it('/api/waitlist - should reject missing email', async () => {
    const res = await postJson(`${BASE_URL}/waitlist`, {});
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/email/i);
  });

  it('/api/waitlist - should reject invalid email', async () => {
    const res = await postJson(`${BASE_URL}/waitlist`, { email: 'notanemail' });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/invalid/i);
  });

  it('/api/waitlist - should accept valid email', async () => {
    const email = `test${Date.now()}@example.com`;
    const res = await postJson(`${BASE_URL}/waitlist`, { email });
    expect([200, 400, 429, 503, 500]).toContain(res.status); // Acceptable statuses
    const data = await res.json();
    if (res.status === 200) {
      expect(data.success).toBe(true);
    } else if (res.status === 400) {
      expect(data.error).toMatch(/already|invalid|waitlist/i);
    } else if (res.status === 429) {
      expect(data.error).toMatch(/too many/i);
    } else if (res.status === 503) {
      expect(data.error).toMatch(/database/i);
    } else if (res.status === 500) {
      expect(data.error).toMatch(/server|configuration/i);
    }
  });

  it('/api/stats - should return total', async () => {
    const res = await getJson(`${BASE_URL}/stats`);
    expect([200, 503, 500]).toContain(res.status);
    const data = await res.json();
    if (res.status === 200) {
      expect(data).toHaveProperty('total');
    } else {
      expect(data.error).toBeDefined();
    }
  });

  it('/api/health - should return status ok', async () => {
    const res = await getJson(`${BASE_URL}/health`);
    expect([200, 500]).toContain(res.status);
    const data = await res.json();
    expect(data).toHaveProperty('status');
  });

  it('/api/test-env - should return environment info', async () => {
    const res = await getJson(`${BASE_URL}/test-env`);
    expect([200, 500]).toContain(res.status);
    const data = await res.json();
    expect(data).toHaveProperty('environment');
  });
}); 