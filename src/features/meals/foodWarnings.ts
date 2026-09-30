import type { Allergen, Diet, Meal, User } from '../../api/client'

// A meal suitable for the key diet also suits these ones
const IMPLIED_DIETS: Partial<Record<Diet, Diet[]>> = {
  vegan: ['vegetarian', 'pescatarian'],
  vegetarian: ['pescatarian'],
}

export type FoodWarnings = {
  /** Allergens in the meal that the user declared */
  allergens: Allergen[]
  /** The user's diets that the meal isn't declared suitable for */
  unsuitableDiets: Diet[]
}

export function foodWarnings(
  user: Pick<User, 'diets' | 'allergies'> | undefined,
  meal: Pick<Meal, 'allergens' | 'suitable_diets'>,
): FoodWarnings {
  if (!user) return { allergens: [], unsuitableDiets: [] }

  const allergens = meal.allergens.filter((allergen) => user.allergies.includes(allergen))

  const suitable = new Set(meal.suitable_diets.flatMap((d) => [d, ...(IMPLIED_DIETS[d] ?? [])]))
  const unsuitableDiets = user.diets.filter((diet) => diet !== 'omnivore' && !suitable.has(diet))

  return { allergens, unsuitableDiets }
}
