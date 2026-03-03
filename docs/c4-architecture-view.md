# Naboo Case Study C4 Architecture View (Current State)

This document provides C4-style views based on the implemented codebase.

## What C4 Architecture Is (and Why It Helps)

The C4 model is a lightweight way to describe software architecture using four zoom levels:
- **Level 1 - System Context:** the system, its users, and external dependencies.
- **Level 2 - Containers:** deployable/runtime units (for example web app, API, database).
- **Level 3 - Components:** major internal building blocks inside a container.
- **Level 4 - Code (optional):** low-level design details for specific classes/files.

Why this helps:
- Creates a shared architecture language for product, engineering, and new team members.
- Supports progressive detail: start high-level, zoom in only where needed.
- Improves communication during onboarding, reviews, incident analysis, and planning.

Official resources:
- C4 Model (official): https://c4model.com/
- C4 Model diagrams (official guidance): https://c4model.com/diagrams
- Simon Brown / Structurizr docs: https://docs.structurizr.com/

## 1. System Context (C4 Level 1)

```mermaid
%%{init: {'themeVariables': {'lineColor': '#F59E0B', 'arrowheadColor': '#F59E0B'}}}%%
flowchart LR
    U[End User]
    FE[Naboo Frontend<br/>Next.js + Apollo + Mantine]
    BE[Naboo Backend API<br/>NestJS + GraphQL]
    DB[(MongoDB)]
    CITY[External City API<br/>geo.api.gouv.fr]

    U -->|Uses web app| FE
    FE -->|GraphQL queries/mutations + cookies| BE
    BE -->|Mongoose read/write| DB
    FE -->|City search requests| CITY

    classDef actor fill:#FFF4CC,stroke:#8A6D1A,color:#1F2937,stroke-width:1.5px;
    classDef app fill:#E6F0FF,stroke:#1E3A8A,color:#0F172A,stroke-width:1.5px;
    classDef backend fill:#E8F7EE,stroke:#166534,color:#052E16,stroke-width:1.5px;
    classDef data fill:#FFF1E6,stroke:#9A3412,color:#431407,stroke-width:1.5px;
    classDef external fill:#F3F4F6,stroke:#374151,color:#111827,stroke-width:1.5px;
    classDef security fill:#FEE2E2,stroke:#991B1B,color:#450A0A,stroke-width:1.5px;
    class U actor;
    class FE app;
    class BE backend;
    class DB data;
    class CITY external;
    linkStyle default stroke:#F59E0B,stroke-width:1.8px;
```

## 2. Container View (C4 Level 2)

```mermaid
%%{init: {'themeVariables': {'lineColor': '#F59E0B', 'arrowheadColor': '#F59E0B'}}}%%
flowchart TB
    subgraph Browser["User Browser"]
      UI[Next.js Pages App]
      AP[Auth + Snackbar Contexts]
      AC[Apollo Client]
      UIR[Route Guards<br/>withAuth/withoutAuth]
    end

    subgraph Backend["NestJS Backend"]
      GQL[GraphQL Module + Apollo Driver]
      AM[Auth Module]
      UM[User Module]
      FM[Favorite Module]
      MM[Me Module]
      ATM[Activity Module]
      SM[Seed Module]
    end

    DB[(MongoDB)]
    EXT[geo.api.gouv.fr API]

    UI --> AP
    UI --> AC
    UI --> UIR
    AC -->|/graphql| GQL
    GQL --> AM
    GQL --> UM
    GQL --> FM
    GQL --> MM
    GQL --> ATM
    AM --> UM
    UM --> DB
    ATM --> DB
    SM --> UM
    SM --> ATM
    UI -->|axios city search| EXT

    classDef actor fill:#FFF4CC,stroke:#8A6D1A,color:#1F2937,stroke-width:1.5px;
    classDef app fill:#E6F0FF,stroke:#1E3A8A,color:#0F172A,stroke-width:1.5px;
    classDef backend fill:#E8F7EE,stroke:#166534,color:#052E16,stroke-width:1.5px;
    classDef data fill:#FFF1E6,stroke:#9A3412,color:#431407,stroke-width:1.5px;
    classDef external fill:#F3F4F6,stroke:#374151,color:#111827,stroke-width:1.5px;
    classDef security fill:#FEE2E2,stroke:#991B1B,color:#450A0A,stroke-width:1.5px;
    class UI,AP,AC,UIR app;
    class GQL,AM,UM,FM,MM,ATM,SM backend;
    class DB data;
    class EXT external;
    style Browser fill:#FCFCFD,stroke:#9CA3AF,stroke-width:1.5px,color:#111827;
    style Backend fill:#FCFCFD,stroke:#9CA3AF,stroke-width:1.5px,color:#111827;
    linkStyle default stroke:#F59E0B,stroke-width:1.8px;
```

## 3. Backend Component View (C4 Level 3)

```mermaid
%%{init: {'themeVariables': {'lineColor': '#F59E0B', 'arrowheadColor': '#F59E0B'}}}%%
flowchart TB
    subgraph GraphQL["GraphQL Boundary"]
      AR[AuthResolver]
      MR[MeResolver]
      ACR[ActivityResolver]
      AG[AuthGuard]
      CTX[GraphQL Context JWT Verification]
    end

    subgraph Services["Application Services"]
      AS[AuthService]
      US[UserService]
      FS[FavoriteService]
      ACS[ActivityService]
      SS[SeedService]
    end

    subgraph Models["Mongoose Models"]
      UMOD[User Model]
      AMOD[Activity Model]
      FMOD[Favorite Model]
    end

    JWT[JwtService]
    DB[(MongoDB)]

    AR --> AS
    MR --> AG
    ACR --> AG
    AG --> CTX
    CTX --> JWT

    AS --> US
    AS --> JWT
    ACR --> ACS
    ACR --> FS
    ACR --> US
    MR --> US
    SS --> US
    SS --> ACS

    US --> UMOD
    ACS --> AMOD
    FS --> FMOD
    UMOD --> DB
    AMOD --> DB
    FMOD --> DB

    classDef actor fill:#FFF4CC,stroke:#8A6D1A,color:#1F2937,stroke-width:1.5px;
    classDef app fill:#E6F0FF,stroke:#1E3A8A,color:#0F172A,stroke-width:1.5px;
    classDef backend fill:#E8F7EE,stroke:#166534,color:#052E16,stroke-width:1.5px;
    classDef data fill:#FFF1E6,stroke:#9A3412,color:#431407,stroke-width:1.5px;
    classDef external fill:#F3F4F6,stroke:#374151,color:#111827,stroke-width:1.5px;
    classDef security fill:#FEE2E2,stroke:#991B1B,color:#450A0A,stroke-width:1.5px;
    class AR,MR,ACR,CTX backend;
    class AS,US,FS,ACS,SS backend;
    class UMOD,AMOD,FMOD,DB data;
    class AG security;
    class JWT external;
    style GraphQL fill:#FCFCFD,stroke:#9CA3AF,stroke-width:1.5px,color:#111827;
    style Services fill:#FCFCFD,stroke:#9CA3AF,stroke-width:1.5px,color:#111827;
    style Models fill:#FCFCFD,stroke:#9CA3AF,stroke-width:1.5px,color:#111827;
    linkStyle default stroke:#F59E0B,stroke-width:1.8px;
```

### Backend Component Responsibilities

- `GraphQL Context` (`AppModule`): extracts JWT from cookie/header and verifies payload.
- `AuthResolver`: login/register/logout GraphQL entry points and cookie set/clear.
- `MeResolver`: authenticated current-user query.
- `ActivityResolver`: activity query and mutation entry points.
- `ActivityResolver`: activity + favorites query/mutation entry points, plus admin-only `createdAt` field gating.
- `AuthGuard`: blocks GraphQL resolvers when JWT payload is missing.
- `AuthService`: credential validation, token generation, token persistence.
- `UserService`: user CRUD/query and password hashing path during user creation.
- `ActivityService`: activity query/create/filter behavior.
- `FavoriteService`: favorite list management with stable ordering and reorder validation.
- `SeedService`: initial data bootstrap.

## 4. Frontend Component View (C4 Level 3)

```mermaid
%%{init: {'themeVariables': {'lineColor': '#F59E0B', 'arrowheadColor': '#F59E0B'}}}%%
flowchart TB
    subgraph AppShell["Next.js App Shell"]
      APP[_app.tsx]
      TOP[Topbar]
      ROUTES[routes.ts + getFilteredRoutes]
    end

    subgraph Providers["State and Providers"]
      AP[ApolloProvider]
      AUTHP[AuthProvider]
      SNP[SnackbarProvider]
    end

    subgraph Guards["Route Guards"]
      WA[withAuth]
      WOA[withoutAuth]
    end

    subgraph Pages["Pages"]
      subgraph PublicPages["Public Pages"]
        HOME[index.tsx]
        DISC[discover.tsx]
        EXP[explorer/index.tsx]
        CITY[explorer/:city.tsx]
        DETAIL[activities/:id.tsx]
      end
      subgraph ProtectedPages["Protected Pages"]
        MY[my-activities.tsx]
        PROF[profil.tsx]
        CREATE[activities/create.tsx]
      end
      subgraph AuthPages["Auth Pages"]
        SIGNIN[signin.tsx]
        SIGNUP[signup.tsx]
      end
    end

    subgraph Data["Data Access"]
      PAGE_DATA[Page data layer]
      GQLC[graphqlClient<br/>Apollo Client]
      OPS[GraphQL Operations<br/>queries/mutations/fragments]
      CITYS[cities service<br/>axios]
    end

    APP --> TOP --> ROUTES
    APP --> AP
    APP --> AUTHP
    APP --> SNP
    AP --> GQLC
    AUTHP --> GQLC
    GQLC --> OPS

    WA --> ProtectedPages
    WOA --> AuthPages

    HOME --> PAGE_DATA
    DISC --> PAGE_DATA
    EXP --> PAGE_DATA
    CITY --> PAGE_DATA
    DETAIL --> PAGE_DATA
    MY --> PAGE_DATA
    PROF --> PAGE_DATA
    CREATE --> PAGE_DATA
    PAGE_DATA --> GQLC
    CREATE --> CITYS

    classDef actor fill:#FFF4CC,stroke:#8A6D1A,color:#1F2937,stroke-width:1.5px;
    classDef app fill:#E6F0FF,stroke:#1E3A8A,color:#0F172A,stroke-width:1.5px;
    classDef backend fill:#E8F7EE,stroke:#166534,color:#052E16,stroke-width:1.5px;
    classDef data fill:#FFF1E6,stroke:#9A3412,color:#431407,stroke-width:1.5px;
    classDef external fill:#F3F4F6,stroke:#374151,color:#111827,stroke-width:1.5px;
    classDef security fill:#FEE2E2,stroke:#991B1B,color:#450A0A,stroke-width:1.5px;
    class APP,TOP,ROUTES app;
    class AP,AUTHP,SNP app;
    class GQLC,OPS,CITYS,PAGE_DATA backend;
    class WA,WOA security;
    class HOME,DISC,EXP,CITY,MY,PROF,SIGNIN,SIGNUP,CREATE,DETAIL external;
    style AppShell fill:#FCFCFD,stroke:#9CA3AF,stroke-width:1.5px,color:#111827;
    style Providers fill:#FCFCFD,stroke:#9CA3AF,stroke-width:1.5px,color:#111827;
    style PublicPages fill:#FFFFFF,stroke:#D1D5DB,stroke-width:1.2px,color:#111827;
    style ProtectedPages fill:#FFFFFF,stroke:#D1D5DB,stroke-width:1.2px,color:#111827;
    style AuthPages fill:#FFFFFF,stroke:#D1D5DB,stroke-width:1.2px,color:#111827;
    style Data fill:#FCFCFD,stroke:#9CA3AF,stroke-width:1.5px,color:#111827;
    style Guards fill:#FCFCFD,stroke:#9CA3AF,stroke-width:1.5px,color:#111827;
    style Pages fill:#FCFCFD,stroke:#9CA3AF,stroke-width:1.5px,color:#111827;
    linkStyle default stroke:#F59E0B,stroke-width:1.8px;
```

### Frontend Component Responsibilities

- `_app.tsx`: global provider composition and app-level layout.
- `AuthProvider`: auth state bootstrap and auth mutation workflows.
- `SnackbarProvider`: transient user notifications.
- `graphqlClient`: shared Apollo client used by SSR and client runtime.
- `withAuth` / `withoutAuth`: client-side page access gating and redirects.
- Pages: SSR queries for initial data, then component-driven rendering.

## 5. Deployment/Runtime Notes

- Frontend dev server: `http://localhost:3001`
- Backend API dev server: `http://localhost:3000`
- GraphQL endpoint: `/graphql`
- Backend REST global prefix also exists: `/api` (for non-GraphQL endpoints if added)

## 6. Architectural Constraints Observed

- Backend and frontend are separate deployable units with direct browser-to-API GraphQL traffic.
- Auth behavior relies on both HTTP-only cookie and localStorage token in current frontend implementation.
- SSR pages directly invoke shared Apollo client instance in `getServerSideProps`.
- External dependency for city suggestions is called from frontend, not proxied by backend.
