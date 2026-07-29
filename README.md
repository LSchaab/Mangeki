# Mangeki

Mangeki is a Spanish-language manga / manhwa / manhua reader showcase built for the
Vaiven portfolio. It is a static Next.js + Tailwind CSS v4 site that demonstrates a
catalog browsing and library experience: demo authentication and the user library are
persisted entirely in the browser via `localStorage`, and the reader itself is
intentionally disabled — this is a front-end showcase, not a production reading service.

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the local dev server (http://localhost:3000)
npm run seed     # generate/refresh the catalog seed data
npm test         # run the Vitest suite
npm run build    # produce the static export
```

## Deployment & design

- Deployment (GitHub Pages): see [`docs/DEPLOY.md`](docs/DEPLOY.md).
- Design and specifications: see [`docs/superpowers/specs/`](docs/superpowers/specs/).
