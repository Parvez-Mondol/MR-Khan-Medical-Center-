# Changelog

All notable changes for this branch are documented here. This file is a brief summary intended for reviewers.

## [1.0.0] - 2026-08-14

- Add comprehensive unit tests across controllers and validators.
- Add Jest coverage collection and CI-style `test:ci` script.
- Add GitHub Actions workflow to run tests and optional integration job.
- Implement safe `sendEmail` helper with console fallback.
- Add validation middleware and error handler improvements.
- Add `.gitignore`, PR and issue templates, and `CONTRIBUTING.md`.
- Improve tests to be opt-in for `mongodb-memory-server` via `RUN_INTEGRATION=true`.

## Unreleased (ci-tests-coverage)

No unreleased changes.

## How to verify

1. Run `npm ci` then `npm run test:ci` to run tests and generate coverage.
2. Optionally run integration tests: `RUN_INTEGRATION=true npm run test:ci` (downloads MongoDB binary).
3. Open PR from `ci-tests-coverage` to `main` and use `pr-body.md` as the description.
