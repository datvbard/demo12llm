import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Username or Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        const identifier = credentials.identifier

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { username: identifier }],
          },
          include: { branch: true },
        })

        if (!user) {
          console.log('User not found:', identifier)
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          console.log('Invalid password for:', identifier)
          return null
        }

        console.log('Login success:', user.email, user.username, user.role)
        return {
          id: user.id,
          email: user.email,
          username: user.username ?? undefined,
          fullName: user.fullName ?? undefined,
          position: user.position ?? undefined,
          role: user.role,
          branchId: user.branchId ?? undefined,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.branchId = user.branchId
        token.username = user.username
        token.fullName = user.fullName
        token.position = user.position
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as 'ADMIN' | 'BRANCH'
        session.user.branchId = token.branchId as string | undefined
        session.user.username = token.username as string | undefined
        session.user.fullName = token.fullName as string | undefined
        session.user.position = token.position as string | undefined
      }
      return session
    },
  },
}
