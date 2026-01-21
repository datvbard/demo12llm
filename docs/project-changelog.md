# Project Changelog

## [Unreleased]

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
