# Contributing

Thank you for considering contributing to this project. This guide explains how to run tests, open PRs, and follow the repository conventions.

Running tests

- Install dependencies: `npm ci`
- Run unit tests: `npm test`
- Run CI-style tests (coverage): `npm run test:ci`
- Run integration tests (opt-in): `RUN_INTEGRATION=true npm run test:ci`

Pull requests

- Branch from `main` and push your branch to origin.
- Use the `ci-tests-coverage` branch as a template for CI changes.
- Fill the PR template and ensure tests pass locally before requesting review.

Code style

- Keep changes focused and include tests for new behavior.
