import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import {
  api,
  unwrap,
  type BookingAction,
  type BookingScope,
  type BookingStatus,
} from '../../api/client'

export type MealBookingsFilters = { scope: BookingScope; slotId?: string; status?: BookingStatus }

const keys = {
  all: ['bookings'] as const,
  mine: (scope: BookingScope) => ['bookings', 'mine', scope] as const,
  forMeal: (mealId: string, filters: MealBookingsFilters) =>
    ['bookings', 'meal', mealId, filters] as const,
}

/** Booking requests received by the host of a meal. */
export function useMealBookings(mealId: string, filters: MealBookingsFilters) {
  return useQuery({
    queryKey: keys.forMeal(mealId, filters),
    queryFn: () =>
      unwrap(
        api.GET('/meals/{meal_id}/bookings', {
          params: {
            path: { meal_id: mealId },
            query: {
              scope: filters.scope,
              slot_id: filters.slotId,
              status: filters.status,
              limit: 100,
            },
          },
        }),
      ),
  })
}

export type BookingActionVariables = { bookingId: string; reason?: string }

function invalidateBookingData(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: keys.all }),
    queryClient.invalidateQueries({ queryKey: ['meals'] }),
    queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  ])
}

/** A transition changes bookings, free seats on the meal and the notifications of both sides. */
function useBookingMutation(mutationFn: (variables: BookingActionVariables) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    // onSettled: after a 409 the lists are stale too (the guest may have just cancelled)
    onSettled: () => invalidateBookingData(queryClient),
  })
}

/** Optional reason: blank becomes an empty body, which the backend accepts. */
function actionBody({ reason }: BookingActionVariables): BookingAction {
  const trimmed = reason?.trim()
  return trimmed ? { reason: trimmed } : {}
}

export function useConfirmBooking(mealId: string) {
  return useBookingMutation(({ bookingId }) =>
    unwrap(
      api.POST('/meals/{meal_id}/bookings/{booking_id}/confirm', {
        params: { path: { meal_id: mealId, booking_id: bookingId } },
      }),
    ),
  )
}

export function useDeclineBooking(mealId: string) {
  return useBookingMutation((variables) =>
    unwrap(
      api.POST('/meals/{meal_id}/bookings/{booking_id}/decline', {
        params: { path: { meal_id: mealId, booking_id: variables.bookingId } },
        body: actionBody(variables),
      }),
    ),
  )
}

/** Host cancelling an already confirmed booking. */
export function useHostCancelBooking(mealId: string) {
  return useBookingMutation((variables) =>
    unwrap(
      api.POST('/meals/{meal_id}/bookings/{booking_id}/cancel', {
        params: { path: { meal_id: mealId, booking_id: variables.bookingId } },
        body: actionBody(variables),
      }),
    ),
  )
}

export type MyBookingsOptions = { scope: BookingScope }

/** Bookings the logged-in user made as a guest. */
export function useMyBookings({ scope }: MyBookingsOptions) {
  return useQuery({
    queryKey: keys.mine(scope),
    queryFn: () => unwrap(api.GET('/bookings/mine', { params: { query: { scope, limit: 100 } } })),
  })
}

export type CreateBookingVariables = { slotId: string; seats: number; message: string }

/** A new request touches the guest's list, the free seats of the meal and the host's notifications. */
export function useCreateBooking(mealId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ slotId, seats, message }: CreateBookingVariables) =>
      unwrap(
        api.POST('/meals/{meal_id}/slots/{slot_id}/bookings', {
          params: { path: { meal_id: mealId, slot_id: slotId } },
          body: { seats, message: message.trim() || null },
        }),
      ),
    // onSettled: after a 409 the free seats shown are stale
    onSettled: () => invalidateBookingData(queryClient),
  })
}

/** The guest withdrawing a pending request or cancelling a confirmed booking. */
export function useCancelMyBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookingId: string) =>
      unwrap(
        api.POST('/bookings/{booking_id}/cancel', {
          params: { path: { booking_id: bookingId } },
        }),
      ),
    onSettled: () => invalidateBookingData(queryClient),
  })
}
