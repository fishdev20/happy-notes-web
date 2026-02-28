# Happy Notes Web

Happy Notes is a markdown-first journaling app built with Next.js and Zustand.

## Features

- Markdown editor with source, diff, and preview modes
- Local persistent storage for notes
- Note lifecycle management: active, archived, trash
- Calendar view by note update date
- In-editor AI template generator (real OpenAI API call)
- Light and dark themes

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Zustand (with persistence middleware)
- shadcn/ui + Radix UI

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

For AI template generation, you have two options:

### Free (recommended): local Ollama

```bash
# install Ollama first, then pull a writing-friendly model
ollama pull qwen2.5:7b-instruct
```

Optional env vars (defaults already work):

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

If `AI_PROVIDER` is not set, the app tries Ollama first (free local), then OpenAI if `OPENAI_API_KEY` exists.

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

- Notes are stored in browser `localStorage` under the key `happy-notes-store`.
- This is client-side persistence only. Add a backend datastore if you need multi-device sync.
