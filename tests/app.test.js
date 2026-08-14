const request = require('supertest');
const app = require('../app');

describe('App basic routes', () => {
  test('GET / returns running message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/MR. Khan Medical Center API is running/);
  });
});
