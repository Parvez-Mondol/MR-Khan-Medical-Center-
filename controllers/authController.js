const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');

const genToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });

const genRefreshToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email and password are required' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'patient',
      isEmailVerified: false,
      verificationStatus: role === 'patient' ? 'verified' : 'pending',
    });

    // Create a minimal profile for patients/doctors so other controllers
    // that expect a profile won't immediately fail.
    if (user.role === 'patient') {
      await PatientProfile.create({ user: user._id, patientType: 'outsider' });
    } else if (user.role === 'doctor') {
      await DoctorProfile.create({ user: user._id, designation: 'MO' });
    }

    const token = genToken(user);
    const refreshToken = genRefreshToken(user);
    user.refreshTokens = (user.refreshTokens || []).concat(refreshToken);
    await user.save();
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = genToken(user);
    const refreshToken = genRefreshToken(user);
    user.refreshTokens = (user.refreshTokens || []).concat(refreshToken);
    await user.save();
    res.json({ token, refreshToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.me = async (req, res) => {
  res.json(req.user);
};

// POST /api/auth/refresh  { refreshToken }
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' });

    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (e) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ message: 'Refresh token not recognized' });
    }

    const token = genToken(user);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/password-reset-request  { email }
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(200).json({ message: 'If that email exists we sent reset instructions' });

    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const sendEmail = require('../utils/sendEmail');
    await sendEmail({
      to: user.email,
      subject: 'Reset your MR. Khan Medical Center password',
      html: `<p>Click the link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    res.json({ message: 'If that email exists we sent reset instructions' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/password-reset  { token, newPassword }
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'token and newPassword are required' });

    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/logout  { refreshToken }
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' });

    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (e) {
      // If token invalid, treat as already revoked
      return res.json({ message: 'Logged out' });
    }

    const user = await User.findById(payload.id);
    if (!user) return res.json({ message: 'Logged out' });

    user.refreshTokens = (user.refreshTokens || []).filter((t) => t !== refreshToken);
    await user.save();

    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
