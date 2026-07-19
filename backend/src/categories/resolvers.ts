import type { GraphQLContext } from '../shared/auth.js'
import { requireAuth } from '../shared/auth.js'
import { ErrorCodes, throwError } from '../shared/errors.js'
import { prisma } from '../shared/prisma.js'

type CategoryInput = {
  title: string
  description?: string | null
  icon: string
  color: string
}

export const categoryResolvers = {
  Query: {
    categories: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const user = requireAuth(ctx)
      return prisma.category.findMany({
        where: { userId: user.id },
        include: { _count: { select: { transactions: true } } },
        orderBy: { createdAt: 'desc' },
      })
    },

    category: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const user = requireAuth(ctx)
      const category = await prisma.category.findFirst({
        where: { id, userId: user.id },
        include: { _count: { select: { transactions: true } } },
      })
      if (!category) {
        throwError('Categoria não encontrada.', ErrorCodes.NOT_FOUND)
      }
      return category
    },
  },

  Mutation: {
    createCategory: async (
      _: unknown,
      { input }: { input: CategoryInput },
      ctx: GraphQLContext,
    ) => {
      const user = requireAuth(ctx)
      const title = input.title?.trim()
      const description = input.description?.trim() || null
      const icon = input.icon?.trim()
      const color = input.color?.trim()

      if (!title || !icon || !color) {
        throwError('Preencha todos os campos obrigatórios.', ErrorCodes.BAD_USER_INPUT)
      }

      const duplicate = await prisma.category.findFirst({
        where: { userId: user.id, title: { equals: title } },
      })
      if (duplicate) {
        throwError('Já existe uma categoria com este título.', ErrorCodes.CONFLICT)
      }

      return prisma.category.create({
        data: {
          title,
          description,
          icon,
          color,
          userId: user.id,
        },
        include: { _count: { select: { transactions: true } } },
      })
    },

    updateCategory: async (
      _: unknown,
      { id, input }: { id: string; input: CategoryInput },
      ctx: GraphQLContext,
    ) => {
      const user = requireAuth(ctx)
      const existing = await prisma.category.findFirst({
        where: { id, userId: user.id },
      })
      if (!existing) {
        throwError('Categoria não encontrada.', ErrorCodes.NOT_FOUND)
      }

      const title = input.title?.trim()
      const description = input.description?.trim() || null
      const icon = input.icon?.trim()
      const color = input.color?.trim()

      if (!title || !icon || !color) {
        throwError('Preencha todos os campos obrigatórios.', ErrorCodes.BAD_USER_INPUT)
      }

      const duplicate = await prisma.category.findFirst({
        where: {
          userId: user.id,
          title: { equals: title },
          NOT: { id },
        },
      })
      if (duplicate) {
        throwError('Já existe uma categoria com este título.', ErrorCodes.CONFLICT)
      }

      return prisma.category.update({
        where: { id },
        data: { title, description, icon, color },
        include: { _count: { select: { transactions: true } } },
      })
    },

    deleteCategory: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const user = requireAuth(ctx)
      const existing = await prisma.category.findFirst({
        where: { id, userId: user.id },
        include: { _count: { select: { transactions: true } } },
      })
      if (!existing) {
        throwError('Categoria não encontrada.', ErrorCodes.NOT_FOUND)
      }

      if (existing._count.transactions > 0) {
        throwError(
          'Esta categoria possui transações associadas. Altere ou exclua essas transações antes de remover a categoria.',
          ErrorCodes.CATEGORY_IN_USE,
        )
      }

      await prisma.category.delete({ where: { id } })
      return true
    },
  },

  Category: {
    transactionCount: (parent: { _count?: { transactions: number }; transactionCount?: number }) => {
      return parent._count?.transactions ?? parent.transactionCount ?? 0
    },
  },
}
