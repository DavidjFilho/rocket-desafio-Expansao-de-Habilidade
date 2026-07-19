import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { getErrorMessage } from '@/utils/errors'
import { profileSchema, type ProfileFormData } from '@/schemas/forms'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

export function ProfilePage() {
  const { user, updateProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [success, setSuccess] = useState('')
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', email: '' },
  })

  useEffect(() => {
    if (user) {
      reset({ name: user.name, email: user.email })
    }
  }, [user, reset])

  const onSubmit = async (data: ProfileFormData) => {
    setSuccess('')
    setServerError('')
    try {
      await updateProfile(data.name)
      setSuccess('Alterações salvas com sucesso')
    } catch (error: unknown) {
      setServerError(getErrorMessage(error, 'Não foi possível salvar as alterações'))
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  if (!user) return null

  return (
    <div className="mx-auto flex max-w-md flex-col">
      <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Avatar name={user.name} size="lg" />
          <h1 className="mt-4 text-2xl font-semibold text-text">{user.name}</h1>
          <p className="text-secondary">{user.email}</p>
        </div>

        <div className="mb-6 h-px bg-border" />

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Nome completo"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="E-mail"
            type="email"
            readOnly
            hint="O e-mail não pode ser alterado"
            {...register('email')}
          />

          {success && <p className="text-sm text-income">{success}</p>}
          {serverError && <p className="text-sm text-danger">{serverError}</p>}

          <Button type="submit" size="lg" loading={isSubmitting}>
            Salvar alterações
          </Button>
          <Button type="button" variant="danger" size="lg" onClick={handleLogout}>
            Sair da conta
          </Button>
        </form>
      </div>
    </div>
  )
}
