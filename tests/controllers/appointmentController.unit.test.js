jest.mock('../../models/Appointment');
jest.mock('../../models/DoctorProfile');
const Appointment = require('../../models/Appointment');
const DoctorProfile = require('../../models/DoctorProfile');
const apptCtrl = require('../../controllers/appointmentController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => jest.resetAllMocks());

test('getAvailableSlots requires date and handles doctor not found', async () => {
  const req1 = { params: { doctorId: 'd1' }, query: {} };
  const res1 = mockRes();
  await apptCtrl.getAvailableSlots(req1, res1);
  expect(res1.status).toHaveBeenCalledWith(400);

  const req2 = { params: { doctorId: 'd1' }, query: { date: '2026-08-17' } };
  const res2 = mockRes();
  DoctorProfile.findOne.mockResolvedValue(null);
  await apptCtrl.getAvailableSlots(req2, res2);
  expect(res2.status).toHaveBeenCalledWith(404);
});

test('getAvailableSlots returns slots excluding booked', async () => {
  const date = '2026-08-17'; // Monday
  const req = { params: { doctorId: 'd1' }, query: { date } };
  const res = mockRes();
  DoctorProfile.findOne.mockResolvedValue({ availability: [{ day: 'Mon', startTime: '09:00', endTime: '09:30', slotDurationMins: 15 }] });
  Appointment.find.mockReturnValue({ select: jest.fn().mockResolvedValue([{ timeSlot: '09:00-09:15' }]) });
  await apptCtrl.getAvailableSlots(req, res);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ availableSlots: expect.any(Array) }));
});

test('bookAppointment validations and conflict handling', async () => {
  const res1 = mockRes();
  await apptCtrl.bookAppointment({ body: {} , user: { _id: 'p1' }}, res1);
  expect(res1.status).toHaveBeenCalledWith(400);

  const req2 = { body: { doctorId: 'd1', date: '2026-08-17', timeSlot: '09:00-09:15' }, user: { _id: 'p1' } };
  const res2 = mockRes();
  Appointment.findOne.mockResolvedValue({});
  await apptCtrl.bookAppointment(req2, res2);
  expect(res2.status).toHaveBeenCalledWith(409);

  const res3 = mockRes();
  Appointment.findOne.mockResolvedValue(null);
  Appointment.create.mockResolvedValue({ id: 'a1' });
  await apptCtrl.bookAppointment(req2, res3);
  expect(Appointment.create).toHaveBeenCalled();
  expect(res3.status).toHaveBeenCalledWith(201);
});

test('getMyAppointments returns appointments for patient and doctor', async () => {
  const reqPatient = { user: { role: 'patient', _id: 'p1' } };
  const res1 = mockRes();
  const chain = { populate: jest.fn().mockReturnThis(), sort: jest.fn().mockResolvedValue([{ id: 'a' }]) };
  chain.populate = jest.fn().mockReturnThis();
  Appointment.find.mockReturnValue(chain);
  await apptCtrl.getMyAppointments(reqPatient, res1);
  expect(res1.json).toHaveBeenCalledWith([{ id: 'a' }]);

  const reqDoctor = { user: { role: 'doctor', _id: 'd1' } };
  const res2 = mockRes();
  Appointment.find.mockReturnValue(chain);
  await apptCtrl.getMyAppointments(reqDoctor, res2);
  expect(res2.json).toHaveBeenCalledWith([{ id: 'a' }]);
});

test('updateAppointmentStatus validations and permissions', async () => {
  const reqNotFound = { params: { id: 'x' }, body: {}, user: { role: 'doctor', _id: 'd1' } };
  const res1 = mockRes();
  Appointment.findById.mockResolvedValue(null);
  await apptCtrl.updateAppointmentStatus(reqNotFound, res1);
  expect(res1.status).toHaveBeenCalledWith(404);

  const appt = { doctor: 'd1', patient: 'p1', save: jest.fn() };
  Appointment.findById.mockResolvedValue(appt);
  // patient trying to set non-cancelled
  const reqPatient = { params: { id: 'x' }, body: { status: 'confirmed' }, user: { role: 'patient', _id: 'p1' } };
  const res2 = mockRes();
  await apptCtrl.updateAppointmentStatus(reqPatient, res2);
  expect(res2.status).toHaveBeenCalledWith(403);

  // doctor updating allowed status
  const reqDoc = { params: { id: 'x' }, body: { status: 'confirmed' }, user: { role: 'doctor', _id: 'd1' } };
  const res3 = mockRes();
  await apptCtrl.updateAppointmentStatus(reqDoc, res3);
  expect(appt.save).toHaveBeenCalled();
  expect(res3.json).toHaveBeenCalledWith(appt);
});
