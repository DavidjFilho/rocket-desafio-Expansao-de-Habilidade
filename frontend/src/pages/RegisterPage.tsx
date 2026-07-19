import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { getErrorMessage } from '@/utils/errors'
import { registerSchema, type RegisterFormData } from '@/schemas/forms'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setServerError('')
    try {
      await registerUser(data.name, data.email, data.password)
      navigate('/', { replace: true })
    } catch (error: unknown) {
      setServerError(getErrorMessage(error, 'Não foi possível criar a conta'))
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-bg px-4 py-12">
      <Logo to="/login" />
      <div className="mt-8 w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-text">Criar conta</h1>
          <p className="mt-1 text-secondary">Comece a controlar suas finanças ainda hoje</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Nome completo"
            placeholder="Seu nome"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            hint="A senha deve ter no mínimo 8 caracteres"
            error={errors.password?.message}
            {...register('password')}
          />

          {serverError && <p className="text-sm text-danger">{serverError}</p>}

          <Button type="submit" size="lg" loading={isSubmitting}>
            Cadastrar
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-sm text-muted">
          <div className="h-px flex-1 bg-border" />
          ou
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="text-center">
          <p className="mb-3 text-sm text-secondary">Já tem uma conta?</p>
          <Link to="/login">
            <Button type="button" variant="outline" size="lg">
              Fazer login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
