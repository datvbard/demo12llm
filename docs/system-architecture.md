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

## Database Schema

### Overview

PostgreSQL database with 6 core models supporting multi-branch data submission, approval workflow, and dynamic template system.

### Models

#### Core Models

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `User` | Authentication & authorization | `email`, `password`, `role`, `branchId` |
| `Branch` | Branch/organization entity | `name` (unique), users, entries |
| `Template` | Dynamic form templates | `name`, fields, periods |
| `TemplateField` | Configurable form fields | `label`, `key`, `formula` |
| `Period` | Time-based collection periods | `name`, `status` (OPEN/LOCKED) |
| `Entry` | Data submission records | `status`, `submittedAt`, `confirmedAt` |
| `EntryValue` | Actual data values | `value` (Float) |

#### Enums

```typescript
enum Role {
  ADMIN    // Full system access
  BRANCH   // Branch-specific submission
}

enum EntryStatus {
  DRAFT     // Editing in progress
  SUBMITTED // Pending review
  LOCKED    // Approved/rejected, immutable
}

enum PeriodStatus {
  OPEN      // Accepting submissions
  LOCKED    // Period closed
}
```

### Key Relationships

```
Branch (1) ──< (N) User
Branch (1) ──< (N) Entry
Template (1) ──< (N) TemplateField
Template (1) ──< (N) Period
Period (1) ──< (N) Entry
Entry (1) ──< (N) EntryValue
TemplateField (1) ──< (N) EntryValue
```

### Indexes & Constraints

- **Unique constraints**: `User.email`, `Branch.name`, `Entry(periodId, branchId)`, `EntryValue(entryId, templateFieldId)`
- **Indexes**: All foreign keys, `Entry.status`, `Period.status`, `TemplateField(templateId, key)`
- **Cascade delete**: `TemplateField`, `Entry`, `EntryValue` on parent deletion

### Dynamic Fields System

- **TemplateField.key**: Unique identifier (A, B, C...) for formula references
- **TemplateField.formula**: Computed fields like `"A / B"` or `"(A - B) / B"`
- **Runtime evaluation**: Formulas computed during data export/display

### Seed Data

- 11 branches across Vietnam regions
- 12 users (1 admin, 11 branch users)
- Passwords hashed with bcryptjs (cost: 10)

## Data Flow

1. **Submission Flow**: Branch users → data submission forms → DRAFT status → SUBMITTED → admin review
2. **Approval Flow**: Admin → dashboard → review entries → approve/reject → LOCKED status
3. **Export Flow**: Approved entries → formula evaluation → Excel/PDF generation → download

## Next Steps

- Phase 03: API routes and server actions
- Phase 04: UI components with shadcn/ui
- Phase 05: Authentication with NextAuth
- Phase 06: Role-based access control
