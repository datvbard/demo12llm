# Codebase Summary

**Generated**: 2026-01-20
**Total Files**: 7
**Total Tokens**: 2,701

## Project Structure

```
branch-data-approval-system/
├── app/
│   ├── globals.css        # Tailwind + shadcn/ui theme variables
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Home page (under construction)
├── components/
│   └── ui/               # shadcn/ui components (empty, to be added)
├── lib/
│   ├── prisma.ts         # Singleton Prisma client
│   └── utils.ts          # cn() utility for class merging
├── prisma/
│   ├── schema.prisma     # Database schema (6 models, 3 enums)
│   └── seed.ts           # Seed script (11 branches, 12 users)
└── docs/                 # Documentation
```

## Core Components

### Database (Prisma + PostgreSQL)

**File**: `prisma/schema.prisma` (28.9% of codebase)

**Models**:
- `User`: Authentication with role-based access (ADMIN/BRANCH)
- `Branch`: Organization entity
- `Template`: Dynamic form templates
- `TemplateField`: Configurable fields with formula support
- `Period`: Time-based submission periods
- `Entry`: Data submission records (DRAFT → SUBMITTED → LOCKED)
- `EntryValue`: Actual data values

**Key Features**:
- Unique constraints on email, branch name
- Cascade delete for related records
- Indexes on foreign keys and status fields
- Dynamic formula evaluation system (A/B, (A-B)/B)

### Authentication Setup

**Dependencies**: `next-auth@^4.24.10`, `bcryptjs@^2.4.3`

**Files**:
- `lib/prisma.ts`: Singleton pattern prevents dev connection issues
- `prisma/seed.ts`: 11 branches + 12 users with bcrypt hashing

**Environment Variables**:
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
```

### UI Framework

**Styling**: Tailwind CSS + shadcn/ui
**File**: `app/globals.css` (25.7% of codebase)

Features:
- CSS variables for theming (HSL color system)
- Dark mode support
- Responsive design utilities

### Application Structure

**Next.js 15** with App Router:
- Server Actions enabled in `next.config.ts`
- TypeScript strict mode
- Path aliases (`@/*`)

## Key Patterns

1. **Singleton Prisma Client**: Prevents multiple connections
2. **Server Actions**: Enabled for form submissions
3. **CSS Variables**: Theme system for consistent styling
4. **Enum-driven Status**: Type-safe state management

## Next Implementation Phases

1. **Phase 03**: API routes and server actions
2. **Phase 04**: UI components (forms, tables, dashboards)
3. **Phase 05**: NextAuth.js integration
4. **Phase 06**: Role-based access control

## Technical Debt

- [ ] No API routes yet
- [ ] No authentication implementation
- [ ] No UI components built
- [ ] No error handling patterns
- [ ] No logging system
