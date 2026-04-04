# Personal Brand Builder 🚀

> Platform all-in-one untuk membangun personal brand yang kuat. Bantu Anda menemukan niche, membuat konten, dan merencanakan strategi brand — diperkuat oleh ChatGPT.

![Tech Stack](https://img.shields.io/badge/React-18-blue?style=flat-square) ![Vite](https://img.shields.io/badge/Vite-5-purple?style=flat-square) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan?style=flat-square) ![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-green?style=flat-square)

---

## ⚡ Quick Start

### 1. Install Node.js
Download and install from [nodejs.org](https://nodejs.org) (LTS version).

### 2. Install dependencies
```bash
cd personal-brand-tools
npm install
```

### 3. Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In your Supabase dashboard → **SQL Editor** → paste the contents of `supabase_schema.sql` → **Run**.
3. Go to **Settings → API** and copy your **Project URL** and **anon public** key.

### 4. Create `.env.local`
```bash
# Copy the example file
copy .env.local.example .env.local
```

Then edit `.env.local` and fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run the app
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Features

| Module | Description |
|--------|-------------|
| 🎯 **Niche Finder** | Temukan 3 niche terbaik berdasarkan passion, keahlian, dan masalah audiens |
| 📖 **Storytelling & Pillar** | Generate 5 content pillars + elevator pitch personal brand |
| 📝 **Bio Generator** | 5 variasi bio Instagram/TikTok dalam beberapa detik |
| 💡 **Content Factory** | Generate ratusan ide konten viral per pilar |
| 🎬 **Script & Caption** | Script lengkap Hook–Body–CTA + caption + hashtag |
| 📅 **Content Planner** | Dashboard manajemen konten dengan status tracking |

---

## 🤖 How the ChatGPT Integration Works

This app uses a "Prompt-and-Redirect" approach — no API key needed:

1. User fills in the form fields
2. Click **Generate** → app builds a detailed prompt
3. Prompt is **automatically copied** to your clipboard
4. **ChatGPT opens** in a new tab
5. Paste the prompt → get your results
6. Copy the result back into the app

---

## 🗄️ Database Schema

Two tables are created in your Supabase project:

- **`user_profiles`** — Stores niche, keahlian, tone, bio, content pillars linked to each user
- **`content_planner`** — Stores content ideas with status tracking

Both tables have **Row Level Security (RLS)** enabled — users can only see their own data.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite 5
- **Styling**: Tailwind CSS 3 (dark mode)
- **Icons**: Lucide React
- **Auth & Database**: Supabase (Email/Password auth + PostgreSQL)
- **Routing**: React Router v6
- **Notifications**: react-hot-toast

---

## 📁 Project Structure

```
src/
├── context/        # AuthContext (session + profile state)
├── hooks/          # useProfile (read/write profile data)
├── utils/          # generateAndRedirect (prompt + clipboard + ChatGPT)
├── components/
│   ├── AuthGuard.jsx   # Route protection
│   ├── Sidebar.jsx     # Navigation
│   └── ui/
│       └── ModuleUI.jsx # Shared form components
├── pages/
│   ├── Auth.jsx        # Login/Register
│   └── Dashboard.jsx   # App shell
└── modules/
    ├── NicheFinder.jsx
    ├── Storytelling.jsx
    ├── BioGenerator.jsx
    ├── ContentFactory.jsx
    ├── ScriptCaption.jsx
    └── ContentPlanner.jsx
```
