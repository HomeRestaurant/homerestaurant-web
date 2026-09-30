import { describe, expect, it } from 'vitest'
import type { Meal, User } from '../../api/client'
import { foodWarnings } from './foodWarnings'

type MealFood = Pick<Meal, 'allergens' | 'suitable_diets'>
type UserFood = Pick<User, 'diets' | 'allergies'>

const meal = (food: Partial<MealFood>): MealFood => ({ allergens: [], suitable_diets: [], ...food })
const user = (food: Partial<UserFood>): UserFood => ({
  diets: ['omnivore'],
  allergies: [],
  ...food,
})

describe('foodWarnings', () => {
  it('returns nothing for anonymous users', () => {
    const result = foodWarnings(undefined, meal({ allergens: ['gluten'] }))
    expect(result).toEqual({ allergens: [], unsuitableDiets: [] })
  })

  it('finds allergens the user declared', () => {
    const result = foodWarnings(
      user({ allergies: ['tree_nuts', 'milk'] }),
      meal({ allergens: ['gluten', 'tree_nuts'] }),
    )
    expect(result.allergens).toEqual(['tree_nuts'])
  })

  it('accepts diets implied by a stricter one', () => {
    const result = foodWarnings(
      user({ diets: ['vegetarian'] }),
      meal({ suitable_diets: ['vegan'] }),
    )
    expect(result.unsuitableDiets).toEqual([])
  })

  it('flags a diet the meal is not declared suitable for', () => {
    const result = foodWarnings(
      user({ diets: ['vegan'] }),
      meal({ suitable_diets: ['vegetarian'] }),
    )
    expect(result.unsuitableDiets).toEqual(['vegan'])
  })

  it('checks every diet the user follows', () => {
    const result = foodWarnings(
      user({ diets: ['vegetarian', 'halal'] }),
      meal({ suitable_diets: ['vegetarian'] }),
    )
    expect(result.unsuitableDiets).toEqual(['halal'])
  })

  it('never flags omnivores', () => {
    expect(foodWarnings(user({}), meal({})).unsuitableDiets).toEqual([])
  })
})
