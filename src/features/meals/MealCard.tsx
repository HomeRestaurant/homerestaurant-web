import { Link } from 'react-router'
import type { Meal } from '../../api/client'
import { formatSlotDate, formatSlotTime } from '../../lib/format'
import { useAuth } from '../auth/AuthContext'
import { foodWarnings } from './foodWarnings'
import { MealCover } from './MealCover'

export function MealCard({ meal }: { meal: Meal }) {
  const { user } = useAuth()
  const nextSlot = meal.slots[0]
  const place = [meal.neighborhood, meal.city].filter(Boolean).join(', ')
  const { allergens } = foodWarnings(user, meal)

  return (
    <Link to={`/pasti/${meal.id}`} className="group block">
      <div className="relative">
        <MealCover
          type={meal.meal_type}
          className="aspect-4/3 transition group-hover:brightness-95"
        />
        {allergens.length > 0 && (
          <span className="absolute top-3 right-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
            Contiene tuoi allergeni
          </span>
        )}
      </div>
      <div className="mt-3 space-y-0.5">
        <h3 className="leading-snug font-semibold">{meal.title}</h3>
        <p className="text-sm text-muted">{place}</p>
        {nextSlot && (
          <p className="text-sm text-muted">
            {formatSlotDate(nextSlot.starts_at)}, {formatSlotTime(nextSlot.starts_at)}
            {meal.slots.length > 1 && ` · +${meal.slots.length - 1} date`}
          </p>
        )}
        <p className="pt-1 text-sm">
          Offerto da <span className="font-semibold">{meal.host.first_name}</span>
        </p>
      </div>
    </Link>
  )
}
