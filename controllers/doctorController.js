const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

// @route GET /api/doctors
// List of approved doctors, so a patient has something to pick from before
// booking. Only shows doctors Admin has already verified.
exports.listDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', verificationStatus: 'verified' }).select('name email');

    const withProfiles = await Promise.all(
      doctors.map(async (doc) => {
        const profile = await DoctorProfile.findOne({ user: doc._id });
        return {
          id: doc._id,
          name: doc.name,
          designation: profile?.designation,
          specialization: profile?.specialization,
          department: profile?.department,
        };
      })
    );

    res.json(withProfiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/doctors/availability   (doctor only — sets their own)
// @body { availability: [ { day: 'Mon', startTime: '09:00', endTime: '13:00', slotDurationMins: 15 }, ... ] }
exports.setAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    if (!Array.isArray(availability)) {
      return res.status(400).json({ message: 'availability must be an array' });
    }

    const profile = await DoctorProfile.findOneAndUpdate(
      { user: req.user._id },
      { availability },
      { new: true }
    );
    if (!profile) return res.status(404).json({ message: 'Doctor profile not found' });

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};