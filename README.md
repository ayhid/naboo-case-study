# Naboo Case Study

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Run Locally](#run-locally)
- [Documentation](#documentation)
- [Test Credentials](#test-credentials)

## Overview
This repository contains a full-stack case study with:

- `back-end`: NestJS GraphQL API with MongoDB (Mongoose)
- `front-end`: Next.js (Pages Router) app with Apollo Client and Mantine

## Tech Stack
### Backend
- NestJS
- GraphQL
- MongoDB + Mongoose
- JWT authentication

### Frontend
- Next.js (Pages Router)
- Apollo Client
- Mantine UI
- Axios
- Vitest

## Run Locally
### Backend
```bash
cd back-end
npm install
npm run start:dev
```

### Frontend
```bash
cd front-end
npm install
npm run dev
```

### Regenerate GraphQL types
```bash
cd front-end
npm run generate-types
```

## Documentation
- [C4 Architecture View](docs/c4-architecture-view.md)
- [Sequence Diagrams](docs/sequence-diagrams.md)
- [Codebase Documentation](docs/codebase-documentation.md)
- [Architecture Roadmap](docs/architecture-roadmap.md)
- [Dokploy Deployment Guide](DEPLOY_DOKPLOY.md)
- [Backend README](back-end/README.md)
- [Frontend README](front-end/README.md)

## Test Credentials
- Regular user:
  - Email: `user1@test.fr`
  - Password: `user1`
- Admin user:
  - Email: `admin@test.fr`
  - Password: `admin`
