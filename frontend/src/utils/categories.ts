export const CATEGORY_COLORS = [
  { value: '#dbeafe', label: 'Azul', text: '#1d4ed8' },
  { value: '#f3e8ff', label: 'Roxo', text: '#7e22ce' },
  { value: '#ffedd5', label: 'Laranja', text: '#c2410c' },
  { value: '#e0fae9', label: 'Verde', text: '#15803d' },
  { value: '#fce7f3', label: 'Rosa', text: '#be185d' },
  { value: '#f7f3ca', label: 'Amarelo', text: '#a16207' },
] as const

export const CATEGORY_ICONS = [
  'utensils',
  'car',
  'shopping-cart',
  'film',
  'zap',
  'heart-pulse',
  'home',
  'briefcase',
  'graduation-cap',
  'plane',
  'gift',
  'wallet',
] as const

export type CategoryIconName = (typeof CATEGORY_ICONS)[number]

export function getCategoryTextColor(bg: string): string {
  const found = CATEGORY_COLORS.find((c) => c.value === bg)
  return found?.text ?? '#374151'
}
