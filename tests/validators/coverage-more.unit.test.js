const auth = require('../../validators/auth');
const appointment = require('../../validators/appointment');
const medicine = require('../../validators/medicine');
const pathology = require('../../validators/pathology');

describe('validators - coverage more branches', () => {
  test('auth.register rejects short password and invalid role', () => {
    expect(auth.register.validate({ name: 'X', email: 'x@x.com', password: '123' }).error).toBeTruthy();
    const res = auth.register.validate({ name: 'X', email: 'x@x.com', password: '123456', role: 'bogus' });
    expect(res.error).toBeTruthy();
  });

  test('auth.register accepts valid role values', () => {
    ['admin', 'doctor', 'patient', 'lab'].forEach(role => {
      const { error } = auth.register.validate({ name: 'X', email: 'x@x.com', password: '123456', role });
      expect(error).toBeFalsy();
    });
  });

  test('appointment.book allows empty reasonForVisit and null', () => {
    expect(appointment.book.validate({ doctorId: 'd1', date: '2026-08-14', timeSlot: '10:00', reasonForVisit: '' }).error).toBeFalsy();
    expect(appointment.book.validate({ doctorId: 'd1', date: '2026-08-14', timeSlot: '10:00', reasonForVisit: null }).error).toBeFalsy();
  });

  test('medicine.create accepts optional numeric fields and rejects negative stock', () => {
    expect(medicine.create.validate({ name: 'Med', stockQuantity: 0, reorderThreshold: 0 }).error).toBeFalsy();
    expect(medicine.create.validate({ name: 'Med', stockQuantity: -1 }).error).toBeTruthy();
  });

  test('medicine.adjustStock requires numeric change', () => {
    expect(medicine.adjustStock.validate({ change: 'a' }).error).toBeTruthy();
    expect(medicine.adjustStock.validate({ change: -5 }).error).toBeFalsy();
  });

  test('pathology.createRequest rejects missing patientId or empty testTypes', () => {
    expect(pathology.createRequest.validate({ testTypes: ['a'] }).error).toBeTruthy();
    expect(pathology.createRequest.validate({ patientId: 'p1', testTypes: [] }).error).toBeTruthy();
  });

  test('pathology.submitResult accepts resultData object and optional url', () => {
    expect(pathology.submitResult.validate({ requestId: 'r1', resultData: { a: 1 } }).error).toBeFalsy();
    expect(pathology.submitResult.validate({ requestId: 'r1', resultFileUrl: 'https://ex.com/x' }).error).toBeFalsy();
  });
});
