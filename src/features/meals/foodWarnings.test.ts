import { describe, expect, it } from 'vitest'
import type { Meal, User } from '../../api/client'
import { foodWarnings } from './foodWarnings'

type MealFood = Pick<Meal, 'allergens' | 'suitable_diets'>
type UserFood = Pick<User, 'diet' | 'allergies'>

const meal = (food: Partial<MealFood>): MealFood => ({ allergens: [], suitable_diets: [], ...food })
const user = (food: Partial<UserFood>): UserFood => ({ diet: 'omnivore', allergies: [], ...food })

describe('foodWarnings', () => {
  it('returns nothing for anonymous users', () => {
    const result = foodWarnings(undefined, meal({ allergens: ['gluten'] }))
    expect(result).toEqual({ allergens: [], unsuitableDiet: null })
  })

  it('finds allergens the user declared', () => {
    const result = foodWarnings(
      user({ allergies: ['tree_nuts', 'milk'] }),
      meal({ allergens: ['gluten', 'tree_nuts'] }),
    )
    expect(result.allergens).toEqual(['tree_nuts'])
  })

  it('accepts diets implied by a stricter one', () => {
    const result = foodWarnings(user({ diet: 'vegetarian' }), meal({ suitable_diets: ['vegan'] }))
    expect(result.unsuitableDiet).toBeNull()
  })

  it('flags a diet the meal is not declared suitable for', () => {
    const result = foodWarnings(user({ diet: 'vegan' }), meal({ suitable_diets: ['vegetarian'] }))
    expect(result.unsuitableDiet).toBe('vegan')
  })

  it('never flags omnivores', () => {
    expect(foodWarnings(user({}), meal({})).unsuitableDiet).toBeNull()
  })
})
