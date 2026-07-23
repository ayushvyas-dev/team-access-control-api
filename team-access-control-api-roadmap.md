# Team Access Control API — Refined Build Roadmap (v2)

## What changed from the plan you were given

**Kept:** the final tech stack ambition (Vitest over Jest is a fine swap, Pino, Swagger, Docker, CI/CD, real deployment), the DB table list, the error-class taxonomy.

**Fixed:**
- `authorize(["users.read"])` as a *global* check has no org context. In a multi-tenant system your role differs per organization — every permission check must be scoped to the caller's membership in *that specific org*, not a flat global check. This is the core bug in that plan.
- Refresh rotation was missing reuse-detection. "Rotate → update session" alone doesn't get you the actual security benefit of rotation — you need to detect when an already-rotated token is reused and kill the whole session.
- Accepting an invitation (create membership + mark invitation accepted) needs to be a DB transaction — not mentioned at all in the original plan.
- `logAuditEvent()` as one generic middleware can't capture per-action detail (old role → new role, which user was removed, etc.) — use explicit service calls from within the action, with a thin middleware only for simple cases like login.

**Cut down to optional/stretch:** BullMQ, Prometheus/Grafana, full CI/CD, deployment. These are legitimate production patterns and worth doing — but only *after* Tier 1–2 work and are demoable. Frontloading them is why 21-step plans stall in week 3.

**Resolved a design decision the original plan left implicit:** Roles and Permissions are a **global fixed set** (`OWNER/ADMIN/MEMBER/VIEWER`, seeded once), not per-organization rows. A `Membership` just points a user to one of these roles within one org. Simpler schema, matches the fact that your role list is fixed, not user-defined.

---

## Tier 1 — Core (the actual point of this project)

### Phase 0 — Skeleton
- [ ] `src/{config,controllers,services,repositories,middlewares,routes,validators,utils,types}`
- [ ] Zod-validated env config, loaded and validated **at boot** — crash immediately on a missing `JWT_SECRET`, don't fail mysteriously on first request
- [ ] `docker-compose.yml`: postgres + redis
- [ ] Error class taxonomy up front, not bolted on later: `AppError`, `AuthenticationError`, `AuthorizationError`, `NotFoundError`, `ValidationError`, `ConflictError` — and a global handler wired in from commit #1, even before there's much to catch
- [ ] `GET /health/live` (process is up) and `GET /health/ready` (DB + Redis reachable) — separating these two is a real production distinction: a pod can be alive but not ready to take traffic

### Phase 1 — Data model
Design on paper first:
```
User ──< Membership >── Organization
              │
              ▼
            Role ──< RolePermission >── Permission   (Role/Permission = global, fixed, seeded)

Session ──< RefreshToken (chain: replacedByTokenId)
Invitation (per org, per email, expiring token)
AuditLog (actor, org, action, target, metadata)
```
- [ ] `users`, `organizations`, `memberships` (unique on `userId+organizationId`), `roles`, `permissions`, `role_permissions`, `sessions`, `refresh_tokens`, `invitations`, `audit_logs`
- [ ] Prisma schema + `prisma migrate dev` for local migrations (note: production uses `prisma migrate deploy`, not `db push` — different commands, different purposes, don't blur them)
- [ ] Seed script: 4 roles, your permission list (e.g. `users.read`, `users.invite`, `org.update`, `projects.write` — adapt keys to whatever resources you actually build), role→permission mapping

### Phase 2 — Auth: signup / login / logout
- [ ] `POST /auth/register` — Zod DTO, hash password (bcrypt or Argon2id), create user
- [ ] `POST /auth/login` — verify, issue short-lived access JWT (~15 min, payload = `userId` only, **not** roles/permissions — those get checked live so a role change doesn't need a re-login), create `Session` + `RefreshToken`
- [ ] `POST /auth/logout` — revoke that session
- [ ] `POST /auth/logout-all` — revoke every session for the user

### Phase 3 — Refresh rotation + sessions (do this properly, it's the load-bearing security piece)
```ts
async function refresh(rawToken: string) {
  const tokenHash = hash(rawToken);
  const existing = await refreshTokenRepo.findByHash(tokenHash);

  if (!existing || existing.expiresAt < now()) throw new AuthenticationError();
  if (existing.revokedAt) {
    // this token was already rotated once — someone is replaying an old token = theft signal
    await sessionRepo.revokeAll(existing.sessionId);
    throw new AuthenticationError();
  }

  await refreshTokenRepo.revoke(existing.id);
  const newToken = await refreshTokenRepo.create({ sessionId: existing.sessionId, replaces: existing.id });
  const accessToken = signAccessToken(existing.session.userId);
  return { accessToken, refreshToken: newToken.raw };
}
```
- [ ] `GET /sessions` — list active sessions (device/IP/lastUsedAt)
- [ ] `DELETE /sessions/:id` — revoke one session

### Phase 4 — Organizations & membership
- [ ] `POST /organizations` — creates org + a `Membership` for the creator as `OWNER`
- [ ] `requireOrgMembership` middleware — reads `:orgId`, confirms a `Membership` exists for `req.user.id`, attaches `req.membership` (with role) downstream

### Phase 5 — RBAC (org-scoped, this time correctly)
```ts
function requirePermission(permission: string) {
  return async (req, res, next) => {
    const { role } = req.membership; // set by requireOrgMembership, scoped to THIS org
    const permissions = await roleRepo.getPermissionKeys(role.id); // cache in Redis, read on every request
    if (!permissions.includes(permission)) return next(new AuthorizationError());
    next();
  };
}

// router.patch('/:orgId/members/:userId/role',
//   authenticate, requireOrgMembership, requirePermission('users.invite'), handler)
```
- [ ] `GET /organizations/:orgId/members`
- [ ] `PATCH /organizations/:orgId/members/:userId/role`
- [ ] Ownership checks are a **separate layer** from permission checks — done inside the service, after `requirePermission` passes: `resource.ownerId === req.user.id`, bypassed for `ADMIN`/`OWNER`. Don't fold this into the permission middleware; conflating "can this role act at all" with "does this user own this resource" is the most common RBAC bug.

### Phase 6 — Invitations
- [ ] `POST /organizations/:orgId/invitations` — requires `users.invite`, generates token, stores **hash** + expiry + target role, logs it (no email service needed — a console line is fine per the original spec)
- [ ] `POST /invitations/:token/accept` — hash lookup, check expiry, then **in one transaction**: create `Membership`, mark invitation accepted

### Phase 7 — Audit logs
- [ ] `AuditLogService.record({ actorId, orgId, action, targetType, targetId, metadata })` — one method, called explicitly from login, invite-sent, invite-accepted, role-changed, session-revoked
- [ ] `GET /organizations/:orgId/audit-logs` — paginated, admin/owner only

---

## Tier 2 — Production hardening (not optional if you want to call this "production-standard")

- [ ] Rate limit `/auth/*` via Redis (`rate-limiter-flexible`)
- [ ] Zod DTOs on every mutating route
- [ ] `helmet`, CORS allowlist, secure cookie flags if you store the refresh token in a cookie
- [ ] Request-ID middleware (UUID per request) threaded through logs and error responses
- [ ] Structured logging (Pino) — request in, response out, errors, auth failures
- [ ] Graceful shutdown — on `SIGTERM`, stop accepting new connections, drain in-flight requests, close the Prisma/Redis connections cleanly. This is the kind of thing that's invisible until your first container restart drops requests.
- [ ] Vitest + Supertest, dedicated test DB, reset between tests. Prioritize permission-denied and ownership-denied test cases over happy-path CRUD tests — that's what the project is actually proving.
- [ ] Swagger/OpenAPI + a Postman/Bruno collection covering: signup → create org → invite → accept → try a protected route as each role → view audit log
- [ ] `.env.example` committed, real `.env` never committed, secrets never hardcoded

---

## Tier 3 — Ship it
- [ ] Dockerfile (multi-stage build) + finalize `docker-compose.yml`
- [ ] GitHub Actions: lint → typecheck → test → build, on every push
- [ ] Deploy to Railway or Render with managed Postgres + Redis — this is what turns "I built an API" into "I have a live URL," worth doing once Tier 1–2 are solid

## Tier 4 — Optional stretch (only after everything above actually works)
- [ ] BullMQ + a worker process for invite emails / expired-session cleanup — legitimate pattern, but a second running process is real added complexity; add it once the core is done, not while you're still debugging RBAC
- [ ] `/metrics` via `prom-client` — a lightweight metrics endpoint gets you 90% of the resume value without standing up a full Prometheus+Grafana stack. Only go full Grafana if you specifically want that on your resume.
- [ ] Password reset flow, API keys for M2M auth, soft delete, admin pagination/filtering

---

## Suggested pacing
Tier 1 (weeks 1–3): the actual learning goal — auth, rotation, org-scoped RBAC, invitations, audit logs.
Tier 2 (week 4): the difference between "works on my machine" and "production-standard."
Tier 3 (week 5): ship a real URL.
Tier 4: keep going as long as you want, it's no longer teaching you anything new about this project's core concepts — it's resume polish.

Don't start Tier 4 until Tier 1's refresh rotation and Phase 5's org-scoped RBAC are both manually verified end-to-end. A shaky foundation there makes every bug above it impossible to diagnose correctly.
