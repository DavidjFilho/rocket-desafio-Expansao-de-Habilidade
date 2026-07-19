import { CategoryModal } from '@/components/CategoryModal'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/Modal'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback'
import { Tag } from '@/components/ui/Tag'
import {
  CATEGORIES_QUERY,
  DELETE_CATEGORY_MUTATION,
} from '@/graphql/operations'
import { getErrorMessage } from '@/utils/errors'
import type { Category } from '@/types'
import { getCategoryIcon } from '@/utils/icons'
import { useMutation, useQuery } from '@apollo/client'
import { ArrowUpDown, Pencil, Plus, Tag as TagIcon, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

export function CategoriesPage() {
  const { data, loading, error } = useQuery(CATEGORIES_QUERY)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [deleteError, setDeleteError] = useState('')

  const [deleteCategory, { loading: deletingLoading }] = useMutation(DELETE_CATEGORY_MUTATION, {
    refetchQueries: ['Categories', 'Dashboard'],
  })

  const categories: Category[] = data?.categories ?? []

  const stats = useMemo(() => {
    const totalCategories = categories.length
    const totalTransactions = categories.reduce((acc, c) => acc + c.transactionCount, 0)
    const mostUsed = [...categories].sort((a, b) => b.transactionCount - a.transactionCount)[0]
    return { totalCategories, totalTransactions, mostUsed }
  }, [categories])

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (category: Category) => {
    setEditing(category)
    setModalOpen(true)
  }

  const handleDeleteClick = (category: Category) => {
    setDeleteError('')
    if (category.transactionCount > 0) {
      setDeleteError(
        'Esta categoria possui transações associadas. Altere ou exclua essas transações antes de remover a categoria.',
      )
      setDeleting(category)
      return
    }
    setDeleting(category)
  }

  const handleDelete = async () => {
    if (!deleting) return
    if (deleting.transactionCount > 0) {
      setDeleting(null)
      return
    }
    try {
      await deleteCategory({ variables: { id: deleting.id } })
      setDeleting(null)
    } catch (error: unknown) {
      setDeleteError(getErrorMessage(error, 'Não foi possível excluir a categoria'))
    }
  }

  if (loading && !data) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-16" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-[106px]" />
          <Skeleton className="h-[106px]" />
          <Skeleton className="h-[106px]" />
        </div>
      </div>
    )
  }

  if (error) return <ErrorState />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Categorias</h1>
          <p className="text-secondary">Organize suas transações por categorias</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} />
          Nova categoria
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<TagIcon size={20} className="text-primary" />}
          value={String(stats.totalCategories)}
          label="total de categorias"
        />
        <StatCard
          icon={<ArrowUpDown size={20} className="text-primary" />}
          value={String(stats.totalTransactions)}
          label="total de transações"
        />
        <StatCard
          icon={
            stats.mostUsed ? (
              (() => {
                const Icon = getCategoryIcon(stats.mostUsed.icon)
                return <Icon size={20} />
              })()
            ) : (
              <TagIcon size={20} />
            )
          }
          value={stats.mostUsed?.title ?? '—'}
          label="categoria mais utilizada"
        />
      </div>

      {!categories.length ? (
        <div className="rounded-xl border border-border bg-white">
          <EmptyState
            title="Você ainda não possui categorias"
            description="Crie uma categoria para organizar suas transações."
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon)
            return (
              <article
                key={category.id}
                className="rounded-xl border border-border bg-white p-6"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div
                    className="flex size-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: category.color }}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      aria-label="Editar categoria"
                      className="rounded-lg border border-border p-2 text-secondary hover:bg-bg"
                      onClick={() => openEdit(category)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label="Excluir categoria"
                      className="rounded-lg border border-border p-2 text-secondary hover:bg-red-50 hover:text-danger"
                      onClick={() => handleDeleteClick(category)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="text-base font-medium text-text">{category.title}</h3>
                <p className="mt-1 min-h-10 text-sm text-secondary">
                  {category.description || 'Sem descrição'}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <Tag label={category.title} color={category.color} />
                  <span className="text-sm text-secondary">
                    {category.transactionCount}{' '}
                    {category.transactionCount === 1 ? 'item' : 'itens'}
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <CategoryModal
        open={modalOpen}
        category={editing}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title={deleting && deleting.transactionCount > 0 ? 'Categoria em uso' : 'Excluir categoria'}
        message={
          deleteError ||
          (deleting && deleting.transactionCount > 0
            ? 'Esta categoria possui transações associadas. Altere ou exclua essas transações antes de remover a categoria.'
            : 'Tem certeza de que deseja excluir esta categoria? Esta ação não poderá ser desfeita.')
        }
        confirmLabel={deleting && deleting.transactionCount > 0 ? 'Entendi' : 'Excluir'}
        loading={deletingLoading}
        onCancel={() => {
          setDeleting(null)
          setDeleteError('')
        }}
        onConfirm={() => {
          if (deleting && deleting.transactionCount > 0) {
            setDeleting(null)
            setDeleteError('')
            return
          }
          void handleDelete()
        }}
      />
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-6">
      <div className="flex size-8 items-center justify-center rounded-lg bg-[#e0fae9] text-primary">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold text-text">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  )
}
