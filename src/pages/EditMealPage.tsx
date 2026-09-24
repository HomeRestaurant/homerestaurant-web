import { useState } from 'react'
import { Link, useParams } from 'react-router'
import type { Meal } from '../api/client'
import { Button } from '../components/Button'
import { FormError } from '../components/FormError'
import { PageState } from '../components/PageState'
import { MealForm } from '../features/meals/MealForm'
import { useAddSlots, useDeleteSlot, useMyMeals, useUpdateMeal } from '../features/meals/queries'
import { SlotRows } from '../features/meals/SlotRows'
import { newSlotRow, toSlotPayload } from '../features/meals/slots'
import { formatSlotDate, formatSlotTime } from '../lib/format'

export function EditMealPage() {
  const { mealId = '' } = useParams()
  // From "my meals" (not the public detail) so hidden meals can be edited too
  const meals = useMyMeals()
  const meal = meals.data?.find((m) => m.id === mealId)

  if (meals.isPending) return <PageState>Caricamento…</PageState>
  if (meals.isError) return <PageState>{meals.error.message}</PageState>
  if (!meal) return <PageState>Pasto non trovato tra i tuoi.</PageState>

  return (
    <main className="mx-auto max-w-2xl space-y-12 px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Gestisci il pasto</h1>
        {meal.is_active && (
          <Link to={`/pasti/${meal.id}`} className="text-sm font-semibold underline">
            Vedi pagina pubblica
          </Link>
        )}
      </div>
      <VisibilitySection meal={meal} />
      <SlotsSection meal={meal} />
      <DetailsSection meal={meal} />
    </main>
  )
}

function VisibilitySection({ meal }: { meal: Meal }) {
  const update = useUpdateMeal(meal.id)
  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-brand-50 p-5">
      <p className="text-sm">
        {meal.is_active
          ? 'Il pasto è pubblicato: compare nelle ricerche.'
          : 'Il pasto è nascosto: nessuno può vederlo.'}
      </p>
      <Button
        variant="secondary"
        disabled={update.isPending}
        onClick={() => update.mutate({ is_active: !meal.is_active })}
      >
        {meal.is_active ? 'Nascondi' : 'Pubblica'}
      </Button>
    </section>
  )
}

function SlotsSection({ meal }: { meal: Meal }) {
  const addSlots = useAddSlots(meal.id)
  const deleteSlot = useDeleteSlot(meal.id)
  const [rows, setRows] = useState(() => [newSlotRow()])
  const payload = toSlotPayload(rows)

  return (
    <section>
      <h2 className="text-xl font-semibold">Date in programma</h2>
      {meal.slots.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Nessuna data futura: aggiungine una qui sotto.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {meal.slots.map((slot) => (
            <li key={slot.id} className="flex items-center justify-between py-3 text-sm">
              <span className="capitalize">
                {formatSlotDate(slot.starts_at)}, {formatSlotTime(slot.starts_at)} · {slot.capacity}{' '}
                posti
              </span>
              <button
                onClick={() => deleteSlot.mutate(slot.id)}
                disabled={deleteSlot.isPending}
                className="rounded-lg px-3 py-1.5 text-muted hover:bg-gray-100"
              >
                Elimina
              </button>
            </li>
          ))}
        </ul>
      )}
      <FormError error={deleteSlot.error} />

      <div className="mt-6 rounded-card border border-line p-5">
        <h3 className="mb-4 font-semibold">Aggiungi date</h3>
        <SlotRows rows={rows} onChange={setRows} maxGuests={meal.max_guests} />
        <FormError error={addSlots.error} />
        <Button
          className="mt-4"
          disabled={addSlots.isPending || payload.length === 0}
          onClick={() => addSlots.mutate(payload, { onSuccess: () => setRows([newSlotRow()]) })}
        >
          Salva date
        </Button>
      </div>
    </section>
  )
}

function DetailsSection({ meal }: { meal: Meal }) {
  const update = useUpdateMeal(meal.id)
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Dettagli</h2>
      <MealForm
        meal={meal}
        submitLabel="Salva modifiche"
        isPending={update.isPending}
        error={update.error}
        onSubmit={(fields) => update.mutate(fields)}
      />
      {update.isSuccess && <p className="mt-3 text-sm text-green-700">Modifiche salvate</p>}
    </section>
  )
}
