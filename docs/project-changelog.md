# Project Changelog

## [Unreleased]

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
