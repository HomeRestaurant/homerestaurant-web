import { Link, useParams } from 'react-router'
import { ApiError } from '../api/errors'
import { PageState } from '../components/PageState'
import { useAuth } from '../features/auth/AuthContext'
import { MealCover } from '../features/meals/MealCover'
import { MEAL_TYPES } from '../features/meals/mealTypes'
import { useMeal } from '../features/meals/queries'
import { formatMonthYear, formatPrice, formatSlotDate, formatSlotTime } from '../lib/format'

export function MealDetailPage() {
  const { mealId = '' } = useParams()
  const meal = useMeal(mealId)
  const { user } = useAuth()

  if (meal.isPending) return <PageState>Caricamento…</PageState>
  if (meal.isError) {
    const notFound = meal.error instanceof ApiError && [404, 422].includes(meal.error.status)
    return (
      <PageState>
        {notFound ? 'Questo pasto non esiste o non è più disponibile.' : meal.error.message}
      </PageState>
    )
  }

  const { data } = meal
  const isOwner = user?.id === data.host.id
  const place = [data.neighborhood, data.city].filter(Boolean).join(', ')

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{data.title}</h1>
          <p className="mt-1 text-muted">
            {MEAL_TYPES[data.meal_type].label} · {place}
          </p>
        </div>
        {isOwner && (
          <Link
            to={`/pasti/${data.id}/modifica`}
            className="rounded-lg border border-ink px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            Modifica
          </Link>
        )}
      </div>

      <MealCover type={data.meal_type} className="mt-6 h-64 sm:h-80" />

      <div className="mt-10 grid gap-12 md:grid-cols-[1fr_22rem]">
        <div>
          <div className="flex items-center gap-4 border-b border-line pb-6">
            <div className="flex size-14 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-700">
              {data.host.first_name[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">Ospitato da {data.host.first_name}</p>
              <p className="text-sm text-muted">
                Su HomeRestaurant da {formatMonthYear(data.host.created_at)}
                {data.host.city && ` · vive a ${data.host.city}`}
              </p>
            </div>
          </div>
          <p className="mt-6 whitespace-pre-line leading-relaxed">{data.description}</p>
          {data.host.bio && (
            <div className="mt-8 rounded-card bg-brand-50 p-6">
              <p className="text-sm font-semibold">Chi è {data.host.first_name}</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{data.host.bio}</p>
            </div>
          )}
        </div>

        <aside className="h-fit rounded-card border border-line p-6 shadow-lg md:sticky md:top-6">
          <p>
            <span className="text-2xl font-semibold">{formatPrice(data.price_cents)}</span>{' '}
            <span className="text-muted">a persona</span>
          </p>
          <p className="mt-1 text-sm text-muted">Fino a {data.max_guests} ospiti</p>

          <h2 className="mt-6 text-sm font-semibold">Prossime date</h2>
          {data.slots.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Nessuna data disponibile al momento.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line">
              {data.slots.map((slot) => (
                <li key={slot.id} className="flex justify-between py-2.5 text-sm">
                  <span className="capitalize">
                    {formatSlotDate(slot.starts_at)}, {formatSlotTime(slot.starts_at)}
                  </span>
                  <span className="text-muted">{slot.capacity} posti</span>
                </li>
              ))}
            </ul>
          )}
          <button
            disabled
            className="mt-6 w-full cursor-not-allowed rounded-lg bg-brand-500/60 py-3 font-semibold text-white"
          >
            Prenotazioni in arrivo
          </button>
        </aside>
      </div>
    </main>
  )
}
