import { TransactionModal } from '@/components/TransactionModal'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback'
import { Tag } from '@/components/ui/Tag'
import { DASHBOARD_QUERY } from '@/graphql/operations'
import type { DashboardData, Transaction } from '@/types'
import { formatCurrency, formatDate, formatTransactionAmount } from '@/utils/format'
import { getCategoryIcon } from '@/utils/icons'
import { useQuery } from '@apollo/client'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const { data, loading, error } = useQuery(DASHBOARD_QUERY)
  const [modalOpen, setModalOpen] = useState(false)
  const dashboard: DashboardData | undefined = data?.dashboard

  if (loading && !dashboard) {
    return (
      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[118px]" />
          <Skeleton className="h-[118px]" />
          <Skeleton className="h-[118px]" />
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  if (error) return <ErrorState />

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-3">
        <SummaryCard
          icon={<Wallet size={20} className="text-[#7e22ce]" />}
          label="Saldo total"
          value={formatCurrency(dashboard?.totalBalance ?? 0)}
        />
        <SummaryCard
          icon={<ArrowUpCircle size={20} className="text-income" />}
          label="Receitas do mês"
          value={formatCurrency(dashboard?.monthlyIncome ?? 0)}
        />
        <SummaryCard
          icon={<ArrowDownCircle size={20} className="text-expense" />}
          label="Despesas do mês"
          value={formatCurrency(dashboard?.monthlyExpense ?? 0)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <section className="overflow-hidden rounded-xl border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-xs font-medium tracking-[0.6px] text-muted uppercase">
              Transações recentes
            </h2>
            <Link to="/transactions" className="text-sm font-medium text-primary">
              Ver todas &gt;
            </Link>
          </div>

          {!dashboard?.recentTransactions.length ? (
            <EmptyState
              title="Você ainda não possui transações"
              description="Registre sua primeira receita ou despesa."
            />
          ) : (
            <ul>
              {dashboard.recentTransactions.map((tx) => (
                <RecentRow key={tx.id} transaction={tx} />
              ))}
            </ul>
          )}

          <div className="border-t border-border px-6 py-4 text-center">
            <Button variant="ghost" onClick={() => setModalOpen(true)}>
              <Plus size={16} />
              Nova transação
            </Button>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-xs font-medium tracking-[0.6px] text-muted uppercase">Categorias</h2>
            <Link to="/categories" className="text-sm font-medium text-primary">
              Gerenciar &gt;
            </Link>
          </div>

          {!dashboard?.categorySummaries.length ? (
            <EmptyState
              title="Nenhuma categoria com movimentação"
              description="Crie categorias e registre transações."
            />
          ) : (
            <ul className="flex flex-col gap-4 p-6">
              {dashboard.categorySummaries.map((item) => (
                <li key={item.category.id} className="flex items-center gap-2">
                  <Tag label={item.category.title} color={item.category.color} />
                  <span className="flex-1 text-sm text-secondary">
                    {item.transactionCount} {item.transactionCount === 1 ? 'item' : 'itens'}
                  </span>
                  <span className="text-sm font-medium text-text">
                    {formatCurrency(item.totalAmount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium tracking-[0.6px] text-muted uppercase">{label}</span>
      </div>
      <p className="text-[28px] font-bold text-text">{value}</p>
    </div>
  )
}

function RecentRow({ transaction }: { transaction: Transaction }) {
  const Icon = getCategoryIcon(transaction.category.icon)
  const isIncome = transaction.type === 'INCOME'

  return (
    <li className="flex items-center gap-4 border-b border-border px-6 py-4 last:border-b-0">
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: transaction.category.color }}
      >
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-text">{transaction.description}</p>
        <p className="text-sm text-secondary">{formatDate(transaction.date)}</p>
      </div>
      <Tag label={transaction.category.title} color={transaction.category.color} />
      <div className="flex min-w-[120px] items-center justify-end gap-2">
        <span className="text-sm font-semibold text-text">
          {formatTransactionAmount(transaction.amount, transaction.type)}
        </span>
        {isIncome ? (
          <ArrowUpCircle size={16} className="text-income" />
        ) : (
          <ArrowDownCircle size={16} className="text-expense" />
        )}
      </div>
    </li>
  )
}
