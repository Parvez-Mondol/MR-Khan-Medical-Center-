// Integration tests for auth flows using an in-memory MongoDB

process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'testrefreshsecret';

// allow longer time for mongodb-memory-server to download binaries on slow networks
jest.setTimeout(120000);

const request = require('supertest');
const mongoose = require('mongoose');
// `MongoMemoryServer` is lazy-required inside the setup to avoid top-level downloads
const dns = require('dns').promises;
const net = require('net');

let mongod;
let app;
let canRun = true;
const RUN_INTEGRATION = process.env.RUN_INTEGRATION === 'true';

beforeAll(async () => {
  if (!RUN_INTEGRATION) {
    console.warn('Integration tests disabled. Set RUN_INTEGRATION=true to enable mongodb-memory-server tests.');
    canRun = false;
    return;
  }
  // quick DNS check to avoid starting a long download when offline or blocked
  try {
    await dns.lookup('fastdl.mongodb.org');
  } catch (err) {
    console.warn('fastdl.mongodb.org not resolvable; skipping mongodb-memory-server tests');
    canRun = false;
    return;
  }

  // quick TCP probe to ensure the download endpoint is reachable fast
  const probe = () => new Promise((resolve) => {
    const socket = net.connect(443, 'fastdl.mongodb.org');
    let done = false;
    const cleanup = (ok) => {
      if (done) return;
      done = true;
      try { socket.destroy(); } catch (e) {}
      resolve(ok);
    };
    socket.setTimeout(3000, () => cleanup(false));
    socket.on('connect', () => cleanup(true));
    socket.on('error', () => cleanup(false));
  });

  try {
    const ok = await probe();
    if (!ok) {
      console.warn('fastdl.mongodb.org not reachable quickly; skipping mongodb-memory-server tests');
      canRun = false;
      return;
    }
  } catch (e) {
    console.warn('Probe failed; skipping mongodb-memory-server tests');
    canRun = false;
    return;
  }
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    app = require('../app');
  } catch (err) {
    console.warn('Could not start MongoMemoryServer; skipping auth integration tests:', err && err.message ? err.message : err);
    canRun = false;
  }
});

afterAll(async () => {
  if (canRun) {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  }
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

test('register, login, refresh, logout flow', async () => {
  if (!canRun) {
    console.warn('Skipping auth integration test because MongoDB is unavailable');
    return;
  }
  const email = 'tester@example.com';
  const password = 'password123';

  // Register
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Tester', email, password });
  expect(reg.statusCode).toBe(201);
  expect(reg.body.token).toBeDefined();

  // Login
  const login = await request(app).post('/api/auth/login').send({ email, password });
  expect(login.statusCode).toBe(200);
  expect(login.body.refreshToken).toBeDefined();
  const refreshToken = login.body.refreshToken;

  // Refresh
  const refreshed = await request(app).post('/api/auth/refresh').send({ refreshToken });
  expect(refreshed.statusCode).toBe(200);
  expect(refreshed.body.token).toBeDefined();

  // Logout
  const logout = await request(app).post('/api/auth/logout').send({ refreshToken });
  expect(logout.statusCode).toBe(200);

  // Refresh after logout should fail
  const refreshed2 = await request(app).post('/api/auth/refresh').send({ refreshToken });
  expect([400, 401]).toContain(refreshed2.statusCode);
});
