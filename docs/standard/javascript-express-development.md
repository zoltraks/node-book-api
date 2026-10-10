# JavaScript and Express Engineering Standards

<!-- Version: 0.1.2 | Date: 2026-10-10 | Runtime: Node.js 22 LTS (node:22-alpine), Express 5 -->

## Purpose

This document defines the engineering standard for a small Node.js HTTPS service written in
JavaScript on the Express 5 framework.

It covers the runtime version, module system, project layout, coding conventions, configuration,
security, logging, testing, and build.

It builds on the JavaScript engineering standard and adds only the Express-specific rules.

It is written to be executed directly by an AI coding agent and to be read without effort by a
human reviewer.

## Scope

A project is in scope when all of the following conditions hold.

- The project is a Node.js service written in JavaScript.
- The package is a CommonJS package.
- The HTTP layer is Express 5.
- The service terminates TLS itself through the built-in `https` module.
- The service is a minimal example or proof of concept, not a production deployment.

A project that uses TypeScript, Fastify, Koa, Hapi,
or NestJS is out of scope - those stacks have different conventions and ecosystems.

A project that renders a browser UI is out of scope for its frontend portions.

## How To Use This Standard

This section is the entry point for an agent.

Read it before reading anything else in this document.

### Order Of Operations

Follow these steps in order at the start of every task that touches JavaScript or Express code.

1. Read the project rules file, such as `AGENTS.md`, `README.md`, or `docs/GUIDELINES.md`,
   because a project rule overrides this standard.
2. Read the JavaScript engineering standard for shared runtime, tooling, and dependency rules.
3. Determine the Node.js version, Express version, module system,
   and test framework using the Agent Intake Protocol below.
4. Confirm the conclusion with the user when the repository is ambiguous.
5. Apply the sections of this standard that match the confirmed project kind.
6. Run every applicable row of the Verification section.
7. Check the result against the Definition of Done before reporting the task complete.

### Precedence

When two rules conflict, apply the first matching source in this list.

| Rank | Source                                    | Example                                      |
|------|-------------------------------------------|----------------------------------------------|
| 1    | An explicit instruction from the user     | "Keep this service on Express 5"             |
| 2    | The project rules file                    | `README.md`                                  |
| 3    | The existing convention in the repository | SCREAMING_SNAKE env names matching key names |
| 4    | This standard                             | Environment config resolved once at startup  |
| 5    | General JavaScript best practice          | Anything the four sources above do not cover |

Never silently reformat existing code to match this standard.

A whole-repository reformat destroys review history and hides the real change inside noise.

Bring a deviation to the user as a proposal, not as an unrequested edit.

### Non-Negotiable Rules

- **No hardcoded secrets.** A real secret in a committed file is a security incident - the
  documented development defaults in `.env.example` are the declared exception for this
  educational service.
- **`package-lock.json` is committed.** A build that cannot reproduce is a defect.
- **`npm audit --omit=dev` reports no vulnerabilities.** A vulnerability in production
  dependencies is a defect.
- **Every route validates its input.** An unvalidated body, query,
  or parameter reaching business logic is a defect.
- **Authorization is enforced on the server.** Token verification happens in middleware on every
  protected route.
- **No `var`.** Use `const` by default and `let` only when reassignment is required.
- **`node --check` produces no errors** on every changed file.
- **No new runtime dependency without a reason.** A minimal example service keeps its dependency
  list short.

A violation of any of these rules is a defect, not a style preference.

## Agent Intake Protocol

### Detection First

Before asking the user anything, inspect the repository and infer the project shape.

| Signal Found In The Repository            | Inferred Decision              | Confidence |
|-------------------------------------------|--------------------------------|------------|
| `package.json` with `express` 5           | Express 5                      | High       |
| `package.json` without `"type": "module"` | CommonJS                       | High       |
| `package.json` with `dotenv`              | `.env` file loading at startup | High       |
| `package.json` with `jsonwebtoken`        | JWT bearer authentication      | High       |
| `https.createServer` in source            | Service terminates TLS itself  | High       |
| An `openapi.yaml` served statically       | Static OpenAPI contract file   | High       |
| `Dockerfile` and `docker-compose.yml`     | Container deployment supported | High       |
| No test script beyond the npm stub        | No test suite configured       | High       |

### Existing Project

When detection is confident, state the conclusion and ask for a single confirmation rather than
running a questionnaire.

Example: "I see an Express 5 service in CommonJS JavaScript on Node 22, with dotenv
configuration and JWT auth.

I will follow the existing conventions.

Is that correct?"

When detection is ambiguous, ask only the questions that resolve the ambiguity.

### New Project

When the repository is empty or the user declares a new project, ask the following questions.

| Question               | Options                             | Default If Declined  |
|------------------------|-------------------------------------|----------------------|
| Which Node.js version? | 22 LTS, 20 LTS                      | 22 LTS               |
| Which project kind?    | Production service, minimal example | Production service   |
| Which module system?   | ESM, CommonJS                       | ESM                  |
| Which test framework?  | Vitest, Node `--test`, Jest         | Vitest               |
| Which linter?          | ESLint 9 flat config, legacy        | ESLint 9 flat config |

## Documentation

The following are the authoritative sources for JavaScript and Express development.

- [Node.js Documentation](https://nodejs.org/docs/latest/api/) - runtime API reference
- [Express 5 Documentation](https://expressjs.com/) - framework reference
- [Express Routing Guide](https://expressjs.com/en/5x/guide/routing/) - `express.Router`,
  `app.route()`, and mounting conventions
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
  - performance and reliability guidance
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html) -
  security guidance for production services
- The general JavaScript engineering standard - base runtime and tooling rules
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) - community-curated
  structure and architecture practices
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - JWT signing and verification
- [dotenv](https://github.com/motdotla/dotenv) - environment file loading
- [@peculiar/x509](https://github.com/PeculiarVentures/x509) - X.509 certificate tooling for
  development utilities

## Language Version

The project targets an active Node.js LTS release - the same major version as the Docker base
image (`node:22-alpine`).

No `.nvmrc` or `engines` pin exists, because the container base image carries the runtime that
ships - an accepted simplification for a single-maintainer example.

The package is CommonJS: `require` and `module.exports`, no `"type": "module"` in
`package.json`.

Do not mix ESM `import` syntax with CommonJS in the same file.

Do not introduce TypeScript or a build step without an explicit user decision, because a minimal
service has no compile stage.

## Core Technologies

- Express 5 for the HTTP layer.
- Built-in `https` module for TLS termination.
- `jsonwebtoken` for JWT issuing and verification.
- `dotenv` for `.env` loading.
- `@peculiar/x509` for self-signed certificate generation in development utilities.
- Built-in `node --watch` for development reload.

Dependencies are added only when the need is concrete and the standard library is significantly
more complex.

Prefer versions published at least 7 days ago - avoid floating ranges that auto-resolve to
brand-new releases.

## Project Structure

```plaintext
index.js                  entry point - middleware, routes, auth, TLS listen
<utility>.js              single-purpose helpers such as certificate generation
public/                   static assets, including the OpenAPI contract
docs/                     project documentation and standards
certs/                    generated certificate material (gitignored)
.env.example              configuration template
Dockerfile                production image build
docker-compose.yml        local container runtime
```

A single entry-point file is a legitimate, deliberate choice for a minimal example service -
Express itself makes no structural assumptions, per the
[Express FAQ](https://expressjs.com/en/5x/starter/faq/).

It stays acceptable while every route fits the file without unrelated concerns piling up.

### Scaling Structure

When routes, middleware, or logic outgrow a single file, grow the structure instead of letting
the entry file accumulate unrelated concerns.

**Router modules.** `express.Router` is the official unit of modularity - a router is a
"mini-application" carrying its own middleware and routes, exported as a module and mounted on a
path prefix with `app.use()` ([Express Routing Guide](https://expressjs.com/en/5x/guide/routing/),
[Router API](https://expressjs.com/en/5x/api/router/)).

```plaintext
src/
  index.js              entry point - config, middleware, router mounting, TLS listen
  routes/
    books.js            one Router module per domain or resource
    auth.js
  middleware/           cross-cutting middleware (logging, auth, errors)
  services/             business logic behind the route layer
```

- One `Router` module per domain or resource, mounted once on its prefix.
- Middleware applying to a whole domain lives inside that router module or at the mount point:
  `app.use('/api', authenticateJWT, router)`.
- Sub-routers needing parent path parameters are created with `mergeParams: true`
  ([Router options](https://expressjs.com/en/5x/api/express/#express)).
- `app.route()` chains methods sharing a path instead of repeating it
  ([Express Routing Guide](https://expressjs.com/en/5x/guide/routing/)).

**Layers.** For medium-sized services and above, keep Express confined to a thin entry layer:
routes adapt HTTP payloads and responses, domain logic lives in services free of `req`/`res`,
and data access sits behind its own functions - the entry-points / domain / data-access split
described in
[Node.js Best Practices - Layer your app](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/projectstructre/createlayers.md).

Group by business domain rather than by technical role - a `books/` module owning its routes and
service beats a flat `controllers/` pile
([Structure your solution by components](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/projectstructre/breakintcomponents.md)).

**App vs server.** When tests or multiple listeners appear, separate the Express application
definition from network setup - export the configured `app` from one module and create the
`https`/`http` server in another, the split the official
[express-generator](https://github.com/expressjs/generator) skeleton ships as `app.js` plus
`bin/www`, so tests can exercise the app in-process without binding a port
([supertest](https://github.com/ladjs/supertest)).

### Version Control Exclusions

`node_modules/`, generated certificate material, and `.env` files are gitignored - the
`.env.example` template is committed.

## Naming Conventions

- Functions and variables: `camelCase`.
- Environment variables: `SCREAMING_SNAKE_CASE` - the matching configuration constant carries
  the same name (`const JWT = process.env.JWT`).
- File paths derived from environment variables: `camelCase` with a `File` or `Directory`
  suffix.
- File names: kebab-case.
- Full words over abbreviations - `certificate`, not `cert`, `keyPair`, not `keys`.
- Boolean environment values treat empty string, `0`, `false`, `no`, and `off` as false.

## Code Conventions

### Configuration

Resolve every configuration value once at startup through `process.env` after loading dotenv.

Environment variables are the single configuration surface - each one is documented in the
README and templated in `.env.example`.

Documented development defaults are acceptable for an educational service - the same values
appear in `.env.example` and the README.

Fail fast on missing or invalid configuration - the server exits with a clear message before
accepting traffic.

The `CERTIFICATE` path may carry a combined PEM holding both certificate and key, so an empty
`KEY` means "key inside the certificate file" rather than "unset".

Both entry files resolve verbosity the same way: `--verbose` flag or a truthy `VERBOSE` value,
and `dotenv` stays quiet unless verbose is on.

### Routes and Handlers

Keep route handlers small and validate input at the top of the handler.

A handler adapts HTTP to the application - payload validation, the service call,
and the response - while business logic lives behind the route layer as the service grows.

Return early on validation failure instead of nesting the success path.

Keep error responses consistent - one envelope shape per endpoint family, preserved across
edits: OAuth-style JSON `{"error": "invalid_grant"}` on the token endpoint, plain-text messages
on the book routes, and `sendStatus` empties for status-only answers.

In-memory storage is deliberate for this example - data resets on restart and no persistence
layer is introduced without a user decision.

### Authentication

Token issuing and verification share one configured secret - a token signed with a different key
must be rejected.

A credential endpoint validates the grant type, client identifier, and client secret together -
a wrong credential returns a generic rejection, not a hint about which field failed.

Protected routes distinguish a missing credential (`401`) from a failed verification (`403`).

Verification middleware is applied at the router mount point so it covers the whole domain:
`app.use('/api', authenticateJWT, router)`.

### Logging

Request logging lives in dedicated middleware, not scattered through handlers.

Each request logs a `HH:MM:SS.mmm` timestamp, the method, the path, and the body truncated to
100 characters.

Request-body logging, including credentials, is an intentional educational choice documented in
the README - do not extend it to token values or new secret material.

### Forbidden Patterns

- Hardcoded credentials, keys, or certificate material beyond the documented development
  defaults.
- Trusting client-supplied identity claims without server-side verification.
- Reading an environment variable not documented in the README.
- Adding a runtime dependency used only by development tooling - it belongs in
  `devDependencies`.
- Mixing ESM `import` syntax into the CommonJS files.

## Formatting and Linting

No linter or formatter is configured - this is a gap to address, not a pass.

Until one is adopted, match the surrounding code style: two-space indentation, single quotes,
semicolons, and `const` arrow functions for helpers.

Run `git diff --check` on every change to catch whitespace errors.

## Testing

No test suite is configured - the `test` script is a stub.

This is a gap to address, not a pass.

Verification is a live smoke test: start the server, obtain a token, and exercise the routes
with and without credentials.

When a test suite is added, use the built-in `node:test` runner and `node --test`, keeping the
zero-dependency spirit of the project.

## Build

- Development start uses `node --watch` for reload on file changes.
- Production start runs the entry point with plain `node`.
- A container image copies only the files required at runtime, installs with
  `npm ci --omit=dev`, and runs the entry point directly - development utilities and their
  dependencies stay out of the image.

## Dependencies

npm is the package manager - add with `npm add <pkg>` or `npm add -D <pkg>` for development
dependencies, remove with `npm remove <pkg>`.

Common dependencies:

| Package            | Purpose                             | Scope       |
|--------------------|-------------------------------------|-------------|
| `express`          | HTTP framework                      | runtime     |
| `jsonwebtoken`     | JWT signing and verification        | runtime     |
| `dotenv`           | Environment file loading            | runtime     |
| `@peculiar/x509`   | Self-signed certificate generation  | development |
| `reflect-metadata` | Required by the certificate utility | development |

Prefer versions published at least 7 days ago - avoid floating ranges that auto-resolve to
brand-new releases.

## Comments

Comments explain reasons, not actions.

Do not restate the code.

A comment that documents a non-obvious contract or a forbidden pattern earns its place.

## Verification

| Check                  | Command Or Method                                                        | Applies To          |
|------------------------|--------------------------------------------------------------------------|---------------------|
| Syntax check passes    | `node --check <file>`                                                    | Changed JS files    |
| Server starts          | Run the entry point on a free port                                       | Entry-point changes |
| Auth flow works        | Token issue plus an authenticated request returns 200                    | Auth changes        |
| Rejection paths work   | Missing header returns 401, bad token returns 403, bad grant returns 400 | Auth changes        |
| Certificate paths work | Split and combined PEM startup verified when TLS setup changes           | TLS changes         |
| Dependency audit       | `npm audit --omit=dev`                                                   | Dependency changes  |
| No hardcoded secrets   | Grep for `password`, `secret`, `key` literals in source                  | All JS files        |
| Docs stay consistent   | README, `.env.example`, and `CHANGELOG.md` updated together              | Config changes      |
| Diff hygiene           | `git diff --check`                                                       | Every change        |

## Definition of Done

### Correctness

- `node --check` produces no errors on changed files.
- The server starts and the token flow works on the smoke test.
- Rejection paths return the documented status codes.

### Structure

- Route handlers stay small and validate input first.
- Configuration resolves at startup, not deep in handlers.
- The single-file layout holds, or growth follows the Scaling Structure path.

### Interface

- Every route validates its inputs.
- Error responses keep the established envelope convention.
- The published OpenAPI contract stays in sync with the implemented routes.

### Quality

- No debugging output or commented-out code remains.
- Comments explain reasons, not actions.

### Hygiene

- `node_modules/`, generated certificate material, and `.env` stay gitignored.
- No secret, token, or credential was committed beyond the documented development defaults.
- The README, `.env.example`, and `CHANGELOG.md` were updated when the change altered
  configuration or behavior.

## General Principles

**Minimal Example.** The service demonstrates REST, HTTPS, and JWT for client verification -
every addition must earn its place.

**Fail Fast.** Validate configuration and inputs at the boundary, because a failure detected
late is harder to trace.

**Single Configuration Surface.** Environment variables in `SCREAMING_SNAKE_CASE` are the only
configuration channel, documented in the README and templated in `.env.example`.

**Runtime vs Development.** The production image carries only runtime dependencies -
certificate generation and reload tooling stay in `devDependencies`.

**Zero-Dependency Spirit.** Built-ins win over libraries - `node --watch` for reload,
`node:test` for a future suite, `webcrypto` for key material.

## Sources

The following authoritative references support the rules in this document.

- [Express Routing Guide](https://expressjs.com/en/5x/guide/routing/) - `express.Router` as the
  modular unit, `app.route()` chaining, and prefix mounting.
- [Express Router API](https://expressjs.com/en/5x/api/router/) - router behavior,
  `mergeParams`, and router-level middleware.
- [Express FAQ](https://expressjs.com/en/5x/starter/faq/) - the framework's documented position
  that it imposes no file structure.
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
  and [Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html) -
  the operational and security baselines.
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) - component-based
  structure and the entry-points/domain/data-access layering for growing services.
- [express-generator](https://github.com/expressjs/generator) - the official application
  skeleton, the canonical `app.js`/`bin/www` split.
- [supertest](https://github.com/ladjs/supertest) - in-process HTTP assertions against an
  exported app.
- [Node.js Documentation](https://nodejs.org/docs/latest/api/) - the `https`, `fs`,
  `node:test`, and `node --watch` APIs referenced by this standard.
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - JWT signing and verification.
- [dotenv](https://github.com/motdotla/dotenv) - environment file loading.
- [@peculiar/x509](https://github.com/PeculiarVentures/x509) - self-signed certificate
  generation for development utilities.
