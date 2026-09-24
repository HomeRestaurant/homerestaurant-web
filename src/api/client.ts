import createClient from 'openapi-fetch'
import type { components, paths } from './schema'
import { toApiError } from './errors'
import { tokenStorage } from './token'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// Typed client: paths, params and responses come from the backend OpenAPI (npm run gen:api)
export const api = createClient<paths>({ baseUrl: API_URL })

api.use({
  onRequest({ request }) {
    const token = tokenStorage.get()
    if (token) request.headers.set('Authorization', `Bearer ${token}`)
    return request
  },
})

export type User = components['schemas']['UserRead']
export type UserUpdate = components['schemas']['UserUpdate']
export type Meal = components['schemas']['MealRead']
export type MealType = components['schemas']['MealType']
export type MealCreate = components['schemas']['MealCreate']
export type MealUpdate = components['schemas']['MealUpdate']
export type SlotCreate = components['schemas']['SlotCreate']

/** Resolve an openapi-fetch call to its data, or throw a readable ApiError. */
export async function unwrap<T>(
  call: Promise<{ data?: T; error?: unknown; response: Response }>,
): Promise<T> {
  const { data, error, response } = await call
  if (!response.ok) throw toApiError(response.status, error)
  return data as T
}
export type Diet = components['schemas']['Diet']
export type Allergen = components['schemas']['Allergen']
export type FavoriteFood = components['schemas']['FavoriteFood']
export type BringCategory = components['schemas']['BringCategory']
export type FoodPreferences = components['schemas']['FoodPreferences']
export type HostPreferences = components['schemas']['HostPreferences']
