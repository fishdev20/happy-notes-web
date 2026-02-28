# Happy Notes Web

Happy Notes is a markdown-first notes app built with Next.js.

## Features

- Markdown editor with source, diff, and preview modes
- Local persistent storage for notes
- Note lifecycle management: active, archived, trash
- Calendar view by note update date
- In-editor AI template generator (Ollama/OpenAI)
- Light and dark themes
- Server-ready data layer with Supabase + Prisma schema/migrations

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Zustand + React Query
- shadcn/ui + Radix UI
- Supabase (Postgres + Auth)
- Prisma ORM + migrations

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Supabase + Prisma Setup

1. Create a Supabase project.
2. Fill `.env.local` using `.env.example`.
3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Run local/dev migration:

```bash
npm run prisma:migrate
```

5. Deploy migrations in production CI/CD:

```bash
npm run prisma:deploy
```

## Authentication Setup (Supabase)

The app now supports:

- Email/password auth
- Google OAuth
- GitHub OAuth

### Configure providers in Supabase

1. Go to Supabase Dashboard -> Authentication -> Providers.
2. Enable `Google` and `GitHub`.
3. Add redirect URL(s):
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`
4. Add your provider client ID/secret in Supabase.

### Route protection

- `/home`, `/notes`, `/calendar`, `/archive`, `/trash`, `/settings` require auth.
- `/login` and `/register` redirect to `/home` if already authenticated.

### RLS policies

Migration `20260228201000_auth_rls` adds:

- auto profile sync trigger from `auth.users` -> `public.user_profiles`
- row-level security policies for notes/tags/saved views/collab/share tables
- collaboration-aware read/write checks

### Schema design for scale

The initial Prisma schema includes:

- `user_profiles` (maps to Supabase auth user UUID)
- `notes` with status + cursor-friendly indexes
- `tags` + `note_tags` (many-to-many)
- `saved_views` (saved filters/search/sort)
- `note_members` (future collaboration roles)
- `share_links` (future link sharing)
- `note_versions` (history/audit foundation)
- Postgres full-text indexes (`tsvector` + `pg_trgm`) on note content

## AI Template Generation

### Free (recommended): local Ollama

```bash
ollama pull qwen2.5:7b-instruct
```

Optional env vars:

```bash
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:7b-instruct
```

### Hosted OpenAI (paid)

```bash
OPENAI_API_KEY=your_openai_api_key
AI_PROVIDER=openai
```

### Auto mode (default)

If `AI_PROVIDER` is not set, the app tries Ollama first, then OpenAI when key is present.

## Quality Gates

```bash
npm run lint
npm run build
```

## Production Run

```bash
npm run build
npm run start
```

## Notes About Data

- Current app UI still uses local store for note state.
- Supabase + Prisma foundation is now prepared for authenticated, shared, realtime persistence in next steps.
