import gql from 'graphql-tag'

export const typeDefs = gql`
  scalar DateTime

  enum TransactionType {
    INCOME
    EXPENSE
  }

  type User {
    id: ID!
    name: String!
    email: String!
    avatarUrl: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Category {
    id: ID!
    title: String!
    description: String
    icon: String!
    color: String!
    transactionCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Transaction {
    id: ID!
    description: String!
    type: TransactionType!
    amount: String!
    date: DateTime!
    category: Category!
    categoryId: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type CategorySummary {
    category: Category!
    transactionCount: Int!
    totalAmount: String!
  }

  type Dashboard {
    totalBalance: String!
    monthlyIncome: String!
    monthlyExpense: String!
    recentTransactions: [Transaction!]!
    categorySummaries: [CategorySummary!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type TransactionConnection {
    nodes: [Transaction!]!
    totalCount: Int!
    page: Int!
    pageSize: Int!
    totalPages: Int!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateProfileInput {
    name: String!
  }

  input CreateCategoryInput {
    title: String!
    description: String
    icon: String!
    color: String!
  }

  input UpdateCategoryInput {
    title: String!
    description: String
    icon: String!
    color: String!
  }

  input CreateTransactionInput {
    description: String!
    type: TransactionType!
    amount: String!
    date: DateTime!
    categoryId: ID!
  }

  input UpdateTransactionInput {
    description: String!
    type: TransactionType!
    amount: String!
    date: DateTime!
    categoryId: ID!
  }

  input TransactionFiltersInput {
    search: String
    type: TransactionType
    categoryId: ID
    month: String
  }

  input PaginationInput {
    page: Int
    pageSize: Int
  }

  type Query {
    me: User!
    dashboard: Dashboard!
    transactions(
      filters: TransactionFiltersInput
      pagination: PaginationInput
    ): TransactionConnection!
    transaction(id: ID!): Transaction
    categories: [Category!]!
    category(id: ID!): Category
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updateProfile(input: UpdateProfileInput!): User!

    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!

    createTransaction(input: CreateTransactionInput!): Transaction!
    updateTransaction(id: ID!, input: UpdateTransactionInput!): Transaction!
    deleteTransaction(id: ID!): Boolean!
  }
`
