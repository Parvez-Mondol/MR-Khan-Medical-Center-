# MR. Khan Medical Center — Project Handoff & Plan

**Purpose of this document:** If this chat gets cut off or hits a length limit,
paste this whole file into a new chat with any capable AI (or hand it to
another engineer) along with your current project folder, and say:
*"Continue building this project from where the plan below leaves off."*
Everything needed to continue without re-explaining the project is here.

---

## 1. What this project is

**MR. Khan Medical Center** — a university medical center management system,
built with the MERN stack (MongoDB, Express, React, Node.js).

**Who's building it:** One person, solo, on a timeline of a few weeks.
**Why:** Final-year academic project (not a real production deployment).
**Builder's coding background:** Wants the AI to drive decisions and write
all the code; wants things explained in plain language, not assumed
knowledge of JS/programming. Prefers to receive only new/changed files
with exact paths to copy-paste, not full project zips.

## 2. Roles and permissions

- **Admin** — top-level. Approves/rejects pending Doctor and Outsider-patient
  registrations. Creates Lab Staff accounts directly (Lab staff do not
  self-register).
- **Doctor** — two designations: `CMO` (Chief Medical Officer, head of the
  center) and `MO` (Medical Officer). Both currently have the same API
  permissions; CMO vs MO extra powers were flagged as an open idea but never
  built — not currently enforced anywhere in code.
- **Patient** — three types: `student`, `teacher_staff`, `outsider`.
  - Student / Teacher & Staff: if their registration email matches a
    university domain, they're **auto-verified** — no document review needed.
  - Outsider: always needs Admin to review uploaded documents and approve.
- **Lab / Pathology staff** — enters pathology test results. Accounts are
  created by Admin via a dedicated endpoint (built — see Section 6).

## 3. Key decisions made along the way (don't re-litigate these)

- Single `User` collection for auth/identity across all roles, with separate
  `DoctorProfile` / `PatientProfile` / `LabProfile` collections holding
  role-specific fields, each linked back via a `user` reference.
- No separate "prescription/appointment history" collection — a patient's
  history is just their `Prescription` and `Appointment` records queried by
  `patientId`, sorted by date.
- Prescriptions store a **frozen `nameSnapshot`** of each medicine at the
  time the prescription is written, so edits/deletes to the `Medicine`
  collection later don't corrupt old prescriptions.
- Auth uses a **single JWT** (30-day expiry), not an access+refresh pair —
  simpler, and appropriate for this project's scope/timeline.
- Email sending goes through `utils/sendEmail.js`, which **logs to the
  console instead of sending** if `SMTP_HOST` isn't set in `.env` — so the
  full register→verify→approve flow can be tested without a real mail
  account.
- University email domains are hardcoded in `controllers/authController.js`
  as `UNIVERSITY_EMAIL_DOMAINS = ['university.edu', 'uni.ac.bd']` —
  **placeholder values, must be swapped for the real domain(s).**
- Medicine autocomplete uses a **case-insensitive prefix regex**
  (`^query`), not MongoDB's `$text` index — `$text` matches whole words, so
  it wouldn't match "par" against "Paracetamol" the way autocomplete needs.
  The text index still exists on the `Medicine` model but isn't queried.
- Inventory stock changes are manual via `PATCH /api/medicines/:id/stock`
  for now (Admin records shipments in / write-offs out). Automatic
  decrement-on-prescription is planned but **not built yet** — see backlog.
- Pathology: doctor creates a request → lab staff optionally marks
  `in_progress` → lab staff submits a result, which auto-marks the request
  `completed`. One result per request (enforced in code).
- Scope was deliberately trimmed for the few-weeks solo timeline:
  - **Full effort:** Auth, Prescription engine (the star feature)
  - **Simplified:** Appointments (basic slot booking, no complex conflict
    resolution), Inventory (CRUD + manual stock adjustment, no expiry/batch
    tracking), Pathology (request → result, no fancy report templates),
    Admin approval (manual view + approve/reject, no real KYC service)
  - **Cut for v1 / stretch goals only:** Notifications (email/SMS beyond
    what auth already sends), a polished PDF export (a print-friendly CSS
    view is an acceptable substitute if time is short)
- Working convention: **the AI gives only new/changed files with exact file
  paths to copy-paste, not full project zips.** Every file is syntax-checked
  (`node -c`) in a sandbox before being handed over.
- User has said: don't keep asking clarifying questions — make the sensible
  engineering call and proceed, explaining what was done and why afterward.
  Assume no coding background — explain things in plain language.

## 4. Current file structure (backend)

```
khan-medical-center-backend/
  .env.example
  README.md
  package.json
  server.js
  config/
    db.js
  models/
    User.js
    DoctorProfile.js
    PatientProfile.js
    LabProfile.js
    Appointment.js
    Medicine.js
    PathologyRequest.js
    PathologyResult.js
    Prescription.js
  middleware/
    auth.js              (protect, requireRole)
  utils/
    generateToken.js
    sendEmail.js
  controllers/
    authController.js
    adminController.js
    doctorController.js
    appointmentController.js
    medicineController.js
    pathologyController.js
  routes/
    authRoutes.js
    adminRoutes.js
    doctorRoutes.js
    appointmentRoutes.js
    medicineRoutes.js
    pathologyRoutes.js
  scripts/
    seedAdmin.js          (run once via `npm run seed:admin`)
```

No frontend has been started yet. Everything so far has been tested via
Postman/Thunder Client, not a UI.

## 5. Data models — exact current fields

(Unchanged from original design — nothing here has been modified since.)

**User** — `name, email, passwordHash, role (admin|doctor|patient|lab),
phone, profilePhotoUrl, verificationStatus (pending|verified|rejected),
documentUrls[], isEmailVerified, emailVerificationToken,
emailVerificationExpires, timestamps`

**DoctorProfile** — `user (ref), designation (CMO|MO), specialization,
department, signatureUrl, availability[{day, startTime, endTime,
slotDurationMins}]`

**PatientProfile** — `user (ref), patientType (student|teacher_staff|
outsider), studentOrEmployeeId, departmentOrFaculty, dateOfBirth, gender,
bloodGroup, address, emergencyContact`

**LabProfile** — `user (ref), designation (default "Lab Technician")`

**Appointment** — `patient (ref User), doctor (ref User), date, timeSlot
(string like "10:00-10:15"), status (pending|confirmed|completed|
cancelled), reasonForVisit`

**Medicine** — `name, genericName, category, unit (tablet|capsule|syrup|
injection|ointment|other), stockQuantity, reorderThreshold`. Has an
(unused) text index on `name`/`genericName` — search uses regex instead,
see Section 3.

**PathologyRequest** — `patient (ref User), requestedByDoctor (ref User),
testTypes[], status (requested|in_progress|completed)`

**PathologyResult** — `request (ref PathologyRequest), enteredByLabStaff
(ref User), resultData (Mixed), resultFileUrl, completedAt`

**Prescription** — `patient (ref User), doctor (ref User), appointment (ref,
optional), notes, linkedPathologyResults[] (ref PathologyResult),
medicines[{medicine (ref Medicine), nameSnapshot, dosage: {morning, noon,
night}, beforeOrAfterMeal (before|after), durationDays, instructions}]`
— **model exists, but no controller/routes built yet — this is next.**

## 6. API endpoints built so far

| Method & Path | Role required | What it does |
|---|---|---|
| POST /api/auth/register | public | Registers doctor or patient + role profile |
| GET /api/auth/verify-email/:token | public | Confirms email |
| POST /api/auth/login | public | Returns JWT (blocks if unverified/pending/rejected) |
| GET /api/admin/pending-users | admin | Lists users awaiting approval, with profile |
| PATCH /api/admin/users/:id/approve | admin | Approves a pending user |
| PATCH /api/admin/users/:id/reject | admin | Rejects a pending user |
| POST /api/admin/lab-staff | admin | Creates a Lab staff account (active immediately) |
| GET /api/admin/lab-staff | admin | Lists all Lab staff |
| GET /api/doctors | any logged-in user | Lists verified doctors for booking |
| PUT /api/doctors/availability | doctor | Doctor sets their own weekly hours |
| GET /api/appointments/available-slots/:doctorId?date=YYYY-MM-DD | any logged-in user | Computes open slots for a date |
| POST /api/appointments | patient | Books a slot |
| GET /api/appointments/mine | doctor or patient | Own appointments |
| PATCH /api/appointments/:id/status | doctor or patient (owner) | Update/cancel status |
| GET /api/medicines/search?q=par | admin or doctor | Autocomplete by name prefix |
| GET /api/medicines/low-stock | admin or doctor | Medicines at/below reorder threshold |
| GET /api/medicines | admin or doctor | Full medicine list |
| POST /api/medicines | admin or doctor | Add a new medicine |
| GET /api/medicines/:id | admin or doctor | One medicine |
| PUT /api/medicines/:id | admin or doctor | Edit medicine details |
| PATCH /api/medicines/:id/stock | admin only | Adjust stock quantity (+/-) |
| DELETE /api/medicines/:id | admin only | Remove a medicine |
| POST /api/pathology/requests | doctor | Request a test for a patient |
| GET /api/pathology/requests | doctor/patient/lab/admin | List requests (scoped by role, or ?status= for lab/admin) |
| GET /api/pathology/requests/:id | owner doctor/patient, or lab/admin | Request + its result if any |
| PATCH /api/pathology/requests/:id/start | lab only | Marks in_progress |
| POST /api/pathology/results | lab only | Submits result, auto-completes the request |

There is also `npm run seed:admin` — a one-time script creating the first
Admin login from `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env`.

## 7. Remaining build plan — step by step

Steps 1–4 below are **done**. Continue from step 5.

1. ~~Lab staff account creation (Admin-only)~~ — **done**
2. ~~Inventory module~~ — **done** (CRUD + manual stock adjust; automatic
   decrement-on-prescription still needs wiring — see step 5)
3. ~~Medicine autocomplete endpoint~~ — **done**
4. ~~Pathology module~~ — **done** (request → result flow)
5. **Prescription engine** (the core feature — start here) — the big one:
   - `controllers/prescriptionController.js` + `routes/prescriptionRoutes.js`
     — model (`Prescription.js`) already exists, nothing to build there.
   - `POST /api/prescriptions` (doctor only): body needs `patientId`,
     `appointmentId?`, `notes?`, `linkedPathologyResults?` (array of
     PathologyResult ids), and `medicines[]` where each line is either
     `{ medicineId, dosage, beforeOrAfterMeal, durationDays, instructions }`
     (existing medicine — look up its current `name` for the snapshot) or
     `{ newMedicineName, dosage, ... }` (no match found in autocomplete —
     create a new `Medicine` doc on the fly, the way the original spec
     described "doctor writes it, it gets added to the database").
   - Doctor name/designation and patient name pull automatically from
     `DoctorProfile`/`PatientProfile` — don't make the doctor re-type them,
     just look them up server-side from `req.user` and the given
     `patientId` when building the response/printable view.
   - On save: for every medicine line that references a real `Medicine._id`,
     decrement `stockQuantity` using the same subtract-and-check pattern as
     `medicineController.adjustStock` (block the save, or at least warn, if
     stock would go negative — decide which when you get there).
   - `GET /api/prescriptions/mine` (doctor: prescriptions they wrote;
     patient: prescriptions written for them) — this doubles as "patient
     history", per the Section 3 decision not to build a separate history
     collection.
   - `GET /api/prescriptions/:id` — full detail view, populated with doctor,
     patient, and any linked pathology results — this is what the
     printable/PDF prescription view will render.
   - Printable output: university logo + doctor name/designation/signature
     + patient info + medicines + test results, in a fixed layout. A
     downloadable PDF (e.g. `@react-pdf/renderer` or Puppeteer) is the
     original goal; a clean print-friendly page (`@media print` CSS) is an
     acceptable v1 substitute if time is short.
6. **Frontend (React)** — hasn't been started at all. Needs, at minimum:
   register/login/verify-email pages, role-aware dashboards (Admin/Doctor/
   Patient/Lab), doctor availability editor, appointment booking flow,
   prescription-writing screen for doctors, prescription/history view for
   patients, admin approval queue (including lab-staff creation), inventory
   and pathology screens.
7. **Polish pass (only if time remains)** — notifications beyond what auth
   already sends, nicer PDF export, dashboards/analytics.

## 8. How to hand this off to a new chat

1. Zip your current project folder (or just have it open in your editor).
2. Paste this entire document into the new chat.
3. Say: *"This is my in-progress MERN project. Continue from the remaining
   build plan in Section 7, starting with step 5 — give me new/changed
   files only, with the exact path to put them, and explain things in plain
   language since I don't code myself."*
4. If you've built further than this document reflects, just say what you
   added since — one or two sentences is enough.
