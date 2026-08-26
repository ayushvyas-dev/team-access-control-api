# Team Access Control API

A backend API for authentication, organizations, team membership, invitations, sessions, role-based access control, and organization audit logs.

The project is built as a modular monolith. The goal is to keep the system simple enough to develop and deploy without unnecessary microservice complexity, while still maintaining clear boundaries between business logic, data access, infrastructure, and cross-cutting concerns.

## What the API does

- User registration with email verification
- Login with access and refresh tokens
- Refresh-token rotation and session management
- User profile management and soft deletion
- Organization creation and management
- Organization memberships with `OWNER`, `ADMIN`, and `MEMBER` roles
- Permission-based authorization
- Member role changes and member removal
- Organization invitations with expiry and status tracking
- Asynchronous verification-email delivery using BullMQ
- Redis-backed rate limiting
- Structured HTTP logging with Pino
- Organization audit logs for important actions
- OpenAPI/Swagger API documentation
- Centralized validation and error handling
- Graceful shutdown for HTTP, Redis, workers, and Prisma connections

## Tech stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js |
| Language | TypeScript |
| HTTP framework | Express 5 |
| Database | PostgreSQL |
| ORM | Prisma |
| PostgreSQL adapter | `@prisma/adapter-neon` |
| Authentication | JWT + database-backed sessions |
| Password hashing | bcryptjs |
| Validation | Zod |
| Rate limiting | Upstash Redis + `@upstash/ratelimit` |
| Background jobs | BullMQ + Redis |
| Email | Nodemailer / SMTP |
| Logging | Pino + pino-http |
| API documentation | OpenAPI 3 + Swagger UI |
| Testing | Vitest + Supertest |
| Development runner | tsx |
| Deployment target | Docker on AWS EC2 |

The current database connection uses Prisma's Neon adapter, so PostgreSQL can be provided by a managed service such as Neon instead of running PostgreSQL directly on EC2. Redis is currently provided through Upstash.

## Architecture

The API follows a feature-based modular-monolith architecture.

```text
Client
  |
  v
Express / HTTP layer
  |
  +-- CORS
  +-- JSON / cookies
  +-- request logging
  +-- rate limiting
  |
  v
Routes
  |
  v
Middleware
  |-- Authentication
  |-- Organization context
  |-- Authorization / permissions
  |-- Validation
  |
  v
Controllers
  |
  v
Services
  |
  +--------------------+
  |                    |
  v                    v
Repositories        Queues / Jobs
  |                    |
  v                    v
Prisma              BullMQ -> Redis -> Email Worker -> SMTP
  |
  v
PostgreSQL
```

### Feature structure

Each major domain lives under `src/features` and normally contains its own route, controller, service, repository, and validation layer.

```text
src/
├── app.ts
├── server.ts
├── config/
├── db/
├── docs/
├── features/
│   ├── audit-logs/
│   ├── auth/
│   ├── health/
│   ├── invitations/
│   ├── memberships/
│   ├── organizations/
│   ├── sessions/
│   └── users/
├── middlewares/
├── queues/
├── types/
├── utils/
└── workers/

prisma/
├── migrations/
└── schema.prisma

tests/
├── globalSetup.ts
├── setup.ts
└── integration/
```

### Responsibilities

**Routes**

Define endpoints and compose the middleware required for each endpoint. Business rules do not belong here.

**Controllers**

Translate HTTP requests into service calls and format HTTP responses. Controllers are intentionally thin.

**Services**

Contain business rules and application workflows such as registration, authentication, invitations, membership changes, organization operations, and audit-log creation.

**Repositories**

Own database access. Prisma queries are kept here instead of being spread throughout controllers and services.

**Validation**

Zod schemas validate request data before it reaches business logic.

**Middleware**

Handles cross-cutting concerns such as authentication, authorization, organization access, validation, rate limiting, logging, 404 handling, and centralized errors.

**Config**

Centralizes environment validation, Redis connections, logging, SMTP, permissions, roles, and Swagger configuration.

**Queues / workers**

Move email delivery away from the HTTP request-response path. The API creates a BullMQ job and the worker handles the actual SMTP operation.

## Main features

### Authentication

Authentication uses short-lived JWT access tokens together with database-backed sessions and refresh tokens.

Registration creates the user and generates a verification OTP. The verification email is queued instead of being sent directly during the HTTP request.

Login requires a verified account and creates a session with a refresh token.

Refresh tokens are stored as hashes rather than plaintext values. Refresh-token rotation is used so a previously used refresh credential cannot simply be reused indefinitely.

### Sessions

Sessions are stored in PostgreSQL and can be revoked individually or in bulk.

Session records can also retain information such as user-agent and IP address.

This gives the application server-side control over long-lived authentication instead of treating JWT authentication as completely stateless.

### Organizations and memberships

Users can belong to multiple organizations.

Memberships connect users to organizations and assign one of three roles:

- `OWNER`
- `ADMIN`
- `MEMBER`

The database enforces one membership per user and organization.

### Role-based access control

Roles are mapped to explicit permissions instead of scattering role checks throughout controllers.

Examples include:

- `organization:read`
- `organization:update`
- `organization:delete`
- `member:read`
- `member:update-role`
- `member:remove`
- `invitation:create`
- `invitation:delete`
- `audit-log:read`

Authorization can therefore be based on permissions rather than hard-coding every endpoint around a specific role.

### Invitations

Authorized organization members can invite users by email.

An invitation contains information such as:

- Organization
- Invited email
- Assigned role
- Expiry time
- Token hash
- Current status

Supported invitation states are:

- `PENDING`
- `ACCEPTED`
- `REJECTED`
- `EXPIRED`

Invitation acceptance creates the organization membership as part of the business workflow.

### Audit logs

Important organization actions are recorded in the `audit_logs` table.

An audit record contains information such as:

- Organization
- Actor
- Action
- Resource type
- Resource ID
- Metadata
- Timestamp

The audit system covers actions such as member invitations, member joins, member removals/leaves, role changes, invitation rejection/revocation, and organization updates.

Where appropriate, state changes and their corresponding audit entries are performed inside the same database transaction so they cannot become inconsistent with each other.

### Rate limiting

Rate limiting is backed by Redis instead of process-local memory.

Separate limiters are available for authentication and organization-heavy routes, along with a generic limiter.

This is important for deployment because rate-limit state can remain shared even if multiple API processes or instances are eventually running.

### Background email jobs

Verification emails are placed into a BullMQ queue.

Redis acts as the queue backend and a worker consumes the jobs and sends emails through SMTP.

The application also has graceful-shutdown handling so resources can be closed cleanly.

## Database design

The main PostgreSQL models are centered around users, organizations, memberships, invitations, sessions, refresh tokens, OTPs, and audit logs.

```text
User
 ├── Session
 │    └── RefreshToken
 ├── Otp
 ├── Membership ─── Organization
 ├── Invitation ─── Organization
 └── AuditLog

Organization
 ├── Membership
 ├── Invitation
 └── AuditLog
```

Important database decisions include:

- UUID primary keys
- Unique user emails
- Unique organization slugs
- Unique `(userId, organizationId)` memberships
- Hashed refresh tokens and invitation tokens
- Hashed OTPs
- Expiry-related indexes
- Soft deletion for users through `deletedAt`
- Cascading relationships where child records should disappear with their parent
- Restrictive deletion of audit actors so historical audit records remain meaningful

Prisma migrations are committed under `prisma/migrations` and should be used to evolve the database schema.

## API surface

The API is versioned under `/api/v1`.

Main endpoint groups include:

- `/api/v1/health`
- `/api/v1/auth`
- `/api/v1/organizations`
- `/api/v1/users`
- `/api/v1/sessions`
- `/api/v1/invitations`
- `/api/v1/organizations/{organizationId}/memberships`
- `/api/v1/organizations/{organizationId}/audit-logs`

OpenAPI definitions are maintained under `src/docs`.

Swagger UI is served from:

```text
/api/v1/api-docs
```

## Design decisions and tradeoffs

### Modular monolith instead of microservices

The application is split by business feature but still runs as one backend service.

This was intentional. The system needs clear internal boundaries, but splitting authentication, organizations, invitations, memberships, and audit logs into separate services would introduce deployment, networking, observability, and data-consistency complexity without much benefit at this stage.

The downside is that the modules still share one process and one database. If the system grows enough to justify it, individual modules could be extracted later.

### JWT access tokens + stateful refresh sessions

A completely stateless JWT design is simple, but revocation and device/session management become harder.

The current design keeps access tokens lightweight while tying refresh tokens to database sessions. This provides server-side session control at the cost of additional database work.

### Refresh-token hashing and rotation

Refresh tokens are not stored in plaintext. Only hashes are persisted.

Rotation also limits the useful lifetime of an individual refresh credential.

The tradeoff is additional database operations and more complicated refresh logic compared with a single long-lived JWT.

### Redis-backed rate limiting

A process-local limiter would be easier to set up, but each application instance would have its own limits.

Redis keeps the state shared across instances.

The tradeoff is an additional infrastructure dependency.

### BullMQ for email delivery

Sending SMTP email directly from an HTTP request would make registration dependent on the mail server's latency and availability.

Queueing the email keeps the request path faster and isolates email failures.

The tradeoff is another moving part: Redis, a queue, and a worker.

### Feature-based structure

Code is grouped by domain rather than putting all controllers, services, and repositories into separate global directories.

This makes a feature easier to understand and maintain as a unit.

The downside is some repetition in the structure of each feature.

### Prisma

Prisma provides typed database access and migration support while keeping most SQL details out of application code.

The tradeoff is another abstraction layer and dependency on Prisma's generated client and adapter ecosystem.

### Split OpenAPI documentation

The OpenAPI specification is split by resource instead of keeping everything in one very large YAML file.

This makes individual endpoint documentation easier to maintain.

The tradeoff is that adding an endpoint may require changes in more than one documentation file.

## Project setup

### Requirements

Install:

- Node.js
- npm
- PostgreSQL or a PostgreSQL-compatible managed database
- Redis-compatible service
- SMTP account

The current production-oriented configuration uses Neon for PostgreSQL connectivity and Upstash for Redis.

### 1. Clone the repository

```bash
git clone https://github.com/ayushvyas-dev/team-access-control-api.git
cd team-access-control-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

```env
PORT=5000
NODE_ENV=development

FRONTEND_URL=http://localhost:3000

DATABASE_URL=your_postgresql_connection_string
TEST_DATABASE_URL=your_test_postgresql_connection_string

UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
UPSTASH_REDIS_URL=your_upstash_redis_url

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_DAYS=30

SMTP_USER=your_smtp_email
SMTP_PASSWORD=your_smtp_password

LOG_LEVEL=info

API_DOCS_USERNAME=your_docs_username
API_DOCS_PASSWORD=your_docs_password
```

The application validates environment variables at startup and exits if required configuration is missing or invalid.

Do not commit `.env` or production credentials to the repository.

### 4. Run database migrations

```bash
npx prisma migrate deploy
```

For local schema development, use Prisma migrations instead of manually changing the database.

### 5. Start the API

```bash
npm run dev
```

The API will normally be available at:

```text
http://localhost:5000/api/v1
```

The port is controlled by `PORT`.

### 6. Run the worker

```bash
npm run worker
```

The email worker consumes verification-email jobs from BullMQ.

Review the final process model before production deployment. If API and worker processes are separated into different containers, the worker should run independently rather than being duplicated unnecessarily across API replicas.

### 7. Run tests

```bash
npm test
```

Vitest is configured with global setup and test setup files.

Integration tests use a separate test database configured through `TEST_DATABASE_URL`.

## Docker and AWS EC2 deployment

The planned deployment target is:

```text
Internet
   |
   v
AWS EC2
   |
   +-- Docker: Team Access Control API
   |
   +-- Docker/process: Email Worker
   |
   +----> Neon PostgreSQL
   |
   +----> Upstash Redis
   |
   +----> SMTP provider
```

### Current deployment status

The application is intended to be deployed using Docker on AWS EC2.

Before deployment, the repository needs its production Docker setup, including a `Dockerfile` and the final API/worker process model.

The deployment should follow roughly this flow:

1. Build the production Docker image.
2. Configure production environment variables on EC2.
3. Run Prisma migrations against the production database.
4. Start the API container.
5. Start the worker as a separate process/container if required.
6. Configure the EC2 security group.
7. Put HTTPS in front of the application using a reverse proxy/load balancer.
8. Configure automatic container restarts and basic monitoring.

A typical container command after the Dockerfile is finalized would look like:

```bash
docker build -t team-access-control-api .

docker run -d \
  --name team-access-control-api \
  --restart unless-stopped \
  --env-file .env \
  -p 5000:5000 \
  team-access-control-api
```

The exact command should match the final Dockerfile and deployment architecture.

### Production considerations

For a public deployment:

- Do not expose PostgreSQL directly to the internet.
- Do not expose Redis directly to the internet.
- Keep secrets outside the Docker image.
- Use HTTPS.
- Use secure cookie settings in production.
- Restrict the EC2 security group to only the required ports.
- Run database migrations as an explicit deployment step.
- Configure container restart policies.
- Keep application and worker logs accessible.
- Avoid running multiple workers unintentionally if the deployment is scaled horizontally.

## Security considerations

- Passwords are hashed with bcrypt.
- OTPs, refresh tokens, and invitation tokens are stored as hashes.
- Authentication and organization routes have dedicated rate limits.
- JWT secrets and infrastructure credentials are provided through environment variables.
- CORS is restricted to the configured frontend URL.
- Sessions and refresh tokens can be revoked.
- Important organization changes are recorded in audit logs.
- Database constraints enforce several integrity rules in addition to application-level validation.
- Production deployments should use HTTPS.

## Repository structure

```text
team-access-control-api/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── scripts/
│   └── test.ts
├── src/
│   ├── config/
│   │   ├── bullmqRedis.config.ts
│   │   ├── env.config.ts
│   │   ├── logger.config.ts
│   │   ├── nodemailer.config.ts
│   │   ├── permissions.config.ts
│   │   ├── rateLimitRedis.config.ts
│   │   ├── rolePermission.config.ts
│   │   └── swagger.config.ts
│   ├── db/
│   │   └── prisma.ts
│   ├── docs/
│   │   ├── openapi.yaml
│   │   └── paths/
│   ├── features/
│   │   ├── audit-logs/
│   │   ├── auth/
│   │   ├── health/
│   │   ├── invitations/
│   │   ├── memberships/
│   │   ├── organizations/
│   │   ├── sessions/
│   │   └── users/
│   ├── middlewares/
│   │   ├── authentication.middleware.ts
│   │   ├── authorization.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── logger.middleware.ts
│   │   ├── notFound.middleware.ts
│   │   ├── organization.middleware.ts
│   │   ├── rate-limit/
│   │   └── validate.middleware.ts
│   ├── queues/
│   │   └── email.queue.ts
│   ├── types/
│   ├── utils/
│   ├── workers/
│   │   └── email.worker.ts
│   ├── app.ts
│   └── server.ts
├── tests/
│   ├── integration/
│   ├── globalSetup.ts
│   └── setup.ts
├── prisma.config.ts
├── tsconfig.json
├── vitest.config.ts
├── package.json
└── package-lock.json
```

## Current status

The major backend functionality is implemented, including:

- Authentication
- Organizations
- Memberships
- Invitations
- Sessions
- RBAC
- Audit logs
- Rate limiting
- Background email jobs
- API documentation
- Integration-test setup

The remaining deployment-oriented work is primarily Docker/containerization, production infrastructure configuration, and deployment verification on AWS EC2.

## API documentation

The OpenAPI specification is maintained under `src/docs`.

Swagger UI is available at:

```text
/api/v1/api-docs
```

The API documentation is protected by HTTP Basic Authentication in the current configuration. The credentials should be supplied through environment variables rather than hard-coded.

## Why this project was built this way

This project is intentionally more than a collection of CRUD endpoints.

The main focus is on the backend concerns that become important when an application has real users: session revocation, refresh-token rotation, authorization boundaries, transactional state changes, auditability, asynchronous work, shared rate limiting, validation, logging, and graceful shutdown.

At the same time, the project avoids premature infrastructure complexity. It remains one deployable backend with clear internal modules, making it practical to run on a single AWS EC2 instance while leaving room to scale individual pieces later if the requirements justify it.
