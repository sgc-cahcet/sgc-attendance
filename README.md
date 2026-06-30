<div align="center">
  <img src="/public/logo.png" alt="SGC Logo" width="120" />
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
    <a href="https://manage.teamsgc.in">
      <img src="https://img.shields.io/badge/Deployed%20on-Cloudflare-F38020?logo=cloudflare&logoColor=white" alt="Deployed on Cloudflare" />
    </a>
  </p>
</div>

**This application is intended exclusively for Session Incharge, Administrator, President and Vice President roles. For the purpose of transparency and community collaboration, we have open-sourced this application.** 🚀

> 📖 Explore the [full documentation](docs/) for architecture, setup, database schema, and deployment details.

**Live:** [https://manage.teamsgc.in](https://manage.teamsgc.in/admin)

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

## 📖 Documentation

| What | Where |
|---|---|
| 🛠️ Setup & configuration | [docs/setup.md](./docs/setup.md) |
| 🏗️ Architecture & database | [docs/architecture.md](./docs/architecture.md) |
| 🚀 Cloudflare deployment | [docs/deployment.md](./docs/deployment.md) |
| 🤝 Contributing guide | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| 📜 Code of conduct | [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) |

---

## 🚀 Quick Start

```bash
npm install
cp .env.example .env.local   # drop in your Supabase credentials
npm run dev                   # 🎉 open http://localhost:3000
```

## License

MIT — see [LICENSE](LICENSE).

## 🌟 Meet the Contributors

[![Contributors](https://contrib.rocks/image?repo=sgc-cahcet/sgc-attendance)](https://github.com/sgc-cahcet/sgc-attendance/graphs/contributors)

**Want your picture here?** 🖼️  
Fork the repo, send a PR, and become a contributor now!  
Check out the [Contributing Guide](./CONTRIBUTING.md) to get started.

Built and maintained with ❤️ by **Student Guidance Cell — CAHCET**.
