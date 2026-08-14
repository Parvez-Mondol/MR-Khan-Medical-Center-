const Joi = require('joi');
const validate = require('../../middleware/validate');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

test('validate passes through when no schema', () => {
  const mw = validate(null);
  const next = jest.fn();
  mw({}, {}, next);
  expect(next).toHaveBeenCalled();
});

test('validate returns 400 on invalid body', () => {
  const schema = Joi.object({ name: Joi.string().required() });
  const mw = validate(schema);
  const req = { body: {} };
  const res = mockRes();
  const next = jest.fn();
  mw(req, res, next);
  expect(res.status).toHaveBeenCalledWith(400);
});

test('validate calls next on valid body', () => {
  const schema = Joi.object({ name: Joi.string().required() });
  const mw = validate(schema);
  const req = { body: { name: 'ok' } };
  const res = mockRes();
  const next = jest.fn();
  mw(req, res, next);
  expect(next).toHaveBeenCalled();
});
