const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const appointmentSchemas = require('../validators/appointment');
const {
  getAvailableSlots,
  bookAppointment,
  getMyAppointments,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');

router.get('/available-slots/:doctorId', protect, getAvailableSlots);
router.post('/', protect, requireRole('patient'), validate(appointmentSchemas.book), bookAppointment);
router.get('/mine', protect, getMyAppointments);
router.patch('/:id/status', protect, validate(appointmentSchemas.updateStatus), updateAppointmentStatus);

module.exports = router;