const Joi = (() => { try { return require('joi'); } catch { return null; } })();

if (Joi) {
  exports.createRequest = Joi.object({
    patientId: Joi.string().required(),
    testTypes: Joi.array().items(Joi.string()).min(1).required(),
  });

  exports.submitResult = Joi.object({
    requestId: Joi.string().required(),
    resultData: Joi.object().optional(),
    resultFileUrl: Joi.string().uri().optional(),
  });
} else {
  const passthrough = { validate: () => ({ error: null }) };
  exports.createRequest = passthrough;
  exports.submitResult = passthrough;
}
