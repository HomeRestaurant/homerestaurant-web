import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import type { HostPreferences, Meal } from '../api/client'
import { ApiError } from '../api/errors'
import { PageState } from '../components/PageState'
import { useAuth } from '../features/auth/AuthContext'
import { foodWarnings } from '../features/meals/foodWarnings'
import { MealCover } from '../features/meals/MealCover'
import { MEAL_TYPES } from '../features/meals/mealTypes'
import { useMeal } from '../features/meals/queries'
import {
  ALLERGENS,
  BRING_CATEGORIES,
  DIETS,
  labelList,
  SUITABLE_FOR,
} from '../features/preferences/options'
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
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold break-words text-balance">{data.title}</h1>
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
        <div className="space-y-10">
          {!isOwner && <FoodWarningBanner meal={data} />}

          <div>
            <div className="flex items-center gap-4 border-b border-line pb-6">
              <div
                aria-hidden
                className="flex size-14 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-700"
              >
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
            <p className="mt-6 leading-relaxed break-words whitespace-pre-line">
              {data.description}
            </p>
            {data.host.bio && (
              <div className="mt-8 rounded-card bg-brand-50 p-6">
                <p className="text-sm font-semibold">Chi è {data.host.first_name}</p>
                <p className="mt-2 text-sm leading-relaxed break-words whitespace-pre-line">
                  {data.host.bio}
                </p>
              </div>
            )}
          </div>

          <BringSection meal={data} />
          <AllergensSection meal={data} />
        </div>

        <aside className="h-fit rounded-card border border-line p-6 shadow-lg md:sticky md:top-6">
          <h2 className="text-2xl font-semibold">Pasto offerto</h2>
          <p className="mt-1 text-sm text-muted">
            Secondo {data.host.first_name} varrebbe circa{' '}
            <span className="font-semibold text-ink">
              {formatPrice(data.estimated_value_cents)}
            </span>{' '}
            a persona. Fino a {data.max_guests} ospiti.
          </p>

          <h3 className="mt-6 text-sm font-semibold">Prossime date</h3>
          {data.slots.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Nessuna data disponibile al momento.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line">
              {data.slots.map((slot) => (
                <li key={slot.id} className="flex justify-between py-2.5 text-sm">
                  <span className="inline-block first-letter:uppercase">
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

/** Shown when the meal conflicts with the logged-in user's allergies or diet. */
function FoodWarningBanner({ meal }: { meal: Meal }) {
  const { user } = useAuth()
  const { allergens, unsuitableDiets } = foodWarnings(user, meal)
  if (allergens.length === 0 && unsuitableDiets.length === 0) return null

  return (
    <div
      role="alert"
      className="space-y-1 rounded-card border border-red-200 bg-red-50 p-5 text-sm"
    >
      {allergens.length > 0 && (
        <p className="font-semibold text-red-800">
          Attenzione: questo pasto contiene {labelList(allergens, ALLERGENS).toLowerCase()}, che hai
          indicato tra le tue allergie.
        </p>
      )}
      {unsuitableDiets.length > 0 && (
        <p className="text-red-800">
          L’host non l’ha indicato come adatto alla tua alimentazione (
          {labelList(unsuitableDiets, DIETS).toLowerCase()}): chiedi prima di prenotare.
        </p>
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-4 text-xl font-semibold">{children}</h2>
}

function BringSection({ meal }: { meal: Meal }) {
  const name = meal.host.first_name
  return (
    <section>
      <SectionTitle>Cosa puoi portare</SectionTitle>
      {meal.guest_can_bring.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {meal.guest_can_bring.map((category) => (
            <span key={category} className="rounded-full border border-line px-4 py-2 text-sm">
              {BRING_CATEGORIES[category]}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-muted">{name} non ha indicato nulla: basta la tua compagnia!</p>
      )}
      {meal.bring_notes && (
        <p className="mt-3 leading-relaxed break-words whitespace-pre-line">“{meal.bring_notes}”</p>
      )}

      <div className="mt-5 flex gap-3 rounded-card border border-sky-200 bg-sky-50 p-5 text-sm">
        <span aria-hidden className="text-lg leading-none text-sky-700">
          ⓘ
        </span>
        <div className="space-y-2 text-sky-950">
          <p>
            Portare qualcosa è un gesto di convivialità, non un obbligo. Prima di scegliere, tieni
            conto dei gusti di {name}.
          </p>
          <HostPreferencesSummary name={name} preferences={meal.host_preferences} />
        </div>
      </div>
    </section>
  )
}

function HostPreferencesSummary({
  name,
  preferences,
}: {
  name: string
  preferences: HostPreferences | null | undefined
}) {
  if (!preferences) {
    return (
      <p>
        <Link to="/accedi" className="font-semibold underline">
          Accedi
        </Link>{' '}
        per vedere alimentazione e allergie di {name}.
      </p>
    )
  }

  // No diets = the host never answered: unknown, which is not the same as "no restrictions"
  if (preferences.diets.length === 0)
    return <p>{name} non ha ancora indicato le sue preferenze alimentari.</p>

  const diets = preferences.diets.filter((diet) => diet !== 'omnivore')
  const allergies = [labelList(preferences.allergies, ALLERGENS), preferences.allergy_notes].filter(
    Boolean,
  )
  const hasRestrictions = diets.length > 0 || allergies.length > 0 || preferences.disliked_foods

  if (!hasRestrictions) return <p>{name} mangia di tutto e non ha allergie.</p>

  return (
    <ul className="space-y-1">
      {diets.length > 0 && (
        <li>
          <span className="font-semibold">Alimentazione:</span> {labelList(diets, DIETS)}
        </li>
      )}
      {allergies.length > 0 && (
        <li>
          <span className="font-semibold">Allergie e intolleranze:</span> {allergies.join('. ')}
        </li>
      )}
      {preferences.disliked_foods && (
        <li>
          <span className="font-semibold">Non mangia:</span> {preferences.disliked_foods}
        </li>
      )}
    </ul>
  )
}

function AllergensSection({ meal }: { meal: Meal }) {
  const suitable = meal.suitable_diets.filter((diet) => diet !== 'omnivore')
  return (
    <section>
      <SectionTitle>Allergeni e diete</SectionTitle>
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="inline font-semibold">Allergeni presenti: </dt>
          <dd className="inline">
            {meal.allergens.length > 0
              ? labelList(meal.allergens, ALLERGENS)
              : 'nessuno dichiarato dall’host'}
          </dd>
        </div>
        <div>
          <dt className="inline font-semibold">Adatto a: </dt>
          <dd className="inline">
            {suitable.length > 0 ? labelList(suitable, SUITABLE_FOR) : 'nessuna dieta indicata'}
          </dd>
        </div>
      </dl>
    </section>
  )
}
