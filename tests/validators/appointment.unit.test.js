const appointment = require('../../validators/appointment');

describe('validators/appointment', () => {
  test('book accepts valid date and timeSlot', () => {
    const { error } = appointment.book.validate({ doctorId: 'd1', date: '2026-08-14', timeSlot: '09:00' });
    expect(error).toBeFalsy();
  });

  test('book rejects invalid date format', () => {
    const { error } = appointment.book.validate({ doctorId: 'd1', date: '14-08-2026', timeSlot: '09:00' });
    expect(error).toBeTruthy();
  });
});
