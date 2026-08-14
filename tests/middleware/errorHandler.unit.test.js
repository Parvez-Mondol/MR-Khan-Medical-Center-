const errorHandler = require('../../middleware/errorHandler');

test('errorHandler logs and returns status/message', () => {
  const err = new Error('boom');
  err.status = 418;
  const req = {};
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  errorHandler(err, req, res, next);
  expect(spy).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(418);
  expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
  spy.mockRestore();
});
