Title: chore: add tests, coverage config, CI integration, and README updates

Summary

- Adds authentication controllers, validation and error middleware, unit + guarded integration tests, Jest coverage configuration, and GitHub Actions workflows.
- Implements a safe `sendEmail` helper that falls back to console logging when SMTP is not configured.
- Adds `.gitignore` and ensures secrets like `.env` are not tracked.

Files changed (high level)

- controllers/
- middleware/
- tests/
- jest.config.js
- .github/workflows/nodejs.yml
- README.md
- .gitignore

Checklist

- [ ] Confirm `.env` contains no secrets committed to repo
- [ ] Run `npm ci && npm run test:ci` locally
- [ ] Wait for CI to run and fix any failures
- [ ] Squash or tidy commits if you want a cleaner history before merging

Notes

- Integration tests using `mongodb-memory-server` are opt-in via `RUN_INTEGRATION=true` to avoid binary downloads during normal CI runs.
- CI enforces coverage when `ENFORCE_COVERAGE=true` or in `CI` environment.
