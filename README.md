# ITF Corporate Scorecard — Interactive Reporting System

A dynamic, multi-year management reporting system for the Industrial Training
Fund (ITF) 2024 Corporate Scorecard, with a branded admin panel for data
entry, CSV import, and year-over-year analytics.

**Stack:** TanStack Start (React 19 + Vite 7) · TypeScript · Tailwind v4 ·
Recharts · Supabase (Postgres + Auth + RLS).

---

## 1. Project Contents

```
├── src/
│   ├── routes/               # File-based routing (TanStack Router)
│   │   ├── index.tsx         # Executive Overview
│   │   ├── analytics.tsx     # Visual analytics dashboard
│   │   ├── performance.tsx   # KRA drill-downs
│   │   ├── revenue.tsx       # Revenue analysis
│   │   ├── training.tsx      # Training & Staff School
│   │   ├── detailed.tsx      # Full data tables
│   │   ├── insights.tsx      # Insights & recommendations
│   │   ├── validation.tsx    # Data validation audit
│   │   ├── executive-deck.tsx# 10-slide interactive deck
│   │   ├── admin.tsx         # Admin layout + guard
│   │   ├── admin.login.tsx   # Branded login
│   │   ├── admin.forgot.tsx  # Password reset request
│   │   ├── admin.reset.tsx   # Password reset confirmation
│   │   └── admin.index.tsx   # CRUD + CSV import
│   ├── components/dashboard/ # Layout, widgets, YearSwitcher
│   ├── lib/                  # auth, year-context, utils
│   ├── integrations/supabase/# Generated Supabase clients (do not edit)
│   ├── data/itf2024.ts       # Original 2023/2024 seed data
│   └── styles.css            # ITF brand tokens (green/red/gold)
├── supabase/
│   ├── migrations/           # All schema + RLS as SQL migrations
│   └── functions/bootstrap-admin/  # Edge function to create admin user
├── .env.example
└── package.json
```

---

## 2. Prerequisites

- **Node.js 20+** and **Bun** or **npm**
- A **Supabase project** (managed at supabase.com or self-hosted — see §7)
- **Supabase CLI** (only for local development / migrations):
  `npm i -g supabase`

---

## 3. Local Development

```bash
# 1. Install dependencies
bun install                       # or: npm install

# 2. Configure environment
cp .env.example .env              # then fill in your Supabase URL + keys

# 3. Apply the database schema
supabase link --project-ref YOUR-PROJECT-REF
supabase db push                  # runs everything in supabase/migrations/

# 4. Seed initial data (optional, for the ITF 2023/2024 dataset)
#    The migrations include table creation + policies. Seed rows were
#    loaded via the app's admin CSV import — see supabase/seed.sql if
#    you exported one, or use the Admin panel's "Import CSV" per table.

# 5. Create the hardcoded admin user (once)
supabase functions deploy bootstrap-admin
supabase functions invoke bootstrap-admin
#    → creates admincpd@itf.gov.ng / 123456 with admin role.
#    CHANGE THIS PASSWORD IMMEDIATELY after first login.

# 6. Start the dev server
bun run dev                       # or: npm run dev
#    App: http://localhost:8080
#    Admin: http://localhost:8080/admin/login
```

### Common scripts

| Command             | Purpose                                     |
|---------------------|---------------------------------------------|
| `bun run dev`       | Start Vite dev server (HMR) on :8080        |
| `bun run build`     | Production build (SSR + client)             |
| `bun run start`     | Serve the production build                  |
| `bun run typecheck` | Strict TypeScript check                     |

There is **no separate backend service** — all server logic runs inside
TanStack Start server functions, and the database + auth are Supabase.

---

## 4. Database

The schema, RLS policies, GRANTs, and the `has_role()` security-definer
function are defined in `supabase/migrations/*.sql` and applied with
`supabase db push`.

Tables: `years`, `kra_rows`, `revenue_rows`, `area_revenue`,
`training_programmes`, `staff_school`, `hr_metrics`, `challenges`,
`way_forward`, `profiles`, `user_roles`.

Security model:
- Public read on report tables (dashboard is read-only for visitors).
- Writes restricted to users with the `admin` role via
  `public.has_role(auth.uid(), 'admin')`.
- Roles live in a **separate `user_roles` table** (no privilege escalation).
- `has_role()` is `SECURITY DEFINER` with `EXECUTE` granted to
  `authenticated` and `anon` so RLS policies can call it.

---

## 5. Production Build

```bash
bun install --frozen-lockfile
bun run build
bun run start           # serves .output/ on the port from $PORT (default 3000)
```

Environment variables must be present at build time (Vite inlines
`VITE_*`) and at runtime (server functions read `SUPABASE_URL` etc.).

---

## 6. Deployment

### 6.1 VPS / Linux Server (Ubuntu 22.04+)

```bash
# On the server
sudo apt update && sudo apt install -y curl git nginx certbot python3-certbot-nginx
curl -fsSL https://bun.sh/install | bash

git clone <YOUR-REPO> /var/www/itf
cd /var/www/itf
cp .env.example .env    # fill values
bun install --frozen-lockfile
bun run build

# Run with a process manager (pm2 or systemd)
sudo tee /etc/systemd/system/itf.service <<'EOF'
[Unit]
Description=ITF Scorecard
After=network.target
[Service]
WorkingDirectory=/var/www/itf
EnvironmentFile=/var/www/itf/.env
ExecStart=/root/.bun/bin/bun run start
Restart=always
User=www-data
[Install]
WantedBy=multi-user.target
EOF
sudo systemctl enable --now itf
```

**Nginx reverse proxy + SSL:**
```nginx
server {
    server_name scorecard.itf.gov.ng;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
```bash
sudo certbot --nginx -d scorecard.itf.gov.ng
```

### 6.2 Docker

```dockerfile
# Dockerfile
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./
ENV PORT=3000
EXPOSE 3000
CMD ["bun", "run", "start"]
```
```bash
docker build -t itf-scorecard .
docker run -d --env-file .env -p 3000:3000 itf-scorecard
```

### 6.3 Windows Server

Install Node 20 LTS, then run inside PowerShell as a service via
[nssm](https://nssm.cc):
```powershell
npm install
npm run build
nssm install ITF "C:\Program Files\nodejs\node.exe" ".output\server\index.mjs"
nssm set ITF AppDirectory C:\inetpub\itf
nssm start ITF
```
Front with IIS ARR or Nginx for Windows for SSL termination.

### 6.4 Cloud Platforms

- **Vercel / Netlify:** import the repo, set the env vars from
  `.env.example`, build command `bun run build`, output `.output`.
- **Cloudflare Pages/Workers:** TanStack Start's default preset already
  targets Workers — `bun run build` produces a Worker-compatible
  bundle. Set env vars in the Pages dashboard.
- **Render / Railway / Fly.io:** use the Dockerfile above.

---

## 7. Self-Hosting Supabase (optional)

You are NOT locked into supabase.com. To run the DB stack yourself:

```bash
git clone https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env    # set POSTGRES_PASSWORD, JWT_SECRET, etc.
docker compose up -d
# → Postgres on :5432, Auth on :9999, PostgREST on :3000, Studio on :3000
```

Point the app's `SUPABASE_URL` / `VITE_SUPABASE_URL` at your self-hosted
Kong gateway (default http://localhost:8000) and use the anon/service
keys printed by the compose stack. Then `supabase db push` your
migrations against the self-hosted DB.

---

## 8. Ownership & Independence

- All source code (frontend, server functions, SQL migrations, edge
  function) lives in this repository. You own it outright.
- No runtime dependency on Lovable — the app is a standard TanStack
  Start build. Delete `.lovable/` if you like.
- The publishable Supabase URL/keys can be regenerated in the Supabase
  dashboard at any time; nothing is bound to a Lovable account.

---

## 9. First Login

```
URL:      /admin/login
Email:    admincpd@itf.gov.ng
Password: 123456
```
**Change the password immediately** via `/admin/forgot`.
