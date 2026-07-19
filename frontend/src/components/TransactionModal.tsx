import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import {
  CATEGORIES_QUERY,
  CREATE_TRANSACTION_MUTATION,
  UPDATE_TRANSACTION_MUTATION,
} from '@/graphql/operations'
import { getErrorMessage } from '@/utils/errors'
import { transactionSchema, type TransactionFormData } from '@/schemas/forms'
import type { Category, Transaction } from '@/types'
import { formatDateInput, cn } from '@/utils/format'
import { useMutation, useQuery } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

type Props = {
  open: boolean
  transaction?: Transaction | null
  onClose: () => void
}

export function TransactionModal({ open, transaction, onClose }: Props) {
  const isEdit = Boolean(transaction)
  const [serverError, setServerError] = useState('')
  const { data: categoriesData } = useQuery(CATEGORIES_QUERY, { skip: !open })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      description: '',
      date: formatDateInput(new Date()),
      amount: '',
      categoryId: '',
    },
  })

  const type = watch('type')

  useEffect(() => {
    if (!open) return
    setServerError('')
    reset({
      type: transaction?.type ?? 'EXPENSE',
      description: transaction?.description ?? '',
      date: transaction ? formatDateInput(transaction.date) : formatDateInput(new Date()),
      amount: transaction?.amount ?? '',
      categoryId: transaction?.categoryId ?? '',
    })
  }, [open, transaction, reset])

  const [createTransaction] = useMutation(CREATE_TRANSACTION_MUTATION, {
    refetchQueries: ['Dashboard', 'Transactions', 'Categories'],
  })
  const [updateTransaction] = useMutation(UPDATE_TRANSACTION_MUTATION, {
    refetchQueries: ['Dashboard', 'Transactions', 'Categories'],
  })

  const categories: Category[] = categoriesData?.categories ?? []

  const onSubmit = async (data: TransactionFormData) => {
    setServerError('')
    const amount = data.amount.replace(',', '.')
    const input = {
      ...data,
      amount,
      date: new Date(`${data.date}T12:00:00`).toISOString(),
    }

    try {
      if (isEdit && transaction) {
        await updateTransaction({ variables: { id: transaction.id, input } })
      } else {
        await createTransaction({ variables: { input } })
      }
      onClose()
    } catch (error: unknown) {
      setServerError(getErrorMessage(error, 'Não foi possível salvar a transação'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar transação' : 'Nova transação'}
      description="Registre sua despesa ou receita"
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-bg p-2">
          <button
            type="button"
            onClick={() => setValue('type', 'EXPENSE', { shouldValidate: true })}
            className={cn(
              'flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-medium transition',
              type === 'EXPENSE' ? 'bg-white text-expense shadow-sm' : 'text-secondary',
            )}
          >
            <ArrowDownCircle size={16} />
            Despesa
          </button>
          <button
            type="button"
            onClick={() => setValue('type', 'INCOME', { shouldValidate: true })}
            className={cn(
              'flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-medium transition',
              type === 'INCOME' ? 'bg-white text-income shadow-sm' : 'text-secondary',
            )}
          >
            <ArrowUpCircle size={16} />
            Receita
          </button>
        </div>

        <Input
          label="Descrição"
          placeholder="Ex: Jantar no restaurante"
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Data" type="date" error={errors.date?.message} {...register('date')} />
          <Input
            label="Valor"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            error={errors.amount?.message}
            {...register('amount')}
          />
        </div>

        <Select
          label="Categoria"
          placeholder={categories.length ? 'Selecione' : 'Crie uma categoria primeiro'}
          options={categories.map((c) => ({ value: c.id, label: c.title }))}
          error={errors.categoryId?.message}
          {...register('categoryId')}
        />

        {serverError && <p className="text-sm text-danger">{serverError}</p>}

        <Button type="submit" size="lg" loading={isSubmitting} disabled={!categories.length}>
          Salvar
        </Button>
      </form>
    </Modal>
  )
}
