# Contributing to SGC Attendance Management System

Thank you for your interest in contributing! This document outlines the guidelines for contributing to the SGC Attendance Management System.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/sgc-attendance.git
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Create a `.env.local` file with your Supabase credentials (see [Setup Guide](docs/setup.md))
5. Start the development server:
   ```bash
   pnpm dev
   ```

## Branching Strategy

- `main` — production-ready code
- Feature branches: `feat/<short-description>`
- Fix branches: `fix/<short-description>`

Always branch off from `main` and submit PRs back to `main`.

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `test`, `style`.

Examples:
```
feat: add bulk attendance marking
fix: member deletion FK constraint violation
docs: update deployment instructions
```

## Code Style

- **TypeScript** — Strict mode, no `any` unless absolutely necessary
- **React** — Use `"use client"` only when needed (hooks, browser APIs, state)
- **Components** — Prefer smaller, focused components
- **Naming** — camelCase for variables/functions, PascalCase for components
- **Formatting** — ESLint and Prettier via `next lint`

## Pull Request Process

1. Ensure your PR description clearly describes the problem and solution
2. Test your changes thoroughly with `pnpm dev` and `pnpm build`
3. Update documentation in `docs/` if you change architecture, setup, or deployment
4. Keep PRs focused — one feature/fix per PR
5. Reference any related issues

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md). All contributors must follow it.

## Questions?

Open an issue or reach out to the SGC team.
