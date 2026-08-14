const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const {
  getPendingUsers,
  approveUser,
  rejectUser,
  createLabStaff,
  listLabStaff,
} = require('../controllers/adminController');

// Every route below requires a valid JWT AND role === 'admin'
router.use(protect, requireRole('admin'));

router.get('/pending-users', getPendingUsers);
router.patch('/users/:id/approve', approveUser);
router.patch('/users/:id/reject', rejectUser);
router.post('/lab-staff', createLabStaff);
router.get('/lab-staff', listLabStaff);

module.exports = router;