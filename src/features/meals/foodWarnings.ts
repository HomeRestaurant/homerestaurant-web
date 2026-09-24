import type { Allergen, Diet, Meal, User } from '../../api/client'

// A meal suitable for the key diet also suits these ones
const IMPLIED_DIETS: Partial<Record<Diet, Diet[]>> = {
  vegan: ['vegetarian', 'pescatarian'],
  vegetarian: ['pescatarian'],
}

export type FoodWarnings = {
  /** Allergens in the meal that the user declared */
  allergens: Allergen[]
  /** The user's diet, when the meal isn't declared suitable for it */
  unsuitableDiet: Diet | null
}

export function foodWarnings(
  user: Pick<User, 'diet' | 'allergies'> | undefined,
  meal: Pick<Meal, 'allergens' | 'suitable_diets'>,
): FoodWarnings {
  if (!user) return { allergens: [], unsuitableDiet: null }

  const allergens = meal.allergens.filter((allergen) => user.allergies.includes(allergen))

  const suitable = new Set(meal.suitable_diets.flatMap((d) => [d, ...(IMPLIED_DIETS[d] ?? [])]))
  const unsuitableDiet =
    user.diet && user.diet !== 'omnivore' && !suitable.has(user.diet) ? user.diet : null

  return { allergens, unsuitableDiet }
}
