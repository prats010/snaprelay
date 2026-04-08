# ⚡ SnapRelay

> A self-hosted micro-transfer tool. No accounts. No bloat. Just your passphrase and your files.

**Live → [snaprelay.vercel.app](https://snaprelay.vercel.app)**

---

## The Problem

Every time you need to move a file between devices or share something quickly, you're forced into one of two bad options: hand your file to a third-party cloud service that you don't control, or fumble through email attachments and USB cables. File transfer in 2025 is still weirdly painful.

SnapRelay was built to solve that. It's a minimal, self-hosted dashboard where you control everything — the storage, the auth, the cleanup, the data. No signup. No tracking. Just a passphrase that unlocks your personal transfer hub.

---

## What It Does

SnapRelay gives you a private, passphrase-protected dashboard to upload and relay files. Drop a file in, get it from another device or share with someone who has the passphrase. Files are stored on Supabase and automatically cleaned up every night via a scheduled cron job — so your storage never accumulates junk.

The flow is dead simple:

```
Visit the app → Enter passphrase → Access dashboard → Upload or retrieve files
```

No accounts. No OAuth. No email verification. Just a hash-protected gate and a clean interface.

---

## Features

**Authentication**
- Passphrase-based login secured with `bcrypt` hashing
- No user accounts or session databases — just a hashed secret you control
- Keeps the surface area tiny and the setup simple

**File Transfers**
- Drag-and-drop file uploads powered by `react-dropzone`
- Each upload gets a unique ID generated with `nanoid` — collision-safe and URL-friendly
- Files are stored in Supabase Storage with metadata in the Supabase database
- Timestamps handled with `date-fns` — upload times, expiry, and display formatting

**Automatic Cleanup**
- A Vercel cron job runs every day at midnight UTC (`/api/cron`)
- Stale or expired transfers are pruned automatically — no manual maintenance needed

**AI Integration**
- Google Gemini (`@google/generative-ai`) is integrated into the stack
- Lays the groundwork for AI-assisted features like smart file labeling, transfer summaries, or content detection

**UI & Performance**
- Built with Tailwind CSS v4 — utility-first, no design framework overhead
- Lucide React icons for a consistent, sharp icon set
- Runs on Next.js 16 with the App Router and React 19 — as fast as it gets
- Deployed on Vercel with edge functions for low-latency globally

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Backend & Storage | Supabase (Database + File Storage) |
| Authentication | bcrypt |
| AI | Google Gemini API (`@google/generative-ai`) |
| File Handling | react-dropzone |
| ID Generation | nanoid |
| Date Utilities | date-fns |
| Icons | lucide-react |
| Scheduled Jobs | Vercel Cron (`vercel.json`) |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- A [Google AI Studio](https://aistudio.google.com) API key for Gemini
- A Vercel account for deployment (optional for local dev)

### 1. Clone the repository

```bash
git clone https://github.com/prats010/snaprelay.git
cd snaprelay
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file at the root of the project:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# App Auth — store a bcrypt hash of your chosen passphrase
PASSPHRASE_HASH=your_bcrypt_hashed_passphrase
```

To generate a bcrypt hash for your passphrase, you can use a tool like [bcrypt-generator.com](https://bcrypt-generator.com) or run a quick Node script:

```js
const bcrypt = require('bcrypt');
bcrypt.hash('your-passphrase', 10).then(console.log);
```

### 4. Set up Supabase

In your Supabase project:
- Create a storage bucket (e.g. `transfers`) for file uploads
- Create a table to track file metadata (id, filename, uploaded\_at, expires\_at, etc.)
- Set appropriate RLS policies for your use case

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Enter your passphrase to unlock the dashboard.

---

## Deployment

SnapRelay is built for Vercel. The `vercel.json` already includes the cron schedule.

**Option 1 — Vercel CLI**

```bash
npm run build
vercel deploy
```

**Option 2 — GitHub Integration**

Connect your fork to Vercel via the dashboard. Every push to `main` triggers an automatic deployment.

Before deploying, add all environment variables from your `.env.local` to your Vercel project's Environment Variables settings.

The cron job at `/api/cron` will automatically run daily at `0 0 * * *` (midnight UTC) on Vercel's infrastructure once deployed.

---

## Project Structure

```
snaprelay/
├── public/                  # Static assets
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── cron/        # Daily cleanup cron handler
│   │   ├── login/           # Passphrase auth page
│   │   ├── dashboard/       # Main transfer dashboard
│   │   └── layout.tsx
│   ├── components/          # Reusable UI components
│   └── lib/                 # Supabase client, utilities, helpers
├── AGENTS.md                # Notes for AI coding agents
├── CLAUDE.md                # Claude Code config
├── next.config.ts
├── vercel.json              # Cron schedule config
├── tsconfig.json
└── package.json
```

---

## Why Self-Host?

- **Privacy** — Your files never touch a service you don't control
- **No limits** — Storage limits are whatever your Supabase plan allows
- **No subscriptions** — Host it for free on Vercel + Supabase free tiers
- **Transparency** — The entire codebase is open. You can see exactly what happens to your files

---

## Roadmap Ideas

- [ ] Per-file expiry with custom durations
- [ ] Transfer link sharing (public URLs without full dashboard access)
- [ ] File preview for images and PDFs
- [ ] AI-powered file tagging via Gemini
- [ ] Download count tracking per transfer
- [ ] Multiple passphrase support (multi-user)

---

## Author

**Prathamesh Bhamare**

SnapRelay exists because I got tired of explaining to myself why file transfer is still this annoying in an era of serverless infrastructure and edge compute. So I built the tool I actually wanted to use — passphrase-protected, self-hosted, zero-signup, and auto-cleaning.

This project is part of a broader set of real-world tools I build while pursuing my MSc in Data Science, where I focus on the intersection of applied AI, full-stack systems, and things that are genuinely useful outside of a textbook.

- GitHub: [github.com/prats010](https://github.com/prats010)
- Email: prathambhamare.30@gmail.com
- Also check out: [MindBridge AI](https://github.com/prats010) — a mental health support app with a custom fine-tuned DialoGPT model

---

## License

This project is open source. Feel free to fork, self-host, and adapt it for your own use.

---

*Built from scratch. Deployed on the edge. Runs itself.* ⚡
