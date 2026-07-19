import { Prisma } from '@prisma/client'
import type { GraphQLContext } from '../shared/auth.js'
import { requireAuth } from '../shared/auth.js'
import { prisma } from '../shared/prisma.js'

export const dashboardResolvers = {
  Query: {
    dashboard: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const user = requireAuth(ctx)

      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

      const [allTransactions, monthlyTransactions, recentTransactions, categories] =
        await Promise.all([
          prisma.transaction.findMany({
            where: { userId: user.id },
            select: { type: true, amount: true },
          }),
          prisma.transaction.findMany({
            where: {
              userId: user.id,
              date: { gte: monthStart, lt: monthEnd },
            },
            select: { type: true, amount: true },
          }),
          prisma.transaction.findMany({
            where: { userId: user.id },
            include: { category: { include: { _count: { select: { transactions: true } } } } },
            orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
            take: 5,
          }),
          prisma.category.findMany({
            where: { userId: user.id },
            include: {
              transactions: { select: { amount: true } },
              _count: { select: { transactions: true } },
            },
            orderBy: { createdAt: 'desc' },
          }),
        ])

      let totalIncome = new Prisma.Decimal(0)
      let totalExpense = new Prisma.Decimal(0)
      for (const tx of allTransactions) {
        if (tx.type === 'INCOME') totalIncome = totalIncome.add(tx.amount)
        else totalExpense = totalExpense.add(tx.amount)
      }

      let monthlyIncome = new Prisma.Decimal(0)
      let monthlyExpense = new Prisma.Decimal(0)
      for (const tx of monthlyTransactions) {
        if (tx.type === 'INCOME') monthlyIncome = monthlyIncome.add(tx.amount)
        else monthlyExpense = monthlyExpense.add(tx.amount)
      }

      const categorySummaries = categories
        .map((category) => {
          const totalAmount = category.transactions.reduce(
            (acc, tx) => acc.add(tx.amount),
            new Prisma.Decimal(0),
          )
          return {
            category: {
              ...category,
              _count: category._count,
            },
            transactionCount: category._count.transactions,
            totalAmount: totalAmount.toString(),
          }
        })
        .filter((item) => item.transactionCount > 0)
        .sort((a, b) => b.transactionCount - a.transactionCount)

      return {
        totalBalance: totalIncome.sub(totalExpense).toString(),
        monthlyIncome: monthlyIncome.toString(),
        monthlyExpense: monthlyExpense.toString(),
        recentTransactions,
        categorySummaries,
      }
    },
  },
}
