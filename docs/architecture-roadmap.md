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
