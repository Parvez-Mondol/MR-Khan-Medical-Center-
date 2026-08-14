const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  genericName: { type: String, trim: true },
  category: { type: String },
  unit: { type: String, enum: ['tablet', 'capsule', 'syrup', 'injection', 'ointment', 'other'], default: 'tablet' },
  stockQuantity: { type: Number, default: 0, min: 0 },
  reorderThreshold: { type: Number, default: 10 },
}, { timestamps: true });

// Text index powers the "type a few letters, get suggestions" autocomplete
// in the prescription form.
medicineSchema.index({ name: 'text', genericName: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);
