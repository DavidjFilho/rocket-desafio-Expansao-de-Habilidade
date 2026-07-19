import { GraphQLError } from 'graphql'

export const ErrorCodes = {
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',
  BAD_USER_INPUT: 'BAD_USER_INPUT',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  CATEGORY_IN_USE: 'CATEGORY_IN_USE',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

export function throwError(message: string, code: ErrorCode, status?: number): never {
  throw new GraphQLError(message, {
    extensions: {
      code,
      http: status ? { status } : undefined,
    },
  })
}
