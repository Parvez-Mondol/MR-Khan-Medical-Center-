const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { listDoctors, setAvailability } = require('../controllers/doctorController');

router.get('/', protect, listDoctors);
router.put('/availability', protect, requireRole('doctor'), setAvailability);

module.exports = router;