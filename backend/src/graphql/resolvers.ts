import { GraphQLScalarType, Kind } from 'graphql'
import { authResolvers } from '../auth/resolvers.js'
import { categoryResolvers } from '../categories/resolvers.js'
import { dashboardResolvers } from '../dashboard/resolvers.js'
import { transactionResolvers } from '../transactions/resolvers.js'

const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO-8601 DateTime scalar',
  serialize(value: unknown) {
    if (value instanceof Date) return value.toISOString()
    if (typeof value === 'string' || typeof value === 'number') {
      return new Date(value).toISOString()
    }
    throw new Error('DateTime cannot represent non-date value')
  },
  parseValue(value: unknown) {
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) throw new Error('Invalid DateTime')
      return date
    }
    throw new Error('DateTime must be a string or number')
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      const date = new Date(ast.value)
      if (Number.isNaN(date.getTime())) throw new Error('Invalid DateTime')
      return date
    }
    return null
  },
})

export const resolvers = {
  DateTime: dateTimeScalar,
  Query: {
    ...authResolvers.Query,
    ...categoryResolvers.Query,
    ...transactionResolvers.Query,
    ...dashboardResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...transactionResolvers.Mutation,
  },
  Category: categoryResolvers.Category,
  Transaction: transactionResolvers.Transaction,
}
