<div align="center">
  <img src="/logo.png" alt="SGC Logo" width="120" />
  <h1 align="true">SGC Attendance Management System</h1>
  <p align="true">Students Guidance Cell — CAHCET</p>
  <p>
    <a href="https://github.com/sgc-cahcet/sgc-attendance/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" />
    </a>
    <a href="https://nextjs.org/">
      <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js 15" />
    </a>
    <a href="https://supabase.com/">
      <img src="https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    </a>
    <a href="https://cloudflare.com/">
      <img src="https://img.shields.io/badge/Cloudflare-F38020?logo=cloudflare&logoColor=white" alt="Deployed on Cloudflare" />
    </a>
  </p>
</div>

A comprehensive attendance and session management system built for the **Students Guidance Cell (SGC)** at **CAHCET**. Manage members, track attendance, handle session feedback, and generate reports — all with a clean, admin-friendly interface.

**Live:** [https://manage.team.sgc](https://manage.team.sgc)

---

## Features

- **Member Management** — Add, edit, delete members with cascading cleanup (attendance, sessions, notifications, auth accounts)
- **Daily Attendance** — Mark attendance per date with academic year grouping, bulk actions, and WhatsApp summary sharing
- **Monthly Reports** — Bar charts, searchable tables, absent date drill-down, and below-75% alerts
- **Session Management** — Track session interests, collect feedback, and manage session data
- **Feedback Management** — View, filter, and respond to website feedback submissions
- **Member Self-Service** — Members can look up their own attendance records by email or mobile
- **Role-Based Access** — President, Vice President, Administrator, and Session Incharge roles
- **Row-Level Security** — Supabase RLS ensures data isolation and authorization at the database level

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS, Radix UI |
| **Charts** | Recharts |
| **Backend / Database** | Supabase (PostgreSQL, Auth, RLS) |
| **Icons** | Lucide React |
| **Deployment** | Cloudflare Pages |
| **Package Manager** | pnpm |

## Project Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── attendance/       # Daily attendance marking
│   │   ├── dashboard/        # Admin hub
│   │   ├── feedback/         # Feedback management
│   │   ├── login/            # Admin authentication
│   │   ├── members/          # Member CRUD
│   │   ├── reports/          # Monthly attendance reports
│   │   └── page.tsx          # Admin portal
│   ├── api/admin/delete-user # Auth user deletion (Edge)
│   ├── member/               # Member self-service
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Public landing
├── components/               # Reusable UI components
└── lib/                      # Supabase clients
supabase/
└── queries-and-rls.sql       # Database schema & RLS policies
```

## Getting Started

### Prerequisites

- Node.js ^18.18.0
- pnpm
- A Supabase project

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Installation

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Setup

Run the SQL in [`supabase/queries-and-rls.sql`](supabase/queries-and-rls.sql) against your Supabase project's SQL Editor. This creates all tables, indexes, functions, and RLS policies.

## Deployment

This project is designed for **Cloudflare Pages** via the Next.js integration.

1. Push to GitHub
2. Connect your repository in Cloudflare Pages
3. Set build command: `pnpm install && pnpm build`
4. Set build output: `.next`
5. Add the three environment variables in Cloudflare dashboard
6. Deploy

> All API routes use the Edge runtime for Cloudflare compatibility.

## Documentation

Detailed documentation is available in the [`docs/`](docs/) directory:

- [Architecture & Data Flow](docs/architecture.md)
- [Setup Guide](docs/setup.md)
- [Database Schema & RLS](docs/database.md)
- [Deployment Guide](docs/deployment.md)

## License

MIT — see [LICENSE](LICENSE).

## Contributors

Built and maintained by the **Students Guidance Cell** at **CAHCET**.
