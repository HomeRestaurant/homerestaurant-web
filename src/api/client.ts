import createClient from 'openapi-fetch'
import type { components, paths } from './schema'
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
