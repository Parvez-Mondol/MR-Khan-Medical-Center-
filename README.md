# MR. Khan Medical Center — Backend

## Setup
1. `npm ci` (or `npm install`)
2. Copy `.env.example` to `.env` and fill in values (see `.env.example`)
3. Run a local MongoDB for development (one of the options below)
4. `npm run dev` (requires `nodemon`); `npm start` runs in production mode

Local Mongo options:

- Docker Compose (recommended):

```powershell
docker compose up -d
# then ensure MONGO_URI in .env is: mongodb://localhost:27017/khan_medical_center
```

- Install MongoDB locally and run it on port `27017`, then set `MONGO_URI` accordingly.

If you prefer not to run a DB, the server will still start but routes requiring the DB will error until `MONGO_URI` is correct.

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
