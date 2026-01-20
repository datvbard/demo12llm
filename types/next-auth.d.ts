import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'ADMIN' | 'BRANCH'
      branchId?: string
      username?: string
      fullName?: string
      position?: string
    } & DefaultSession['user']
  }

  interface User {
    role: 'ADMIN' | 'BRANCH'
    branchId?: string
    username?: string
    fullName?: string
    position?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'ADMIN' | 'BRANCH'
    branchId?: string
    username?: string
    fullName?: string
    position?: string
  }
}
