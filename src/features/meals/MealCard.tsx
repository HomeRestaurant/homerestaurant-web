import { Link } from 'react-router'
import type { Meal } from '../../api/client'
import { formatPrice, formatSlotDate, formatSlotTime } from '../../lib/format'
import { MealCover } from './MealCover'

export function MealCard({ meal }: { meal: Meal }) {
  const nextSlot = meal.slots[0]
  const place = [meal.neighborhood, meal.city].filter(Boolean).join(', ')

  return (
    <Link to={`/pasti/${meal.id}`} className="group block">
      <MealCover
        type={meal.meal_type}
        className="aspect-4/3 transition group-hover:brightness-95"
      />
      <div className="mt-3 space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug">{meal.title}</h3>
        </div>
        <p className="text-sm text-muted">
          {place} · con {meal.host.first_name}
        </p>
        {nextSlot && (
          <p className="text-sm text-muted">
            {formatSlotDate(nextSlot.starts_at)}, {formatSlotTime(nextSlot.starts_at)}
            {meal.slots.length > 1 && ` · +${meal.slots.length - 1} date`}
          </p>
        )}
        <p className="pt-1">
          <span className="font-semibold">{formatPrice(meal.price_cents)}</span>{' '}
          <span className="text-muted">a persona</span>
        </p>
      </div>
    </Link>
  )
}
