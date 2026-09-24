import type { MealType } from '../../api/client'
import { MEAL_TYPES } from './mealTypes'

/** Placeholder cover until meals have photos: a colour per meal type. */
export function MealCover({ type, className = '' }: { type: MealType; className?: string }) {
  const { label, cover } = MEAL_TYPES[type]
  return (
    <div className={`flex items-end rounded-card p-4 ${cover} ${className}`}>
      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink">
        {label}
      </span>
    </div>
  )
}
