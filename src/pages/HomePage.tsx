import { useSearchParams } from 'react-router'
import type { MealType } from '../api/client'
import { PageState } from '../components/PageState'
import { MealCard } from '../features/meals/MealCard'
import { type MealFilters, useMealSearch } from '../features/meals/queries'
import { SearchBar } from '../features/meals/SearchBar'

// Filters live in the URL (?citta=bologna&tipo=dinner&data=2026-10-01) so searches can be shared
function filtersFromParams(params: URLSearchParams): MealFilters {
  return {
    city: params.get('citta') ?? undefined,
    meal_type: (params.get('tipo') as MealType | null) ?? undefined,
    day: params.get('data') ?? undefined,
  }
}

export function HomePage() {
  const [params, setParams] = useSearchParams()
  const filters = filtersFromParams(params)
  const meals = useMealSearch(filters)

  function handleSearch(next: MealFilters) {
    const entries = { citta: next.city, tipo: next.meal_type, data: next.day }
    setParams(
      Object.fromEntries(Object.entries(entries).filter(([, v]) => v)) as Record<string, string>,
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Mangia a casa di qualcuno, <span className="text-brand-500">come a casa tua</span>.
        </h1>
        <p className="mt-4 text-lg text-muted">
          Colazioni, pranzi e cene preparati da persone vicino a te.
        </p>
      </section>

      <div className="mx-auto mt-8 max-w-3xl">
        {/* key: reset the inputs when the URL changes (e.g. back button) */}
        <SearchBar key={params.toString()} initial={filters} onSearch={handleSearch} />
      </div>

      <section className="mt-12">
        {meals.isPending && <PageState>Cerchiamo i pasti disponibili…</PageState>}
        {meals.isError && (
          <PageState>Non riusciamo a caricare i pasti. Riprova tra poco.</PageState>
        )}
        {meals.data?.length === 0 && (
          <PageState>Nessun pasto trovato. Prova a cambiare città o data.</PageState>
        )}
        {meals.data && meals.data.length > 0 && (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {meals.data.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
