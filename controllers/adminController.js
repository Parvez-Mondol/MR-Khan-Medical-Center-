const bcrypt = require('bcryptjs');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const LabProfile = require('../models/LabProfile');
const sendEmail = require('../utils/sendEmail');

// @route GET /api/admin/pending-users
// Lists doctors + outsider patients still waiting on document review.
// (Students / Teacher & Staff on a matching university email skip this
// entirely — see authController.js.)
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ verificationStatus: 'pending' })
      .select('-passwordHash -emailVerificationToken');

    const withProfiles = await Promise.all(
      users.map(async (user) => {
        const profile =
          user.role === 'doctor'
            ? await DoctorProfile.findOne({ user: user._id })
            : await PatientProfile.findOne({ user: user._id });
        return { user, profile };
      })
    );

    res.json(withProfiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/admin/users/:id/approve
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.verificationStatus = 'verified';
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Your MR. Khan Medical Center account is approved',
      html: `<p>Hi ${user.name}, your account has been approved. You can now log in.</p>`,
    });

    res.json({ message: 'User approved', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/admin/users/:id/reject
// @body { reason?: string }
exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.verificationStatus = 'rejected';
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Your MR. Khan Medical Center registration',
      html: `<p>Hi ${user.name}, unfortunately your registration could not be approved.${
        req.body.reason ? ` Reason: ${req.body.reason}` : ''
      }</p>`,
    });

    res.json({ message: 'User rejected', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/admin/lab-staff   (admin only)
// Lab staff don't self-register — Admin creates the login directly and it's
// usable immediately (no email verification, no approval step needed).
// @body { name, email, password, designation? }
exports.createLabStaff = async (req, res) => {
  try {
    const { name, email, password, designation } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'lab',
      isEmailVerified: true,
      verificationStatus: 'verified',
    });

    await LabProfile.create({
      user: user._id,
      designation: designation || 'Lab Technician',
    });

    await sendEmail({
      to: user.email,
      subject: 'Your MR. Khan Medical Center lab staff account',
      html: `<p>Hi ${name}, an account has been created for you.</p><p>Email: ${user.email}<br/>Temporary password: ${password}</p>`,
    });

    res.status(201).json({
      message: 'Lab staff account created',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/admin/lab-staff   (admin only)
exports.listLabStaff = async (req, res) => {
  try {
    const users = await User.find({ role: 'lab' }).select('-passwordHash');
    const withProfiles = await Promise.all(
      users.map(async (user) => {
        const profile = await LabProfile.findOne({ user: user._id });
        return { user, profile };
      })
    );
    res.json(withProfiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};