import {
  Briefcase,
  Car,
  Film,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Plane,
  ShoppingCart,
  type LucideIcon,
  Utensils,
  Wallet,
  Zap,
} from 'lucide-react'
import type { CategoryIconName } from '@/utils/categories'

const iconMap: Record<CategoryIconName, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  'shopping-cart': ShoppingCart,
  film: Film,
  zap: Zap,
  'heart-pulse': HeartPulse,
  home: Home,
  briefcase: Briefcase,
  'graduation-cap': GraduationCap,
  plane: Plane,
  gift: Gift,
  wallet: Wallet,
}

export function getCategoryIcon(name: string): LucideIcon {
  return iconMap[name as CategoryIconName] ?? Wallet
}
