import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { api } from '../../api/client'
import { ApiError, toApiError } from '../../api/errors'
import { tokenStorage } from '../../api/token'
import { AuthContext, ME_QUERY_KEY, type AuthContextValue } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [token, setToken] = useState(() => tokenStorage.get())

  const me = useQuery({
    queryKey: [...ME_QUERY_KEY, token],
    queryFn: async () => {
      const { data, error, response } = await api.GET('/users/me')
      if (error) {
        if (response.status === 401) tokenStorage.clear()
        throw toApiError(response.status, error)
      }
      return data
    },
    enabled: token !== null,
    retry: false,
  })

  // Expired or invalid token: treat the user as logged out
  const tokenRejected = me.error instanceof ApiError && me.error.status === 401
  const isAuthenticated = token !== null && !tokenRejected

  const logout = useCallback(() => {
    tokenStorage.clear()
    setToken(null)
    queryClient.removeQueries({ queryKey: ME_QUERY_KEY })
  }, [queryClient])

  const login = useCallback(async (email: string, password: string) => {
    const { data, error, response } = await api.POST('/auth/login', {
      body: { username: email, password, scope: '' },
      bodySerializer: (body) => new URLSearchParams(body as Record<string, string>),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    if (error) throw toApiError(response.status, error)
    tokenStorage.set(data.access_token)
    setToken(data.access_token)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      user: isAuthenticated ? me.data : undefined,
      isLoadingUser: isAuthenticated && me.isPending,
      login,
      logout,
    }),
    [isAuthenticated, me.data, me.isPending, login, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
