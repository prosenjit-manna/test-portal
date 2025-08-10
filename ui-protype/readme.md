# UI Prototype (Next.js + Tailwind + LowDB)

This is a clickable prototype for the Test Management app described in PRD. It uses Next.js App Router, Tailwind, and a local JSON database via LowDB.

- Local DB: `ui-protype/data.json` (auto-created/seeded)
- Key routes:
  - `/` Dashboard
  - `/projects`, `/projects/new`, `/projects/[id]`, `/projects/[id]/webhooks`
  - `/cases/[id]` Case editor
  - `/runs`, `/runs/[id]` Run execution
  - `/plans`, `/milestones`, `/reports`, `/search`
  - `/admin`, `/admin/tokens`

## Run locally

```sh
cd ui-protype
npm install
npm run dev
```

Open http://localhost:3030

Notes
- Data persists in `data.json`. Delete it to reset demo data.
- Server Actions write directly to LowDB; no auth in this prototype.
- Styling uses Tailwind utility classes and minimal UI primitives.
