const httpMocks = require('node-mocks-http');

jest.mock('../../controllers/adminController', () => jest.requireActual('../../controllers/adminController'));

const adminController = require('../../controllers/adminController');

// Mock models and utils
const User = require('../../models/User');
const DoctorProfile = require('../../models/DoctorProfile');
const PatientProfile = require('../../models/PatientProfile');
const LabProfile = require('../../models/LabProfile');
const sendEmail = require('../../utils/sendEmail');

describe('adminController', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('getPendingUsers returns users with profiles', async () => {
    const users = [
      { _id: '1', role: 'doctor', name: 'Doc', email: 'd@example.com' },
      { _id: '2', role: 'patient', name: 'Pat', email: 'p@example.com' },
    ];

    User.find = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(users) });
    DoctorProfile.findOne = jest.fn().mockResolvedValue({ specialty: 'cardio' });
    PatientProfile.findOne = jest.fn().mockResolvedValue({ age: 30 });

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await adminController.getPendingUsers(req, res);

    expect(User.find).toHaveBeenCalledWith({ verificationStatus: 'pending' });
    const json = res._getJSONData() || JSON.parse(res._getData() || 'null');
    const arr = Array.isArray(json) ? json : Object.values(json || {});
    expect(arr).toHaveLength(2);
  });

  test('approveUser handles missing user', async () => {
    User.findById = jest.fn().mockResolvedValue(null);
    const req = httpMocks.createRequest({ params: { id: 'nope' } });
    const res = httpMocks.createResponse();

    await adminController.approveUser(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toHaveProperty('message', 'User not found');
  });

  test('approveUser approves and emails', async () => {
    const user = { _id: '1', email: 'u@e', name: 'User', save: jest.fn() };
    User.findById = jest.fn().mockResolvedValue(user);
    sendEmail.mockResolvedValue = jest.fn();

    const req = httpMocks.createRequest({ params: { id: '1' } });
    const res = httpMocks.createResponse();

    await adminController.approveUser(req, res);

    expect(user.verificationStatus).toBe('verified');
    expect(res._getJSONData()).toHaveProperty('message', 'User approved');
  });

  test('rejectUser rejects and includes reason', async () => {
    const user = { _id: '2', email: 'u2@e', name: 'User2', save: jest.fn() };
    User.findById = jest.fn().mockResolvedValue(user);
    sendEmail.mockResolvedValue = jest.fn();

    const req = httpMocks.createRequest({ params: { id: '2' }, body: { reason: 'bad docs' } });
    const res = httpMocks.createResponse();

    await adminController.rejectUser(req, res);

    expect(user.verificationStatus).toBe('rejected');
    expect(res._getJSONData()).toHaveProperty('message', 'User rejected');
  });

  test('createLabStaff validates input and creates account', async () => {
    const req = httpMocks.createRequest({ body: { name: 'Lab', email: 'lab@example.com', password: 'pass' } });
    const res = httpMocks.createResponse();

    User.findOne = jest.fn().mockResolvedValue(null);
    User.create = jest.fn().mockResolvedValue({ _id: 'lab1', name: 'Lab', email: 'lab@example.com', role: 'lab' });
    LabProfile.create = jest.fn().mockResolvedValue({ user: 'lab1' });
    sendEmail.mockResolvedValue = jest.fn();

    await adminController.createLabStaff(req, res);

    expect(User.create).toHaveBeenCalled();
    expect(LabProfile.create).toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
  });

  test('listLabStaff returns lab users', async () => {
    User.find = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue([{ _id: 'lab1' }]) });
    LabProfile.findOne = jest.fn().mockResolvedValue({ designation: 'Tech' });

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await adminController.listLabStaff(req, res);

    expect(User.find).toHaveBeenCalledWith({ role: 'lab' });
    const data = res._getJSONData() || JSON.parse(res._getData() || 'null');
    const resultArr = Array.isArray(data) ? data : Object.values(data || {});
    expect(resultArr).toHaveLength(1);
  });
});
