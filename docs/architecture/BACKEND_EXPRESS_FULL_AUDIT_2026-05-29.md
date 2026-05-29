# Backend Express Full Audit - 2026-05-29

Scope: `WebApplication/backend-express`

Audited surfaces:
- Entrypoint, middleware, config, database pool
- Auth, profile, and career-match analysis routes
- Controllers, services, repositories, validations
- AIEngine gateway and history persistence
- Database migration compatibility
- Documentation and verification coverage

Verification run:
- `node --check` over all `WebApplication/backend-express/src/**/*.js` passed.
- No backend `test`, `lint`, or `build` script exists in `WebApplication/backend-express/package.json`, so runtime and behavioral checks remain manual.

## Executive Summary

The backend is small, readable, and already has several good foundations:
- JWT protection is applied to profile and analysis routes.
- Zod validation is present at route boundaries.
- SQL uses parameterized queries.
- Career-match requests are normalized before calling AIEngine `/predict/web`.
- Analysis history is scoped by `user_id`.
- Password reset tokens are hashed and one-time-use.

There is no obvious P0 blocker from static audit. The main gaps are production hardening and correctness edges: permissive CORS, no rate limiting, inconsistent email normalization, missing backend test/lint scripts, workspace lockfile hygiene, and a few contract/documentation mismatches.

## Severity Scale

- P0: Active correctness/security blocker that can directly expose data, break core flow, or corrupt user data.
- P1: Should be fixed before production or wider usage.
- P2: Important hardening, maintainability, or UX/API reliability improvement.
- P3: Cleanup or polish.

## P0 Findings

None found in static audit.

## P1 Findings

### 1. Auth endpoints have no rate limiting or abuse guard

Evidence:
- Public auth routes: `src/routes/auth.routes.js:13-16`
- Login compares bcrypt password on every request: `src/services/auth.service.js:80-96`
- Forgot password can trigger SMTP work: `src/services/auth.service.js:108-157`
- Analysis route calls AIEngine and can be expensive once authenticated: `src/routes/analysis.routes.js:27-31`, `src/services/ai.service.js:128-169`

Risk:
- Login brute force is unthrottled.
- Forgot-password email sending can be abused.
- Authenticated users can repeatedly trigger AI requests without quota.

Recommendation:
- Add `express-rate-limit` or equivalent middleware.
- Use separate buckets:
  - `/api/auth/login`: strict per IP + email.
  - `/api/auth/forgot-password`: strict per IP + email.
  - `/api/analysis/career-match`: per user ID with a sane daily/hourly cap.
- Return a stable 429 JSON contract.

### 2. CORS is fully open

Evidence:
- `src/index.js:14` uses `app.use(cors())`.
- `config.frontendUrl` exists at `src/config/index.js:45` but is not used by CORS.

Risk:
- Any browser origin can call the API. JWT still protects private endpoints, but open CORS increases exposure to token misuse from malicious origins if a user pastes or stores a token insecurely.

Recommendation:
- Configure CORS with `origin: config.frontendUrl` for normal deployment.
- Support an explicit comma-separated allowlist for local/staging/prod.
- Limit methods and headers to what the frontend uses.

### 3. Email normalization is inconsistent across register, login, profile update, and reset

Evidence:
- Reset flow normalizes email: `src/services/auth.service.js:16`, `src/services/auth.service.js:111-112`.
- Register checks and inserts raw `email`: `src/services/auth.service.js:30-63`.
- Login queries raw `email`: `src/services/auth.service.js:80-96`.
- Profile update checks raw `updateData.email`: `src/services/profile.service.js:13-21`.
- Database unique constraint is on raw `email`: `infrastructure/database/migrations/001_create_users_table.sql:7`.

Risk:
- `User@Example.com` and `user@example.com` can be treated as different accounts unless PostgreSQL collation/index behavior happens to prevent it.
- A user may register with mixed-case email, then reset uses lower-case lookup and may not find the account.
- Profile email conflict checks can miss case-only conflicts.

Recommendation:
- Normalize email to lowercase in validation or service before all DB reads/writes.
- Add a DB-level unique index on `LOWER(email)` or migrate to `citext`.
- Backfill existing duplicate/case-variant accounts before enforcing the index.

### 4. Backend has no automated test/lint script

Evidence:
- `package.json:6-8` only defines `dev` and `start`.
- README still references `tests/`: `README.md:10`, but no test folder exists in `WebApplication/backend-express`.

Risk:
- Contract-sensitive logic has no regression safety, especially:
  - auth/password reset
  - validation edge cases
  - career-match normalization
  - analysis history ownership
  - AIEngine error mapping

Recommendation:
- Add a test runner (`vitest` or `node:test`) and `npm run test`.
- Add `npm run lint` with ESLint.
- Minimum tests:
  - auth validation and email normalization
  - password reset happy path and invalid token
  - analysis validation strict skill level enum
  - history cannot read another user analysis
  - AIEngine 400/422/500/timeout mapping

### 5. Workspace lockfile hygiene was unclear for backend dependencies

Evidence:
- This repo uses the root npm workspace lockfile at `package-lock.json`.
- `WebApplication/.gitignore:2` ignored nested `package-lock.json`, which was misleading for reproducible workspace installs.
- Dependencies use semver ranges in `package.json:10-18`.

Risk:
- Installs are not reproducible across machines or time.
- Security and behavior can drift, especially with Express 5, Zod 4, Nodemailer, and pg.

Recommendation:
- Stop ignoring package lock files under `WebApplication/.gitignore`.
- Keep the root workspace `package-lock.json` committed and updated after backend dependency/script changes.
- Use `npm ci` from the workspace root in deployment/CI.
- Add dependency audit workflow against the workspace lockfile.

## P2 Findings

### 6. API docs and README are partly stale or environment-specific

Evidence:
- README says routes live in `src/api/`, modules in `src/modules/`, shared helpers in `src/shared/`: `README.md:7-9`.
- Actual backend uses `src/routes`, `src/controllers`, `src/services`, `src/repositories`, and `src/middleware`.
- OpenAPI GenAI health description mentions Ollama while current system has Gemini metadata in the career-match flow: `src/docs/openapi.js` GenAI health description.

Risk:
- New contributors and frontend integration users get the wrong map of the backend.
- Operational docs may mislead when debugging GenAI.

Recommendation:
- Update README structure to match current code.
- Update OpenAPI GenAI provider copy to be provider-neutral or explicitly mention Gemini when configured.

### 7. Database configuration does not fail fast for missing DB env

Evidence:
- DB env values are read directly and may be undefined: `src/config/index.js:46-51`.
- Pool is created with those values: `src/database/db.js:6-12`.

Risk:
- In some environments `pg` may fall back to default libpq-style settings, causing confusing connection attempts or accidental use of local defaults.

Recommendation:
- Require `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` at config load.
- Parse `DB_PORT` as a positive integer.
- Add optional SSL config for production.

### 8. Error responses are inconsistent and production fallback is not localized/user-facing

Evidence:
- Auth controllers use `{ success, message, data }`: `src/controllers/auth.controller.js`.
- Profile and analysis controllers use `{ status, data }`: `src/controllers/profile.controller.js`, `src/controllers/analysis.controller.js`.
- Production unknown error message is `"Something went very wrong!"`: `src/middleware/error.js:44`.

Risk:
- Frontend must handle multiple response envelopes.
- Unknown production errors surface English/internal-feeling copy.

Recommendation:
- Standardize success envelope, for example `{ success: true, data, message? }`.
- Standardize error envelope, for example `{ success: false, status, message, code? }`.
- Use a localized generic production message such as `Terjadi gangguan pada server. Silakan coba lagi nanti.`

### 9. Password reset token validation has a replay race edge

Evidence:
- Valid token is selected without row lock: `src/repositories/auth.repository.js:47-63`.
- Token is marked used later in the same transaction via `markUserPasswordResetTokensUsed`: `src/services/auth.service.js:167-175`.

Risk:
- Two simultaneous reset requests with the same token can both observe the token as valid before either commits. The impact is limited because both set a password, but one-time-use semantics are not strictly enforced under concurrency.

Recommendation:
- Use `SELECT ... FOR UPDATE` when finding a valid reset token inside the transaction.
- Or atomically consume token with `UPDATE ... WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW() RETURNING *`.

### 10. Public API docs are served in all environments

Evidence:
- `/api-docs.json` and `/api-docs` are always mounted: `src/index.js:20-25`.

Risk:
- Public endpoint inventory is exposed in production. This is not inherently a vulnerability, but it increases reconnaissance value.

Recommendation:
- Keep docs public only in development/staging, or protect with basic auth/IP allowlist in production.

### 11. AIEngine error text may leak backend/model vocabulary to frontend

Evidence:
- AI `detail` or `message` is passed through for 400/422 and other statuses: `src/services/ai.service.js:19-47`.

Risk:
- Frontend can receive raw AIEngine validation paths or internal wording that is not user-facing.

Recommendation:
- Preserve detailed AI errors in server logs.
- Return user-facing messages at the API boundary.
- Optionally add an error `code` for frontend handling.

### 12. Body parsing uses Express default JSON limit

Evidence:
- `src/index.js:17` uses `express.json()` with no explicit `limit`.

Risk:
- Default limit may be fine today, but analysis payloads can include long experience text. Without an explicit policy, behavior is accidental and error messaging is generic.

Recommendation:
- Set an intentional limit, for example `express.json({ limit: '256kb' })`.
- Add a 413 handler message if long inputs are expected.

## P3 Findings

### 13. Unused repository helpers create duplicate ownership

Evidence:
- `auth.repository.js:5-12` exports `createUser`, but `auth.service.js:47-55` inserts directly in a transaction instead.
- `profile.repository.js:4-10` exports `createProfile`, but registration also inserts profile directly in `auth.service.js:55-58`.

Risk:
- Future edits may update one path and forget the other.

Recommendation:
- Either remove unused helpers or refactor transactional service code to use repository helpers that accept an optional client.

### 14. Analysis validation and OpenAPI are manually duplicated

Evidence:
- Validation contract lives in `src/validations/analysis.validation.js`.
- OpenAPI schema is manually maintained in `src/docs/openapi.js`.

Risk:
- Contract drift is likely as fields evolve.

Recommendation:
- Add schema-level tests comparing key enum/default expectations.
- Or generate OpenAPI from Zod schemas if the project grows.

## Positive Findings

- Route ownership is clear:
  - Auth public routes are isolated in `src/routes/auth.routes.js`.
  - Profile and analysis routes apply `router.use(protect)`.
- SQL queries are parameterized throughout repositories.
- Password reset tokens are stored hashed, not plaintext.
- Password reset response avoids email enumeration for unknown users.
- Analysis history queries include `WHERE user_id = $1`, preventing cross-user reads.
- AIEngine calls use `AbortController` timeout handling.
- Career-match boundary validation is strict for skill level enum and target role.
- Analysis persistence stores both full request/response JSON and summary columns for history performance.

## Recommended Execution Order

1. P1 security hardening:
   - CORS allowlist.
   - Rate limiting for auth/reset/analysis.
   - Email normalization with DB unique enforcement.
2. P1 delivery safety:
   - Update workspace lockfile.
   - Add `test` and `lint` scripts.
3. P2 reliability:
   - Fail fast on DB env.
   - Standardize response envelopes.
   - Harden password reset token consume with row lock/atomic update.
4. P2 docs and operational polish:
   - Update README structure.
   - Gate API docs in production.
   - Make AI error messages user-facing.

## Implementation Status - 2026-05-29

Implemented in the refinement pass:
- Added CORS allowlist using `CORS_ORIGINS` and `FRONTEND_URL`.
- Added explicit JSON body limit via `JSON_BODY_LIMIT`.
- Added `API_DOCS_ENABLED` gate so `/api-docs` can be disabled in production.
- Added optional `TRUST_PROXY` and `DB_SSL` config.
- Made DB configuration fail fast for required DB env values.
- Added in-memory rate limiting for login, forgot-password, and career-match analysis.
- Normalized auth/profile email input to lowercase at validation/service boundary.
- Changed user email lookup to case-insensitive matching.
- Added DB migration `007_enforce_case_insensitive_user_email.sql`.
- Added `FOR UPDATE` locking when consuming valid password reset tokens.
- Replaced production unknown error fallback with Indonesian user-facing copy.
- Replaced AIEngine 400/422 pass-through with a user-facing validation message.
- Added backend `lint` and `test` scripts.
- Added syntax-check helper and unit tests for validation/rate-limiting.
- Updated the root workspace `package-lock.json`, added backend lint/test workspace scripts, and stopped ignoring package lock files under `WebApplication/.gitignore`.
- Updated backend README structure/env/script docs and provider-neutral GenAI OpenAPI copy.

Verification after implementation:
- `npm run lint` passed.
- `npm test` passed with 6 tests.
- Follow-up dependency audit passed with `found 0 vulnerabilities` after `npm audit fix`.
- Local migrations passed through `007_enforce_case_insensitive_user_email.sql`.
- Local backend integration passed:
  - `GET /`
  - `GET /health`
  - `GET /api-docs.json`
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `GET /api/user/profile`
  - `POST /api/analysis/career-match`
  - `GET /api/analysis/career-match/history`
  - `GET /api/analysis/career-match/history/:id`
- AIEngine `/health` responded with `model_loaded: true` and catalog size `5859`.

Not completed in this pass:
- Browser-level frontend-to-backend regression was not run.
- Password reset SMTP integration was not run.

## Suggested Minimal Test Matrix

Auth:
- Signup lowercases email before insert.
- Duplicate email rejects case-insensitively.
- Login works with different email casing.
- Forgot password returns generic response for unknown email.
- Reset token cannot be reused.

Profile:
- Profile route rejects unauthenticated requests.
- Profile update rejects email already used by another user case-insensitively.

Career match:
- Missing education/skills/experience years/experience text returns 400.
- Invalid skill level returns 400.
- `use_genai` default is false.
- AIEngine 422 maps to 400.
- AIEngine timeout maps to 504.
- History list/detail only returns rows for the authenticated user.

## Audit Limitations

- This is a static audit plus syntax verification. It did not start the server, connect to PostgreSQL, send SMTP, or call AIEngine.
- Dependency vulnerability status was not fully checked because the follow-up audit command was interrupted.
