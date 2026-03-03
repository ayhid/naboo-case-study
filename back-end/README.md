# Backend (NestJS)

This service is a [NestJS](https://docs.nestjs.com/) application.

## Installation

```bash
npm install
```

## Run the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# debug mode
npm run start:debug

# production mode
npm run build
npm run start:prod
```

The API runs on port `3000` with global prefix `api` (for example: `http://localhost:3000/api`).

## Database helper commands

```bash
# start db services
npm run start:db

# stop db services
npm run stop:db

# stop and remove db services
npm run stop:db:rm
```

The DB runtime script is implementation-agnostic and supports both:
- `docker-compose` (legacy binary)
- `docker compose` (Docker Compose v2 plugin)

## Quality checks

```bash
npm run check
npm run lint
npm run format
```

## Test

```bash
# unit tests
npm run test

# watch mode
npm run test:watch

# coverage
npm run test:cov

# e2e tests
npm run test:e2e
```

## Seeded Users

The seed process creates these default users:

- Regular user: `user1@test.fr` / `user1`
- Admin user: `admin@test.fr` / `admin`
