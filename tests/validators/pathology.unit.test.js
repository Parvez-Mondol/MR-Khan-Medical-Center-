const pathology = require('../../validators/pathology');

describe('validators/pathology', () => {
  test('createRequest requires testTypes array', () => {
    const { error } = pathology.createRequest.validate({ patientId: 'p1', testTypes: [] });
    expect(error).toBeTruthy();
  });

  test('createRequest accepts valid payload', () => {
    const { error } = pathology.createRequest.validate({ patientId: 'p1', testTypes: ['cbc'] });
    expect(error).toBeFalsy();
  });
});
