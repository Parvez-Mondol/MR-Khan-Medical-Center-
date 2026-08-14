jest.mock('../../models/User');
jest.mock('jsonwebtoken');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { protect, requireRole } = require('../../middleware/auth');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => jest.resetAllMocks());

test('protect rejects when Authorization header missing', async () => {
  const req = { headers: {} };
  const res = mockRes();
  const next = jest.fn();
  await protect(req, res, next);
  expect(res.status).toHaveBeenCalledWith(401);
});

test('protect rejects invalid token', async () => {
  const req = { headers: { authorization: 'Bearer bad' } };
  jwt.verify.mockImplementation(() => { throw new Error('bad'); });
  const res = mockRes();
  const next = jest.fn();
  await protect(req, res, next);
  expect(res.status).toHaveBeenCalledWith(401);
});

test('protect rejects when user not found', async () => {
  const req = { headers: { authorization: 'Bearer good' } };
  jwt.verify.mockReturnValue({ id: 'u1' });
  User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
  const res = mockRes();
  const next = jest.fn();
  await protect(req, res, next);
  expect(res.status).toHaveBeenCalledWith(401);
});

test('protect sets req.user and calls next on success', async () => {
  const req = { headers: { authorization: 'Bearer good' } };
  jwt.verify.mockReturnValue({ id: 'u1' });
  const fakeUser = { _id: 'u1', name: 'A' };
  User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(fakeUser) });
  const res = mockRes();
  const next = jest.fn();
  await protect(req, res, next);
  expect(req.user).toBe(fakeUser);
  expect(next).toHaveBeenCalled();
});

test('requireRole denies when no user', () => {
  const middleware = requireRole('admin');
  const req = {};
  const res = mockRes();
  const next = jest.fn();
  middleware(req, res, next);
  expect(res.status).toHaveBeenCalledWith(401);
});

test('requireRole denies when role not allowed', () => {
  const middleware = requireRole('admin');
  const req = { user: { role: 'patient' } };
  const res = mockRes();
  const next = jest.fn();
  middleware(req, res, next);
  expect(res.status).toHaveBeenCalledWith(403);
});

test('requireRole allows when role allowed', () => {
  const middleware = requireRole('doctor', 'admin');
  const req = { user: { role: 'doctor' } };
  const res = mockRes();
  const next = jest.fn();
  middleware(req, res, next);
  expect(next).toHaveBeenCalled();
});
