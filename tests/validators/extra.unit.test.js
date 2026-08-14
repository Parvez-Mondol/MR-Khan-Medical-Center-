const auth = require('../../validators/auth');
const medicine = require('../../validators/medicine');
const appointment = require('../../validators/appointment');
const pathology = require('../../validators/pathology');

describe('validators additional checks', () => {
  test('auth refresh and logout require refreshToken', () => {
    expect(auth.refresh.validate({}).error).toBeTruthy();
    expect(auth.logout.validate({}).error).toBeTruthy();
  });

  test('auth password reset and request', () => {
    expect(auth.passwordResetRequest.validate({}).error).toBeTruthy();
    expect(auth.passwordReset.validate({ token: 't', newPassword: '123456' }).error).toBeFalsy();
  });

  test('medicine adjustStock and update schema', () => {
    expect(medicine.adjustStock.validate({ change: 10 }).error).toBeFalsy();
    expect(medicine.adjustStock.validate({ change: 'x' }).error).toBeTruthy();
    expect(medicine.update.validate({ unit: 'tablet' }).error).toBeFalsy();
    expect(medicine.update.validate({ unit: 'invalid' }).error).toBeTruthy();
  });

  test('appointment updateStatus enum validation', () => {
    expect(appointment.updateStatus.validate({ status: 'confirmed' }).error).toBeFalsy();
    expect(appointment.updateStatus.validate({ status: 'unknown' }).error).toBeTruthy();
  });

  test('pathology submitResult requires requestId', () => {
    expect(pathology.submitResult.validate({}).error).toBeTruthy();
    expect(pathology.submitResult.validate({ requestId: 'r1' }).error).toBeFalsy();
  });
});
