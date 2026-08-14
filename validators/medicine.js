const Joi = (() => { try { return require('joi'); } catch { return null; } })();

if (Joi) {
  exports.create = Joi.object({
    name: Joi.string().min(1).required(),
    genericName: Joi.string().allow('', null),
    category: Joi.string().allow('', null),
    unit: Joi.string().valid('tablet', 'capsule', 'syrup', 'injection', 'ointment', 'other').optional(),
    stockQuantity: Joi.number().integer().min(0).optional(),
    reorderThreshold: Joi.number().integer().min(0).optional(),
  });

  exports.adjustStock = Joi.object({ change: Joi.number().required() });

  exports.update = Joi.object({
    name: Joi.string().min(1).optional(),
    genericName: Joi.string().allow('', null).optional(),
    category: Joi.string().allow('', null).optional(),
    unit: Joi.string().valid('tablet', 'capsule', 'syrup', 'injection', 'ointment', 'other').optional(),
    reorderThreshold: Joi.number().integer().min(0).optional(),
  });
} else {
  const passthrough = { validate: () => ({ error: null }) };
  exports.create = passthrough;
  exports.adjustStock = passthrough;
  exports.update = passthrough;
}
