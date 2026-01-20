# Project Changelog

## [Unreleased]

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
