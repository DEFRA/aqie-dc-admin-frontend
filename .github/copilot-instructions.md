# AQIE DC Copilot Instructions (Architecture-First)

These instructions define how to extend this platform safely and consistently.
Follow them for all feature work, refactors, bug fixes, and tests.

## 1) System Context

This repository is the frontend service of a two-service architecture:

- Frontend service: Hapi + Nunjucks + GOV.UK styles, served on port 3000
- Backend service: Hapi + MongoDB + SQS/LocalStack integration, served on port 3001

Frontend must remain a thin orchestration layer:

- Handle routing, page composition, user/session concerns, and rendering
- Call backend APIs for domain data and persistence
- Avoid embedding domain business logic that belongs in backend

## 2) Current Frontend Architecture

Key structure:

- src/index.js: process startup and unhandled rejection handling
- src/server/server.js: Hapi server creation and plugin registration
- src/server/router.js: top-level route/module composition
- src/server/<feature>/: feature modules with route, controller, view, content, tests
- src/server/common/: reusable helpers (api, logging, error handling, caching)
- src/config/: typed runtime config (convict), auth config, nunjucks setup
- src/client/: browser scripts and styles

Feature module conventions:

- index.js exports Hapi plugin for feature routes
- controller.js handles request/response and maps view model
- content.js provides user-facing static text
- \*.njk contains view templates
- dedicated \*.test.js files for controller/data logic

## 3) Required Design Principles

1. Preserve layering:

- Route module -> controller -> helper/data access -> backend API
- Keep API calling logic centralized in common API helper patterns

2. Keep controllers thin:

- Validate/shape request input
- Call data helper/backend client
- Map response to view model
- Handle recoverable errors with user-safe pages

3. Keep rendering deterministic:

- Templates should receive explicit view models
- Avoid hidden globals or side-effect-heavy template logic

4. Prefer composition over duplication:

- Reuse common helpers for API, logging, status codes, errors, and session behavior

## 4) Configuration and Environment Rules

- All config must be defined in convict schema under src/config/config.js
- New env vars must include: doc, format, default, and env binding
- Use sane local defaults for developer experience
- Keep production-sensitive defaults secure (for example cookies, cache engine)

## 5) Security and Session Rules

- Keep existing secure context, content security policy, and cookie strategy intact
- Never log secrets, tokens, cookie values, or full authorization headers
- If adding auth-related routes, preserve session validation and redirect patterns

## 6) Frontend-Backend Contract Rules

- Backend base URL is configured, not hardcoded
- API paths must be explicit and version-safe
- On backend non-2xx responses:
  - Log concise diagnostic details
  - Surface user-safe error messaging
  - Avoid exposing backend internals in UI

When adding a new page requiring data:

1. Add/extend backend endpoint first (or confirm exists)
2. Add frontend data helper call
3. Add controller mapping logic
4. Add Nunjucks template and content text
5. Add tests for success + failure scenarios

## 7) Testing Expectations

- Use Vitest for all new behavior
- Minimum for each feature addition:
  - Controller success path test
  - Controller failure path test
  - Data helper/API call test with mocks
- Do not reduce coverage scope in vitest config
- Keep tests deterministic and timezone-safe where relevant

## 8) Observability and Error Handling

- Use project logging helpers (do not add ad-hoc logging frameworks)
- Log actionable context only (route, operation, status)
- Use consistent status code constants where already adopted
- For user-facing failures, render the standard error template

## 9) Styling and Frontend UX Constraints

- Keep GOV.UK design language consistency
- Reuse existing SCSS structure and tokens under src/client/stylesheets
- Avoid introducing heavyweight frontend frameworks
- Keep JS progressive and minimal unless a feature explicitly requires richer behavior

## 10) Change Safety Checklist (Must Pass Before Completion)

For each feature/bug-fix, ensure all are true:

- Architecture layering preserved
- Config changes added to convict schema
- Tests added/updated and passing
- No secrets exposed in logs
- Backend contract assumptions documented in code comments where non-obvious
- Build and lint compatibility retained

## 11) If Ambiguous, Prefer This Default

- Place business/domain rules in backend
- Keep frontend as view orchestration layer
- Prefer small, testable helper functions over monolithic controllers
- Keep public route behavior backward compatible unless requirements state otherwise
