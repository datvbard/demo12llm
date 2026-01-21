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
