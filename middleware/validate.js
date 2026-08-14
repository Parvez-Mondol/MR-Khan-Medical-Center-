// Simple Joi-based request body validator middleware
module.exports = (schema) => (req, res, next) => {
  if (!schema) return next();
  const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: false });
  if (error) {
    const details = error.details.map((d) => ({ message: d.message, path: d.path }));
    return res.status(400).json({ message: 'Validation failed', details });
  }
  next();
};
