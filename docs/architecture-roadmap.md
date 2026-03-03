# Architecture Improvement Roadmap

## Purpose
This roadmap defines the architecture priorities that matter most for business resilience, delivery speed, scalability, and maintainability. It is designed for leadership decision-making and avoids implementation-level detail.

## Executive Summary
The highest-value opportunities are concentrated in security posture, session consistency, environment portability, and server-rendering reliability. Addressing these areas first reduces business risk, production incidents, and delivery friction. Performance optimization remains important, but major optimization work should be evidence-led so effort is spent where user and business impact is clear.

## Prioritization Framework
- **Value**: Impact on business risk, customer trust, delivery speed, scalability, and long-term maintainability.
- **Effort**: Relative cross-team coordination, change surface area, and rollout complexity.

### Priority Quadrants
1. **High Value / Low Effort**: quick wins; execute first.
2. **High Value / High Effort**: strategic investments; plan and sequence.
3. **Low Value / Low Effort**: optional improvements; complete when capacity exists.
4. **Low Value / High Effort**: defer or avoid unless business context changes.

## High Value / Low Effort (Quick Wins)

| Issue | Why This Is Raised (Context, Risk, Impact) | Strategic Action (High Level) | Involved Areas (Files / Functions) |
|---|---|---|---|
| Sensitive user data exposure in API contracts | Exposing confidential fields in external contracts creates immediate security and compliance risk, with potential trust and legal impact. | Remove sensitive fields from externally exposed models and enforce secure-by-default data exposure rules. | `back-end/src/user/user.schema.ts` (`User` schema fields); generated contract in `back-end/schema.gql` |
| Inconsistent authentication failure behavior | Different failure paths create security leakage risk, inconsistent user experience, and harder incident diagnosis. | Standardize authentication error behavior so external responses are uniform while internal diagnostics remain available. | `back-end/src/user/user.service.ts`; `back-end/src/auth/auth.service.ts` (credential validation and error paths) |
| Production session cookie hardening gaps | Weak session settings increase account compromise and session hijacking risk, especially in production environments. | Enforce environment-appropriate session security policy with explicit lifecycle and governance standards. | `back-end/src/auth/auth.resolver.ts` (login/logout cookie setting behavior) |
| Public endpoint disruption from invalid tokens | Treating invalid credentials as global request failures can reduce availability and create avoidable user-facing errors. | Separate anonymous/public access handling from protected access enforcement through consistent access-control policy boundaries. | `back-end/src/app.module.ts` (GraphQL context/auth token handling); auth guards where protected access is enforced |
| Environment portability issues from hardcoded service endpoints | Hardcoded environment assumptions slow deployments, increase release risk, and create avoidable operational incidents. | Centralize endpoint configuration with environment-specific governance and validation. | `front-end/src/graphql/apollo.ts`; `front-end/src/services/axios.ts` |
| Search and filter interaction inefficiency | Redundant request patterns can degrade responsiveness and increase infrastructure load during normal usage. | Simplify interaction patterns to reduce redundant calls and stabilize user-facing responsiveness. | `front-end/src/components/Form/ActivityForm.tsx` (city search flow); `front-end/src/pages/explorer/[city].tsx` (filter routing behavior) |
| Production developer tooling exposure | Unrestricted tooling in production increases security surface and governance risk without customer value. | Restrict non-essential runtime tooling in production by policy. | `back-end/src/app.module.ts` (GraphQL tooling/environment flags) |

Outcome intent for this quadrant:
- Reduce immediate security and reliability risk with fast, low-disruption changes.
- Improve deployment confidence before larger architecture investments.

## High Value / High Effort (Strategic Investments)

| Issue | Why This Is Raised (Context, Risk, Impact) | Strategic Action (High Level) | Involved Areas (Files / Functions) |
|---|---|---|---|
| Fragmented session model across frontend and backend | Multiple session mechanisms create inconsistent behavior, onboarding complexity, harder debugging, and slower feature delivery. | Define and adopt one clear session model and migrate all user authentication flows to that standard. | `front-end/src/contexts/authContext.tsx`; `back-end/src/auth/*` services/resolvers managing session/token lifecycle |
| SSR data client lifecycle inconsistency | Shared request state patterns can cause correctness issues under load and reduce trust in server-rendered output. | Establish request-scoped server rendering data lifecycle standards and align all SSR paths to them. | `front-end/src/graphql/apollo.ts`; SSR entry points in `front-end/src/pages/index.tsx`, `my-activities.tsx`, `explorer/[city].tsx` |
| Missing regression guardrails for security and auth | High-risk areas without strong automated guardrails increase chance of repeated incidents and slow safe iteration. | Introduce mandatory test and release gates for identity, session, and access-control behaviors. | Backend auth/security test suites under `back-end` (auth resolver/service behaviors and schema exposure checks) |
| Limited observability for auth and session health | Without focused telemetry, regressions are detected late, increasing incident duration and business impact. | Define observability standards for authentication and session flows with clear operational ownership. | Auth request lifecycle across `back-end/src/auth/*` and GraphQL request context in `back-end/src/app.module.ts` |
| Potential backend query scaling bottlenecks | Inefficient data access patterns can become cost and latency bottlenecks as usage grows. | Prioritize query efficiency standards and apply targeted architecture improvements to high-traffic access paths. | GraphQL resolver/service paths serving activity/user relations in `back-end/src/*` domain modules |

Outcome intent for this quadrant:
- Create durable architecture foundations that support scale and faster future delivery.
- Reduce recurring operational and engineering complexity across teams.

## Low Value / Low Effort (Optional Improvements)

| Issue | Why This Is Raised (Context, Risk, Impact) | Strategic Action (High Level) | Involved Areas (Files / Functions) |
|---|---|---|---|
| Conditional rendering readability inconsistencies | Primarily a readability and consistency concern with limited direct business impact in current state. | Apply a consistent UI rendering style guide during routine refactoring cycles. | `front-end/src/pages/index.tsx`; `front-end/src/pages/explorer/[city].tsx` |
| Minor client-side navigation behavior cleanup | Improves interaction polish and analytics clarity, but does not materially change core business outcomes. | Standardize navigation update behavior in UX guidelines and apply opportunistically. | `front-end/src/pages/explorer/[city].tsx` |

Outcome intent for this quadrant:
- Improve consistency and UX polish when capacity is available, without disrupting primary roadmap goals.

## Low Value / High Effort (Defer or Avoid)

| Issue | Why This Is Raised (Context, Risk, Impact) | Strategic Action (High Level) | Involved Areas (Files / Functions) |
|---|---|---|---|
| Broad import-structure refactor across the full codebase | Large migration surface with uncertain measurable outcome if applied indiscriminately. | Limit changes to high-impact surfaces only when measurement shows clear benefit. | Cross-cutting frontend module boundaries, especially `front-end/src/components/index.ts` and page-level imports |
| Large-scale dynamic loading and memoization program without evidence | Can consume significant engineering capacity while adding complexity with uncertain user value. | Require evidence-based thresholds before approving broad optimization initiatives. | Heavy UI paths in `front-end/src/pages/*` and shared list components in `front-end/src/components/*` |

Outcome intent for this quadrant:
- Protect roadmap capacity and avoid high-cost efforts with weak or uncertain returns.

## Sequenced Action Plan

### Phase 1: Risk Reduction (Immediate)
- Execute all **High Value / Low Effort** actions.
- Confirm security posture, access consistency, and environment portability are improved before broader transformation.

### Phase 2: Architecture Alignment (Near Term)
- Execute **High Value / High Effort** actions in this order:
  1. Session model unification
  2. SSR lifecycle standardization
  3. Regression guardrails and observability
  4. Backend query scalability improvements

### Phase 3: Optimization Discipline (Ongoing)
- Complete **Low Value / Low Effort** items only when capacity allows.
- Keep **Low Value / High Effort** items deferred unless business priorities or measured evidence materially change.

### Phase 4: Continuous Governance (Ongoing)
- Review priority placement quarterly using current business goals, risk posture, and production evidence.
- Reconfirm ownership for cross-cutting initiatives spanning frontend, backend, and platform operations.

## Governance and Decision Gates
- No major optimization initiative should proceed without measurable baseline and target outcomes.
- Security and identity-related controls should be treated as non-negotiable release criteria.
- Architectural standards should be documented and reviewed at roadmap checkpoints to prevent drift.

## Decision Cadence
- Monthly: Quick-win execution health, risk burn-down, and blockers.
- Quarterly: Rebalance the value/effort matrix and investment sequence.
- Release checkpoints: Validate security, session, and environment standards before production promotion.

## Recommended Leadership Focus
1. Approve immediate execution of all quick wins.
2. Sponsor the session-model unification decision as a cross-team priority.
3. Enforce evidence-based approval for high-effort optimization work.

## Monorepo Transformation + Next.js Modernization (App Router)

### Objective
Transform the current dual-repository layout (`front-end/`, `back-end/`) into a single monorepo operating model, while modernizing the frontend from Next.js Pages Router to App Router and upgrading to the latest stable Next.js baseline (reference target: `16.1.6` as of March 2, 2026).

### Target-State Architecture (Monorepo)

Proposed structure:

```text
/
  apps/
    web/                  # Next.js App Router app (current front-end)
    api/                  # NestJS API (current back-end)
  packages/
    graphql/              # Shared schema, generated types, operations
    types/                # Shared domain DTO/TS types (non-runtime or runtime-safe)
    eslint-config/        # Shared lint standards
    tsconfig/             # Shared TS base configs
    ui/                   # Optional shared UI primitives (future, only if justified)
  tooling/
    scripts/              # Repo automation (bootstrap, checks, codegen orchestration)
  docker/
    docker-compose.yml    # Local infra (MongoDB and optional supporting services)
  .tool-versions
  turbo.json
  pnpm-workspace.yaml
  package.json            # Root workspace scripts
```

Architecture principles:
- Keep runtime boundaries explicit: `apps/web` consumes `apps/api` only through API contracts, not direct code imports.
- Extract only stable shared assets first (GraphQL artifacts, configs, types), then evaluate additional sharing.
- Preserve independent deployability of `web` and `api` inside the monorepo.

### Tooling Decision and Rationale

| Option | Strengths | Constraints | Recommendation |
|---|---|---|---|
| npm workspaces | Native, low adoption overhead, minimal tooling change | Weaker workspace ergonomics and caching model for larger multi-app pipelines | Not preferred for this roadmap |
| pnpm + Turborepo | Fast installs, strict dependency graph, strong task caching, scalable CI orchestration | Requires initial setup and team enablement | **Recommended** |

Decision:
- Use `pnpm` workspaces for dependency management and workspace linking.
- Use `Turborepo` for task graph orchestration (`build`, `test`, `lint`, `check`, codegen) with local/remote caching.

### Explicit App Router Migration Mapping

| Current Pattern | Target Pattern | Notes |
|---|---|---|
| `src/pages/_app.tsx` + `src/pages/_document.tsx` | `app/layout.tsx` (+ route segment layouts as needed) | Consolidate providers and global HTML structure into App Router layout model |
| `next/head` in page components | `metadata` / `generateMetadata` | Move per-route SEO and title concerns to App Router metadata APIs |
| `getServerSideProps` | Server Components, Route Handlers, and `fetch` cache controls (`force-cache`, `no-store`, `revalidate`) | Replace page-level data hooks with route-level server rendering and explicit caching policy |
| `next/router` | `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`) | Update client navigation APIs and patterns progressively by route segment |

### Compatibility and Risk Checklist

| Area | Key Risk | Mitigation Action |
|---|---|---|
| Next.js + React | Version jump introduces breaking changes in runtime and build behavior | Upgrade in controlled steps with a compatibility branch and route-by-route validation |
| Mantine 6 integration | Provider/layout integration differences under App Router and SSR/hydration edge cases | Validate official compatibility path; test provider placement in `app/layout.tsx` and critical pages first |
| Apollo Client SSR usage | Current global client + Pages SSR patterns may conflict with App Router server/client boundaries | Introduce request-scoped patterns where needed and define clear server/client data ownership per route |
| ESLint stack (`next lint` and custom rules) | Rule behavior changes across Next major versions | Move to shared workspace config and run baseline fix pass before enforcing new gates |
| TypeScript configs | Divergent per-app settings create drift during migration | Create shared base configs in `packages/tsconfig` with minimal app overrides |
| GraphQL codegen coupling | Current `cp ../back-end/schema.gql` path is brittle after repo reshaping | Move schema and generated artifacts to `packages/graphql` with workspace-native generation pipeline |

### Incremental Delivery Plan

#### Phase 0: Foundation and Guardrails
- Phase objective: Establish safe migration controls and baseline metrics before structural change.
- Key tasks:
  - Define architecture guardrails (import boundaries, ownership, deployment independence).
  - Capture baseline CI duration, local setup time, and current production error rates for web/api.
  - Create migration branch strategy and rollback playbook.
- Risks:
  - Incomplete baseline leads to low-confidence decisions later.
- Rollback strategy:
  - No production-facing change in this phase; rollback is process-only (revert governance artifacts).
- Measurable exit criteria:
  - Baseline metrics approved.
  - Migration governance checklist adopted.

#### Phase 1: Workspace and Repository Migration
- Phase objective: Move to monorepo without changing runtime behavior.
- Key tasks:
  - Introduce `apps/web`, `apps/api`, root workspace manifests, and root scripts.
  - Preserve existing app commands via compatibility aliases.
  - Introduce Turborepo task graph and cache configuration.
- Risks:
  - Build/pipeline disruption due to path and script changes.
- Rollback strategy:
  - Maintain branch cutpoint and compatibility scripts enabling temporary execution from legacy paths.
- Measurable exit criteria:
  - `dev`, `build`, `test`, `lint`, `check` run from repo root.
  - CI green with no functional regression.

#### Phase 2: Shared Package Extraction
- Phase objective: Remove fragile cross-app coupling and centralize reusable assets.
- Key tasks:
  - Create `packages/graphql`, `packages/types`, `packages/eslint-config`, `packages/tsconfig`.
  - Replace relative file-copy codegen flow with workspace package dependencies.
  - Standardize environment contract and validation strategy.
- Risks:
  - Incorrect package boundaries can increase coupling instead of reducing it.
- Rollback strategy:
  - Feature flag package consumers back to app-local artifacts while keeping package scaffolding intact.
- Measurable exit criteria:
  - No `../` cross-app artifact copy dependencies remain.
  - Shared config adoption across both apps is complete.

#### Phase 3: CI/CD and Caching Modernization
- Phase objective: Improve delivery speed and consistency under monorepo operations.
- Key tasks:
  - Split and optimize pipeline stages by affected scope.
  - Enable deterministic cache keys and optional remote cache.
  - Add monorepo-aware quality gates (contract checks, schema consistency checks).
- Risks:
  - Cache misconfiguration can hide failures or cause non-deterministic builds.
- Rollback strategy:
  - Fall back to non-cached full-run pipeline profiles until cache integrity is validated.
- Measurable exit criteria:
  - CI duration reduction target met.
  - Reproducible pipeline runs across clean and cached executions.

#### Phase 4: Next.js Upgrade to Latest Stable
- Phase objective: Upgrade framework safely before router paradigm migration.
- Key tasks:
  - Upgrade Next.js/React/toolchain to approved target versions.
  - Resolve lint/type/runtime incompatibilities and deprecations.
  - Validate critical user journeys and SSR behavior.
- Risks:
  - Breaking framework changes affecting hydration, routing, or build tooling.
- Rollback strategy:
  - Maintain versioned lockfile snapshot and rollback branch for immediate restore.
- Measurable exit criteria:
  - Test and smoke suite stability.
  - No critical regression in production monitoring after rollout.

#### Phase 5: Pages Router to App Router Migration
- Phase objective: Migrate routing and rendering model incrementally with low downtime.
- Key tasks:
  - Introduce `app/` routes incrementally while decommissioning corresponding `pages/` routes.
  - Migrate metadata and navigation APIs.
  - Replace `getServerSideProps` with server component and route handler patterns using explicit caching policies.
- Risks:
  - SSR data behavior mismatch and SEO regressions during mixed-mode transition.
- Rollback strategy:
  - Route-level rollback by keeping legacy `pages/` equivalents until segment stabilization is complete.
- Measurable exit criteria:
  - All targeted routes served from App Router.
  - SEO metadata parity validated.
  - Performance and error budgets remain within thresholds.

### Low-Business-Impact DX Improvements (Quick Wins)

| Improvement | Why It Helps DX | Effort | Dependency / Order | Risk | Success Indicator |
|---|---|---|---|---|---|
| Unified `.tool-versions` (Node, pnpm, tooling) | Eliminates environment drift across team machines and CI | S | First | Low | Reduced setup/version mismatch incidents |
| Root workspace scripts (`dev`, `build`, `test`, `lint`, `check`) | Gives one predictable entrypoint for daily workflows | S | After workspace init | Low | Faster onboarding and fewer command errors |
| Dockerized local MongoDB (`docker-compose`) | Standardizes local data-store setup and removes manual DB bootstrapping | S | Early, parallel to Phase 1 | Low | Lower local setup time and fewer DB boot failures |
| Single `.env.example` strategy + env validation | Makes required config explicit and fail-fast | S | Early | Low | Fewer runtime config errors |
| Shared lint/format/typecheck configs | Removes duplicated config and inconsistent quality gates | M | After `packages/*` creation | Low | Stable lint/type results across apps |
| Pre-commit hooks + commit message linting | Prevents low-quality commits from entering CI | S | After shared configs | Low | Reduced avoidable CI failures |
| Turborepo local/remote caching policy | Speeds repeat builds/tests and improves dev feedback loops | M | After pipeline split | Medium | CI/runtime duration reduction trend |
| Standard bootstrap command + onboarding checklist | Makes setup deterministic for new contributors | S | Finalize after first migration pass | Low | Time-to-first-successful-run improvement |

### Decision Gates

Gate 1 (Before Phase 1):
- Baseline metrics captured and accepted.
- Ownership defined for web, api, and shared packages.

Gate 2 (Before Phase 2):
- Root workspace commands stable in CI and local.
- No unresolved critical regressions from repository migration.

Gate 3 (Before Phase 3):
- Shared package boundaries approved (what is shared vs app-owned).
- GraphQL artifact ownership and generation flow approved.

Gate 4 (Before Phase 4):
- CI cache strategy proven deterministic on repeated runs.
- Rollback protocol validated in a dry run.

Gate 5 (Before Phase 5):
- Next.js upgrade complete with zero open P0/P1 issues.
- App Router migration playbook approved (route sequencing, metadata parity, rollback per route).

Gate 6 (Completion Gate):
- All targeted routes migrated to App Router.
- DX quick wins delivered or formally scheduled with owners and dates.
- Operational metrics meet or exceed pre-migration baseline.
