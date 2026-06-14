# Setup Guide

## Prerequisites

- **Node.js** ^18.18.0
- **pnpm** (recommended) or npm
- A **Supabase** project (free tier works)

## 1. Clone & Install

```bash
git clone https://github.com/sgc-cahcet/sgc-attendance.git
cd sgc-attendance
pnpm install
```

## 2. Supabase Project Setup

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a project
2. Note your **Project URL** and **anon key** from Project Settings → API

### Run Database Migrations

Open the **SQL Editor** in your Supabase dashboard and execute the entire contents of:

```
supabase/queries-and-rls.sql
```

This creates:
- All database tables (`members`, `attendance`, `sessions`, `session_feedback`, `session_interests`, `notifications`, `push_subscriptions`, `feedback`)
- Indexes for query performance
- Database functions (RPCs) for attendance management
- Row-Level Security (RLS) policies
- Function execution grants

### Enable Auth

1. Go to **Authentication → Providers**
2. Ensure **Email** provider is enabled
3. (Optional) Disable "Confirm email" for development

### Get Service Role Key

1. Go to **Project Settings → API**
2. Copy the `service_role` key (keep it secret!)

## 3. Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

> ⚠️ Never commit `.env.local`. The `SUPABASE_SERVICE_ROLE_KEY` has full admin access to your Supabase project.

## 4. Seed Data

Populate the `members` table with at least one admin user:

```sql
INSERT INTO members (name, email, role, department, academicYear)
VALUES ('Admin', 'admin@sgc.edu', 'Administrator', 'Admin', 'I');
```

Create a Supabase Auth user with the same email/password:

1. Go to **Authentication → Users**
2. Click **Add User**
3. Enter the email and a password

## 5. Run Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) and log in at `/admin/login`.

## 6. Verify Setup

- [ ] Login works at `/admin/login`
- [ ] Dashboard loads at `/admin/dashboard`
- [ ] Can add members at `/admin/members`
- [ ] Can mark attendance at `/admin/attendance`
- [ ] Reports load at `/admin/reports`
- [ ] Member self-service works at `/member`

## Common Issues

### "Member record not found" on login
The email in the `members` table must match the email used for Supabase Auth sign-in exactly.

### RLS Policy Violations
If queries fail with 403/401 errors, ensure the SQL from `queries-and-rls.sql` has been run completely.

### Attendance marking fails
Only users with role `President`, `Vice President`, or `Administrator` can mark attendance. Check the member's role in the database.
