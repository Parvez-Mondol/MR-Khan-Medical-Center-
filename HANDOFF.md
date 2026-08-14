**Project Handoff — MR. Khan Medical Center Backend**

Brief: this file captures the repository state, how to run and test locally, key changes made so far, and recommended next steps for a new contributor or AI to pick up from.

**Repository State**:
- **Completed:** Backend API (Express + Mongoose), authentication, validators, middleware, unit tests, opt-in integration tests, Docker + docker-compose for local dev, dev helper scripts, CI workflow, release tag `v1.0.0`.
- **Verified:** All unit tests pass locally (`npm run test:ci`). App runs locally (`npm run dev`) and via compose (`npm run dev:stack`) when Docker is available.

**How to run locally (quick)**
- Copy env template: `copy .env.example .env` and edit values.
- Start local Mongo (Docker):
```powershell
docker compose up -d mongo
```
- Run server locally (nodemon):
```powershell
npm ci
npm run dev
```
- Or run full stack (requires Docker daemon):
```powershell
npm run dev:stack
```

**Run tests & coverage**
- Unit tests (fast): `npm test`
- Full CI-style with coverage: `npm run test:ci` (this is used by CI)
- Integration tests are opt-in (use `RUN_INTEGRATION=true npm run test:ci`). On Windows the in-memory Mongo binary can be flaky; tests handle cleanup.

**Docker / Compose**
- `docker-compose.yml` contains services `mongo` and `app`. The host mapping for Mongo is `27018:27017` to avoid conflicts. Dev override is in `docker-compose.override.yml`.
- Dev helper scripts: `scripts/dev-up.ps1`, `scripts/dev-up.sh` and `npm run dev:stack` run the platform-appropriate helper.

**CI / Release**
- GitHub Actions workflow added (nodejs.yml) — runs tests and uploads artifacts.
- Release `v1.0.0` created and pushed.

**Key files and locations**
- `server.js` — app entry point
- `config/db.js` — mongoose connection
- `validators/` — Joi schemas (fallback permissive schemas included)
- `tests/` — unit and opt-in integration tests
- `Dockerfile`, `docker-compose.yml`, `docker-compose.override.yml` — containerization
- `scripts/` — dev helpers and runner
- `README.md` — usage and run instructions

**Notes & Gotchas**
- `.env` is git-ignored; do not commit secrets. Use `.env.example` as template.
- On Windows Docker Desktop must be running; Docker daemon readiness may need a short wait before `docker` commands work.
- Port conflicts: host port `27017` was remapped to `27018` for the mongo compose service. App uses `PORT=5000` by default; AnyDesk or other apps may bind UDP/ports and block stop commands.

**Completed tests summary**
- All unit tests pass locally: `npm run test:ci` → 80 passed (as of this handoff).

**Recommended next steps (high priority)**
1. Scaffold frontend (I planned a Vite + React TypeScript app under `frontend/`) and implement auth pages that call backend endpoints.
2. Add full CI integration for frontend (build + tests) and add a combined dev compose service for frontend + backend.
3. Improve validator line coverage if desired (validators are exercised but have lower line coverage than controllers).

**For the next contributor / AI**
- To pick up: start by verifying `npm run test:ci` on your machine and `npm run dev` or `npm run dev:stack` depending on Docker availability. Then scaffold frontend in `frontend/` and wire `CLIENT_URL` in `.env`.

If you'd like, I can also create the initial `frontend/` scaffold and push it to `main` before you hand off to another agent.

— End of handoff
