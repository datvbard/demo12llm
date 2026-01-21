# Project Changelog

## [Unreleased]

### Added - Phase 05: Error Handling & Type Safety (2026-01-21)

**Error Handling System**
- `lib/api-error-handler.ts` - Centralized API error handler with type safety
- `lib/validation.ts` - Type-safe validation utilities (UUID, email, password, pagination)
- `components/error-boundary.tsx` - React error boundary with Vietnamese fallback UI

**Error Handler Features**
- Standardized error codes: UNAUTHORIZED, FORBIDDEN, NOT_FOUND, VALIDATION_ERROR, CONFLICT, INTERNAL_ERROR
- Environment-aware responses (detailed in dev, generic in prod)
- Prisma error type detection (P2025, P2002, P2003)
- Type-safe error responses with `ApiErrorResponse` interface
- Helper functions: `handleApiError()`, `validationError()`, `notFoundError()`

**Validation Utilities**
- UUID v4 schema validator with `validateUUID()` and `validateUUIDOrThrow()`
- Email, username, password, and pagination schemas
- Zod-based validation with clear error messages

**Race Condition Fix**
- `app/api/entries/[entryId]/route.ts` - Transaction-based entry updates
- Atomic upsert with timestamp update prevents concurrent conflicts

**Type Safety Improvements**
- Error typing fixes across 30 API routes
- UUID validation in all parameterized routes
- Consistent error response format
- Proper TypeScript types for all error handlers

**Error Response Format**:
```typescript
{
  error: string           // User-friendly message
  code?: ApiErrorCode     // Standardized error code
  details?: unknown       // Development-only details (stack traces)
}
```

### Added - Phase 01: Critical Security Hardening (2026-01-21)

**Security Implementations**
- `lib/rate-limit.ts` - In-memory rate limiting utility
- `middleware.ts` - Rate limiting middleware (100 req/min)
- Error handling in `app/api/admin/entries/[id]/confirm/route.ts`
- CSRF protection in `lib/auth.ts` (SameSite=lax cookies)
- CSP headers in `next.config.ts` (Content-Security-Policy)

**Security Headers Added**
- Content-Security-Policy (default-src 'self', script-src 'self' 'unsafe-eval' 'unsafe-inline')
- Strict-Transport-Security (max-age=63072000; includeSubDomains)
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: geolocation=(), microphone=(), camera=()

**Rate Limiting**
- 100 requests per minute per IP
- Automatic cleanup of expired entries
- 429 response with Retry-After header
- IP detection from x-forwarded-for/x-real-ip headers

**Error Handling**
- Try-catch blocks in API routes
- Generic client error messages
- Detailed server-side logging
- Prisma error type detection

### Added - Phase 05: Customer Report Export Feature (2026-01-21)

**Export Implementations**
- `lib/export/excel.ts` - Excel export with ExcelJS (merged data + responses)
- `lib/export/pdf.ts` - PDF export with jsPDF + autoTable
- Format: title row, date row, styled headers, data rows
- Checkbox: "Có"/"Không", Date: dd/MM/yyyy, Number: locale format
- Empty values: "(chưa điền)"

**API Routes**
- `/api/admin/customer-reports/[id]/export/excel` - Excel download
- `/api/admin/customer-reports/[id]/export/pdf` - PDF download
- Content-Type headers for proper browser download

### Added - Phase 04: Customer Report Branch UI (2026-01-21)

**Branch Pages**
- `/app/customer-reports/page.tsx` - List branch-assigned reports
- `/app/customer-reports/[id]/page.tsx` - Fill responses form
- Branch filtering: only show rows for logged-in user's branch
- Progress tracking: filled/total rows with percentage

**Components**
- `CustomerRowCard` - Per-row response form with dynamic fields
- `ResponseFieldInput` - Type-specific inputs (dropdown/text/number/date/checkbox)
- `ProgressBar` - Visual progress indicator
- `SaveStatus` - Auto-save feedback (saving/saved/error)
- Debounced auto-save (500ms delay)

**Features**
- Filter: all/incomplete rows
- Search: by customer name/CIF
- Bulk save: save all button
- Visual save status per row
- Locked reports: read-only mode

### Added - Phase 03: Customer Report Admin UI (2026-01-21)

**Admin Pages**
- `/app/admin/report-templates/page.tsx` - Template list + create
- `/app/admin/report-templates/[id]/page.tsx` - Edit template + manage fields
- `/app/admin/customer-reports/page.tsx` - Report list + upload
- `/app/admin/customer-reports/[id]/page.tsx` - View rows + export

**Components**
- `TemplateForm` - Create/edit templates
- `FieldEditor` - Add/edit response fields
- `ReportUpload` - Excel file upload with validation
- `CustomerReportTable` - View all rows with responses

**Features**
- Dynamic field types: dropdown, text, number, date, checkbox
- Field reordering with drag-drop (up/down buttons)
- Excel preview before upload
- Response statistics (filled/total)
- Export buttons (Excel, PDF)

### Added - Phase 02: Customer Report API Routes (2026-01-21)

**Admin API Routes**
- `/api/admin/report-templates` - CRUD operations for report templates
- `/api/admin/report-templates/[id]/fields` - Response field management
- `/api/admin/report-templates/[id]/fields/[fieldId]` - Field update/delete
- `/api/admin/report-templates/[id]/fields/reorder` - Batch field reordering
- `/api/admin/customer-reports` - Excel upload, report CRUD, listing
- `/api/admin/customer-reports/[id]/export/excel` - Excel export with responses
- `/api/admin/customer-reports/[id]/export/pdf` - PDF export

**Branch API Routes**
- `/api/customer-reports` - List accessible reports
- `/api/customer-reports/[id]` - Get report with branch-specific rows
- `/api/customer-reports/[id]/rows/[rowId]` - Update row responses

**Validation & Processing**
- `lib/validations/customer-report.ts` - Zod schemas for all operations
- `lib/excel-parser.ts` - Excel parsing with ExcelJS
- Branch mapping: exact match (case-insensitive)
- File validation: 10MB limit, `.xlsx`/`.xls` formats
- Field key validation: lowercase + underscores, max 50 chars

**Export Features**
- Excel export combines original data + branch + responses
- Checkbox formatted as `✓`/empty
- Dropdown displays option labels

### Added - Phase 01: Customer Report Database Schema (2026-01-21)

**Database Models**
- ResponseFieldType enum (DROPDOWN, TEXT, NUMBER, DATE, CHECKBOX)
- CustomerReportStatus enum (OPEN, LOCKED)
- ReportTemplate model for customer report templates
- ReportResponseField model for dynamic response field definitions
- CustomerReport model for uploaded Excel reports
- CustomerRow model for customer data with branch mapping
- CustomerRowResponse model for per-row field responses
- Branch model updated with rows relation

**Database Features**
- Branch-column mapping for Excel upload
- Optional branch association per row
- JSON storage for flexible customer data
- Cascade delete fixes (CustomerReport.template, CustomerRow.branch)

**TypeScript Types**
- types/customer-report.ts with all interfaces
- Form input types (CreateReportTemplateInput, CreateCustomerReportInput)
- Excel parsing types (ExcelRowData, ParsedExcelResult)
- Field option types for dropdown/checkbox

**Schema Enhancements**
- ReportResponseField.options as Json for flexible field config
- CustomerRow.customerData as Json for raw Excel data
- CustomerRowResponse.value as Json for type-flexible responses

### Added - Phase 02: Database Schema (2026-01-20)

**Database Models**
- User model with authentication (email, password, role, branchId)
- Branch model for organization entities
- Template model for dynamic form templates
- TemplateField model with formula support (A/B, (A-B)/B)
- Period model for time-based submission windows
- Entry model with status workflow (DRAFT → SUBMITTED → LOCKED)
- EntryValue model for actual data storage

**Enums**
- Role: ADMIN, BRANCH
- EntryStatus: DRAFT, SUBMITTED, LOCKED
- PeriodStatus: OPEN, LOCKED

**Database Features**
- Unique constraints (email, branch name, entry per period/branch)
- Indexes on all foreign keys and status fields
- Cascade delete for related records
- Dynamic formula evaluation system

**Seed Data**
- 11 branches across Vietnam regions
- 12 users (1 admin + 11 branch users)
- Password hashing with bcryptjs (cost: 10)

**Dependencies**
- `@prisma/client@^6.1.0`
- `bcryptjs@^2.4.3`
- `ts-node@^10.9.2`

**Scripts**
- `prisma:seed`: Seed database with initial data

### Added - Phase 01: Project Setup (2026-01-20)

**Project Initialization**
- Next.js 15 with App Router
- TypeScript 5 with strict mode
- Tailwind CSS + shadcn/ui
- Prisma ORM with PostgreSQL
- NextAuth.js 4 for authentication

**Configuration Files**
- `next.config.ts`: Server actions enabled
- `tsconfig.json`: TypeScript strict mode + path aliases
- `tailwind.config.ts`: shadcn/ui theme
- `eslint.config.mjs`: Next.js + Prettier rules
- `.env.example`: Environment variable template

**Utilities**
- `lib/prisma.ts`: Singleton Prisma client
- `lib/utils.ts`: cn() class merge utility

**Documentation**
- `docs/project-overview-pdr.md`: Project requirements
- `docs/code-standards.md`: Development guidelines
- `docs/system-architecture.md`: Technical architecture
