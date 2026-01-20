# System Architecture

## Project Overview

**Branch Data Collection System** - Multi-branch data submission with admin approval workflow.

Built with Next.js 15, TypeScript, Prisma, PostgreSQL, and shadcn/ui.

## Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| Framework | Next.js 15 | React framework with App Router |
| Language | TypeScript 5 | Type-safe development |
| Database | PostgreSQL + Prisma ORM | Data persistence |
| Auth | NextAuth.js 4 | Authentication |
| Styling | Tailwind CSS + shadcn/ui | UI components |
| State | TanStack Query 5 | Server state management |
| Validation | Zod 3 | Schema validation |
| Utils | bcrypt, exceljs, jspdf | Security, export, PDF |

## Project Structure

```
branch-data-approval-system/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles + CSS variables
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Home page
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility libraries
│   ├── prisma.ts         # Prisma client singleton
│   └── utils.ts          # cn() helper for Tailwind
├── prisma/              # Database schema
│   └── schema.prisma    # Prisma schema
├── docs/                # Documentation
└── plans/              # Implementation plans
```

## Key Architectural Patterns

### 1. Singleton Prisma Client

`lib/prisma.ts` exports a singleton PrismaClient instance to prevent multiple connections in development.

### 2. Server Actions

Enabled in `next.config.ts` with `allowedOrigins` for localhost and Vercel deployments.

### 3. Path Aliases

`@/*` maps to project root for clean imports.

### 4. CSS Variables

shadcn/ui theme system using HSL color variables in `app/globals.css`.

## Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js config + server actions |
| `tsconfig.json` | TypeScript strict mode |
| `tailwind.config.ts` | Tailwind + shadcn/ui theme |
| `eslint.config.mjs` | ESLint flat config (Next.js + Prettier) |
| `.gitignore` | Prisma DB patterns, env files |
| `.env.example` | Database URL, NextAuth config |

## Environment Variables

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/branch_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

## Data Flow

1. **Submission Flow**: Branch users → data submission forms → pending status → admin approval
2. **Approval Flow**: Admin → dashboard → review → approve/reject → status update
3. **Export Flow**: Approved data → Excel/PDF generation → download

## Next Steps

- Phase 02: Database schema implementation
- Phase 03: API routes and server actions
- Phase 04: UI components with shadcn/ui
- Phase 05: Authentication with NextAuth
- Phase 06: Role-based access control
