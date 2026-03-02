# Naboo Case Study Sequence Diagrams

This document captures current implemented runtime flows.

## 1. Login and Session Bootstrap

```mermaid
%%{init: {'themeVariables': {'mainBkg': '#FFFFFF', 'primaryColor': '#FFFFFF', 'secondaryColor': '#FFFFFF', 'tertiaryColor': '#FFFFFF', 'textColor': '#F8FAFC', 'lineColor': '#E5E7EB', 'actorLineColor': '#E5E7EB', 'labelBoxBkgColor': '#0F172A', 'labelBoxBorderColor': '#334155', 'actorBkg': '#E6F0FF', 'actorBorder': '#1E3A8A', 'actorTextColor': '#F8FAFC', 'participantBkg': '#FFFFFF', 'participantBorder': '#9CA3AF', 'participantTextColor': '#0F172A', 'signalColor': '#F59E0B', 'signalTextColor': '#F8FAFC', 'sequenceNumberColor': '#0F172A', 'activationBorderColor': '#F59E0B'}}}%%
sequenceDiagram
    autonumber
    actor U as User (Browser)
    participant FE as Frontend (Next.js)
    participant GQL as Backend GraphQL (NestJS)
    participant AUTH as AuthService
    participant US as UserService
    participant JWT as JwtService
    participant DB as MongoDB

    U->>FE: Submit SigninForm (email, password)
    FE->>GQL: login(signInInput)
    GQL->>AUTH: signIn(email, password)
    AUTH->>US: getByEmail(email)
    US->>DB: find user by email
    DB-->>US: User document
    US-->>AUTH: User
    AUTH->>AUTH: bcrypt.compare(password, user.password)
    AUTH->>JWT: signAsync(payload)
    JWT-->>AUTH: access_token
    AUTH->>US: updateToken(user.id, token)
    US->>DB: save user token
    AUTH-->>GQL: return access token
    GQL->>U: Set-Cookie jwt token HttpOnly
    GQL-->>FE: login response
    FE->>FE: localStorage.setItem("token", access_token)
    FE->>GQL: getMe()
    GQL->>GQL: GraphQL context verifies cookie/header JWT
    GQL->>US: getById(jwtPayload.id)
    US->>DB: findById(id)
    DB-->>US: User
    US-->>GQL: User
    GQL-->>FE: getMe response
    FE->>FE: setUser(response.getMe)
    FE-->>U: Redirect to /profil
```

## 2. Authenticated Query: My Activities

```mermaid
%%{init: {'themeVariables': {'mainBkg': '#FFFFFF', 'primaryColor': '#FFFFFF', 'secondaryColor': '#FFFFFF', 'tertiaryColor': '#FFFFFF', 'textColor': '#F8FAFC', 'lineColor': '#E5E7EB', 'actorLineColor': '#E5E7EB', 'labelBoxBkgColor': '#0F172A', 'labelBoxBorderColor': '#334155', 'actorBkg': '#E6F0FF', 'actorBorder': '#1E3A8A', 'actorTextColor': '#F8FAFC', 'participantBkg': '#FFFFFF', 'participantBorder': '#9CA3AF', 'participantTextColor': '#0F172A', 'signalColor': '#F59E0B', 'signalTextColor': '#F8FAFC', 'sequenceNumberColor': '#0F172A', 'activationBorderColor': '#F59E0B'}}}%%
sequenceDiagram
    autonumber
    actor U as User (Browser)
    participant FE as Frontend Page (/my-activities)
    participant SSR as getServerSideProps
    participant GQL as Backend GraphQL
    participant ACT as ActivityService
    participant DB as MongoDB

    U->>FE: Request /my-activities
    FE->>SSR: Execute getServerSideProps(req)
    SSR->>GQL: getActivitiesByUser() + Cookie header
    GQL->>GQL: Verify JWT in GraphQL context
    GQL->>GQL: AuthGuard canActivate()
    GQL->>ACT: findByUser(jwtPayload.id)
    ACT->>DB: find activities by owner sorted by createdAt desc
    DB-->>ACT: activity list
    ACT-->>GQL: activity list
    GQL-->>SSR: Query response
    SSR-->>FE: props.activities
    FE-->>U: Render list or empty state
```

## 3. Create Activity (Guarded Mutation)

```mermaid
%%{init: {'themeVariables': {'mainBkg': '#FFFFFF', 'primaryColor': '#FFFFFF', 'secondaryColor': '#FFFFFF', 'tertiaryColor': '#FFFFFF', 'textColor': '#F8FAFC', 'lineColor': '#E5E7EB', 'actorLineColor': '#E5E7EB', 'labelBoxBkgColor': '#0F172A', 'labelBoxBorderColor': '#334155', 'actorBkg': '#E6F0FF', 'actorBorder': '#1E3A8A', 'actorTextColor': '#F8FAFC', 'participantBkg': '#FFFFFF', 'participantBorder': '#9CA3AF', 'participantTextColor': '#0F172A', 'signalColor': '#F59E0B', 'signalTextColor': '#F8FAFC', 'sequenceNumberColor': '#0F172A', 'activationBorderColor': '#F59E0B'}}}%%
sequenceDiagram
    autonumber
    actor U as User (Browser)
    participant FE as Frontend (/activities/create)
    participant HOC as withAuth
    participant GQL as Backend GraphQL
    participant ACT as ActivityService
    participant DB as MongoDB

    U->>FE: Open /activities/create
    FE->>HOC: withAuth checks user + loading state
    HOC-->>FE: Allow render when authenticated
    U->>FE: Submit ActivityForm(name, city, description, price)
    FE->>GQL: createActivity(createActivityInput)
    GQL->>GQL: Verify JWT in GraphQL context
    GQL->>GQL: AuthGuard canActivate()
    GQL->>ACT: create(jwtPayload.id, input)
    ACT->>DB: insert activity with owner userId
    DB-->>ACT: Activity
    ACT-->>GQL: Activity
    GQL-->>FE: Mutation response
    FE-->>U: router.back()
```

## 4. Explorer City Filter Update Loop

```mermaid
%%{init: {'themeVariables': {'mainBkg': '#FFFFFF', 'primaryColor': '#FFFFFF', 'secondaryColor': '#FFFFFF', 'tertiaryColor': '#FFFFFF', 'textColor': '#F8FAFC', 'lineColor': '#E5E7EB', 'actorLineColor': '#E5E7EB', 'labelBoxBkgColor': '#0F172A', 'labelBoxBorderColor': '#334155', 'actorBkg': '#E6F0FF', 'actorBorder': '#1E3A8A', 'actorTextColor': '#F8FAFC', 'participantBkg': '#FFFFFF', 'participantBorder': '#9CA3AF', 'participantTextColor': '#0F172A', 'signalColor': '#F59E0B', 'signalTextColor': '#F8FAFC', 'sequenceNumberColor': '#0F172A', 'activationBorderColor': '#F59E0B'}}}%%
sequenceDiagram
    autonumber
    actor U as User (Browser)
    participant FE as Frontend (/explorer/[city])
    participant D as useDebounced
    participant R as next/router
    participant SSR as getServerSideProps
    participant GQL as Backend GraphQL
    participant ACT as ActivityService
    participant DB as MongoDB

    U->>FE: Change filter inputs (activity/price)
    FE->>D: debounce state for 300ms
    D-->>FE: debouncedSearchActivity, debouncedSearchPrice
    FE->>R: router.push explorer city with activity and price query
    U->>SSR: New request with query params
    SSR->>GQL: getActivitiesByCity(city, activity?, price?)
    GQL->>ACT: findByCity(...)
    ACT->>DB: find by city with optional price and name filter
    DB-->>ACT: activity list
    ACT-->>GQL: activity list
    GQL-->>SSR: Query response
    SSR-->>FE: props.activities
    FE-->>U: Re-render filtered list
```
