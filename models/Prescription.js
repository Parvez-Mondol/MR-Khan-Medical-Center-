const mongoose = require('mongoose');

const medicineLineSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
  // Frozen at write-time so this line still reads correctly even if the
  // medicine is later renamed or removed from inventory.
  nameSnapshot: { type: String, required: true },
  dosage: {
    morning: { type: Number, default: 0 },
    noon: { type: Number, default: 0 },
    night: { type: Number, default: 0 },
  },
  beforeOrAfterMeal: { type: String, enum: ['before', 'after'], default: 'after' },
  durationDays: { type: Number, required: true },
  instructions: { type: String },
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  notes: { type: String },
  linkedPathologyResults: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PathologyResult' }],
  medicines: [medicineLineSchema],
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
