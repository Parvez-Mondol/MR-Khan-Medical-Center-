jest.mock('../../models/PathologyRequest');
jest.mock('../../models/PathologyResult');
const PathologyRequest = require('../../models/PathologyRequest');
const PathologyResult = require('../../models/PathologyResult');
const ctrl = require('../../controllers/pathologyController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => jest.resetAllMocks());

test('createRequest validates input and creates', async () => {
  const res1 = mockRes();
  await ctrl.createRequest({ body: {} }, res1);
  expect(res1.status).toHaveBeenCalledWith(400);

  const req = { body: { patientId: 'p1', testTypes: ['CBC'] }, user: { _id: 'd1' } };
  const res2 = mockRes();
  PathologyRequest.create.mockResolvedValue({ id: 'r1' });
  await ctrl.createRequest(req, res2);
  expect(PathologyRequest.create).toHaveBeenCalled();
  expect(res2.status).toHaveBeenCalledWith(201);
});

test('listRequests filters by role', async () => {
  const chain = { populate: jest.fn().mockReturnThis(), sort: jest.fn().mockResolvedValue([{ id: 'r' }]) };
  PathologyRequest.find.mockReturnValue(chain);

  const resDoc = mockRes();
  await ctrl.listRequests({ user: { role: 'doctor', _id: 'd1' }, query: {} }, resDoc);
  expect(PathologyRequest.find).toHaveBeenCalledWith({ requestedByDoctor: 'd1' });

  const resPat = mockRes();
  await ctrl.listRequests({ user: { role: 'patient', _id: 'p1' }, query: {} }, resPat);
  expect(PathologyRequest.find).toHaveBeenCalledWith({ patient: 'p1' });

  const resAdmin = mockRes();
  await ctrl.listRequests({ user: { role: 'admin' }, query: { status: 'requested' } }, resAdmin);
  expect(PathologyRequest.find).toHaveBeenCalledWith({ status: 'requested' });
});

test('getRequest handles not found and permissions', async () => {
  const res1 = mockRes();
  PathologyRequest.findById.mockReturnValue({ populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(null) }) });
  await ctrl.getRequest({ params: { id: 'x' }, user: { role: 'doctor', _id: 'd1' } }, res1);
  expect(res1.status).toHaveBeenCalledWith(404);

  const reqObj = { _id: 'r1', requestedByDoctor: { _id: 'd2' }, patient: { _id: 'p2' } };
  PathologyRequest.findById.mockReturnValue({ populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(reqObj) }) });
  PathologyResult.findOne.mockResolvedValue(null);
  const res2 = mockRes();
  // doctor not owner
  await ctrl.getRequest({ params: { id: 'x' }, user: { role: 'doctor', _id: 'd1' } }, res2);
  expect(res2.status).toHaveBeenCalledWith(403);

  // patient owner
  const res3 = mockRes();
  await ctrl.getRequest({ params: { id: 'x' }, user: { role: 'patient', _id: 'p2' } }, res3);
  expect(PathologyResult.findOne).toHaveBeenCalled();
  expect(res3.json).toHaveBeenCalledWith(expect.objectContaining({ request: reqObj, result: null }));
});

test('startRequest and submitResult branches', async () => {
  const res1 = mockRes();
  PathologyRequest.findById.mockResolvedValue(null);
  await ctrl.startRequest({ params: { id: 'x' } }, res1);
  expect(res1.status).toHaveBeenCalledWith(404);

  const reqObj = { status: 'in_progress', save: jest.fn() };
  PathologyRequest.findById.mockResolvedValue({ status: 'requested', save: jest.fn() });
  const res2 = mockRes();
  await ctrl.startRequest({ params: { id: 'x' } }, res2);
  expect(res2.json).toHaveBeenCalled();

  // submitResult validations
  const res3 = mockRes();
  await ctrl.submitResult({ body: {} }, res3);
  expect(res3.status).toHaveBeenCalledWith(400);

  const res4 = mockRes();
  PathologyRequest.findById.mockResolvedValue(null);
  await ctrl.submitResult({ body: { requestId: 'r1' } }, res4);
  expect(res4.status).toHaveBeenCalledWith(404);

  const res5 = mockRes();
  PathologyRequest.findById.mockResolvedValue({ _id: 'r1', status: 'requested', save: jest.fn() });
  PathologyResult.findOne.mockResolvedValue({});
  await ctrl.submitResult({ body: { requestId: 'r1' }, user: { _id: 'l1' } }, res5);
  expect(res5.status).toHaveBeenCalledWith(400);

  const res6 = mockRes();
  PathologyResult.findOne.mockResolvedValue(null);
  PathologyResult.create.mockResolvedValue({ id: 'res1' });
  PathologyRequest.findById.mockResolvedValue({ _id: 'r1', status: 'requested', save: jest.fn() });
  await ctrl.submitResult({ body: { requestId: 'r1', resultData: {} }, user: { _id: 'l1' } }, res6);
  expect(PathologyResult.create).toHaveBeenCalled();
  expect(res6.status).toHaveBeenCalledWith(201);
});
