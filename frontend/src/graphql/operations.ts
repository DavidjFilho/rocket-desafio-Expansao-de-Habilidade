import { gql } from '@apollo/client'

export const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    name
    email
    avatarUrl
    createdAt
    updatedAt
  }
`

export const CATEGORY_FIELDS = gql`
  fragment CategoryFields on Category {
    id
    title
    description
    icon
    color
    transactionCount
    createdAt
    updatedAt
  }
`

export const TRANSACTION_FIELDS = gql`
  fragment TransactionFields on Transaction {
    id
    description
    type
    amount
    date
    categoryId
    createdAt
    updatedAt
    category {
      ...CategoryFields
    }
  }
  ${CATEGORY_FIELDS}
`

export const ME_QUERY = gql`
  query Me {
    me {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`

export const DASHBOARD_QUERY = gql`
  query Dashboard {
    dashboard {
      totalBalance
      monthlyIncome
      monthlyExpense
      recentTransactions {
        ...TransactionFields
      }
      categorySummaries {
        transactionCount
        totalAmount
        category {
          ...CategoryFields
        }
      }
    }
  }
  ${TRANSACTION_FIELDS}
`

export const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      ...CategoryFields
    }
  }
  ${CATEGORY_FIELDS}
`

export const CREATE_CATEGORY_MUTATION = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      ...CategoryFields
    }
  }
  ${CATEGORY_FIELDS}
`

export const UPDATE_CATEGORY_MUTATION = gql`
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      ...CategoryFields
    }
  }
  ${CATEGORY_FIELDS}
`

export const DELETE_CATEGORY_MUTATION = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`

export const TRANSACTIONS_QUERY = gql`
  query Transactions($filters: TransactionFiltersInput, $pagination: PaginationInput) {
    transactions(filters: $filters, pagination: $pagination) {
      nodes {
        ...TransactionFields
      }
      totalCount
      page
      pageSize
      totalPages
    }
  }
  ${TRANSACTION_FIELDS}
`

export const CREATE_TRANSACTION_MUTATION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      ...TransactionFields
    }
  }
  ${TRANSACTION_FIELDS}
`

export const UPDATE_TRANSACTION_MUTATION = gql`
  mutation UpdateTransaction($id: ID!, $input: UpdateTransactionInput!) {
    updateTransaction(id: $id, input: $input) {
      ...TransactionFields
    }
  }
  ${TRANSACTION_FIELDS}
`

export const DELETE_TRANSACTION_MUTATION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`
