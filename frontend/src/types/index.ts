export type Category = {
  id: string
  title: string
  description?: string | null
  icon: string
  color: string
  transactionCount: number
}

export type Transaction = {
  id: string
  description: string
  type: 'INCOME' | 'EXPENSE'
  amount: string
  date: string
  categoryId: string
  category: Category
}

export type CategorySummary = {
  category: Category
  transactionCount: number
  totalAmount: string
}

export type DashboardData = {
  totalBalance: string
  monthlyIncome: string
  monthlyExpense: string
  recentTransactions: Transaction[]
  categorySummaries: CategorySummary[]
}
