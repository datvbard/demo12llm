# Codebase Summary

**Generated**: 2026-01-22
**Total Files**: 65+
**Total Tokens**: ~16,000

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
│   ├── error-boundary.tsx       # React error boundary (Phase 05)
│   ├── ui/
│   │   ├── loading-state.tsx    # Loading states (Phase 06)
│   │   └── error-state.tsx      # Error states (Phase 06)
│   └── customer-reports/        # Customer report components
│       ├── customer-row-card.tsx
│       ├── progress-bar.tsx     # ARIA progress bar (Phase 06)
│       ├── response-field-input.tsx  # Accessible inputs (Phase 06)
│       └── save-status-indicator.tsx # Live region states (Phase 06)
├── lib/
│   ├── api-error-handler.ts     # Centralized error handler (Phase 05)
│   ├── validation.ts            # Type-safe validation + password strength (Phase 05, 06)
│   ├── auth.ts                  # NextAuth configuration
│   ├── rate-limit.ts            # Rate limiting utility
│   ├── server-auth.ts           # requireAdmin(), requireBranch()
│   ├── excel-parser.ts          # Excel parsing with ExcelJS
│   ├── export/                  # Excel/PDF export
│   ├── validations/             # Zod schemas
│   ├── prisma.ts                # Singleton Prisma client
│   └── utils.ts                 # cn() utility
├── middleware.ts            # Rate limiting middleware
├── next.config.ts           # Next.js + CSP headers
├── prisma/
│   ├── schema.prisma        # Database schema (11 models, 5 enums)
│   └── seed.ts              # Seed script (11 branches, 12 users)
├── types/
│   └── customer-report.ts   # Customer report types (Phase 06: FieldValue type)
└── docs/                    # Documentation
```

## Core Components

### UI/UX & Accessibility (Phase 06)

**Files**:
- `components/ui/loading-state.tsx`: Loading states with ARIA attributes
- `components/ui/error-state.tsx`: Error states with retry functionality
- `components/customer-reports/progress-bar.tsx`: Accessible progress bar
- `components/customer-reports/response-field-input.tsx`: ARIA-labeled form inputs
- `components/customer-reports/save-status-indicator.tsx`: Live region save states
- `lib/validation.ts`: Password strength validation with Vietnamese labels
- `types/customer-report.ts`: FieldValue type for flexible form values

**Features**:
- ARIA labels on all form inputs (`aria-label`, `htmlFor`)
- Live regions for dynamic content (`aria-live="polite"`, `aria-live="assertive"`)
- Progress bar with `role="progressbar"` and value attributes
- Screen reader-only text (`sr-only`) for icon-only buttons
- Password strength: 0-4 score with Vietnamese labels
- NaN validation in number inputs
- Vietnamese language support throughout
- Dark mode support

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

1. **Accessibility First**: ARIA labels, live regions, keyboard navigation
2. **Centralized Error Handling**: `handleApiError()` across all API routes
3. **Type-Safe Validation**: UUID, email, password validation with Zod
4. **React Error Boundary**: Catches runtime errors gracefully
5. **Loading/Error States**: Consistent UI components with ARIA attributes
6. **Vietnamese Language**: All UI text and validation messages
7. **Singleton Prisma Client**: Prevents multiple connections
8. **Server Actions**: Enabled for form submissions
9. **CSS Variables**: Theme system for consistent styling
10. **Enum-driven Status**: Type-safe state management
11. **Transaction-based Updates**: Prevents race conditions
12. **NaN Prevention**: Validates number inputs before state updates

## Completed Phases

- ✅ Phase 01: Project Setup
- ✅ Phase 02: Database Schema
- ✅ Phase 03: API Routes & Server Actions
- ✅ Phase 04: Critical Security Hardening
- ✅ Phase 05: Error Handling & Type Safety
- ✅ Phase 06: UI/UX & Accessibility Improvements

## Next Implementation Phases

1. **Phase 07**: Logging & Monitoring
2. **Phase 08**: UI Improvements (forms, tables, dashboards)
3. **Phase 09**: Testing & Optimization

## Technical Debt

- [ ] No structured logging system
- [ ] No error monitoring integration (Sentry)
- [ ] No request tracing
- [ ] Additional UI components needed (auth pages, dashboards)
