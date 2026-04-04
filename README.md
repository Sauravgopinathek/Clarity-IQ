# ClarityIQ - The Deal Arc Engine

ClarityIQ is a stateful sales intelligence desktop application designed to eliminate "deal decay". It provides a continuous psychological and structural memory of every customer relationship across its entire lifecycle.

## Tech Stack
- **Desktop**: Electron + Vite + React (`packages/desktop`)
- **Backend**: Node.js + Express + TypeScript (`packages/backend`)
- **Database**: Supabase PostgreSQL + Prisma with `@prisma/adapter-pg`
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **AI**: Gemini API for meeting transcription and analysis

## Setup Instructions

### Prerequisites
1. Node.js (v18+)
2. A Supabase Project configured with Auth (Email) and a Storage Bucket called `meetings-audio`.
3. Prisma installed globally or via npx.

### 1. Install Dependencies
From the root directory of the monorepo, run:
```bash
npm install
```

### 2. Configure Environment Variables

**Backend (`packages/backend/.env`)**
Create a `.env` file in `packages/backend`:
```env
PORT=3001
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?connection_limit=1"
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="ey..."
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"
```

**Desktop (`packages/desktop/.env`)**
Create a `.env` file in `packages/desktop`:
```env
VITE_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
VITE_SUPABASE_ANON_KEY="ey..."
VITE_BACKEND_URL="http://localhost:3001"
```

### 3. Initialize Database
Navigate to `packages/backend`:
```bash
cd packages/backend
npx prisma db push
npx prisma generate
```

### 4. Run Development Servers
From the root directory:
```bash
npm run dev
```
This starts the backend and the Electron desktop app together.

If you want to run them separately:
```bash
npm run dev:backend
npm run dev:desktop
```

### 5. Typecheck
```bash
npm run typecheck
```

## CI/CD Workflows
- `.github/workflows/ci.yml`: backend and desktop typechecks
- `.github/workflows/deploy-backend-railway.yml`: backend deploy scaffold for Railway
- `.github/workflows/build-desktop.yml`: Windows Electron build artifact

### Required GitHub Secrets
- `RAILWAY_TOKEN`
- `RAILWAY_SERVICE`

---

## Phase 1 Architecture
- **Monorepo**: Setup with `npm workspaces`.
- **Backend**: Secure endpoints using Supabase JWTs, multer for memory file storage, Prisma database writes, and Supabase Storage uploads.
- **Desktop Shell**: React rendering inside an Electron window with IPC bridges. A robust `AudioEngine` uses `desktopCapturer` and `getUserMedia` to mix and chunk audio using `AudioContext` and `MediaRecorder`.


