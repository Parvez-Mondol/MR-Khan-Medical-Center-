const mongoose = require('mongoose');

// Kept thin on purpose - lab staff accounts are created by Admin, not
// self-registered, so there's no verification/document flow to model here.
const labProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  designation: { type: String, default: 'Lab Technician' },
}, { timestamps: true });

module.exports = mongoose.model('LabProfile', labProfileSchema);
