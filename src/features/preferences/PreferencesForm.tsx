import { useState, type FormEvent, type ReactNode } from 'react'
import type { Allergen, Diet, FavoriteFood, FoodPreferences, User } from '../../api/client'
import { Button } from '../../components/Button'
import { ChipRadio, ChipSelect } from '../../components/ChipSelect'
import { FormError } from '../../components/FormError'
import { TextArea } from '../../components/TextField'
import { ALLERGENS, DIETS, FAVORITE_FOODS } from './options'

type AllergyAnswer = 'none' | 'some'

type Props = {
  user: User
  submitLabel: string
  isPending: boolean
  error: Error | null
  onSubmit: (preferences: FoodPreferences) => void
}

function Question({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="font-semibold">{title}</legend>
      {hint && <p className="-mt-2 text-sm text-muted">{hint}</p>}
      {children}
    </fieldset>
  )
}

/** "Eats everything" contradicts any restriction: picking one side clears the other. */
function exclusiveOmnivore(previous: Diet[], next: Diet[]): Diet[] {
  if (next.includes('omnivore') && !previous.includes('omnivore')) return ['omnivore']
  return next.length > 1 ? next.filter((diet) => diet !== 'omnivore') : next
}

export function PreferencesForm({ user, submitLabel, isPending, error, onSubmit }: Props) {
  const [diets, setDiets] = useState<Diet[]>(user.diets)
  const [allergyAnswer, setAllergyAnswer] = useState<AllergyAnswer | null>(() => {
    if (!user.has_completed_preferences) return null // must be answered explicitly
    return user.allergies.length > 0 || user.allergy_notes ? 'some' : 'none'
  })
  const [allergies, setAllergies] = useState<Allergen[]>(user.allergies)
  const [allergyNotes, setAllergyNotes] = useState(user.allergy_notes ?? '')
  const [favorites, setFavorites] = useState<FavoriteFood[]>(user.favorite_foods)
  const [disliked, setDisliked] = useState(user.disliked_foods ?? '')
  const [validationError, setValidationError] = useState<Error | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const problem =
      diets.length === 0
        ? 'Scegli la tua alimentazione'
        : allergyAnswer === null
          ? 'Dicci se hai allergie o intolleranze'
          : allergyAnswer === 'some' && allergies.length === 0 && !allergyNotes.trim()
            ? 'Seleziona le tue allergie o descrivile nelle note'
            : null
    if (problem) {
      setValidationError(new Error(problem))
      return
    }
    setValidationError(null)
    const hasAllergies = allergyAnswer === 'some'
    onSubmit({
      diets,
      allergies: hasAllergies ? allergies : [],
      allergy_notes: hasAllergies ? allergyNotes : null,
      favorite_foods: favorites,
      disliked_foods: disliked,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Question title="Come mangi?" hint="Puoi sceglierne più di una.">
        <ChipSelect
          options={DIETS}
          value={diets}
          onChange={(next) => setDiets(exclusiveOmnivore(diets, next))}
        />
      </Question>

      <Question title="Hai allergie o intolleranze?">
        <ChipRadio
          options={{ none: 'Nessuna', some: 'Sì' } satisfies Record<AllergyAnswer, string>}
          value={allergyAnswer}
          onChange={setAllergyAnswer}
        />
        {allergyAnswer === 'some' && (
          <div className="space-y-3 rounded-card border border-line p-4">
            <ChipSelect options={ALLERGENS} value={allergies} onChange={setAllergies} />
            <TextArea
              label="Altro o dettagli (es. intolleranza lieve, celiachia)"
              maxLength={500}
              value={allergyNotes}
              onChange={(e) => setAllergyNotes(e.target.value)}
            />
          </div>
        )}
      </Question>

      <Question title="Cosa ti piace?" hint="Facoltativo: aiuta a trovare i pasti giusti per te.">
        <ChipSelect options={FAVORITE_FOODS} value={favorites} onChange={setFavorites} />
      </Question>

      <Question
        title="C'è qualcosa che proprio non mangi?"
        hint="Facoltativo, anche se non è un'allergia."
      >
        <TextArea
          label="Es. coriandolo, funghi, cibi molto piccanti"
          maxLength={500}
          value={disliked}
          onChange={(e) => setDisliked(e.target.value)}
        />
      </Question>

      <p className="rounded-card bg-gray-50 p-4 text-sm text-muted">
        Alimentazione, allergie e cibi che non mangi saranno visibili agli utenti registrati sulle
        pagine dei pasti che offri, così gli ospiti sanno cosa portare. Puoi modificarli quando vuoi
        dal tuo profilo.
      </p>

      <FormError error={validationError ?? error} />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvataggio…' : submitLabel}
      </Button>
    </form>
  )
}
