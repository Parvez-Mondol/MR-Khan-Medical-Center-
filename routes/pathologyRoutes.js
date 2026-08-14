const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const pathologySchemas = require('../validators/pathology');
const {
  createRequest,
  listRequests,
  getRequest,
  startRequest,
  submitResult,
} = require('../controllers/pathologyController');

// Everyone below must be logged in; specific role checks are per-route.
router.use(protect);

router.post('/requests', requireRole('doctor'), validate(pathologySchemas.createRequest), createRequest);
router.get('/requests', listRequests); // doctor/patient/lab/admin all allowed — filtered inside the controller
router.get('/requests/:id', getRequest);
router.patch('/requests/:id/start', requireRole('lab'), startRequest);
router.post('/results', requireRole('lab'), validate(pathologySchemas.submitResult), submitResult);

module.exports = router;