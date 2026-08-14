# MR. Khan Medical Center — Backend

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill in your MongoDB Atlas URI + JWT secrets
3. `npm run dev` (requires nodemon; `npm start` works without it)

## Structure
- `config/db.js` — MongoDB connection
- `models/` — Mongoose schemas: User, DoctorProfile, PatientProfile, LabProfile,
  Appointment, Medicine, PathologyRequest, PathologyResult, Prescription
- `server.js` — Express app entry point

## Next up
- `routes/` + `controllers/` for auth (register, login, email verification)
- Role-based middleware (`requireRole`, `requireDoctorType`)

## Testing

- Run unit tests (fast, integration disabled by default):

```bash
npm test
```

- Run CI-style tests with coverage (coverage collected but thresholds enforced only in CI):

```bash
npm run test:ci
```

- Run integration tests (mongodb-memory-server). This downloads a MongoDB binary and may take time; enable explicitly:

```bash
RUN_INTEGRATION=true npm run test:ci
```

- To enforce coverage locally (same rules as CI):

```bash
ENFORCE_COVERAGE=true npm run test:ci
```

Notes:
- CI workflow runs unit tests and a separate `integration` job with `RUN_INTEGRATION=true` and enforces coverage thresholds.
- If you see slow runs due to MongoDB binary downloads, rerun with the environment variable omitted or enable caching in CI.

## Pull Request / CI notes

- Branch: I pushed the changes to `ci-tests-coverage` which contains new tests, coverage config, and CI workflow files.
- How to open PR: visit the compare page and paste the PR body from `pr-body.md` (created in the repo root):

    https://github.com/Parvez-Mondol/MR-Khan-Medical-Center-/compare/main...ci-tests-coverage?expand=1

- CI expectations:
    - The `test` job runs unit tests and reports coverage.
    - The `integration` job runs only when `RUN_INTEGRATION=true` and will download a MongoDB binary; this is opt-in to avoid slow default CI.
    - Coverage is enforced in CI; if a job fails due to coverage, run `npm run test:ci` locally and inspect the uncovered files listed in the report.

If you want, I can attempt to create the PR automatically from this environment when `gh` (GitHub CLI) is installed and authenticated — otherwise please create the PR from the compare URL above and paste the `pr-body.md` contents as the description.
