import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { getErrorMessage } from '@/utils/errors'
import { loginSchema, type LoginFormData } from '@/schemas/forms'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [serverError, setServerError] = useState('')
  const expired = searchParams.get('expired') === '1'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError('')
    try {
      await login(data.email, data.password, Boolean(data.remember))
      navigate('/', { replace: true })
    } catch (error: unknown) {
      setServerError(getErrorMessage(error, 'E-mail ou senha inválidos'))
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-bg px-4 py-12">
      <Logo />
      <div className="mt-8 w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-6 text-center sm:text-left">
          <h1 className="text-2xl font-semibold text-text">Fazer login</h1>
          <p className="mt-1 text-secondary">Entre na sua conta para continuar</p>
        </div>

        {expired && (
          <div className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Sua sessão expirou. Entre novamente para continuar.
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-secondary">
              <input type="checkbox" className="size-4 rounded border-border" {...register('remember')} />
              Lembrar-me
            </label>
            <span className="cursor-default text-primary">Recuperar senha</span>
          </div>

          {serverError && <p className="text-sm text-danger">{serverError}</p>}

          <Button type="submit" size="lg" loading={isSubmitting}>
            Entrar
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-sm text-muted">
          <div className="h-px flex-1 bg-border" />
          ou
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="text-center">
          <p className="mb-3 text-sm text-secondary">Ainda não tem uma conta?</p>
          <Link to="/register">
            <Button type="button" variant="outline" size="lg">
              Criar conta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
