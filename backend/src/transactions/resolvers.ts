import { Prisma, TransactionType } from '@prisma/client'
import type { GraphQLContext } from '../shared/auth.js'
import { requireAuth } from '../shared/auth.js'
import { ErrorCodes, throwError } from '../shared/errors.js'
import { prisma } from '../shared/prisma.js'

type TransactionInput = {
  description: string
  type: TransactionType
  amount: number | string
  date: string
  categoryId: string
}

type TransactionFiltersInput = {
  search?: string | null
  type?: TransactionType | null
  categoryId?: string | null
  month?: string | null
}

type PaginationInput = {
  page?: number | null
  pageSize?: number | null
}

function parseAmount(value: number | string): Prisma.Decimal {
  const amount = new Prisma.Decimal(value)
  if (amount.lte(0)) {
    throwError('O valor deve ser maior que zero.', ErrorCodes.BAD_USER_INPUT)
  }
  return amount
}

function parseDate(value: string): Date {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throwError('Data inválida.', ErrorCodes.BAD_USER_INPUT)
  }
  return date
}

async function assertCategoryOwnership(categoryId: string, userId: string) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  })
  if (!category) {
    throwError('Categoria não encontrada.', ErrorCodes.NOT_FOUND)
  }
  return category
}

function buildMonthFilter(month: string): { gte: Date; lt: Date } {
  const match = /^(\d{4})-(\d{2})$/.exec(month)
  if (!match) {
    throwError('Período mensal inválido. Use o formato YYYY-MM.', ErrorCodes.BAD_USER_INPUT)
  }
  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  const gte = new Date(year, monthIndex, 1)
  const lt = new Date(year, monthIndex + 1, 1)
  return { gte, lt }
}

export const transactionResolvers = {
  Query: {
    transactions: async (
      _: unknown,
      {
        filters,
        pagination,
      }: {
        filters?: TransactionFiltersInput | null
        pagination?: PaginationInput | null
      },
      ctx: GraphQLContext,
    ) => {
      const user = requireAuth(ctx)
      const page = Math.max(1, pagination?.page ?? 1)
      const pageSize = Math.min(50, Math.max(1, pagination?.pageSize ?? 10))
      const skip = (page - 1) * pageSize

      const where: Prisma.TransactionWhereInput = { userId: user.id }

      if (filters?.search?.trim()) {
        where.description = { contains: filters.search.trim() }
      }
      if (filters?.type) {
        where.type = filters.type
      }
      if (filters?.categoryId) {
        where.categoryId = filters.categoryId
      }
      if (filters?.month) {
        const range = buildMonthFilter(filters.month)
        where.date = { gte: range.gte, lt: range.lt }
      }

      const [nodes, totalCount] = await Promise.all([
        prisma.transaction.findMany({
          where,
          include: { category: { include: { _count: { select: { transactions: true } } } } },
          orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
          skip,
          take: pageSize,
        }),
        prisma.transaction.count({ where }),
      ])

      return {
        nodes,
        totalCount,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
      }
    },

    transaction: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const user = requireAuth(ctx)
      const transaction = await prisma.transaction.findFirst({
        where: { id, userId: user.id },
        include: { category: { include: { _count: { select: { transactions: true } } } } },
      })
      if (!transaction) {
        throwError('Transação não encontrada.', ErrorCodes.NOT_FOUND)
      }
      return transaction
    },
  },

  Mutation: {
    createTransaction: async (
      _: unknown,
      { input }: { input: TransactionInput },
      ctx: GraphQLContext,
    ) => {
      const user = requireAuth(ctx)
      const description = input.description?.trim()

      if (!description || !input.type || !input.date || !input.categoryId) {
        throwError('Preencha todos os campos obrigatórios.', ErrorCodes.BAD_USER_INPUT)
      }

      if (input.type !== 'INCOME' && input.type !== 'EXPENSE') {
        throwError('O tipo deve ser INCOME ou EXPENSE.', ErrorCodes.BAD_USER_INPUT)
      }

      await assertCategoryOwnership(input.categoryId, user.id)

      return prisma.transaction.create({
        data: {
          description,
          type: input.type,
          amount: parseAmount(input.amount),
          date: parseDate(input.date),
          categoryId: input.categoryId,
          userId: user.id,
        },
        include: { category: { include: { _count: { select: { transactions: true } } } } },
      })
    },

    updateTransaction: async (
      _: unknown,
      { id, input }: { id: string; input: TransactionInput },
      ctx: GraphQLContext,
    ) => {
      const user = requireAuth(ctx)
      const existing = await prisma.transaction.findFirst({
        where: { id, userId: user.id },
      })
      if (!existing) {
        throwError('Transação não encontrada.', ErrorCodes.NOT_FOUND)
      }

      const description = input.description?.trim()
      if (!description || !input.type || !input.date || !input.categoryId) {
        throwError('Preencha todos os campos obrigatórios.', ErrorCodes.BAD_USER_INPUT)
      }

      if (input.type !== 'INCOME' && input.type !== 'EXPENSE') {
        throwError('O tipo deve ser INCOME ou EXPENSE.', ErrorCodes.BAD_USER_INPUT)
      }

      await assertCategoryOwnership(input.categoryId, user.id)

      return prisma.transaction.update({
        where: { id },
        data: {
          description,
          type: input.type,
          amount: parseAmount(input.amount),
          date: parseDate(input.date),
          categoryId: input.categoryId,
        },
        include: { category: { include: { _count: { select: { transactions: true } } } } },
      })
    },

    deleteTransaction: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const user = requireAuth(ctx)
      const existing = await prisma.transaction.findFirst({
        where: { id, userId: user.id },
      })
      if (!existing) {
        throwError('Transação não encontrada.', ErrorCodes.NOT_FOUND)
      }

      await prisma.transaction.delete({ where: { id } })
      return true
    },
  },

  Transaction: {
    amount: (parent: { amount: Prisma.Decimal | number | string }) => {
      return parent.amount.toString()
    },
  },
}
