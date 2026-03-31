# ProjectHub - Project Management SaaS

A production-grade, multi-tenant Project Management SaaS application built with Next.js 14, TypeScript, Tailwind CSS, Clerk authentication, and Prisma.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth**: Clerk v5
- **Database**: PostgreSQL via Prisma ORM (v7 with pg adapter)
- **Validation**: Zod v4
- **Charts**: Recharts

## Features

- 🔐 **Multi-tenant architecture** with organization-scoped data
- 👥 **Role-based access control** (Owner, Admin, Member, Viewer)
- 📊 **Analytics dashboard** with task completion charts
- 📁 **Project management** with archive support
- ✅ **Task tracking** with status, priority, and due dates
- 📧 **Team invitations** via shareable links (7-day expiry)

## Getting Started

### 1. Clone and install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your Clerk and database credentials:
- Get Clerk keys from [clerk.com](https://clerk.com)
- Set up a PostgreSQL database

### 3. Set up the database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── org/[orgId]/       # Organization-scoped pages
│   ├── dashboard/         # Root dashboard (redirects)
│   ├── onboarding/        # Org creation
│   ├── sign-in/           # Auth pages
│   └── sign-up/
├── components/            # React components
│   ├── dashboard/         # Analytics components
│   ├── projects/          # Project management
│   ├── tasks/             # Task management
│   ├── members/           # Member management
│   └── invite/            # Invitation flow
└── lib/                   # Utilities
    ├── prisma.ts          # Prisma client (with pg adapter)
    ├── rbac.ts            # Role-based access control (server)
    ├── rbac-utils.ts      # RBAC helpers (client-safe)
    └── utils.ts           # Utility functions
```

## RBAC Roles

| Role    | Permissions                                      |
|---------|--------------------------------------------------|
| Owner   | Full access including org settings               |
| Admin   | Manage members, projects, tasks                  |
| Member  | Create and manage tasks and projects             |
| Viewer  | Read-only access                                 |

## Notes

- Uses Prisma v7 with `@prisma/adapter-pg` for PostgreSQL connectivity
- Uses Zod v4 (`.issues` instead of `.errors` on ZodError)
- Clerk middleware uses `auth()` (function call) to get auth object with `.protect()`
