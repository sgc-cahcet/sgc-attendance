# Architecture & Data Flow

## Overview

The SGC Attendance Management System is a single-page client-rendered Next.js 15 application backed by Supabase for authentication, database, and row-level security.

```
Browser (Client)
    │
    ├── Next.js App Router ─── Server Components (landing pages)
    │
    ├── Client Components ─── Supabase Anon Client
    │    │                         │
    │    │                         ├── Direct table queries (RLS enforced)
    │    │                         └── RPC function calls (security definer)
    │    │
    │    └── fetch() ─── /api/admin/delete-user (Edge)
    │                           │
    │                           └── Supabase Admin Client (service_role)
    │
    └── Supabase
         ├── Auth (email/password)
         ├── PostgreSQL (tables, functions, RLS)
         └── Storage (not used)
```

## Client vs Server

| Layer | Runtime | Purpose |
|---|---|---|
| **Server Components** | Node.js (build-time/SSR) | `layout.tsx`, public landing, admin portal selection |
| **Client Components** | Browser | All admin pages, member self-service |
| **API Route** | Edge Runtime | Auth user deletion (`/api/admin/delete-user`) — uses service_role key |

All admin pages are client components (`"use client"`). They directly query Supabase using the anon key, relying on RLS policies for security. The only exception is the auth user deletion endpoint, which requires the service_role key and thus must run server-side.

## Authentication Flow

```
User → /admin/login
  │
  ├── 1. supabase.auth.signInWithPassword({ email, password })
  │      └── Supabase Auth validates credentials
  │
  ├── 2. SELECT role FROM members WHERE email = ?
  │      └── RLS: members_admin_write (admin can read all)
  │
  ├── 3. Role check: ['President', 'Vice President', 'Administrator']
  │      ├── Pass → redirect to /admin/dashboard
  │      └── Fail → supabase.auth.signOut(), show error
  │
  └── 4. Each admin page re-verifies session on mount
```

## Data Flow for Key Operations

### Attendance Marking

```
Admin selects date + marks present/absent
  → Submit: supabase.rpc("record_attendance_for_date", { ... })
  → Database: deletes existing records for that date, inserts fresh
  → RPC checks: is_admin_member() at database level
  → Returns: { saved_present_count, working_day_recorded }
```

### Member Deletion

```
Admin selects members → Confirm dialog
  → 1. Fetch session IDs WHERE handler_id IN (selected)
  → 2. Fetch member emails FROM members (for auth deletion)
  → 3. DELETE FROM attendance, session_interests, session_feedback,
         push_subscriptions, notifications WHERE member_id IN (selected)
  → 4. DELETE FROM session_feedback WHERE session_id IN (affected sessions)
  → 5. DELETE FROM sessions WHERE id IN (affected sessions)
  → 6. DELETE FROM members WHERE id IN (selected)
  → 7. POST /api/admin/delete-user { emails: [...] }
       → supabaseAdmin.auth.admin.listUsers()
       → supabaseAdmin.auth.admin.deleteUser(id) for each match
```

### Report Generation

```
Admin selects month
  → supabase.rpc("get_monthly_attendance_report", { p_month_key })
  → Database: aggregates attendance per member for the month
  → Client: renders bar chart + paginated table with absent date drill-down
```

## Supabase Clients

### Anon Client (`src/lib/supabase.ts`)
- Used in all pages (browser-safe)
- Operates under the authenticated user's permissions
- RLS policies control access at row level

### Admin Client (`src/lib/supabase-admin.ts`)
- Used only in `/api/admin/delete-user`
- Uses service_role key (bypasses RLS)
- Never exposed to the browser

## Row-Level Security

RLS policies are defined in `supabase/queries-and-rls.sql` and enforced by Supabase for every query made through the anon client. The key patterns:

- **Self vs Admin**: Users can read their own data; admins can read/write all
- **Admin Write**: `FOR ALL` policies with `USING (is_admin_member())`
- **Public Access**: The `find_member_attendance_by_identifier` function is granted to `anon` for member self-service
- **Security Definer Functions**: RPCs like `record_attendance_for_date` bypass RLS but include their own admin checks

## Edge Runtime

The `POST /api/admin/delete-user` route uses Edge Runtime (`export const runtime = "edge"`) for Cloudflare Pages compatibility. It:
- Reads environment variables at runtime via `process.env`
- Uses native `fetch` (available in Edge) to call Supabase Management API
- Has no Node.js-specific dependencies
