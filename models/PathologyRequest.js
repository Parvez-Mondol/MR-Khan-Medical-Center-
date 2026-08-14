const mongoose = require('mongoose');

const pathologyRequestSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedByDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testTypes: [{ type: String, required: true }],
  status: { type: String, enum: ['requested', 'in_progress', 'completed'], default: 'requested' },
}, { timestamps: true });

module.exports = mongoose.model('PathologyRequest', pathologyRequestSchema);
