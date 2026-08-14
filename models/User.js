const mongoose = require('mongoose');

// The single source of truth for login + identity, for every role.
// Role-specific details live in DoctorProfile / PatientProfile / LabProfile,
// each pointing back here via a "user" reference.
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'doctor', 'patient', 'lab'], required: true },
  phone: { type: String },
  profilePhotoUrl: { type: String },

  // Students/teachers auto-verify off a university email match; outsiders,
  // doctors and lab staff go through Admin document review.
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  documentUrls: [{ type: String }],
  isEmailVerified: { type: Boolean, default: false },
  // Refresh tokens and password-reset fields support longer auth flows.
  refreshTokens: [{ type: String }],
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
