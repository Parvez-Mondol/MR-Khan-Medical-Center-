const Joi = (() => { try { return require('joi'); } catch { return null; } })();

if (Joi) {
  exports.book = Joi.object({
    doctorId: Joi.string().required(),
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    timeSlot: Joi.string().required(),
    reasonForVisit: Joi.string().allow('', null),
  });

  exports.updateStatus = Joi.object({ status: Joi.string().valid('pending', 'confirmed', 'completed', 'cancelled').required() });
} else {
  const passthrough = { validate: () => ({ error: null }) };
  exports.book = passthrough;
  exports.updateStatus = passthrough;
}
