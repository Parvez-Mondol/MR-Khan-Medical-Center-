const auth = require('../../validators/auth');
const appointment = require('../../validators/appointment');
const medicine = require('../../validators/medicine');
const pathology = require('../../validators/pathology');

describe('validators additional edge cases', () => {
  test('auth role validation and extra fields', () => {
    const { error: e1 } = auth.register.validate({ name: 'X', email: 'x@x.com', password: '123456', role: 'doctor' });
    expect(e1).toBeFalsy();

    const { error: e2 } = auth.register.validate({ name: 'X', email: 'x@x.com', password: '123456', role: 'invalid' });
    expect(e2).toBeTruthy();
  });

  test('appointment reasonForVisit optional values', () => {
    expect(appointment.book.validate({ doctorId: 'd', date: '2026-08-14', timeSlot: '10:00', reasonForVisit: '' }).error).toBeFalsy();
    expect(appointment.book.validate({ doctorId: 'd', date: '2026-08-14', timeSlot: '10:00', reasonForVisit: null }).error).toBeFalsy();
  });

  test('medicine create with stock and reorder', () => {
    expect(medicine.create.validate({ name: 'Drug', stockQuantity: 10, reorderThreshold: 2 }).error).toBeFalsy();
    expect(medicine.adjustStock.validate({ change: -5 }).error).toBeFalsy();
  });

  test('medicine update accepts empty payload but rejects invalid unit', () => {
    expect(medicine.update.validate({}).error).toBeFalsy();
    expect(medicine.update.validate({ unit: 'capsule' }).error).toBeFalsy();
    expect(medicine.update.validate({ unit: 'bad' }).error).toBeTruthy();
  });

  test('pathology submitResult accepts resultData object', () => {
    expect(pathology.submitResult.validate({ requestId: 'r', resultData: { a: 1 } }).error).toBeFalsy();
    expect(pathology.submitResult.validate({ requestId: 'r', resultFileUrl: 'https://x.com/y' }).error).toBeFalsy();
  });
});
