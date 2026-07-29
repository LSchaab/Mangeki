# Deploying Mangeki to GitHub Pages

Mangeki is a fully static Next.js site (`output: 'export'`) served from GitHub
Pages at the custom domain **`mangeki.lourdesschaab.com`**.

Deployment is automated by `.github/workflows/deploy.yml`, which runs on every
push to `main` (and can be triggered manually via **Actions → Deploy to GitHub
Pages → Run workflow**). The workflow installs dependencies, seeds the catalog,
runs the test suite, builds the static `out/` directory, and publishes it. No
secrets are required.

## One-time manual setup (repository owner)

These steps only need to be done once, before the first deploy.

### 1. Enable GitHub Pages via Actions

1. Go to the GitHub repository → **Settings** → **Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.

(The custom domain is set automatically from the `public/CNAME` file, which is
copied into the published `out/` directory on every build.)

### 2. Configure DNS

At your DNS provider for `lourdesschaab.com`, add a **CNAME** record:

| Type  | Name (host) | Value / Target          |
| ----- | ----------- | ----------------------- |
| CNAME | `mangeki`   | `<username>.github.io.` |

Replace `<username>` with the GitHub account (or organization) that owns the
repository. Allow time for DNS propagation, then—optionally—enable
**Enforce HTTPS** under Settings → Pages once the certificate is provisioned.

## How it works

1. Push to `main` triggers the `build` job (Ubuntu, Node 20).
2. `npm ci` → `npm run seed` (falls back to the committed catalog JSON if
   seeding fails) → `npm test` → `npm run build`.
3. `touch out/.nojekyll` disables Jekyll so `_next/` assets are served as-is.
4. The `out/` folder (including `CNAME`) is uploaded as a Pages artifact.
5. The `deploy` job publishes the artifact to the `github-pages` environment.
