import { useState } from 'react'
import { useNavigate } from 'react-router'
import { MealForm } from '../features/meals/MealForm'
import { useCreateMeal } from '../features/meals/queries'
import { SlotRows } from '../features/meals/SlotRows'
import { newSlotRow, toSlotPayload } from '../features/meals/slots'

export function NewMealPage() {
  const navigate = useNavigate()
  const createMeal = useCreateMeal()
  const [slots, setSlots] = useState(() => [newSlotRow()])

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Offri un pasto</h1>
      <p className="mt-2 text-muted">
        Racconta cosa cucini e scegli quando aprire la tua tavola. Potrai modificare tutto dopo.
      </p>
      <div className="mt-8">
        <MealForm
          submitLabel="Pubblica il pasto"
          isPending={createMeal.isPending}
          error={createMeal.error}
          onSubmit={(fields) =>
            createMeal.mutate(
              { ...fields, slots: toSlotPayload(slots) },
              { onSuccess: (meal) => navigate(`/pasti/${meal.id}`) },
            )
          }
        >
          {(maxGuests) => (
            <section className="rounded-card border border-line p-5">
              <h2 className="font-semibold">Date</h2>
              <p className="mb-4 text-sm text-muted">
                I posti, se vuoti, sono pari agli ospiti massimi.
              </p>
              <SlotRows rows={slots} onChange={setSlots} maxGuests={maxGuests} />
            </section>
          )}
        </MealForm>
      </div>
    </main>
  )
}
