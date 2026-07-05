# DentProSuite Architecture

## Overview
DentProSuite is a hybrid, offline-capable platform designed for dental clinics. It supports two operating modes:

1. **Local / Self-Hosted Mode**: A stable Express backend with JSON file-based storage, suitable for on-premise deployment.
2. **Cloud Mode**: An Appwrite-backed deployment with Vue frontend on Vercel + Appwrite backend integration.

## Components

### Frontend (`frontend/`)
- **Stack**: Vue 3, Vite 8, Pinia 3, Vue Router 5, Tailwind CSS 3, TypeScript 6
- **PWA**: Service worker with auto-update, offline caching, web manifest
- **Offline-First** (`services/offlineStorage.ts`):
  - IndexedDB-based sync queue (`sync-queue`) and data cache (`cached-data`)
  - `queueSyncRequest()` — queue mutations when offline
  - `syncQueue()` — replay queued requests FIFO on reconnect
  - `cacheData()` / `getCachedData()` — offline read support
  - Online/offline detection + auto-sync via `navigator.onLine`
  - UI sync indicator showing pending queue count
- **State Management**: Pinia stores (`auth`, `appointments`, `patients`, `forms`)
  - Each store handles inline offline fallback via `offlineStorage.ts`
  - Loading, error, and empty states on all data-fetching pages
- **Routing**: Vue Router with auth guards and role-based route protection
- **API Layer**: Centralized env-based configuration (`VITE_API_URL`)
- **Appwrite Client SDK** (`lib/appwrite.ts`):
  - Optional — enabled only when `VITE_APPWRITE_ENDPOINT` and `VITE_APPWRITE_PROJECT_ID` are set
  - Client-side: `Account` + `Databases` for user-scoped flows
  - Pocket ping verification on app startup
- **Mobile Ready**: Environment variables, responsive Tailwind, PWA shell; Capacitor-ready

### Backend (`backend/`)
- **Stack**: Node.js, Express 5, TypeScript 6, Zod 4, Helmet, JWT, bcrypt
- **Data Abstraction**:
  - `StorageAdapter<T>` interface — generic CRUD (`getAll`, `getById`, `insert`, `update`, `delete`)
  - `LocalJsonAdapter` — JSON file persistence in `data/` directory
  - `AppwriteAdapter` — Appwrite Database integration (server SDK)
  - `DatabaseService.getDatabaseAdapter()` — factory selecting adapter by `STORAGE_MODE`
- **Security**:
  - Helmet security headers
  - CORS restricted to `FRONTEND_URL`
  - Rate-limited login (10 req / 15 min)
  - Zod request validation on all endpoints
  - JWT auth with role-based authorization middleware
  - `JWT_SECRET` required at startup (env validation via Zod)
- **Endpoints**:
  - `POST /api/auth/login` — login with credentials, returns JWT
  - `GET /api/auth/me` — current user info (authenticated)
  - `GET/POST/PUT /api/patients` — patient CRUD with role guards
  - `GET/POST/PUT /api/appointments` — appointment management
  - `GET/POST /api/forms/templates` + `GET/POST /api/forms/submissions`
  - `GET /api/billing/overview` — admin-only revenue summary
  - `GET /api/health`, `GET /api/ready` — health/readiness checks

### Shared (`shared/`)
- **Types** (`types/index.ts`): `User`, `Patient`, `Appointment`, `FormTemplate`, `FormSubmission`, `Service`, `RevenueSummary`, `Clinic`
- **Validation Schemas** (`schemas/index.ts`): Zod schemas for all domain operations — login, patient, appointment, form, and billing validation

## Offline Data Strategy
1. **Reads**: Cache API responses to IndexedDB (`cached-data` store). Fall back to cache on network failure.
2. **Writes**: Queue mutations to IndexedDB (`sync-queue` store) when offline.
3. **Reconnect**: `window.addEventListener('online', syncQueue)` auto-replays queued items FIFO.
4. **Sync State**: Visible sync queue count in the app header.
5. **Conflict Strategy**: Last-write-wins for queued operations; `updated_at` metadata for future conflict resolution.

## Deployment
- **Frontend**: Vercel-ready with `vercel.json` SPA rewrite + PWA support
- **Backend**: Self-hosted Node.js Express server or Docker
- **Database**: Local JSON files (default) or Appwrite cloud database
