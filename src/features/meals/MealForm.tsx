import { useId, useState, type FormEvent, type ReactNode } from 'react'
import type { Allergen, BringCategory, Diet, Meal, MealType } from '../../api/client'
import { Button } from '../../components/Button'
import { ChipRadio, ChipSelect } from '../../components/ChipSelect'
import { FormError } from '../../components/FormError'
import { TextArea, TextField } from '../../components/TextField'
import { parseEuroToCents } from '../../lib/format'
import { ALLERGENS, BRING_CATEGORIES, SUITABLE_FOR } from '../preferences/options'
import { MEAL_TYPES } from './mealTypes'

export type MealFields = {
  title: string
  description: string
  meal_type: MealType
  estimated_value_cents: number
  max_guests: number
  city: string
  neighborhood: string | null
  guest_can_bring: BringCategory[]
  bring_notes: string | null
  allergens: Allergen[]
  suitable_diets: Diet[]
}

type Props = {
  meal?: Meal
  submitLabel: string
  isPending: boolean
  error: Error | null
  onSubmit: (fields: MealFields) => void
  /** Extra section rendered before the submit button (e.g. the first dates). */
  children?: (maxGuests: number) => ReactNode
}

const MEAL_TYPE_LABELS = Object.fromEntries(
  Object.entries(MEAL_TYPES).map(([type, { label }]) => [type, label]),
) as Record<MealType, string>

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-card border border-line p-5">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {hint && <p className="text-sm text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

export function MealForm({ meal, submitLabel, isPending, error, onSubmit, children }: Props) {
  const [form, setForm] = useState({
    title: meal?.title ?? '',
    description: meal?.description ?? '',
    value: meal ? String(meal.estimated_value_cents / 100).replace('.', ',') : '',
    max_guests: meal ? String(meal.max_guests) : '4',
    city: meal?.city ?? '',
    neighborhood: meal?.neighborhood ?? '',
    bring_notes: meal?.bring_notes ?? '',
  })
  const mealTypeLabelId = useId()
  const [mealType, setMealType] = useState<MealType>(meal?.meal_type ?? 'dinner')
  const [guestCanBring, setGuestCanBring] = useState<BringCategory[]>(meal?.guest_can_bring ?? [])
  const [allergens, setAllergens] = useState<Allergen[]>(meal?.allergens ?? [])
  const [suitableDiets, setSuitableDiets] = useState<Diet[]>(meal?.suitable_diets ?? [])
  const [valueError, setValueError] = useState<Error | null>(null)

  const update = (field: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const valueCents = parseEuroToCents(form.value)
    if (valueCents === null) {
      setValueError(new Error('Inserisci una cifra valida, ad esempio 25 o 12,50'))
      return
    }
    setValueError(null)
    onSubmit({
      title: form.title,
      description: form.description,
      meal_type: mealType,
      estimated_value_cents: valueCents,
      max_guests: Number(form.max_guests),
      city: form.city,
      neighborhood: form.neighborhood.trim() || null,
      guest_can_bring: guestCanBring,
      bring_notes: form.bring_notes.trim() || null,
      allergens,
      suitable_diets: suitableDiets,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TextField
        label="Titolo"
        placeholder="Es. Cena romagnola con tagliatelle fatte a mano"
        required
        minLength={3}
        maxLength={100}
        value={form.title}
        onChange={update('title')}
      />
      <div className="space-y-2">
        <span id={mealTypeLabelId} className="text-sm font-medium">
          Tipo di pasto
        </span>
        <ChipRadio
          aria-labelledby={mealTypeLabelId}
          options={MEAL_TYPE_LABELS}
          value={mealType}
          onChange={setMealType}
        />
      </div>
      <TextArea
        label="Descrizione: cosa cucini, l’atmosfera, com’è la tua tavola"
        required
        minLength={10}
        maxLength={5000}
        value={form.description}
        onChange={update('description')}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Ospiti massimi"
          type="number"
          min={1}
          max={50}
          required
          value={form.max_guests}
          onChange={update('max_guests')}
        />
        <div />
        <TextField label="Città" required value={form.city} onChange={update('city')} />
        <TextField
          label="Quartiere (facoltativo)"
          value={form.neighborhood}
          onChange={update('neighborhood')}
        />
      </div>
      <p className="-mt-2 text-sm text-muted">
        L'indirizzo esatto non viene pubblicato: lo condividerai solo con chi prenota.
      </p>

      <Section
        title="Quanto faresti pagare questo pasto se dovessi venderlo?"
        hint="Il pasto è gratuito: questa cifra, a persona, serve solo a dare un’idea agli ospiti."
      >
        <div className="max-w-40">
          <TextField
            label="Valore a persona (€)"
            inputMode="decimal"
            placeholder="25"
            required
            value={form.value}
            onChange={update('value')}
          />
        </div>
      </Section>

      <Section
        title="Cosa può portare l’ospite?"
        hint="Portare qualcosa è un gesto di convivialità, non un obbligo. Scegli cosa ti farebbe piacere."
      >
        <ChipSelect
          aria-label="Cosa può portare l’ospite"
          options={BRING_CATEGORIES}
          value={guestCanBring}
          onChange={setGuestCanBring}
        />
        <TextArea
          label="Suggerimenti (facoltativo)"
          placeholder="Es. un rosso leggero si abbina benissimo, il dolce lo preparo io"
          maxLength={500}
          value={form.bring_notes}
          onChange={update('bring_notes')}
        />
      </Section>

      <Section
        title="Allergeni presenti"
        hint="Indica tutti gli allergeni contenuti nei piatti: gli ospiti allergici verranno avvisati."
      >
        <ChipSelect
          aria-label="Allergeni presenti"
          options={ALLERGENS}
          value={allergens}
          onChange={setAllergens}
        />
      </Section>

      <Section title="Adatto a" hint="Seleziona le diete compatibili con tutto il menù.">
        <ChipSelect
          aria-label="Adatto a"
          options={SUITABLE_FOR}
          value={suitableDiets}
          onChange={setSuitableDiets}
        />
      </Section>

      {children?.(Number(form.max_guests) || 1)}
      <FormError error={valueError ?? error} />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvataggio…' : submitLabel}
      </Button>
    </form>
  )
}
