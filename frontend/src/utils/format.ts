export function formatCurrency(value: string | number, withSign = false): string {
  const amount = typeof value === 'string' ? Number(value) : value
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Math.abs(amount))

  if (!withSign) return formatted
  if (amount > 0) return `+ ${formatted}`
  if (amount < 0) return `- ${formatted}`
  return formatted
}

export function formatTransactionAmount(amount: string | number, type: 'INCOME' | 'EXPENSE'): string {
  const value = typeof amount === 'string' ? Number(amount) : amount
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)

  return type === 'INCOME' ? `+ ${formatted}` : `- ${formatted}`
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).format(date)
}

export function formatDateInput(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function currentMonthValue(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function cn(...classes: Array<string | number | boolean | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
