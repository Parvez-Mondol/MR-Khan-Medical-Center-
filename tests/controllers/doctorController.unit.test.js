const httpMocks = require('node-mocks-http');
const doctorController = require('../../controllers/doctorController');
const User = require('../../models/User');
const DoctorProfile = require('../../models/DoctorProfile');

describe('doctorController', () => {
  afterEach(() => jest.resetAllMocks());

  test('listDoctors returns mapped doctors with profiles', async () => {
    const doctors = [ { _id: 'd1', name: 'Dr A', email: 'a@e' } ];
    User.find = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(doctors) });
    DoctorProfile.findOne = jest.fn().mockResolvedValue({ designation: 'Consultant', specialization: 'Cardiology', department: 'Cardiac' });

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await doctorController.listDoctors(req, res);

    const data = res._getJSONData() || JSON.parse(res._getData() || 'null');
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty('name', 'Dr A');
    expect(DoctorProfile.findOne).toHaveBeenCalled();
  });

  test('setAvailability validates body and handles missing profile', async () => {
    const req1 = httpMocks.createRequest({ body: { availability: 'not-an-array' } });
    const res1 = httpMocks.createResponse();
    await doctorController.setAvailability(req1, res1);
    expect(res1.statusCode).toBe(400);

    const req2 = httpMocks.createRequest({ body: { availability: [] }, user: { _id: 'u1' } });
    const res2 = httpMocks.createResponse();
    DoctorProfile.findOneAndUpdate = jest.fn().mockResolvedValue(null);
    await doctorController.setAvailability(req2, res2);
    expect(res2.statusCode).toBe(404);
  });

  test('setAvailability updates profile and returns it', async () => {
    const updated = { user: 'u1', availability: [{ day: 'Mon' }] };
    DoctorProfile.findOneAndUpdate = jest.fn().mockResolvedValue(updated);
    const req = httpMocks.createRequest({ body: { availability: updated.availability }, user: { _id: 'u1' } });
    const res = httpMocks.createResponse();
    await doctorController.setAvailability(req, res);
    const data = res._getJSONData() || JSON.parse(res._getData() || 'null');
    expect(data).toEqual(updated);
  });
});
