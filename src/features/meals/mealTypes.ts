import type { MealType } from '../../api/client'

type MealTypeInfo = { label: string; cover: string }

// Full class strings (not built dynamically) so Tailwind can find them
export const MEAL_TYPES: Record<MealType, MealTypeInfo> = {
  breakfast: { label: 'Colazione', cover: 'bg-linear-to-br from-amber-100 to-amber-300' },
  brunch: { label: 'Brunch', cover: 'bg-linear-to-br from-rose-100 to-rose-300' },
  lunch: { label: 'Pranzo', cover: 'bg-linear-to-br from-lime-100 to-emerald-300' },
  aperitif: { label: 'Aperitivo', cover: 'bg-linear-to-br from-orange-200 to-red-400' },
  dinner: { label: 'Cena', cover: 'bg-linear-to-br from-indigo-200 to-slate-500' },
}

export const MEAL_TYPE_OPTIONS = Object.entries(MEAL_TYPES) as [MealType, MealTypeInfo][]
