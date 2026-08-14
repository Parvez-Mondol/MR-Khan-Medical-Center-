const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const medicineSchemas = require('../validators/medicine');
const {
  searchMedicines,
  createMedicine,
  listMedicines,
  listLowStock,
  getMedicine,
  updateMedicine,
  adjustStock,
  deleteMedicine,
} = require('../controllers/medicineController');

// Everything here requires login as admin or doctor
router.use(protect, requireRole('admin', 'doctor'));

// IMPORTANT: specific paths like /search and /low-stock must be declared
// before /:id, or Express will try to treat those words as an :id value.
router.get('/search', searchMedicines);
router.get('/low-stock', listLowStock);
router.get('/', listMedicines);
router.post('/', validate(medicineSchemas.create), createMedicine);
router.get('/:id', getMedicine);
router.put('/:id', validate(medicineSchemas.update), updateMedicine);
router.patch('/:id/stock', requireRole('admin'), validate(medicineSchemas.adjustStock), adjustStock);
router.delete('/:id', requireRole('admin'), deleteMedicine);

module.exports = router;