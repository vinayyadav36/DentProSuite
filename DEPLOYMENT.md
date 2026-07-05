# Deployment Guide

DentProSuite supports flexible deployment configurations.

## Quick Start (Development)

### Backend
```bash
cd backend
cp .env.example .env   # Edit JWT_SECRET for production!
npm install
npm run seed           # Generate demo data
npm run dev            # Starts on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev            # Starts on http://localhost:5173
```

## Frontend (Vercel)

The frontend is optimized for serverless edge deployment using Vercel.

1. Push your repository to GitHub.
2. Import the `frontend` directory into Vercel as a Vue/Vite project.
3. Configure Environment Variables in Vercel:
   - `VITE_API_URL`: Your backend endpoint (e.g., `https://api.yourdomain.com`).
   - (Optional) `VITE_APPWRITE_ENDPOINT` and `VITE_APPWRITE_PROJECT_ID` for client-side Appwrite SDK.
4. A `vercel.json` rewrite handles SPA routing automatically.

## Backend (Local / Self-Hosted)

The backend is a Node.js Express server.

1. Navigate to the `backend` directory.
2. Copy `.env.example` to `.env` and configure:
   - `JWT_SECRET`: Generate a secure string (min 16 chars).
   - `FRONTEND_URL`: Your frontend URL (for CORS).
   - `PORT`: Listener port (default 3001).
   - `STORAGE_MODE`: `local` for JSON-file DB, or `appwrite` for cloud.
3. Start:
   ```bash
   npm install
   npm run build
   npm start
   ```

## Appwrite Integration (Cloud Database Mode)

To use Appwrite instead of local JSON files:

1. Create an Appwrite project and database.
2. Create collections: `users`, `patients`, `appointments`, `templates`, `submissions`, `clinics`.
3. Set `STORAGE_MODE=appwrite` in `.env`.
4. Configure Appwrite variables:
   - `APPWRITE_ENDPOINT` — Your Appwrite server endpoint
   - `APPWRITE_PROJECT_ID` — Your project ID
   - `APPWRITE_API_KEY` — A server API key with database access
   - `APPWRITE_DATABASE_ID` — Your database ID
5. The `DatabaseService` automatically switches from `LocalJsonAdapter` to `AppwriteAdapter`.

### Client-Side Appwrite (Frontend)
- The frontend includes an optional Appwrite client SDK (`src/lib/appwrite.ts`)
- Set `VITE_APPWRITE_ENDPOINT` and `VITE_APPWRITE_PROJECT_ID` in your frontend env
- On app startup, a ping verifies the Appwrite connection
- Client-side: Account management and Databases access for user-scoped flows
- Privileged/admin operations remain behind the Express backend

## Mobile (Capacitor)

The frontend is Capacitor-ready. To generate native apps:

```bash
cd frontend
npm install @capacitor/core @capacitor/cli
npx cap init
npm install @capacitor/android @capacitor/ios
npm run build
npx cap add android
npx cap add ios
npx cap sync
```

Open Android Studio / Xcode to compile and publish.
