const request = require('supertest');
const app = require('../../../app');

describe('API E2E (Jest + Supertest)', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('GET / returns API metadata', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: 'Electronic Rental Platform API',
        version: '1.0.0',
      })
    );
  });

  test('GET unknown route returns 404', async () => {
    const res = await request(app).get('/unknown-route');

    expect(res.status).toBe(404);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: false,
        error: 'Route not found',
      })
    );
  });

  test('GET /api/dashboard without token returns 401', async () => {
    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: false,
        error: 'Not authorized, no token',
      })
    );
  });

  test('GET /api/bookings/my-bookings without token returns 401', async () => {
    const res = await request(app).get('/api/bookings/my-bookings');

    expect(res.status).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: false,
        error: 'Not authorized, no token',
      })
    );
  });

  test('GET /api/auth/me with malformed token returns 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer malformed.token.value');

    expect(res.status).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: false,
        error: 'Not authorized, token failed',
      })
    );
  });

  test('POST /api/auth/register with invalid payload returns 400 validation error', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: '',
      email: 'invalid-email',
      password: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: false,
      })
    );
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});
