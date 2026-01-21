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
└── utils.ts             # cn() helper
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

## Next Steps

- Implement database schema in `prisma/schema.prisma`
- Create API routes for data submission
- Build UI components with shadcn/ui
- Add authentication with NextAuth
