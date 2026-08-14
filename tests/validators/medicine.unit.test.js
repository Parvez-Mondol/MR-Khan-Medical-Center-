const medicine = require('../../validators/medicine');

describe('validators/medicine', () => {
  test('create accepts minimal valid payload', () => {
    const { error } = medicine.create.validate({ name: 'Paracetamol' });
    expect(error).toBeFalsy();
  });

  test('create rejects invalid unit', () => {
    const { error } = medicine.create.validate({ name: 'X', unit: 'invalid' });
    expect(error).toBeTruthy();
  });
});
