import { createContext, useContext } from 'react'
import type { User } from '../../api/client'

export type AuthContextValue = {
  /** True when a token is stored; the user profile may still be loading. */
  isAuthenticated: boolean
  user: User | undefined
  isLoadingUser: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

/** Prefix of the current-user query; the full key also contains the token. */
export const ME_QUERY_KEY = ['me']

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
