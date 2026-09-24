import { useState, type FormEvent } from 'react'
import type { MealType } from '../../api/client'
import type { MealFilters } from './queries'
import { MEAL_TYPE_OPTIONS } from './mealTypes'

type Props = { initial: MealFilters; onSearch: (filters: MealFilters) => void }

const segment = 'flex flex-1 flex-col px-6 py-3 text-left'
const segmentLabel = 'text-xs font-semibold'
const segmentInput = 'bg-transparent text-sm text-ink outline-none placeholder:text-muted'

export function SearchBar({ initial, onSearch }: Props) {
  const [city, setCity] = useState(initial.city ?? '')
  const [mealType, setMealType] = useState<MealType | ''>(initial.meal_type ?? '')
  const [day, setDay] = useState(initial.day ?? '')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSearch({
      city: city.trim() || undefined,
      meal_type: mealType || undefined,
      day: day || undefined,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="flex flex-col rounded-3xl border border-line bg-white shadow-md sm:flex-row sm:items-center sm:rounded-full"
    >
      <label className={segment}>
        <span className={segmentLabel}>Dove</span>
        <input
          className={segmentInput}
          placeholder="Cerca una città"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </label>
      <div className="mx-6 h-px bg-line sm:mx-0 sm:h-8 sm:w-px" />
      <label className={segment}>
        <span className={segmentLabel}>Cosa</span>
        <select
          className={segmentInput}
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealType | '')}
        >
          <option value="">Qualsiasi pasto</option>
          {MEAL_TYPE_OPTIONS.map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <div className="mx-6 h-px bg-line sm:mx-0 sm:h-8 sm:w-px" />
      <label className={segment}>
        <span className={segmentLabel}>Quando</span>
        <input
          type="date"
          className={segmentInput}
          value={day}
          onChange={(e) => setDay(e.target.value)}
        />
      </label>
      <div className="p-2">
        <button
          type="submit"
          className="w-full rounded-full bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600 sm:w-auto"
        >
          Cerca
        </button>
      </div>
    </form>
  )
}
