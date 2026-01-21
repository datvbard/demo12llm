# Code Standards

## Setup Standards (Phase 01)

### Project Initialization

**Dependencies Installed:**

```json
{
  "dependencies": {
    "@prisma/client": "^6.1.0",
    "@tanstack/react-query": "^5.62.11",
    "bcrypt": "^5.1.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "exceljs": "^4.4.0",
    "jspdf": "^2.5.2",
    "lucide-react": "^0.468.0",
    "next": "^15.1.3",
    "next-auth": "^4.24.11",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^2.6.0",
    "zod": "^3.24.1"
  }
}
```

**Dev Dependencies:**

```json
{
  "devDependencies": {
    "@eslint/compat": "^2.0.1",
    "@types/bcrypt": "^5.0.2",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.20",
    "eslint": "^9",
    "eslint-config-next": "^15.1.3",
    "eslint-config-prettier": "^9.1.0",
    "postcss": "^8",
    "prisma": "^6.1.0",
    "tailwindcss": "^3.4.17",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5"
  }
}
```

### Configuration Standards

#### TypeScript

- **Strict mode enabled** in `tsconfig.json`
- Target: ES2017
- Module resolution: bundler
- Path alias: `@/*` → project root

#### ESLint

- Flat config format
- Extends: `next/core-web-vitals`, `prettier`
- Run: `npm run lint`

#### Tailwind CSS

- Dark mode: class-based
- shadcn/ui theme integration
- CSS variables for colors
- Animation: accordion-down, accordion-up

#### Next.js

- App Router (not Pages Router)
- Server Actions enabled
- Experimental: allowedOrigins for localhost + Vercel

### File Naming Conventions

- **kebab-case** for all files
- **Descriptive names** preferred over brevity
- **Component files**: `component-name.tsx`
- **Utility files**: `utility-name.ts`
- **Page files**: `page.tsx`, `layout.tsx` (App Router convention)

### Code Organization

#### App Directory

```
app/
├── globals.css          # Global styles + CSS variables
├── layout.tsx           # Root layout
└── page.tsx             # Home page
```

#### Lib Directory

```
lib/
├── prisma.ts            # Prisma singleton
├── utils.ts             # cn() helper
├── server-auth.ts       # requireAdmin(), requireBranch()
├── validations/
│   └── customer-report.ts  # Zod schemas
├── excel-parser.ts      # Excel parsing with ExcelJS
└── export/
    └── excel.ts         # Excel export generation
```

#### Types Directory

```
types/
├── customer-report.ts   # Customer report TypeScript interfaces
└── [feature].ts         # Feature-specific types
```

**Type Definition Standards:**
- Mirror Prisma schema models
- Include form input types
- Add API response types
- Export enums matching schema

#### Components Directory

```
components/
└── ui/                  # shadcn/ui components
```

### Utility Functions

#### `cn()` Helper

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Purpose: Merge Tailwind classes intelligently, remove conflicts.

#### Loading State Pattern

**Usage** (`components/ui/loading-state.tsx`):
```typescript
import { LoadingState, LoadingSpinner } from '@/components/ui/loading-state'

// Full-page loading
<LoadingState message="Đang tải dữ liệu..." size="lg" />

// Inline spinner (buttons, forms)
<button>
  <LoadingSpinner size="sm" />
  Lưu
</button>
```

**Accessibility Features**:
- `role="status"` - Semantically indicates loading state
- `aria-live="polite"` - Announces loading to screen readers
- `aria-busy="true"` - Indicates content is being loaded
- `sr-only` text - Screen reader-only loading message
- Size variants: sm, md, lg

#### Error State Pattern

**Usage** (`components/ui/error-state.tsx`):
```typescript
import { ErrorState, InlineError } from '@/components/ui/error-state'

// Full-page error with retry
<ErrorState
  message="Không thể tải dữ liệu"
  description="Vui lòng kiểm tra kết nối và thử lại"
  onRetry={() => refetch()}
  retryText="Thử lại"
/>

// Inline form error
<InlineError message="Email này đã được sử dụng" />
```

**Accessibility Features**:
- `role="alert"` - Immediate announcement to screen readers
- `aria-live="assertive"` - Interrupts for urgent messages
- Focus management on retry button
- Keyboard navigation support
- Clear error messages with actionable guidance

#### Prisma Singleton

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = prisma;
```

Purpose: Prevent multiple PrismaClient instances in dev HMR.

### Git Ignore Patterns

```
# Prisma
/prisma/*.db
/prisma/*.db-journal

# Environment
.env*
!.env.example
```

### Development Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Postinstall Hook

```json
"postinstall": "prisma generate"
```

Ensures Prisma Client is generated after `npm install`.

## Security Standards (Phase 04)

### Rate Limiting

**Implementation**: In-memory rate limiting via `middleware.ts` + `lib/rate-limit.ts`

**Configuration**:
```typescript
// Default limits
const DEFAULT_LIMIT = 100      // requests per window
const DEFAULT_WINDOW_MS = 60000 // 1 minute
```

**Usage in middleware**:
```typescript
import { checkRateLimit } from '@/lib/rate-limit'

const identifier = getClientIdentifier(req)
const result = checkRateLimit(identifier, { limit: 100, windowMs: 60000 })
if (!result.allowed) {
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429, headers: { 'Retry-After': String(result.retryAfter) } }
  )
}
```

### Error Handling Pattern (Phase 05)

**API Route Template**:
```typescript
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/server-auth'
import { handleApiError, validationError } from '@/lib/api-error-handler'
import { validateUUID } from '@/lib/validation'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin()
    const { id } = params

    // Validate UUID
    if (!validateUUID(id)) {
      return validationError('Invalid ID')
    }

    // ... business logic

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'POST /api/route', 'Operation failed')
  }
}
```

**Helper Functions**:
```typescript
// 400 Bad Request
return validationError('Invalid input data')

// 404 Not Found
return notFoundError('Entry')

// Centralized error handling
return handleApiError(error, 'GET /api/entries', 'Failed to fetch entries')
```

**Key Principles**:
- Use `handleApiError()` for all catch blocks
- Validate UUIDs with `validateUUID()` before DB queries
- Use helper functions for common error responses
- Centralized error logging with context
- Environment-aware responses (dev shows stack traces)

### Content Security Policy (CSP)

**Configuration** (`next.config.ts`):
```typescript
headers: async () => [{
  source: '/:path*',
  headers: [
    {
      key: 'Content-Security-Policy',
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
      ].join('; ')
    },
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains'
    },
    {
      key: 'X-Frame-Options',
      value: 'SAMEORIGIN'
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff'
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin'
    },
    {
      key: 'Permissions-Policy',
      value: 'geolocation=(), microphone=(), camera=()'
    }
  ]
}]
```

### Cookie Security

**NextAuth Configuration** (`lib/auth.ts`):
```typescript
cookies: {
  sessionToken: {
    name: 'next-auth.session-token',
    options: {
      httpOnly: true,           // Prevent XSS access
      sameSite: 'lax',          // CSRF protection
      secure: process.env.NODE_ENV === 'production', // HTTPS-only in prod
      path: '/',                 // Available site-wide
    }
  }
}
```

### Authentication Patterns

**Admin-Only Routes**:
```typescript
import { requireAdmin } from '@/lib/server-auth'

export async function GET(req: Request) {
  const session = await requireAdmin() // Throws 401 if not admin
  // ... admin logic
}
```

**Branch-User Routes**:
```typescript
import { requireBranch } from '@/lib/server-auth'

export async function POST(req: Request) {
  const session = await requireBranch() // Throws 401 if not branch user
  // ... branch logic, can access session.branchId
}
```

### React Error Boundary (Phase 05)

**Usage in Layouts**:
```typescript
import { ErrorBoundary } from '@/components/error-boundary'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Custom error logging (e.g., send to Sentry)
        console.error('[Layout Error]', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
```

**Custom Fallback**:
```typescript
<ErrorBoundary
  fallback={
    <div className="p-8 text-center">
      <h2>Có lỗi xảy ra</h2>
      <button onClick={() => window.location.reload()}>Thử lại</button>
    </div>
  }
>
  <PageComponent />
</ErrorBoundary>
```

**HOC Wrapper**:
```typescript
import { withErrorBoundary } from '@/components/error-boundary'

export default withErrorBoundary(MyComponent)
```

## Accessibility Standards (Phase 06)

### ARIA Labels & Attributes

**Form Inputs Pattern**:
```typescript
// Correct: Label association + ARIA label
<label htmlFor={fieldId}>{field.label}</label>
<input
  id={fieldId}
  aria-label={field.label}
  required={field.required}
/>

// Dynamic fields: Use aria-label for screen readers
<select aria-label={field.label}>
  {options.map(opt => <option key={opt.value}>{opt.label}</option>)}
</select>
```

**Live Regions for Dynamic Content**:
```typescript
// Loading states - polite announcements
<div role="status" aria-live="polite" aria-busy="true">
  <Loader2 className="animate-spin" />
  <span>Đang tải...</span>
</div>

// Progress updates - polite live region
<div aria-live="polite">
  {current}/{total} ({percentage}%)
</div>

// Errors - assertive (immediate) announcements
<div role="alert" aria-live="assertive">
  <AlertCircle aria-hidden="true" />
  <span>Không thể lưu dữ liệu</span>
</div>
```

**Progress Bar Pattern** (`components/customer-reports/progress-bar.tsx`):
```typescript
<div
  role="progressbar"
  aria-valuenow={current}
  aria-valuemin={0}
  aria-valuemax={total}
  aria-label={`Tiến độ: ${current} trên ${total}`}
>
  <div aria-live="polite">{current}/{total} ({percentage}%)</div>
  <div aria-hidden="true">
    <ProgressBarFill width={`${percentage}%`} />
  </div>
</div>
```

### Keyboard Navigation

**Focus Management**:
```typescript
// All interactive elements must be keyboard accessible
<button
  className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  aria-label="Close modal"
>
  <X aria-hidden="true" />
</button>

// Skip links for keyboard users
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### Screen Reader Support

**Icon-Only Buttons**:
```typescript
<button aria-label="Delete item">
  <Trash2 aria-hidden="true" />
</button>
```

**Hidden Text for Screen Readers**:
```typescript
<div className="flex items-center">
  <Loader2 className="animate-spin" aria-hidden="true" />
  <span>Loading...</span>
  <span className="sr-only">Đang tải...</span>
</div>
```

### Form Validation Feedback

**Password Strength Pattern** (`lib/validation.ts`):
```typescript
import { getPasswordStrengthLabel, getPasswordStrength } from '@/lib/validation'

// Real-time feedback
const strength = getPasswordStrength(password)
const label = getPasswordStrengthLabel(password) // "Rất yếu", "Yếu", etc.

<div aria-live="polite">
  <ProgressBar value={strength} max={4} />
  <span>{label}</span>
</div>
```

**Field-Level Errors**:
```typescript
<p className="text-red-600" role="alert" id={`error-${fieldId}`}>
  <span className="sr-only">Lỗi: </span>
  {errorMessage}
</p>

<input
  aria-invalid={hasError}
  aria-describedby={hasError ? `error-${fieldId}` : undefined}
/>
```

### Vietnamese Language Support

**Accessibility Labels**:
```typescript
// Always provide Vietnamese labels for Vietnamese UI
<input aria-label="Họ và tên" placeholder="Nhập họ và tên" />
<button aria-label="Lưu thay đổi">Lưu</button>

// Loading states
<LoadingState message="Đang tải..." />

// Error messages
<ErrorState message="Có lỗi xảy ra" retryText="Thử lại" />
```

**Password Validation Messages** (`lib/validation.ts`):
```typescript
export const strongPasswordSchema = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .regex(/[A-Z]/, 'Phải chứa ít nhất 1 chữ hoa')
  .regex(/[a-z]/, 'Phải chứa ít nhất 1 chữ thường')
  .regex(/[0-9]/, 'Phải chứa ít nhất 1 số')
  .regex(/[^A-Za-z0-9]/, 'Phải chứa ít nhất 1 ký tự đặc biệt')
```

### Color Contrast & Visual Accessibility

**Requirements**:
- WCAG 2.1 AA compliance (4.5:1 for normal text, 3:1 for large text)
- Focus indicators on all interactive elements
- Not rely on color alone to convey information
- Support dark mode with proper contrast

**Dark Mode Support**:
```typescript
className="text-gray-900 dark:text-gray-100
           bg-white dark:bg-gray-800
           border-gray-300 dark:border-gray-600"
```

### Type Safety for Forms

**FieldValue Type** (`types/customer-report.ts`):
```typescript
// Flexible type for dynamic field values
export type FieldValue = string | number | boolean | null

// Usage in components
interface ResponseFieldInputProps {
  value: FieldValue | null
  onChange: (value: FieldValue | null) => void
}
```

**NaN Prevention in Number Inputs**:
```typescript
onChange={(e) => {
  const val = e.target.value === '' ? null : parseFloat(e.target.value)
  if (val !== null && isNaN(val)) return // Prevent NaN
  onChange(val)
}}
```

## API Route Standards (Phase 02)

### Route Organization

```
app/api/
├── admin/
│   ├── report-templates/
│   │   ├── route.ts              # GET (list), POST (create)
│   │   └── [id]/
│   │       ├── route.ts          # GET, PATCH, DELETE
│   │       └── fields/
│   │           ├── route.ts      # GET (list), POST (create)
│   │           ├── [fieldId]/route.ts  # PATCH, DELETE
│   │           └── reorder/route.ts    # PATCH
│   └── customer-reports/
│       ├── route.ts              # GET (list), POST (upload)
│       └── [id]/
│           ├── route.ts          # GET, PATCH, DELETE
│           └── export/
│               ├── excel/route.ts
│               └── pdf/route.ts
└── customer-reports/
    ├── route.ts                  # GET (list for branch)
    └── [id]/
        ├── route.ts              # GET (branch view)
        └── rows/[rowId]/route.ts # PATCH (update responses)
```

### Authentication Helpers

```typescript
// lib/server-auth.ts
export async function requireAdmin(): Promise<Session>
export async function requireBranch(): Promise<Session>
```

Usage in route handlers:
```typescript
import { requireAdmin } from '@/lib/server-auth'

export async function GET(req: Request) {
  const session = await requireAdmin()
  // ...admin logic
}
```

### Validation Pattern

```typescript
import { createCustomerReportSchema } from '@/lib/validations/customer-report'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = createCustomerReportSchema.parse(body)
    // ...use validatedData
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    // ...handle other errors
  }
}
```

### Error Response Format

```typescript
// Success
return NextResponse.json(data, { status: 201 })

// Validation error
return NextResponse.json(
  { error: 'Validation failed', details: error.errors },
  { status: 400 }
)

// Not found
return NextResponse.json(
  { error: 'Resource not found' },
  { status: 404 }
)

// Server error
return NextResponse.json(
  { error: error.message || 'Operation failed' },
  { status: 500 }
)
```

### Pagination Query Params

```typescript
const page = parseInt(searchParams.get('page') || '1')
const limit = parseInt(searchParams.get('limit') || '20')
const skip = (page - 1) * limit

const [items, total] = await Promise.all([
  prisma.model.findMany({ skip, take: limit }),
  prisma.model.count()
])

return NextResponse.json({
  items,
  pagination: { page, limit, total, pages: Math.ceil(total / limit) }
})
```

### Excel Processing Pattern

```typescript
import { parseExcelFile, mapBranchNamesToIds, validateFileSize } from '@/lib/excel-parser'

// 1. Validate file size
const buffer = Buffer.from(await file.arrayBuffer())
validateFileSize(buffer, 10) // 10MB max

// 2. Parse Excel
const parsedData = await parseExcelFile(buffer, branchColumn)

// 3. Map branches
const branchMap = await mapBranchNamesToIds(
  parsedData.rows.map(r => r.branchName).filter(Boolean)
)

// 4. Check for unmapped branches
const unmapped = Array.from(branchMap.entries())
  .filter(([_, id]) => id === null)
  .map(([name]) => name)

if (unmapped.length > 0) {
  return NextResponse.json(
    { error: 'Branches not found', unmappedBranches: unmapped },
    { status: 400 }
  )
}

// 5. Create in transaction
const result = await prisma.$transaction(async (tx) => {
  // ...create report + rows
})
```

## Next Steps

- Build UI components with shadcn/ui
- Add authentication with NextAuth
- Implement period entry submission workflow
