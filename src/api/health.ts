import { useQuery } from '@tanstack/react-query'
import { api } from './client'

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data, error } = await api.GET('/health')
      if (error) throw new Error('API non raggiungibile')
      return data
    },
    retry: 1,
  })
}
