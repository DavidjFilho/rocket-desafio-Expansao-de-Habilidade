import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import {
  CREATE_CATEGORY_MUTATION,
  UPDATE_CATEGORY_MUTATION,
} from '@/graphql/operations'
import { getErrorMessage } from '@/utils/errors'
import { categorySchema, type CategoryFormData } from '@/schemas/forms'
import type { Category } from '@/types'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/utils/categories'
import { getCategoryIcon } from '@/utils/icons'
import { cn } from '@/utils/format'
import { useMutation } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

type Props = {
  open: boolean
  category?: Category | null
  onClose: () => void
}

export function CategoryModal({ open, category, onClose }: Props) {
  const isEdit = Boolean(category)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      title: '',
      description: '',
      icon: 'utensils',
      color: CATEGORY_COLORS[0].value,
    },
  })

  const selectedIcon = watch('icon')
  const selectedColor = watch('color')

  useEffect(() => {
    if (!open) return
    setServerError('')
    reset({
      title: category?.title ?? '',
      description: category?.description ?? '',
      icon: category?.icon ?? 'utensils',
      color: category?.color ?? CATEGORY_COLORS[0].value,
    })
  }, [open, category, reset])

  const [createCategory] = useMutation(CREATE_CATEGORY_MUTATION, {
    refetchQueries: ['Categories', 'Dashboard'],
  })
  const [updateCategory] = useMutation(UPDATE_CATEGORY_MUTATION, {
    refetchQueries: ['Categories', 'Dashboard'],
  })

  const onSubmit = async (data: CategoryFormData) => {
    setServerError('')
    try {
      if (isEdit && category) {
        await updateCategory({ variables: { id: category.id, input: data } })
      } else {
        await createCategory({ variables: { input: data } })
      }
      onClose()
    } catch (error: unknown) {
      setServerError(getErrorMessage(error, 'Não foi possível salvar a categoria'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar categoria' : 'Nova categoria'}
      description="Organize suas transações com ícone e cor"
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input label="Título" error={errors.title?.message} {...register('title')} />
        <Input
          label="Descrição"
          placeholder="Opcional"
          error={errors.description?.message}
          {...register('description')}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-text">Ícone</p>
          <div className="grid grid-cols-6 gap-2">
            {CATEGORY_ICONS.map((icon) => {
              const Icon = getCategoryIcon(icon)
              return (
                <button
                  key={icon}
                  type="button"
                  aria-label={`Ícone ${icon}`}
                  onClick={() => setValue('icon', icon, { shouldValidate: true })}
                  className={cn(
                    'flex size-10 items-center justify-center rounded-lg border transition',
                    selectedIcon === icon
                      ? 'border-primary bg-[#e0fae9] text-primary'
                      : 'border-border text-secondary hover:bg-bg',
                  )}
                >
                  <Icon size={16} />
                </button>
              )
            })}
          </div>
          {errors.icon && <p className="mt-1 text-xs text-danger">{errors.icon.message}</p>}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-text">Cor</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                aria-label={`Cor ${color.label}`}
                onClick={() => setValue('color', color.value, { shouldValidate: true })}
                className={cn(
                  'size-8 rounded-full border-2 transition',
                  selectedColor === color.value ? 'border-text scale-110' : 'border-transparent',
                )}
                style={{ backgroundColor: color.value }}
              />
            ))}
          </div>
          {errors.color && <p className="mt-1 text-xs text-danger">{errors.color.message}</p>}
        </div>

        {serverError && <p className="text-sm text-danger">{serverError}</p>}

        <Button type="submit" size="lg" loading={isSubmitting}>
          Salvar
        </Button>
      </form>
    </Modal>
  )
}
