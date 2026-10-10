# JavaScript Engineering Standards

<!-- Version: 0.1.1 | Date: 2026-10-09 | Runtime: Node.js 22.12.0 -->

## Purpose

This document defines the engineering standard for JavaScript projects running on Node.js.

It covers the runtime version, project layout, coding conventions, tooling, testing, and build.

It is written to be executed directly by an AI coding agent and to be read without effort by a human
reviewer.

## Scope

A project is in scope when all of the following conditions hold.

- The project runs on Node.js and uses npm as package manager.
- The source code is written in JavaScript (ESM or CommonJS).
- The build entry point is `npm run build` or a script defined in `package.json`.

A project that uses TypeScript is out of scope in this document - use the TypeScript engineering
standard instead, which builds on this one.

A project that runs only in the browser (no Node.js) is out of scope.

## How To Use This Standard

This section is the entry point for an agent.

Read it before reading anything else in this document.

### Order Of Operations

Follow these steps in order at the start of every task that touches JavaScript code.

1. Read the project rules file, such as `AGENTS.md`, `README.md`, or `docs/GUIDELINES.md`,
   because a project rule overrides this standard.
2. Determine the Node.js version, module system,
   and test framework using the Agent Intake Protocol below.
3. Confirm the conclusion with the user when the repository is ambiguous or empty.
4. Apply the sections of this standard that match the confirmed project kind.
5. Run every applicable row of the Verification section.
6. Check the result against the Definition of Done before reporting the task complete.

### Precedence

When two rules conflict, apply the first matching source in this list.

| Rank | Source                                    | Example                                      |
|------|-------------------------------------------|----------------------------------------------|
| 1    | An explicit instruction from the user     | "Keep this project on Node.js 20"            |
| 2    | The project rules file                    | `AGENTS.md`, `docs/GUIDELINES.md`            |
| 3    | The existing convention in the repository | ESM already used everywhere                  |
| 4    | This standard                             | ESM default, Node.js 22 LTS                  |
| 5    | General JavaScript best practice          | Anything the four sources above do not cover |

Never silently reformat existing code to match this standard.

A whole-repository reformat destroys review history and hides the real change inside noise.

Bring a deviation to the user as a proposal, not as an unrequested edit.

### Non-Negotiable Rules

- **Node.js version is pinned.** The `package.json` `engines` field and `.nvmrc` declare the exact
  LTS version. A project without a pinned runtime is a defect.
- **Module system is explicit.** `package.json` declares `"type": "module"` (ESM)
  or omits it (CommonJS). Mixed module systems in one package are a defect.
- **No floating dependency versions.** `package.json` dependencies use exact versions or caret
  ranges pinned to a minimum age of 7 days. A `latest`, `*`, or unbounded `>=` range is a defect.
- **`package-lock.json` is committed.** A build that cannot reproduce is a defect.
- **`npm audit --omit=dev` passes in CI.** A vulnerability in production dependencies is a defect.
- **No hardcoded secrets.** A secret in a committed file is a security incident.
- **Linting and formatting are enforced in CI.** `eslint .` and `prettier --check .` produce no
  errors.
- **Tests pass with >= 80% coverage.** A failing test or coverage below threshold is a defect.

A violation of any of these rules is a defect, not a style preference.

## Agent Intake Protocol

### Detection First

Before asking the user anything, inspect the repository and infer the project shape.

| Signal Found In The Repository         | Inferred Decision                    | Confidence |
|----------------------------------------|--------------------------------------|------------|
| `package.json` with `"type": "module"` | ESM module system                    | High       |
| `package.json` without `"type"`        | CommonJS module system               | High       |
| `.nvmrc` at root                       | Node.js version pinned               | High       |
| `engines.node` in `package.json`       | Node.js version constrained          | High       |
| `eslint.config.js` or `.eslintrc`      | ESLint configured                    | High       |
| `.prettierrc` or `prettier.config.js`  | Prettier configured                  | High       |
| `vitest.config.ts` or `jest.config.js` | Vitest or Jest test framework        | High       |
| `tsconfig.json` present                | TypeScript project (use TS standard) | High       |
| No `package.json`                      | New project                          | High       |

### Existing Project

When detection is confident, state the conclusion and ask for a single confirmation rather than
running a questionnaire.

Example: "I see Node.js 22.12.0 in `.nvmrc`, ESM in `package.json`, Vitest for testing,
ESLint + Prettier configured. I will follow the existing conventions.

Is that correct?"

When detection is ambiguous, ask only the questions that resolve the ambiguity.

### New Project

When the repository is empty or the user declares a new project, ask the following questions.

| Question               | Options                      | Default If Declined  |
|------------------------|------------------------------|----------------------|
| Which Node.js version? | 22 LTS, 20 LTS               | 22 LTS               |
| Which module system?   | ESM, CommonJS                | ESM                  |
| Which test framework?  | Vitest, Node `--test`, Jest  | Vitest               |
| Which linter?          | ESLint 9 flat config, legacy | ESLint 9 flat config |

## Documentation

The following are the authoritative sources for JavaScript development.

- [Node.js Documentation](https://nodejs.org/docs/latest/api/) - runtime API reference
- [ECMAScript 2024 Specification](https://tc39.es/ecma262/) - language standard
- [npm Documentation](https://docs.npmjs.com/) - package manager reference
- [ESLint Documentation](https://eslint.org/docs/latest/) - linter reference
- [Prettier Documentation](https://prettier.io/docs/) - formatter reference
- [Vitest Documentation](https://vitest.dev/) - test framework reference
- [OpenTelemetry JavaScript](https://opentelemetry.io/docs/languages/js/) - observability SDK

## Language Version

The project targets **Node.js 22.12.0 LTS** (codename "Jod"), released October 2024,
supported until October 2027.

Node.js 20 LTS (codename "Iron") is the previous LTS, supported until October 2026.

Pin the exact version in two places:

1. `.nvmrc` at repository root: `22.12.0`
2. `package.json` engines field: `"engines": { "node": "22.12.0" }`

On Node.js upgrade, re-validate all rules against release notes before writing code.

### ECMAScript Features

Node.js 22 supports the following stable features - use them where they improve readability:

- `import`/`export` (ESM)
- Top-level `await`
- `Object.groupBy`, `Map.groupBy`
- `Promise.withResolvers`
- `ArrayBuffer.prototype.transfer`
- `RegExp` `/v` flag (set notation)
- `JSON.parse` source text access (via `import assert`)

Do not use staging proposals or features behind flags in production code.

## Project Structure

```
src/                    Source code
  index.js              Entry point (or main.js)
  lib/                  Library code (reusable modules)
  routes/               HTTP route handlers (if service)
  commands/             CLI command handlers (if CLI)
  services/             Business logic
  repositories/         Data access
  config/               Configuration loading
  utils/                Pure utility functions
test/                   Test files (mirrors src/)
scripts/                Build and utility scripts
.eslintrc.js            ESLint flat config (or eslint.config.js)
.prettierrc             Prettier config
.nvmrc                  Node.js version pin
package.json            Package manifest
package-lock.json       Lockfile (committed)
```

One `.js` file per logical unit.

Split a file when it exceeds approximately 300 lines.

Unit tests live in `test/` mirroring `src/` structure, named `*.test.js`.

No circular dependencies between modules.

## Naming Conventions

| Element               | Convention        | Example                         |
|-----------------------|-------------------|---------------------------------|
| Variables, functions  | `camelCase`       | `fetchUser`, `maxRetries`       |
| Classes               | `PascalCase`      | `UserService`, `CacheManager`   |
| Constants             | `SCREAMING_SNAKE` | `DEFAULT_TIMEOUT`, `MAX_BATCH`  |
| Private properties    | `_camelCase`      | `_cache`, `_config`             |
| Environment variables | `SCREAMING_SNAKE` | `DATABASE_URL`, `LOG_LEVEL`     |
| Files, directories    | `kebab-case`      | `user-service.js`, `api-routes` |
| Test files            | `*.test.js`       | `user-service.test.js`          |

Avoid abbreviations - `configuration` not `config`, `message` not `msg`.

## Code Conventions

### Module System

**ESM (default)**: `"type": "module"` in `package.json`.

Use `import`/`export`.

File extensions required in imports: `import { foo } from './bar.js'`.

**CommonJS (legacy only)**: No `"type"` field.

Use `require`/`module.exports`.

Only permitted when the project rules file explicitly requires it.

**Dual-package hazard**: If a package must support both,
publish separate entry points via `exports` in `package.json` and document the hazard.

### Variables and Scoping

- `const` by default, `let` only when reassignment is required.
- No `var` - it has function scope and hoisting behavior that causes bugs.
- Block scope is the default - prefer narrow scopes.

### Error Handling

- Never throw strings or primitives - always throw `Error` subclasses.
- Define domain-specific error classes extending `Error` with a `code` property for machine-readable
  handling.
- Use `Result` pattern (discriminated union) for recoverable errors at module boundaries:

```javascript
// Success case
{ ok: true, value: user }
// Error case
{ ok: false, error: new NotFoundError('user', id) }
```

- Never swallow errors - either handle, propagate, or log with context.

### Async Patterns

- `async`/`await` for all asynchronous code.
- No floating promises - every `await` or explicit `void` with comment.
- `Promise.all` for parallel independent work,
  `Promise.allSettled` when partial failure is acceptable.
- `AbortController` for cancellation - pass `signal` through all async boundaries.

### Configuration

- Load and validate configuration once at startup using Zod schema.
- Environment variables are the single configuration surface - documented in `README.md` and
  templated in `.env.example`.
- Fail fast on missing or invalid configuration - exit with clear message before accepting traffic.
- Do not read `process.env` deep in modules - pass config as parameter.

### Logging

- Use Pino for structured JSON logging.
- Log levels: `fatal`, `error`, `warn`, `info`, `debug`, `trace`.
- Correlation IDs on every request-scoped log: `reqId`, `userId`.
- No `console.log` in production code - it bypasses log levels and structured fields.
- Do not log secrets, credentials, or PII.

### Security

- No hardcoded secrets in source - use environment variables or secret manager.
- Input validation at every trust boundary using Zod schemas.
- HTTP services: helmet-equivalent headers (CSP, HSTS, X-Frame-Options), rate limiting.
- Dependencies: `npm audit --omit=dev` in CI, `package-lock.json` committed.

### Observability

- OpenTelemetry JS SDK for traces, metrics, logs.
- `/health/live` and `/health/ready` endpoints for Kubernetes probes.
- `/metrics` endpoint in Prometheus exposition format.
- Structured logging with correlation IDs as the log transport.

### Forbidden Patterns

| Pattern                         | Rule                 | Reason                        |
|---------------------------------|----------------------|-------------------------------|
| `var`                           | Disallowed           | Function scope, hoisting bugs |
| Floating promises               | Disallowed           | Unhandled rejections          |
| `console.log` in production     | Disallowed           | Bypasses structured logging   |
| `any` equivalent (no types)     | Use JSDoc `@typedef` | Type safety via documentation |
| Floating dependency versions    | Disallowed           | Non-reproducible builds       |
| `require` in ESM code           | Disallowed           | Module system mismatch        |
| `eval` / `Function` constructor | Disallowed           | Code injection risk           |

## Formatting and Linting

### ESLint 9 Flat Config

`eslint.config.js` at repository root:

```javascript
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  { ignores: ['node_modules/', 'dist/', 'coverage/'] },
  js.configs.recommended,
  {
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-floating-promises': 'error',
      'require-await': 'error',
    },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
    },
  },
]);
```

Run `eslint .` in CI - must produce no errors.

### Prettier 3

`.prettierrc` at repository root:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "lf"
}
```

Run `prettier --check .` in CI - must produce no output.

Prettier is the single source of truth for formatting - no hand-formatting decisions.

## Testing

### Framework

- **Vitest** (preferred): `vitest run`, `vitest run --coverage`
- **Node.js `--test`**: `node --test` (zero dependencies)
- **Jest**: Only when project rules file explicitly requires it

Do not mix test frameworks within a single project.

### Requirements

- Unit test coverage >= 80% (lines, functions, branches, statements).
- Every exported function has at least one test covering normal case, boundary values,
  and error paths.
- Test files named `*.test.js` in `test/` mirroring `src/`.
- Pure functions tested in isolation, integration tests use testcontainers or real services.

### Running Tests

```bash
npm test                    # vitest run
npm run test:coverage       # vitest run --coverage
npm run test:ui             # vitest --ui
```

## Build

### Development

```bash
npm run dev                 # Watch mode if applicable (e.g., tsx watch)
```

### Production

```bash
npm run build               # No compile step for pure JS; may run linter/type check
```

For pure JavaScript, "build" is verification: lint + test + type check (if JSDoc).

### Docker

Multi-stage build with non-root user and distroless base:

```dockerfile
FROM node:22.12.0-alpine AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs22-debian12
WORKDIR /app
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/src ./src
COPY --from=builder /build/package.json ./
USER nonroot
ENTRYPOINT ["node", "src/index.js"]
```

## Dependencies

| Category           | Library                      | Purpose                         |
|--------------------|------------------------------|---------------------------------|
| Runtime validation | `zod`                        | Schema validation at boundaries |
| Logging            | `pino`                       | Structured JSON logging         |
| Observability      | `@opentelemetry/sdk-node`    | Traces, metrics, logs           |
| HTTP (if service)  | `fastify`                    | HTTP framework                  |
| CLI (if CLI)       | `commander`                  | CLI framework                   |
| Testing            | `vitest`, `@vitest/coverage` | Test runner + coverage          |
| Linting            | `eslint`, `@eslint/js`       | Linter                          |
| Formatting         | `prettier`                   | Formatter                       |

Add a dependency only when the standard library is genuinely insufficient.

## Verification

| Check                    | Command Or Method                                    | Applies To       |
|--------------------------|------------------------------------------------------|------------------|
| Node.js version pinned   | `cat .nvmrc` and `package.json engines`              | Project root     |
| Module system declared   | `grep '"type"' package.json`                         | Project root     |
| No floating versions     | `grep -e '"[\^~*]' -e 'latest' package.json`         | Project root     |
| Lockfile committed       | `git ls-files package-lock.json`                     | Project root     |
| ESLint passes            | `eslint .`                                           | All JS files     |
| Prettier passes          | `prettier --check .`                                 | All files        |
| Tests pass               | `npm test`                                           | All tests        |
| Coverage >= 80%          | `npm run test:coverage`                              | All tests        |
| npm audit clean          | `npm audit --omit=dev`                               | Production deps  |
| No hardcoded secrets     | `grep -r -e 'password' -e 'secret' -e 'apikey' src/` | All source files |
| No `var`                 | `eslint . --rule 'no-var: error'`                    | All JS files     |
| No floating promises     | `eslint . --rule 'no-floating-promises'`             | All JS files     |
| OpenTelemetry configured | `grep -r '@opentelemetry' src/`                      | Source files     |

## Definition of Done

### Correctness

- `eslint .` produces no errors.
- `prettier --check .` produces no output.
- `npm test` passes with >= 80% coverage.
- `npm audit --omit=dev` reports no vulnerabilities.
- No `var`, no floating promises, no `console.log` in production code.

### Structure

- Project layout matches confirmed structure.
- `package.json` has exact Node.js version in `engines` and `.nvmrc`.
- `package-lock.json` committed.
- No circular dependencies.
- No file exceeds ~300 lines without justification.

### Quality

- JSDoc `@typedef` and `@param` on all exported functions.
- Comments explain reasons, not actions.
- No debugging output or commented-out code remains.
- Error classes have `code` property for machine handling.

### Hygiene

- `node_modules/`, `dist/`, `coverage/` are gitignored.
- `.env` files are gitignored, `.env.example` committed.
- No secret, token, or credential committed.
- Documentation updated when change alters public API, build, or project rule.

## General Principles

**Single Responsibility.** One module does one thing and its name says which thing.

**Fail Fast.** Validate configuration and inputs at the boundary - a failure detected late is harder
to trace.

**No Ambient State.** Request-scoped state travels on context objects,
module state stays encapsulated.

**Explicit Error Handling.** Every error is an `Error` subclass with a `code`, never swallowed.

**Observability by Default.** Logs, metrics, traces are not optional - they are the interface.

**Standard Library First.** Add a dependency only when the standard library is genuinely
insufficient.

**Zero Warnings.** An ESLint error or Prettier diff is either a defect or a rule the project does
not want - both require action.

**Reproducible Builds.** Exact versions, committed lockfile, pinned runtime.

## Sources

- [Node.js 22 Documentation](https://nodejs.org/docs/v22.12.0/api/) - runtime APIs
- [ECMAScript 2024](https://tc39.es/ecma262/) - language specification
- [npm CLI Documentation](https://docs.npmjs.com/cli/v10/) - package manager
- [ESLint 9 Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files) - linting
- [Prettier 3 Options](https://prettier.io/docs/en/options) - formatting
- [Vitest Guide](https://vitest.dev/guide/) - testing
- [Zod Documentation](https://zod.dev/) - runtime validation
- [Pino Documentation](https://getpino.io/) - structured logging
- [OpenTelemetry JavaScript](https://opentelemetry.io/docs/languages/js/) - observability