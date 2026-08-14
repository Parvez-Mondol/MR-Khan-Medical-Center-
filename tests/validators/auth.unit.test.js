const auth = require('../../validators/auth');

describe('validators/auth', () => {
  test('register schema rejects missing fields', () => {
    const { error } = auth.register.validate({ name: '', email: 'not-an-email' });
    expect(error).toBeTruthy();
  });

  test('register schema accepts valid input', () => {
    const { error } = auth.register.validate({ name: 'A', email: 'a@b.com', password: 'secret' });
    expect(error).toBeFalsy();
  });

  test('login requires email and password', () => {
    const { error } = auth.login.validate({ email: 'a@b.com' });
    expect(error).toBeTruthy();
  });
});
