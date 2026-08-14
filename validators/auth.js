
let Joi;
try {
  Joi = require('joi');
} catch (e) {
  console.warn('`joi` is not installed — request validation will be a no-op. Run `npm install joi` to enable strict validation.');
  Joi = null;
}

if (Joi) {
  exports.register = Joi.object({
    name: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'doctor', 'patient', 'lab').optional(),
  });

  exports.login = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  exports.refresh = Joi.object({ refreshToken: Joi.string().required() });

  exports.passwordResetRequest = Joi.object({ email: Joi.string().email().required() });

  exports.passwordReset = Joi.object({ token: Joi.string().required(), newPassword: Joi.string().min(6).required() });

  exports.logout = Joi.object({ refreshToken: Joi.string().required() });
} else {
  // Fallback permissive schemas: objects with a `validate` method that
  // always return { error: null } so `validate` middleware passes.
  const passthrough = { validate: () => ({ error: null }) };
  exports.register = passthrough;
  exports.login = passthrough;
  exports.refresh = passthrough;
  exports.passwordResetRequest = passthrough;
  exports.passwordReset = passthrough;
  exports.logout = passthrough;
}
