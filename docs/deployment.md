# Deployment Guide

## Deploying to Cloudflare Pages

This project is designed for deployment on **Cloudflare Pages** using the Next.js integration.

### Prerequisites

- A Cloudflare account
- Your project pushed to GitHub (or GitLab)
- Supabase project configured (see [Setup Guide](setup.md))

### Steps

#### 1. Connect Repository

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Workers & Pages** → **Pages**
3. Click **Create application** → **Pages** → **Connect to Git**
4. Select your repository (`sgc-cahcet/sgc-attendance`)

#### 2. Configure Build Settings

| Setting | Value |
|---|---|
| **Framework preset** | Next.js |
| **Build command** | `pnpm install && pnpm build` |
| **Build output directory** | `.next` |
| **Root directory** | `/` |
| **Node.js version** | 18+ |

#### 3. Add Environment Variables

Under **Environment variables** (Production), add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key |
| `NODE_VERSION` | `18.18.0` |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` is a secret. Cloudflare encrypts it automatically.

#### 4. Deploy

Click **Save and Deploy**. The first deployment will take a few minutes.

#### 5. Custom Domain

1. Go to your Pages project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter `manage.team.sgc`
4. Follow Cloudflare's DNS configuration instructions

## Environment Variables Reference

| Variable | Required | Runtime | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Client + Server | Supabase project endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Client + Server | Public anon key (safe in browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server only | Admin key for auth user deletion |
| `NODE_VERSION` | No | Build | Node.js version hint |

> All `NEXT_PUBLIC_*` variables are bundled into the client-side JavaScript and visible in the browser. Never put secrets there.

## Runtime

- **API Routes**: Edge Runtime (`export const runtime = "edge"`) for Cloudflare compatibility
- **Pages**: Client-rendered (CSR) by default
- **Server Components**: Only `layout.tsx` and public landing pages

## Build Verification

After deployment, verify:

- [ ] `https://manage.team.sgc` loads the public landing page
- [ ] `https://manage.team.sgc/admin/login` shows the login form
- [ ] Login works with admin credentials
- [ ] Dashboard, attendance, reports, members, feedback pages all load
- [ ] Member self-service works at `/member`
- [ ] Deleting a member also removes their auth account

## Troubleshooting

### 404 on API Route
Ensure the API route has `export const runtime = "edge"`. If it's missing, Cloudflare may not serve it.

### Environment Variables Not Found
In Cloudflare Pages, environment variables are injected at build time and runtime. Ensure they're added under **Production** (not just Preview).

### Build Failures
Check the build logs in Cloudflare Dashboard. Common issues:
- Missing `NEXT_PUBLIC_*` variables during build
- Unsupported Node.js version
- Dependency installation failures (try switching to npm if pnpm has issues)

### RLS Errors
If database queries fail with 403 errors, ensure the SQL from `supabase/queries-and-rls.sql` has been run in your Supabase project.
