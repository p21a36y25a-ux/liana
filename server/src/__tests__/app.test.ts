import request from 'supertest';
import app from '../app';

describe('GET /health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'liana-server' });
  });
});

describe('GET /api/frameworks', () => {
  it('returns all 9 frameworks', async () => {
    const res = await request(app).get('/api/frameworks');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(9);
  });

  it('includes all required frameworks', async () => {
    const res = await request(app).get('/api/frameworks');
    const ids = res.body.map((f: { id: string }) => f.id);
    expect(ids).toContain('angular');
    expect(ids).toContain('express');
    expect(ids).toContain('nestjs');
    expect(ids).toContain('nextjs');
    expect(ids).toContain('nuxt');
    expect(ids).toContain('parcel');
    expect(ids).toContain('react');
    expect(ids).toContain('vite');
    expect(ids).toContain('vue');
  });

  it('each framework has required fields', async () => {
    const res = await request(app).get('/api/frameworks');
    for (const fw of res.body) {
      expect(fw).toHaveProperty('id');
      expect(fw).toHaveProperty('name');
      expect(fw).toHaveProperty('category');
      expect(fw).toHaveProperty('language');
      expect(fw).toHaveProperty('description');
      expect(fw).toHaveProperty('useCases');
      expect(fw).toHaveProperty('officialSite');
      expect(fw).toHaveProperty('tags');
      expect(fw).toHaveProperty('color');
    }
  });
});

describe('GET /api/frameworks/:id', () => {
  it('returns a specific framework by id', async () => {
    const res = await request(app).get('/api/frameworks/react');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('react');
    expect(res.body.name).toBe('React');
  });

  it('returns 404 for unknown framework', async () => {
    const res = await request(app).get('/api/frameworks/unknown');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
