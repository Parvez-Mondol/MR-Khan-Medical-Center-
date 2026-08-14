const PathologyRequest = require('../models/PathologyRequest');
const PathologyResult = require('../models/PathologyResult');

// @route POST /api/pathology/requests   (doctor only)
// @body { patientId, testTypes: ["CBC", "Blood Sugar"] }
exports.createRequest = async (req, res) => {
  try {
    const { patientId, testTypes } = req.body;
    if (!patientId || !Array.isArray(testTypes) || testTypes.length === 0) {
      return res.status(400).json({ message: 'patientId and a non-empty testTypes array are required' });
    }

    const request = await PathologyRequest.create({
      patient: patientId,
      requestedByDoctor: req.user._id,
      testTypes,
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/pathology/requests
// Doctor: sees requests they made. Patient: sees requests made for them.
// Lab/Admin: sees everything — optionally narrowed with ?status=requested
// (that's the lab's "to-do queue" view).
exports.listRequests = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'doctor') filter.requestedByDoctor = req.user._id;
    else if (req.user.role === 'patient') filter.patient = req.user._id;
    else if (req.query.status) filter.status = req.query.status;

    const requests = await PathologyRequest.find(filter)
      .populate('patient', 'name email')
      .populate('requestedByDoctor', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/pathology/requests/:id
// Returns the request plus its result, if one has been submitted yet.
exports.getRequest = async (req, res) => {
  try {
    const request = await PathologyRequest.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('requestedByDoctor', 'name email');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const isAllowed =
      (req.user.role === 'doctor' && String(request.requestedByDoctor._id) === String(req.user._id)) ||
      (req.user.role === 'patient' && String(request.patient._id) === String(req.user._id)) ||
      ['lab', 'admin'].includes(req.user.role);
    if (!isAllowed) return res.status(403).json({ message: 'Not authorized to view this request' });

    const result = await PathologyResult.findOne({ request: request._id });
    res.json({ request, result: result || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/pathology/requests/:id/start   (lab only)
// Optional step — marks a request as being worked on. Not required before
// submitting a result, just useful for a lab dashboard to show progress.
exports.startRequest = async (req, res) => {
  try {
    const request = await PathologyRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'requested') {
      return res.status(400).json({ message: `Request is already "${request.status}"` });
    }
    request.status = 'in_progress';
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/pathology/results   (lab only)
// @body { requestId, resultData, resultFileUrl? }
// Submitting a result automatically marks its request "completed" — this
// is the point where the result becomes something a doctor can attach to
// a prescription later.
exports.submitResult = async (req, res) => {
  try {
    const { requestId, resultData, resultFileUrl } = req.body;
    if (!requestId) return res.status(400).json({ message: 'requestId is required' });

    const request = await PathologyRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const existing = await PathologyResult.findOne({ request: requestId });
    if (existing) return res.status(400).json({ message: 'A result has already been submitted for this request' });

    const result = await PathologyResult.create({
      request: requestId,
      enteredByLabStaff: req.user._id,
      resultData,
      resultFileUrl,
    });

    request.status = 'completed';
    await request.save();

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};