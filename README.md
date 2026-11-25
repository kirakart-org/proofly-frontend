# Proofly frontend

This folder contains a Vite + React + TypeScript frontend with shadcn-style UI
primitives. It opens on the public landing page; use **Create your page** to
enter the interactive workspace.

## Run locally

```powershell
cd frontend
npm install
npm run dev
```

Open the localhost URL printed by Vite. To create a production build, run
`npm run build`.

The workspace is currently an interactive demo: edits, offerings, portfolio
items, testimonials, settings, and enquiry submissions are stored in this
browser's local storage. The existing Hatchable API routes are not connected to
this standalone Vite demo.

## Main paths

- `src/components/site/landing-page.tsx` — marketing landing page
- `src/components/site/dashboard-layout.tsx` — responsive workspace navigation
- `src/components/site/workspace-page.tsx` — business editor and management views
- `src/components/site/public-profile-page.tsx` — shareable profile and enquiry form
- `src/components/ui/` — reusable shadcn-style UI components
- `src/hooks/use-proofly.tsx` — demo state and local persistence
