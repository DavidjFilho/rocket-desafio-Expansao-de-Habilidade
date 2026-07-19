import { TransactionModal } from '@/components/TransactionModal'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/Modal'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Tag } from '@/components/ui/Tag'
import {
  CATEGORIES_QUERY,
  DELETE_TRANSACTION_MUTATION,
  TRANSACTIONS_QUERY,
} from '@/graphql/operations'
import type { Category, Transaction } from '@/types'
import { formatDate, formatTransactionAmount } from '@/utils/format'
import { getCategoryIcon } from '@/utils/icons'
import { useMutation, useQuery } from '@apollo/client'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

export function TransactionsPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [month, setMonth] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)

  const filters = useMemo(
    () => ({
      search: search || null,
      type: type || null,
      categoryId: categoryId || null,
      month: month || null,
    }),
    [search, type, categoryId, month],
  )

  const { data, loading, error } = useQuery(TRANSACTIONS_QUERY, {
    variables: { filters, pagination: { page, pageSize: 10 } },
  })
  const { data: categoriesData } = useQuery(CATEGORIES_QUERY)

  const [deleteTransaction, { loading: deletingLoading }] = useMutation(
    DELETE_TRANSACTION_MUTATION,
    {
      refetchQueries: ['Transactions', 'Dashboard', 'Categories'],
    },
  )

  const connection = data?.transactions
  const categories: Category[] = categoriesData?.categories ?? []

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (tx: Transaction) => {
    setEditing(tx)
    setModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleting) return
    await deleteTransaction({ variables: { id: deleting.id } })
    setDeleting(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Transações</h1>
          <p className="text-secondary">Gerencie todas as suas transações financeiras</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} />
          Nova transação
        </Button>
      </div>

      <section className="grid gap-4 rounded-xl border border-border bg-white p-5 md:grid-cols-2 xl:grid-cols-4">
        <Input
          label="Buscar"
          placeholder="Descrição"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
        <Select
          label="Tipo"
          value={type}
          onChange={(e) => {
            setType(e.target.value)
            setPage(1)
          }}
          options={[
            { value: '', label: 'Todos' },
            { value: 'INCOME', label: 'Receitas' },
            { value: 'EXPENSE', label: 'Despesas' },
          ]}
        />
        <Select
          label="Categoria"
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value)
            setPage(1)
          }}
          options={[
            { value: '', label: 'Todas' },
            ...categories.map((c) => ({ value: c.id, label: c.title })),
          ]}
        />
        <Input
          label="Período"
          type="month"
          value={month}
          onChange={(e) => {
            setMonth(e.target.value)
            setPage(1)
          }}
        />
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-white">
        {loading && !connection ? (
          <div className="p-6">
            <Skeleton className="h-64" />
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorState />
          </div>
        ) : !connection?.nodes.length ? (
          <EmptyState
            title="Você ainda não possui transações"
            description="Registre sua primeira receita ou despesa."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted">
                    <th className="px-6 py-4 font-medium">Descrição</th>
                    <th className="px-4 py-4 font-medium">Data</th>
                    <th className="px-4 py-4 font-medium">Categoria</th>
                    <th className="px-4 py-4 font-medium">Tipo</th>
                    <th className="px-4 py-4 text-right font-medium">Valor</th>
                    <th className="px-6 py-4 text-center font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {connection.nodes.map((tx: Transaction) => {
                    const Icon = getCategoryIcon(tx.category.icon)
                    return (
                      <tr key={tx.id} className="border-b border-border last:border-0">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex size-10 items-center justify-center rounded-lg"
                              style={{ backgroundColor: tx.category.color }}
                            >
                              <Icon size={16} />
                            </div>
                            <span className="font-medium text-text">{tx.description}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-secondary">{formatDate(tx.date)}</td>
                        <td className="px-4 py-4">
                          <Tag label={tx.category.title} color={tx.category.color} />
                        </td>
                        <td className="px-4 py-4 text-secondary">
                          {tx.type === 'INCOME' ? 'Receita' : 'Despesa'}
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-text">
                          {formatTransactionAmount(tx.amount, tx.type)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              aria-label="Editar transação"
                              className="rounded-lg border border-border p-2 text-secondary hover:bg-bg"
                              onClick={() => openEdit(tx)}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              aria-label="Excluir transação"
                              className="rounded-lg border border-border p-2 text-secondary hover:bg-red-50 hover:text-danger"
                              onClick={() => setDeleting(tx)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-secondary">
                {connection.totalCount} resultado{connection.totalCount === 1 ? '' : 's'}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                <span className="text-sm text-secondary">
                  Página {connection.page} de {connection.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= connection.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </>
        )}
      </section>

      <TransactionModal
        open={modalOpen}
        transaction={editing}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir transação"
        message="Tem certeza de que deseja excluir esta transação? Esta ação não poderá ser desfeita."
        loading={deletingLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}
