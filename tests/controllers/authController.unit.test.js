const controllerPath = '../../controllers/authController';

jest.mock('../../models/User');
jest.mock('../../models/PatientProfile');
jest.mock('../../models/DoctorProfile');
jest.mock('../../utils/sendEmail');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const PatientProfile = require('../../models/PatientProfile');
const DoctorProfile = require('../../models/DoctorProfile');
const sendEmail = require('../../utils/sendEmail');

const auth = require(controllerPath);

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.resetAllMocks();
});

test('register returns 400 when missing fields', async () => {
  const req = { body: {} };
  const res = mockRes();
  await auth.register(req, res);
  expect(res.status).toHaveBeenCalledWith(400);
});

test('register creates user and returns token', async () => {
  const req = { body: { name: 'A', email: 'a@b.com', password: 'pw' } };
  const res = mockRes();

  User.findOne.mockResolvedValue(null);
  bcrypt.hash.mockResolvedValue('h');
  const fakeUser = { _id: 'u1', name: 'A', email: 'a@b.com', role: 'patient', refreshTokens: [], save: jest.fn() };
  User.create.mockResolvedValue(fakeUser);
  PatientProfile.create.mockResolvedValue({});
  jwt.sign.mockImplementation((p, s, opts) => (opts && opts.expiresIn === '15m' ? 'ACCESS' : 'REFRESH'));

  await auth.register(req, res);

  expect(User.findOne).toHaveBeenCalled();
  expect(User.create).toHaveBeenCalled();
  expect(fakeUser.save).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'ACCESS', user: expect.any(Object) }));
});

test('login returns token and refreshToken on success', async () => {
  const req = { body: { email: 'a@b.com', password: 'pw' } };
  const res = mockRes();
  const fakeUser = { _id: 'u1', name: 'A', email: 'a@b.com', role: 'patient', passwordHash: 'h', refreshTokens: [], save: jest.fn() };

  User.findOne.mockResolvedValue(fakeUser);
  bcrypt.compare.mockResolvedValue(true);
  jwt.sign.mockImplementation((p, s, opts) => (opts && opts.expiresIn === '15m' ? 'ACCESS' : 'REFRESH'));

  await auth.login(req, res);

  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'ACCESS', refreshToken: 'REFRESH' }));
  expect(fakeUser.save).toHaveBeenCalled();
});

test('refreshToken validates and returns new token', async () => {
  const req = { body: { refreshToken: 'REFRESH' } };
  const res = mockRes();
  jwt.verify.mockReturnValue({ id: 'u1' });
  const fakeUser = { _id: 'u1', refreshTokens: ['REFRESH'] };
  User.findById.mockResolvedValue(fakeUser);
  jwt.sign.mockImplementation(() => 'ACCESS');

  await auth.refreshToken(req, res);
  expect(res.json).toHaveBeenCalledWith({ token: 'ACCESS' });
});

test('logout removes refresh token', async () => {
  const req = { body: { refreshToken: 'REFRESH' } };
  const res = mockRes();
  jwt.verify.mockReturnValue({ id: 'u1' });
  const fakeUser = { _id: 'u1', refreshTokens: ['REFRESH'], save: jest.fn() };
  User.findById.mockResolvedValue(fakeUser);

  await auth.logout(req, res);
  expect(fakeUser.save).toHaveBeenCalled();
  expect(res.json).toHaveBeenCalledWith({ message: 'Logged out' });
});

test('requestPasswordReset sets token and calls sendEmail', async () => {
  const req = { body: { email: 'a@b.com' } };
  const res = mockRes();
  const fakeUser = { _id: 'u1', email: 'a@b.com', save: jest.fn() };
  User.findOne.mockResolvedValue(fakeUser);
  sendEmail.mockResolvedValue(true);

  await auth.requestPasswordReset(req, res);
  expect(fakeUser.resetPasswordToken).toBeDefined();
  expect(fakeUser.save).toHaveBeenCalled();
  expect(sendEmail).toHaveBeenCalled();
});

test('resetPassword updates password', async () => {
  const req = { body: { token: 't', newPassword: 'np' } };
  const res = mockRes();
  const fakeUser = { _id: 'u1', save: jest.fn() };
  User.findOne.mockResolvedValue(fakeUser);
  bcrypt.hash.mockResolvedValue('newhash');

  await auth.resetPassword(req, res);
  expect(fakeUser.passwordHash).toBeDefined();
  expect(fakeUser.save).toHaveBeenCalled();
  expect(res.json).toHaveBeenCalledWith({ message: 'Password reset successful' });
});
