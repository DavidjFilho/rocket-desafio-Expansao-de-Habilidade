import bcrypt from 'bcryptjs'
import type { GraphQLContext } from '../shared/auth.js'
import { requireAuth, signToken, toPublicUser } from '../shared/auth.js'
import { ErrorCodes, throwError } from '../shared/errors.js'
import { prisma } from '../shared/prisma.js'

type RegisterInput = {
  name: string
  email: string
  password: string
}

type LoginInput = {
  email: string
  password: string
}

type UpdateProfileInput = {
  name: string
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const authResolvers = {
  Query: {
    me: (_: unknown, __: unknown, ctx: GraphQLContext) => {
      return requireAuth(ctx)
    },
  },

  Mutation: {
    register: async (_: unknown, { input }: { input: RegisterInput }) => {
      const name = input.name?.trim()
      const email = input.email?.trim().toLowerCase()
      const password = input.password

      if (!name || !email || !password) {
        throwError('Preencha todos os campos obrigatórios.', ErrorCodes.BAD_USER_INPUT)
      }

      if (!validateEmail(email)) {
        throwError('Informe um e-mail válido.', ErrorCodes.BAD_USER_INPUT)
      }

      if (password.length < 8) {
        throwError('A senha deve ter no mínimo 8 caracteres.', ErrorCodes.BAD_USER_INPUT)
      }

      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        throwError('Este e-mail já está cadastrado.', ErrorCodes.CONFLICT)
      }

      const passwordHash = await bcrypt.hash(password, 10)
      const user = await prisma.user.create({
        data: { name, email, passwordHash },
      })

      return {
        token: signToken(user.id),
        user: toPublicUser(user),
      }
    },

    login: async (_: unknown, { input }: { input: LoginInput }) => {
      const email = input.email?.trim().toLowerCase()
      const password = input.password

      if (!email || !password) {
        throwError('Preencha todos os campos obrigatórios.', ErrorCodes.BAD_USER_INPUT)
      }

      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        throwError('E-mail ou senha inválidos.', ErrorCodes.UNAUTHENTICATED)
      }

      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) {
        throwError('E-mail ou senha inválidos.', ErrorCodes.UNAUTHENTICATED)
      }

      return {
        token: signToken(user.id),
        user: toPublicUser(user),
      }
    },

    updateProfile: async (
      _: unknown,
      { input }: { input: UpdateProfileInput },
      ctx: GraphQLContext,
    ) => {
      const authUser = requireAuth(ctx)
      const name = input.name?.trim()

      if (!name) {
        throwError('O nome é obrigatório.', ErrorCodes.BAD_USER_INPUT)
      }

      const user = await prisma.user.update({
        where: { id: authUser.id },
        data: { name },
      })

      return toPublicUser(user)
    },
  },
}
