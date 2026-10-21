import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, unwrap } from '../../api/client'
import { useAuth } from '../auth/AuthContext'

const keys = {
  all: ['notifications'] as const,
  list: ['notifications', 'list'] as const,
  unread: ['notifications', 'unread-count'] as const,
}

export function useNotifications() {
  return useQuery({
    queryKey: keys.list,
    queryFn: () => unwrap(api.GET('/notifications', { params: { query: { limit: 50 } } })),
  })
}

/** Polled lightly (paused while the tab is hidden) and only for logged-in users. */
export function useUnreadCount() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: keys.unread,
    queryFn: () => unwrap(api.GET('/notifications/unread-count')),
    enabled: isAuthenticated,
    refetchInterval: 120_000,
  })
}

function useNotificationMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  })
}

export function useMarkRead() {
  return useNotificationMutation((id: string) =>
    unwrap(
      api.POST('/notifications/{notification_id}/read', {
        params: { path: { notification_id: id } },
      }),
    ),
  )
}

export function useMarkAllRead() {
  return useNotificationMutation(() => unwrap(api.POST('/notifications/read-all')))
}
