# Happy Notes Web

Happy Notes is a markdown-first journaling app built with Next.js and Zustand.

## Features

- Markdown editor with source, diff, and preview modes
- Local persistent storage for notes
- Note lifecycle management: active, archived, trash
- Calendar view by note update date
- In-editor markdown helper chatbot commands
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
