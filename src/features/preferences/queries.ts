import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, unwrap, type FoodPreferences } from '../../api/client'
import { ME_QUERY_KEY } from '../auth/AuthContext'

export function useSavePreferences() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: FoodPreferences) => unwrap(api.PUT('/users/me/preferences', { body })),
    onSuccess: (user) => {
      queryClient.setQueriesData({ queryKey: ME_QUERY_KEY }, user)
      // Meal pages embed the host's preferences
      return queryClient.invalidateQueries({ queryKey: ['meals'] })
    },
  })
}
