const Medicine = require('../models/Medicine');

// @route GET /api/medicines/search?q=par   (admin or doctor)
// Powers the "type a few letters, get suggestions" autocomplete in the
// prescription form. Uses a case-insensitive prefix match instead of the
// $text index, because $text matches whole words — it wouldn't match
// "par" against "Paracetamol" the way a real autocomplete needs to.
exports.searchMedicines = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) return res.json([]);

    const regex = new RegExp('^' + q.trim(), 'i');
    const medicines = await Medicine.find({
      $or: [{ name: regex }, { genericName: regex }],
    }).limit(10);

    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/medicines   (admin or doctor)
// @body { name, genericName, category, unit, stockQuantity?, reorderThreshold? }
exports.createMedicine = async (req, res) => {
  try {
    const { name, genericName, category, unit, stockQuantity, reorderThreshold } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });

    const medicine = await Medicine.create({
      name,
      genericName,
      category,
      unit,
      stockQuantity: stockQuantity || 0,
      reorderThreshold: reorderThreshold ?? 10,
    });

    res.status(201).json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/medicines   (admin or doctor)
exports.listMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ name: 1 });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/medicines/low-stock   (admin or doctor)
// Anything at or below its reorder threshold — for a restock-alert view.
exports.listLowStock = async (req, res) => {
  try {
    const medicines = await Medicine.find({ $expr: { $lte: ['$stockQuantity', '$reorderThreshold'] } });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/medicines/:id
exports.getMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/medicines/:id   (admin or doctor)
exports.updateMedicine = async (req, res) => {
  try {
    const { name, genericName, category, unit, reorderThreshold } = req.body;
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { name, genericName, category, unit, reorderThreshold },
      { new: true, runValidators: true }
    );
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/medicines/:id/stock   (admin only)
// @body { change: number }   e.g. 500 for a new shipment arriving,
// -20 to write off damaged/expired stock.
// NOTE: this is the manual/admin side of inventory. The automatic side —
// stock dropping because a doctor prescribed it — gets wired in when the
// Prescription engine is built (it reuses this same subtract-and-check
// pattern from inside prescriptionController.js).
exports.adjustStock = async (req, res) => {
  try {
    const { change } = req.body;
    if (typeof change !== 'number') {
      return res.status(400).json({ message: 'change must be a number (e.g. 500 or -20)' });
    }

    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

    const newQuantity = medicine.stockQuantity + change;
    if (newQuantity < 0) {
      return res.status(400).json({ message: `Not enough stock — only ${medicine.stockQuantity} left` });
    }

    medicine.stockQuantity = newQuantity;
    await medicine.save();

    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/medicines/:id   (admin only)
exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json({ message: 'Medicine deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};