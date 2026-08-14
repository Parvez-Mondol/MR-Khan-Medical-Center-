const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  patientType: { type: String, enum: ['student', 'teacher_staff', 'outsider'], required: true },
  studentOrEmployeeId: { type: String },
  departmentOrFaculty: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  bloodGroup: { type: String },
  address: { type: String },
  emergencyContact: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
