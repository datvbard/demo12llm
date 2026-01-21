# Development Roadmap

## Project: Branch Data Collection & Approval System

**Status**: Phase 07 Complete (Testing Infrastructure)
**Last Updated**: 2026-01-22
**Overall Progress**: 70% (7/10 phases complete)

---

## Phase 01: Project Setup ✅ COMPLETE

**Status**: Complete
**Completed**: 2026-01-20

**Deliverables**:
- ✅ Next.js 15 project with App Router
- ✅ TypeScript strict mode
- ✅ Tailwind CSS + shadcn/ui
- ✅ Prisma ORM setup
- ✅ Environment configuration
- ✅ Basic documentation

---

## Phase 02: Database Schema ✅ COMPLETE

**Status**: Complete
**Completed**: 2026-01-20

**Deliverables**:
- ✅ Prisma schema with 6 models
- ✅ Enums (Role, EntryStatus, PeriodStatus)
- ✅ Relationships and indexes
- ✅ Seed script with 11 branches + 12 users
- ✅ Password hashing with bcryptjs
- ✅ Dynamic formula field system

**Success Metrics**:
- ✅ All models defined with proper relationships
- ✅ Unique constraints and indexes applied
- ✅ Seed script executes without errors
- ✅ Documentation updated

---

## Phase 03: API Routes & Server Actions ✅ COMPLETE

**Status**: Complete (Customer Report Feature done)
**Completed**: 2026-01-21

**Deliverables**:
- ✅ Customer report admin routes (templates, reports, export)
- ✅ Customer report branch routes (view, update responses)
- ✅ Excel parsing + branch mapping
- ✅ Zod validation schemas
- ✅ Export functionality (Excel + PDF)
- [ ] Entry server actions (create, update, submit) - separate feature
- [ ] Admin approval actions (approve, reject) - separate feature
- [ ] Template management endpoints (for period entries) - separate feature
- [ ] Period management (open, close) - separate feature

**Success Metrics**:
- ✅ Customer report CRUD functional
- ✅ Excel upload + parsing working
- ✅ Branch users can update responses
- ✅ Export working (Excel + PDF)

---

## Phase 04: Critical Security Hardening ✅ COMPLETE

**Status**: Complete
**Completed**: 2026-01-21

**Deliverables**:
- ✅ Rate limiting middleware (100 req/min)
- ✅ Error handling in API routes
- ✅ CSRF protection (SameSite=lax cookies)
- ✅ CSP headers configuration
- ✅ Security headers (HSTS, X-Frame-Options, X-Content-Type-Options)

**Security Measures**:
- ✅ In-memory rate limiting with cleanup
- ✅ Generic client error messages
- ✅ Server-side detailed logging
- ✅ Prisma error type detection
- ✅ IP-based rate limiting

**Success Metrics**:
- ✅ No unhandled exceptions in API routes
- ✅ Rate limit returns 429 after threshold
- ✅ Cookies have SameSite='lax'
- ✅ CSP headers configured

**Security Score**: 8/10
**Code Review**: `/plans/reports/code-reviewer-260121-2333-security-hardening-step2.md`

---

## Phase 05: Error Handling & Type Safety ✅ COMPLETE

**Status**: Complete
**Completed**: 2026-01-21

**Deliverables**:
- ✅ Centralized API error handler (`lib/api-error-handler.ts`)
- ✅ Type-safe validation utilities (`lib/validation.ts`)
- ✅ React error boundary component (`components/error-boundary.tsx`)
- ✅ Race condition fix in entry update route
- ✅ Error typing fixes across 30 API routes

**Type Safety Improvements**:
- UUID validation with Zod schemas
- Standardized error codes (UNAUTHORIZED, FORBIDDEN, NOT_FOUND, VALIDATION_ERROR, CONFLICT, INTERNAL_ERROR)
- Generic error responses with type safety
- Environment-aware error messages (development vs production)
- Prisma error type detection (P2025, P2002, P2003)

**Race Condition Fix**:
- Transaction-based entry updates (`app/api/entries/[entryId]/route.ts`)
- Atomic upsert operations with entry timestamp update
- Prevents concurrent update conflicts

**Error Response Format**:
```typescript
{
  error: string           // User-friendly message
  code?: ApiErrorCode     // Standardized error code
  details?: unknown       // Development-only details
}
```

**Success Metrics**:
- ✅ All API routes use `handleApiError()`
- ✅ UUID validation in all parameterized routes
- ✅ Error boundary wraps all page components
- ✅ Type-safe error responses
- ✅ No stack traces in production

**Security Score**: 9/10 (improved from 8/10)

---

## Phase 06: UI/UX & Accessibility Improvements ✅ COMPLETE

**Status**: Complete
**Completed**: 2026-01-22

**Deliverables**:
- ✅ Loading state component (`components/ui/loading-state.tsx`)
- ✅ Error state component (`components/ui/error-state.tsx`)
- ✅ ARIA labels and accessibility attributes across all UI components
- ✅ Password strength validation with Vietnamese labels (`lib/validation.ts`)
- ✅ Type safety improvements (`FieldValue` type in `types/customer-report.ts`)
- ✅ NaN validation in number inputs

**Accessibility Improvements**:
- ARIA labels on all form inputs (`aria-label`, `htmlFor` associations)
- Live regions for dynamic content (`aria-live="polite"`, `aria-live="assertive"`)
- Progress bar with proper ARIA attributes (`role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`)
- Screen reader-only text (`sr-only` class) for icon-only buttons
- Focus management and keyboard navigation support
- Error alerts with `role="alert"` for immediate notification
- Loading states with `role="status"` and `aria-busy`

**UI Components Added**:
- `LoadingState` - Full-page loading with spinner and message
- `LoadingSpinner` - Inline loading spinner for buttons/forms
- `ErrorState` - Full-page error display with retry option
- `InlineError` - Form field error messages

**Type Safety & Validation**:
- `FieldValue` type: `string | number | boolean | null` for flexible field values
- `strongPasswordSchema` - Vietnamese password complexity requirements
- `getPasswordStrength()` - Returns 0-4 score with Vietnamese labels
- `getPasswordStrengthLabel()` - Returns: Rất yếu, Yếu, Trung bình, Mạnh, Rất mạnh
- NaN validation in number inputs to prevent invalid state

**Component Updates**:
- `ResponseFieldInput` - ARIA labels for all input types
- `ProgressBar` - ARIA progress bar attributes with live region
- `SaveStatusIndicator` - Live regions for save states (saving/saved/error)
- All admin/branch pages - Consistent loading/error states

**Success Metrics**:
- ✅ All interactive elements have ARIA labels
- ✅ Screen readers announce dynamic content changes
- ✅ Forms validate inputs and show clear error messages
- ✅ Loading and error states are visually and semantically clear
- ✅ Password strength provides real-time feedback in Vietnamese

---

## Phase 07: Testing Infrastructure ✅ COMPLETE

**Status**: Complete
**Completed**: 2026-01-22

**Deliverables**:
- ✅ Playwright E2E testing configuration (`playwright.config.ts`)
- ✅ Test data seeding with idempotent upserts (`tests/seed.ts`)
- ✅ Test setup and cleanup utilities (`tests/setup.ts`)
- ✅ E2E test files for auth, admin, and branch workflows (`tests/e2e/*.spec.ts`)
- ✅ Test scripts in package.json (test, test:ui, test:headed, test:debug, test:seed)

**Test Configuration**:
- Auto-start dev server before tests (`webServer` config)
- Reuses existing server in local development
- Parallel test execution for speed
- Trace on retry for debugging
- Screenshots on failure
- CI-optimized retries (2 retries in CI, 0 locally)

**Test Data**:
- Test admin user: `admin@example.com` / `password123`
- Test branch user: `branch1@example.com` / `password123`
- Test branch: `test-branch-001` (Chi nhánh Test)
- Test template: `test-template-001` (Mẫu Báo Cáo Test)
- Test period: `test-period-001` (Tháng 1/2026)

**E2E Test Coverage**:
- `tests/e2e/auth.spec.ts` - Authentication tests (3 tests)
- `tests/e2e/admin-workflow.spec.ts` - Admin workflow tests (5 tests)
- `tests/e2e/branch-workflow.spec.ts` - Branch workflow tests (3 tests)

**Success Metrics**:
- ✅ 11 E2E tests passing
- ✅ Auto-server start working
- ✅ Test data isolation with cleanup
- ✅ CI-ready test configuration

**Code Review**: `/plans/reports/code-reviewer-260122-0516-phase04-testing-infrastructure.md`
**Grade**: B (7/10) - Good foundation, selector stability improvements recommended

---

## Phase 08: Logging & Monitoring

**Status**: Pending
**Estimated**: 2-3 days

**Scope**:
- Structured logging
- Request tracing
- Error monitoring
- Performance metrics

**Deliverables**:
- [ ] Logger utility (pino/winston)
- [ ] Request ID middleware
- [ ] Error monitoring integration (Sentry)
- [ ] Performance tracking
- [ ] Log aggregation

---

## Phase 09: UI Improvements

**Status**: Pending
**Estimated**: 5-7 days

**Scope**:
- Authentication pages (login, logout)
- Dashboard layout
- Data submission forms
- Review tables for admin
- Export interface

**Components**:
- [ ] LoginForm, LogoutButton
- [ ] DashboardLayout (sidebar, header)
- [ ] DataEntryForm (dynamic fields)
- [ ] EntryReviewTable (approve/reject)
- [ ] PeriodSelector
- [ ] ExportButtons (Excel, PDF)
- [ ] StatusBadge, LoadingSpinner

**Success Criteria**:
- All components accessible
- Forms validate inputs
- Tables handle pagination
- Responsive design works

---

## Phase 10: Testing Expansion & Optimization

**Status**: Pending
**Estimated**: 3-4 days

**Scope**:
- Unit tests
- Integration tests
- Additional E2E tests
- Performance optimization
- Deployment preparation

**Deliverables**:
- [ ] Jest/Vitest setup for unit tests
- [ ] Model tests
- [ ] API tests
- [ ] Component tests
- [ ] Additional E2E scenarios
- [ ] CI/CD pipeline
- [ ] Production deployment

**Success Criteria**:
- 80%+ code coverage
- All tests passing
- Production environment live
- Database migrations successful

---

## Timeline Summary

| Phase | Duration | Status | Target Date |
|-------|----------|--------|-------------|
| 01. Setup | 1 day | ✅ Complete | 2026-01-20 |
| 02. Database | 1 day | ✅ Complete | 2026-01-20 |
| 03. API Routes | 2-3 days | ✅ Complete | 2026-01-21 |
| 04. Security Hardening | 1 day | ✅ Complete | 2026-01-21 |
| 05. Error Handling & Type Safety | 1 day | ✅ Complete | 2026-01-21 |
| 06. UI/UX & Accessibility | 1 day | ✅ Complete | 2026-01-22 |
| 07. Testing Infrastructure | 1 day | ✅ Complete | 2026-01-22 |
| 08. Logging & Monitoring | 2-3 days | ⏳ Pending | 2026-01-25 |
| 09. UI Improvements | 5-7 days | ⏳ Pending | 2026-02-01 |
| 10. Testing Expansion & Optimization | 3-4 days | ⏳ Pending | 2026-02-05 |

**Total Estimated Duration**: 17-22 days
**Current Progress**: 7/10 phases complete (70%)
**Projected Completion**: 2026-02-05

---

## Re-prioritized Phases

The following phases were consolidated/reordered based on security-first approach:
- **Authentication & RBAC** → Already implemented (NextAuth + `requireAdmin()`/`requireBranch()`)
- **Security Hardening** → Moved to Phase 04 (completed)
- **Error Handling & Type Safety** → Phase 05 (completed)
- **UI/UX & Accessibility** → Phase 06 (completed)
- **Testing Infrastructure** → Phase 07 (completed)
- **Logging & Monitoring** → Phase 08
- **UI Improvements** → Phase 09
- **Testing Expansion & Optimization** → Phase 10
