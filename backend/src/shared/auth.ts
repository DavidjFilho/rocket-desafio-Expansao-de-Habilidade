import jwt from 'jsonwebtoken'
import type { User } from '@prisma/client'
import { prisma } from './prisma.js'
import { ErrorCodes, throwError } from './errors.js'

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is required')
  }
  return secret
}

export type AuthUser = Omit<User, 'passwordHash'>

export type GraphQLContext = {
  user: AuthUser | null
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: '7d' })
}

export function verifyToken(token: string): { sub: string } {
  try {
    return jwt.verify(token, getJwtSecret()) as { sub: string }
  } catch {
    throwError('Sua sessão expirou. Entre novamente.', ErrorCodes.UNAUTHENTICATED, 401)
  }
}

export async function createContext(authorization?: string): Promise<GraphQLContext> {
  if (!authorization?.startsWith('Bearer ')) {
    return { user: null }
  }

  const token = authorization.slice(7)
  try {
    const payload = verifyToken(token)
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) return { user: null }

    const { passwordHash: _, ...safeUser } = user
    return { user: safeUser }
  } catch {
    return { user: null }
  }
}

export function requireAuth(ctx: GraphQLContext): AuthUser {
  if (!ctx.user) {
    throwError('Usuário não autenticado.', ErrorCodes.UNAUTHENTICATED, 401)
  }
  return ctx.user as AuthUser
}

export function toPublicUser(user: User): AuthUser {
  const { passwordHash: _, ...safeUser } = user
  return safeUser
}
