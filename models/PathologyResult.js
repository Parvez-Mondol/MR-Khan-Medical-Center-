const mongoose = require('mongoose');

const pathologyResultSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'PathologyRequest', required: true, unique: true },
  enteredByLabStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resultData: { type: mongoose.Schema.Types.Mixed }, // structured key/value test results
  resultFileUrl: { type: String }, // optional scanned report upload
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('PathologyResult', pathologyResultSchema);
