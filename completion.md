# Project Completion Audit

## 1. Executive Summary

| Metric | Count |
|---|---|
| Total requirements identified | 31 |
| Correctly implemented | 19 |
| Implemented but incorrect / incomplete | 6 |
| Not yet implemented | 6 |

**Overall completion: ~61% correctly implemented.**

The project has a solid foundation for authentication (signup, login, JWT, refresh token rotation, token hashing) and core multi-tenant features (organizations, memberships, invitations). However, several MVP requirements are missing or incomplete — most critically: **logout is not implemented**, the **audit log system is entirely absent**, **the VIEWER role is missing**, the **permission table does not match the specification**, and **session revocation physically deletes records instead of soft-revoking**. DevOps (Docker Compose) and testing coverage are also significantly lacking.

---

## 2. Requirements Overview

| # | Requirement | Status | Relevant Files |
|---|---|---|---|
| 1 | User signup | Correctly Implemented | `src/features/auth/` |
| 2 | User login | Correctly Implemented | `src/features/auth/` |
| 3 | User logout | Not Yet Implemented | `src/features/auth/auth.route.ts` (commented out) |
| 4 | Password hashing with bcrypt or Argon2 | Correctly Implemented | `src/features/auth/auth.service.ts` |
| 5 | JWT access token (short-lived) | Correctly Implemented | `src/utils/token.ts` |
| 6 | Refresh token rotation | Correctly Implemented | `src/features/auth/auth.service.ts`, `src/features/sessions/session.repository.ts` |
| 7 | Store token hashes, not raw tokens | Correctly Implemented | `src/utils/token.ts`, `src/features/auth/auth.service.ts` |
| 8 | Organization/workspace creation | Correctly Implemented | `src/features/organizations/` |
| 9 | Team membership | Correctly Implemented | `src/features/memberships/` |
| 10 | Roles: owner, admin, member, viewer | Implemented but Incorrect | `prisma/schema.prisma`, `src/config/rolePermission.config.ts` |
| 11 | Permission table: users.read, users.invite, projects.write, billing.read | Implemented but Incorrect | `src/config/permissions.config.ts` |
| 12 | Route-level permission guards | Correctly Implemented | `src/middlewares/authorization.middleware.ts` |
| 13 | Resource-level ownership checks | Correctly Implemented | `src/middlewares/organization.middleware.ts`, repositories |
| 14 | Invite teammate with expiring invite token | Correctly Implemented | `src/features/invitations/` |
| 15 | Accept invitation flow | Correctly Implemented | `src/features/invitations/invitation.service.ts` |
| 16 | Session list | Correctly Implemented | `src/features/sessions/` |
| 17 | Revoke session | Implemented but Incorrect | `src/features/sessions/` |
| 18 | Audit log for login, invite, role change, permission change | Not Yet Implemented | N/A |
| 19 | Rate limit auth routes | Correctly Implemented | `src/middlewares/rate-limit/` |
| 20 | Swagger/OpenAPI docs | Implemented but Incorrect | `src/docs/` |
| 21 | Integration tests for auth and permission failure cases | Implemented but Incorrect | `tests/integration/auth/register.test.ts` |
| 22 | Validate request DTOs with Zod | Correctly Implemented | `src/middlewares/validate.middleware.ts`, `*.validation.ts` |
| 23 | Never leak sensitive errors | Implemented but Incorrect | `src/middlewares/error.middleware.ts` |
| 24 | Use request IDs | Not Yet Implemented | N/A |
| 25 | Log sensitive actions | Not Yet Implemented | N/A |
| 26 | Deny by default authorization | Correctly Implemented | `src/middlewares/authorization.middleware.ts` |
| 27 | Docker Compose for PostgreSQL and Redis | Not Yet Implemented | N/A |
| 28 | Environment variables | Correctly Implemented | `src/config/env.config.ts`, `.env` |
| 29 | Health check endpoint | Correctly Implemented | `src/features/health/health.route.ts` |
| 30 | Local database migrations | Correctly Implemented | `prisma/migrations/` |
| 31 | Postman/Bruno demo flow | Not Yet Implemented | N/A |

---

## 3. Correctly Implemented Features

### 3.1 User Signup

**Status:** Correctly Implemented

**Requirement:**
Users must be able to sign up with name, email, and password.

**Relevant Files:**
- `src/features/auth/auth.route.ts` — POST `/api/v1/auth/register`
- `src/features/auth/auth.controller.ts` — `register()` handler
- `src/features/auth/auth.service.ts` — `registerUser()` business logic
- `src/features/auth/auth.repository.ts` — `createUser()`, `createOtp()`
- `src/features/auth/auth.validation.ts` — `registerUserSchema` (Zod)
- `src/queues/email.queue.ts` — Email queue for OTP delivery
- `src/workers/email.worker.ts` — Background worker for sending emails

**Implementation Analysis:**
The registration flow validates input (name min 3 chars, valid email, password 8-30 chars) using Zod, checks for existing users, hashes the password with bcrypt (salt rounds 12), creates the user, generates a 6-digit OTP, hashes the OTP with bcrypt, stores it in the `otps` table with a 10-minute expiry, and enqueues a verification email via BullMQ.

**Why It Satisfies the Requirement:**
Complete end-to-end registration with validation, duplicate checking, secure password hashing, and email verification via OTP.

---

### 3.2 User Login

**Status:** Correctly Implemented

**Requirement:**
Users must be able to log in with email and password.

**Relevant Files:**
- `src/features/auth/auth.route.ts` — POST `/api/v1/auth/login`
- `src/features/auth/auth.controller.ts` — `login()` handler
- `src/features/auth/auth.service.ts` — `loginUser()` business logic
- `src/features/sessions/session.repository.ts` — `createSession()`

**Implementation Analysis:**
The login flow validates input with Zod, looks up the user by email, checks that the user isn't soft-deleted (`deletedAt`), verifies email is verified, compares the password hash with bcrypt, creates a database session (with user-agent and IP), generates a JWT access token (15 min) and refresh token (30 days), hashes the refresh token before storage, and sets both tokens as httpOnly cookies.

**Why It Satisfies the Requirement:**
Full login flow with credential validation, session creation, and secure token issuance.

---

### 3.3 Password Hashing with bcrypt

**Status:** Correctly Implemented

**Requirement:**
Password hashing with bcrypt or Argon2.

**Relevant Files:**
- `src/features/auth/auth.service.ts` — Lines 39, 83
- `package.json` — `bcryptjs` dependency

**Implementation Analysis:**
Uses `bcryptjs` with salt rounds of 12 for hashing passwords on registration (`bcrypt.hash(password, 12)`) and comparison on login (`bcrypt.compare(password, user.passwordHash)`).

**Why It Satisfies the Requirement:**
bcrypt with a reasonable work factor of 12 is used for both hashing and comparison.

---

### 3.4 JWT Access Token (Short-Lived)

**Status:** Correctly Implemented

**Requirement:**
JWT access token with short expiry.

**Relevant Files:**
- `src/utils/token.ts` — `createToken()`, `verifyAccessToken()`
- `src/config/env.config.ts` — `ACCESS_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRES_IN`

**Implementation Analysis:**
Access tokens are JWTs signed with a dedicated secret, containing `sub` (userId), `sessionId`, `type: "access"`, and a unique `jti` (via `crypto.randomUUID()`). The expiry is hardcoded to 15 minutes (900 seconds). Verification checks the token type is "access" and validates the payload structure.

**Why It Satisfies the Requirement:**
15-minute access tokens are appropriately short-lived for a security-focused API.

---

### 3.5 Refresh Token Rotation

**Status:** Correctly Implemented

**Requirement:**
Refresh token rotation to prevent reuse.

**Relevant Files:**
- `src/features/auth/auth.service.ts` — `refreshAccessToken()`
- `src/features/sessions/session.repository.ts` — `rotateRefreshToken()`
- `src/features/auth/auth.controller.ts` — `refresh()` handler
- `prisma/schema.prisma` — `RefreshToken` model with `replacedByTokenId`

**Implementation Analysis:**
On each refresh request, the old refresh token hash is looked up, validated (not expired, not revoked, session not revoked/expired), then atomically within a Prisma transaction: (1) the old token is revoked (`revokedAt` set), (2) a new token is created, (3) the old token's `replacedByTokenId` is set to the new token's ID. This creates a chain of rotated tokens for audit trail and reuse detection.

**Why It Satisfies the Requirement:**
Full token rotation with revocation of old tokens and chain tracking via `replacedByTokenId`.

---

### 3.6 Store Token Hashes, Not Raw Tokens

**Status:** Correctly Implemented

**Requirement:**
Store refresh token hashes, not raw tokens.

**Relevant Files:**
- `src/utils/token.ts` — `hashToken()` uses SHA-256
- `src/features/auth/auth.service.ts` — Lines 98, 138, 166
- `prisma/schema.prisma` — `RefreshToken.tokenHash`, `Invitation.tokenHash`

**Implementation Analysis:**
Both refresh tokens and invitation tokens are hashed with SHA-256 (`crypto.createHash("sha256").update(token).digest("hex")`) before being stored in the database. Raw tokens are never persisted.

**Why It Satisfies the Requirement:**
SHA-256 hashing is applied to all sensitive tokens before database storage.

---

### 3.7 Organization/Workspace Creation

**Status:** Correctly Implemented

**Requirement:**
Users must be able to create organizations/workspaces.

**Relevant Files:**
- `src/features/organizations/organization.route.ts` — POST `/api/v1/organizations`
- `src/features/organizations/organization.controller.ts` — `createOrganization()`
- `src/features/organizations/organization.service.ts` — `createOrganizationService()`
- `src/features/organizations/organization.repository.ts` — `createOrganizationWithOwner()`
- `src/utils/generateSlug.ts` — Slug generation

**Implementation Analysis:**
Organization creation requires authentication, validates the name with Zod (3-255 chars), generates a unique slug using `slugify` + random hex suffix, and atomically creates the organization and an OWNER membership for the creating user within a Prisma transaction. Handles slug collisions with up to 3 retry attempts. Also supports GET (list/single), PATCH (update), and DELETE operations with appropriate authorization.

**Why It Satisfies the Requirement:**
Complete organization CRUD with owner membership auto-creation and slug generation.

---

### 3.8 Team Membership

**Status:** Correctly Implemented

**Requirement:**
Team membership management within organizations.

**Relevant Files:**
- `src/features/memberships/membership.route.ts` — CRUD routes
- `src/features/memberships/membership.controller.ts` — Controllers
- `src/features/memberships/membership.service.ts` — Business logic
- `src/features/memberships/membership.repository.ts` — Data access

**Implementation Analysis:**
Provides: list all members of an org (requires `member:read`), get a specific member, update a member's role (requires `member:update-role`), remove a member (requires `member:remove`), and leave an org (self-delete). Routes are protected with authentication, org membership check, and permission guards.

**Why It Satisfies the Requirement:**
Full membership management with role-based access control on each operation.

---

### 3.9 Route-Level Permission Guards

**Status:** Correctly Implemented

**Requirement:**
Route-level permission guards to restrict access based on roles.

**Relevant Files:**
- `src/middlewares/authorization.middleware.ts` — `requirePermission()`
- `src/config/permissions.config.ts` — Permission constants
- `src/config/rolePermission.config.ts` — Role-to-permission mapping
- `src/middlewares/organization.middleware.ts` — `requireOrgMembership()`

**Implementation Analysis:**
The `requirePermission(permission)` middleware factory checks the requesting user's role (from `req.membership` set by `requireOrgMembership`) against the `rolePermissions` map. If the role doesn't include the required permission, a 403 response is returned. This is applied to organization update/delete, all membership mutations, and invitation CRUD routes.

**Why It Satisfies the Requirement:**
Every sensitive route has explicit permission checks via middleware, enforcing role-based access.

---

### 3.10 Resource-Level Ownership Checks

**Status:** Correctly Implemented

**Requirement:**
Resource-level ownership checks to ensure users can only access their own resources.

**Relevant Files:**
- `src/middlewares/organization.middleware.ts` — `requireOrgMembership()`
- `src/features/organizations/organization.repository.ts` — Queries filter by `userId` membership
- `src/features/sessions/session.service.ts` — Checks `userId` on session operations
- `src/features/invitations/invitation.service.ts` — Checks email match on accept/reject

**Implementation Analysis:**
Organization access is scoped to members: `getOrganizationById()` filters by userId membership. Session operations verify the session belongs to the requesting user. Invitation accept/reject verifies the invitation email matches the user's email. The `requireOrgMembership` middleware enforces that the user is a member of the target organization before any org-scoped operation.

**Why It Satisfies the Requirement:**
Resource access is consistently scoped to ownership/membership across all features.

---

### 3.11 Invite Teammate with Expiring Invite Token

**Status:** Correctly Implemented

**Requirement:**
Invite teammates with an expiring invite token.

**Relevant Files:**
- `src/features/invitations/invitation.route.ts` — POST `/organizations/:orgId/invitations`
- `src/features/invitations/invitation.service.ts` — `createInvitationService()`
- `src/features/invitations/invitation.repository.ts` — `createInvitationByOrgAndEmail()`

**Implementation Analysis:**
Creates a 32-byte random token (`crypto.randomBytes(32)`), hashes it with SHA-256, stores the hash in the database with a 7-day expiry. Validates: the inviter has ADMIN or OWNER role, the invitee is not already a member, no pending invitation exists. Sends an invitation email in production. Returns the invitation URL in development mode.

**Why It Satisfies the Requirement:**
Secure random token with hash storage, role-based authorization, duplicate checks, and configurable expiry.

---

### 3.12 Accept Invitation Flow

**Status:** Correctly Implemented

**Requirement:**
Users must be able to accept invitations to join organizations.

**Relevant Files:**
- `src/features/invitations/invitation.route.ts` — POST `/invitations/:invitationId/accept` and `/reject`
- `src/features/invitations/invitation.service.ts` — `acceptInvitationService()`, `rejectInvitationService()`
- `src/features/invitations/invitation.repository.ts` — `acceptInvitationById()`, `createMembershipFromInvitation()`

**Implementation Analysis:**
The accept flow: verifies the invitation exists, checks the invitation email matches the authenticated user's email, validates expiry, checks status is PENDING, creates a membership with the invitation's role, and marks the invitation as ACCEPTED. The reject flow performs similar validations and marks as REJECTED.

**Why It Satisfies the Requirement:**
Full accept/reject workflow with proper validation of ownership, expiry, and status.

---

### 3.13 Session List

**Status:** Correctly Implemented

**Requirement:**
Users must be able to view their active sessions.

**Relevant Files:**
- `src/features/sessions/session.route.ts` — GET `/api/v1/sessions`
- `src/features/sessions/session.controller.ts` — `getAllSession()`
- `src/features/sessions/session.service.ts` — `getAllSessionService()`
- `src/features/sessions/session.repository.ts` — `findAllSessionById()`

**Implementation Analysis:**
Retrieves all sessions for the authenticated user ordered by `createdAt` descending. Each session includes id, userId, userAgent, ip, createdAt, expiresAt, and revokedAt fields.

**Why It Satisfies the Requirement:**
Users can list all their sessions with metadata (device, IP, timestamps).

---

### 3.14 Rate Limit Auth Routes

**Status:** Correctly Implemented

**Requirement:**
Rate limit authentication routes to prevent abuse.

**Relevant Files:**
- `src/middlewares/rate-limit/rateLimit.middleware.ts` — Generic rate limit middleware
- `src/middlewares/rate-limit/authLimiter.ts` — Auth-specific limiter (10 req / 15 min)
- `src/middlewares/rate-limit/organizationLimiter.ts` — Org limiter (60 req / 15 min)
- `src/config/rateLimitRedis.config.ts` — Upstash Redis client
- `src/app.ts` — Lines 44, 47

**Implementation Analysis:**
Uses `@upstash/ratelimit` with a sliding window algorithm backed by Upstash Redis. Auth routes are limited to 10 requests per 15 minutes per IP. Organization routes have a separate limit of 60 requests per 15 minutes. Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) are set on all responses. Returns 429 when limit exceeded.

**Why It Satisfies the Requirement:**
Auth routes have Redis-backed rate limiting with appropriate limits and standard response headers.

---

### 3.15 Validate Request DTOs with Zod

**Status:** Correctly Implemented

**Requirement:**
Validate request DTOs with Zod or class-validator.

**Relevant Files:**
- `src/middlewares/validate.middleware.ts` — Generic validation middleware
- `src/features/auth/auth.validation.ts` — Auth schemas
- `src/features/organizations/organization.validation.ts` — Org schemas
- `src/features/memberships/membership.validation.ts` — Membership schemas
- `src/features/invitations/invitation.validation.ts` — Invitation schemas
- `src/features/sessions/session.validation.ts` — Session schemas

**Implementation Analysis:**
The `validate()` middleware accepts Zod schemas for `body`, `params`, and `query`. It runs `safeParse()` on each source and returns a 400 response with flattened errors if validation fails. Validated data replaces `req[source]` to ensure only validated data flows downstream. All feature modules define Zod schemas for their inputs.

**Why It Satisfies the Requirement:**
Comprehensive Zod-based validation across all request entry points.

---

### 3.16 Deny by Default Authorization

**Status:** Correctly Implemented

**Requirement:**
Authorization should deny by default.

**Relevant Files:**
- `src/middlewares/authentication.middleware.ts` — Returns 401 if no token
- `src/middlewares/authorization.middleware.ts` — Returns 403 if no membership or no permission
- `src/middlewares/organization.middleware.ts` — Returns 403 if not a member

**Implementation Analysis:**
All protected routes require explicit authentication (401 if missing). Org-scoped routes require explicit membership (403 if not a member). Permission-guarded routes require explicit permission match (403 if not permitted). The `rolePermissions` config defines a whitelist — roles only have permissions explicitly granted. The MEMBER role, for example, only has `organization:read` and `member:read`.

**Why It Satisfies the Requirement:**
The system denies access by default and only allows explicitly granted permissions.

---

### 3.17 Environment Variables

**Status:** Correctly Implemented

**Requirement:**
Use environment variables for configuration.

**Relevant Files:**
- `src/config/env.config.ts` — Zod-validated env schema
- `.env` — Environment file

**Implementation Analysis:**
All configuration is loaded from environment variables via `dotenv` and validated with a strict Zod schema. Missing or invalid variables cause an immediate server exit with descriptive error messages. Covers: database URLs, JWT secrets, token expiry, SMTP credentials, Redis URLs, API docs credentials, log level, and runtime environment.

**Why It Satisfies the Requirement:**
Robust, validated environment-based configuration with fail-fast behavior.

---

### 3.18 Health Check Endpoint

**Status:** Correctly Implemented

**Requirement:**
Health check endpoint for monitoring.

**Relevant Files:**
- `src/features/health/health.route.ts` — GET `/api/v1/health`
- `src/app.ts` — Line 43

**Implementation Analysis:**
Returns a 200 response with `success: true`, a message "Server is healthy", and a timestamp. No authentication required.

**Why It Satisfies the Requirement:**
Simple health check endpoint suitable for monitoring and load balancer probes.

---

### 3.19 Local Database Migrations

**Status:** Correctly Implemented

**Requirement:**
Local database migrations for schema management.

**Relevant Files:**
- `prisma/schema.prisma` — Database schema
- `prisma/migrations/` — 4 migration directories
- `prisma.config.ts` — Prisma configuration
- `scripts/test.ts` — Runs `prisma migrate reset` for tests

**Implementation Analysis:**
Uses Prisma migrations with 4 versioned migrations covering: initial schema, membership/organization models, invitation model, and a schema removal. The test script runs `prisma migrate reset` against a separate test database.

**Why It Satisfies the Requirement:**
Prisma-managed migrations with versioning and test database support.

---

## 4. Implemented but Incorrect / Incomplete Features

### 4.1 Roles: owner, admin, member, viewer

**Status:** Implemented but Incorrect

**Requirement:**
The system must support four roles: owner, admin, member, viewer.

**Relevant Files:**
- `prisma/schema.prisma` — Lines 116-120 (Role enum)
- `src/config/rolePermission.config.ts` — Role-to-permission mapping

**What Is Already Implemented:**
The `Role` enum defines three roles: `OWNER`, `ADMIN`, `MEMBER`. The `rolePermissions` config maps each to a set of permissions. Organization creation assigns the `OWNER` role. Memberships can be updated to any of the three roles. Invitation creation allows assigning any of the three roles.

**What Is Incorrect or Missing:**
The `VIEWER` role is completely absent from the Prisma schema enum, the role-permission config, and all business logic. The requirement explicitly lists four roles: "owner, admin, member, viewer."

**Why It Does Not Fully Satisfy the Requirement:**
Only 3 of 4 required roles are implemented. VIEWER (a read-only role with the most restricted permissions) is missing.

**What Needs to Be Corrected:**
1. Add `VIEWER` to the `Role` enum in `prisma/schema.prisma`
2. Create a new migration
3. Add `VIEWER` permissions to `rolePermission.config.ts` (likely only `organization:read`)
4. Ensure all validation and business logic handles the new role

**Important:** Do not modify the code. This is only an audit finding.

---

### 4.2 Permission Table: users.read, users.invite, projects.write, billing.read

**Status:** Implemented but Incorrect

**Requirement:**
Permission table with specific permissions: `users.read`, `users.invite`, `projects.write`, `billing.read`.

**Relevant Files:**
- `src/config/permissions.config.ts` — Permission constants
- `src/config/rolePermission.config.ts` — Role-to-permission mapping

**What Is Already Implemented:**
Permissions exist as code-level constants: `organization:read`, `organization:update`, `organization:delete`, `member:read`, `member:update-role`, `member:remove`, `invitation:read`, `invitation:create`, `invitation:delete`. They are mapped to roles in a config file and enforced via middleware.

**What Is Incorrect or Missing:**
1. **Wrong permission names**: The requirement specifies `users.read`, `users.invite`, `projects.write`, `billing.read` — none of these exist. The implemented permissions use a different naming convention and different scopes.
2. **No database table**: Permissions are defined only in code config, not as a database model/table. The requirement says "Permission table" implying a database-backed permission system.
3. **Missing scopes**: `projects.write` and `billing.read` suggest feature areas (projects, billing) that have no corresponding implementation.

**Why It Does Not Fully Satisfy the Requirement:**
The permission names don't match the specification, and there's no database Permission table for dynamic permission management.

**What Needs to Be Corrected:**
1. Create a `Permission` database model
2. Add the specified permissions: `users.read`, `users.invite`, `projects.write`, `billing.read`
3. Link permissions to roles via a join table or similar mechanism
4. Update the authorization middleware to check against database permissions

**Important:** Do not modify the code. This is only an audit finding.

---

### 4.3 Revoke Session

**Status:** Implemented but Incorrect

**Requirement:**
Users must be able to revoke sessions.

**Relevant Files:**
- `src/features/sessions/session.route.ts` — DELETE `/:sessionId` and DELETE `/`
- `src/features/sessions/session.controller.ts` — `deleteSession()`, `deleteAllSession()`
- `src/features/sessions/session.service.ts` — `deleteSessionService()`, `deleteAllSessionService()`
- `src/features/sessions/session.repository.ts` — `deleteSessionById()`, `deleteAllSessionsByUserId()`, `revokeSession()`, `revokeAllUserSessions()`

**What Is Already Implemented:**
Routes exist to delete a specific session and all sessions. The repository has both `deleteSessionById()` (physical delete) and `revokeSession()` (soft revoke via `revokedAt` timestamp).

**What Is Incorrect or Missing:**
The service and controller use `deleteSessionById()` and `deleteAllSessionsByUserId()` which call `prisma.session.deleteMany()` — **physically deleting** session records. The `revokeSession()` and `revokeAllUserSessions()` functions in the repository (which set `revokedAt` for soft revocation) exist but are **never called** by any service or controller.

The requirement says "Revoke session," which implies soft revocation (marking as revoked while preserving the record for audit purposes), not physical deletion.

**Why It Does Not Fully Satisfy the Requirement:**
Sessions are permanently deleted instead of being soft-revoked, losing audit trail data.

**What Needs to Be Corrected:**
1. Change the session service to use `revokeSession()` instead of `deleteSessionById()`
2. Change the bulk operation to use `revokeAllUserSessions()` instead of `deleteAllSessionsByUserId()`
3. Filter out revoked sessions from the session list endpoint (or mark them as revoked in the response)

**Important:** Do not modify the code. This is only an audit finding.

---

### 4.4 Swagger/OpenAPI Docs

**Status:** Implemented but Incorrect

**Requirement:**
Swagger/OpenAPI documentation for the API.

**Relevant Files:**
- `src/docs/openapi.yaml` — Main OpenAPI spec
- `src/docs/paths/auth.yaml` — Auth endpoint docs
- `src/docs/paths/organizations.yaml` — Organization endpoint docs
- `src/config/swagger.config.ts` — Swagger parser
- `src/app.ts` — Lines 56-65 (Swagger UI setup with basic auth)

**What Is Already Implemented:**
OpenAPI 3.0.3 spec with documentation for:
- Auth endpoints: register, verify-email, login, refresh
- Organization endpoints: create, list, get, update, delete
- Swagger UI is served at `/api/v1/api-docs` with basic auth protection

**What Is Incorrect or Missing:**
The following endpoints are **not documented** in the OpenAPI spec:
- **Membership endpoints**: GET/PATCH/DELETE `/organizations/:orgId/members`
- **Invitation endpoints**: GET/POST/DELETE `/organizations/:orgId/invitations`, accept/reject
- **Session endpoints**: GET/DELETE `/sessions`
- **User endpoints**: GET/PATCH/DELETE `/users/me`
- **Health endpoint**: GET `/health`

Only ~40% of the API surface is documented.

**Why It Does Not Fully Satisfy the Requirement:**
The specification is incomplete — most endpoints are missing from the documentation.

**What Needs to Be Corrected:**
Add OpenAPI path definitions for memberships, invitations, sessions, users, and health endpoints.

**Important:** Do not modify the code. This is only an audit finding.

---

### 4.5 Integration Tests for Auth and Permission Failure Cases

**Status:** Implemented but Incorrect

**Requirement:**
Integration tests for auth and permission failure cases.

**Relevant Files:**
- `tests/integration/auth/register.test.ts` — Registration + email verification test
- `tests/globalSetup.ts` — Global test setup (pushes schema to test DB)
- `tests/setup.ts` — Per-file setup (connect/disconnect Prisma)
- `vitest.config.ts` — Test configuration
- `scripts/test.ts` — Test runner script

**What Is Already Implemented:**
One integration test that registers a user and verifies their email via OTP. Test infrastructure is set up with Vitest, Supertest, a separate test database, and global/per-file setup hooks.

**What Is Incorrect or Missing:**
1. **Only 1 test file exists** with a single test case (register + verify-email)
2. **No login tests** — testing valid/invalid credentials, unverified email, deleted user
3. **No permission failure tests** — testing 403 responses for unauthorized role access
4. **No auth failure tests** — testing 401 responses for missing/expired/invalid tokens
5. **No organization, membership, invitation, or session tests**

The requirement explicitly calls for "Integration tests for auth **and permission failure cases**."

**Why It Does Not Fully Satisfy the Requirement:**
Minimal test coverage — only tests the happy path of registration. No failure case testing at all.

**What Needs to Be Corrected:**
Add integration tests for: login (success and failures), token refresh, protected route access (with and without valid tokens), permission denial (role-based 403 responses), organization CRUD, membership operations, invitation flows, and session management.

**Important:** Do not modify the code. This is only an audit finding.

---

### 4.6 Never Leak Sensitive Errors

**Status:** Implemented but Incorrect

**Requirement:**
Never leak sensitive errors to clients.

**Relevant Files:**
- `src/middlewares/error.middleware.ts` — Global error handler
- `src/utils/appError.ts` — `AppError` class
- `src/config/logger.config.ts` — Logger with sensitive header redaction

**What Is Already Implemented:**
- The `AppError` class supports custom status codes and messages
- The error handler returns `err.message` with the status code, or defaults to 500
- The logger redacts `authorization` headers, `cookie` headers, and `set-cookie` response headers

**What Is Incorrect or Missing:**
1. **Raw error messages are forwarded to clients**: The error handler sends `err.message` directly. Most service-layer errors throw generic `new Error("...")` (not `AppError`), which means Prisma database errors, internal errors, and other unexpected exceptions have their raw messages sent to the client.
2. **No distinction between operational and programming errors**: All errors are treated the same. A Prisma constraint violation or a database connection error would leak internal details.
3. **Stack traces in development**: While stack traces aren't explicitly sent, the raw error messages from libraries can contain sensitive information.
4. **Most thrown errors are `Error` not `AppError`**: Throughout the codebase, errors are thrown as `new Error("...")` without status codes. The error handler defaults to 500 for these, but still sends the raw message.

**Why It Does Not Fully Satisfy the Requirement:**
Internal error details can leak through raw error messages. Only `AppError` instances provide controlled responses, but the vast majority of errors in the codebase are generic `Error` objects.

**What Needs to Be Corrected:**
1. The error handler should detect non-`AppError` errors and return a generic "Internal server error" message instead of the raw message in production
2. Convert service-layer errors to `AppError` with appropriate status codes
3. Log the actual error details server-side while returning sanitized messages to clients

**Important:** Do not modify the code. This is only an audit finding.

---

## 5. Features Not Yet Implemented

### 5.1 User Logout

**Status:** Not Yet Implemented

**Requirement:**
Users must be able to log out (invalidate their current session).

**Evidence:**
- `src/features/auth/auth.route.ts` lines 25-31: Logout routes are **commented out**
- `src/features/auth/auth.controller.ts` lines 116-136: `logoutUser` function is **commented out**
- `src/features/auth/auth.controller.ts` line 138: `logoutAllUser` is an **empty function body** (`{}`)
- `src/features/auth/auth.service.ts` lines 183-193: `logoutUser` service function is **commented out**
- `src/features/users/user.route.ts` lines 13-15: Another logout route is **commented out**

**What Needs to Be Implemented:**
1. Uncomment and complete the logout route in `auth.route.ts`
2. Implement the logout controller to clear cookies and revoke the session
3. Implement the logout service to revoke the session using the existing `revokeSession()` repository function
4. Optionally implement "logout all" to revoke all user sessions

**Important:** Do not implement it. This document only records the missing requirement.

---

### 5.2 Audit Log for Login, Invite, Role Change, Permission Change

**Status:** Not Yet Implemented

**Requirement:**
Audit log tracking for: login, invite, role change, permission change.

**Evidence:**
- **No `AuditLog` model** in `prisma/schema.prisma`
- **No audit log feature directory** under `src/features/`
- **No audit log service, repository, controller, or route**
- The only reference is a **commented-out route placeholder** in `src/features/organizations/organization.route.ts` lines 58-60:
  ```
  // organizationRouter.get("/:organizationId/audit-logs", (req, res) => {
  //   res.send("get organization audit logs endpoint");
  // });
  ```
- Searched entire `src/` directory for "audit" — no implementation found

**What Needs to Be Implemented:**
1. Add an `AuditLog` model to the Prisma schema (with fields: actorId, organizationId, action, targetType, targetId, metadata, timestamp)
2. Create a new migration
3. Create audit log service with a `record()` method
4. Integrate audit logging into: login flow, invitation creation/acceptance, role change, permission change
5. Create an endpoint to retrieve audit logs for an organization (with proper authorization)

**Important:** Do not implement it. This document only records the missing requirement.

---

### 5.3 Use Request IDs

**Status:** Not Yet Implemented

**Requirement:**
Use request IDs for request tracing and correlation.

**Evidence:**
- Searched entire `src/` directory for "requestId", "request-id", "x-request-id" — no results found
- The `pino-http` logger middleware includes `req.id` in its serializer, but this is `pino-http`'s auto-generated ID — there is no explicit request ID middleware that generates and propagates a unique ID
- No middleware sets `X-Request-ID` response headers
- Error responses do not include request IDs for client-side correlation

**What Needs to Be Implemented:**
1. Create a request ID middleware that generates a UUID for each request (or accepts one from `X-Request-ID` header)
2. Attach the request ID to the request object
3. Include the request ID in all response headers
4. Include the request ID in all log entries
5. Include the request ID in error responses for debugging/support correlation

**Important:** Do not implement it. This document only records the missing requirement.

---

### 5.4 Log Sensitive Actions

**Status:** Not Yet Implemented

**Requirement:**
Log sensitive actions (distinct from audit logs — this refers to server-side logging of security-relevant events).

**Evidence:**
- The project uses `pino` + `pino-http` for HTTP request logging, which logs all requests
- However, there is **no explicit logging** of sensitive actions such as: login attempts (success/failure), password changes, role changes, invitation creation, session revocation, permission changes
- The logger config redacts sensitive headers, but no business-logic-level logging exists
- Service functions do not call `logger.info()` or `logger.warn()` for security events

**What Needs to Be Implemented:**
1. Import the logger into service modules
2. Add explicit log entries for security-sensitive operations: successful/failed logins, registrations, role changes, invitation events, session revocations
3. Include relevant context (userId, organizationId, action, target) without leaking sensitive data

**Important:** Do not implement it. This document only records the missing requirement.

---

### 5.5 Docker Compose for PostgreSQL and Redis

**Status:** Not Yet Implemented

**Requirement:**
Docker Compose configuration for local PostgreSQL and Redis.

**Evidence:**
- No `docker-compose.yml`, `docker-compose.yaml`, `compose.yml`, or `Dockerfile` found in the project
- Searched entire project for "docker" — only found references in `server.ts` comment ("Docker / Kubernetes") and roadmap markdown files
- The project uses **cloud-hosted services**: Neon for PostgreSQL (`@prisma/adapter-neon`) and Upstash for Redis (`@upstash/redis`, `@upstash/ratelimit`)
- No local database or Redis setup exists

**What Needs to Be Implemented:**
1. Create a `docker-compose.yml` with PostgreSQL and Redis services
2. Configure volume mounts for data persistence
3. Ensure the `.env` supports local connection strings
4. Optionally update the Prisma client to work with standard PostgreSQL (instead of Neon adapter) for local development

**Important:** Do not implement it. This document only records the missing requirement.

---

### 5.6 Postman/Bruno Demo Flow

**Status:** Not Yet Implemented

**Requirement:**
Postman or Bruno collection for demo flow: signup → create organization → invite user → assign role → try protected endpoint → show allowed/blocked result → view audit logs.

**Evidence:**
- No `.postman_collection.json`, `.bru`, or similar files found in the project
- Searched for "postman" and "bruno" — only found references in roadmap markdown files
- No `collections/` or similar directory exists

**What Needs to Be Implemented:**
1. Create a Postman collection or Bruno collection
2. Include the full demo flow: register, verify email, login, create organization, invite teammate, accept invitation, assign role, access protected endpoint, attempt unauthorized access, view audit logs
3. Include environment variables for base URL, tokens, etc.

**Important:** Do not implement it. This document only records the missing requirement.

---

## 6. Requirement-by-Requirement Detailed Audit

### R1: User Signup
- **Status:** Correctly Implemented
- **Implementation:** `src/features/auth/` — Full registration with Zod validation, bcrypt hashing, OTP email verification via BullMQ
- **Files:** `auth.route.ts`, `auth.controller.ts`, `auth.service.ts`, `auth.repository.ts`, `auth.validation.ts`
- **Analysis:** Complete flow: validate → check duplicate → hash password → create user → generate OTP → hash OTP → store OTP → enqueue email

### R2: User Login
- **Status:** Correctly Implemented
- **Implementation:** `src/features/auth/` — Login with credential validation, session creation, JWT issuance
- **Files:** `auth.route.ts`, `auth.controller.ts`, `auth.service.ts`, `session.repository.ts`
- **Analysis:** Complete flow: validate → find user → check deletedAt → check emailVerified → compare password → create session → create access/refresh tokens → set httpOnly cookies

### R3: User Logout
- **Status:** Not Yet Implemented
- **Implementation:** Commented-out code and empty function stubs
- **Files:** `auth.route.ts` (lines 25-31 commented), `auth.controller.ts` (lines 116-138 commented/empty)
- **Analysis:** The logout route, controller, and service are all commented out or empty. No active logout functionality exists.

### R4: Password Hashing with bcrypt or Argon2
- **Status:** Correctly Implemented
- **Implementation:** `bcryptjs` with salt rounds 12
- **Files:** `auth.service.ts` (lines 39, 83)
- **Analysis:** bcrypt hashing on registration, bcrypt comparison on login. Salt rounds of 12 provide good security.

### R5: JWT Access Token (Short-Lived)
- **Status:** Correctly Implemented
- **Implementation:** 15-minute JWT access tokens
- **Files:** `src/utils/token.ts`
- **Analysis:** JWT signed with dedicated secret, 15-minute expiry, includes userId, sessionId, type, and unique jti.

### R6: Refresh Token Rotation
- **Status:** Correctly Implemented
- **Implementation:** Atomic rotation with chain tracking
- **Files:** `auth.service.ts`, `session.repository.ts`
- **Analysis:** Old token revoked, new token created, `replacedByTokenId` links the chain. All in a Prisma transaction.

### R7: Store Token Hashes, Not Raw Tokens
- **Status:** Correctly Implemented
- **Implementation:** SHA-256 hashing via `crypto.createHash`
- **Files:** `src/utils/token.ts` (`hashToken()`), `auth.service.ts`, `invitation.service.ts`
- **Analysis:** Both refresh tokens and invitation tokens are hashed before storage.

### R8: Organization/Workspace Creation
- **Status:** Correctly Implemented
- **Implementation:** Full CRUD with transactional owner membership creation
- **Files:** `src/features/organizations/`
- **Analysis:** Creates org + OWNER membership atomically. Slug generation with collision retry.

### R9: Team Membership
- **Status:** Correctly Implemented
- **Implementation:** List, get, update role, remove member, leave org
- **Files:** `src/features/memberships/`
- **Analysis:** Full membership management with role-based permission guards on each operation.

### R10: Roles: owner, admin, member, viewer
- **Status:** Implemented but Incorrect
- **Implementation:** Only OWNER, ADMIN, MEMBER exist
- **Files:** `prisma/schema.prisma` (Role enum), `src/config/rolePermission.config.ts`
- **Missing:** The `VIEWER` role is absent from the schema, permission config, and all logic.

### R11: Permission Table: users.read, users.invite, projects.write, billing.read
- **Status:** Implemented but Incorrect
- **Implementation:** Code-level permissions with different names/scopes
- **Files:** `src/config/permissions.config.ts`, `src/config/rolePermission.config.ts`
- **Missing:** Required permissions don't match. No database Permission table. No `projects.write` or `billing.read` scopes.

### R12: Route-Level Permission Guards
- **Status:** Correctly Implemented
- **Implementation:** `requirePermission()` middleware
- **Files:** `src/middlewares/authorization.middleware.ts`, route files
- **Analysis:** Applied to org update/delete, membership CRUD, invitation CRUD. Checks role against permission whitelist.

### R13: Resource-Level Ownership Checks
- **Status:** Correctly Implemented
- **Implementation:** Membership-based scoping and user-based filtering
- **Files:** `src/middlewares/organization.middleware.ts`, repository files
- **Analysis:** Org access scoped to members. Sessions scoped to user. Invitations scoped to email match.

### R14: Invite Teammate with Expiring Invite Token
- **Status:** Correctly Implemented
- **Implementation:** Random token with SHA-256 hash storage and 7-day expiry
- **Files:** `src/features/invitations/`
- **Analysis:** Role-authorized, duplicate-checked, hash-stored, expiring invitations with email delivery.

### R15: Accept Invitation Flow
- **Status:** Correctly Implemented
- **Implementation:** Accept and reject endpoints with full validation
- **Files:** `src/features/invitations/invitation.service.ts`, `invitation.repository.ts`
- **Analysis:** Validates email match, expiry, status. Creates membership on accept. Updates invitation status.

### R16: Session List
- **Status:** Correctly Implemented
- **Implementation:** GET endpoint listing all user sessions
- **Files:** `src/features/sessions/`
- **Analysis:** Returns all sessions with metadata, ordered by creation date.

### R17: Revoke Session
- **Status:** Implemented but Incorrect
- **Implementation:** Physical deletion instead of soft revocation
- **Files:** `src/features/sessions/session.service.ts`, `session.repository.ts`
- **Missing:** Uses `deleteMany()` instead of the existing `revokeSession()` function that sets `revokedAt`.

### R18: Audit Log
- **Status:** Not Yet Implemented
- **Implementation:** No model, service, controller, or route exists
- **Files:** N/A (commented-out placeholder in `organization.route.ts`)
- **Missing:** Entire audit log system.

### R19: Rate Limit Auth Routes
- **Status:** Correctly Implemented
- **Implementation:** Upstash Redis sliding window rate limiting
- **Files:** `src/middlewares/rate-limit/`, `src/app.ts`
- **Analysis:** 10 req/15 min for auth, 60 req/15 min for orgs. Standard rate limit headers.

### R20: Swagger/OpenAPI Docs
- **Status:** Implemented but Incorrect
- **Implementation:** Partial OpenAPI spec covering only auth and org endpoints
- **Files:** `src/docs/openapi.yaml`, `src/docs/paths/`
- **Missing:** Memberships, invitations, sessions, users, and health endpoints are undocumented.

### R21: Integration Tests
- **Status:** Implemented but Incorrect
- **Implementation:** Single test for registration + email verification
- **Files:** `tests/integration/auth/register.test.ts`
- **Missing:** Login tests, permission failure tests, auth failure tests, and tests for all other features.

### R22: Validate Request DTOs with Zod
- **Status:** Correctly Implemented
- **Implementation:** Zod schemas with `validate()` middleware
- **Files:** `src/middlewares/validate.middleware.ts`, `*.validation.ts`
- **Analysis:** All feature modules have Zod schemas. Middleware validates body, params, and query.

### R23: Never Leak Sensitive Errors
- **Status:** Implemented but Incorrect
- **Implementation:** Error handler forwards raw error messages
- **Files:** `src/middlewares/error.middleware.ts`
- **Missing:** No distinction between operational and internal errors. Raw messages from library errors could leak.

### R24: Use Request IDs
- **Status:** Not Yet Implemented
- **Files:** N/A
- **Missing:** No request ID generation, propagation, or inclusion in responses.

### R25: Log Sensitive Actions
- **Status:** Not Yet Implemented
- **Files:** N/A
- **Missing:** No explicit logging of security events in service layer.

### R26: Deny by Default Authorization
- **Status:** Correctly Implemented
- **Implementation:** Middleware chain denies unauthenticated/unauthorized access
- **Files:** `src/middlewares/authentication.middleware.ts`, `authorization.middleware.ts`
- **Analysis:** 401 for missing auth, 403 for missing membership/permission. Whitelist-based permissions.

### R27: Docker Compose
- **Status:** Not Yet Implemented
- **Files:** N/A
- **Missing:** No Docker configuration. Uses cloud services (Neon, Upstash) instead.

### R28: Environment Variables
- **Status:** Correctly Implemented
- **Implementation:** Zod-validated env config
- **Files:** `src/config/env.config.ts`, `.env`
- **Analysis:** All config from env vars with strict validation and fail-fast.

### R29: Health Check Endpoint
- **Status:** Correctly Implemented
- **Implementation:** GET `/api/v1/health`
- **Files:** `src/features/health/health.route.ts`
- **Analysis:** Returns 200 with status and timestamp.

### R30: Local Database Migrations
- **Status:** Correctly Implemented
- **Implementation:** Prisma migrations with 4 versioned migrations
- **Files:** `prisma/migrations/`, `prisma/schema.prisma`
- **Analysis:** Proper migration history with test database reset support.

### R31: Postman/Bruno Demo Flow
- **Status:** Not Yet Implemented
- **Files:** N/A
- **Missing:** No collection file for API testing/demo.

---

## 7. Project Architecture Understanding

### Frontend
No frontend — this is a backend-only API project, as specified in the requirements. The API is designed to be tested with Swagger, Postman, or Bruno.

### Backend
- **Runtime:** Node.js with TypeScript (ES modules)
- **Framework:** Express 5.x
- **Architecture:** Feature-based modular structure with separation of concerns:
  - `route` → `controller` → `service` → `repository` → database
- **Features:** auth, organizations, memberships, invitations, sessions, users, health
- **Background processing:** BullMQ with Redis for email queue processing
- **Dev server:** `tsx watch` for hot reloading

### Database
- **Primary:** PostgreSQL via Neon (cloud-hosted, serverless)
- **ORM:** Prisma with `@prisma/adapter-neon`
- **Models:** User, Session, RefreshToken, Otp, Organization, Membership, Invitation
- **Key relationships:**
  - User → Sessions, OTPs, Memberships, Invitations (as inviter)
  - Organization → Memberships, Invitations
  - Session → RefreshTokens (with rotation chain via `replacedByTokenId`)
  - Membership links User ↔ Organization with Role

### Authentication
- **Signup:** Email/password registration with OTP email verification
- **Login:** Credential validation → session creation → JWT access token (15 min) + refresh token (30 days) in httpOnly cookies
- **Token refresh:** Full rotation — old token revoked, new token issued, chain tracked
- **Token storage:** SHA-256 hashed refresh tokens and invitation tokens
- **Password hashing:** bcryptjs with salt rounds 12

### Authorization
- **Model:** Role-Based Access Control (RBAC) with code-defined permissions
- **Roles:** OWNER (all permissions), ADMIN (most permissions, no org update/delete), MEMBER (read-only)
- **Enforcement:** Three-layer middleware chain: `authenticate` → `requireOrgMembership` → `requirePermission`
- **Pattern:** Deny by default — only explicitly granted permissions are allowed

### API/Data Flow
```
Client Request
  → CORS
  → JSON parser
  → Cookie parser
  → pino-http logger
  → Rate limiting (for auth/org routes)
  → Route handler
    → Validation middleware (Zod)
    → Authentication middleware (JWT verify)
    → Organization membership middleware
    → Permission guard middleware
    → Controller → Service → Repository → Prisma → PostgreSQL
  → Error handler (global)
  → Response
```

### External Services
- **Neon:** Cloud PostgreSQL (via `@prisma/adapter-neon`)
- **Upstash Redis:** Rate limiting (`@upstash/ratelimit`) and BullMQ job queue (`ioredis`)
- **Gmail SMTP:** Email delivery via Nodemailer (verification emails, invitation emails)

---

## 8. Final Completion Assessment

### Correctly Implemented (19)
1. User signup
2. User login
3. Password hashing with bcrypt
4. JWT access token (short-lived)
5. Refresh token rotation
6. Store token hashes, not raw tokens
7. Organization/workspace creation
8. Team membership
9. Route-level permission guards
10. Resource-level ownership checks
11. Invite teammate with expiring invite token
12. Accept invitation flow
13. Session list
14. Rate limit auth routes
15. Validate request DTOs with Zod
16. Deny by default authorization
17. Environment variables
18. Health check endpoint
19. Local database migrations

### Implemented but Incorrect (6)
1. Roles — missing VIEWER role
2. Permission table — wrong permission names, no DB table
3. Revoke session — deletes instead of revoking
4. Swagger/OpenAPI docs — only ~40% of endpoints documented
5. Integration tests — only 1 test, no permission failure tests
6. Never leak sensitive errors — raw error messages forwarded to client

### Not Implemented (6)
1. User logout
2. Audit log system
3. Request IDs
4. Sensitive action logging
5. Docker Compose for PostgreSQL and Redis
6. Postman/Bruno demo flow

### Highest-Priority Fixes
1. **Implement user logout** — This is a core MVP requirement. The code is partially written (commented out) and the `revokeSession()` repository function already exists. Estimated effort: low.
2. **Implement audit log system** — Critical for the project's stated purpose ("track sensitive actions through audit logs"). Requires new Prisma model, migration, service, and integration into existing flows. Estimated effort: medium.
3. **Fix session revocation** — Change from physical deletion to soft revocation using the existing `revokeSession()` function. Estimated effort: very low.
4. **Add VIEWER role** — Missing from the schema enum and permission config. Estimated effort: low.
5. **Fix error handling** — Prevent leaking raw error messages from internal/library errors in production. Estimated effort: low.

### Overall Assessment
The project demonstrates a solid understanding of authentication, token management, and RBAC fundamentals. The core security patterns (bcrypt hashing, JWT with short expiry, refresh token rotation with hash storage, deny-by-default authorization) are well-implemented. However, the project falls short of its stated MVP requirements in several critical areas: **logout is not functional**, the **audit log system is entirely absent** (despite being a cornerstone feature of the project's purpose), the **VIEWER role is missing**, and **test coverage is minimal**. The project is approximately **61% complete** against the full requirement set, with the remaining gaps concentrated in audit/observability, DevOps tooling, documentation, and testing — areas that would need to be addressed before the project could serve as a credible portfolio piece demonstrating "auth, RBAC, permissions, sessions, and audit logs."
