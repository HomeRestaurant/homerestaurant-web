import { Link } from 'react-router'
import { PageState } from '../components/PageState'
import { MealCover } from '../features/meals/MealCover'
import { useMyMeals } from '../features/meals/queries'
import { formatPrice } from '../lib/format'

export function MyMealsPage() {
  const meals = useMyMeals()

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">I miei pasti</h1>
        <Link
          to="/pasti/nuovo"
          className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Offri un pasto
        </Link>
      </div>

      {meals.isPending && <PageState>Caricamento…</PageState>}
      {meals.isError && (
        <PageState>Non riusciamo a caricare i tuoi pasti. Ricarica la pagina e riprova.</PageState>
      )}
      {meals.data?.length === 0 && (
        <PageState>Non hai ancora pubblicato nessun pasto. Inizia ora!</PageState>
      )}
      <ul className="mt-8 divide-y divide-line">
        {meals.data?.map((meal) => (
          <li key={meal.id} className="flex items-center gap-5 py-5">
            <MealCover type={meal.meal_type} className="size-20 shrink-0 p-0 [&>span]:hidden" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{meal.title}</p>
              <p className="text-sm text-muted">
                {meal.city} · valore {formatPrice(meal.estimated_value_cents)} ·{' '}
                {meal.slots.length === 0
                  ? 'nessuna data futura'
                  : `${meal.slots.length} ${meal.slots.length === 1 ? 'data' : 'date'} in programma`}
              </p>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                  meal.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-muted'
                }`}
              >
                {meal.is_active ? 'Pubblicato' : 'Nascosto'}
              </span>
            </div>
            <Link
              to={`/pasti/${meal.id}/modifica`}
              aria-label={`Gestisci ${meal.title}`}
              className="rounded-lg border border-ink px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              Gestisci
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
