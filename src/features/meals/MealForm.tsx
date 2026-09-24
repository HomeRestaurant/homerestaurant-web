import { useState, type FormEvent, type ReactNode } from 'react'
import type { Meal, MealType } from '../../api/client'
import { Button } from '../../components/Button'
import { FormError } from '../../components/FormError'
import { TextArea, TextField } from '../../components/TextField'
import { parseEuroToCents } from '../../lib/format'
import { MEAL_TYPE_OPTIONS } from './mealTypes'

export type MealFields = {
  title: string
  description: string
  meal_type: MealType
  price_cents: number
  max_guests: number
  city: string
  neighborhood: string | null
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

export function MealForm({ meal, submitLabel, isPending, error, onSubmit, children }: Props) {
  const [form, setForm] = useState({
    title: meal?.title ?? '',
    description: meal?.description ?? '',
    meal_type: meal?.meal_type ?? ('dinner' as MealType),
    price: meal ? String(meal.price_cents / 100).replace('.', ',') : '',
    max_guests: meal ? String(meal.max_guests) : '4',
    city: meal?.city ?? '',
    neighborhood: meal?.neighborhood ?? '',
  })
  const [priceError, setPriceError] = useState<Error | null>(null)

  const update = (field: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const priceCents = parseEuroToCents(form.price)
    if (priceCents === null) {
      setPriceError(new Error('Inserisci un prezzo valido, ad esempio 25 o 12,50'))
      return
    }
    setPriceError(null)
    onSubmit({
      title: form.title,
      description: form.description,
      meal_type: form.meal_type,
      price_cents: priceCents,
      max_guests: Number(form.max_guests),
      city: form.city,
      neighborhood: form.neighborhood.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <TextField
        label="Titolo"
        placeholder="Es. Cena romagnola con tagliatelle fatte a mano"
        required
        minLength={3}
        maxLength={100}
        value={form.title}
        onChange={update('title')}
      />
      <div>
        <span className="text-sm font-medium">Tipo di pasto</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {MEAL_TYPE_OPTIONS.map(([value, { label }]) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, meal_type: value }))}
              aria-pressed={form.meal_type === value}
              className={`rounded-full border px-4 py-2 text-sm ${
                form.meal_type === value
                  ? 'border-ink bg-ink text-white'
                  : 'border-gray-300 hover:border-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <TextArea
        label="Descrizione: cosa cucini, l'atmosfera, allergeni"
        required
        minLength={10}
        maxLength={5000}
        value={form.description}
        onChange={update('description')}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Prezzo a persona (€)"
          inputMode="decimal"
          placeholder="25"
          required
          value={form.price}
          onChange={update('price')}
        />
        <TextField
          label="Ospiti massimi"
          type="number"
          min={1}
          max={50}
          required
          value={form.max_guests}
          onChange={update('max_guests')}
        />
        <TextField label="Città" required value={form.city} onChange={update('city')} />
        <TextField
          label="Quartiere (facoltativo)"
          value={form.neighborhood}
          onChange={update('neighborhood')}
        />
      </div>
      <p className="text-sm text-muted">
        L'indirizzo esatto non viene pubblicato: lo condividerai solo con chi prenota.
      </p>
      {children?.(Number(form.max_guests) || 1)}
      <FormError error={priceError ?? error} />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvataggio…' : submitLabel}
      </Button>
    </form>
  )
}
