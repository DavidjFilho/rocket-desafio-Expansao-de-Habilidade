import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
  remember: z.boolean().optional(),
})

export const registerSchema = z.object({
  name: z.string().min(1, 'Informe o nome completo'),
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
})

export const profileSchema = z.object({
  name: z.string().min(1, 'Informe o nome completo'),
  email: z.string().email(),
})

export const categorySchema = z.object({
  title: z.string().min(1, 'Informe o título'),
  description: z.string().optional(),
  icon: z.string().min(1, 'Selecione um ícone'),
  color: z.string().min(1, 'Selecione uma cor'),
})

export const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string().min(1, 'Informe a descrição'),
  date: z.string().min(1, 'Informe a data'),
  amount: z
    .string()
    .min(1, 'Informe o valor')
    .refine((v) => Number(v.replace(',', '.')) > 0, 'O valor deve ser maior que zero'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type CategoryFormData = z.infer<typeof categorySchema>
export type TransactionFormData = z.infer<typeof transactionSchema>
