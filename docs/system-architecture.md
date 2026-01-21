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
| Utils | bcrypt, exceljs, jspdf | Security, export, PDF, Excel parsing |

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
│   ├── utils.ts          # cn() helper for Tailwind
│   ├── auth.ts           # NextAuth configuration
│   ├── rate-limit.ts     # Rate limiting utility
│   ├── server-auth.ts    # requireAdmin(), requireBranch()
│   └── validations/      # Zod schemas
├── middleware.ts         # Rate limiting middleware
├── next.config.ts        # Next.js + CSP headers
├── prisma/              # Database schema
│   └── schema.prisma    # Prisma schema
├── docs/                # Documentation
└── plans/              # Implementation plans
```

## Key Architectural Patterns

### 1. Error Handling & Type Safety (Phase 05)

**Centralized Error Handler** (`lib/api-error-handler.ts`):
- Standardized error codes across all API routes
- Environment-aware responses (detailed in dev, generic in prod)
- Prisma error type detection (P2025, P2002, P2003)
- Type-safe error responses with `ApiErrorResponse` interface

**Validation Utilities** (`lib/validation.ts`):
- UUID v4 validation with Zod schemas
- Email, username, password, and pagination validators
- Helper functions: `validateUUID()`, `validateUUIDOrThrow()`
- Password strength validation with Vietnamese labels (`getPasswordStrength()`, `getPasswordStrengthLabel()`)
- Strong password schema: 8+ chars, uppercase, lowercase, number, special char

**React Error Boundary** (`components/error-boundary.tsx`):
- Catches runtime errors in React components
- Vietnamese fallback UI with reload button
- Optional custom error handlers
- HOC wrapper: `withErrorBoundary(Component, fallback)`

**Error Response Format**:
```typescript
{
  error: string           // User-friendly message
  code?: ApiErrorCode     // UNAUTHORIZED, FORBIDDEN, NOT_FOUND, VALIDATION_ERROR, CONFLICT, INTERNAL_ERROR
  details?: unknown       // Development-only (stack traces)
}
```

**Race Condition Prevention**:
- Transaction-based updates in `app/api/entries/[entryId]/route.ts`
- Atomic upsert with timestamp update
- Prevents concurrent update conflicts

### 2. UI/UX & Accessibility (Phase 06)

**Loading State Component** (`components/ui/loading-state.tsx`):
- `LoadingState` - Full-page loading with spinner and message
- `LoadingSpinner` - Inline spinner for buttons/forms
- ARIA attributes: `role="status"`, `aria-live="polite"`, `aria-busy="true"`
- Screen reader-only text for accessibility
- Size variants: sm, md, lg
- Vietnamese messages: "Đang tải..."

**Error State Component** (`components/ui/error-state.tsx`):
- `ErrorState` - Full-page error display with retry button
- `InlineError` - Form field error messages
- ARIA attributes: `role="alert"`, `aria-live="assertive"`
- Keyboard navigation support
- Customizable retry functionality

**Accessibility Standards**:
- ARIA labels on all form inputs (`aria-label`, `htmlFor` associations)
- Live regions for dynamic content:
  - `aria-live="polite"` for loading/progress updates
  - `aria-live="assertive"` for errors
- Progress bar with `role="progressbar"` and value attributes
- Save status indicator with live regions for state changes
- Response field inputs with ARIA labels for all types

**Type Safety**:
- `FieldValue` type: `string | number | boolean | null` for flexible field values
- NaN validation in number inputs to prevent invalid state
- Consistent typing across all form components

**Vietnamese Language Support**:
- All UI labels and messages in Vietnamese
- Password validation messages: "Phải chứa ít nhất 1 chữ hoa", etc.
- Password strength labels: "Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"
- Loading/error messages: "Đang tải...", "Thử lại", etc.

### 3. Security Layers

**Rate Limiting** (`middleware.ts`, `lib/rate-limit.ts`):
- In-memory rate limiting: 100 requests/minute per IP
- IP detection from `x-forwarded-for` or `x-real-ip` headers
- Automatic cleanup of expired entries
- Returns 429 status with `Retry-After` header

**CSRF Protection** (`lib/auth.ts`):
- NextAuth cookies configured with `sameSite: 'lax'`
- `httpOnly: true` prevents XSS access
- `secure: true` in production for HTTPS-only

**CSP Headers** (`next.config.ts`):
- Content-Security-Policy restricts resource loading
- Strict-Transport-Security (HSTS) with 2-year max-age
- X-Frame-Options: SAMEORIGIN prevents clickjacking
- X-Content-Type-Options: nosniff prevents MIME sniffing

**Error Handling** (API routes):
- Try-catch blocks prevent stack trace exposure
- Generic client error messages
- Detailed server-side logging for debugging
- Prisma error type detection

### 3. Singleton Prisma Client

`lib/prisma.ts` exports a singleton PrismaClient instance to prevent multiple connections in development.

### 4. Server Actions

Enabled in `next.config.ts` with `allowedOrigins` for localhost and Vercel deployments.

### 5. Path Aliases

`@/*` maps to project root for clean imports.

### 6. CSS Variables

shadcn/ui theme system using HSL color variables in `app/globals.css`.

## Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js config + server actions + CSP headers |
| `middleware.ts` | Rate limiting for all API routes |
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

PostgreSQL database with 11 core models supporting multi-branch data submission, approval workflow, dynamic template system, and customer report Excel upload feature.

### Models

#### Core Models

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `User` | Authentication & authorization | `email`, `password`, `role`, `branchId` |
| `Branch` | Branch/organization entity | `name` (unique), users, entries, rows |
| `Template` | Dynamic form templates | `name`, fields, periods |
| `TemplateField` | Configurable form fields | `label`, `key`, `formula` |
| `Period` | Time-based collection periods | `name`, `status` (OPEN/LOCKED) |
| `Entry` | Data submission records | `status`, `submittedAt`, `confirmedAt` |
| `EntryValue` | Actual data values | `value` (Float) |
| `ReportTemplate` | Customer report templates | `name`, fields, reports |
| `ReportResponseField` | Response field definitions | `label`, `key`, `type`, `options` |
| `CustomerReport` | Uploaded Excel reports | `name`, `templateId`, `status`, `branchColumn` |
| `CustomerRow` | Customer data rows | `branchId`, `rowIndex`, `customerData` |
| `CustomerRowResponse` | Field responses per row | `fieldKey`, `value`, `updatedBy` |

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

enum ResponseFieldType {
  DROPDOWN  // Select from predefined options
  TEXT      // Free text input
  NUMBER    // Numeric input
  DATE      // Date picker
  CHECKBOX  // Boolean checkbox
}

enum CustomerReportStatus {
  OPEN      // Accepting responses
  LOCKED    // Report closed
}
```

### Key Relationships

```
// Data submission flow
Branch (1) ──< (N) User
Branch (1) ──< (N) Entry
Template (1) ──< (N) TemplateField
Template (1) ──< (N) Period
Period (1) ──< (N) Entry
Entry (1) ──< (N) EntryValue
TemplateField (1) ──< (N) EntryValue

// Customer report flow
ReportTemplate (1) ──< (N) ReportResponseField
ReportTemplate (1) ──< (N) CustomerReport
CustomerReport (1) ──< (N) CustomerRow
CustomerRow (1) ──< (N) CustomerRowResponse
Branch (1) ──< (N) CustomerRow (optional)
```

### Indexes & Constraints

- **Unique constraints**: `User.email`, `Branch.name`, `Entry(periodId, branchId)`, `EntryValue(entryId, templateFieldId)`, `CustomerRow(reportId, rowIndex)`, `CustomerRowResponse(rowId, fieldKey)`
- **Indexes**: All foreign keys, `Entry.status`, `Period.status`, `TemplateField(templateId, key)`, `CustomerReport.status`, `CustomerRow.branchId`
- **Cascade delete**: `TemplateField`, `Entry`, `EntryValue`, `ReportResponseField`, `CustomerReport`, `CustomerRow`, `CustomerRowResponse` on parent deletion

### Dynamic Fields System

- **TemplateField.key**: Unique identifier (A, B, C...) for formula references
- **TemplateField.formula**: Computed fields like `"A / B"` or `"(A - B) / B"`
- **Runtime evaluation**: Formulas computed during data export/display

### Customer Report System

- **ReportTemplate**: Defines response fields for customer data
- **ResponseFieldType**: DROPDOWN, TEXT, NUMBER, DATE, CHECKBOX
- **CustomerReport**: Uploaded Excel with branch column mapping
- **CustomerRow**: Individual row with branch association (optional)
- **CustomerRowResponse**: Per-row field responses
- **Excel column mapping**: `branchColumn` identifies branch for each row
- **Flexible data**: `customerData` JSON stores raw Excel data

### Seed Data

- 11 branches across Vietnam regions
- 12 users (1 admin, 11 branch users)
- Passwords hashed with bcryptjs (cost: 10)

## Data Flow

1. **Submission Flow**: Branch users → data submission forms → DRAFT status → SUBMITTED → admin review
2. **Approval Flow**: Admin → dashboard → review entries → approve/reject → LOCKED status
3. **Export Flow**: Approved entries → formula evaluation → Excel/PDF generation → download
4. **Customer Report Flow**: Admin upload Excel → parse rows → map branches → branch users fill responses → submit

## API Routes

### Customer Report API Routes (Phase 02)

#### Admin Routes

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/admin/report-templates` | GET | List templates (paginated, searchable) | Admin |
| `/api/admin/report-templates` | POST | Create template | Admin |
| `/api/admin/report-templates/[id]` | GET | Get template details | Admin |
| `/api/admin/report-templates/[id]` | PATCH | Update template | Admin |
| `/api/admin/report-templates/[id]` | DELETE | Delete template | Admin |
| `/api/admin/report-templates/[id]/fields` | GET | List template fields | Admin |
| `/api/admin/report-templates/[id]/fields` | POST | Create response field | Admin |
| `/api/admin/report-templates/[id]/fields/[fieldId]` | PATCH | Update field | Admin |
| `/api/admin/report-templates/[id]/fields/[fieldId]` | DELETE | Delete field | Admin |
| `/api/admin/report-templates/[id]/fields/reorder` | PATCH | Reorder fields | Admin |
| `/api/admin/customer-reports` | GET | List reports (paginated, filterable) | Admin |
| `/api/admin/customer-reports` | POST | Upload Excel + create report | Admin |
| `/api/admin/customer-reports/[id]` | GET | Get report details | Admin |
| `/api/admin/customer-reports/[id]` | PATCH | Update report status | Admin |
| `/api/admin/customer-reports/[id]` | DELETE | Delete report | Admin |
| `/api/admin/customer-reports/[id]/export/excel` | GET | Export to Excel | Admin |
| `/api/admin/customer-reports/[id]/export/pdf` | GET | Export to PDF | Admin |

#### Branch Routes

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/customer-reports` | GET | List accessible reports | Branch |
| `/api/customer-reports/[id]` | GET | Get report with branch rows | Branch |
| `/api/customer-reports/[id]/rows/[rowId]` | PATCH | Update row responses | Branch |

### Request/Response Schemas

#### ReportTemplate
```typescript
{
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  fields: ReportResponseField[]
}
```

#### ReportResponseField
```typescript
{
  id: string
  label: string
  key: string  // lowercase letters, numbers, underscores
  type: 'DROPDOWN' | 'TEXT' | 'NUMBER' | 'DATE' | 'CHECKBOX'
  options?: string[]  // for DROPDOWN
  required: boolean
  order: number
}
```

#### CustomerReport
```typescript
{
  id: string
  name: string
  templateId: string
  branchColumn: string  // Excel column name
  columns: Array<{key, label, type}>
  status: 'OPEN' | 'LOCKED'
  uploadedBy: string
  createdAt: Date
}
```

#### CustomerRow
```typescript
{
  id: string
  reportId: string
  branchId?: string
  rowIndex: number
  customerData: Record<string, any>
  responses: CustomerRowResponse[]
}
```

### Validation Rules

**File Upload:**
- Max size: 10MB
- Formats: `.xlsx`, `.xls`
- Required fields: `name`, `templateId`, `branchColumn`, `file`

**Field Key:**
- Must start with lowercase letter
- Only lowercase letters, numbers, underscores
- Max 50 characters

**Response Updates:**
- Only OPEN reports accept updates
- Branch users can only update their assigned rows

### Excel Processing Flow

1. Parse Excel file → extract headers + rows
2. Validate branch column exists
3. Map branch names to IDs (exact match, case-insensitive)
4. Return error if any branches unmapped
5. Create report + rows in transaction
6. Skip empty rows automatically

### Export Features

**Excel Export:**
- Original customer data columns
- Branch name column
- Response field columns (formatted by type)
- Checkbox: `✓` or empty
- Dropdown: Label from options

## Next Steps

- Phase 03: UI components with shadcn/ui
- Phase 04: Authentication with NextAuth
- Phase 05: Role-based access control
