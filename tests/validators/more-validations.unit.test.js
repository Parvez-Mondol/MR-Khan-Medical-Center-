const auth = require('../../validators/auth');
const appointment = require('../../validators/appointment');
const medicine = require('../../validators/medicine');
const pathology = require('../../validators/pathology');

describe('validators - additional cases', () => {
  test('auth refresh and logout require refreshToken', () => {
    expect(auth.refresh.validate({}).error).toBeTruthy();
    expect(auth.logout.validate({}).error).toBeTruthy();
    expect(auth.refresh.validate({ refreshToken: 'rt' }).error).toBeFalsy();
    expect(auth.logout.validate({ refreshToken: 'rt' }).error).toBeFalsy();
  });

  test('auth password reset request and reset', () => {
    expect(auth.passwordResetRequest.validate({}).error).toBeTruthy();
    expect(auth.passwordResetRequest.validate({ email: 'x@x.com' }).error).toBeFalsy();

    expect(auth.passwordReset.validate({}).error).toBeTruthy();
    expect(auth.passwordReset.validate({ token: 't', newPassword: '123456' }).error).toBeFalsy();
  });

  test('appointment updateStatus schema', () => {
    expect(appointment.updateStatus.validate({}).error).toBeTruthy();
    expect(appointment.updateStatus.validate({ status: 'confirmed' }).error).toBeFalsy();
    expect(appointment.updateStatus.validate({ status: 'bogus' }).error).toBeTruthy();
  });

  test('medicine adjustStock and update schemas', () => {
    expect(medicine.adjustStock.validate({}).error).toBeTruthy();
    expect(medicine.adjustStock.validate({ change: 5 }).error).toBeFalsy();

    expect(medicine.update.validate({}).error).toBeFalsy();
    expect(medicine.update.validate({ unit: 'tablet' }).error).toBeFalsy();
    expect(medicine.update.validate({ unit: 'invalid' }).error).toBeTruthy();
  });

  test('pathology submitResult optional fields', () => {
    expect(pathology.submitResult.validate({}).error).toBeTruthy();
    expect(pathology.submitResult.validate({ requestId: 'r1' }).error).toBeFalsy();
    expect(pathology.submitResult.validate({ requestId: 'r1', resultFileUrl: 'http://example.com/x' }).error).toBeFalsy();
    expect(pathology.submitResult.validate({ requestId: 'r1', resultFileUrl: 'not-a-url' }).error).toBeTruthy();
  });
});
