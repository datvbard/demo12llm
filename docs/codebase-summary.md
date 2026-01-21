# Codebase Summary

**Generated**: 2026-01-21
**Total Files**: 60+
**Total Tokens**: ~15,000

## Project Structure

```
branch-data-approval-system/
├── app/
│   ├── api/               # API routes (customer reports, admin, entries)
│   ├── admin/             # Admin pages (templates, reports)
│   ├── customer-reports/  # Branch pages (view, update)
│   ├── globals.css        # Tailwind + shadcn/ui theme variables
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Home page
├── components/
│   ├── error-boundary.tsx # React error boundary (Phase 05)
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── api-error-handler.ts # Centralized error handler (Phase 05)
│   ├── validation.ts        # Type-safe validation (Phase 05)
│   ├── auth.ts              # NextAuth configuration
│   ├── rate-limit.ts        # Rate limiting utility
│   ├── server-auth.ts       # requireAdmin(), requireBranch()
│   ├── excel-parser.ts      # Excel parsing with ExcelJS
│   ├── export/              # Excel/PDF export
│   ├── validations/         # Zod schemas
│   ├── prisma.ts            # Singleton Prisma client
│   └── utils.ts             # cn() utility
├── middleware.ts            # Rate limiting middleware
├── next.config.ts           # Next.js + CSP headers
├── prisma/
│   ├── schema.prisma        # Database schema (11 models, 5 enums)
│   └── seed.ts              # Seed script (11 branches, 12 users)
├── types/                   # TypeScript types
└── docs/                    # Documentation
```

## Core Components

### Error Handling & Type Safety (Phase 05)

**Files**:
- `lib/api-error-handler.ts`: Centralized API error handler with type safety
- `lib/validation.ts`: Type-safe validation utilities (UUID, email, password, pagination)
- `components/error-boundary.tsx`: React error boundary with Vietnamese fallback UI

**Features**:
- Standardized error codes (UNAUTHORIZED, FORBIDDEN, NOT_FOUND, VALIDATION_ERROR, CONFLICT, INTERNAL_ERROR)
- Environment-aware responses (detailed in dev, generic in prod)
- Prisma error type detection (P2025, P2002, P2003)
- UUID validation with Zod schemas
- React error boundary with custom fallbacks

### Database (Prisma + PostgreSQL)

**File**: `prisma/schema.prisma`

**Models**:
- Core: `User`, `Branch`, `Template`, `TemplateField`, `Period`, `Entry`, `EntryValue`
- Customer Reports: `ReportTemplate`, `ReportResponseField`, `CustomerReport`, `CustomerRow`, `CustomerRowResponse`

**Key Features**:
- Unique constraints on email, branch name
- Cascade delete for related records
- Indexes on foreign keys and status fields
- Dynamic formula evaluation system
- JSON fields for flexible data storage

### Authentication & Security

**Dependencies**: `next-auth@^4.24.10`, `bcryptjs@^2.4.3`

**Files**:
- `lib/auth.ts`: NextAuth configuration with secure cookies
- `lib/server-auth.ts`: `requireAdmin()`, `requireBranch()` helpers
- `lib/rate-limit.ts`: In-memory rate limiting (100 req/min)
- `middleware.ts`: Rate limiting middleware for API routes

**Security Headers** (CSP, HSTS, X-Frame-Options, etc.)

### API Routes

**30+ API routes** with standardized error handling:
- Admin: templates, reports, entries
- Branch: customer reports, entries
- All routes use `handleApiError()` for consistent error responses

### UI Framework

**Styling**: Tailwind CSS + shadcn/ui
**File**: `app/globals.css`

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

1. **Centralized Error Handling**: `handleApiError()` across all API routes
2. **Type-Safe Validation**: UUID, email, password validation with Zod
3. **React Error Boundary**: Catches runtime errors gracefully
4. **Singleton Prisma Client**: Prevents multiple connections
5. **Server Actions**: Enabled for form submissions
6. **CSS Variables**: Theme system for consistent styling
7. **Enum-driven Status**: Type-safe state management
8. **Transaction-based Updates**: Prevents race conditions

## Completed Phases

- ✅ Phase 01: Project Setup
- ✅ Phase 02: Database Schema
- ✅ Phase 03: API Routes & Server Actions
- ✅ Phase 04: Critical Security Hardening
- ✅ Phase 05: Error Handling & Type Safety

## Next Implementation Phases

1. **Phase 06**: Logging & Monitoring
2. **Phase 07**: UI Improvements (forms, tables, dashboards)
3. **Phase 08**: Testing & Optimization

## Technical Debt

- [ ] No structured logging system
- [ ] No error monitoring integration (Sentry)
- [ ] No request tracing
- [ ] Limited UI components
