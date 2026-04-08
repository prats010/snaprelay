# ⚡ SnapRelay

> A self-hosted micro-transfer tool. Secure. Minimal. Yours.

**Live Demo → [snaprelay.vercel.app](https://snaprelay.vercel.app)**

---

## What is SnapRelay?

SnapRelay is a lightweight, self-hosted file transfer dashboard built for people who want control over how they move files — no accounts, no cloud bloat, no third-party tracking. Just a passphrase, a dashboard, and your files.

Enter a passphrase → unlock your dashboard → send and receive files. That's it.

---

## Features

- **Passphrase Authentication** — Simple bcrypt-secured access, no username/password overhead
- **Drag-and-Drop Uploads** — Powered by `react-dropzone` for a smooth file-picking experience
- **Supabase Backend** — Reliable file storage and database with real-time capabilities
- **AI Integration** — Google Gemini baked in for intelligent features
- **Minimal UI** — Clean, focused interface with Lucide icons and Tailwind v4
- **Fast by Default** — Built on Next.js 16 + React 19, deployed on Vercel edge

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Backend / Storage | Supabase |
| Auth | bcrypt |
| AI | Google Gemini API |
| File Handling | react-dropzone, nanoid |
| Utilities | date-fns, lucide-react |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/prats010/snaprelay.git
cd snaprelay
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_gemini_api_key
PASSPHRASE_HASH=your_bcrypt_hashed_passphrase
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enter your passphrase to access the dashboard.

---

## Project Structure

```
snaprelay/
├── public/          # Static assets
├── src/             # App source
│   ├── app/         # Next.js App Router pages & API routes
│   ├── components/  # Reusable UI components
│   └── lib/         # Supabase client, utilities
├── next.config.ts
├── vercel.json
└── package.json
```

---

## Deployment

SnapRelay is built for Vercel. Connect your GitHub repo and it deploys automatically on every push to `main`. Add all environment variables in your Vercel project settings before deploying.

```bash
npm run build
```

---

## Author

Built by [Prathamesh Bhamare](https://github.com/prats010)
