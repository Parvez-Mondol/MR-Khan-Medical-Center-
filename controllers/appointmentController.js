const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');

// Turns a doctor's availability windows (e.g. Mon 09:00-13:00, 15min slots)
// into individual bookable slots, then removes ones already taken.
// NOTE: simplified for this project's scope — assumes server and users
// share a timezone. A production system would store times in UTC and
// convert per-user.
const generateSlotsForDay = (windows, bookedSlots) => {
  const slots = [];
  windows.forEach(({ startTime, endTime, slotDurationMins }) => {
    let [h, m] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    while (h < endH || (h === endH && m < endM)) {
      const slotStart = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      m += slotDurationMins;
      while (m >= 60) { m -= 60; h += 1; }
      const slotEnd = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      const label = `${slotStart}-${slotEnd}`;
      if (!bookedSlots.includes(label)) slots.push(label);
    }
  });
  return slots;
};

// @route GET /api/appointments/available-slots/:doctorId?date=YYYY-MM-DD
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date query param required (YYYY-MM-DD)' });

    const doctorProfile = await DoctorProfile.findOne({ user: doctorId });
    if (!doctorProfile) return res.status(404).json({ message: 'Doctor not found' });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = dayNames[new Date(date).getDay()];

    const windows = doctorProfile.availability.filter((slot) => slot.day === dayOfWeek);
    if (windows.length === 0) return res.json({ availableSlots: [] });

    const existing = await Appointment.find({
      doctor: doctorId,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] },
    }).select('timeSlot');

    const availableSlots = generateSlotsForDay(windows, existing.map((a) => a.timeSlot));
    res.json({ availableSlots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/appointments   (patient only)
// @body { doctorId, date, timeSlot, reasonForVisit }
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, reasonForVisit } = req.body;
    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ message: 'doctorId, date and timeSlot are required' });
    }

    const conflict = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (conflict) return res.status(409).json({ message: 'That slot was just taken — pick another' });

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date: new Date(date),
      timeSlot,
      reasonForVisit,
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/appointments/mine
// Returns the caller's own appointments — as patient or as doctor.
exports.getMyAppointments = async (req, res) => {
  try {
    const filter = req.user.role === 'doctor' ? { doctor: req.user._id } : { patient: req.user._id };
    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/appointments/:id/status
// @body { status: 'confirmed' | 'completed' | 'cancelled' }
// Doctors can move a booking through any status; patients may only cancel.
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const isOwnerDoctor = req.user.role === 'doctor' && String(appointment.doctor) === String(req.user._id);
    const isOwnerPatient = req.user.role === 'patient' && String(appointment.patient) === String(req.user._id);
    if (!isOwnerDoctor && !isOwnerPatient) {
      return res.status(403).json({ message: 'Not your appointment' });
    }
    if (isOwnerPatient && status !== 'cancelled') {
      return res.status(403).json({ message: 'Patients can only cancel' });
    }

    appointment.status = status;
    await appointment.save();
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};