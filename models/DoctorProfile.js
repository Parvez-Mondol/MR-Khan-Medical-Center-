const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema({
  day: { type: String, enum: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], required: true },
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true },   // "13:00"
  slotDurationMins: { type: Number, default: 15 },
}, { _id: false });

const doctorProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  designation: { type: String, enum: ['CMO', 'MO'], required: true },
  specialization: { type: String },
  department: { type: String },
  signatureUrl: { type: String }, // printed on the generated prescription
  availability: [availabilitySlotSchema],
}, { timestamps: true });

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
